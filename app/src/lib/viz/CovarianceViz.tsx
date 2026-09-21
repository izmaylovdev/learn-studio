import { useState } from 'react';
import { Plot, Slider, Readout } from './Plot';

/**
 * An uncertainty ellipse pushed through a constant-velocity step. The point is
 * the tilt: the input ellipse is axis-aligned — position and velocity errors
 * independent — and the output is not, because both of its components now
 * contain the same old velocity. That manufactured correlation is the channel
 * a position measurement later travels along to correct velocity.
 */

/** Polyline of the k-sigma ellipse of a 2×2 covariance, in data coordinates. */
function ellipse(a: number, b: number, c: number, k = 1, n = 96): [number, number][] {
  const tr = a + c;
  const gap = Math.sqrt(Math.max(((a - c) / 2) ** 2 + b * b, 0));
  const l1 = Math.max(tr / 2 + gap, 0);
  const l2 = Math.max(tr / 2 - gap, 0);
  const th = 0.5 * Math.atan2(2 * b, a - c);
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = (2 * Math.PI * i) / n;
    const u = k * Math.sqrt(l1) * Math.cos(t);
    const v = k * Math.sqrt(l2) * Math.sin(t);
    out.push([u * Math.cos(th) - v * Math.sin(th), u * Math.sin(th) + v * Math.cos(th)]);
  }
  return out;
}

export function CovarianceViz() {
  const [dt, setDt] = useState(6);
  const [sv, setSv] = useState(0.25);     // velocity uncertainty, m/s
  const [sa, setSa] = useState(0.06);     // unmodelled acceleration, m/s²

  const sp = 2;                            // position uncertainty, m — held fixed
  const P = [sp * sp, 0, sv * sv];         // [P00, P01, P11]

  // F Σ Fᵀ for F = [[1, Δt], [0, 1]]
  const a0 = P[0] + 2 * dt * P[1] + dt * dt * P[2];
  const b0 = P[1] + dt * P[2];
  const c0 = P[2];

  // …and the process noise from one unknown acceleration
  const q = sa * sa;
  const a1 = a0 + (dt ** 4 / 4) * q;
  const b1 = b0 + (dt ** 3 / 2) * q;
  const c1 = c0 + dt * dt * q;

  const rho = b1 / Math.sqrt(a1 * c1);
  const path = (pts: [number, number][], s: { sx: (v: number) => number; sy: (v: number) => number }) =>
    pts.map(([x, y], i) => `${i ? 'L' : 'M'}${s.sx(x).toFixed(2)} ${s.sy(y).toFixed(2)}`).join('') + 'Z';

  return (
    <div className="viz">
      <Plot xDomain={[-10, 10]} yDomain={[-1, 1]} xLabel="position error (m)" yLabel="velocity error (m/s)" height={250}>
        {(s) => (
          <>
            <path className="viz-prior" d={path(ellipse(P[0], P[1], P[2]), s)} />
            <path className="viz-approx" style={{ fill: 'var(--accent)', fillOpacity: 0.1 }}
                  d={path(ellipse(a1, b1, c1), s)} />
            <line className="viz-sweep" x1={s.sx(-10)} x2={s.sx(10)} y1={s.sy(0)} y2={s.sy(0)} />
            <circle className="viz-point" cx={s.sx(0)} cy={s.sy(0)} r={3} />
          </>
        )}
      </Plot>

      <div className="viz-legend">
        <span><i style={{ background: 'var(--muted)' }} /> before the step</span>
        <span><i style={{ background: 'var(--accent)' }} /> after F, plus Q</span>
      </div>

      <Slider label="Δt (s)" value={dt} min={0} max={10} step={0.5} onChange={setDt} format={(v) => v.toFixed(1)} />
      <Slider label="σᵥ (m/s)" value={sv} min={0.05} max={0.4} step={0.01} onChange={setSv} format={(v) => v.toFixed(2)} />
      <Slider label="σₐ (m/s²)" value={sa} min={0} max={0.25} step={0.01} onChange={setSa} format={(v) => v.toFixed(2)} />

      <Readout items={[
        { label: 'σ position (m)', value: Math.sqrt(a1).toFixed(2) },
        { label: 'σ velocity (m/s)', value: Math.sqrt(c1).toFixed(3) },
        { label: 'correlation ρ', value: rho.toFixed(2), tone: Math.abs(rho) > 0.5 ? 'good' : undefined },
      ]} />

      <p className="viz-note">
        At <code>Δt = 0</code> the two ellipses coincide and the shape is <b>upright</b> — position and velocity
        errors unrelated. Drag Δt out and watch it <b>tilt</b>, not merely grow. Nothing was measured and no noise
        was needed for that: both new components contain the same old velocity, so their errors are forced to move
        together. The correlation readout is the width of the channel a position measurement will later travel
        along to correct a velocity <b>no sensor ever sees</b>. Now push σₐ up. The ellipse grows — and the tilt
        gets <b>stronger</b>, because one unknown acceleration also disturbs both components at once. That is the
        same fact as "a diagonal Q is physically incoherent", seen as a picture.
      </p>
    </div>
  );
}
