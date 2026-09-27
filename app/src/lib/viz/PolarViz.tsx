import { useState, type ReactNode } from 'react';
import { Slider, Choice, Readout } from './Plot';
import { L, useTr } from '../i18n';

interface Spec { label: string; r: (t: number) => number; span: number; max: number; note: ReactNode }

const CURVES: Record<string, Spec> = {
  rose3: { label: 'r = cos 3θ', r: (t) => Math.cos(3 * t), span: Math.PI, max: 1,
    note: <L en="three petals — the curve retraces itself after π, which is why odd n gives n petals"
             uk="три пелюстки — після π крива проходить себе вдруге, тому непарне n дає n пелюсток" /> },
  rose4: { label: 'r = cos 2θ', r: (t) => Math.cos(2 * t), span: 2 * Math.PI, max: 1,
    note: <L en="four petals — even n needs a full 2π sweep to close, giving 2n petals"
             uk="чотири пелюстки — парному n для замикання потрібен повний оберт 2π, і пелюсток 2n" /> },
  cardioid: { label: 'r = 1 + cos θ', r: (t) => 1 + Math.cos(t), span: 2 * Math.PI, max: 2,
    note: <L en="a cardioid, traced once over a full 2π" uk="кардіоїда, яку обходять один раз за повні 2π" /> },
  circle: { label: 'r = 2cos θ', r: (t) => 2 * Math.cos(t), span: Math.PI, max: 2,
    note: <L en="a circle through the origin — traced completely in only π, not 2π"
             uk="коло через початок координат — повністю окреслюється вже за π, а не 2π" /> },
  spiral: { label: 'r = θ/3', r: (t) => t / 3, span: 4 * Math.PI, max: 4.2,
    note: <L en="an Archimedean spiral, which never closes" uk="спіраль Архімеда, яка ніколи не замикається" /> },
};
type Key = keyof typeof CURVES;

const SIZE = 300;

/** Sweeping the angle shows both the trace and the (1/2)r²dθ sector accumulating. */
export function PolarViz() {
  const tr = useTr();
  const [key, setKey] = useState<Key>('rose3');
  const [frac, setFrac] = useState(0.55);

  const spec = CURVES[key];
  const upto = spec.span * frac;
  const R = spec.max * 1.12;
  const px = (t: number) => SIZE / 2 + (spec.r(t) * Math.cos(t) / R) * (SIZE / 2 - 12);
  const py = (t: number) => SIZE / 2 - (spec.r(t) * Math.sin(t) / R) * (SIZE / 2 - 12);

  const N = 600;
  let full = '', swept = '', sector = `M${SIZE / 2} ${SIZE / 2}`;
  for (let i = 0; i <= N; i++) {
    const t = (spec.span * i) / N;
    full += `${i ? 'L' : 'M'}${px(t).toFixed(2)} ${py(t).toFixed(2)}`;
    if (t <= upto) {
      swept += `${i ? 'L' : 'M'}${px(t).toFixed(2)} ${py(t).toFixed(2)}`;
      sector += `L${px(t).toFixed(2)} ${py(t).toFixed(2)}`;
    }
  }
  sector += 'Z';

  // (1/2)∫r²dθ by Simpson-ish sampling
  let area = 0;
  const M = 2000;
  for (let i = 0; i < M; i++) {
    const t = (upto * (i + 0.5)) / M;
    area += 0.5 * spec.r(t) ** 2 * (upto / M);
  }

  return (
    <div className="viz">
      <div className="viz-controls">
        <Choice value={key} onChange={setKey}
                options={(Object.keys(CURVES) as Key[]).map((k) => ({ value: k, label: CURVES[k].label }))} />
      </div>

      <svg className="plot polar" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img">
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <circle key={g} className="plot-grid" cx={SIZE / 2} cy={SIZE / 2} r={g * (SIZE / 2 - 12)} fill="none" />
        ))}
        <line className="plot-axis" x1={6} x2={SIZE - 6} y1={SIZE / 2} y2={SIZE / 2} />
        <line className="plot-axis" x1={SIZE / 2} x2={SIZE / 2} y1={6} y2={SIZE - 6} />
        <path className="viz-sector" d={sector} />
        <path className="viz-ghost" d={full} />
        <path className="viz-approx" d={swept} />
        <line className="viz-radius" x1={SIZE / 2} y1={SIZE / 2} x2={px(upto)} y2={py(upto)} />
        <circle className="viz-point" cx={px(upto)} cy={py(upto)} r={4} />
      </svg>

      <Slider label={tr('θ swept', 'пройдений θ')} value={frac} min={0} max={1} step={0.005} onChange={setFrac}
              format={(v) => `${(v * spec.span / Math.PI).toFixed(2)}π`} />

      <Readout items={[
        { label: tr('r at this θ', 'r при цьому θ'), value: spec.r(upto).toFixed(3) },
        { label: tr('area swept  ½∫r²dθ', 'заметена площа  ½∫r²dθ'), value: area.toFixed(4) },
        { label: tr('full sweep', 'повний оберт'), value: `${(spec.span / Math.PI).toFixed(2)}π` },
      ]} />

      <p className="viz-note">
        <L
          en={<>
            The shaded wedge is the accumulated <code>½r²dθ</code>. Watch <b>r</b> pass through zero — those are
            the angles where one loop closes and the next opens, and they are the limits you want for a
            single-petal area. {spec.note}. Sweeping past the full span retraces the curve and double-counts
            the area, which is the classic error in polar area problems.
          </>}
          uk={<>
            Затінений сектор — це накопичене <code>½r²dθ</code>. Стежте, як <b>r</b> проходить через нуль: на цих
            кутах одна петля замикається й відкривається наступна, і саме вони є межами для площі однієї
            пелюстки. {spec.note}. Якщо пройти далі за повний проміжок, крива піде вдруге й площа
            порахується двічі — класична помилка в задачах на площу в полярних координатах.
          </>}
        />
      </p>
    </div>
  );
}
