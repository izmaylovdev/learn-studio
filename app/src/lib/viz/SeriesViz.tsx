import { useState, type ReactNode } from 'react';
import { Plot, Slider, Choice, Readout } from './Plot';
import { L, useTr } from '../i18n';

interface Spec {
  label: string;
  term: (n: number) => number;
  limit: number | null;
  note: ReactNode;
  y: [number, number];
}

const SERIES: Record<string, Spec> = {
  harmonic: { label: '∑ 1/n', term: (n) => 1 / n, limit: null, y: [0, 6],
    note: <L en="terms → 0, but the partial sums climb forever — slowly, and without bound"
             uk="члени → 0, але часткові суми ростуть вічно — повільно й необмежено" /> },
  psquare: { label: '∑ 1/n²', term: (n) => 1 / (n * n), limit: Math.PI ** 2 / 6, y: [0, 2],
    note: <L en="p = 2 > 1, so it converges — to π²/6" uk="p = 2 > 1, тож ряд збігається — до π²/6" /> },
  alt: { label: '∑ (−1)ⁿ⁺¹/n', term: (n) => ((-1) ** (n + 1)) / n, limit: Math.LN2, y: [0, 1.2],
    note: <L en="the same terms as the harmonic series, but the signs make it converge to ln 2"
             uk="ті самі члени, що й у гармонічного ряду, але знаки змушують його збігатися до ln 2" /> },
  geom: { label: '∑ (1/2)ⁿ', term: (n) => 0.5 ** n, limit: 1, y: [0, 1.3],
    note: <L en="geometric with r = 1/2, so it converges to a/(1−r) = 1"
             uk="геометричний з r = 1/2, тож збігається до a/(1−r) = 1" /> },
  root: { label: '∑ 1/√n', term: (n) => 1 / Math.sqrt(n), limit: null, y: [0, 12],
    note: <L en="p = 1/2 < 1, so it diverges — even though the terms shrink to zero"
             uk="p = 1/2 < 1, тож ряд розбігається — хоча члени прямують до нуля" /> },
};
type Key = keyof typeof SERIES;

/** Partial sums as a sequence: the definition of series convergence, plotted. */
export function SeriesViz() {
  const tr = useTr();
  const [key, setKey] = useState<Key>('harmonic');
  const [N, setN] = useState(30);

  const spec = SERIES[key];
  const pts: { n: number; s: number }[] = [];
  let acc = 0;
  for (let n = 1; n <= N; n++) { acc += spec.term(n); pts.push({ n, s: acc }); }

  const yMax = Math.max(spec.y[1], ...pts.map((p) => p.s)) * 1.08;

  return (
    <div className="viz">
      <div className="viz-controls">
        <Choice value={key} onChange={setKey}
                options={(Object.keys(SERIES) as Key[]).map((k) => ({ value: k, label: SERIES[k].label }))} />
      </div>

      <Plot xDomain={[0, N + 1]} yDomain={[0, yMax]} xLabel="N" yLabel="S_N">
        {(s) => (
          <>
            {spec.limit !== null && (
              <>
                <line className="viz-limit" x1={s.sx(0)} x2={s.sx(N + 1)} y1={s.sy(spec.limit)} y2={s.sy(spec.limit)} />
                <text className="viz-limit-label" x={s.sx(N + 1)} y={s.sy(spec.limit) - 5} textAnchor="end">
                  {tr('limit', 'границя')} {spec.limit.toFixed(4)}
                </text>
              </>
            )}
            <path className="viz-approx" d={pts.map((p, i) => `${i ? 'L' : 'M'}${s.sx(p.n)} ${s.sy(p.s)}`).join('')} />
            {pts.length <= 60 && pts.map((p) => (
              <circle key={p.n} className="viz-dot" cx={s.sx(p.n)} cy={s.sy(p.s)} r={2.2} />
            ))}
          </>
        )}
      </Plot>

      <Slider label="N" value={N} min={2} max={400} onChange={setN} />

      <Readout items={[
        { label: 'S_N', value: acc.toFixed(5) },
        { label: tr('last term added', 'останній доданий член'), value: spec.term(N).toExponential(2) },
        { label: tr('verdict', 'висновок'),
          value: spec.limit === null ? tr('diverges', 'розбігається') : tr('converges', 'збігається'),
          tone: spec.limit === null ? 'warn' : 'good' },
      ]} />

      <p className="viz-note">
        <L
          en={<>
            A series <em>is</em> the sequence of its partial sums, and this is that sequence. {spec.note}.
            Compare <b>∑1/n</b> with <b>∑1/n²</b> at large N: the last term added is tiny in both cases, which is
            exactly why the divergence test can never prove convergence.
          </>}
          uk={<>
            Ряд <em>і є</em> послідовністю своїх часткових сум, і тут зображено саме її. {spec.note}.
            Порівняйте <b>∑1/n</b> і <b>∑1/n²</b> за великого N: останній доданий член крихітний в обох
            випадках — саме тому ознака розбіжності ніколи не може довести збіжність.
          </>}
        />
      </p>
    </div>
  );
}
