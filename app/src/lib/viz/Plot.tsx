import type { ReactNode } from 'react';

export interface Scales {
  /** data x → pixel x */ sx: (v: number) => number;
  /** data y → pixel y */ sy: (v: number) => number;
  /** data length → pixel length, x axis */ dx: (v: number) => number;
  w: number;
  h: number;
  /** plot-area bounds in px — overlays must stay inside these or they cover the tick labels */
  top: number;
  bottom: number;
}

const PAD = { l: 38, r: 14, t: 12, b: 26 };

/** Nice round tick values covering [a,b] with roughly `count` ticks. */
export function ticks(a: number, b: number, count = 6): number[] {
  const raw = (b - a) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? mag * 10;
  const out: number[] = [];
  for (let v = Math.ceil(a / step) * step; v <= b + step / 1e6; v += step) {
    out.push(Math.abs(v) < step / 1e6 ? 0 : Number(v.toFixed(10)));
  }
  return out;
}

/** Sample f, breaking the path at singularities so asymptotes don't draw a spike. */
export function samplePath(
  f: (x: number) => number,
  a: number,
  b: number,
  s: Scales,
  yDomain: [number, number],
  n = 240
): string {
  let d = '';
  let pen = false;
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    const y = f(x);
    if (!Number.isFinite(y) || y < yDomain[0] - 1e3 || y > yDomain[1] + 1e3) { pen = false; continue; }
    d += `${pen ? 'L' : 'M'}${s.sx(x).toFixed(2)} ${s.sy(y).toFixed(2)}`;
    pen = true;
  }
  return d;
}

export function Plot({
  xDomain, yDomain, height = 230, children, xLabel, yLabel,
}: {
  xDomain: [number, number];
  yDomain: [number, number];
  height?: number;
  xLabel?: string;
  yLabel?: string;
  children: (s: Scales) => ReactNode;
}) {
  const W = 560;
  const H = height;
  const w = W - PAD.l - PAD.r;
  const h = H - PAD.t - PAD.b;
  const [x0, x1] = xDomain;
  const [y0, y1] = yDomain;

  const s: Scales = {
    sx: (v) => PAD.l + ((v - x0) / (x1 - x0)) * w,
    sy: (v) => PAD.t + h - ((v - y0) / (y1 - y0)) * h,
    dx: (v) => (v / (x1 - x0)) * w,
    w,
    h,
    top: PAD.t,
    bottom: PAD.t + h,
  };

  const xt = ticks(x0, x1);
  const yt = ticks(y0, y1, 5);
  const axisY = s.sy(Math.max(y0, Math.min(y1, 0)));
  const axisX = s.sx(Math.max(x0, Math.min(x1, 0)));

  return (
    <svg className="plot" viewBox={`0 0 ${W} ${H}`} role="img">
      {xt.map((t) => (
        <line key={`gx${t}`} className="plot-grid" x1={s.sx(t)} x2={s.sx(t)} y1={PAD.t} y2={PAD.t + h} />
      ))}
      {yt.map((t) => (
        <line key={`gy${t}`} className="plot-grid" x1={PAD.l} x2={PAD.l + w} y1={s.sy(t)} y2={s.sy(t)} />
      ))}

      <line className="plot-axis" x1={PAD.l} x2={PAD.l + w} y1={axisY} y2={axisY} />
      <line className="plot-axis" x1={axisX} x2={axisX} y1={PAD.t} y2={PAD.t + h} />

      {xt.map((t) => (
        <text key={`tx${t}`} className="plot-tick" x={s.sx(t)} y={PAD.t + h + 15} textAnchor="middle">{t}</text>
      ))}
      {yt.map((t) => (
        <text key={`ty${t}`} className="plot-tick" x={PAD.l - 6} y={s.sy(t) + 3.5} textAnchor="end">{t}</text>
      ))}

      {xLabel && <text className="plot-label" x={PAD.l + w} y={PAD.t + h + 15} textAnchor="end">{xLabel}</text>}
      {yLabel && <text className="plot-label" x={PAD.l - 4} y={PAD.t - 2} textAnchor="end">{yLabel}</text>}

      {children(s)}
    </svg>
  );
}

/** Labelled slider + value readout, the standard control for these figures. */
export function Slider({
  label, value, min, max, step = 1, onChange, format,
}: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; format?: (v: number) => string;
}) {
  return (
    <label className="viz-slider">
      <span className="viz-slider-label">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
             onChange={(e) => onChange(Number(e.target.value))} />
      <span className="viz-slider-value">{format ? format(value) : value}</span>
    </label>
  );
}

export function Choice<T extends string>({
  value, options, onChange,
}: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="viz-choice">
      {options.map((o) => (
        <button key={o.value} className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Readout({ items }: { items: { label: string; value: string; tone?: 'good' | 'warn' }[] }) {
  return (
    <div className="viz-readout">
      {items.map((i) => (
        <div key={i.label} className={`viz-stat${i.tone ? ` ${i.tone}` : ''}`}>
          <span className="viz-stat-v">{i.value}</span>
          <span className="viz-stat-k">{i.label}</span>
        </div>
      ))}
    </div>
  );
}
