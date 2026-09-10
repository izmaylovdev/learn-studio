// Parses library/ into an in-memory graph. Single source of truth for the
// content model — the API server and the CLI indexer both go through here.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

export const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
export const CONCEPTS_DIR = join(ROOT, 'library', 'concepts');
export const TRACKS_DIR = join(ROOT, 'library', 'tracks');

const WIKILINK = /\[\[([a-z0-9][a-z0-9-]*)(?:\|([^\]]+))?\]\]/g;

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

function parseConcept(file) {
  const raw = readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const id = String(data.id ?? basename(file, '.md'));
  const problems = [];
  if (!data.id) problems.push('missing `id` in frontmatter (fell back to filename)');
  if (!data.title) problems.push('missing `title`');
  if (!data.summary) problems.push('missing `summary`');

  const checks = asArray(data.checks).length && typeof data.checks?.[0] === 'string'
    ? data.checks.map((q) => ({ q: String(q), a: '' }))
    : (Array.isArray(data.checks) ? data.checks : []).map((c) => ({
        q: String(c?.q ?? ''),
        a: String(c?.a ?? ''),
      })).filter((c) => c.q);

  return {
    id,
    file: file.slice(ROOT.length + 1),
    title: String(data.title ?? id),
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
  const concepts = walk(CONCEPTS_DIR).map(parseConcept).sort((a, b) => a.title.localeCompare(b.title));
  const tracks = walk(TRACKS_DIR).map(parseTrack).sort((a, b) => a.title.localeCompare(b.title));
  const byId = new Map(concepts.map((c) => [c.id, c]));

  const edges = [];
  const seen = new Set();
  const addEdge = (from, to, kind) => {
    const key = `${from}>${to}:${kind}`;
    if (from === to || seen.has(key)) return;
    seen.add(key);
    edges.push({ from, to, kind });
  };

  const issues = [];
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

  return { concepts, tracks, edges, byId, backlinks, issues };
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
export function summarize(lib, progress) {
  const depths = conceptDepths(lib);
  return {
    concepts: lib.concepts.map(({ body, problems, ...meta }) => ({
      ...meta,
      depth: depths.get(meta.id) ?? 0,
      backlinks: lib.backlinks.get(meta.id) ?? [],
    })),
    tracks: lib.tracks.map(({ body, ...t }) => t),
    edges: lib.edges,
    issues: lib.issues,
    progress,
  };
}
