import { useMemo, useState } from 'react';
import { Plot, Slider, Choice, Readout } from './Plot';
import { L, useTr } from '../i18n';

/**
 * A constant-velocity filter run against a fixed sensor, plotted as *error*
 * rather than position — so the filter's own ±σ band can be drawn around zero
 * and compared with how wrong it actually is. The sensor noise is held at 3 m
 * whatever the sliders say: the sliders set what the filter is *told*, which is
 * the only thing a tuner ever controls.
 */
const DT = 0.5;
const N = 100;
const TRUE_SIGMA = 3;      // what the sensor really does
const A_TURN = -0.7;       // a five-second brake the constant-velocity model cannot see

/** Deterministic noise, so the figure does not reshuffle on every keystroke. */
function noise(): number[] {
  let seed = 20260914;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const out: number[] = [];
  for (let i = 0; i <= N; i++) {
    const u = Math.max(rnd(), 1e-9);
    out.push(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()));
  }
  return out;
}

type Scene = 'cruise' | 'manoeuvre';

/** The ±σ ribbon: up the top edge, back along the bottom, closed. */
function bandPath(band: number[], s: { sx: (v: number) => number; sy: (v: number) => number }, t: (i: number) => number) {
  const up = band.map((b, i) => `${i ? 'L' : 'M'}${s.sx(t(i)).toFixed(2)} ${s.sy(b).toFixed(2)}`).join('');
  const down = band.map((_, i) => {
    const j = band.length - 1 - i;
    return `L${s.sx(t(j)).toFixed(2)} ${s.sy(-band[j]).toFixed(2)}`;
  }).join('');
  return `${up}${down}Z`;
}

