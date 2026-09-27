#!/usr/bin/env node
// Translation bookkeeping. `stamp` records which version of the source a
// translation was made from, so `npm run check` can say when it goes stale.
//
//   npm run i18n -- stamp uk u-substitution calculus-2   stamp named concepts/tracks
//   npm run i18n -- stamp uk --all                       stamp every existing translation
//
// Stamp only after actually bringing a translation up to date: the stamp is a
// claim that it matches the source, and stamping blindly hides real drift.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, loadLibrary, sourceHash, translationOf } from './library.mjs';

const [cmd, lang, ...ids] = process.argv.slice(2);
if (cmd !== 'stamp' || !lang) {
  console.error('usage: npm run i18n -- stamp <lang> (<id>… | --all)');
  process.exit(1);
}

const lib = loadLibrary();
const sources = [
  ...lib.concepts.map((c) => ({ id: c.id, kind: 'concepts', file: c.file })),
  ...lib.tracks.map((t) => ({ id: t.id, kind: 'tracks', file: t.file })),
];
const wanted = ids.includes('--all') ? sources : sources.filter((s) => ids.includes(s.id));
for (const id of ids) {
  if (id !== '--all' && !sources.some((s) => s.id === id)) console.warn(`  no concept or track \`${id}\``);
}

let n = 0;
for (const s of wanted) {
  const target = translationOf(lang, s.kind, s.id);
  if (!existsSync(target)) continue;
  const raw = readFileSync(target, 'utf8');
  const stamp = `translated_from: ${sourceHash(join(ROOT, s.file))}`;
  // Edit the frontmatter as text: re-serialising the YAML would reflow every
  // folded scalar in the file.
  const next = /^translated_from:.*$/m.test(raw)
    ? raw.replace(/^translated_from:.*$/m, stamp)
    : raw.replace(/^---\r?\n/, `---\n${stamp}\n`);
  if (next !== raw) { writeFileSync(target, next); n++; }
}
console.log(`stamped ${n} translation(s) in ${lang}`);
