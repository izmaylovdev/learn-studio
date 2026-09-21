import type { FormulaSymbol, Symbol_ } from '../../types';

/**
 * KaTeX gives us beautiful output but no hooks into it. To make individual
 * symbols clickable we walk the rendered leaves, concatenate their text, and
 * find each symbol's `match` string in that stream — so authors write ordinary
 * LaTeX instead of a bespoke token DSL.
 *
 * A symbol can span several leaves (`\Delta x` is "Δ" then "x") and a leaf can
 * hold several symbols (KaTeX merges runs of same-font characters, so `uv` is
 * one span), so claiming is tracked per character, not per leaf. Matches are
 * claimed longest-first and never overlap.
 *
 * The same routine serves both callers: a `formula` block passes the symbols
 * its author listed, and every other formula on the page passes the whole
 * lexicon, ordered so the sense that fits the concept comes first.
 */
export interface Annotation {
  /** symbol ids that were located, in first-appearance order */
  found: string[];
  /** symbol ids listed but not present in the rendered output */
  missing: string[];
}

// `sizing` must NOT be skipped: KaTeX wraps every sub/superscript in it, so
// skipping it hides all limits, indices and exponents from the matcher.
// `text` is skipped because `\text{rain}` is a word, not four variables —
// without this the matcher happily tags the r, the a and the n.
const SKIP = /\b(katex-mathml|strut|vlist-s|mspace|text|fx-swallowed)\b/;
// A `\big|` is one enlarged glyph and reads normally; only a delimiter tall
// enough to be *assembled* (`delimsizing mult`) arrives as fragments that
// would pollute the text stream.
const ASSEMBLED = /\bdelimsizing\b(?=.*\bmult\b)/;

function skip(el: Element) {
  const cls = typeof el.className === 'string' ? el.className : '';
  return Boolean(cls) && (SKIP.test(cls) || ASSEMBLED.test(cls));
}

const DIGITS = /^[0-9]+$/;

/**
 * A numeral hung off a symbol is an index — the 1 of A₁ is a label, not the
 * number one. The exception is a numeral hung off an *operator*, where it is a
 * limit worth reading: the 0 and 1 of ∫₀¹ really are the numbers.
 */
function numeralIsIndex(leaf: HTMLElement) {
  const sup = leaf.closest('.msupsub');
  const base = sup?.previousElementSibling;
  return Boolean(sup) && !(base && /\bmop\b/.test(base.className));
}

function leaves(root: Element): HTMLElement[] {
  const out: HTMLElement[] = [];
  const walk = (el: Element) => {
    if (skip(el)) return;
    const kids = Array.from(el.children);
    if (kids.length === 0) {
      const text = el.textContent ?? '';
      if (text.trim()) out.push(el as HTMLElement);
      return;
    }
    kids.forEach(walk);
  };
  walk(root);
  return out;
}

function tag(el: HTMLElement, sym: Symbol_) {
  el.dataset.sym = sym.id;
  el.dataset.kind = sym.kind;
  el.classList.add('fx-tok');
  el.setAttribute('tabindex', '0');
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', `${sym.name} — ${sym.say || sym.glyph}`);
}

