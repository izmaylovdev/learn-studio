import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

let seq = 0;

export function Mermaid({ chart, theme }: { chart: string; theme: 'dark' | 'light' }) {
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);
  const idRef = useRef(`mmd-${seq++}`);

  useEffect(() => {
    let live = true;
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'neutral',
      themeVariables: { fontFamily: 'inherit', fontSize: '13px' },
      flowchart: { curve: 'basis', padding: 10 },
      securityLevel: 'strict',
    });
    mermaid
      .render(idRef.current, chart)
      .then(({ svg }) => live && (setSvg(svg), setFailed(false)))
      .catch(() => live && setFailed(true));
    return () => { live = false; };
  }, [chart, theme]);

  // A malformed diagram should show its source, not swallow the content.
  if (failed) return <pre><code>{chart}</code></pre>;
  return <div className="mermaid-box" dangerouslySetInnerHTML={{ __html: svg }} />;
}
