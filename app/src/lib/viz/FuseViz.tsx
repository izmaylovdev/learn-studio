import { useState } from 'react';
import { Plot, Slider, Readout, samplePath } from './Plot';
import { L, useTr } from '../i18n';

/**
 * Two Gaussian opinions and the one they combine into. The surprise the figure
 * exists to deliver is that the fused curve is taller and narrower than *both*
 * inputs — precisions add — and that the gain readout, which decides where the
 * peak lands, never looks at how far apart the two means are.
 */
export function FuseViz() {
  const tr = useTr();
  const [mz, setMz] = useState(4);      // where the measurement came in
  const [s1, setS1] = useState(2);      // prediction's spread
  const [s2, setS2] = useState(1);      // measurement's spread

  const v1 = s1 * s1;
  const v2 = s2 * s2;
  const K = v1 / (v1 + v2);
  const mu = 0 + K * (mz - 0);
  const vf = (1 - K) * v1;
  const sf = Math.sqrt(vf);

  const bump = (m: number, sd: number) => (x: number) =>
    Math.exp(-((x - m) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));

  const X: [number, number] = [-7, 12];
  const peak = Math.max(bump(0, s1)(0), bump(mz, s2)(mz), bump(mu, sf)(mu));
  const Y: [number, number] = [0, peak * 1.18];

  return (
    <div className="viz">
      <Plot xDomain={X} yDomain={Y} xLabel={tr('value', 'значення')} height={235}>
        {(s) => (
          <>
            <path className="viz-prior" d={samplePath(bump(0, s1), X[0], X[1], s, Y)} />
            <path className="viz-prior" d={samplePath(bump(mz, s2), X[0], X[1], s, Y)} />
            <path className="viz-approx" d={samplePath(bump(mu, sf), X[0], X[1], s, Y)} />
            <line className="viz-sweep" x1={s.sx(0)} x2={s.sx(0)} y1={s.top} y2={s.bottom} />
            <line className="viz-sweep" x1={s.sx(mz)} x2={s.sx(mz)} y1={s.top} y2={s.bottom} />
            <line className="viz-limit" x1={s.sx(mu)} x2={s.sx(mu)} y1={s.top} y2={s.bottom} />
            <text className="viz-annot" x={s.sx(0)} y={s.top + 11} textAnchor="middle">{tr('prediction', 'прогноз')}</text>
            <text className="viz-annot" x={s.sx(mz)} y={s.top + 11} textAnchor="middle">{tr('measurement', 'вимірювання')}</text>
          </>
        )}
      </Plot>

      <div className="viz-legend">
        <span><i style={{ background: 'var(--muted)' }} /> {tr('the two inputs', 'два входи')}</span>
        <span><i style={{ background: 'var(--accent)' }} /> {tr('fused', 'злиття')}</span>
      </div>

      <Slider label={tr('measurement', 'вимірювання')} value={mz} min={-4} max={9} step={0.25} onChange={setMz} format={(v) => v.toFixed(2)} />
      <Slider label={tr('σ prediction', 'σ прогнозу')} value={s1} min={0.3} max={4} step={0.05} onChange={setS1} format={(v) => v.toFixed(2)} />
      <Slider label={tr('σ measurement', 'σ вимірювання')} value={s2} min={0.3} max={4} step={0.05} onChange={setS2} format={(v) => v.toFixed(2)} />

      <Readout items={[
        { label: tr('gain K', 'підсилення K'), value: K.toFixed(3), tone: K > 0.5 ? 'warn' : 'good' },
        { label: tr('fused mean', 'середнє злиття'), value: mu.toFixed(2) },
        { label: tr('fused σ', 'σ злиття'), value: sf.toFixed(3), tone: 'good' },
      ]} />

      <p className="viz-note">
        <L
          en={<>
            The fused σ is <b>always below both</b> inputs — check it against the two σ sliders at any setting you
            like. That is precisions adding, and it is why two mediocre sensors beat one good one. Now drag the
            measurement slider: the peak slides, the <b>gain does not move at all</b>. How far apart the two opinions
            are has no bearing on how much you trust each of them — only their spreads do. Finally set σ prediction to
            4 and σ measurement to 0.3: K goes to nearly 1 and the fused curve lands almost on top of the measurement,
            which is exactly what a filter does with its very first reading.
          </>}
          uk={<>
            σ злиття <b>завжди менша за обидві</b> вхідні — перевірте за двома повзунками σ за будь-яких налаштувань.
            Це додаються точності, і саме тому два посередні датчики кращі за один добрий. Тепер потягніть повзунок
            вимірювання: пік зсувається, а <b>підсилення не рухається зовсім</b>. Наскільки далекі дві думки одна від
            одної, ніяк не впливає на те, скільки довіри кожній, — впливають лише їхні розкиди. Наостанок поставте
            σ прогнозу 4, а σ вимірювання 0.3: K наближається до 1, і крива злиття лягає майже на вимірювання —
            саме так фільтр обходиться зі своїм найпершим показом.
          </>}
        />
      </p>
    </div>
  );
}
