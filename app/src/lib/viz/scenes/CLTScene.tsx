import { useId, useMemo } from 'react';
import { Plot, Readout } from '../Plot';
import { Scene, type Beat } from '../Scene';

const TRIALS = 2500;
const MAX_N = 30;
const BINS = 80;
const EXP: [number, number] = [0, 4];      // window on the sample mean, n = 1
const CAUCHY: [number, number] = [-6, 6];

/** Deterministic PRNG, so every replay is the same experiment. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Histogram as a *density*, so bars stay comparable as the spread changes. */
function histogram(means: number[], [lo, hi]: [number, number]) {
  const w = (hi - lo) / BINS;
  const bins = new Array(BINS).fill(0);
  for (const m of means) {
    const k = Math.floor((m - lo) / w);
    if (k >= 0 && k < BINS) bins[k]++;
  }
  return bins.map((c) => c / (means.length * w));
}

function sd(xs: number[]) {
  const mu = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, b) => a + (b - mu) ** 2, 0) / xs.length);
}

type S = { u: number; xlo: number; xhi: number; yhi: number; normal: number; cauchy: number };

const BEATS: Beat<S>[] = [
  { label: 'the source', hold: 1.8,
    state: { u: 1, xlo: EXP[0], xhi: EXP[1], yhi: 1.25, normal: 0, cauchy: 0 },
    caption: '2500 draws from a lopsided source — waiting times, piled at zero and decaying right. This is not a bell, and nothing about it wants to be one.' },

  { label: 'n = 2', in: 1.2, hold: 1.4,
    state: { u: 2, xlo: EXP[0], xhi: EXP[1], yhi: 1.45, normal: 0, cauchy: 0 },
    caption: 'Now average two draws at a time and histogram the averages. Same source, same 2500 samples — the only change is that each bar counts a mean instead of a draw.' },

  { label: 'n = 5', in: 1.3, hold: 1.4,
    state: { u: 5, xlo: EXP[0], xhi: EXP[1], yhi: 1.95, normal: 0, cauchy: 0 },
    caption: 'Five at a time. The pile has pulled away from zero and the long right tail is being eaten — one big draw can no longer carry a whole average.' },

  { label: 'n = 30', in: 1.9, hold: 1.9,
    state: { u: 30, xlo: EXP[0], xhi: EXP[1], yhi: 2.9, normal: 0, cauchy: 0 },
    caption: 'Thirty. Symmetric, centred on μ = 1, and the skew is simply gone.' },

  { label: 'the bell', in: 1.6, hold: 2.4,
    state: { u: 30, xlo: 0.4, xhi: 1.6, yhi: 2.9, normal: 1, cauchy: 0 },
    caption: 'Zoom in, and overlay the normal density with mean μ and spread σ/√n. Nothing here was fitted: both numbers come from the source, and the shape came from the theorem.' },

  { label: 'the catch', in: 1.9, hold: 2.8,
    state: { u: 30, xlo: CAUCHY[0], xhi: CAUCHY[1], yhi: 0.5, normal: 0, cauchy: 1 },
    caption: 'Same experiment, still n = 30, on a Cauchy source. It has no finite variance, so σ/√n means nothing — and the averages are exactly as spread out as a single draw. Averaging needs a finite σ to bite on.' },
];

