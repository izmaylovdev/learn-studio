// Tiny zero-dependency API over library/ and progress/. Reads the library on
// every request so editing a .md file shows up on refresh, no restart needed.
import { createServer } from 'node:http';
import { loadLibrary, summarize, languages, SOURCE_LANG } from './library.mjs';
import {
  loadProgress, saveProgress, applyReview, setStatus, setNotes,
  nextUp, trackProgress, conceptState, mastery,
} from './progress.mjs';

const PORT = Number(process.env.PORT ?? 8787);

const json = (res, code, body) => {
  const payload = JSON.stringify(body);
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) reject(new Error('body too large'));
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { reject(new Error('invalid JSON body')); }
    });
    req.on('error', reject);
  });

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  // Content language. Anything not translated falls back to the source, so an
  // unknown language is served as the source rather than refused.
  const asked = url.searchParams.get('lang') ?? SOURCE_LANG;
  const lang = languages().includes(asked) ? asked : SOURCE_LANG;

  try {
    if (path === '/api/graph' && req.method === 'GET') {
      const lib = loadLibrary(lang);
      const p = loadProgress();
      return json(res, 200, {
        ...summarize(lib, p.concepts),
        languages: languages(),
        trackProgress: trackProgress(lib, p),
        nextUp: nextUp(lib, p),
        stats: {
          concepts: lib.concepts.length,
          tracks: lib.tracks.length,
          edges: lib.edges.length,
          mastered: lib.concepts.filter((c) => conceptState(p, c.id).status === 'mastered').length,
          inFlight: lib.concepts.filter((c) => ['learning', 'review'].includes(conceptState(p, c.id).status)).length,
          reviewsLogged: p.log.filter((e) => e.event === 'review').length,
        },
      });
    }

    if (path.startsWith('/api/concept/') && req.method === 'GET') {
      const id = decodeURIComponent(path.slice('/api/concept/'.length));
      const lib = loadLibrary(lang);
      const c = lib.byId.get(id);
      if (!c) return json(res, 404, { error: `no concept \`${id}\`` });
      const p = loadProgress();
      return json(res, 200, {
        ...c,
        backlinks: lib.backlinks.get(id) ?? [],
        state: conceptState(p, id),
        mastery: mastery(p, id),
        tracks: lib.tracks.filter((t) => t.conceptIds.includes(id)).map((t) => ({ id: t.id, title: t.title })),
      });
    }

    if (path.startsWith('/api/track/') && req.method === 'GET') {
      const id = decodeURIComponent(path.slice('/api/track/'.length));
      const lib = loadLibrary(lang);
      const t = lib.tracks.find((x) => x.id === id);
      if (!t) return json(res, 404, { error: `no track \`${id}\`` });
      return json(res, 200, t);
    }

    if (path.startsWith('/api/progress/') && req.method === 'POST') {
      const id = decodeURIComponent(path.slice('/api/progress/'.length));
      const lib = loadLibrary();
      if (!lib.byId.has(id)) return json(res, 404, { error: `no concept \`${id}\`` });
      const body = await readBody(req);
      const p = loadProgress();
      if (body.grade != null) applyReview(p, id, body.grade);
      if (body.status) setStatus(p, id, body.status);
      if (body.notes != null) setNotes(p, id, body.notes);
      saveProgress(p);
      return json(res, 200, { state: conceptState(p, id), nextUp: nextUp(lib, p), trackProgress: trackProgress(lib, p) });
    }

    if (path.startsWith('/api/track-toggle/') && req.method === 'POST') {
      const id = decodeURIComponent(path.slice('/api/track-toggle/'.length));
      const lib = loadLibrary();
      if (!lib.tracks.some((t) => t.id === id)) return json(res, 404, { error: `no track \`${id}\`` });
      const p = loadProgress();
      const active = !p.tracks[id]?.active;
      p.tracks[id] = { ...(p.tracks[id] ?? {}), active, started: p.tracks[id]?.started ?? new Date().toISOString() };
      saveProgress(p);
      return json(res, 200, { trackProgress: trackProgress(lib, p), nextUp: nextUp(lib, p) });
    }

    return json(res, 404, { error: `no route ${req.method} ${path}` });
  } catch (err) {
    return json(res, 500, { error: String(err.message ?? err) });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[learn-studio] api on http://127.0.0.1:${PORT}`);
});
