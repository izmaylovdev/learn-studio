import { useState } from 'react';
import { Plot, Slider, Choice, Readout, samplePath } from './Plot';
import { L, useTr } from '../i18n';

const fact: number[] = [1];
for (let i = 1; i <= 30; i++) fact[i] = fact[i - 1] * i;

interface Spec {
  label: string;
  f: (x: number) => number;
  /** coefficient of xᵏ in the Maclaurin series */
  c: (k: number) => number;
  radius: number;
  x: [number, number];
  y: [number, number];
}

const FNS: Record<string, Spec> = {
  sin: { label: 'sin x', f: Math.sin, radius: Infinity, x: [-8, 8], y: [-2.2, 2.2],
    c: (k) => (k % 2 === 0 ? 0 : ((-1) ** ((k - 1) / 2)) / fact[k]) },
  cos: { label: 'cos x', f: Math.cos, radius: Infinity, x: [-8, 8], y: [-2.2, 2.2],
    c: (k) => (k % 2 === 1 ? 0 : ((-1) ** (k / 2)) / fact[k]) },
  exp: { label: 'eˣ', f: Math.exp, radius: Infinity, x: [-3, 3], y: [-2, 12],
    c: (k) => 1 / fact[k] },
  log: { label: 'ln(1+x)', f: (x) => Math.log(1 + x), radius: 1, x: [-1.6, 1.6], y: [-3, 1.6],
    c: (k) => (k === 0 ? 0 : ((-1) ** (k + 1)) / k) },
  geom: { label: '1/(1−x)', f: (x) => 1 / (1 - x), radius: 1, x: [-1.6, 1.6], y: [-3, 6],
    c: () => 1 },
};
type Key = keyof typeof FNS;

/** Taylor polynomials closing in on a function, and failing outside the radius. */
export function TaylorViz() {
  const tr = useTr();
  const [key, setKey] = useState<Key>('sin');
  const [N, setN] = useState(3);

  const spec = FNS[key];
  const T = (x: number) => {
    let sum = 0;
    for (let k = 0; k <= N; k++) sum += spec.c(k) * x ** k;
    return sum;
  };

  // Worst error over the visible window, and over the radius when it is finite.
  const probe = (lo: number, hi: number) => {
    let worst = 0;
    for (let i = 0; i <= 200; i++) {
      const x = lo + ((hi - lo) * i) / 200;
      const d = Math.abs(spec.f(x) - T(x));
      if (Number.isFinite(d)) worst = Math.max(worst, d);
    }
    return worst;
  };
  const inner = Math.min(spec.radius === Infinity ? 2 : spec.radius * 0.9, 2);
  const nearErr = probe(-inner, inner);

  return (
    <div className="viz">
      <div className="viz-controls">
        <Choice value={key} onChange={setKey}
                options={(Object.keys(FNS) as Key[]).map((k) => ({ value: k, label: FNS[k].label }))} />
      </div>

      <Plot xDomain={spec.x} yDomain={spec.y} xLabel="x" height={250}>
        {(s) => (
          <>
            {Number.isFinite(spec.radius) && (
              <>
                <rect className="viz-band" x={s.sx(-spec.radius)} width={s.sx(spec.radius) - s.sx(-spec.radius)}
                      y={s.top} height={s.bottom - s.top} />
                {[-spec.radius, spec.radius].map((r) => (
                  <line key={r} className="viz-marker" x1={s.sx(r)} x2={s.sx(r)} y1={s.top} y2={s.bottom} />
                ))}
              </>
            )}
            <path className="viz-curve" d={samplePath(spec.f, spec.x[0], spec.x[1], s, spec.y)} />
            <path className="viz-approx" d={samplePath(T, spec.x[0], spec.x[1], s, spec.y)} />
            <circle className="viz-point" cx={s.sx(0)} cy={s.sy(spec.f(0))} r={3.5} />
          </>
        )}
      </Plot>

      <Slider label={tr('degree N', 'степінь N')} value={N} min={0} max={16} onChange={setN} />

      <Readout items={[
        { label: tr('terms used', 'членів ряду'), value: String(N + 1) },
        { label: tr(`max |f − T| on |x|≤${inner}`, `max |f − T| при |x|≤${inner}`), value: nearErr < 1e-6 ? '<1e-6' : nearErr.toFixed(4),
          tone: nearErr < 0.01 ? 'good' : 'warn' },
        { label: tr('radius R', 'радіус R'), value: spec.radius === Infinity ? '∞' : String(spec.radius) },
      ]} />

      <p className="viz-note">
        <L
          en={<>
            The solid curve is <b>f</b>, the accent curve is <b>T<sub>N</sub></b>. They agree near the centre and
            peel apart as you move away — which is the <code>|x−a|<sup>N+1</sup></code> factor in the error bound,
            made visible. For <b>ln(1+x)</b> and <b>1/(1−x)</b> the shaded band is the radius of convergence:
            raising N inside it helps, and outside it the polynomial diverges no matter how many terms you add.
          </>}
          uk={<>
            Суцільна крива — це <b>f</b>, виділена — <b>T<sub>N</sub></b>. Біля центру вони збігаються, а далі
            розходяться — це множник <code>|x−a|<sup>N+1</sup></code> з оцінки похибки, який стає видимим. Для
            <b> ln(1+x)</b> і <b>1/(1−x)</b> затінена смуга — це радіус збіжності: усередині неї більше N
            допомагає, а поза нею многочлен розбігається, скільки б членів ви не додали.
          </>}
        />
      </p>
    </div>
  );
}
