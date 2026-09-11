import { useMemo, useState } from 'react';
import { Choice, Plot, Readout, Slider, ticks } from './Plot';

type Source = 'exponential' | 'uniform' | 'bimodal' | 'cauchy';

const SOURCES: Record<Source, { label: string; draw: (u: () => number) => number; mean: number; sd: number; note: string }> = {
  exponential: { label: 'skewed', draw: (u) => -Math.log(1 - u()), mean: 1, sd: 1,
    note: 'heavily right-skewed, nothing like a bell' },
  uniform: { label: 'flat', draw: (u) => u(), mean: 0.5, sd: Math.sqrt(1 / 12),
    note: 'flat — no peak at all in the source' },
  bimodal: { label: 'two humps', draw: (u) => (u() < 0.5 ? 0.15 : 0.85) + (u() - 0.5) * 0.2, mean: 0.5, sd: 0.36,
    note: 'two separated humps, the least bell-like shape here' },
  cauchy: { label: 'Cauchy', draw: (u) => Math.tan(Math.PI * (u() - 0.5)), mean: 0, sd: NaN,
    note: 'infinite variance — the one case where the theorem does not apply' },
};

/** Deterministic PRNG, so dragging a slider redraws the same experiment. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function CLTViz() {
  const [n, setN] = useState(1);
  const [src, setSrc] = useState<Source>('exponential');
  const spec = SOURCES[src];

  const { bins, lo, hi, peak, sampleSd } = useMemo(() => {
    const u = rng(20260910);
    const TRIALS = 2500;
    const means: number[] = [];
    for (let t = 0; t < TRIALS; t++) {
      let sum = 0;
      for (let i = 0; i < n; i++) sum += spec.draw(u);
      means.push(sum / n);
    }
    // clip the Cauchy tails so one absurd draw doesn't flatten the whole picture
    const sorted = [...means].sort((a, b) => a - b);
    const lo = sorted[Math.floor(TRIALS * 0.01)];
    const hi = sorted[Math.ceil(TRIALS * 0.99) - 1];
    const B = 46;
    const bins = new Array(B).fill(0);
    for (const m of means) {
      const k = Math.floor(((m - lo) / (hi - lo || 1)) * B);
      if (k >= 0 && k < B) bins[k]++;
    }
    const mu = means.reduce((a, b) => a + b, 0) / TRIALS;
    const sampleSd = Math.sqrt(means.reduce((a, b) => a + (b - mu) ** 2, 0) / TRIALS);
    return { bins, lo, hi, peak: Math.max(...bins), sampleSd };
  }, [n, src, spec]);

  const width = (hi - lo) / bins.length;

  return (
    <div className="viz">
      <Choice value={src} onChange={setSrc}
              options={(Object.keys(SOURCES) as Source[]).map((k) => ({ value: k, label: SOURCES[k].label }))} />

      <Plot xDomain={[lo, hi]} yDomain={[0, peak * 1.12]} xLabel="value of the sample mean" height={220}>
        {(s) => (
          <>
            {ticks(lo, hi, 5).map((t) => (
              <text key={t} x={s.sx(t)} y={s.bottom + 15} className="viz-tick" textAnchor="middle">
                {t.toFixed(2)}
              </text>
            ))}
            {bins.map((c, i) => {
              const x0 = s.sx(lo + i * width);
              const x1 = s.sx(lo + (i + 1) * width);
              return (
                <rect key={i} x={x0} y={s.sy(c)} width={Math.max(1, x1 - x0 - 1)}
                      height={Math.max(0, s.bottom - s.sy(c))} fill="var(--accent)" opacity={0.72} />
              );
            })}
          </>
        )}
      </Plot>

      <Slider label="n averaged" value={n} min={1} max={60} onChange={setN} />

      <Readout items={[
        { label: 'spread of the mean', value: sampleSd.toFixed(4) },
        { label: 'σ/√n predicts', value: Number.isNaN(spec.sd) ? 'no finite σ' : (spec.sd / Math.sqrt(n)).toFixed(4),
          tone: Number.isNaN(spec.sd) ? 'warn' : undefined },
        { label: 'n', value: String(n) },
      ]} />

      <p className="viz-note">
        At <b>n = 1</b> you are looking straight at the source — {spec.note}. Drag n up and watch the shape
        become a bell anyway. The two readouts are the measured spread and the <b>σ/√n</b> the theorem
        predicts; they track each other closely, which is the quantitative half of the claim.
        Then switch to <b>Cauchy</b>: it has no finite variance, and averaging never makes it converge —
        the distribution of the mean is the same at n = 60 as at n = 1.
      </p>
    </div>
  );
}
