import type { FormulaSymbol } from '../../types';

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
 */
export interface Annotation {
  /** symbol ids that were located, in first-appearance order */
  found: string[];
  /** symbol ids listed but not present in the rendered output */
  missing: string[];
}

// `sizing` must NOT be skipped: KaTeX wraps every sub/superscript in it, so
// skipping it hides all limits, indices and exponents from the matcher.
// `delimsizing` is skipped because a stretched delimiter is assembled from
// glyph fragments that would pollute the text stream.
const SKIP = /\b(katex-mathml|strut|vlist-s|mspace|delimsizing)\b/;

function leaves(root: Element): HTMLElement[] {
  const out: HTMLElement[] = [];
  const walk = (el: Element) => {
    if (el.className && typeof el.className === 'string' && SKIP.test(el.className)) return;
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

function tag(el: HTMLElement, sym: FormulaSymbol) {
  el.dataset.sym = sym.id;
  el.dataset.kind = sym.kind;
  el.classList.add('fx-tok');
  el.setAttribute('tabindex', '0');
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', `${sym.name} — ${sym.say || sym.glyph}`);
}

export function annotate(container: HTMLElement, symbols: FormulaSymbol[]): Annotation {
  const html = container.querySelector('.katex-html');
  if (!html) return { found: [], missing: symbols.map((s) => s.id) };

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

  const claimed = new Set<number>();
  const missing: string[] = [];
  /** leaf index -> the character ranges of it that some symbol won */
  const work = new Map<number, { sym: FormulaSymbol; start: number; end: number }[]>();

  // Some marks are not text at all — KaTeX draws a radical as an SVG, and a
  // fraction's leaves come out denominator-first. Those bind by selector.
  for (const sym of symbols.filter((s) => s.sel)) {
    const hits = html.querySelectorAll<HTMLElement>(sym.sel);
    if (!hits.length) { missing.push(sym.id); continue; }
    hits.forEach((el) => tag(el, sym));
  }

  // Longest match first, so `Δx` wins over the bare `x` inside it.
  const ordered = symbols
    .filter((s) => !s.sel)
    .sort((a, b) => Math.max(...b.match.map((m) => m.length)) - Math.max(...a.match.map((m) => m.length)));

  for (const sym of ordered) {
    const needles = sym.match.map((m) => m.replace(/\s+/g, '')).filter(Boolean);
    if (!needles.length) { missing.push(sym.id); continue; }

    let hit = false;
    for (const needle of needles) {
      if (hit) break;
      let from = 0;
      for (;;) {
        const at = stream.indexOf(needle, from);
        if (at === -1) break;
        from = at + 1;
        const stop = at + needle.length;

        let free = true;
        for (let c = at; c < stop; c++) if (claimed.has(c)) { free = false; break; }
        if (!free) continue;
        for (let c = at; c < stop; c++) claimed.add(c);

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
        hit = true;
      }
    }
    if (!hit) missing.push(sym.id);
  }

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
  return { found, missing };
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
