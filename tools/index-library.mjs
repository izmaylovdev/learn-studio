#!/usr/bin/env node
// Validates the library and writes .cache/graph.json. `--strict` exits 1 on errors.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, loadLibrary, summarize, conceptDepths } from './library.mjs';
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

const errors = lib.issues.filter((i) => i.level === 'error');
const warns = lib.issues.filter((i) => i.level === 'warn');

console.log(`concepts ${lib.concepts.length}  tracks ${lib.tracks.length}  edges ${lib.edges.length}`);
const roots = lib.concepts.filter((c) => depths.get(c.id) === 0).length;
console.log(`entry points (no prereqs): ${roots}   deepest chain: ${Math.max(0, ...depths.values()) + 1}`);
const mastered = lib.concepts.filter((c) => conceptState(p, c.id).status === 'mastered').length;
console.log(`mastered ${mastered}/${lib.concepts.length}`);

const up = nextUp(lib, p);
if (up.due.length) console.log(`\ndue for review (${up.due.length}): ${up.due.map((d) => d.id).join(', ')}`);
if (up.unlocked.length) console.log(`next unlocked: ${up.unlocked.slice(0, 5).map((d) => d.id).join(', ')}`);

for (const i of warns) console.warn(`  warn  ${i.where}: ${i.message}`);
for (const i of errors) console.error(`  ERROR ${i.where}: ${i.message}`);

if (!lib.issues.length) console.log('\nno issues.');
if (strict && errors.length) {
  console.error(`\n${errors.length} error(s) — dangling references or a prereq cycle.`);
  process.exit(1);
}
