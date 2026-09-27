import type { Graph, Suggestion } from '../types';
import { useT } from '../lib/i18n';

export function Dashboard({ graph }: { graph: Graph }) {
  const t = useT();
  const { stats, nextUp, trackProgress } = graph;
  const byId = new Map(graph.concepts.map((c) => [c.id, c]));
  const errors = graph.issues.filter((i) => i.level === 'error');
  const activeTracks = graph.tracks.filter((t) => trackProgress[t.id]?.active);
  const tracksToShow = activeTracks.length ? activeTracks : graph.tracks;

  // Worded here rather than taken from `s.why`, which the server writes for the
  // CLI in English and with ids where a reader wants titles.
  const why = (s: Suggestion) =>
    s.reason === 'due' ? t('why.due', s.date ?? '')
    : s.reason === 'blocked' ? t('why.blocked', (s.needs ?? []).map((id) => byId.get(id)?.title ?? id).join(', '))
    : t(`why.${s.reason}`);

  const Card = ({ s }: { s: Suggestion }) => {
    const c = byId.get(s.id);
    if (!c) return null;
    return (
      <a className="card" href={`#/c/${c.id}`}>
        <h4>
          {c.title}
          <span className={`badge ${s.reason}`}>{t(`reason.${s.reason}`)}</span>
        </h4>
        <p>{c.summary}</p>
        <div className="why">{why(s)} · {t('minutes', c.estMinutes)} · {t('difficulty', c.difficulty)}</div>
      </a>
    );
  };

  return (
    <div className="page">
      <h2 className="page-title">{t('dashboard')}</h2>
      <p className="lede">{t('dashLede')}</p>

      {errors.length > 0 && (
        <div className="error-box">
          <b>{t('brokenRefs', errors.length)}</b>
          <ul>{errors.slice(0, 6).map((e, i) => <li key={i}><code>{e.where}</code> — {e.message}</li>)}</ul>
        </div>
      )}

      <div className="stat-row">
        <div className="stat"><div className="n">{stats.mastered}</div><div className="k">{t('statMastered')}</div></div>
        <div className="stat"><div className="n">{stats.inFlight}</div><div className="k">{t('statInFlight')}</div></div>
        <div className="stat"><div className="n">{nextUp.due.length}</div><div className="k">{t('statDueToday')}</div></div>
        <div className="stat"><div className="n">{stats.concepts}</div><div className="k">{t('statConcepts')}</div></div>
        <div className="stat"><div className="n">{stats.reviewsLogged}</div><div className="k">{t('statReviews')}</div></div>
      </div>

      {nextUp.due.length > 0 && (
        <>
          <div className="section-head">
            <h3>{t('dueForReview')}</h3>
            <span className="hint">{t('dueHint')}</span>
          </div>
          <div className="card-grid">{nextUp.due.map((s) => <Card key={s.id} s={s} />)}</div>
        </>
      )}

      <div className="section-head">
        <h3>{t('readyToLearn')}</h3>
        <span className="hint">{t('readyHint')}</span>
      </div>
      {nextUp.unlocked.length ? (
        <div className="card-grid">{nextUp.unlocked.map((s) => <Card key={s.id} s={s} />)}</div>
      ) : (
        <p className="empty">{t('nothingUnlocked')}</p>
      )}

      <div className="section-head">
        <h3>{t('tracks')}</h3>
        <span className="hint">{t(activeTracks.length ? 'tracksActive' : 'tracksNoneActive')}</span>
      </div>
      <div className="card-grid">
        {tracksToShow.map((tr) => {
          const s = trackProgress[tr.id];
          return (
            <a className="card" key={tr.id} href={`#/t/${tr.id}`}>
              <h4>{tr.title}{s?.active && <span className="badge track">{t('active')}</span>}</h4>
              <p>{tr.goal}</p>
              <div className="bar"><i style={{ width: `${Math.round((s?.completion ?? 0) * 100)}%` }} /></div>
              <div className="meta-line">
                <span>{t('nOfMastered', s?.mastered ?? 0, s?.total ?? 0)}</span>
                <span>{t('nStages', tr.stages.length)}</span>
              </div>
            </a>
          );
        })}
      </div>

      {nextUp.blocked.length > 0 && (
        <>
          <div className="section-head">
            <h3>{t('blocked')}</h3>
            <span className="hint">{t('blockedHint')}</span>
          </div>
          <div className="card-grid">
            {nextUp.blocked.map((s) => {
              const c = byId.get(s.id);
              return c ? (
                <a className="card flat" key={s.id} href={`#/c/${c.id}`}>
                  <h4>{c.title}<span className="badge blocked">{t('reason.blocked')}</span></h4>
                  <div className="why">{why(s)}</div>
                </a>
              ) : null;
            })}
          </div>
        </>
      )}
    </div>
  );
}
