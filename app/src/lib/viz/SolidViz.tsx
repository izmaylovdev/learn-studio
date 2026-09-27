import { useState } from 'react';
import { Plot, Slider, Choice, Readout, samplePath } from './Plot';
import { L, useTr } from '../i18n';

type Method = 'washer' | 'shell';

/** Region between y = √x and y = x/2 on [0,4], revolved about an axis. */
const top = (x: number) => Math.sqrt(x);
const bot = (x: number) => x / 2;
const A = 0, B = 4;

/** One slice of a solid of revolution — perpendicular (washer) or parallel (shell). */
export function SolidViz() {
  const tr = useTr();
  const [method, setMethod] = useState<Method>('washer');
  const [pos, setPos] = useState(1.6);

  const R = top(pos), r = bot(pos);
  // Both methods integrate to the same volume; shown about the x-axis / y-axis respectively.
  const simpson = (f: (x: number) => number) => {
    const n = 2000; let s = 0;
    for (let i = 0; i < n; i++) { const x = A + ((B - A) * (i + 0.5)) / n; s += f(x) * ((B - A) / n); }
    return s;
  };
  const volume = method === 'washer'
    ? Math.PI * simpson((x) => top(x) ** 2 - bot(x) ** 2)
    : 2 * Math.PI * simpson((x) => x * (top(x) - bot(x)));

  const sliceVal = method === 'washer'
    ? Math.PI * (R * R - r * r)
    : 2 * Math.PI * pos * (R - r);

  return (
    <div className="viz">
      <div className="viz-controls">
        <Choice value={method} onChange={setMethod}
                options={[
                  { value: 'washer', label: tr('washer  ⟂  about x-axis', 'шайба  ⟂  навколо осі x') },
                  { value: 'shell', label: tr('shell  ∥  about y-axis', 'оболонка  ∥  навколо осі y') },
                ]} />
      </div>

      <Plot xDomain={[-0.4, 4.4]} yDomain={[-0.3, 2.4]} xLabel="x" height={240}>
        {(s) => {
          const band = `${samplePath(top, A, B, s, [-0.3, 2.4])}L${s.sx(B)} ${s.sy(bot(B))}${
            samplePath(bot, B, A, s, [-0.3, 2.4]).replace('M', 'L')}Z`;
          return (
            <>
              <path className="viz-region" d={band} />
              {method === 'washer' ? (
                <>
                  <line className="viz-slice" x1={s.sx(pos)} x2={s.sx(pos)} y1={s.sy(r)} y2={s.sy(R)} />
                  <line className="viz-radius" x1={s.sx(pos)} x2={s.sx(pos)} y1={s.sy(0)} y2={s.sy(r)} strokeDasharray="3 3" />
                  <circle className="viz-point" cx={s.sx(pos)} cy={s.sy(R)} r={3.5} />
                  <circle className="viz-point" cx={s.sx(pos)} cy={s.sy(r)} r={3.5} />
                  <text className="viz-annot" x={s.sx(pos) + 7} y={s.sy((R + r) / 2)}>R−r</text>
                </>
              ) : (
                <>
                  <rect className="viz-shell" x={s.sx(pos) - 4} width={8} y={s.sy(R)} height={s.sy(r) - s.sy(R)} />
                  <line className="viz-radius" x1={s.sx(0)} x2={s.sx(pos)} y1={s.sy(-0.15)} y2={s.sy(-0.15)} />
                  <text className="viz-annot" x={s.sx(pos / 2)} y={s.sy(-0.15) - 5} textAnchor="middle">r = x</text>
                  <text className="viz-annot" x={s.sx(pos) + 9} y={s.sy((R + r) / 2)}>h</text>
                </>
              )}
              <path className="viz-curve" d={samplePath(top, A, B, s, [-0.3, 2.4])} />
              <path className="viz-curve" d={samplePath(bot, A, B, s, [-0.3, 2.4])} />
            </>
          );
        }}
      </Plot>

      <Slider label={tr('slice at x', 'зріз у точці x')} value={pos} min={0.05} max={3.95} step={0.05} onChange={setPos}
              format={(v) => v.toFixed(2)} />

      <Readout items={[
        { label: method === 'washer' ? 'π(R²−r²)' : '2πr·h', value: sliceVal.toFixed(3) },
        { label: method === 'washer' ? 'R, r' : 'r, h', value: method === 'washer' ? `${R.toFixed(2)}, ${r.toFixed(2)}` : `${pos.toFixed(2)}, ${(R - r).toFixed(2)}` },
        { label: tr('total volume', 'повний об’єм'), value: volume.toFixed(4) },
      ]} />

      <p className="viz-note">
        <L
          en={<>
            Same region, two ways to slice it. The <b>washer</b> cuts perpendicular to the axis of revolution, so
            the slice is an annulus and you subtract <em>areas</em> — <code>π(R²−r²)</code>, never
            <code>π(R−r)²</code>. The <b>shell</b> cuts parallel, so the slice sweeps a cylinder of circumference
            <code>2πr</code> and height <code>h</code>. Slide across and watch which quantity stays simple: about
            the y-axis, the shell needs no inversion of √x, which is the whole reason to reach for it.
          </>}
          uk={<>
            Та сама область, два способи її нарізати. <b>Шайба</b> ріже перпендикулярно до осі обертання, тож
            зріз — це кільце, і віднімати треба <em>площі</em>: <code>π(R²−r²)</code>, а не
            <code> π(R−r)²</code>. <b>Оболонка</b> ріже паралельно, тож зріз замітає циліндр із довжиною кола
            <code> 2πr</code> і висотою <code>h</code>. Поводіть повзунок і стежте, яка величина лишається
            простою: навколо осі y оболонці не треба обертати √x — саме заради цього її й обирають.
          </>}
        />
      </p>
    </div>
  );
}
