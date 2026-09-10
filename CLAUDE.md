# learn-studio

A local-first learning library. Materials are markdown files; prerequisites and
cross-references between them form a graph; tracks are ordered paths through that
graph; progress is spaced-repetition state kept separately from the materials.

Claude is the authoring tool. The viewer app is read-mostly — it renders the
library and records study progress, but content is written here, in files.

## Layout

```
library/concepts/*.md   one concept per file — the nodes of the graph
library/tracks/*.md     ordered paths through concepts
library/symbols.yml     the symbol lexicon that formula blocks draw on
progress/progress.json  mastery + review schedule (never edit by hand mid-session)
tools/library.mjs       the parser. Content model changes start here.
tools/progress.mjs      SM-2 scheduling and the "what next" logic
tools/server.mjs        local JSON API
app/                    Vite + React viewer
```

## Commands

```bash
npm run dev     # api :8787 + viewer :5273
npm run index   # parse, validate, report; writes .cache/graph.json
npm run check   # same, but exits 1 on broken references or prereq cycles
```

Run `npm run check` after any edit to `library/`. It is the only thing standing
between you and a dangling `prereqs:` entry.

## Concept schema

```yaml
---
id: scaled-dot-product-attention   # kebab-case, must equal the filename
title: Scaled Dot-Product Attention
summary: One sentence. Shown on cards and in the graph — make it earn its place.
tags: [transformers, attention]
difficulty: 3                       # 1-5
est_minutes: 45
prereqs: [softmax, embeddings]      # hard dependencies; must be concept ids
related: [multi-head-attention]     # sideways links, no ordering implied
sources:
  - title: Attention Is All You Need
    url: https://arxiv.org/abs/1706.03762
checks:                             # answers for the :::check blocks, in order
  - q: Why divide by sqrt(d_k)?
    a: Dot products of d_k-dimensional vectors have variance d_k...
---
```

Body is markdown. Available in the renderer:

- **`[[concept-id]]`** or **`[[concept-id|display text]]`** — a cross-reference.
  Renders as a chip, creates a `mention` edge, and shows up in the target's
  "Referenced by". A link to a concept that doesn't exist yet renders dashed and
  is reported as a warning — that's a deliberate way to mark a gap.
- **`$inline$`** — inline KaTeX. For **display** math, fence it on its own lines:

  ```
  $$
  \int_a^b f(x)\,dx = F(b) - F(a)
  $$
  ```

  A whole line of `$$...$$` is parsed by remark-math as *inline* math and renders
  cramped and left-aligned. The reader repairs that spelling automatically, but
  write the fenced form so the files render correctly in other markdown tools too.
- **` ```mermaid `** — rendered diagrams.
- **` ```python `** (or any language) — syntax-highlighted code with a language
  badge. Untagged fences render plain.
- **` ```formula `** — a formula you can take apart symbol by symbol. Every
  symbol becomes clickable, colour-coded by kind, with a plain-English reading,
  numbered steps, and a card explaining what that symbol means *in this line*:

  ````
  ```formula
  title: The evaluation theorem
  tex: '\int_a^b f(x)\,dx = F(b) - F(a)'
  symbols: [integral, bound-a, bound-b, f-fn, x-var, dx, equals, F-antideriv]
  reading: One sentence saying the whole formula out loud.
  steps:
    - Read it left to right, one move per step.
  notes:
    equals: What this particular symbol is doing here, overriding its general entry.
  why: The point of the formula. **Bold** is allowed.
  ```
  ````

  Symbol ids come from `library/symbols.yml`. `npm run check` fails on an unknown
  id and warns when a listed symbol's LaTeX does not occur in the `tex:` — which
  is the difference between a real bug and a formula that just fails to light up.

  `reading:`, `steps:` and `why:` are the "How to read it" pane, which is
  **collapsed by default** behind a book icon in the formula's toolbar — the
  formula is the thing to read, and the prose is there for when it doesn't land.
  Because it's collapsed, a formula missing them looks perfectly fine on the page
  and the toggle just opens onto nothing, so `npm run check` warns for each one
  that's absent. Write all three.

  Quote the `tex:` in single quotes; YAML then leaves backslashes alone.

- **` ```viz `** — an interactive figure. Body is `key: value`; only `type` is
  read today:

  ````
  ```viz
  type: riemann
  ```
  ````

  | `type` | What the reader can manipulate |
  |---|---|
  | `riemann` | n, sample rule, function — sum vs exact integral and the error |
  | `taylor` | function, degree N — f against T_N, with the radius band drawn |
  | `series` | series choice, N — partial sums approaching a limit, or not |
  | `solid` | washer vs shell, slice position — the slice and the total volume |
  | `polar` | curve, θ swept — the trace and the ½r²dθ sector accumulating |
  | `parametric` | curve, t — position, velocity vector, accumulated arc length |

  Each figure is self-contained and carries its own caption explaining what to
  look for. Add a new one in `app/src/lib/viz/` and register it in that
  directory's `index.tsx`; an unknown `type` renders as a visible error rather
  than failing silently.