export function annotate(container: HTMLElement, symbols: (FormulaSymbol | Symbol_)[]): Annotation {
  const html = container.querySelector('.katex-html');
  if (!html) return { found: [], missing: symbols.map((s) => s.id) };

  const missing: string[] = [];

  /** `\mid` renders as a relation and every other bar as an ordinary symbol or
   *  a delimiter, which is the only thing in the output that tells "given"
   *  from "the size of". A `cls` of `!x` demands the class is absent. */
  const wrongClass = (sym: Symbol_, leaf: HTMLElement) => {
    if (!sym.cls) return false;
    return sym.cls.startsWith('!')
      ? leaf.classList.contains(sym.cls.slice(1))
      : !leaf.classList.contains(sym.cls);
  };


  // Some marks are not text at all — KaTeX draws a radical as an SVG, and a
  // fraction's leaves come out denominator-first. Those bind by selector, and
  // must bind first: a `swallow` mark (the struck `=` of a ≠) takes its own
  // text off the stream so the matcher cannot claim the pieces separately.
  const bound = new Set<string>();
  for (const sym of symbols.filter((s) => s.sel)) {
    let hits: NodeListOf<HTMLElement>;
    try {
      hits = html.querySelectorAll<HTMLElement>(sym.sel);
    } catch {
      continue; // a selector this browser cannot parse — the mark just stays plain
    }
    // First claim wins, as in the text pass: `half` and `frac-bar` both bind
    // to a fraction, and the caller's order says which sense is meant here.
    const free = [...hits].filter((el) => !el.classList.contains('fx-tok') && !wrongClass(sym, el));
    if (!free.length) continue;
    bound.add(sym.id);
    free.forEach((el) => {
      tag(el, sym);
      if (sym.swallow) el.classList.add('fx-swallowed');
    });
  }

  const spans = leaves(html);
  // Build the leaf text stream, remembering for every character which leaf it
  // came from and where inside that leaf's text it sits.
  let stream = '';
  const slots: { leaf: number; off: number }[] = [];
  spans.forEach((span, i) => {
    const raw = span.textContent ?? '';
    for (let c = 0; c < raw.length; c++) {
      if (/\s/.test(raw[c])) continue;
      slots.push({ leaf: i, off: c });
      stream += raw[c];
    }
  });

  /** true when the character at `probe` is a digit of the same numeral as `anchor` */
  const sameLeafDigit = (probe: number, anchor: number) =>
    probe >= 0 && probe < stream.length &&
    slots[probe].leaf === slots[anchor].leaf &&
    /[0-9.]/.test(stream[probe]);

  const claimed = new Set<number>();
  /** leaf index -> the character ranges of it that some symbol won */
  const work = new Map<number, { sym: Symbol_; start: number; end: number }[]>();

  // Longest needle first, so `Δx` wins over the bare `x` inside it and `R_N`
  // is the remainder rather than a radius. Needles are ranked individually
  // rather than per symbol: a symbol whose *other* spelling happens to be long
  // must not get first claim on its short one. The sort is stable, so among
  // equal-length needles the caller's order decides — which is how the `a` of a
  // Taylor centre beats the `a` of an integration limit on a series page.
  const needles = symbols.flatMap((sym) =>
    sym.match
      .map((m) => m.replace(/\s+/g, ''))
      .filter(Boolean)
      .map((needle) => ({ sym, needle }))
  );
  needles.sort((a, b) => b.needle.length - a.needle.length);

  const claimedBy = new Set<string>();
  for (const { sym, needle } of needles) {
    const numeric = DIGITS.test(needle);
    let from = 0;
    for (;;) {
      const at = stream.indexOf(needle, from);
      if (at === -1) break;
      from = at + 1;
      const stop = at + needle.length;

      // `1` is a symbol; the 1 in 0.15 is a digit of a number, and the 1 of A₁
      // is a label. Only claim a numeral that stands for itself.
      if (numeric && sameLeafDigit(at - 1, at)) continue;
      if (numeric && sameLeafDigit(stop, stop - 1)) continue;
      if (numeric && !sym.listed && numeralIsIndex(spans[slots[at].leaf])) continue;
      if (wrongClass(sym, spans[slots[at].leaf])) continue;

      let free = true;
      for (let c = at; c < stop; c++) if (claimed.has(c)) { free = false; break; }
      if (!free) continue;
      for (let c = at; c < stop; c++) claimed.add(c);
      claimedBy.add(sym.id);

      // Split the win into one range per leaf it touches.
      let c = at;
      while (c < stop) {
        const leaf = slots[c].leaf;
        const start = slots[c].off;
        let end = start;
        while (c < stop && slots[c].leaf === leaf) { end = slots[c].off + 1; c++; }
        const list = work.get(leaf);
        if (list) list.push({ sym, start, end });
        else work.set(leaf, [{ sym, start, end }]);
      }
    }
  }
  for (const sym of symbols) if (!claimedBy.has(sym.id) && !bound.has(sym.id)) missing.push(sym.id);

  for (const [leafIdx, ranges] of work) {
    const leaf = spans[leafIdx];
    const raw = leaf.textContent ?? '';

    // The common case: the symbol owns the whole leaf. Tag KaTeX's own span and
    // leave the DOM untouched, so nothing about the typesetting can shift.
    if (ranges.length === 1 && ranges[0].start === 0 && ranges[0].end === raw.length) {
      tag(leaf, ranges[0].sym);
      continue;
    }

    // Otherwise the leaf holds more than this symbol — `uv` is one span, and
    // tagging it whole would make clicking `u` highlight the `v` too. Wrap just
    // the matched characters. Right to left, so earlier offsets stay valid as
    // the text node is split out from under them.
    const node = leaf.firstChild;
    if (!node || node.nodeType !== Node.TEXT_NODE) { tag(leaf, ranges[0].sym); continue; }
    const text = node as Text;
    ranges.sort((a, b) => b.start - a.start);
    for (const r of ranges) {
      text.splitText(r.end);
      const mine = text.splitText(r.start);
      const wrap = document.createElement('span');
      tag(wrap, r.sym);
      mine.parentNode!.insertBefore(wrap, mine);
      wrap.appendChild(mine);
    }
  }

  // Arrow-key order is document order, which also covers selector-bound marks.
  const found: string[] = [];
  html.querySelectorAll<HTMLElement>('.fx-tok').forEach((el) => {
    const id = el.dataset.sym;
    if (id && !found.includes(id)) found.push(id);
  });
  return { found, missing: missing.filter((id) => !found.includes(id)) };
}

/** Reflect selection + kind isolation without re-rendering KaTeX. */
export function paint(container: HTMLElement, selected: string | null, isolated: Set<string>) {
  container.querySelectorAll<HTMLElement>('.fx-tok').forEach((el) => {
    const sym = el.dataset.sym ?? '';
    const kind = el.dataset.kind ?? '';
    el.classList.toggle('sel', sym === selected);
    el.classList.toggle('dim', isolated.size > 0 && !isolated.has(kind));
  });
}
