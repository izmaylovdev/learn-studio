import { useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { Mermaid } from './Mermaid';
import { Viz } from './viz';
import { FormulaExplorer } from './formula/FormulaExplorer';
import { useMaybeExplain } from './formula/MathExplain';
import { useLiveMath } from './formula/liveMath';
import { buildSenses } from './formula/senses';
import { Boundary } from './Boundary';
import type { Formula } from '../types';
import type { Check } from '../types';
import { useT } from './i18n';

const CHECK_BLOCK = /^:::check\s*\n([\s\S]*?)\n?:::\s*$/gm;
const WIKILINK = /\[\[([a-z0-9][a-z0-9-]*)(?:\|([^\]]+))?\]\]/g;
const INLINE_DISPLAY_MATH = /^\$\$(?!\$)(.+?)\$\$[ \t]*$/gm;
const FORMULA_FENCE = /^```formula[ \t]*\n([\s\S]*?)\n```[ \t]*$/gm;

type Segment = { kind: 'md'; text: string } | { kind: 'check'; question: string };

/** Splits `:::check` blocks out of the body so they render as interactive cards. */
function segment(body: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of body.matchAll(CHECK_BLOCK)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ kind: 'md', text: body.slice(last, at) });
    out.push({ kind: 'check', question: m[1].trim() });
    last = at + m[0].length;
  }
  if (last < body.length) out.push({ kind: 'md', text: body.slice(last) });
  return out;
}

/**
 * remark-math only treats `$$` as display math when it fences its own lines;
 * a whole line of `$$…$$` parses as *inline* math and renders cramped. Accept
 * both spellings so authoring style can't silently degrade an equation.
 */
/** A whole fenced block, opening line to closing line. */
const FENCE = /^```[\s\S]*?^```[ \t]*$/gm;

/**
 * Run a text rewrite on prose only. Fenced blocks are source, not markdown:
 * rewriting a `[[wikilink]]` inside one corrupts a code sample, and for a
 * `formula` block it also changes the text the parsed spec is keyed by, which
 * silently detaches the spec from its block.
 */
function outsideFences(text: string, fn: (s: string) => string) {
  let out = '';
  let last = 0;
  for (const m of text.matchAll(FENCE)) {
    out += fn(text.slice(last, m.index)) + m[0];
    last = m.index! + m[0].length;
  }
  return out + fn(text.slice(last));
}

function fenceDisplayMath(text: string) {
  return text.replace(INLINE_DISPLAY_MATH, (_all, body: string) => `$$\n${body.trim()}\n$$`);
}

/** `[[id]]` / `[[id|label]]` become links the anchor renderer turns into chips. */
function linkify(text: string, titles: Map<string, string>) {
  return text.replace(WIKILINK, (_all, id: string, label?: string) => {
    const known = titles.has(id);
    const shown = label ?? titles.get(id) ?? id;
    return `[${shown}](#/c/${id}${known ? '' : '?dead=1'})`;
  });
}

