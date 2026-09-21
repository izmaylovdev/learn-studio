import { useState } from 'react';
import { Plot, Slider, Choice, Readout } from './Plot';

/**
 * The classic pick-your-variable region: the parabola x = y² and the line
 * x = y + 2, meeting at (1,−1) and (4,2).
 *
 * Horizontal slices see one left curve and one right curve for the whole
 * region. Vertical slices see the parabola's *lower* branch as the floor until
 * x = 1, then the line — so the same region needs two integrals.
 */
const SPLIT = 1;            // x where the floor changes formula
const AREA = 4.5;           // ∫(y + 2 − y²) dy over [−1,2]
const yD: [number, number] = [-1.5, 2.5];
const xD: [number, number] = [-0.5, 5.2];

const topV = (x: number) => Math.sqrt(x);
const botV = (x: number) => (x <= SPLIT ? -Math.sqrt(x) : x - 2);

type Mode = 'dx' | 'dy';

export function SliceOrientationViz() {
  const [mode, setMode] = useState<Mode>('dy');
  const [posX, setPosX] = useState(2.2);
  const [posY, setPosY] = useState(0.6);

  const combs = mode === 'dx'
    ? Array.from({ length: 23 }, (_, i) => 0.08 + (i * (4 - 0.16)) / 22)
    : Array.from({ length: 19 }, (_, i) => -0.94 + (i * 2.88) / 18);

  const extent = mode === 'dx' ? topV(posX) - botV(posX) : posY + 2 - posY * posY;

  return (
    <div className="viz">
      <div className="viz-controls">
        <Choice value={mode} onChange={setMode}
                options={[{ value: 'dx', label: 'vertical slices  ·  dx' }, { value: 'dy', label: 'horizontal slices  ·  dy' }]} />
      </div>

      <Plot xDomain={xD} yDomain={yD} xLabel="x" yLabel="y" height={310}>
        {(s) => {
          // The region itself, traced in y: up the parabola, back down the line.
          const N = 120;
          let d = '';
          for (let i = 0; i <= N; i++) {
            const y = -1 + (3 * i) / N;
            d += `${i ? 'L' : 'M'}${s.sx(y * y).toFixed(2)} ${s.sy(y).toFixed(2)}`;
          }
          for (let i = N; i >= 0; i--) {
            const y = -1 + (3 * i) / N;
            d += `L${s.sx(y + 2).toFixed(2)} ${s.sy(y).toFixed(2)}`;
          }
          d += 'Z';

          return (
            <>
              <path className="viz-region" d={d} />

              {combs.map((v) =>
                mode === 'dx' ? (
                  <line key={v} className={`viz-cut${v > SPLIT ? ' two' : ''}`}
                        x1={s.sx(v)} x2={s.sx(v)} y1={s.sy(botV(v))} y2={s.sy(topV(v))} />
                ) : (
                  <line key={v} className="viz-cut"
                        x1={s.sx(v * v)} x2={s.sx(v + 2)} y1={s.sy(v)} y2={s.sy(v)} />
                )
              )}

              {mode === 'dx' && (
                <>
                  <line className="viz-marker" x1={s.sx(SPLIT)} x2={s.sx(SPLIT)} y1={s.top} y2={s.bottom} />
                  <text className="viz-annot" x={s.sx(SPLIT) + 6} y={s.top + 12}>floor changes here</text>
                </>
              )}

              <path className="viz-curve" d={d} />

              {mode === 'dx' ? (
                <>
                  <line className={`viz-cut wide${posX > SPLIT ? ' two' : ''}`}
                        x1={s.sx(posX)} x2={s.sx(posX)} y1={s.sy(botV(posX))} y2={s.sy(topV(posX))} />
                  <text className="viz-annot" x={s.sx(posX)} y={s.sy(topV(posX)) - 9} textAnchor="middle">
                    {posX <= SPLIT ? '√x − (−√x)' : '√x − (x−2)'}
                  </text>
                </>
              ) : (
                <>
                  <line className="viz-cut wide"
                        x1={s.sx(posY * posY)} x2={s.sx(posY + 2)} y1={s.sy(posY)} y2={s.sy(posY)} />
                  <text className="viz-annot" x={s.sx(posY + 2) + 8} y={s.sy(posY) + 3.5}>
                    (y+2) − y²
                  </text>
                </>
              )}

              <text className="viz-annot" x={s.sx(4.0)} y={s.sy(2.32)} textAnchor="end">x = y + 2</text>
              <text className="viz-annot" x={s.sx(2.7)} y={s.sy(-1.2)} textAnchor="end">x = y²</text>
            </>
          );
        }}
      </Plot>

      {mode === 'dx'
        ? <Slider label="slice at x" value={posX} min={0.05} max={3.95} step={0.05} onChange={setPosX}
                  format={(v) => v.toFixed(2)} />
        : <Slider label="slice at y" value={posY} min={-0.95} max={1.95} step={0.05} onChange={setPosY}
                  format={(v) => v.toFixed(2)} />}

      <Readout items={[
        { label: mode === 'dx' ? 'slice height' : 'slice width', value: extent.toFixed(3) },
        { label: 'integrals needed', value: mode === 'dx' ? '2' : '1', tone: mode === 'dx' ? 'warn' : 'good' },
        { label: 'area either way', value: AREA.toFixed(3) },
      ]} />

      <p className="viz-note">
        Same region, same answer, two setups. Drag the <b>vertical</b> slice from left to right and watch its
        bottom endpoint jump formula at x = 1: before the corner the floor is the parabola's lower branch
        <code>−√x</code>, after it the line <code>x−2</code>. No single integrand covers both, so you write two
        integrals — and you had to notice the corner to know that. The <b>horizontal</b> slice never changes
        its story: left end on <code>y²</code>, right end on <code>y+2</code>, all the way from y = −1 to
        y = 2. Choosing dy here is not a trick, it is reading which boundary is a <em>single</em> function of
        which variable. That decision, made before you write anything down, is usually the whole problem.
      </p>
    </div>
  );
}
