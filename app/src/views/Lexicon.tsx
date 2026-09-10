import { useMemo, useState } from 'react';
import type { Graph, SymbolKind } from '../types';
import { KIND_GLOSS, KIND_NAME, KIND_ORDER } from '../lib/formula/kinds';

/** Every symbol in the library, searchable — for when you meet a glyph cold. */
export function Lexicon({ graph, query }: { graph: Graph; query: string }) {
  const [q, setQ] = useState(query);
  const [kind, setKind] = useState<SymbolKind | null>(null);

  const all = useMemo(() => Object.values(graph.symbols ?? {}), [graph.symbols]);
  const usage = graph.symbolUsage ?? {};

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all
      .filter((s) => !kind || s.kind === kind)
      .filter((s) =>
        !needle ||
        [s.glyph, s.name, s.say, s.def, s.eg, s.id].some((f) => (f ?? '').toLowerCase().includes(needle))
      )
      .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.name.localeCompare(b.name));
  }, [all, q, kind]);

  const kindsPresent = KIND_ORDER.filter((k) => all.some((s) => s.kind === k));

  return (
    <div className="page">
      <h2 className="page-title">Lexicon</h2>
      <p className="lede">
        Every symbol used in the library. A glyph can mean different things in different formulas —
        the entries here are the general meaning, and each formula can override it locally.
      </p>

      <div className="lex-bar">
        <input
          className="lex-search"
          value={q}
          autoFocus
          placeholder="Search a glyph, a name, or what it does…"
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="fx-kinds">
          {kindsPresent.map((k) => (
            <button key={k} className={`fx-chip${kind === k ? ' on' : ''}`} data-kind={k}
                    title={KIND_GLOSS[k]} onClick={() => setKind(kind === k ? null : k)}>
              <span className="fx-dot" />{KIND_NAME[k]}
            </button>
          ))}
        </div>
      </div>

      {all.length === 0 ? (
        <p className="empty">
          No symbols yet. Add them to <code>library/symbols.yml</code>, then reference them from a
          <code> ```formula </code> block.
        </p>
      ) : rows.length === 0 ? (
        <p className="empty">Nothing matches “{q}”.</p>
      ) : (
        <div className="lex-list">
          {rows.map((s) => {
            const used = usage[s.id] ?? [];
            return (
              <div className="lex-row" key={s.id}>
                <div className="lex-glyph" data-kind={s.kind}>{s.glyph}</div>
                <div className="lex-main">
                  <div className="lex-head">
                    <b>{s.name}</b>
                    <span className="fx-kindtag" data-kind={s.kind}>{KIND_NAME[s.kind]}</span>
                    {s.say && <span className="lex-say">{s.say}</span>}
                  </div>
                  <p className="lex-def">{s.def}</p>
                  {s.eg && <p className="lex-eg">{s.eg}</p>}
                  <div className="lex-used">
                    {used.length ? (
                      <>
                        <span className="lex-used-label">appears in</span>
                        {dedupe(used).map((u) => (
                          <a key={u.concept} className="badge" href={`#/c/${u.concept}`}>{u.title}</a>
                        ))}
                      </>
                    ) : (
                      <span className="lex-unused">not yet used in any formula</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function dedupe<T extends { concept: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((i) => (seen.has(i.concept) ? false : (seen.add(i.concept), true)));
}