export function Markdown({
  body, titles, theme, onGrade, answers = [], formulas = [],
}: {
  body: string;
  titles: Map<string, string>;
  theme: 'dark' | 'light';
  onGrade?: (grade: number) => void;
  answers?: Check[];
  formulas?: (Formula | null)[];
}) {
  const t = useT();
  const segments = useMemo(() => segment(body), [body]);
  let checkIndex = 0;

  // Every formula on the page is clickable, not just the `formula` blocks:
  // display equations get their symbols annotated in place, maths in a sentence
  // opens the same drawer as a whole. Without a provider (a preview, a test)
  // the prose simply renders inert.
  const explain = useMaybeExplain();
  const fallback = useMemo(() => buildSenses(null), []);
  const host = useRef<HTMLDivElement>(null);
  useLiveMath(host, explain?.senses ?? fallback, explain?.open ?? noop);

  // KaTeX output is annotated by mutating it, so a body change has to bring a
  // fresh subtree rather than a patched one — React must not try to reconcile
  // nodes that have had spans spliced into them.
  const generation = useMemo(() => hash(body), [body]);

  // Formula specs are parsed server-side and arrive in document order. Pair them
  // to blocks by the fence's own text rather than a render-time counter — the
  // counter is only correct if every block renders exactly once, in order, which
  // is not something a component can promise.
  const formulaSlot = useMemo(() => {
    const map = new Map<string, number>();
    let i = 0;
    for (const m of body.matchAll(FORMULA_FENCE)) map.set(m[1].trim(), i++);
    return map;
  }, [body]);

  return (
    <div className="prose" ref={host}>
      {segments.map((seg, i) => {
        if (seg.kind === 'check') {
          const answer = answers[checkIndex++]?.a ?? '';
          return <CheckCard key={`${generation}:${i}`} question={seg.question} answer={answer} onGrade={onGrade} />;
        }
        return (
          <ReactMarkdown
            key={`${generation}:${i}`}
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, [rehypeHighlight, { ignoreMissing: true, detect: false }]]}
            components={{
              a({ href, children, ...rest }) {
                if (href?.startsWith('#/c/')) {
                  const dead = href.includes('?dead=1');
                  return (
                    <a className={`xref${dead ? ' dead' : ''}`} href={href.split('?')[0]} {...rest}>
                      {children}
                    </a>
                  );
                }
                return <a href={href} target="_blank" rel="noreferrer" {...rest}>{children}</a>;
              },
              code({ className, children, ...rest }) {
                const lang = /language-(\w+)/.exec(className ?? '')?.[1];
                if (lang === 'mermaid') return <Mermaid chart={String(children).trim()} theme={theme} />;
                if (lang === 'viz') {
                  return <Boundary label={t('thisFigure')}><Viz source={String(children)} /></Boundary>;
                }
                if (lang === 'formula') {
                  const slot = formulaSlot.get(String(children).trim());
                  return (
                    <Boundary label={t('thisExplorer')}>
                      <FormulaExplorer spec={slot === undefined ? null : formulas[slot] ?? null}
                                       reason={slot === undefined ? 'unmatched' : 'parse'} />
                    </Boundary>
                  );
                }
                return <code className={className} {...rest}>{children}</code>;
              },
              pre({ children }) {
                // Diagrams and figures replace the whole block — don't nest them in <pre>.
                const only = Array.isArray(children) ? children[0] : children;
                const cls = (only as { props?: { className?: string } })?.props?.className ?? '';
                if (cls.includes('language-mermaid') || cls.includes('language-viz') || cls.includes('language-formula')) return <>{children}</>;
                const lang = /language-(\w+)/.exec(cls)?.[1];
                return <pre data-lang={lang}>{children}</pre>;
              },
            }}
          >
            {outsideFences(seg.text, (t) => fenceDisplayMath(linkify(t, titles)))}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}

function noop() { /* no provider: formulas render, they just do not open */ }

/** Cheap content fingerprint, used only to force a remount when the body changes. */
function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  return h.toString(36);
}

/** Check questions carry inline code and math, so they get the full pipeline too. */
function Inline({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{ p: ({ children }) => <>{children}</> }}
    >
      {text}
    </ReactMarkdown>
  );
}

function CheckCard({
  question, answer, onGrade,
}: { question: string; answer: string; onGrade?: (g: number) => void }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [graded, setGraded] = useState<number | null>(null);

  return (
    <div className="check">
      <div className="label">{t('recallCheck')}</div>
      <div className="q"><Inline text={question} /></div>
      {open ? (
        <>
          {answer ? <div className="a"><Inline text={answer} /></div> : null}
          <div className="grades">
            {graded === null ? (
              <>
                <button className="grade-btn miss" onClick={() => { setGraded(1); onGrade?.(1); }}>{t('missedIt')}</button>
                <button className="grade-btn" onClick={() => { setGraded(3); onGrade?.(3); }}>{t('hard')}</button>
                <button className="grade-btn" onClick={() => { setGraded(4); onGrade?.(4); }}>{t('good')}</button>
                <button className="grade-btn" onClick={() => { setGraded(5); onGrade?.(5); }}>{t('easy')}</button>
              </>
            ) : (
              <span className="saved">{t('graded')}</span>
            )}
          </div>
        </>
      ) : (
        <div className="grades">
          <button className="grade-btn" onClick={() => setOpen(true)}>
            {t(answer ? 'showAnswer' : 'gradeMyself')}
          </button>
        </div>
      )}
    </div>
  );
}