- **`:::check` … `:::`** — a recall prompt. The reader hides it behind a reveal,
  then offers self-grading which feeds the scheduler.

### Edge kinds

| Kind | Source | Meaning |
|---|---|---|
| `prereq` | `prereqs:` | hard ordering; gates what the dashboard unlocks |
| `related` | `related:` | sideways, no ordering |
| `mention` | `[[wikilinks]]` in the body | implicit, auto-derived |

Prereq edges must stay acyclic — `npm run check` fails on a cycle, because a
cycle makes "what can I learn next" unanswerable.

## Track schema

```yaml
---
id: transformers-from-scratch
title: Transformers from Scratch
goal: What you will be able to do at the end. Concrete and testable.
tags: [ml]
stages:
  - title: Math you cannot skip
    goal: Why this stage exists.
    concepts: [vectors-and-dot-product, softmax]
---
```

The body is prose shown on the track page — use it for checkpoints and build
projects, and for saying what the track deliberately excludes.

## Writing standards

These are the point of the project. A material that fails them is worse than no
material, because it takes up a slot in the graph.

1. **Explain the mechanism, not the vocabulary.** "Softmax converts logits to
   probabilities" is a definition. "Softmax saturates once logit gaps exceed ~10,
   which kills the gradient, which is why attention scales by √d_k" is a
   mechanism. Write the second kind.
2. **Every concept must connect.** If a new concept has no `prereqs`, no
   `related`, and no `[[links]]`, either it's genuinely foundational or it isn't
   thought through. Also add the reverse link from concepts that should point *to*
   it — cross-references only pay off when they're bidirectional in practice.
3. **Checks test recall of the mechanism**, not recognition of a term. "What is
   layer norm?" is worthless. "Why is layer norm preferred over batch norm for
   autoregressive generation specifically?" is a real check.
4. **Include the failure modes.** What breaks, what people get wrong, what the
   thing costs. That's the part that isn't in the textbook.
5. **A figure must show a mechanism, not decorate one.** Add a `viz` block only
   where manipulating something teaches what prose can't — watching midpoint
   Riemann sums beat left sums at the same n, or a Taylor polynomial failing
   outside its radius. A figure the reader can't learn anything from by dragging
   is worse than the paragraph it displaced.
6. **Keep the summary honest.** It's what the dashboard shows when deciding what
   to study next.

## The symbol lexicon

`library/symbols.yml` holds one entry per symbol: `glyph`, `kind`, `name`, `say`
(how to pronounce it), `def`, `eg`. Kinds are `set`, `function`, `variable`,
`constant`, `operator`, `differential`; they drive the colour coding and the
filter chips, and the Lexicon page lists everything with an "appears in" index.

Two fields exist because KaTeX output is not plain text:

- **`tex`** — the LaTeX that produces the glyph, when different (`\int` for `∫`).
  Used by the indexer to verify the symbol belongs to the formula.
- **`sel`** — a CSS selector into the rendered KaTeX, for marks that are not text
  at all. A radical is drawn as an SVG (`sel: ".sqrt .hide-tail"`) and a fraction
  emits its leaves denominator-first (`sel: ".mfrac"`), so neither can be found
  by matching characters.

A symbol's entry is its *general* meaning. What it does in one particular formula
belongs in that formula's `notes:` — the same glyph legitimately means different
things in different lines, and saying so is most of the value here.

## Progress model

`progress/progress.json` holds per-concept `{status, reps, ease, intervalDays,
lastReviewed, nextReview, notes}` plus an append-only `log`.

Status is `unseen → learning → review → mastered`. Grading a check runs SM-2:
grade < 3 resets the interval to 1 day; otherwise the interval grows by the ease
factor. `mastered` requires 3+ successful reps and an interval past 21 days.

Never hand-edit this file while the dev server is running — the server does
read-modify-write and will clobber you. Stop the server first, or go through the
API.

## When adding material

1. Write the file. Wire `prereqs` and `related` to real ids.
2. Add `[[links]]` from *existing* concepts to the new one where they'd genuinely
   help — a new node nothing points at is orphaned.
3. `npm run check`.
4. If it belongs to a track, add it to the right stage.
