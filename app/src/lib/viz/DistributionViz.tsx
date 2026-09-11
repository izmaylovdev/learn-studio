import { useMemo, useState } from 'react';
import { Choice, Plot, Readout, Slider } from './Plot';

type Which = 'binomial' | 'poisson';

function logFact(k: number) {
  let s = 0;
  for (let i = 2; i <= k; i++) s += Math.log(i);
  return s;
}

/**
 * Binomial and Poisson on the same axes, with the normal curve drawn over both.
 * The point is the two convergences: hold np fixed and the binomial becomes the
 * Poisson; let np grow and either becomes the normal.
 */
export function DistributionViz() {
  const [which, setWhich] = useState<Which>('binomial');
  const [n, setN] = useState(20);
  const [p, setP] = useState(0.3);

  const lambda = n * p;
  const { bars, mean, sd, K } = useMemo(() => {
    const K = Math.min(60, Math.max(12, Math.ceil(lambda + 4 * Math.sqrt(Math.max(lambda, 1)) + 2)));
    const bars: number[] = [];
    for (let k = 0; k <= K; k++) {
      if (which === 'binomial') {
        bars.push(k > n ? 0 : Math.exp(
          logFact(n) - logFact(k) - logFact(n - k) + k * Math.log(p || 1e-12) + (n - k) * Math.log(1 - p || 1e-12)
        ));
      } else {
        bars.push(Math.exp(k * Math.log(lambda || 1e-12) - lambda - logFact(k)));
      }
    }
    const mean = which === 'binomial' ? n * p : lambda;
    const varr = which === 'binomial' ? n * p * (1 - p) : lambda;
    return { bars, mean, sd: Math.sqrt(varr), K };
  }, [which, n, p, lambda]);

  const peak = Math.max(...bars, 1e-9);
  const normal = (x: number) => Math.exp(-((x - mean) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));

  return (
    <div className="viz">
      <Choice value={which} onChange={setWhich}
              options={[{ value: 'binomial', label: 'binomial' }, { value: 'poisson', label: 'Poisson' }]} />

      <Plot xDomain={[-0.5, K + 0.5]} yDomain={[0, peak * 1.15]} xLabel="k" height={220}>
        {(s) => (
          <>
            {bars.map((v, k) => {
              const x0 = s.sx(k - 0.42), x1 = s.sx(k + 0.42);
              return (
                <rect key={k} x={x0} y={s.sy(v)} width={Math.max(1, x1 - x0)}
                      height={Math.max(0, s.bottom - s.sy(v))} fill="var(--accent)" opacity={0.68} />
              );
            })}
            <path d={(() => {
              let d = '';
              for (let i = 0; i <= 200; i++) {
                const x = -0.5 + ((K + 1) * i) / 200;
                const y = normal(x);
                d += `${i ? 'L' : 'M'}${s.sx(x).toFixed(2)} ${Math.max(s.top, s.sy(y)).toFixed(2)}`;
              }
              return d;
            })()} fill="none" stroke="var(--mastered)" strokeWidth={2} />
            {[mean - sd, mean, mean + sd].map((v, i) => (
              <line key={i} x1={s.sx(v)} x2={s.sx(v)} y1={s.top} y2={s.bottom}
                    stroke="var(--muted)" strokeWidth={i === 1 ? 1.4 : 0.8}
                    strokeDasharray={i === 1 ? '' : '3 3'} opacity={0.6} />
            ))}
          </>
        )}
      </Plot>

      <Slider label="n trials" value={n} min={1} max={80} onChange={setN} />
      <Slider label="p" value={p} min={0.01} max={0.99} step={0.01} onChange={setP} format={(v) => v.toFixed(2)} />

      <Readout items={[
        { label: 'mean', value: mean.toFixed(3) },
        { label: 'variance', value: (sd * sd).toFixed(3) },
        { label: which === 'binomial' ? 'np' : 'λ', value: lambda.toFixed(2) },
      ]} />

      <p className="viz-note">
        Two different convergences live in these sliders. Push <b>n up and p down</b> keeping np near 3 —
        the binomial and the Poisson become indistinguishable, and neither cares about n and p separately
        any more, only their product. Now push <b>np above about 10</b>: the green normal curve lands on
        top of either one. The dashed lines are one σ out; for the Poisson mean and variance are
        <em> the same number</em>, which is the claim you can test against real count data.
      </p>
    </div>
  );
}
