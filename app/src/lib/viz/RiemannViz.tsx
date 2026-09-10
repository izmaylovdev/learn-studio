import { useState } from 'react';
import { Plot, Slider, Choice, Readout, samplePath } from './Plot';

const FNS = {
  square: { label: 'x²', f: (x: number) => x * x, a: 0, b: 2, exact: 8 / 3, y: [0, 4.4] as [number, number] },
  sine: { label: 'sin x', f: Math.sin, a: 0, b: Math.PI, exact: 2, y: [0, 1.2] as [number, number] },
  root: { label: '√x', f: Math.sqrt, a: 0, b: 4, exact: 16 / 3, y: [0, 2.3] as [number, number] },
};
type Key = keyof typeof FNS;
type Rule = 'left' | 'right' | 'mid';

/** Riemann sums converging on the definite integral as n grows. */
export function RiemannViz() {
  const [key, setKey] = useState<Key>('square');
  const [n, setN] = useState(6);
  const [rule, setRule] = useState<Rule>('left');

  const { f, a, b, exact, y } = FNS[key];
  const dx = (b - a) / n;
  const sampleAt = (i: number) => a + dx * (rule === 'left' ? i : rule === 'right' ? i + 1 : i + 0.5);

  let sum = 0;
  const bars: { x: number; h: number }[] = [];
  for (let i = 0; i < n; i++) {
    const h = f(sampleAt(i));
    sum += h * dx;
    bars.push({ x: a + i * dx, h });
  }
  const err = Math.abs(sum - exact);

  return (
    <div className="viz">
      <div className="viz-controls">
        <Choice value={key} onChange={setKey}
                options={(Object.keys(FNS) as Key[]).map((k) => ({ value: k, label: FNS[k].label }))} />
        <Choice value={rule} onChange={setRule}
                options={[{ value: 'left', label: 'left' }, { value: 'mid', label: 'midpoint' }, { value: 'right', label: 'right' }]} />
      </div>

      <Plot xDomain={[a - (b - a) * 0.06, b + (b - a) * 0.06]} yDomain={[y[0] - y[1] * 0.06, y[1]]} xLabel="x">
        {(s) => (
          <>
            {bars.map((bar, i) => {
              const top = Math.min(bar.h, y[1]);
              return (
                <rect key={i} className="viz-bar"
                      x={s.sx(bar.x)} width={Math.max(0.6, s.dx(dx) - 0.6)}
                      y={s.sy(top)} height={Math.max(0, s.sy(0) - s.sy(top))} />
              );
            })}
            <path className="viz-curve" d={samplePath(f, a, b, s, y)} />
          </>
        )}
      </Plot>

      <Slider label="n" value={n} min={1} max={80} onChange={setN} />

      <Readout items={[
        { label: 'Riemann sum', value: sum.toFixed(4) },
        { label: 'exact integral', value: exact.toFixed(4) },
        { label: 'error', value: err.toFixed(4), tone: err < 0.01 ? 'good' : 'warn' },
      ]} />

      <p className="viz-note">
        Drag <b>n</b> up and the rectangles converge on the curve — that limit <em>is</em> the definition of
        the integral. Note that the midpoint rule is far more accurate than left or right at the same n,
        because its errors cancel rather than accumulate.
      </p>
    </div>
  );
}
