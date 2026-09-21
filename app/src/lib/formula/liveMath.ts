import { useLayoutEffect, type RefObject } from 'react';
import type { MathTarget } from '../../types';
import { annotate } from './annotate';
import type { Senses } from './senses';

/**
 * Makes the maths on a page clickable — all of it, not just the `formula`
 * blocks. Display equations are annotated where they stand, so their symbols
 * carry the same colours as an authored block; maths inside a sentence is left
 * alone typographically and opens the drawer as a whole, because colouring
 * individual glyphs mid-paragraph wrecks the line.
 *
 * KaTeX keeps the original LaTeX in its MathML annotation, which is what the
 * drawer re-renders at display size.
 */
const TEX = 'annotation[encoding="application/x-tex"]';

export function useLiveMath(
  root: RefObject<HTMLElement>,
  senses: Senses,
  open: (target: MathTarget) => void
) {
  // No dependency list: react-markdown re-creates this subtree whenever the
  // body changes, and the `data-live` guard makes a repeat pass a no-op.
  useLayoutEffect(() => {
    const host = root.current;
    if (!host || !senses.ordered.length) return;

    host.querySelectorAll<HTMLElement>('.katex').forEach((el) => {
      // A `formula` block runs its own explorer over its own symbol list.
      if (el.dataset.live || el.closest('.fx-stage')) return;
      el.dataset.live = '1';

      const tex = el.querySelector(TEX)?.textContent?.trim();
      if (!tex) return;
      el.dataset.tex = tex;

      el.classList.add('math-live', el.closest('.katex-display') ? 'math-display' : 'math-inline');
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', 'Explain this formula');

      if (el.classList.contains('math-display')) {
        annotate(el, senses.ordered);
        // One tab stop per formula, not one per symbol: a page of equations
        // would otherwise cost a keyboard reader hundreds of stops. The drawer
        // is where symbols are stepped through, with the arrow keys.
        el.querySelectorAll('.fx-tok').forEach((tok) => tok.setAttribute('tabindex', '-1'));
      }
    });
  });

  useLayoutEffect(() => {
    const host = root.current;
    if (!host) return;

    const fire = (e: Event) => {
      const node = e.target instanceof HTMLElement ? e.target : null;
      if (!node || node.closest('.fx-stage')) return;
      const math = node.closest<HTMLElement>('.math-live');
      if (!math?.dataset.tex) return;
      const tok = node.closest<HTMLElement>('.fx-tok');
      e.preventDefault();
      open({ tex: math.dataset.tex, symbol: tok?.dataset.sym ?? null });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (!(e.target instanceof HTMLElement) || !e.target.closest('.math-live')) return;
      fire(e);
    };

    host.addEventListener('click', fire);
    host.addEventListener('keydown', onKey);
    return () => {
      host.removeEventListener('click', fire);
      host.removeEventListener('keydown', onKey);
    };
  }, [root, open]);
}
