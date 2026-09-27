import { Plot, Readout, samplePath, type Scales } from '../Plot';
import { Scene, type Beat } from '../Scene';
import { L, useTr } from '../../i18n';

/**
 * f(t) = (t−1)(t−3). Chosen over the usual sin/cos pair on purpose: with a
 * trig function the reader can suspect they are watching a trig identity
 * rather than the theorem. A cubic and its parabola have no such folklore.
 */
const f = (t: number) => (t - 1) * (t - 3);
const F = (x: number) => x ** 3 / 3 - 2 * x ** 2 + 3 * x;

/** Where f changes sign — and so where F turns around. That is the whole lesson. */
const ROOTS = [1, 3];
const A = 0;
const B = 4;

const X: [number, number] = [-0.15, 4.15];
const Y_TOP: [number, number] = [-1.7, 3.6];
const Y_BOT: [number, number] = [-0.4, 1.8];

/** Region between f and the axis over [lo,hi], as a closed path. */
function areaPath(lo: number, hi: number, s: Scales) {
  if (hi - lo < 1e-6) return '';
  let d = `M${s.sx(lo).toFixed(2)} ${s.sy(0).toFixed(2)}`;
  const n = 64;
  for (let i = 0; i <= n; i++) {
    const t = lo + ((hi - lo) * i) / n;
    d += `L${s.sx(t).toFixed(2)} ${s.sy(f(t)).toFixed(2)}`;
  }
  return `${d}L${s.sx(hi).toFixed(2)} ${s.sy(0).toFixed(2)}Z`;
}

type S = { x: number; area: number; showF: number; tan: number };

const BEATS: Beat<S>[] = [
  { label: 'f', hold: 1.5,
    state: { x: A, area: 0, showF: 0, tan: 0 },
    caption: <L en="Here is f. Positive to begin with, then it dips below the axis between 1 and 3, then back up."
                uk="Ось f. Спочатку додатна, потім між 1 і 3 пірнає під вісь, а тоді знову виринає." /> },

  { label: <L en="accumulate" uk="накопичення" />, in: 1.7, hold: 1.9,
    state: { x: 0.6, area: 1, showF: 1, tan: 0 },
    caption: <L en="Define F(x) as the signed area from 0 out to x. Watch both panels: the lower curve is a running record of how much the shading above has swept."
                uk="Означимо F(x) як площу зі знаком від 0 до x. Стежте за обома панелями: нижня крива — поточний запис того, скільки вже замело затінення вгорі." /> },

  { label: 'f = 0', in: 1.4, hold: 2.1,
    state: { x: 1, area: 1, showF: 1, tan: 1 },
    caption: <L en="At x = 1 the curve above touches zero — nothing is being added right now. And below, F stops climbing: its tangent goes flat at exactly the moment f crossed."
                uk="При x = 1 верхня крива торкається нуля — саме зараз нічого не додається. А внизу F перестає підніматися: її дотична стає горизонтальною рівно тоді, коли f перетнула вісь." /> },

  { label: <L en="negative" uk="від’ємна" />, in: 1.8, hold: 2.1,
    state: { x: 2, area: 1, showF: 1, tan: 1 },
    caption: <L en={'Past 1, f is under the axis and that area counts as negative. F does not merely slow down — it falls. "Signed" area is not a bookkeeping detail.'}
                uk="Після 1 функція f під віссю, і ця площа рахується як від’ємна. F не просто сповільнюється — вона падає. «Площа зі знаком» — не бухгалтерська дрібниця." /> },

  { label: <L en="f = 0 again" uk="знову f = 0" />, in: 1.7, hold: 1.9,
    state: { x: 3, area: 1, showF: 1, tan: 1 },
    caption: <L en="Zero again at x = 3, and F bottoms out. Every place F turns around is a place f crossed the axis — it could not be otherwise."
                uk="Знову нуль при x = 3, і F досягає дна. Кожне місце, де F розвертається, — це місце, де f перетнула вісь, і інакше бути не могло." /> },

  { label: "F′ = f", in: 1.7, hold: 2.8,
    state: { x: B, area: 1, showF: 1, tan: 1 },
    caption: <L en="That is Part 1 in one sentence: the slope of the lower curve is the height of the upper one. The rate at which area piles up is exactly how tall the curve is at that instant."
                uk="Ось Частина 1 одним реченням: нахил нижньої кривої дорівнює висоті верхньої. Швидкість, з якою накопичується площа, — це рівно висота кривої в цю мить." /> },
];

