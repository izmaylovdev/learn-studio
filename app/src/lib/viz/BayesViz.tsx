import { useState } from 'react';
import { Readout, Slider } from './Plot';

/**
 * The base-rate result stated in fractions is easy to disbelieve. Drawn as an
 * area of 10,000 people it stops being arguable — the false-positive block is
 * visibly bigger than the true-positive one long before the test looks "bad".
 */
export function BayesViz() {
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
           aria-label="Ten thousand people, coloured by test result and true status">
        <rect x={0} y={0} width={COLS * CELL} height={ROWS * CELL} fill="var(--bg-soft)" />
        {cells}
      </svg>

      <div className="viz-legend">
        <span><i style={{ background: 'var(--mastered)' }} /> ill, tests + ({nTP})</span>
        <span><i style={{ background: 'var(--danger)' }} /> healthy, tests + ({nFP})</span>
        <span><i style={{ background: 'var(--learning)' }} /> ill, tests − ({nFN})</span>
        <span><i style={{ background: 'var(--line)' }} /> healthy, tests − </span>
      </div>

      <Slider label="ill per 10,000" value={prevPer10k} min={1} max={2000} onChange={setPrev} />
      <Slider label="sensitivity %" value={sens} min={50} max={100} onChange={setSens} />
      <Slider label="specificity %" value={spec} min={50} max={100} onChange={setSpec} />

      <Readout items={[
        { label: 'P(ill | tested +)', value: `${(ppv * 100).toFixed(1)}%`,
          tone: ppv < 0.5 ? 'warn' : 'good' },
        { label: 'P(tested + | ill)', value: `${sens}%` },
        { label: 'false positives per true one', value: truePos > 0 ? (falsePos / truePos).toFixed(1) : '∞' },
      ]} />

      <p className="viz-note">
        The two readouts are the <em>same test</em> read in opposite directions, and they are not close.
        Start at 1 in 10,000 with a 99% test — barely 1% of positives are real, because the red block
        (healthy people misclassified) dwarfs the green one. Now drag the prevalence up: the answer climbs
        past 50% somewhere around <b>1 in 100</b>. <b>Nothing about the test changed.</b> The base rate is
        doing all the work, which is exactly the term the prosecutor's fallacy drops.
      </p>
    </div>
  );
}
