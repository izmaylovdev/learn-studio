import { useCallback, useEffect, useMemo, useState } from 'react';
import { getGraph } from './api';
import type { Graph, Status } from './types';
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
        <div className="concept-list">
          {graph.concepts.map((c) => (
            <a key={c.id} href={`#/c/${c.id}`}
               className={route.name === 'concept' && route.id === c.id ? 'on' : ''}>
              <span className={`dot ${statusOf(c.id)}`} />
              {c.title}
            </a>
          ))}
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
