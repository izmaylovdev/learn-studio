// Progress lives apart from the materials on purpose: materials get rewritten
// and regenerated, and your mastery history must never be collateral damage.
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './library.mjs';

const FILE = join(ROOT, 'progress', 'progress.json');
export const STATUSES = ['unseen', 'learning', 'review', 'mastered'];

const EMPTY = { version: 1, concepts: {}, tracks: {}, log: [] };

export function loadProgress() {
  if (!existsSync(FILE)) return structuredClone(EMPTY);
  try {
    return { ...structuredClone(EMPTY), ...JSON.parse(readFileSync(FILE, 'utf8')) };
  } catch (err) {
    throw new Error(`progress/progress.json is not valid JSON: ${err.message}`);
  }
}

export function saveProgress(p) {
  mkdirSync(join(ROOT, 'progress'), { recursive: true });
  const tmp = `${FILE}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(p, null, 2)}\n`);
  renameSync(tmp, FILE); // atomic-ish: never leave a half-written history behind
  return p;
}

export function conceptState(p, id) {
  return p.concepts[id] ?? { status: 'unseen', reps: 0, ease: 2.5, intervalDays: 0, lastReviewed: null, nextReview: null, notes: '' };
}

const DAY = 86400000;
const iso = (d) => new Date(d).toISOString().slice(0, 10);

/**
 * SM-2, trimmed. grade 0-5; <3 means you did not recall it and the interval resets.
 * Mastered = recalled comfortably at least 3 times with an interval past three weeks.
 */
export function applyReview(p, id, grade, now = Date.now()) {
  const s = { ...conceptState(p, id) };
  const g = Math.max(0, Math.min(5, Number(grade)));

  if (g < 3) {
    s.reps = 0;
    s.intervalDays = 1;
    s.status = 'learning';
  } else {
    s.reps += 1;
    s.ease = Math.max(1.3, s.ease + (0.1 - (5 - g) * (0.08 + (5 - g) * 0.02)));
    s.intervalDays = s.reps === 1 ? 1 : s.reps === 2 ? 6 : Math.round(s.intervalDays * s.ease);
    s.status = s.reps >= 3 && s.intervalDays >= 21 ? 'mastered' : 'review';
  }
  s.lastReviewed = iso(now);
  s.nextReview = iso(now + s.intervalDays * DAY);

  p.concepts[id] = s;
  p.log.push({ ts: new Date(now).toISOString(), concept: id, event: 'review', grade: g, status: s.status });
  return s;
}

export function setStatus(p, id, status, now = Date.now()) {
  if (!STATUSES.includes(status)) throw new Error(`unknown status: ${status}`);
  const s = { ...conceptState(p, id), status };
  if (status === 'unseen') Object.assign(s, { reps: 0, intervalDays: 0, lastReviewed: null, nextReview: null });
  if (status === 'learning' && !s.lastReviewed) s.nextReview = iso(now + DAY);
  p.concepts[id] = s;
  p.log.push({ ts: new Date(now).toISOString(), concept: id, event: 'status', status });
  return s;
}

export function setNotes(p, id, notes) {
  p.concepts[id] = { ...conceptState(p, id), notes: String(notes ?? '') };
  return p.concepts[id];
}

export function mastery(p, id) {
  const s = conceptState(p, id);
  if (s.status === 'mastered') return 1;
  if (s.status === 'unseen') return 0;
  return Math.min(0.95, 0.2 + Math.min(s.intervalDays, 21) / 21 * 0.75);
}

/**
 * What to do next: concepts whose prereqs are already handled, ordered by
 * (a) anything due for review, then (b) shallowest unseen concept in an active track.
 */
export function nextUp(lib, p, limit = 8) {
  const today = iso(Date.now());
  const done = (id) => ['mastered', 'review'].includes(conceptState(p, id).status);
  const activeTrackIds = new Set(
    lib.tracks.filter((t) => p.tracks[t.id]?.active).flatMap((t) => t.conceptIds)
  );

  const due = lib.concepts
    .filter((c) => {
      const s = conceptState(p, c.id);
      return s.nextReview && s.nextReview <= today && s.status !== 'unseen';
    })
    .map((c) => ({ id: c.id, reason: 'due', why: `review due ${conceptState(p, c.id).nextReview}` }));

  const unlocked = lib.concepts
    .filter((c) => conceptState(p, c.id).status === 'unseen')
    .filter((c) => c.prereqs.filter((x) => lib.byId.has(x)).every(done))
    .sort((a, b) => {
      const at = activeTrackIds.has(a.id) ? 0 : 1;
      const bt = activeTrackIds.has(b.id) ? 0 : 1;
      return at - bt || a.difficulty - b.difficulty || a.title.localeCompare(b.title);
    })
    .map((c) => ({
      id: c.id,
      reason: activeTrackIds.has(c.id) ? 'track' : 'unlocked',
      why: activeTrackIds.has(c.id) ? 'next in an active track' : 'prerequisites met',
    }));

  const blocked = lib.concepts
    .filter((c) => conceptState(p, c.id).status === 'unseen')
    .filter((c) => {
      const ps = c.prereqs.filter((x) => lib.byId.has(x));
      return ps.length && !ps.every(done);
    })
    .map((c) => ({
      id: c.id,
      reason: 'blocked',
      why: `needs ${c.prereqs.filter((x) => lib.byId.has(x) && !done(x)).join(', ')}`,
    }));

  return { due, unlocked: unlocked.slice(0, limit), blocked: blocked.slice(0, limit) };
}

export function trackProgress(lib, p) {
  return Object.fromEntries(
    lib.tracks.map((t) => {
      const ids = t.conceptIds.filter((id) => lib.byId.has(id));
      const scores = ids.map((id) => mastery(p, id));
      return [t.id, {
        active: !!p.tracks[t.id]?.active,
        started: p.tracks[t.id]?.started ?? null,
        total: ids.length,
        mastered: ids.filter((id) => conceptState(p, id).status === 'mastered').length,
        touched: ids.filter((id) => conceptState(p, id).status !== 'unseen').length,
        completion: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
        stages: t.stages.map((s) => {
          const sids = s.concepts.filter((id) => lib.byId.has(id));
          return {
            title: s.title,
            total: sids.length,
            done: sids.filter((id) => conceptState(p, id).status === 'mastered').length,
          };
        }),
      }];
    })
  );
}
