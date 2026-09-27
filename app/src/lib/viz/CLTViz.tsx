import { useMemo, useState, type ReactNode } from 'react';
import { Choice, Plot, Readout, Slider, ticks } from './Plot';
import { L, useTr } from '../i18n';

type Source = 'exponential' | 'uniform' | 'bimodal' | 'cauchy';

const SOURCES: Record<Source, { label: ReactNode; draw: (u: () => number) => number; mean: number; sd: number; note: ReactNode }> = {
  exponential: { label: <L en="skewed" uk="скошений" />, draw: (u) => -Math.log(1 - u()), mean: 1, sd: 1,
    note: <L en="heavily right-skewed, nothing like a bell" uk="сильно скошений праворуч, зовсім не дзвін" /> },
  uniform: { label: <L en="flat" uk="плаский" />, draw: (u) => u(), mean: 0.5, sd: Math.sqrt(1 / 12),
    note: <L en="flat — no peak at all in the source" uk="плаский — у джерела взагалі немає піку" /> },
  bimodal: { label: <L en="two humps" uk="два горби" />, draw: (u) => (u() < 0.5 ? 0.15 : 0.85) + (u() - 0.5) * 0.2, mean: 0.5, sd: 0.36,
    note: <L en="two separated humps, the least bell-like shape here" uk="два розділені горби — найменш схожа на дзвін форма тут" /> },
  cauchy: { label: <L en="Cauchy" uk="Коші" />, draw: (u) => Math.tan(Math.PI * (u() - 0.5)), mean: 0, sd: NaN,
    note: <L en="infinite variance — the one case where the theorem does not apply"
             uk="нескінченна дисперсія — єдиний випадок, коли теорема не діє" /> },
};

/** Deterministic PRNG, so dragging a slider redraws the same experiment. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function CLTViz() {
  const tr = useTr();
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

      <Plot xDomain={[lo, hi]} yDomain={[0, peak * 1.12]} xLabel={tr('value of the sample mean', 'значення вибіркового середнього')} height={220}>
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

      <Slider label={tr('n averaged', 'усереднено n')} value={n} min={1} max={60} onChange={setN} />

      <Readout items={[
        { label: tr('spread of the mean', 'розкид середнього'), value: sampleSd.toFixed(4) },
        { label: tr('σ/√n predicts', 'σ/√n передбачає'),
          value: Number.isNaN(spec.sd) ? tr('no finite σ', 'немає скінченного σ') : (spec.sd / Math.sqrt(n)).toFixed(4),
          tone: Number.isNaN(spec.sd) ? 'warn' : undefined },
        { label: 'n', value: String(n) },
      ]} />

      <p className="viz-note">
        <L
          en={<>
            At <b>n = 1</b> you are looking straight at the source — {spec.note}. Drag n up and watch the shape
            become a bell anyway. The two readouts are the measured spread and the <b>σ/√n</b> the theorem
            predicts; they track each other closely, which is the quantitative half of the claim.
            Then switch to <b>Cauchy</b>: it has no finite variance, and averaging never makes it converge —
            the distribution of the mean is the same at n = 60 as at n = 1.
          </>}
          uk={<>
            При <b>n = 1</b> ви дивитеся просто на джерело — {spec.note}. Збільшуйте n і дивіться, як форма все
            одно стає дзвоном. Два показники — це виміряний розкид і <b>σ/√n</b>, який передбачає теорема; вони
            тісно йдуть поруч, і це кількісна половина твердження. Потім перемкніться на <b>Коші</b>: скінченної
            дисперсії немає, і усереднення ніколи не змусить його збігтися — розподіл середнього при n = 60 такий
            самий, як при n = 1.
          </>}
        />
      </p>
    </div>
  );
}
