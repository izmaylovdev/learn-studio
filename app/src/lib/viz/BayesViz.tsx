import { useState } from 'react';
import { Readout, Slider } from './Plot';
import { L, useTr } from '../i18n';

/**
 * The base-rate result stated in fractions is easy to disbelieve. Drawn as an
 * area of 10,000 people it stops being arguable — the false-positive block is
 * visibly bigger than the true-positive one long before the test looks "bad".
 */
export function BayesViz() {
  const tr = useTr();
  const [prevPer10k, setPrev] = useState(1);   // ill people per 10,000
  const [sens, setSens] = useState(99);        // % of ill who test positive
  const [spec, setSpec] = useState(99);        // % of healthy who test negative

  const N = 10000;
  const ill = (prevPer10k * N) / 10000;
  const healthy = N - ill;
  const truePos = (ill * sens) / 100;
  const falsePos = (healthy * (100 - spec)) / 100;
  const ppv = truePos + falsePos > 0 ? truePos / (truePos + falsePos) : 0;

  // 100×100 grid of people; colour each cell by which quadrant it falls in
  const COLS = 100, ROWS = 100, CELL = 5.4;
  const nTP = Math.round(truePos), nFP = Math.round(falsePos), nFN = Math.round(ill - truePos);
  const kind = (i: number) =>
    i < nTP ? 'tp' : i < nTP + nFN ? 'fn' : i < nTP + nFN + nFP ? 'fp' : 'tn';
  const fill = { tp: 'var(--mastered)', fn: 'var(--learning)', fp: 'var(--danger)', tn: 'var(--line)' } as const;

  const cells = [];
  for (let i = 0; i < COLS * ROWS; i++) {
    const k = kind(i);
    if (k === 'tn') continue;               // the huge healthy-and-negative block stays background
    cells.push(
      <rect key={i} x={(i % COLS) * CELL} y={Math.floor(i / COLS) * CELL}
            width={CELL - 0.6} height={CELL - 0.6} fill={fill[k]} />
    );
  }

  return (
    <div className="viz">
      <svg viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`} className="viz-svg" role="img"
           aria-label={tr('Ten thousand people, coloured by test result and true status',
                          'Десять тисяч людей, забарвлених за результатом тесту та справжнім станом')}>
        <rect x={0} y={0} width={COLS * CELL} height={ROWS * CELL} fill="var(--bg-soft)" />
        {cells}
      </svg>

      <div className="viz-legend">
        <span><i style={{ background: 'var(--mastered)' }} /> {tr('ill, tests +', 'хворі, тест +')} ({nTP})</span>
        <span><i style={{ background: 'var(--danger)' }} /> {tr('healthy, tests +', 'здорові, тест +')} ({nFP})</span>
        <span><i style={{ background: 'var(--learning)' }} /> {tr('ill, tests −', 'хворі, тест −')} ({nFN})</span>
        <span><i style={{ background: 'var(--line)' }} /> {tr('healthy, tests −', 'здорові, тест −')} </span>
      </div>

      <Slider label={tr('ill per 10,000', 'хворих на 10 000')} value={prevPer10k} min={1} max={2000} onChange={setPrev} />
      <Slider label={tr('sensitivity %', 'чутливість %')} value={sens} min={50} max={100} onChange={setSens} />
      <Slider label={tr('specificity %', 'специфічність %')} value={spec} min={50} max={100} onChange={setSpec} />

      <Readout items={[
        { label: tr('P(ill | tested +)', 'P(хворий | тест +)'), value: `${(ppv * 100).toFixed(1)}%`,
          tone: ppv < 0.5 ? 'warn' : 'good' },
        { label: tr('P(tested + | ill)', 'P(тест + | хворий)'), value: `${sens}%` },
        { label: tr('false positives per true one', 'хибних позитивів на один справжній'), value: truePos > 0 ? (falsePos / truePos).toFixed(1) : '∞' },
      ]} />

      <p className="viz-note">
        <L
          en={<>
            The two readouts are the <em>same test</em> read in opposite directions, and they are not close.
            Start at 1 in 10,000 with a 99% test — barely 1% of positives are real, because the red block
            (healthy people misclassified) dwarfs the green one. Now drag the prevalence up: the answer climbs
            past 50% somewhere around <b>1 in 100</b>. <b>Nothing about the test changed.</b> The base rate is
            doing all the work, which is exactly the term the prosecutor's fallacy drops.
          </>}
          uk={<>
            Два перші показники — це <em>той самий тест</em>, прочитаний у протилежних напрямках, і вони зовсім
            не близькі. Почніть з 1 на 10 000 і тесту на 99% — справжні ледве 1% позитивних, бо червоний блок
            (здорові, яких класифіковано хибно) значно більший за зелений. Тепер збільшуйте поширеність: відповідь
            перевалює за 50% десь біля <b>1 на 100</b>. <b>У самому тесті нічого не змінилося.</b> Усю роботу
            робить базова частота — якраз той член, який відкидає помилка прокурора.
          </>}
        />
      </p>
    </div>
  );
}