export function CLTScene() {
  const clip = useId().replace(/:/g, '');

  // One pass for every n up to MAX_N, up front. Blending two neighbouring
  // histograms is smooth because they are one draw apart; recomputing 75k
  // samples per animation frame would not be.
  const data = useMemo(() => {
    const exp: number[][] = [];
    const spread: number[] = [];
    for (let n = 1; n <= MAX_N; n++) {
      const u = rng(20260910);
      const means: number[] = [];
      for (let t = 0; t < TRIALS; t++) {
        let sum = 0;
        for (let i = 0; i < n; i++) sum += -Math.log(1 - u());
        means.push(sum / n);
      }
      exp[n] = histogram(means, EXP);
      spread[n] = sd(means);
    }

    const u = rng(20260910);
    const cm: number[] = [];
    for (let t = 0; t < TRIALS; t++) {
      let sum = 0;
      for (let i = 0; i < MAX_N; i++) sum += Math.tan(Math.PI * (u() - 0.5));
      cm.push(sum / MAX_N);
    }
    return { exp, spread, cauchy: histogram(cm, CAUCHY) };
  }, []);

  return (
    <Scene
      beats={BEATS}
      render={(s) => {
        const j = Math.max(1, Math.min(MAX_N - 1, Math.floor(s.u)));
        const w = s.u - j;
        const bins = data.exp[j].map((v, i) => v + (data.exp[j + 1][i] - v) * w);
        const spread = data.spread[j] + (data.spread[j + 1] - data.spread[j]) * w;

        const sigma = 1 / Math.sqrt(s.u);          // σ = 1 for the exponential here
        const normal = (x: number) =>
          Math.exp(-((x - 1) ** 2) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI));

        const x: [number, number] = [s.xlo, s.xhi];
        const y: [number, number] = [0, s.yhi];
        const showCauchy = s.cauchy > 0.5;

        return (
          <>
            <Plot xDomain={x} yDomain={y} xLabel="value of the sample mean" height={240}>
              {(sc) => {
                const Bars = ({ vals, range, opacity, fill }:
                  { vals: number[]; range: [number, number]; opacity: number; fill: string }) => {
                  if (opacity < 0.01) return null;
                  const bw = (range[1] - range[0]) / BINS;
                  return (
                    <g opacity={opacity}>
                      {vals.map((v, i) => {
                        if (v <= 0) return null;
                        const x0 = sc.sx(range[0] + i * bw);
                        const x1 = sc.sx(range[0] + (i + 1) * bw);
                        // Clamp to the plot box: the camera move overshoots the
                        // y range mid-transition, and unclamped bars would draw
                        // straight over the axis labels.
                        const top = Math.max(sc.top, sc.sy(v));
                        return (
                          <rect key={i} x={x0} y={top} width={Math.max(0.7, x1 - x0 - 0.8)}
                                height={Math.max(0, sc.bottom - top)} fill={fill} opacity={0.72} />
                        );
                      })}
                    </g>
                  );
                };

                return (
                  <>
                    <defs>
                      <clipPath id={clip}>
                        <rect x={sc.sx(x[0])} y={sc.top}
                              width={sc.sx(x[1]) - sc.sx(x[0])} height={sc.bottom - sc.top} />
                      </clipPath>
                    </defs>
                    <g clipPath={`url(#${clip})`}>
                      <Bars vals={bins} range={EXP} opacity={1 - s.cauchy} fill="var(--accent)" />
                      <Bars vals={data.cauchy} range={CAUCHY} opacity={s.cauchy} fill="var(--danger)" />
                      {s.normal > 0.01 && (
                        <path className="viz-approx" opacity={s.normal} d={(() => {
                          let d = '';
                          for (let i = 0; i <= 200; i++) {
                            const xv = x[0] + ((x[1] - x[0]) * i) / 200;
                            d += `${i ? 'L' : 'M'}${sc.sx(xv).toFixed(2)} ${sc.sy(normal(xv)).toFixed(2)}`;
                          }
                          return d;
                        })()} />
                      )}
                    </g>
                  </>
                );
              }}
            </Plot>

            <Readout items={[
              { label: 'n averaged', value: showCauchy ? '30' : String(Math.round(s.u)) },
              { label: 'measured spread',
                value: showCauchy ? 'unbounded' : spread.toFixed(3),
                tone: showCauchy ? 'warn' : undefined },
              { label: 'σ/√n predicts',
                value: showCauchy ? 'no finite σ' : (1 / Math.sqrt(s.u)).toFixed(3),
                tone: showCauchy ? 'warn' : 'good' },
            ]} />
          </>
        );
      }}
      note={
        <>
          The two readouts are the <b>measured</b> spread of the averages and the <b>σ/√n</b> the
          theorem predicts. They track each other the whole way down — that agreement is the
          quantitative half of the claim, and the bell shape is only the qualitative half.
          Scrub to any n to compare them directly.
        </>
      }
    />
  );
}
