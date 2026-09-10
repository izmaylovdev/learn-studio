import type { Graph, Suggestion } from '../types';

export function Dashboard({ graph }: { graph: Graph }) {
  const { stats, nextUp, trackProgress } = graph;
  const byId = new Map(graph.concepts.map((c) => [c.id, c]));
  const errors = graph.issues.filter((i) => i.level === 'error');
  const activeTracks = graph.tracks.filter((t) => trackProgress[t.id]?.active);
  const tracksToShow = activeTracks.length ? activeTracks : graph.tracks;

  const Card = ({ s }: { s: Suggestion }) => {
    const c = byId.get(s.id);
    if (!c) return null;
    return (
      <a className="card" href={`#/c/${c.id}`}>
        <h4>
          {c.title}
          <span className={`badge ${s.reason}`}>{s.reason}</span>
        </h4>
        <p>{c.summary}</p>
        <div className="why">{s.why} · {c.estMinutes} min · difficulty {c.difficulty}/5</div>
      </a>
    );
  };

  return (
    <div className="page">
      <h2 className="page-title">Dashboard</h2>
      <p className="lede">
        What to study next, chosen from prerequisites you've already cleared and reviews that have come due.
      </p>

      {errors.length > 0 && (
        <div className="error-box">
          <b>{errors.length} broken reference{errors.length > 1 ? 's' : ''} in the library</b>
          <ul>{errors.slice(0, 6).map((e, i) => <li key={i}><code>{e.where}</code> — {e.message}</li>)}</ul>
        </div>
      )}

      <div className="stat-row">
        <div className="stat"><div className="n">{stats.mastered}</div><div className="k">mastered</div></div>
        <div className="stat"><div className="n">{stats.inFlight}</div><div className="k">in flight</div></div>
        <div className="stat"><div className="n">{nextUp.due.length}</div><div className="k">due today</div></div>
        <div className="stat"><div className="n">{stats.concepts}</div><div className="k">concepts</div></div>
        <div className="stat"><div className="n">{stats.reviewsLogged}</div><div className="k">reviews logged</div></div>
      </div>

      {nextUp.due.length > 0 && (
        <>
          <div className="section-head">
            <h3>Due for review</h3>
            <span className="hint">recall these before they decay</span>
          </div>
          <div className="card-grid">{nextUp.due.map((s) => <Card key={s.id} s={s} />)}</div>
        </>
      )}

      <div className="section-head">
        <h3>Ready to learn</h3>
        <span className="hint">prerequisites cleared</span>
      </div>
      {nextUp.unlocked.length ? (
        <div className="card-grid">{nextUp.unlocked.map((s) => <Card key={s.id} s={s} />)}</div>
      ) : (
        <p className="empty">Nothing unlocked — everything available is already in progress.</p>
      )}

      <div className="section-head">
        <h3>Tracks</h3>
        <span className="hint">{activeTracks.length ? 'active' : 'none active yet'}</span>
      </div>
      <div className="card-grid">
        {tracksToShow.map((t) => {
          const s = trackProgress[t.id];
          return (
            <a className="card" key={t.id} href={`#/t/${t.id}`}>
              <h4>{t.title}{s?.active && <span className="badge track">active</span>}</h4>
              <p>{t.goal}</p>
              <div className="bar"><i style={{ width: `${Math.round((s?.completion ?? 0) * 100)}%` }} /></div>
              <div className="meta-line">
                <span>{s?.mastered ?? 0}/{s?.total ?? 0} mastered</span>
                <span>{t.stages.length} stages</span>
              </div>
            </a>
          );
        })}
      </div>

      {nextUp.blocked.length > 0 && (
        <>
          <div className="section-head">
            <h3>Blocked</h3>
            <span className="hint">waiting on prerequisites</span>
          </div>
          <div className="card-grid">
            {nextUp.blocked.map((s) => {
              const c = byId.get(s.id);
              return c ? (
                <a className="card flat" key={s.id} href={`#/c/${c.id}`}>
                  <h4>{c.title}<span className="badge blocked">blocked</span></h4>
                  <div className="why">{s.why}</div>
                </a>
              ) : null;
            })}
          </div>
        </>
      )}
    </div>
  );
}
