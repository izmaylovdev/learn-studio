import { useCallback, useEffect, useRef, useState } from 'react';
import { getConcept, postProgress } from '../api';
import type { Concept, Status } from '../types';
import { Markdown } from '../lib/Markdown';
import { useLang, useT } from '../lib/i18n';

const STATUSES: Status[] = ['unseen', 'learning', 'review', 'mastered'];

export function Reader({
  id, titles, theme, onChange,
}: {
  id: string;
  titles: Map<string, string>;
  theme: 'dark' | 'light';
  onChange: () => void;
}) {
  const t = useT();
  const lang = useLang();
  const [concept, setConcept] = useState<Concept | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState('');
  const notesTimer = useRef<number>();

  const load = useCallback(async () => {
    try { setConcept(await getConcept(id, lang)); setError(null); }
    catch (err) { setError(String((err as Error).message)); }
  }, [id, lang]);

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
  if (!concept) return <div className="page"><p className="empty">{t('loading')}</p></div>;

  const { state } = concept;

  return (
    <div className="page">
      <div className="reader">
        <div>
          {concept.lang !== lang && <p className="untranslated">{t('untranslated')}</p>}
          <Markdown
            body={concept.body}
            titles={titles}
            theme={theme}
            answers={concept.checks}
            formulas={concept.formulas ?? []}
            onGrade={(g) => void send({ grade: g }, t('reviewRecorded'))}
          />
        </div>

        <aside className="aside">
          <div className="block">
            <h5>{t('status')}</h5>
            <div className="status-picker">
              {STATUSES.map((s) => (
                <button key={s}
                        className={`${state.status === s ? `on ${s}` : ''}`}
                        onClick={() => void send({ status: s }, t('markedAs', t(`status.${s}`)))}>
                  {t(`status.${s}`)}
                </button>
              ))}
            </div>
            <div className="meta-line">
              {state.lastReviewed && <span>{t('last', state.lastReviewed)}</span>}
              {state.nextReview && <span>{t('next', state.nextReview)}</span>}
              {state.reps > 0 && <span>{t('reps', state.reps)}</span>}
            </div>
            <div className="saved">{saved}</div>
          </div>

          <div className="block">
            <h5>{t('about')}</h5>
            <div className="meta-line" style={{ marginTop: 0 }}>
              <span>{t('minutes', concept.estMinutes)}</span>
              <span>{t('difficulty', concept.difficulty)}</span>
              <span>{t('depth', concept.depth)}</span>
            </div>
            {concept.tags.length > 0 && (
              <div className="meta-line">{concept.tags.map((t) => <span key={t}>#{t}</span>)}</div>
            )}
          </div>

          <RefBlock title={t('prerequisites')} ids={concept.prereqs} titles={titles} />
          <RefBlock title={t('related')} ids={concept.related} titles={titles} />

          {concept.backlinks.length > 0 && (
            <div className="block">
              <h5>{t('referencedBy')}</h5>
              <ul>
                {concept.backlinks.map((b) => (
                  <li key={`${b.from}-${b.kind}`}>
                    <a href={`#/c/${b.from}`}>
                      {titles.get(b.from) ?? b.from}
                      <span className="kind">{t(`edge.${b.kind}`)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {concept.tracks.length > 0 && (
            <div className="block">
              <h5>{t('inTracks')}</h5>
              <ul>
                {concept.tracks.map((t) => (
                  <li key={t.id}><a href={`#/t/${t.id}`}>{t.title}</a></li>
                ))}
              </ul>
            </div>
          )}

          {concept.sources.length > 0 && (
            <div className="block">
              <h5>{t('sources')}</h5>
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
            <h5>{t('myNotes')}</h5>
            <textarea
              className="notes"
              defaultValue={state.notes}
              placeholder={t('notesPlaceholder')}
              onChange={(e) => {
                const notes = e.target.value;
                clearTimeout(notesTimer.current);
                notesTimer.current = window.setTimeout(() => void send({ notes }, t('notesSaved')), 700);
              }}
            />
          </div>

          <div className="block">
            <h5>{t('sourceFile')}</h5>
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