export function KalmanViz() {
  const tr = useTr();
  const [logSa, setLogSa] = useState(-1.2);   // log₁₀ of the filter's σₐ
  const [rTold, setRTold] = useState(3);      // the σ the filter is told the sensor has
  const [scene, setScene] = useState<Scene>('manoeuvre');

  const z = useMemo(() => {
    const w = noise();
    const truth: number[] = [];
    let p = 0, v = 5;
    for (let k = 0; k <= N; k++) {
      truth.push(p);
      const t = k * DT;
      const a = scene === 'manoeuvre' && t >= 15 && t < 20 ? A_TURN : 0;
      p += v * DT + 0.5 * a * DT * DT;
      v += a * DT;
    }
    return { truth, meas: truth.map((x, k) => x + TRUE_SIGMA * w[k]) };
  }, [scene]);

  const run = useMemo(() => {
    const sa = 10 ** logSa;
    const q = sa * sa;
    const Q = [(DT ** 4 / 4) * q, (DT ** 3 / 2) * q, DT * DT * q];
    const R = rTold * rTold;

    // Two-point initialisation: position from the first reading, rate from the
    // first two, with the covariance that implies rather than a guessed one.
    let x = [z.meas[1], (z.meas[1] - z.meas[0]) / DT];
    let P = [R, R / DT, (2 * R) / (DT * DT)];   // [P00, P01, P11]

    const err: number[] = [], band: number[] = [], nis: number[] = [];
    let nisSum = 0, sqSum = 0, n = 0;

    for (let k = 2; k <= N; k++) {
      // predict — F = [[1, DT], [0, 1]]
      x = [x[0] + DT * x[1], x[1]];
      P = [
        P[0] + 2 * DT * P[1] + DT * DT * P[2] + Q[0],
        P[1] + DT * P[2] + Q[1],
        P[2] + Q[2],
      ];

      // update — H = [1, 0]
      const y = z.meas[k] - x[0];
      const S = P[0] + R;
      const K = [P[0] / S, P[1] / S];
      x = [x[0] + K[0] * y, x[1] + K[1] * y];

      // Joseph form, written out for the 2×2 case
      const [a, , c] = P;
      const m0 = 1 - K[0];                     // I − KH, row 0
      const P00 = m0 * m0 * a + K[0] * K[0] * R;
      const P01 = m0 * (P[1] - K[1] * a) + K[0] * K[1] * R;
      const P11 = c - 2 * K[1] * P[1] + K[1] * K[1] * (a + R);
      P = [P00, P01, P11];

      err.push(x[0] - z.truth[k]);
      band.push(Math.sqrt(Math.max(P[0], 0)));
      nis.push((y * y) / S);
      nisSum += (y * y) / S;
      sqSum += (x[0] - z.truth[k]) ** 2;
      n++;
    }
    return { err, band, nis, rms: Math.sqrt(sqSum / n), meanNis: nisSum / n, finalSigma: band[band.length - 1] };
  }, [z, logSa, rTold]);

  const X: [number, number] = [2 * DT, N * DT];
  const Y: [number, number] = [-15, 15];
  const t = (i: number) => (i + 2) * DT;

  return (
    <div className="viz">
      <div className="viz-controls">
        <Choice value={scene} onChange={setScene} options={[
          { value: 'cruise', label: tr('constant velocity', 'стала швидкість') },
          { value: 'manoeuvre', label: tr('it brakes at t = 15', 'гальмує при t = 15') },
        ]} />
      </div>

      <Plot xDomain={X} yDomain={Y} xLabel={tr('t (s)', 't (с)')} yLabel={tr('position error (m)', 'похибка положення (м)')} height={250}>
        {(s) => (
          <>
            <path className="viz-region" d={bandPath(run.band, s, t)} />
            {run.err.map((_, i) => (
              <circle key={i} cx={s.sx(t(i))} cy={s.sy(Math.max(Y[0], Math.min(Y[1], z.meas[i + 2] - z.truth[i + 2])))}
                      r={1.6} fill="var(--faint)" />
            ))}
            <line className="viz-sweep" x1={s.sx(X[0])} x2={s.sx(X[1])} y1={s.sy(0)} y2={s.sy(0)} />
            <path className="viz-approx"
                  d={run.err.map((e, i) => `${i ? 'L' : 'M'}${s.sx(t(i)).toFixed(2)} ${s.sy(Math.max(Y[0], Math.min(Y[1], e))).toFixed(2)}`).join('')} />
            {scene === 'manoeuvre' && [15, 20].map((tt) => (
              <line key={tt} className="viz-marker" x1={s.sx(tt)} x2={s.sx(tt)} y1={s.top} y2={s.bottom} />
            ))}
          </>
        )}
      </Plot>

      <div className="viz-legend">
        <span><i style={{ background: 'var(--faint)' }} /> {tr('measurement error', 'похибка вимірювання')}</span>
        <span><i style={{ background: 'var(--accent)' }} /> {tr('estimate error', 'похибка оцінки')}</span>
        <span><i style={{ background: 'var(--accent)', opacity: 0.25 }} /> {tr('the filter\'s own ±σ', 'власне ±σ фільтра')}</span>
      </div>

      <Slider label={tr('σₐ told', 'σₐ, яку повідомили')} value={logSa} min={-3} max={0.6} step={0.05} onChange={setLogSa}
              format={(v) => (10 ** v).toFixed(3)} />
      <Slider label={tr('σ sensor told', 'σ датчика, яку повідомили')} value={rTold} min={0.5} max={10} step={0.25} onChange={setRTold}
              format={(v) => v.toFixed(2)} />

      <Readout items={[
        { label: tr('RMS error (m)', 'СКП (м)'), value: run.rms.toFixed(2), tone: run.rms < TRUE_SIGMA ? 'good' : 'warn' },
        { label: tr('mean NIS (want 1)', 'середній NIS (має бути 1)'), value: run.meanNis.toFixed(2), tone: run.meanNis > 2 ? 'warn' : 'good' },
        { label: tr('σ it reports (m)', 'σ, яку він звітує (м)'), value: run.finalSigma.toFixed(2) },
      ]} />

      <p className="viz-note">
        <L
          en={<>
            The sensor is fixed at 3 m of noise no matter what the sliders say — the sliders set what the filter is
            <b> told</b>, which is all a tuner ever controls. Start on <b>constant velocity</b> and drag σₐ down: the
            estimate smooths beautifully and the RMS falls well below the measurement scatter. Now switch to
            <b> it brakes at t = 15</b> and drag σₐ down again. The estimate walks{' '}
            <b>outside its own shaded band</b> and stays there while the band keeps shrinking — more confident and more wrong at
            the same time. That is divergence, and the <b>mean NIS</b> readout catches it without anyone ever needing
            the true position. Push σₐ back up and watch both the error and the NIS come back to earth, at the cost of
            a visibly noisier estimate during the quiet stretch.
          </>}
          uk={<>
            Шум датчика зафіксовано на 3 м, хоч би що показували повзунки, — вони задають те, що фільтру
            <b> повідомили</b>, а це все, що будь-коли контролює той, хто налаштовує. Почніть зі <b>сталої швидкості</b>
            й зменшуйте σₐ: оцінка стає чудово гладкою, а СКП падає значно нижче за розкид вимірювань. Тепер
            перемкніться на <b>гальмує при t = 15</b> і знову зменшуйте σₐ. Оцінка виходить{' '}
            <b>за межі власної затіненої смуги</b> й лишається там, поки смуга далі звужується, — водночас упевненіша й
            хибніша. Це розбіжність, і показник <b>середнього NIS</b> ловить її, не потребуючи справжнього положення.
            Підніміть σₐ назад і дивіться, як і похибка, і NIS повертаються до норми — ціною помітно шумнішої оцінки
            на спокійній ділянці.
          </>}
        />
      </p>
    </div>
  );
}
