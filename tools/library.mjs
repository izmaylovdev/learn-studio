// Parses library/ into an in-memory graph. Single source of truth for the
// content model — the API server and the CLI indexer both go through here.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { load as loadYaml } from 'js-yaml';

export const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
export const CONCEPTS_DIR = join(ROOT, 'library', 'concepts');
export const TRACKS_DIR = join(ROOT, 'library', 'tracks');
export const SYMBOLS_FILE = join(ROOT, 'library', 'symbols.yml');

const WIKILINK = /\[\[([a-z0-9][a-z0-9-]*)(?:\|([^\]]+))?\]\]/g;
const CHECK_BLOCK = /^:::check\s*$/gm;
const FORMULA_BLOCK = /^```formula[ \t]*\n([\s\S]*?)\n```[ \t]*$/gm;

/** The shared symbol lexicon. Formula blocks reference these ids. */
export function loadSymbols(issues = []) {
  if (!existsSync(SYMBOLS_FILE)) return {};
  let raw;
  try {
    raw = loadYaml(readFileSync(SYMBOLS_FILE, 'utf8')) ?? {};
  } catch (err) {
    issues.push({ level: 'error', where: 'library/symbols.yml', message: `not valid YAML: ${err.message.split('\n')[0]}` });
    return {};
  }
  const out = {};
  for (const [id, v] of Object.entries(raw)) {
    if (!v || typeof v !== 'object') continue;
    for (const req of ['glyph', 'kind', 'name', 'def']) {
      if (!v[req]) issues.push({ level: 'warn', where: 'library/symbols.yml', message: `symbol \`${id}\` is missing \`${req}\`` });
    }
    out[id] = {
      id,
      glyph: String(v.glyph ?? id),
      tex: v.tex ? String(v.tex) : String(v.glyph ?? id),
      match: asArray(v.match ?? v.glyph ?? id),
      sel: v.sel ? String(v.sel) : '',
      kind: String(v.kind ?? 'operator'),
      name: String(v.name ?? id),
      say: String(v.say ?? ''),
      def: String(v.def ?? ''),
      eg: String(v.eg ?? ''),
    };
  }
  return out;
}

/**
 * Extract ```formula blocks in document order. A block that fails to parse still
 * occupies its slot as null — the reader pairs blocks to specs positionally.
 */
function parseFormulas(content, file, symbols, issues) {
  const out = [];
  for (const m of content.matchAll(FORMULA_BLOCK)) {
    let spec;
    try {
      spec = loadYaml(m[1]) ?? {};
    } catch (err) {
      issues.push({ level: 'error', where: file, message: `formula block: ${err.message.split('\n')[0]}` });
      out.push(null);
      continue;
    }
    const tex = String(spec.tex ?? '').trim();
    if (!tex) {
      issues.push({ level: 'error', where: file, message: 'formula block has no `tex:`' });
      out.push(null);
      continue;
    }
    const ids = asArray(spec.symbols);
    const notes = spec.notes && typeof spec.notes === 'object' ? spec.notes : {};

    for (const id of ids) {
      if (!symbols[id]) {
        issues.push({ level: 'error', where: file, message: `formula lists unknown symbol \`${id}\` — add it to library/symbols.yml` });
      } else if (!tex.includes(symbols[id].tex)) {
        // Catches a symbol listed for the wrong formula, which would otherwise
        // just fail to highlight and look like a rendering bug.
        issues.push({ level: 'warn', where: file, message: `formula lists \`${id}\` but its LaTeX \`${symbols[id].tex}\` does not occur in the \`tex:\`` });
      }
    }
    for (const id of Object.keys(notes)) {
      if (!ids.includes(id)) issues.push({ level: 'warn', where: file, message: `formula note for \`${id}\`, which is not in its \`symbols:\` list` });
    }
    // These three are the whole "How to read it" pane. It is collapsed by
    // default in the reader, so a formula missing them looks fine on the page —
    // the toggle just opens onto nothing. Only the indexer will catch it.
    const name = spec.title ?? tex.slice(0, 24);
    for (const [field, value] of [['reading', spec.reading], ['steps', asArray(spec.steps).length], ['why', spec.why]]) {
      if (!value) issues.push({ level: 'warn', where: file, message: `formula \`${name}\` has no \`${field}:\` — its "How to read it" pane will be incomplete` });
    }

    out.push({
      title: String(spec.title ?? ''),
      tex,
      reading: String(spec.reading ?? ''),
      why: String(spec.why ?? ''),
      steps: asArray(spec.steps),
      symbols: ids
        .filter((id) => symbols[id])
        .map((id) => ({ ...symbols[id], note: String(notes[id] ?? '') })),
    });
  }
  return out;
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return extname(p) === '.md' ? [p] : [];
  });
}

function asArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v.filter((x) => x != null).map(String) : [String(v)];
}

/** Concept ids referenced by [[wikilinks]] in the body. */
export function wikilinksIn(body) {
  const out = new Set();
  for (const m of body.matchAll(WIKILINK)) out.add(m[1]);
  return [...out];
}

function parseConcept(file, symbols = {}, sharedIssues = []) {
  const raw = readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const id = String(data.id ?? basename(file, '.md'));
  const problems = [];
  if (!data.id) problems.push('missing `id` in frontmatter (fell back to filename)');
  if (!data.title) problems.push('missing `title`');
  if (!data.summary) problems.push('missing `summary`');
  if (!data.field) problems.push('missing `field` — it will be filed under Unfiled in the sidebar');

  const checks = asArray(data.checks).length && typeof data.checks?.[0] === 'string'
    ? data.checks.map((q) => ({ q: String(q), a: '' }))
    : (Array.isArray(data.checks) ? data.checks : []).map((c) => ({
        q: String(c?.q ?? ''),
        a: String(c?.a ?? ''),
      })).filter((c) => c.q);

  // The reader pairs answers to prompts positionally, so a count mismatch
  // silently shows the wrong answer under a question.
  const blockCount = (content.match(CHECK_BLOCK) ?? []).length;
  if (blockCount !== checks.length) {
    problems.push(`${blockCount} \`:::check\` block(s) but ${checks.length} answer(s) in frontmatter — answers will pair with the wrong prompts`);
  }

  const relFile = file.slice(ROOT.length + 1);
  const formulas = parseFormulas(content, relFile, symbols, sharedIssues);

  return {
    id,
    file: relFile,
    formulas,
    title: String(data.title ?? id),
    field: String(data.field ?? 'Unfiled').trim() || 'Unfiled',
    summary: String(data.summary ?? ''),
    tags: asArray(data.tags),
    difficulty: Number(data.difficulty ?? 3),
    estMinutes: Number(data.est_minutes ?? data.estMinutes ?? 30),
    prereqs: asArray(data.prereqs),
    related: asArray(data.related),
    sources: (Array.isArray(data.sources) ? data.sources : []).map((s) =>
      typeof s === 'string' ? { title: s, url: '' } : { title: String(s?.title ?? s?.url ?? ''), url: String(s?.url ?? '') }
    ),
    checks,
    mentions: wikilinksIn(content),
    body: content,
    problems,
  };
}

function parseTrack(file) {
  const raw = readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const id = String(data.id ?? basename(file, '.md'));
  const stages = (Array.isArray(data.stages) ? data.stages : []).map((s, i) => ({
    title: String(s?.title ?? `Stage ${i + 1}`),
    goal: String(s?.goal ?? ''),
    concepts: asArray(s?.concepts),
  }));
  return {
    id,
    file: file.slice(ROOT.length + 1),
    title: String(data.title ?? id),
    goal: String(data.goal ?? ''),
    tags: asArray(data.tags),
    stages,
    body: content,
    conceptIds: stages.flatMap((s) => s.concepts),
  };
}

/**
 * Builds the full library graph.
 * Edge kinds: 'prereq' (a must come before b), 'related', 'mention' (from [[links]]).
 */
