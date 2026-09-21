import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import katex from 'katex';
import type { Formula, SymbolKind } from '../../types';
import { KIND_GLOSS, KIND_NAME, KIND_ORDER } from './kinds';
import { annotate, paint } from './annotate';
import { SymbolCard } from './SymbolCard';
import { useMaybeExplain } from './MathExplain';

export function FormulaExplorer({ spec, reason = 'parse' }: { spec: Formula | null; reason?: 'parse' | 'unmatched' }) {
  const box = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [isolated, setIsolated] = useState<Set<SymbolKind>>(new Set());
  const [missing, setMissing] = useState<string[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  // Collapsed by default: the prose is a fallback for when the formula alone
  // doesn't land, and leaving it open every time trains you to read it instead
  // of the formula. The choice sticks so nobody re-opens it on every page.
  const [showReading, setShowReading] = useState(() => {
    try { return localStorage.getItem('fx:reading') === '1'; } catch { return false; }
  });
  const paneId = useId();
  // Colour is one preference across every formula on the page, so turning it
  // off here also calms the equations in the prose.
  const explain = useMaybeExplain();
  const [localColour, setLocalColour] = useState(true);
  const coloured = explain?.coloured ?? localColour;
  const setColoured = explain?.setColoured ?? setLocalColour;

  // The author's list decides what this formula's symbols *mean here*, and it
  // comes first so its senses win. The rest of the lexicon follows as a
  // fallback: a glyph nobody listed is still a glyph a reader can ask about,
  // and leaving it dead in the one block built for asking would be perverse.
  const symbols = useMemo(() => {
    const listed = (spec?.symbols ?? []).map((s) => ({ ...s, listed: true }));
    const seen = new Set(listed.map((s) => s.id));
    const rest = (explain?.senses.ordered ?? []).filter((s) => !seen.has(s.id));
    return [...listed, ...rest.map((s) => ({ ...s, note: '' }))];
  }, [spec, explain?.senses]);

  useEffect(() => {
    try { localStorage.setItem('fx:reading', showReading ? '1' : '0'); } catch { /* private mode */ }
  }, [showReading]);

  const html = useMemo(() => {
    if (!spec) return '';
    try {
      return katex.renderToString(spec.tex, { displayMode: true, throwOnError: false, output: 'html' });
    } catch {
      return '';
    }
  }, [spec]);

  useLayoutEffect(() => {
    if (!box.current || !spec) return;
    // Annotation mutates the rendered output, so start from clean KaTeX —
    // the lexicon arrives after the first paint and would otherwise be laid
    // on top of tags that are already there.
    box.current.innerHTML = html;
    const { found } = annotate(box.current, symbols);
    setOrder(found);
    // Only the author's own list can be "missing" — the lexicon fallback is
    // expected not to appear, that is what makes it a fallback.
    setMissing(spec.symbols.filter((s) => !found.includes(s.id)).map((s) => s.id));
    setSelected(null);
  }, [html, spec, symbols]);

  useEffect(() => {
    if (box.current) paint(box.current, selected, isolated as Set<string>);
  }, [selected, isolated, order]);

  if (!spec) {
    return (
      <div className="fx-explorer fx-broken">
        {reason === 'unmatched' ? (
          <>
            <b>No parsed spec reached this formula block.</b>
            <p>The block's text did not match any formula the server parsed for this concept.</p>
          </>
        ) : (
          <>
            <b>This formula block could not be parsed.</b>
            <p>Run <code>npm run check</code> — the indexer names the file and the reason.</p>
          </>
        )}
      </div>
    );
  }

  const byId = new Map(symbols.map((s) => [s.id, s]));
  const active = selected ? byId.get(selected) ?? null : null;
  const kindsPresent = KIND_ORDER.filter((k) => order.some((id) => byId.get(id)?.kind === k));
  const hasReading = Boolean(spec.reading || spec.why || spec.steps.length);
  const readingOpen = hasReading && showReading;

  const step = (dir: 1 | -1) => {
    if (!order.length) return;
    const at = selected ? order.indexOf(selected) : -1;
    setSelected(order[(at + dir + order.length) % order.length]);
  };

  const onPick = (e: React.MouseEvent | React.KeyboardEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('.fx-tok');
    if (!el?.dataset.sym) return;
    setSelected((prev) => (prev === el.dataset.sym ? null : el.dataset.sym!));
  };

  return (
    <div className={`fx-explorer${coloured ? ' coloured' : ''}`}>
      <div className="fx-bar">
        {spec.title && <span className="fx-title">{spec.title}</span>}
        <div className="fx-kinds">
          {kindsPresent.map((k) => (
            <button
              key={k}
              className={`fx-chip${isolated.has(k) ? ' on' : ''}`}
              data-kind={k}
              title={KIND_GLOSS[k]}
              aria-pressed={isolated.has(k)}
              onClick={() =>
                setIsolated((prev) => {
                  const next = new Set(prev);
                  next.has(k) ? next.delete(k) : next.add(k);
                  return next;
                })
              }
            >
              <span className="fx-dot" />{KIND_NAME[k]}
            </button>
          ))}
          <label className="fx-toggle">
            <input type="checkbox" checked={coloured} onChange={(e) => setColoured(e.target.checked)} />
            colour
          </label>
          {hasReading && (
            <button
              className={`fx-read${showReading ? ' on' : ''}`}
              aria-expanded={showReading}
              aria-controls={paneId}
              title={showReading ? 'Hide the plain-English reading' : 'Show the plain-English reading'}
              onClick={() => setShowReading((v) => !v)}
            >
              <BookIcon open={showReading} />
              <span>How to read it</span>
            </button>
          )}
        </div>
      </div>

      <div
        className="fx-stage"
        ref={box}
        onClick={onPick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(e); }
          if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
          if (e.key === 'Escape') setSelected(null);
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="fx-hint">
        Click any highlighted symbol{order.length > 1 && <> · <kbd>←</kbd> <kbd>→</kbd> to step through</>}
        {missing.length > 0 && (
          <span className="fx-warn"> · {missing.length} listed symbol{missing.length > 1 ? 's' : ''} not found in the rendered formula</span>
        )}
      </div>

      {(readingOpen || active) && (
        <div className={`fx-split${readingOpen && active ? ' two' : ''}`}>
          {readingOpen && (
            <div className="fx-pane" id={paneId}>
              <h5>How to read it</h5>
              {spec.reading && <p className="fx-reading">{spec.reading}</p>}
              {spec.steps.length > 0 && (
                <ol className="fx-steps">
                  {spec.steps.map((s, i) => (
                    <li key={i}><span className="fx-n">{i + 1}</span><span>{s}</span></li>
                  ))}
                </ol>
              )}
              {spec.why && <p className="fx-why" dangerouslySetInnerHTML={{ __html: bold(spec.why) }} />}
            </div>
          )}

          {/* No empty state: the hint above already says to click a symbol, and a
              pane explaining that it has nothing to explain is just a held slot. */}
          {active && (
            <div className="fx-pane fx-insp">
              <h5>This symbol, here</h5>
              <SymbolCard
                sym={active}
                note={active.note}
                siblings={explain?.senses.siblings.get(active.id) ?? []}
                onPickSibling={setSelected}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Open when the pane is showing, shut when it isn't — the icon states the result of clicking. */
function BookIcon({ open }: { open: boolean }) {
  return (
    <svg className="fx-book" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round">
      {open ? (
        <>
          <path d="M8 4.4C7 3.5 5.4 3.1 2.5 3.1v8.4c2.9 0 4.5.4 5.5 1.3" />
          <path d="M8 4.4c1-.9 2.6-1.3 5.5-1.3v8.4c-2.9 0-4.5.4-5.5 1.3" />
          <path d="M8 4.4v8.4" />
        </>
      ) : (
        <>
          <path d="M4.6 2.6h8.8v10.8H4.6z" />
          <path d="M4.6 2.6a1.9 1.9 0 0 0-1.9 1.9v8.9h1.9" />
          <path d="M6.9 6h4.2M6.9 8.6h4.2" />
        </>
      )}
    </svg>
  );
}

/** `why` is prose with **emphasis**; the rest of the spec is plain text. */
function bold(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
}
