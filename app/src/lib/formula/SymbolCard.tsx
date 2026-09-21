import type { Symbol_ } from '../../types';
import { KIND_GLOSS, KIND_NAME } from './kinds';

/**
 * One symbol, explained. Shared by the `formula` block's inspector pane and
 * the drawer that every other formula on the page opens, so that clicking a ∫
 * tells you the same thing wherever you clicked it.
 */
export function SymbolCard({
  sym, note = '', siblings = [], onPickSibling,
}: {
  sym: Symbol_;
  /** what this symbol is doing in this particular line, when an author said so */
  note?: string;
  /** other lexicon entries that render as the same mark */
  siblings?: Symbol_[];
  onPickSibling?: (id: string) => void;
}) {
  return (
    <>
      <div className="fx-glyphrow">
        <span className="fx-glyph" data-kind={sym.kind}>{sym.glyph}</span>
        <div>
          <div className="fx-gname">{sym.name}</div>
          {sym.say && <div className="fx-gsay">{sym.say}</div>}
        </div>
      </div>
      <div className="fx-kindline">
        <span className="fx-kindtag" data-kind={sym.kind}>{KIND_NAME[sym.kind]}</span>
        <span className="fx-gsay">{KIND_GLOSS[sym.kind]}</span>
      </div>
      <dl className="fx-dl">
        {note && (
          <div><dt>In this formula</dt><dd className="fx-local">{note}</dd></div>
        )}
        <div><dt>What it is</dt><dd>{sym.def}</dd></div>
        {sym.eg && <div><dt>Worth knowing</dt><dd>{sym.eg}</dd></div>}
      </dl>

      {siblings.length > 0 && (
        <div className="fx-senses">
          <dt>The same mark elsewhere</dt>
          <div className="fx-senserow">
            {siblings.map((o) => (
              <button
                key={o.id}
                className="fx-sense"
                data-kind={o.kind}
                title={o.def}
                onClick={() => onPickSibling?.(o.id)}
              >
                <span className="fx-dot" />{o.name}
              </button>
            ))}
          </div>
          <p className="fx-sensenote">
            Which one this is was inferred from the concept you are reading. If it looks wrong,
            the other reading is one click away.
          </p>
        </div>
      )}

      <a className="fx-more" href={`#/lexicon?q=${encodeURIComponent(sym.name)}`}>
        See every formula that uses it →
      </a>
    </>
  );
}
