import { RiemannViz } from './RiemannViz';
import { TaylorViz } from './TaylorViz';
import { SeriesViz } from './SeriesViz';
import { PolarViz } from './PolarViz';
import { SolidViz } from './SolidViz';
import { ParametricViz } from './ParametricViz';

const REGISTRY = {
  riemann: RiemannViz,
  taylor: TaylorViz,
  series: SeriesViz,
  polar: PolarViz,
  solid: SolidViz,
  parametric: ParametricViz,
} as const;

export type VizType = keyof typeof REGISTRY;
export const VIZ_TYPES = Object.keys(REGISTRY) as VizType[];

/** Body of a ```viz fence is `key: value` lines; only `type` is required today. */
function parse(source: string): Record<string, string> {
  return Object.fromEntries(
    source.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
      const i = l.indexOf(':');
      return i === -1 ? [l, ''] : [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
  );
}

export function Viz({ source }: { source: string }) {
  const { type } = parse(source);
  const Component = REGISTRY[type as VizType];

  if (!Component) {
    return (
      <div className="viz viz-error">
        <b>Unknown visualization <code>{type || '(none)'}</code></b>
        <p>Available: {VIZ_TYPES.map((t) => <code key={t}>{t}</code>).reduce((a, b) => <>{a}, {b}</>)}</p>
      </div>
    );
  }
  return <Component />;
}
