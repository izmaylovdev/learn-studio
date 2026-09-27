import { toggleTrack } from '../api';
import type { Graph } from '../types';
import { useT } from '../lib/i18n';

export function TrackView({ graph, id, onChange }: { graph: Graph; id: string; onChange: () => void }) {
  const t = useT();
  const track = graph.tracks.find((t) => t.id === id);
  const stat = graph.trackProgress[id];
  const byId = new Map(graph.concepts.map((c) => [c.id, c]));

  if (!track) return <div className="page"><p className="empty">{t('noTrack')} <code>{id}</code>.</p></div>;

  const statusOf = (cid: string) => graph.progress[cid]?.status ?? 'unseen';

  return (
    <div className="page">
      <h2 className="page-title">{track.title}</h2>
      <p className="lede">{track.goal}</p>

      <div className="stat-row">
        <div className="stat"><div className="n">{Math.round((stat?.completion ?? 0) * 100)}%</div><div className="k">{t('complete')}</div></div>
        <div className="stat"><div className="n">{stat?.mastered ?? 0}/{stat?.total ?? 0}</div><div className="k">{t('statMastered')}</div></div>
        <div className="stat"><div className="n">{stat?.touched ?? 0}</div><div className="k">{t('started')}</div></div>
        <div className="stat">
          <div className="n" style={{ fontSize: 15, paddingTop: 7 }}>
            <button className={`chip ${stat?.active ? 'on' : ''}`}
                    onClick={() => void toggleTrack(id).then(onChange)}>
              {t(stat?.active ? 'isActive' : 'setActive')}
            </button>
          </div>
          <div className="k" style={{ marginTop: 6 }}>{t('prioritizes')}</div>
        </div>
      </div>

      {track.stages.map((stage, i) => {
        const s = stat?.stages[i];
        const done = s && s.total > 0 && s.done === s.total;
        const started = stage.concepts.some((cid) => statusOf(cid) !== 'unseen');
        return (
          <div className={`stage${done ? ' done' : started ? ' active' : ''}`} key={i}>
            <h3>{stage.title} <span className="badge">{s?.done ?? 0}/{s?.total ?? 0}</span></h3>
            <p className="goal">{stage.goal}</p>
            <div className="card-grid">
              {stage.concepts.map((cid) => {
                const c = byId.get(cid);
                if (!c) return (
                  <div className="card flat" key={cid}>
                    <h4><code>{cid}</code></h4>
                    <p style={{ color: 'var(--danger)' }}>{t('missingConcept')}</p>
                  </div>
                );
                return (
                  <a className="card" key={cid} href={`#/c/${cid}`}>
                    <h4><span className={`dot ${statusOf(cid)}`} />{c.title}</h4>
                    <p>{c.summary}</p>
                    <div className="meta-line">
                      <span>{t('minutes', c.estMinutes)}</span>
                      <span>{t('difficulty', c.difficulty)}</span>
                      <span>{t(`status.${statusOf(cid)}`)}</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
