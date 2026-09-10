import { useCallback, useEffect, useMemo, useState } from 'react';
import { getGraph } from './api';
import type { ConceptMeta, Graph, Status } from './types';
import { useRoute } from './lib/router';
import { Dashboard } from './views/Dashboard';
import { GraphView } from './views/GraphView';
import { Lexicon } from './views/Lexicon';
import { Reader } from './views/Reader';
import { TrackView } from './views/TrackView';

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

  // Collapsed fields, not open ones — a field added later should show up rather
  // than hide itself because nobody has opened it yet.
  const [closed, setClosed] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('fields:closed') ?? '[]')); }
    catch { return new Set(); }
  });
  useEffect(() => {
    localStorage.setItem('fields:closed', JSON.stringify([...closed]));
  }, [closed]);

  const grouped = useMemo(() => {
    const by = new Map<string, ConceptMeta[]>();
    for (const c of graph?.concepts ?? []) {
      const list = by.get(c.field);
      if (list) list.push(c); else by.set(c.field, [c]);
    }
    for (const list of by.values()) {
      list.sort((a, b) => (a.order - b.order) || a.title.localeCompare(b.title));
    }
    const order = graph?.fields ?? [];
    const rank = (f: string) => (order.indexOf(f) + 1 || Number.MAX_SAFE_INTEGER);
    return [...by.entries()].sort((a, b) => rank(a[0]) - rank(b[0]));
  }, [graph]);

  const fieldOf = useMemo(
    () => new Map((graph?.concepts ?? []).map((c) => [c.id, c.field])),
    [graph]
  );

  // Following a link into a collapsed field should reveal it. Deliberately not
  // keyed on `closed`, so collapsing the field you are currently reading sticks.
  const activeConcept = route.name === 'concept' ? route.id : null;
  useEffect(() => {
    if (!activeConcept) return;
    const field = fieldOf.get(activeConcept);
    if (!field) return;
    setClosed((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, [activeConcept, fieldOf]);

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

  return (
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
        <nav className="nav">
          {graph.tracks.map((t) => {
            const stat = graph.trackProgress[t.id];
            return (
              <a key={t.id} href={`#/t/${t.id}`}
                 className={route.name === 'track' && route.id === t.id ? 'on' : ''}>
                {t.title}
                <span className="count">{Math.round((stat?.completion ?? 0) * 100)}%</span>
              </a>
            );
          })}
        </nav>

        <div className="side-section">Concepts</div>
        <div className="fields">
        {grouped.map(([field, items]) => {
          const open = !closed.has(field);
          const here = items.some((c) => route.name === 'concept' && route.id === c.id);
          return (
            <section className="field" key={field}>
              <button
                className={`field-head${open ? ' open' : ''}${here ? ' here' : ''}`}
                aria-expanded={open}
                onClick={() => setClosed((prev) => {
                  const next = new Set(prev);
                  next.has(field) ? next.delete(field) : next.add(field);
                  return next;
                })}
              >
                <svg className="chev" viewBox="0 0 12 12" width="9" height="9" aria-hidden="true">
                  <path d="M4 2.5 8 6l-4 3.5" fill="none" stroke="currentColor"
                        strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="field-name">{field}</span>
                <span className="count">{items.length}</span>
              </button>
              {open && (
                <div className="concept-list">
                  {items.map((c) => (
                    <a key={c.id} href={`#/c/${c.id}`}
                       className={route.name === 'concept' && route.id === c.id ? 'on' : ''}>
                      <span className={`dot ${statusOf(c.id)}`} />
                      {c.title}
                    </a>
                  ))}
                </div>
              )}
            </section>
          );
        })}
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
  );
}
