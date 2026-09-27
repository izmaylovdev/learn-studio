#!/usr/bin/env node
// Validates the library and writes .cache/graph.json. `--strict` exits 1 on errors.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, loadLibrary, summarize, conceptDepths, mathCoverage, languages, checkTranslations } from './library.mjs';
import { loadProgress, trackProgress, nextUp, conceptState } from './progress.mjs';

const strict = process.argv.includes('--strict');
const lib = loadLibrary();
const p = loadProgress();
const depths = conceptDepths(lib);

mkdirSync(join(ROOT, '.cache'), { recursive: true });
writeFileSync(
  join(ROOT, '.cache', 'graph.json'),
  `${JSON.stringify({ ...summarize(lib, p.concepts), trackProgress: trackProgress(lib, p) }, null, 2)}\n`
);

// Translations are checked against the source they were made from. Missing
// ones are not issues — the reader falls back to the source for them — so they
// only show in the coverage line.
const translation = languages().slice(1).map((lang) => ({ lang, ...checkTranslations(lang) }));
const issues = [...lib.issues, ...translation.flatMap((t) => t.issues)];
const errors = issues.filter((i) => i.level === 'error');
const warns = issues.filter((i) => i.level === 'warn');

console.log(`concepts ${lib.concepts.length}  tracks ${lib.tracks.length}  edges ${lib.edges.length}`);
const roots = lib.concepts.filter((c) => depths.get(c.id) === 0).length;
console.log(`entry points (no prereqs): ${roots}   deepest chain: ${Math.max(0, ...depths.values()) + 1}`);
const mastered = lib.concepts.filter((c) => conceptState(p, c.id).status === 'mastered').length;
console.log(`mastered ${mastered}/${lib.concepts.length}`);

// Every formula on a page is annotated against the lexicon, so a mark with no
// entry there is a symbol the reader cannot click on. Report the gaps.
const math = mathCoverage(lib);
console.log(`math ${math.spans} formulas (${math.display} display, ${math.inline} inline) across ${Object.keys(lib.symbols).length} lexicon symbols`);
if (math.unknown.length) {
  const top = math.unknown.slice(0, 12).map((u) => `${u.mark}×${u.count}`).join('  ');
  console.log(`  ${math.unknown.length} mark(s) with no lexicon entry: ${top}${math.unknown.length > 12 ? ' …' : ''}`);
  console.log(`  first seen in: ${math.unknown[0].where.slice(0, 3).join(', ')}`);
}
for (const d of math.dark.slice(0, 8)) {
  console.warn(`  warn  ${d.file}: nothing in $${d.tex}$ can be explained — no symbol in it has a lexicon entry`);
}
if (math.dark.length > 8) console.warn(`  warn  …and ${math.dark.length - 8} more formula(s) with no explainable symbol`);

for (const { lang, coverage: c } of translation) {
  const part = (k) => `${c[k]}/${c.total[k]} ${k}`;
  console.log(`i18n ${lang}: ${['concepts', 'tracks', 'symbols', 'fields'].map(part).join('  ')}`);
  if (c.missing.length) {
    console.log(`  untranslated (${c.missing.length}): ${c.missing.slice(0, 8).join(', ')}${c.missing.length > 8 ? ' …' : ''}`);
  }
}

const up = nextUp(lib, p);
if (up.due.length) console.log(`\ndue for review (${up.due.length}): ${up.due.map((d) => d.id).join(', ')}`);
if (up.unlocked.length) console.log(`next unlocked: ${up.unlocked.slice(0, 5).map((d) => d.id).join(', ')}`);

for (const i of warns) console.warn(`  warn  ${i.where}: ${i.message}`);
for (const i of errors) console.error(`  ERROR ${i.where}: ${i.message}`);

if (!issues.length) console.log('\nno issues.');
if (strict && errors.length) {
  console.error(`\n${errors.length} error(s) — dangling references, a prereq cycle, or a translation out of step with its source.`);
  process.exit(1);
}
