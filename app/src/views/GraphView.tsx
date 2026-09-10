import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import type { Core } from 'cytoscape';
import type { EdgeKind, Graph } from '../types';
import { go } from '../lib/router';

cytoscape.use(dagre);

const KINDS: EdgeKind[] = ['prereq', 'related', 'mention'];

const COLORS = {
  dark: { unseen: '#4a515e', learning: '#e0af68', review: '#7dcfff', mastered: '#9ece6a',
          label: '#e4e7ec', edge: '#3a4250', accent: '#7aa2f7' },
  light: { unseen: '#c3c9d3', learning: '#c08a1e', review: '#2b8fbf', mastered: '#4f9a2f',
           label: '#1b2027', edge: '#cbd2dc', accent: '#3b6fd4' },
};

export function GraphView({ graph, theme }: { graph: Graph; theme: 'dark' | 'light' }) {
  const box = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [kinds, setKinds] = useState<Set<EdgeKind>>(new Set<EdgeKind>(['prereq', 'related']));
  const [trackFilter, setTrackFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!box.current) return;
    const c = COLORS[theme];

    const inTrack = trackFilter
      ? new Set(graph.tracks.find((t) => t.id === trackFilter)?.conceptIds ?? [])
      : null;

    const concepts = graph.concepts.filter((x) => !inTrack || inTrack.has(x.id));
    const visible = new Set(concepts.map((x) => x.id));

    const cy = cytoscape({
      container: box.current,
      elements: [
        ...concepts.map((n) => ({
          data: {
            id: n.id,
            label: n.title,
            status: graph.progress[n.id]?.status ?? 'unseen',
            weight: 26 + n.difficulty * 5,
          },
        })),
        ...graph.edges
          .filter((e) => kinds.has(e.kind) && visible.has(e.from) && visible.has(e.to))
          .map((e) => ({ data: { id: `${e.from}-${e.to}-${e.kind}`, source: e.from, target: e.to, kind: e.kind } })),
      ],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (n: cytoscape.NodeSingular) => c[n.data('status') as keyof typeof c] ?? c.unseen,
            width: 'data(weight)', height: 'data(weight)',
            label: 'data(label)', 'font-size': 11, color: c.label,
            'text-valign': 'bottom', 'text-margin-y': 5, 'text-wrap': 'wrap', 'text-max-width': '128px',
            'border-width': 2, 'border-color': 'transparent',
          },
        },
        { selector: 'node:selected', style: { 'border-color': c.accent, 'border-width': 3 } },
        {
          selector: 'edge',
          style: {
            width: 1.4, 'line-color': c.edge, 'target-arrow-color': c.edge,
            'curve-style': 'bezier', opacity: 0.85,
          },
        },
        { selector: 'edge[kind="prereq"]', style: { 'target-arrow-shape': 'triangle', width: 2, opacity: 1 } },
        { selector: 'edge[kind="related"]', style: { 'line-style': 'dashed', 'target-arrow-shape': 'none' } },
        { selector: 'edge[kind="mention"]', style: { 'line-style': 'dotted', 'target-arrow-shape': 'none', opacity: 0.5 } },
        { selector: '.dim', style: { opacity: 0.12 } },
      ],
      layout: { name: 'preset' },
      minZoom: 0.25,
      maxZoom: 2.5,
      wheelSensitivity: 0.25,
    });

    // Rank on prerequisites alone. Feeding `related` edges to dagre creates
    // cycles in the rank assignment and scrambles the top-to-bottom ordering.
    cy.nodes()
      .union(cy.edges('[kind="prereq"]'))
      .layout({ name: 'dagre', rankDir: 'TB', nodeSep: 78, rankSep: 96, edgeSep: 18 } as never)
      .run();
    cy.fit(undefined, 55);

    cy.on('tap', 'node', (evt) => go(`#/c/${evt.target.id()}`));
    // Hovering isolates a node's neighbourhood — the point of a graph view.
    cy.on('mouseover', 'node', (evt) => {
      const keep = evt.target.closedNeighborhood();
      cy.elements().difference(keep).addClass('dim');
    });
    cy.on('mouseout', 'node', () => cy.elements().removeClass('dim'));

    cyRef.current = cy;
    return () => { cy.destroy(); cyRef.current = null; };
  }, [graph, theme, kinds, trackFilter]);

  const toggle = (k: EdgeKind) =>
    setKinds((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  return (
    <div className="page wide">
      <div className="graph-wrap">
        <div className="cy" ref={box} />

        <div className="graph-controls">
          {KINDS.map((k) => (
            <button key={k} className={`chip ${kinds.has(k) ? 'on' : ''}`} onClick={() => toggle(k)}>
              {k}
            </button>
          ))}
          {graph.tracks.map((t) => (
            <button key={t.id}
                    className={`chip ${trackFilter === t.id ? 'on' : ''}`}
                    onClick={() => setTrackFilter(trackFilter === t.id ? null : t.id)}>
              {t.title}
            </button>
          ))}
          <button className="chip" onClick={() => cyRef.current?.fit(undefined, 45)}>fit</button>
        </div>

        <div className="graph-legend">
          <div className="row"><span className="dot mastered" /> mastered</div>
          <div className="row"><span className="dot review" /> in review</div>
          <div className="row"><span className="dot learning" /> learning</div>
          <div className="row"><span className="dot unseen" /> unseen</div>
          <div className="row" style={{ marginTop: 4 }}><span className="line" /> prerequisite</div>
          <div className="row"><span className="line dash" /> related</div>
          <div className="row"><span className="line dot" /> mentioned</div>
        </div>
      </div>
    </div>
  );
}
