import type { FormulaSymbol } from '../../types';

/**
 * KaTeX gives us beautiful output but no hooks into it. To make individual
 * symbols clickable we walk the rendered leaves, concatenate their text, and
 * find each symbol's `match` string in that stream — so authors write ordinary
 * LaTeX instead of a bespoke token DSL.
 *
 * A symbol can span several leaves (`\Delta x` is "Δ" then "x"), so matches are
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
  // Build the leaf text stream plus a map from character offset back to leaf.
  let stream = '';
  const owner: number[] = [];
  spans.forEach((span, i) => {
    const text = (span.textContent ?? '').replace(/\s+/g, '');
    for (let c = 0; c < text.length; c++) owner.push(i);
    stream += text;
  });

  const claimed = new Set<number>();
  const missing: string[] = [];

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

        const touched = new Set<number>();
        let free = true;
        for (let c = at; c < at + needle.length; c++) {
          const idx = owner[c];
          if (idx === undefined || claimed.has(idx)) { free = false; break; }
          touched.add(idx);
        }
        if (!free) continue;

        for (const idx of touched) {
          claimed.add(idx);
          tag(spans[idx], sym);
        }
        hit = true;
      }
    }
    if (!hit) missing.push(sym.id);
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