export function FTCAccumulateScene() {
  const tr = useTr();
  return (
    <Scene
      beats={BEATS}
      render={(s) => {
        const fx = f(s.x);
        const Fx = F(s.x);

        // Measure F′ numerically rather than quoting f. The claim is that these
        // two independently computed numbers agree; deriving one from the other
        // would make the readout a tautology instead of evidence.
        const h = 1e-5;
        const slope = (F(s.x + h) - F(s.x - h)) / (2 * h);

        // Split the shading at f's roots so positive and negative area read as
        // different things, which is what makes F's fall on [1,3] make sense.
        const cuts = [A, ...ROOTS, B];
        const bands = cuts.slice(0, -1).map((lo, i) => ({
          lo, hi: Math.min(cuts[i + 1], s.x), negative: f((lo + cuts[i + 1]) / 2) < 0,
        })).filter((b) => b.hi > b.lo);

        return (
          <>
            <div className="scene-panel">{tr('f(t) — the integrand', 'f(t) — підінтегральна функція')}</div>
            <Plot xDomain={X} yDomain={Y_TOP} height={190} xTicks={false}>
              {(sc) => (
                <>
                  {bands.map((b) => (
                    <path key={b.lo} d={areaPath(b.lo, b.hi, sc)} opacity={s.area}
                          className={b.negative ? 'viz-area-neg' : 'viz-area-pos'} />
                  ))}
                  <path className="viz-curve" d={samplePath(f, X[0], X[1], sc, Y_TOP)} />
                  {s.showF > 0.01 && (
                    <>
                      <line className="viz-sweep" x1={sc.sx(s.x)} x2={sc.sx(s.x)}
                            y1={sc.top} y2={sc.bottom} opacity={s.showF} />
                      <circle className="viz-point" cx={sc.sx(s.x)} cy={sc.sy(fx)} r={3.5} opacity={s.showF} />
                    </>
                  )}
                </>
              )}
            </Plot>

            <div className="scene-panel">{tr('F(x) = ∫₀ˣ f(t) dt — the area so far', 'F(x) = ∫₀ˣ f(t) dt — площа досі')}</div>
            <Plot xDomain={X} yDomain={Y_BOT} height={190} xLabel="x">
              {(sc) => (
                <>
                  <path className="viz-ghost" d={samplePath(F, A, B, sc, Y_BOT)} opacity={0.35 * s.showF} />
                  <path className="viz-approx" d={samplePath(F, A, s.x, sc, Y_BOT)} opacity={s.showF} />
                  {s.tan > 0.01 && (
                    <line className="viz-tangent" opacity={s.tan}
                          x1={sc.sx(s.x - 0.55)} y1={sc.sy(Fx - 0.55 * fx)}
                          x2={sc.sx(s.x + 0.55)} y2={sc.sy(Fx + 0.55 * fx)} />
                  )}
                  {s.showF > 0.01 && (
                    <>
                      <line className="viz-sweep" x1={sc.sx(s.x)} x2={sc.sx(s.x)}
                            y1={sc.top} y2={sc.bottom} opacity={s.showF} />
                      <circle className="viz-point" cx={sc.sx(s.x)} cy={sc.sy(Fx)} r={3.5} opacity={s.showF} />
                    </>
                  )}
                </>
              )}
            </Plot>

            <Readout items={[
              { label: 'x', value: s.x.toFixed(2) },
              { label: tr('height f(x)', 'висота f(x)'), value: fx.toFixed(3) },
              { label: tr('slope of F, measured', 'нахил F, виміряний'), value: slope.toFixed(3), tone: 'good' },
              { label: tr('area so far F(x)', 'площа досі F(x)'), value: Fx.toFixed(3) },
            ]} />
          </>
        );
      }}
      note={
        <L
          en={<>
            The two middle readouts are computed independently — one is the height of the upper curve,
            the other is a numerical slope of the lower one — and they agree to three decimals at every
            x. Scrub to <b>x = 1</b> or <b>x = 3</b>: f is zero, the measured slope is zero, and F is
            exactly at a turning point. The shading is <b>blue where f is positive</b> and
            <b> red where it is negative</b>, which is why F falls across the middle stretch.
          </>}
          uk={<>
            Два середні показники обчислено незалежно — один є висотою верхньої кривої, другий — числовим
            нахилом нижньої, — і вони збігаються до трьох знаків за будь-якого x. Перемотайте до <b>x = 1</b>
            або <b>x = 3</b>: f дорівнює нулю, виміряний нахил — нуль, а F рівно в точці розвороту. Затінення
            <b> синє там, де f додатна</b>, і <b>червоне, де від’ємна</b>, — тому F і падає на середній ділянці.
          </>}
        />
      }
    />
  );
}
