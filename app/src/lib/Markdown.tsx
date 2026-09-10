import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { Mermaid } from './Mermaid';
import { Viz } from './viz';
import type { Check } from '../types';

const CHECK_BLOCK = /^:::check\s*\n([\s\S]*?)\n?:::\s*$/gm;
const WIKILINK = /\[\[([a-z0-9][a-z0-9-]*)(?:\|([^\]]+))?\]\]/g;
const INLINE_DISPLAY_MATH = /^\$\$(?!\$)(.+?)\$\$[ \t]*$/gm;

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
  body, titles, theme, onGrade, answers = [],
}: {
  body: string;
  titles: Map<string, string>;
  theme: 'dark' | 'light';
  onGrade?: (grade: number) => void;
  answers?: Check[];
}) {
  const segments = useMemo(() => segment(body), [body]);
  let checkIndex = 0;

  return (
    <div className="prose">
      {segments.map((seg, i) => {
        if (seg.kind === 'check') {
          const answer = answers[checkIndex++]?.a ?? '';
          return <CheckCard key={i} question={seg.question} answer={answer} onGrade={onGrade} />;
        }
        return (
          <ReactMarkdown
            key={i}
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
                if (lang === 'viz') return <Viz source={String(children)} />;
                return <code className={className} {...rest}>{children}</code>;
              },
              pre({ children }) {
                // Diagrams and figures replace the whole block — don't nest them in <pre>.
                const only = Array.isArray(children) ? children[0] : children;
                const cls = (only as { props?: { className?: string } })?.props?.className ?? '';
                if (cls.includes('language-mermaid') || cls.includes('language-viz')) return <>{children}</>;
                const lang = /language-(\w+)/.exec(cls)?.[1];
                return <pre data-lang={lang}>{children}</pre>;
              },
            }}
          >
            {fenceDisplayMath(linkify(seg.text, titles))}
          </ReactMarkdown>
        );
      })}
    </div>
  );
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
  const [open, setOpen] = useState(false);
  const [graded, setGraded] = useState<number | null>(null);

  return (
    <div className="check">
      <div className="label">recall check</div>
      <div className="q"><Inline text={question} /></div>
      {open ? (
        <>
          {answer ? <div className="a"><Inline text={answer} /></div> : null}
          <div className="grades">
            {graded === null ? (
              <>
                <button className="grade-btn miss" onClick={() => { setGraded(1); onGrade?.(1); }}>Missed it</button>
                <button className="grade-btn" onClick={() => { setGraded(3); onGrade?.(3); }}>Hard</button>
                <button className="grade-btn" onClick={() => { setGraded(4); onGrade?.(4); }}>Good</button>
                <button className="grade-btn" onClick={() => { setGraded(5); onGrade?.(5); }}>Easy</button>
              </>
            ) : (
              <span className="saved">graded — next review rescheduled</span>
            )}
          </div>
        </>
      ) : (
        <div className="grades">
          <button className="grade-btn" onClick={() => setOpen(true)}>
            {answer ? 'Show answer' : 'Answered it — grade myself'}
          </button>
        </div>
      )}
    </div>
  );
}
