import { useCallback, useEffect, useRef, useState } from 'react';
import { getConcept, postProgress } from '../api';
import type { Concept, Status } from '../types';
import { Markdown } from '../lib/Markdown';

const STATUSES: Status[] = ['unseen', 'learning', 'review', 'mastered'];

export function Reader({
  id, titles, theme, onChange,
}: {
  id: string;
  titles: Map<string, string>;
  theme: 'dark' | 'light';
  onChange: () => void;
}) {
  const [concept, setConcept] = useState<Concept | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState('');
  const notesTimer = useRef<number>();

  const load = useCallback(async () => {
    try { setConcept(await getConcept(id)); setError(null); }
    catch (err) { setError(String((err as Error).message)); }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  // Same reason the graph refreshes on focus: the material is authored in the
  // editor, so tabbing back should show the edit without a manual reload.
  useEffect(() => {
    const on = () => { if (!document.hidden) void load(); };
    addEventListener('focus', on);
    document.addEventListener('visibilitychange', on);
    return () => {
      removeEventListener('focus', on);
      document.removeEventListener('visibilitychange', on);
    };
  }, [load]);

  useEffect(() => () => clearTimeout(notesTimer.current), []);

  const flash = (msg: string) => {
    setSaved(msg);
    setTimeout(() => setSaved(''), 2200);
  };

  const send = async (body: { grade?: number; status?: string; notes?: string }, msg: string) => {
    const res = await postProgress(id, body);
    setConcept((c) => (c ? { ...c, state: res.state } : c));
    onChange();
    flash(msg);
  };

  if (error) return <div className="page"><div className="error-box"><b>{error}</b></div></div>;
  if (!concept) return <div className="page"><p className="empty">Loading…</p></div>;

  const { state } = concept;

  return (
    <div className="page">
      <div className="reader">
        <div>
          <Markdown
            body={concept.body}
            titles={titles}
            theme={theme}
            answers={concept.checks}
            formulas={concept.formulas ?? []}
            onGrade={(g) => void send({ grade: g }, 'review recorded')}
          />
        </div>

        <aside className="aside">
          <div className="block">
            <h5>Status</h5>
            <div className="status-picker">
              {STATUSES.map((s) => (
                <button key={s}
                        className={`${state.status === s ? `on ${s}` : ''}`}
                        onClick={() => void send({ status: s }, `marked ${s}`)}>
                  {s}
                </button>
              ))}
            </div>
            <div className="meta-line">
              {state.lastReviewed && <span>last {state.lastReviewed}</span>}
              {state.nextReview && <span>next {state.nextReview}</span>}
              {state.reps > 0 && <span>{state.reps} reps</span>}
            </div>
            <div className="saved">{saved}</div>
          </div>

          <div className="block">
            <h5>About</h5>
            <div className="meta-line" style={{ marginTop: 0 }}>
              <span>{concept.estMinutes} min</span>
              <span>difficulty {concept.difficulty}/5</span>
              <span>depth {concept.depth}</span>
            </div>
            {concept.tags.length > 0 && (
              <div className="meta-line">{concept.tags.map((t) => <span key={t}>#{t}</span>)}</div>
            )}
          </div>

          <RefBlock title="Prerequisites" ids={concept.prereqs} titles={titles} />
          <RefBlock title="Related" ids={concept.related} titles={titles} />

          {concept.backlinks.length > 0 && (
            <div className="block">
              <h5>Referenced by</h5>
              <ul>
                {concept.backlinks.map((b) => (
                  <li key={`${b.from}-${b.kind}`}>
                    <a href={`#/c/${b.from}`}>
                      {titles.get(b.from) ?? b.from}
                      <span className="kind">{b.kind}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {concept.tracks.length > 0 && (
            <div className="block">
              <h5>In tracks</h5>
              <ul>
                {concept.tracks.map((t) => (
                  <li key={t.id}><a href={`#/t/${t.id}`}>{t.title}</a></li>
                ))}
              </ul>
            </div>
          )}

          {concept.sources.length > 0 && (
            <div className="block">
              <h5>Sources</h5>
              <ul>
                {concept.sources.map((s, i) => (
                  <li key={i}>
                    {s.url
                      ? <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
                      : <span style={{ color: 'var(--muted)', fontSize: 12.8 }}>{s.title}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="block">
            <h5>My notes</h5>
            <textarea
              className="notes"
              defaultValue={state.notes}
              placeholder="What clicked, what didn't, what to come back to…"
              onChange={(e) => {
                const notes = e.target.value;
                clearTimeout(notesTimer.current);
                notesTimer.current = window.setTimeout(() => void send({ notes }, 'notes saved'), 700);
              }}
            />
          </div>

          <div className="block">
            <h5>Source file</h5>
            <code style={{ fontSize: 11.5, color: 'var(--faint)', wordBreak: 'break-all' }}>
              {concept.file}
            </code>
          </div>
        </aside>
      </div>
    </div>
  );
}

function RefBlock({ title, ids, titles }: { title: string; ids: string[]; titles: Map<string, string> }) {
  if (!ids.length) return null;
  return (
    <div className="block">
      <h5>{title}</h5>
      <ul>
        {ids.map((id) => (
          <li key={id}><a href={`#/c/${id}`}>{titles.get(id) ?? id}</a></li>
        ))}
      </ul>
    </div>
  );
}
