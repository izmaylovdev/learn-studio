import { useCallback, useEffect, useMemo, useState } from 'react';
import { getGraph } from './api';
import type { ConceptMeta, Graph, Status } from './types';
import { useRoute } from './lib/router';
import { Dashboard } from './views/Dashboard';
import { GraphView } from './views/GraphView';
import { Lexicon } from './views/Lexicon';
import { Reader } from './views/Reader';
import { TrackView } from './views/TrackView';
import { ExplainProvider } from './lib/formula/MathExplain';

export type Theme = 'dark' | 'light';

export function App() {
  const route = useRoute();
  const [graph, setGraph] = useState<Graph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) ?? 'dark'
  );

  const refresh = useCallback(async () => {
    try {
      setGraph(await getGraph());
      setError(null);
    } catch (err) {
      setError(String((err as Error).message));
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  // Materials are authored in the editor, not here. Re-read the library whenever
  // the tab regains focus so file edits show up without a manual reload.
  useEffect(() => {
    const on = () => { if (!document.hidden) void refresh(); };
    addEventListener('focus', on);
    document.addEventListener('visibilitychange', on);
    return () => {
      removeEventListener('focus', on);
      document.removeEventListener('visibilitychange', on);
    };
  }, [refresh]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const titles = useMemo(
    () => new Map((graph?.concepts ?? []).map((c) => [c.id, c.title])),
    [graph]
  );

  // Collapsed sections, not open ones — a track or field added later should show
  // up rather than hide itself because nobody has opened it yet. Keys are
  // `t:<trackId>` and `f:<trackId>:<field>`, so the same field under two tracks
  // collapses independently.
  const [closed, setClosed] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('sidebar:closed') ?? '[]')); }
    catch { return new Set(); }
  });
  useEffect(() => {
    localStorage.setItem('sidebar:closed', JSON.stringify([...closed]));
  }, [closed]);
  const toggle = (key: string) => setClosed((prev) => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  const tree = useMemo(() => {
    const byId = new Map((graph?.concepts ?? []).map((c) => [c.id, c]));
    const fieldRank = (f: string) => ((graph?.fields ?? []).indexOf(f) + 1 || Number.MAX_SAFE_INTEGER);

    const intoFields = (items: ConceptMeta[]): [string, ConceptMeta[]][] => {
      const by = new Map<string, ConceptMeta[]>();
      for (const c of items) {
        const list = by.get(c.field);
        if (list) list.push(c); else by.set(c.field, [c]);
      }
      for (const list of by.values()) {
        list.sort((a, b) => (a.order - b.order) || a.title.localeCompare(b.title));
      }
      return [...by.entries()].sort((a, b) => fieldRank(a[0]) - fieldRank(b[0]));
    };

    const tracks = (graph?.tracks ?? []).map((t) => ({
      id: t.id,
      title: t.title,
      pct: Math.round((graph?.trackProgress?.[t.id]?.completion ?? 0) * 100),
      fields: intoFields(
        [...new Set(t.conceptIds)].map((id) => byId.get(id)).filter(Boolean) as ConceptMeta[]
      ),
    }));

    const tracked = new Set((graph?.tracks ?? []).flatMap((t) => t.conceptIds));
    const loose = intoFields((graph?.concepts ?? []).filter((c) => !tracked.has(c.id)));
    return { tracks, loose };
  }, [graph]);

  /** every section key that has to be open for a concept to be visible */
  const pathTo = useMemo(() => {
    const m = new Map<string, string[]>();
    const add = (id: string, ...keys: string[]) => m.set(id, [...(m.get(id) ?? []), ...keys]);
    for (const t of tree.tracks) {
      for (const [field, items] of t.fields) {
        for (const c of items) add(c.id, `t:${t.id}`, `f:${t.id}:${field}`);
      }
    }
    for (const [field, items] of tree.loose) for (const c of items) add(c.id, `f::${field}`);
    return m;
  }, [tree]);

  // Following a link into a collapsed section should reveal it. Deliberately not
  // keyed on `closed`, so collapsing the section you are reading sticks.
  const activeConcept = route.name === 'concept' ? route.id : null;
  useEffect(() => {
    if (!activeConcept) return;
    const keys = pathTo.get(activeConcept);
    if (!keys?.length) return;
    setClosed((prev) => {
      if (!keys.some((k) => prev.has(k))) return prev;
      const next = new Set(prev);
      for (const k of keys) next.delete(k);
      return next;
    });
  }, [activeConcept, pathTo]);

  if (error) {
    return (
      <div className="page">
        <h2 className="page-title">Can't reach the library</h2>
        <div className="error-box">
          <b>{error}</b>
          <p style={{ margin: '8px 0 0' }}>
            The API server isn't responding. Start both processes with <code>npm run dev</code>.
          </p>
        </div>
      </div>
    );
  }
  if (!graph) return <div className="page"><p className="empty">Loading library…</p></div>;

  const statusOf = (id: string): Status => graph.progress[id]?.status ?? 'unseen';

  const renderField = (key: string, field: string, items: ConceptMeta[]) => {
    const open = !closed.has(key);
    const here = items.some((c) => c.id === activeConcept);
    return (
      <section className="field" key={key}>
        <button
          className={`field-head${open ? ' open' : ''}${here ? ' here' : ''}`}
          aria-expanded={open}
          onClick={() => toggle(key)}
        >
          <Chevron />
          <span className="field-name">{field}</span>
          <span className="count">{items.length}</span>
        </button>
        {open && (
          <div className="concept-list">
            {items.map((c) => (
              <a key={c.id} href={`#/c/${c.id}`}
                 className={c.id === activeConcept ? 'on' : ''}>
                <span className={`dot ${statusOf(c.id)}`} />
                {c.title}
              </a>
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    // Any formula anywhere can be taken apart; the concept being read decides
    // which sense of a reused glyph the drawer offers first.
    <ExplainProvider graph={graph} scope={activeConcept}>
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <h1>learn studio</h1>
          <p>{graph.stats.concepts} concepts · {graph.stats.edges} links</p>
        </div>
        <nav className="nav">
          <a href="#/" className={route.name === 'dashboard' ? 'on' : ''}>
            Dashboard
            {graph.nextUp.due.length > 0 && <span className="count">{graph.nextUp.due.length} due</span>}
          </a>
          <a href="#/graph" className={route.name === 'graph' ? 'on' : ''}>Knowledge graph</a>
          <a href="#/lexicon" className={route.name === 'lexicon' ? 'on' : ''}>
            Lexicon
            <span className="count">{Object.keys(graph.symbols ?? {}).length}</span>
          </a>
        </nav>

        <div className="side-section">Tracks</div>
        <div className="fields">
          {tree.tracks.map((t) => {
            const key = `t:${t.id}`;
            const open = !closed.has(key);
            return (
              <section className="track-group" key={t.id}>
                <div className={`track-head${route.name === 'track' && route.id === t.id ? ' on' : ''}`}>
                  <button
                    className={`twist${open ? ' open' : ''}`}
                    aria-expanded={open}
                    aria-label={`${open ? 'Collapse' : 'Expand'} ${t.title}`}
                    onClick={() => toggle(key)}
                  >
                    <Chevron />
                  </button>
                  <a href={`#/t/${t.id}`}>{t.title}</a>
                  <span className="count">{t.pct}%</span>
                </div>
                {open && t.fields.map(([field, items]) =>
                  renderField(`f:${t.id}:${field}`, field, items))}
              </section>
            );
          })}

          {tree.loose.length > 0 && (
            <>
              <div className="side-section">Not in a track</div>
              {tree.loose.map(([field, items]) => renderField(`f::${field}`, field, items))}
            </>
          )}
        </div>

        <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? 'Light theme' : 'Dark theme'}
        </button>
      </aside>

      <main className="main">
        {route.name === 'dashboard' && <Dashboard graph={graph} />}
        {route.name === 'graph' && <GraphView graph={graph} theme={theme} />}
        {route.name === 'lexicon' && <Lexicon key={route.q} graph={graph} query={route.q} />}
        {route.name === 'track' && <TrackView graph={graph} id={route.id} onChange={refresh} />}
        {route.name === 'concept' && (
          <Reader key={route.id} id={route.id} titles={titles} theme={theme} onChange={refresh} />
        )}
      </main>
    </div>
    </ExplainProvider>
  );
}

function Chevron() {
  return (
    <svg className="chev" viewBox="0 0 12 12" width="9" height="9" aria-hidden="true">
      <path d="M4 2.5 8 6l-4 3.5" fill="none" stroke="currentColor"
            strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
