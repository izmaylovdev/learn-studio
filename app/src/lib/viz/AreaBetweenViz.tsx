import { useState } from 'react';
import { Plot, Slider, Choice, Readout, samplePath } from './Plot';

type Pair = {
  label: string;
  f: (x: number) => number;
  g: (x: number) => number;
  fLabel: string;
  gLabel: string;
  a: number;
  b: number;
  /** Interior crossings, known analytically — the figure never has to hunt for them. */
  cross: number[];
  y: [number, number];
};

const PAIRS: Record<string, Pair> = {
  cubic: {
    label: 'x & x³', f: (x) => x, g: (x) => x ** 3,
    fLabel: 'y = x', gLabel: 'y = x³',
    a: -1, b: 1, cross: [0], y: [-1.3, 1.3],
  },
  trig: {
    label: 'sin & cos', f: Math.sin, g: Math.cos,
    fLabel: 'y = sin x', gLabel: 'y = cos x',
    a: 0, b: 2 * Math.PI, cross: [Math.PI / 4, (5 * Math.PI) / 4], y: [-1.45, 1.45],
  },
  root: {
    label: '√x & x/2', f: Math.sqrt, g: (x) => x / 2,
    fLabel: 'y = √x', gLabel: 'y = x/2',
    a: 0, b: 4, cross: [], y: [-0.35, 2.3],
  },
};
type Key = keyof typeof PAIRS;

/** Midpoint rule, fine enough that the readout is exact to the digits shown. */
function integrate(h: (x: number) => number, a: number, b: number, n = 4000) {
  let s = 0;
  for (let i = 0; i < n; i++) s += h(a + ((b - a) * (i + 0.5)) / n);
  return (s * (b - a)) / n;
}

/** The closed band between two curves over [a,b]: out along f, back along g. */
function band(p: Pair, a: number, b: number, s: Parameters<typeof samplePath>[3]) {
  const out = samplePath(p.f, a, b, s, p.y, 120);
  const back = samplePath(p.g, b, a, s, p.y, 120).replace('M', 'L');
  return `${out}${back}Z`;
}

/**
 * The vertical slice, and what happens to it when the curves swap order: the
 * region shades green where f is on top and red where g is, and the two
 * readouts come apart the moment the sweep passes a crossing.
 */
export function AreaBetweenViz() {
  const [key, setKey] = useState<Key>('cubic');
  const p = PAIRS[key];
  const [t, setT] = useState(0.62);

  const sweep = p.a + (p.b - p.a) * t;
  const gap = p.f(sweep) - p.g(sweep);

  const signed = integrate((x) => p.f(x) - p.g(x), p.a, sweep);
  const area = integrate((x) => Math.abs(p.f(x) - p.g(x)), p.a, sweep);
  const split = Math.abs(area - signed) > 1e-3;

  // Shade piecewise: one band per stretch where the sign of f − g is constant.
  const edges = [p.a, ...p.cross.filter((c) => c > p.a + 1e-9 && c < sweep - 1e-9), sweep];
  const pieces = edges.slice(0, -1).map((lo, i) => {
    const hi = edges[i + 1];
    return { lo, hi, positive: p.f((lo + hi) / 2) - p.g((lo + hi) / 2) >= 0 };
  });

  return (
    <div className="viz">
      <div className="viz-controls">
        <Choice value={key} onChange={(k) => { setKey(k); setT(0.62); }}
                options={(Object.keys(PAIRS) as Key[]).map((k) => ({ value: k, label: PAIRS[k].label }))} />
      </div>

      <Plot xDomain={[p.a - (p.b - p.a) * 0.06, p.b + (p.b - p.a) * 0.06]} yDomain={p.y} xLabel="x" height={250}>
        {(s) => (
          <>
            {pieces.map((piece, i) => (
              <path key={i} className={piece.positive ? 'viz-area-pos' : 'viz-area-neg'}
                    d={band(p, piece.lo, piece.hi, s)} />
            ))}

            {p.cross.map((c) => (
              <line key={c} className="viz-marker" x1={s.sx(c)} x2={s.sx(c)} y1={s.top} y2={s.bottom} />
            ))}

            <path className="viz-ghost" d={band(p, sweep, p.b, s)} />
            <path className="viz-curve" d={samplePath(p.f, p.a, p.b, s, p.y)} />
            <path className="viz-approx" d={samplePath(p.g, p.a, p.b, s, p.y)} />

            <line className="viz-slice" x1={s.sx(sweep)} x2={s.sx(sweep)}
                  y1={s.sy(p.g(sweep))} y2={s.sy(p.f(sweep))} />
            <circle className="viz-point" cx={s.sx(sweep)} cy={s.sy(p.f(sweep))} r={3.5} />
            <circle className="viz-point" cx={s.sx(sweep)} cy={s.sy(p.g(sweep))} r={3.5} />
            <text className="viz-annot" x={s.sx(sweep) + (t > 0.85 ? -7 : 7)}
                  y={s.sy((p.f(sweep) + p.g(sweep)) / 2) + 3}
                  textAnchor={t > 0.85 ? 'end' : 'start'}>
              {gap >= 0 ? 'f − g' : 'f − g < 0'}
            </text>
          </>
        )}
      </Plot>

      <div className="viz-legend">
        <span><i style={{ background: 'var(--text)' }} />{p.fLabel} (f)</span>
        <span><i style={{ background: 'var(--accent)' }} />{p.gLabel} (g)</span>
      </div>

      <Slider label="sweep to x" value={t} min={0} max={1} step={0.002} onChange={setT}
              format={() => sweep.toFixed(2)} />

      <Readout items={[
        { label: 'slice height f − g', value: gap.toFixed(3), tone: gap < 0 ? 'warn' : undefined },
        { label: '∫(f − g) dx', value: signed.toFixed(4), tone: split ? 'warn' : undefined },
        { label: 'true area', value: area.toFixed(4), tone: split ? undefined : 'good' },
      ]} />

      <p className="viz-note">
        Sweep right and watch the two numbers. While the slice height stays positive they are the same
        number — the integral <em>is</em> the area. Past a crossing the band turns red, the slice height goes
        negative, and <code>∫(f−g)</code> starts <b>paying back</b> area it already counted. On <b>x & x³</b> it reaches exactly 0 at x = 1 while the true area is ½; on
        <b> sin & cos</b> it does the same over a full period. The fix is not <code>|f−g|</code> — that is
        just a name for the split — it is finding the crossing and integrating each side with its own top.
        Try <b>√x & x/2</b> to see the case where nothing crosses and the caution costs you nothing.
      </p>
    </div>
  );
}
