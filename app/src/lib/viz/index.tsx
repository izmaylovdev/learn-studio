import { RiemannViz } from './RiemannViz';
import { TaylorViz } from './TaylorViz';
import { SeriesViz } from './SeriesViz';
import { PolarViz } from './PolarViz';
import { SolidViz } from './SolidViz';
import { ParametricViz } from './ParametricViz';
import { BayesViz } from './BayesViz';
import { CLTViz } from './CLTViz';
import { DistributionViz } from './DistributionViz';
import { CovarianceViz } from './CovarianceViz';
import { FuseViz } from './FuseViz';
import { KalmanViz } from './KalmanViz';
import { AreaBetweenViz } from './AreaBetweenViz';
import { SliceOrientationViz } from './SliceOrientationViz';
import { TaylorScene } from './scenes/TaylorScene';
import { CLTScene } from './scenes/CLTScene';
import { FTCAccumulateScene } from './scenes/FTCAccumulateScene';
import { FTCTelescopeScene } from './scenes/FTCTelescopeScene';
import { useT } from '../i18n';

const REGISTRY = {
  riemann: RiemannViz,
  taylor: TaylorViz,
  series: SeriesViz,
  polar: PolarViz,
  solid: SolidViz,
  parametric: ParametricViz,
  bayes: BayesViz,
  clt: CLTViz,
  distribution: DistributionViz,
  covariance: CovarianceViz,
  fuse: FuseViz,
  kalman: KalmanViz,
  'area-between': AreaBetweenViz,
  'slice-orientation': SliceOrientationViz,
} as const;

/**
 * Scenes live in their own namespace behind `type: scene`, because they are a
 * different contract with the reader: the figures above are things you operate,
 * a scene is something that plays and makes an argument.
 */
const SCENES = {
  'taylor-build': TaylorScene,
  'clt-emerge': CLTScene,
  'ftc-accumulate': FTCAccumulateScene,
  'ftc-telescope': FTCTelescopeScene,
} as const;

export type VizType = keyof typeof REGISTRY;
export const VIZ_TYPES = Object.keys(REGISTRY) as VizType[];
export type SceneName = keyof typeof SCENES;
export const SCENE_NAMES = Object.keys(SCENES) as SceneName[];

/** Body of a ```viz fence is `key: value` lines; `type` is required, `name` selects a scene. */
function parse(source: string): Record<string, string> {
  return Object.fromEntries(
    source.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
      const i = l.indexOf(':');
      return i === -1 ? [l, ''] : [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
  );
}

function Unknown({ what, given, options }: { what: 'unknownScene' | 'unknownViz'; given: string; options: string[] }) {
  const t = useT();
  return (
    <div className="viz viz-error">
      <b>{t(what)} <code>{given || '(none)'}</code></b>
      <p>{t('available')}: {options.map((t) => <code key={t}>{t}</code>).reduce((a, b) => <>{a}, {b}</>)}</p>
    </div>
  );
}

export function Viz({ source }: { source: string }) {
  const { type, name } = parse(source);

  if (type === 'scene') {
    const S = SCENES[name as SceneName];
    return S ? <S /> : <Unknown what="unknownScene" given={name} options={SCENE_NAMES} />;
  }

  const Component = REGISTRY[type as VizType];
  if (!Component) return <Unknown what="unknownViz" given={type} options={[...VIZ_TYPES, 'scene']} />;
  return <Component />;
}
