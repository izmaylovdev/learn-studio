import { Plot, Readout, samplePath, type Scales } from '../Plot';
import { Scene, type Beat } from '../Scene';

const f = (x: number) => x * x;

/**
 * x³/3 + 1, deliberately *not* the obvious antiderivative. The +1 lifts the
 * lower curve bodily and changes none of the arithmetic, which is the claim
 * "any antiderivative works" shown rather than asserted.
 */
const F = (x: number) => x ** 3 / 3 + 1;

const A = 0;
const B = 2;
const EXACT = F(B) - F(A);           // 8/3

const X: [number, number] = [-0.12, 2.3];
const Y_TOP: [number, number] = [-0.3, 4.5];
const Y_BOT: [number, number] = [-0.2, 4.4];

/** Slice boundaries, and the height that makes each slice's rectangle equal its ΔF. */
function slices(n: number) {
  const d = (B - A) / n;
  return Array.from({ length: n }, (_, i) => {
    const t0 = A + i * d;
    const t1 = t0 + d;
    // The average rate of change across the slice. The MVT says f attains it
    // somewhere inside, so this is a legitimate Riemann sample height — and by
    // construction its rectangle has area exactly F(t1) − F(t0).
    const h = (F(t1) - F(t0)) / d;
    return { t0, t1, d, h, c: Math.sqrt(h) };
  });
}

type S = { n: number; stair: number; rects: number; dots: number };

const BEATS: Beat<S>[] = [
  { label: 'F(b) − F(a)', hold: 2.0,
    state: { n: 4, stair: 0, rects: 0, dots: 0 },
    caption: 'Below is an antiderivative of f — deliberately x³/3 + 1, not the obvious one. The bracket on the right is F(2) − F(0): the single number Part 2 claims the area above equals.' },

  { label: 'slice it', in: 1.5, hold: 2.4,
    state: { n: 4, stair: 1, rects: 0, dots: 0 },
    caption: 'Chop the interval into four. Each slice changes F by some ΔFᵢ — the vertical jumps of the staircase. Chained end to end they run from F(0) to F(2), because every interior value gets added once and subtracted once. That cancellation is exact at any n.' },

  { label: 'each rise is an area', in: 1.5, hold: 2.6,
    state: { n: 4, stair: 1, rects: 1, dots: 1 },
    caption: 'Now the panel above. On each slice there is a height whose rectangle has area exactly that slice’s ΔFᵢ — and the mean value theorem says f genuinely attains it, at the marked points. So the staircase and the rectangles are the same four numbers.' },

  { label: 'refine', in: 1.7, hold: 2.1,
    state: { n: 12, stair: 1, rects: 1, dots: 0.3 },
    caption: 'Refine. The rectangles close in on the true area under f. The rises get smaller, but they still chain to exactly F(2) − F(0).' },

  { label: 'the limit', in: 1.9, hold: 3.0,
    state: { n: 40, stair: 1, rects: 1, dots: 0 },
    caption: 'The rectangles converge to the integral. The right-hand readout has said F(2) − F(0) since n = 4 and has never moved. Two quantities equal at every step — and only one of them ever needed a limit.' },
];

/** The staircase along F: across, then up. The verticals are the ΔFᵢ. */
function stairPath(parts: ReturnType<typeof slices>, s: Scales) {
  let d = `M${s.sx(A).toFixed(2)} ${s.sy(F(A)).toFixed(2)}`;
  for (const p of parts) {
    d += `L${s.sx(p.t1).toFixed(2)} ${s.sy(F(p.t0)).toFixed(2)}`;
    d += `L${s.sx(p.t1).toFixed(2)} ${s.sy(F(p.t1)).toFixed(2)}`;
  }
  return d;
}

export function FTCTelescopeScene() {
  return (
    <Scene
      beats={BEATS}
      render={(s) => {
        const n = Math.max(1, Math.round(s.n));
        const parts = slices(n);
        const sum = parts.reduce((acc, p) => acc + p.h * p.d, 0);

        return (
          <>
            <div className="scene-panel">f(x) = x² — and the rectangles</div>
            <Plot xDomain={X} yDomain={Y_TOP} height={190} xTicks={false}>
              {(sc) => (
                <>
                  {s.rects > 0.01 && parts.map((p) => (
                    <rect key={p.t0} className="viz-bar" opacity={s.rects}
                          x={sc.sx(p.t0)} width={Math.max(0.6, sc.dx(p.d) - 0.6)}
                          y={sc.sy(p.h)} height={Math.max(0, sc.sy(0) - sc.sy(p.h))} />
                  ))}
                  <path className="viz-curve" d={samplePath(f, A, B, sc, Y_TOP)} />
                  {s.dots > 0.01 && parts.map((p) => (
                    <circle key={p.t0} className="viz-point" opacity={s.dots}
                            cx={sc.sx(p.c)} cy={sc.sy(p.h)} r={3} />
                  ))}
                </>
              )}
            </Plot>

            <div className="scene-panel">F(x) = x³/3 + 1 — and its rises</div>
            <Plot xDomain={X} yDomain={Y_BOT} height={190} xLabel="x">
              {(sc) => (
                <>
                  <path className="viz-ghost" d={samplePath(F, A, B, sc, Y_BOT)} />
                  {s.stair > 0.01 && (
                    <>
                      <path className="viz-stair" d={stairPath(parts, sc)} opacity={s.stair} />
                      {parts.map((p) => (
                        <line key={p.t0} className="viz-rise" opacity={s.stair}
                              x1={sc.sx(p.t1)} x2={sc.sx(p.t1)}
                              y1={sc.sy(F(p.t0))} y2={sc.sy(F(p.t1))} />
                      ))}
                    </>
                  )}

                  {/* The target, drawn once and never moving: everything the
                      slicing does has to land back on this same bracket. */}
                  <line className="viz-limit" x1={sc.sx(2.16)} x2={sc.sx(2.16)}
                        y1={sc.sy(F(A))} y2={sc.sy(F(B))} />
                  {[F(A), F(B)].map((v) => (
                    <line key={v} className="viz-limit"
                          x1={sc.sx(2.1)} x2={sc.sx(2.22)} y1={sc.sy(v)} y2={sc.sy(v)} />
                  ))}
                  <circle className="viz-dot" cx={sc.sx(A)} cy={sc.sy(F(A))} r={3} />
                  <circle className="viz-dot" cx={sc.sx(B)} cy={sc.sy(F(B))} r={3} />
                </>
              )}
            </Plot>

            <Readout items={[
              { label: 'slices n', value: String(n) },
              { label: 'Σ of the rectangles', value: sum.toFixed(4) },
              { label: 'F(2) − F(0)', value: EXACT.toFixed(4) },
              { label: 'difference', value: Math.abs(sum - EXACT) < 5e-12 ? '0 — exactly' : Math.abs(sum - EXACT).toExponential(1),
                tone: 'good' },
            ]} />
          </>
        );
      }}
      note={
        <>
          The difference readout is <b>zero at every n</b>, not just in the limit — that is the point.
          Telescoping makes <code>Σ ΔFᵢ = F(b) − F(a)</code> an identity, and the mean value theorem
          turns each ΔFᵢ into a rectangle. The limit is only needed for the <em>other</em> claim: that
          those rectangles approach the integral. Compare with the <b>+1</b> in the antiderivative —
          it moves the lower curve and nothing else, because it cancels in the subtraction.
        </>
      }
    />
  );
}