export function loadLibrary() {
  const broken = [];
  const symbols = loadSymbols(broken);
  // One unparseable file must not take down the whole library — report it and
  // carry on, so `npm run check` can point at the offending path.
  const safe = (fn) => (file) => {
    try {
      return fn(file);
    } catch (err) {
      broken.push({ level: 'error', where: file.slice(ROOT.length + 1), message: `could not parse: ${err.message.split('\n')[0]}` });
      return null;
    }
  };
  const drop = (x) => x !== null;

  const concepts = walk(CONCEPTS_DIR)
    .map(safe((f) => parseConcept(f, symbols, broken)))
    .filter(drop)
    .sort((a, b) => a.title.localeCompare(b.title));
  const tracks = walk(TRACKS_DIR).map(safe(parseTrack)).filter(drop).sort((a, b) => a.title.localeCompare(b.title));
  const byId = new Map(concepts.map((c) => [c.id, c]));

  const edges = [];
  const seen = new Set();
  const addEdge = (from, to, kind) => {
    const key = `${from}>${to}:${kind}`;
    if (from === to || seen.has(key)) return;
    seen.add(key);
    edges.push({ from, to, kind });
  };

  const issues = [...broken];
  for (const c of concepts) {
    for (const p of c.problems) issues.push({ level: 'warn', where: c.file, message: p });
    for (const p of c.prereqs) {
      if (!byId.has(p)) issues.push({ level: 'error', where: c.file, message: `prereq \`${p}\` does not exist` });
      else addEdge(p, c.id, 'prereq');
    }
    for (const r of c.related) {
      if (!byId.has(r)) issues.push({ level: 'error', where: c.file, message: `related \`${r}\` does not exist` });
      else addEdge(c.id, r, 'related');
    }
    for (const m of c.mentions) {
      if (!byId.has(m)) issues.push({ level: 'warn', where: c.file, message: `[[${m}]] has no concept file yet` });
      else if (!c.prereqs.includes(m) && !c.related.includes(m)) addEdge(c.id, m, 'mention');
    }
  }
  for (const t of tracks) {
    for (const id of t.conceptIds) {
      if (!byId.has(id)) issues.push({ level: 'error', where: t.file, message: `stage concept \`${id}\` does not exist` });
    }
    if (!t.stages.length) issues.push({ level: 'warn', where: t.file, message: 'track has no stages' });
  }

  // Backlinks: who points at me, and how.
  const backlinks = new Map(concepts.map((c) => [c.id, []]));
  for (const e of edges) backlinks.get(e.to)?.push({ from: e.from, kind: e.kind });

  for (const cycle of findCycles(concepts, byId)) {
    issues.push({ level: 'error', where: 'library/concepts', message: `prerequisite cycle: ${cycle.join(' → ')}` });
  }

  // Which concepts use each symbol — powers the lexicon's "appears in" list.
  const usage = {};
  for (const c of concepts) {
    for (const f of c.formulas ?? []) {
      if (!f) continue;
      for (const sym of f.symbols) {
        (usage[sym.id] ??= []).push({ concept: c.id, title: c.title, formula: f.title });
      }
    }
  }

  return { concepts, tracks, edges, byId, backlinks, issues, symbols, usage };
}

/** Prereq edges must form a DAG or "what do I learn next" is meaningless. */
function findCycles(concepts, byId) {
  const state = new Map();
  const cycles = [];
  const stack = [];
  const visit = (id) => {
    if (state.get(id) === 'done') return;
    if (state.get(id) === 'open') {
      cycles.push([...stack.slice(stack.indexOf(id)), id]);
      return;
    }
    state.set(id, 'open');
    stack.push(id);
    for (const p of byId.get(id)?.prereqs ?? []) if (byId.has(p)) visit(p);
    stack.pop();
    state.set(id, 'done');
  };
  for (const c of concepts) visit(c.id);
  return cycles;
}

/** Topological depth of each concept in the prereq DAG (0 = no prereqs). */
export function conceptDepths(lib) {
  const depth = new Map();
  const compute = (id, guard = new Set()) => {
    if (depth.has(id)) return depth.get(id);
    if (guard.has(id)) return 0;
    guard.add(id);
    const prereqs = (lib.byId.get(id)?.prereqs ?? []).filter((p) => lib.byId.has(p));
    const d = prereqs.length ? Math.max(...prereqs.map((p) => compute(p, guard))) + 1 : 0;
    depth.set(id, d);
    return d;
  };
  for (const c of lib.concepts) compute(c.id);
  return depth;
}

/** Strip bodies — the graph payload the UI gets on load. */
/**
 * Reading order. Tracks already encode the order a reader should meet things
 * in, so that is the source of truth; anything no track mentions sorts last.
 * Both the concept list and the field list use it, which is why the sidebar
 * shows u-Substitution before Partial Fractions rather than after.
 */
function readingOrder(lib) {
  const at = new Map();
  let i = 0;
  for (const t of lib.tracks) for (const s of t.stages) for (const id of s.concepts) {
    if (!at.has(id)) at.set(id, i++);
  }
  return (id) => (at.has(id) ? at.get(id) : Number.MAX_SAFE_INTEGER);
}

export function summarize(lib, progress) {
  const depths = conceptDepths(lib);
  const order = readingOrder(lib);

  const firstOfField = new Map();
  for (const c of lib.concepts) {
    if (order(c.id) < (firstOfField.get(c.field) ?? Infinity)) firstOfField.set(c.field, order(c.id));
  }

  return {
    fields: [...firstOfField.keys()].sort(
      (a, b) => (firstOfField.get(a) - firstOfField.get(b)) || a.localeCompare(b)
    ),
    concepts: lib.concepts.map(({ body, problems, formulas, ...meta }) => ({
      ...meta,
      order: order(meta.id),
      formulaCount: (formulas ?? []).filter(Boolean).length,
      depth: depths.get(meta.id) ?? 0,
      backlinks: lib.backlinks.get(meta.id) ?? [],
    })),
    tracks: lib.tracks.map(({ body, ...t }) => t),
    edges: lib.edges,
    issues: lib.issues,
    symbols: lib.symbols,
    symbolUsage: lib.usage,
    progress,
  };
}
