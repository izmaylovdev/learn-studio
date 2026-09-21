import {
  createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import katex from 'katex';
import type { Graph, MathTarget, Symbol_ } from '../../types';
import { annotate, paint } from './annotate';
import { buildSenses, type Senses } from './senses';
import { SymbolCard } from './SymbolCard';
import { KIND_NAME, KIND_ORDER } from './kinds';

/**
 * Every formula the reader meets can be taken apart, not just the ones an
 * author wrote a `formula` block for. A `formula` block is a full explorer with
 * its own reading pane; everything else — a display equation, a bit of maths
 * inside a sentence — opens this drawer instead, so the page stays prose and
 * the explanation arrives beside it.
 */
interface Explain {
  senses: Senses;
  open: (target: MathTarget) => void;
  close: () => void;
  coloured: boolean;
  setColoured: (on: boolean) => void;
}

const ExplainCtx = createContext<Explain | null>(null);

/** Colour-coding by kind is one preference, shared by every formula on screen. */
function useColourPref() {
  const [coloured, setColoured] = useState(() => {
    try { return localStorage.getItem('fx:colour') !== '0'; } catch { return true; }
  });
  useEffect(() => {
    try { localStorage.setItem('fx:colour', coloured ? '1' : '0'); } catch { /* private mode */ }
    document.documentElement.classList.toggle('maths-coloured', coloured);
  }, [coloured]);
  return [coloured, setColoured] as const;
}

export function ExplainProvider({
  graph, scope, children,
}: {
  graph: Graph | null;
  /** the concept being read, which decides which sense of a reused glyph wins */
  scope?: string | null;
  children: React.ReactNode;
}) {
  const [target, setTarget] = useState<MathTarget | null>(null);
  const [coloured, setColoured] = useColourPref();
  const senses = useMemo(() => buildSenses(graph, scope), [graph, scope]);

  const open = useCallback((next: MathTarget) => setTarget(next), []);
  const close = useCallback(() => setTarget(null), []);

  // Walking away from the page the formula came from should not leave its
  // explanation hanging around.
  useEffect(() => { setTarget(null); }, [scope]);

  const value = useMemo<Explain>(
    () => ({ senses, open, close, coloured, setColoured }),
    [senses, open, close, coloured, setColoured]
  );

  return (
    <ExplainCtx.Provider value={value}>
      {children}
      {target && <MathDrawer target={target} senses={senses} coloured={coloured}
                             setColoured={setColoured} onClose={close} />}
    </ExplainCtx.Provider>
  );
}

export function useExplain() {
  const ctx = useContext(ExplainCtx);
  if (!ctx) throw new Error('useExplain outside an ExplainProvider');
  return ctx;
}

/** Available without a provider, for surfaces that only need the lexicon. */
export function useMaybeExplain() {
  return useContext(ExplainCtx);
}

function MathDrawer({
  target, senses, coloured, setColoured, onClose,
}: {
  target: MathTarget;
  senses: Senses;
  coloured: boolean;
  setColoured: (on: boolean) => void;
  onClose: () => void;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(target.symbol);
  const [order, setOrder] = useState<string[]>([]);

  const html = useMemo(() => {
    try {
      return katex.renderToString(target.tex, { displayMode: true, throwOnError: false, output: 'html' });
    } catch {
      return '';
    }
  }, [target.tex]);

  useLayoutEffect(() => {
    if (!stage.current) return;
    stage.current.innerHTML = html; // annotation is destructive; always start clean
    const { found } = annotate(stage.current, senses.ordered);
    setOrder(found);
    setSelected(target.symbol && found.includes(target.symbol) ? target.symbol : null);
  }, [html, senses, target]);

  useEffect(() => {
    if (stage.current) paint(stage.current, selected, new Set());
  }, [selected, order]);

  const step = useCallback((dir: 1 | -1) => {
    setSelected((prev) => {
      if (!order.length) return prev;
      const at = prev ? order.indexOf(prev) : -1;
      return order[(at + dir + order.length) % order.length];
    });
  }, [order]);

  // Escape closes and the arrows walk the line, wherever the focus happens to
  // be — the reader's hands are on the page, not in the drawer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      // The event can come from the window itself, which has no `closest`.
      const el = e.target instanceof HTMLElement ? e.target : null;
      if (el?.closest('input, textarea')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [onClose, step]);

  const active = selected ? senses.byId.get(selected) ?? null : null;
  const inLine: Symbol_[] = order.map((id) => senses.byId.get(id)!).filter(Boolean);
  const kinds = KIND_ORDER.filter((k) => inLine.some((s) => s.kind === k));

  const onPick = (e: React.MouseEvent | React.KeyboardEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('.fx-tok');
    if (!el?.dataset.sym) return;
    setSelected((prev) => (prev === el.dataset.sym ? null : el.dataset.sym!));
  };

  return (
    <aside className={`mx-drawer${coloured ? ' coloured' : ''}`} role="dialog"
           aria-label="What this formula says">
      <header className="mx-head">
        <div>
          <div className="mx-eyebrow">{target.title ? 'Formula' : 'This formula'}</div>
          {target.title && <div className="mx-title">{target.title}</div>}
        </div>
        <label className="fx-toggle">
          <input type="checkbox" checked={coloured} onChange={(e) => setColoured(e.target.checked)} />
          colour
        </label>
        <button className="mx-close" onClick={onClose} aria-label="Close">✕</button>
      </header>

      <div
        className="mx-stage"
        ref={stage}
        onClick={onPick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(e); } }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {inLine.length > 0 && (
        <div className="mx-strip">
          {inLine.map((s) => (
            <button
              key={s.id}
              className={`mx-pip${selected === s.id ? ' on' : ''}`}
              data-kind={s.kind}
              title={s.name}
              onClick={() => setSelected((prev) => (prev === s.id ? null : s.id))}
            >
              {s.glyph}
            </button>
          ))}
        </div>
      )}

      <div className="mx-scroll">
        {active ? (
          <SymbolCard
            sym={active}
            siblings={senses.siblings.get(active.id) ?? []}
            onPickSibling={(id) => setSelected(id)}
          />
        ) : (
          <div className="mx-empty">
            <p>
              {inLine.length
                ? <>This line uses <b>{inLine.length}</b> mark{inLine.length > 1 ? 's' : ''} the lexicon
                    knows. Click one — in the formula or in the row above — to see what it is doing here.</>
                : <>Nothing in this line is in the lexicon yet. <code>npm run index</code> lists the marks
                    that have no entry.</>}
            </p>
            <p className="mx-aside">
              Anything typeset as maths on the page opens here, including the bits
              inside a sentence — they highlight as you pass over them.
            </p>
            {kinds.length > 0 && (
              <div className="mx-legend">
                {kinds.map((k) => (
                  <span key={k} data-kind={k}><i />{KIND_NAME[k]}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="mx-foot">
        <span><kbd>←</kbd> <kbd>→</kbd> step · <kbd>esc</kbd> close</span>
        <a href="#/lexicon">Full lexicon →</a>
      </footer>
    </aside>
  );
}
