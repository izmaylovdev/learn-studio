import { useId, useMemo } from 'react';
import { Plot, Readout, samplePath } from '../Plot';
import { Scene, DrawPath, type Beat } from '../Scene';

const fact: number[] = [1];
for (let i = 1; i <= 40; i++) fact[i] = fact[i - 1] * i;

/** Maclaurin coefficient of xᵏ in sin x — zero on every even power. */
const c = (k: number) => (k % 2 === 0 ? 0 : (-1) ** ((k - 1) / 2) / fact[k]);

/** The degrees the scene stops at. Even degrees add nothing to sin, so stepping
 *  through them would spend a beat showing the curve not move. */
const STEPS = [1, 3, 5, 7, 9, 13];

/**
 * Taylor polynomial at a *fractional* index: everything up to STEPS[j] at full
 * strength, plus the next block faded in by `w`. Interpolating the coefficients
 * rather than swapping polynomials is what makes the curve bend into its next
 * shape instead of cutting to it.
 */
function poly(x: number, u: number) {
  const j = Math.max(0, Math.min(STEPS.length - 1, Math.floor(u)));
  const w = u - j;
  const lo = STEPS[j];
  const hi = STEPS[Math.min(j + 1, STEPS.length - 1)];
  let sum = 0;
  for (let k = 0; k <= lo; k++) sum += c(k) * x ** k;
  for (let k = lo + 1; k <= hi; k++) sum += w * c(k) * x ** k;
  return sum;
}

/** How far out from the origin f and T stay within `tol` of each other. */
function agreementRadius(u: number, limit: number, tol = 0.02) {
  for (let r = 0; r <= limit; r += 0.05) {
    if (Math.abs(Math.sin(r) - poly(r, u)) > tol) return r;
  }
  return limit;
}

type S = { draw: number; u: number; show: number; xhi: number; yhi: number };

const BEATS: Beat<S>[] = [
  { label: 'sin x', hold: 0.5,
    state: { draw: 0, u: 0, show: 0, xhi: 7, yhi: 2.4 },
    caption: 'Here is sin x.' },

  { label: 'the curve', in: 1.2, hold: 1.6,
    state: { draw: 1, u: 0, show: 0, xhi: 7, yhi: 2.4 },
    caption: 'It wiggles forever. Nothing polynomial about it — a degree-N polynomial has at most N roots, and this has infinitely many.' },

  { label: 'T₁', in: 1.0, hold: 1.7,
    state: { draw: 1, u: 0, show: 1, xhi: 7, yhi: 2.4 },
    caption: 'T₁ = x. The tangent at the origin: right value, right slope, wrong everything else.' },

  { label: 'T₃', in: 1.3, hold: 1.7,
    state: { draw: 1, u: 1, show: 1, xhi: 7, yhi: 2.4 },
    caption: 'Subtract x³/6 and the line bends down to catch the first hump. Watch where it bends: near 0 the new term is negligible, so it changes nothing there.' },

  { label: 'T₅', in: 1.2, hold: 1.5,
    state: { draw: 1, u: 2, show: 1, xhi: 7, yhi: 2.4 },
    caption: 'Add x⁵/120. Every term is a correction that sleeps near the origin and wakes up further out — that is the xᵏ factor doing its work.' },

  { label: 'T₁₃', in: 1.9, hold: 1.8,
    state: { draw: 1, u: 5, show: 1, xhi: 7, yhi: 2.4 },
    caption: 'Keep going and the agreement creeps outward from the centre. It never gets better at the centre — it was already exact there.' },

  { label: 'the catch', in: 1.7, hold: 2.6,
    state: { draw: 1, u: 5, show: 1, xhi: 17, yhi: 9 },
    caption: 'Now pull the camera back. T₁₃ was never a copy of sin x — it is a polynomial, and polynomials run away. sin x has infinite radius of convergence, but the degree you stopped at still has a horizon.' },
];

export function TaylorScene() {
  const clip = useId().replace(/:/g, '');
  const beats = useMemo(() => BEATS, []);

  return (
    <Scene
      beats={beats}
      render={(s) => {
        const x0 = -s.xhi;
        const x1 = s.xhi;
        const y: [number, number] = [-s.yhi, s.yhi];
        const r = s.show > 0.5 ? agreementRadius(s.u, s.xhi) : 0;

        return (
          <>
            <Plot xDomain={[x0, x1]} yDomain={y} xLabel="x" height={250}>
              {(sc) => (
                <>
                  <defs>
                    <clipPath id={clip}>
                      <rect x={sc.sx(x0)} y={sc.top}
                            width={sc.sx(x1) - sc.sx(x0)} height={sc.bottom - sc.top} />
                    </clipPath>
                  </defs>

                  {r > 0 && (
                    <rect className="viz-band" x={sc.sx(-r)} width={Math.max(0, sc.sx(r) - sc.sx(-r))}
                          y={sc.top} height={sc.bottom - sc.top} opacity={s.show} />
                  )}

                  <g clipPath={`url(#${clip})`}>
                    <DrawPath className="viz-curve" d={samplePath(Math.sin, x0, x1, sc, y, 400)} p={s.draw} />
                    <path className="viz-approx" opacity={s.show}
                          d={samplePath((x) => poly(x, s.u), x0, x1, sc, y, 400)} />
                  </g>

                  <circle className="viz-point" cx={sc.sx(0)} cy={sc.sy(0)} r={3.5} opacity={s.show} />
                </>
              )}
            </Plot>

            <Readout items={[
              { label: 'degree', value: s.show < 0.5 ? '—' : String(Math.round(STEPS[Math.min(STEPS.length - 1, Math.round(s.u))])) },
              { label: 'agrees to ±0.02 out to', value: r <= 0 ? '—' : `|x| ≈ ${r.toFixed(1)}`, tone: r > 4 ? 'good' : undefined },
              { label: 'window', value: `±${s.xhi.toFixed(0)}` },
            ]} />
          </>
        );
      }}
      note={
        <>
          The shaded band is where the polynomial is within <b>0.02</b> of sin&nbsp;x. It grows with
          the degree — always outward from the centre, never uniformly — which is the
          <code>|x−a|<sup>N+1</sup></code> factor in the remainder bound, made visible. Scrub back
          and forth to compare any two degrees directly.
        </>
      }
    />
  );
}
