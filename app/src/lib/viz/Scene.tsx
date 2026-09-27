import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useT } from '../i18n';

/**
 * A choreographed figure: a list of keyframes the engine morphs between on a
 * clock, with a caption per beat.
 *
 * This is the counterpart to the slider figures, not a replacement. A slider
 * hands the learner the controls and hopes they find the insight; a scene walks
 * them to it and *then* hands over the controls. Use a scene when the point is
 * a transformation ("watch this become that"), a slider when the point is a
 * relationship worth poking at.
 *
 * State is numbers only, and every number is interpolated. Anything else the
 * figure needs — colours, visibility, labels — is derived from those numbers,
 * so there is no such thing as a value that jumps when it should have eased.
 */
export type SceneState = Record<string, number>;

export interface Beat<S extends SceneState> {
  /** Seconds spent morphing from the previous beat into this one. Ignored on the first beat. */
  in?: number;
  /** Seconds resting on this beat once reached. */
  hold?: number;
  /** Shown while morphing into this beat and for the whole of its hold. */
  caption?: ReactNode;
  /** Short name for the chapter strip. */
  label?: ReactNode;
  state: S;
  ease?: (t: number) => number;
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const easeOut = (t: number) => 1 - (1 - t) ** 3;
export const linear = (t: number) => t;

/** Clamp to [0,1] and map through an ease. */
const shape = (p: number, ease: (t: number) => number) => ease(Math.max(0, Math.min(1, p)));

interface Span { i: number; start: number; morph: number; hold: number }

function layout(beats: Beat<SceneState>[]) {
  const spans: Span[] = [];
  let t = 0;
  beats.forEach((b, i) => {
    const morph = i === 0 ? 0 : b.in ?? 1.2;
    const hold = b.hold ?? 1;
    spans.push({ i, start: t, morph, hold });
    t += morph + hold;
  });
  return { spans, total: t };
}

/** Which beat the playhead is in, and how far into its morph. */
function at(spans: Span[], t: number) {
  let span = spans[0];
  for (const s of spans) {
    if (t >= s.start) span = s;
    else break;
  }
  const local = t - span.start;
  return { i: span.i, p: span.morph > 0 ? Math.min(1, local / span.morph) : 1 };
}

function blend<S extends SceneState>(from: S, to: S, p: number): S {
  const out: SceneState = {};
  for (const k of Object.keys(to)) out[k] = lerp(from[k] ?? to[k], to[k], p);
  return out as S;
}

function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

export interface SceneCtx {
  /** index of the beat being morphed into */ i: number;
  /** eased progress of that morph, 1 once it is holding */ p: number;
  t: number;
  total: number;
  playing: boolean;
}

export function Scene<S extends SceneState>({
  beats, render, note,
}: {
  beats: Beat<S>[];
  render: (state: S, ctx: SceneCtx) => ReactNode;
  note?: ReactNode;
}) {
  const tr = useT();
  const { spans, total } = useMemo(() => layout(beats as Beat<SceneState>[]), [beats]);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [armed, setArmed] = useState(true);
  const reduced = usePrefersReducedMotion();

  const host = useRef<HTMLDivElement>(null);
  const tRef = useRef(0);
  const raf = useRef<number | null>(null);

  const seek = useCallback((v: number) => {
    tRef.current = Math.max(0, Math.min(total, v));
    setT(tRef.current);
  }, [total]);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const step = (now: number) => {
      // Clamp dt: a backgrounded tab resumes with a huge gap, and without this
      // the scene teleports past the beat the reader was looking at.
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      tRef.current = Math.min(total, tRef.current + dt);
      setT(tRef.current);
      if (tRef.current >= total) { setPlaying(false); return; }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current !== null) cancelAnimationFrame(raf.current); };
  }, [playing, total]);

  // Start when it is actually on screen. A scene that played while scrolled out
  // of view has already spent its one chance to explain itself.
  useEffect(() => {
    if (!armed || reduced) return;
    const el = host.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.intersectionRatio >= 0.5)) {
        setArmed(false);
        setPlaying(true);
        io.disconnect();
      }
    }, { threshold: [0.5] });
    io.observe(el);
    return () => io.disconnect();
  }, [armed, reduced]);

  const ended = t >= total - 1e-6;
  const toggle = () => {
    setArmed(false);
    if (playing) { setPlaying(false); return; }
    if (ended) seek(0);
    setPlaying(true);
  };

  const { i, p } = at(spans, t);
  const beat = beats[i];
  const eased = shape(p, beat.ease ?? easeInOut);
  const state = i === 0 ? beat.state : blend(beats[i - 1].state, beat.state, eased);

  return (
    <div className="viz scene" ref={host}>
      {render(state, { i, p: eased, t, total, playing })}

      <div className="scene-caption" key={i}>{beat.caption}</div>

      <div className="scene-transport">
        <button className="scene-play" onClick={toggle}
                aria-label={tr(playing ? 'pause' : ended ? 'replay' : 'play')}>
          {playing ? '❚❚' : ended ? '↻' : '▶'}
        </button>
        <input
          className="scene-scrub" type="range" min={0} max={total} step={0.01} value={t}
          aria-label={tr('scrub')}
          onChange={(e) => { setPlaying(false); setArmed(false); seek(Number(e.target.value)); }}
        />
        <span className="scene-time">{t.toFixed(1)}s</span>
      </div>

      {/* Jumping plays *into* the beat rather than landing on it: the morph is
          the content, and a button that cut straight to the end state would
          skip the only part that explains how you got there. */}
      <div className="scene-chapters">
        {beats.map((b, k) => (
          <button key={k} className={k === i ? 'on' : ''}
                  onClick={() => { setArmed(false); seek(spans[k].start); setPlaying(true); }}>
            {b.label ?? String(k + 1)}
          </button>
        ))}
      </div>

      {note ? <p className="viz-note">{note}</p> : null}
    </div>
  );
}

/**
 * A path that draws itself. `pathLength={1}` renormalises the dash units so the
 * dash array is just the progress — no measuring the DOM node to find its length.
 */
export function DrawPath({
  d, p, className, ...rest
}: { d: string; p: number; className?: string } & Record<string, unknown>) {
  return (
    <path
      className={className} d={d} pathLength={1}
      strokeDasharray={`${Math.max(0, Math.min(1, p))} 1`}
      {...rest}
    />
  );
}
