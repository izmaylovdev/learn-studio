import { useState, type ReactNode } from 'react';
import { Slider, Choice, Readout } from './Plot';
import { L, useTr } from '../i18n';

interface Spec {
  label: ReactNode;
  x: (t: number) => number;
  y: (t: number) => number;
  span: number;
  view: [number, number, number, number];
  note: ReactNode;
}

const CURVES: Record<string, Spec> = {
  circle: { label: <L en="circle" uk="коло" />, x: Math.cos, y: Math.sin, span: 2 * Math.PI, view: [-1.4, -1.4, 1.4, 1.4],
    note: <L en="constant speed 1, so arc length is just the elapsed time — 2π"
             uk="стала швидкість 1, тож довжина дуги — це просто час, що минув, — 2π" /> },
  cycloid: { label: <L en="cycloid" uk="циклоїда" />, x: (t) => t - Math.sin(t), y: (t) => 1 - Math.cos(t), span: 2 * Math.PI,
    view: [-0.6, -0.6, 7, 2.8],
    note: <L en="speed drops to zero at the cusp, where the wheel point touches the ground"
             uk="у точці звороту, де точка колеса торкається землі, швидкість падає до нуля" /> },
  lissajous: { label: <L en="lissajous" uk="Ліссажу" />, x: (t) => Math.sin(3 * t), y: (t) => Math.sin(2 * t), span: 2 * Math.PI,
    view: [-1.4, -1.4, 1.4, 1.4],
    note: <L en="self-intersecting — no function y = f(x) can describe it"
             uk="самоперетинна — жодна функція y = f(x) її не опише" /> },
  spiral: { label: <L en="spiral" uk="спіраль" />, x: (t) => (t / 8) * Math.cos(t), y: (t) => (t / 8) * Math.sin(t), span: 6 * Math.PI,
    view: [-2.8, -2.8, 2.8, 2.8],
    note: <L en="fails the vertical line test many times over" uk="багаторазово не проходить тест вертикальної прямої" /> },
};
type Key = keyof typeof CURVES;

const S = 300;

/** A parametric curve as motion: position, velocity, and accumulated arc length. */
export function ParametricViz() {
  const tr = useTr();
  const [key, setKey] = useState<Key>('cycloid');
  const [frac, setFrac] = useState(0.45);

  const spec = CURVES[key];
  const t = spec.span * frac;
  const [x0, y0, x1, y1] = spec.view;
  const px = (v: number) => 10 + ((v - x0) / (x1 - x0)) * (S - 20);
  const py = (v: number) => S - 10 - ((v - y0) / (y1 - y0)) * (S - 20);

  const N = 700;
  let full = '', drawn = '';
  for (let i = 0; i <= N; i++) {
    const u = (spec.span * i) / N;
    const p = `${px(spec.x(u)).toFixed(2)} ${py(spec.y(u)).toFixed(2)}`;
    full += `${i ? 'L' : 'M'}${p}`;
    if (u <= t) drawn += `${i ? 'L' : 'M'}${p}`;
  }

  const h = 1e-4;
  const vx = (spec.x(t + h) - spec.x(t - h)) / (2 * h);
  const vy = (spec.y(t + h) - spec.y(t - h)) / (2 * h);
  const speed = Math.hypot(vx, vy);

  let arc = 0;
  const M = 3000;
  for (let i = 0; i < M; i++) {
    const u = (t * (i + 0.5)) / M;
    arc += Math.hypot((spec.x(u + h) - spec.x(u - h)) / (2 * h), (spec.y(u + h) - spec.y(u - h)) / (2 * h)) * (t / M);
  }

  const scale = 26 / Math.max(speed, 0.15);
  const tipX = px(spec.x(t)) + vx * scale * ((S - 20) / (x1 - x0)) / 26;
  const tipY = py(spec.y(t)) - vy * scale * ((S - 20) / (y1 - y0)) / 26;

  return (
    <div className="viz">
      <div className="viz-controls">
        <Choice value={key} onChange={setKey}
                options={(Object.keys(CURVES) as Key[]).map((k) => ({ value: k, label: CURVES[k].label }))} />
      </div>

      <svg className="plot" viewBox={`0 0 ${S} ${S}`} role="img">
        <line className="plot-axis" x1={10} x2={S - 10} y1={py(0)} y2={py(0)} />
        <line className="plot-axis" x1={px(0)} x2={px(0)} y1={10} y2={S - 10} />
        <path className="viz-ghost" d={full} />
        <path className="viz-approx" d={drawn} />
        <line className="viz-vector" x1={px(spec.x(t))} y1={py(spec.y(t))} x2={tipX} y2={tipY} />
        <circle className="viz-point" cx={px(spec.x(t))} cy={py(spec.y(t))} r={4.5} />
      </svg>

      <Slider label="t" value={frac} min={0} max={1} step={0.004} onChange={setFrac}
              format={() => t.toFixed(2)} />

      <Readout items={[
        { label: tr('position (x, y)', 'положення (x, y)'), value: `${spec.x(t).toFixed(2)}, ${spec.y(t).toFixed(2)}` },
        { label: tr('speed √(x′²+y′²)', 'швидкість √(x′²+y′²)'), value: speed.toFixed(3) },
        { label: tr('arc length so far', 'пройдена довжина дуги'), value: arc.toFixed(4) },
      ]} />

      <p className="viz-note">
        <L
          en={<>
            The dot is a particle and the arrow is its velocity — its length is the speed
            <code>√(x′²+y′²)</code>, which is exactly the arc-length integrand. So arc length is just
            <code>∫ speed dt</code>: total distance travelled. {spec.note}. Note that the curve is the same set of
            points however you parametrize it, but tracing it twice would double the arc length.
          </>}
          uk={<>
            Точка — це частинка, а стрілка — її швидкість; довжина стрілки дорівнює модулю швидкості
            <code> √(x′²+y′²)</code>, а це і є підінтегральний вираз довжини дуги. Тож довжина дуги — це просто
            <code> ∫ швидкість dt</code>, увесь пройдений шлях. {spec.note}. Зауважте: як не параметризуй криву,
            множина точок та сама, але пройшовши її двічі, ви подвоїте довжину дуги.
          </>}
        />
      </p>
    </div>
  );
}
