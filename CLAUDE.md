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
field: Attention Mechanisms       # sidebar grouping; see below
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

`field` groups concepts into collapsible sections in the sidebar, which nests
**track → field → concept**. Pick the area of mathematics, at a granularity that
makes the list navigable — the existing ones are "Integration Techniques",
"Sequences and Series" and so on, not "Calculus 2", because the track above them
already says that. A concept without a field is filed under **Unfiled** and
warned about; a concept in no track appears under a trailing **Not in a track**
heading, which is the fastest way to spot one you forgot to add to a stage.

Fields and the concepts inside them are **ordered by the tracks**, not
alphabetically: a concept sorts by where it first appears in any track's stages,
and a field sorts by the earliest position any of its concepts holds. So the
sidebar shows u-Substitution before Partial Fractions. A concept in no track
sorts to the end — which is a quiet signal that it should probably be in one.

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

  **Every formula is explainable, not just the `formula` blocks.** The reader
  annotates all rendered maths against `library/symbols.yml`: a display equation
  gets its symbols coloured and clickable where it stands, and maths inside a
  sentence gets a hover tint and opens as a whole. Either one opens a **drawer
  from the right** holding the line at display size, a strip of the marks in it,
  and the same symbol card the `formula` block shows — so no equation on a page
  is a wall of white text. Nothing to author: write ordinary `$…$`, and the only
  thing that can leave a mark dead is the lexicon not having an entry for it,
  which `npm run index` reports.
- **` ```mermaid `** — rendered diagrams.
- **` ```python `** (or any language) — syntax-highlighted code with a language
  badge. Untagged fences render plain.
- **` ```formula `** — the authored deep dive on one formula: a plain-English
  reading, numbered steps, and a card explaining what each symbol means *in this
  line*, in a panel next to the equation rather than in the drawer. Use it for
  the line a concept is *about*; every other equation on the page is already
  clickable without it.

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

  The list is not a whitelist: symbols you leave out are still matched from the
  lexicon, so nothing in the equation goes dead. What listing a symbol buys is
  *authority* — its sense wins over any competing reading of the same glyph, it
  can carry a `notes:` entry, and a numeral you name is read as a number rather
  than dismissed as an index.

  `reading:`, `steps:` and `why:` are the "How to read it" pane, which is
  **collapsed by default** behind a book icon in the formula's toolbar — the
  formula is the thing to read, and the prose is there for when it doesn't land.
  Because it's collapsed, a formula missing them looks perfectly fine on the page
  and the toggle just opens onto nothing, so `npm run check` warns for each one
  that's absent. Write all three.

  Quote the `tex:` in single quotes; YAML then leaves backslashes alone.

  The block **replaces** the equation it explains — do not leave a `$$…$$` copy
  above it. It renders the formula itself, larger, so a plain display version
  next to it is the same equation twice.

  Two YAML traps, both caught by `npm run check`: a value containing `": "` parses
  as a nested mapping, and a value opening with `*` is an alias node. Use a
  folded scalar (`key: >-`) rather than rewording around either.

- **` ```viz `** — an interactive figure. Body is `key: value` lines; `type`
  selects the figure, and `name` selects which one when `type` is `scene`:

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
  | `area-between` | curve pair, sweep — the slice, and the signed integral coming apart from the true area at a crossing |
  | `slice-orientation` | dx vs dy on one region — where the vertical slice's floor changes formula, and why the horizontal one needs no cases |
  | `solid` | washer vs shell, slice position — the slice and the total volume |
  | `polar` | curve, θ swept — the trace and the ½r²dθ sector accumulating |
  | `parametric` | curve, t — position, velocity vector, accumulated arc length |
  | `bayes` / `clt` / `distribution` | the probability figures |
  | `fuse` | two Gaussian opinions and their combination — the gain, and why the result beats both |
  | `covariance` | Δt, σᵥ, σₐ — an uncertainty ellipse pushed through a step, and the tilt it acquires |
  | `kalman` | what the filter is *told* about Q and R — the error against its own ±σ band, and the NIS |

  Each figure is self-contained and carries its own caption explaining what to
  look for. Add a new one in `app/src/lib/viz/` and register it in that
  directory's `index.tsx`; an unknown `type` renders as a visible error rather
  than failing silently.

  **Scenes** are the other half of `viz`. Where the figures above are things the
  reader *operates*, a scene *plays*: a sequence of keyframes the engine morphs
  between on a clock, one caption per beat, with play/pause, a scrub bar and a
  chapter strip. It starts itself when it scrolls into view, and honours
  `prefers-reduced-motion` by waiting to be asked.

  ````
  ```viz
  type: scene
  name: taylor-build
  ```
  ````

  | `name` | The argument it makes |
  |---|---|
  | `taylor-build` | sin x gains one term at a time, agreement creeping outward — then the camera pulls back and T₁₃ runs away |
  | `clt-emerge` | a lopsided source averaged into a bell, the normal laid over it, then Cauchy refusing to converge |
  | `ftc-accumulate` | Part 1 as two stacked panels — x sweeps, area fills above, F traces below, and F's turning points land on f's zeros |
  | `ftc-telescope` | Part 2's mechanism — ΔF's chaining to F(b) − F(a) exactly at every n, with the rectangles converging separately |

  Reach for a scene when the point is a **transformation** ("watch this become
  that") and a figure when the point is a **relationship** worth poking at. They
  compose in that order — the scene makes the argument, the figure then hands
  over the controls — which is how both concepts above use them.

  Scenes live in `app/src/lib/viz/scenes/` and register in the same `index.tsx`.
  State is numbers only and every number is interpolated, so anything that should
  fade or move is derived from one; see the header comment on `Scene.tsx`. The
  camera is state too — feed interpolated bounds to `Plot` and the axes rescale
  smoothly, which is how both `-build`/`-emerge` scenes land their last beat.

  For a stacked pair of panels, render two `Plot`s with the same `xDomain` and
  pass `xTicks={false}` to the upper one; the padding is identical either way, so
  their x pixels line up and a sweep line at the same x reads as one figure.
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
2. **Write in discovery order, not logical order.** A textbook states a
   definition, states a theorem, then interprets it — the intuition arrives last,
   as a gloss on formalism the reader has already been made to swallow. Invert it:
   pose a question the reader can feel, take their likely wrong guess seriously,
   derive the answer, and *name it afterwards*. The name is a label for something
   they already understand, not a prerequisite for understanding it.

   Concretely, and all four are cheap:

   - **Open on the reader's wrong model, not on a definition.** "Most people leave
     Calculus 1 believing an integral is an antiderivative" earns the next
     paragraph. "If f is continuous on [a,b], define…" does not.
   - **Do not let the heading spoil the punchline.** "Part 1 — differentiation
     undoes accumulation" answers the question before asking it. "Part 1 — let the
     endpoint move" makes the reader want the answer.
   - **Invite the guess.** "It is worth guessing before reading on — F is built out
     of an integral, so you might reasonably expect its derivative to be another
     integral." A wrong guess taken seriously is worth a page of assertion.
   - **Say where the hypothesis bites.** Not "f must be continuous" as a
     disclaimer, but the sentence that shows what breaks without it.

   This applies to the **opening and the derivations**. Reference sections —
   tables of series, the technique list, the failure-mode catalogue — stay dense
   and scannable, because these pages are re-read on a review schedule and a
   discovery arc is an obstacle the fifth time through. The first screen does the
   persuading; the rest stays a reference.
3. **Every concept must connect.** If a new concept has no `prereqs`, no
   `related`, and no `[[links]]`, either it's genuinely foundational or it isn't
   thought through. Also add the reverse link from concepts that should point *to*
   it — cross-references only pay off when they're bidirectional in practice.
4. **Checks test recall of the mechanism**, not recognition of a term. "What is
   layer norm?" is worthless. "Why is layer norm preferred over batch norm for
   autoregressive generation specifically?" is a real check.
5. **Include the failure modes.** What breaks, what people get wrong, what the
   thing costs. That's the part that isn't in the textbook.
6. **A figure must show a mechanism, not decorate one.** Add a `viz` block only
   where manipulating something teaches what prose can't — watching midpoint
   Riemann sums beat left sums at the same n, or a Taylor polynomial failing
   outside its radius. A figure the reader can't learn anything from by dragging
   is worse than the paragraph it displaced.
7. **Keep the summary honest.** It's what the dashboard shows when deciding what
   to study next.

## The symbol lexicon

`library/symbols.yml` holds one entry per symbol: `glyph`, `kind`, `name`, `say`
(how to pronounce it), `def`, `eg`. Kinds are `set`, `function`, `variable`,
`constant`, `operator`, `differential`; they drive the colour coding and the
filter chips, and the Lexicon page lists everything with an "appears in" index.

The lexicon is no longer only for `formula` blocks — every equation in the
library is matched against it, so an entry missing here is a mark the reader
cannot ask about. `npm run index` prints the coverage and names the marks that
have none; keep that list empty.

Some fields exist because KaTeX output is not plain text:

- **`tex`** — the LaTeX that produces the glyph, when different (`\int` for `∫`).
  Used by the indexer to verify the symbol belongs to the formula. Keep it to the
  part that is stable: `b-term` uses `"b"`, not `"b_n"`, because it also has to
  match `b_{N+1}`.
- **`alt`** — other LaTeX spellings of the same mark (`\tfrac` for `\frac`,
  `\ldots` for `\cdots`). Only the indexer reads them; the rendered output is
  identical either way, so the reader never needs to know.
- **`match`** — the concatenated text of the rendered leaves, when that differs
  from the glyph. May be a list of alternatives: `b_n` renders as `bn` but
  `b_{N+1}` renders as `bN`, so `match: ["bn", "bN"]`.
- **`cls`** — a KaTeX class the matched leaf must carry, or must *not* when
  written `!mrel`. `\mid` renders as a relation and a plain `|` does not, and
  that is the only thing in the output separating "given" from "the size of".
- **`sel`** — a CSS selector into the rendered KaTeX, for marks that are not text
  at all. A radical is drawn as an SVG (`sel: ".sqrt .hide-tail"`), a fraction
  emits its leaves denominator-first (`sel: ".mfrac"`), and a stretched bar is an
  SVG path. Keep a selector narrow: it cannot see text, so `.delimsizing.mult`
  alone claims a matrix's tall bracket as readily as a tall bar — the two are
  told apart only by the SVG they draw, which is why the absolute-value entries
  carry `:has(svg[viewBox^="0 0 333"])` (a bar is 333 wide, a bracket 667).
  `swallow: true` beside it means the mark owns whatever text sits inside —
  without it the pieces KaTeX assembles a `≠` from get tagged separately and
  clicking it reports "equals".

Matching is longest-needle-first and claims **per character**, so a symbol may
span several leaves (`Δx`) and a leaf may hold several symbols — KaTeX merges
runs of same-font characters, so `uv` arrives as one span and gets split back
apart. Two heuristics keep whole-library matching honest: a numeral attached to a
symbol is read as an index and skipped (the 1 of `A₁`) unless it hangs off an
operator (the 0 and 1 of `∫₀¹`) or an author listed it, and anything in `\text{}`
is a word rather than a run of variables.

### Which sense of a glyph wins

`a` is a limit of integration, a substitution parameter and a Taylor centre; `P`
is a probability and a polynomial. With every formula annotated, something has to
choose, and the reader chooses by **where you are**: a sense used by the
concept's own `formula` block wins, then one used elsewhere in the same field,
then the same track, then anywhere at all. The losing senses are offered in the
card as other readings, one click away — which is honest about the ambiguity
rather than hiding it.

- **`where`** — the tracks or fields a sense belongs to (`where: [probability-theory]`,
  `where: [Sequences and Series]`). A sense at home beats a local competitor; the
  same sense away from home loses to one. This is the only way a mark that no
  `formula` block has ever listed can win anywhere — the `c` of a complement has
  no authored usage and would otherwise lose every page to the `c` of the Mean
  Value Theorem.

Reach for `where` only when a glyph genuinely has two readings in this library.
Usage already resolves most of them, and a `where` on a sense with no rival just
demotes it for no reason.

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
3. `npm run check`. Read the `math` line as well as the errors: a mark it reports
   as having no lexicon entry is an equation the reader cannot ask about, and the
   fix is an entry in `library/symbols.yml`, not a change to the prose.
4. If it belongs to a track, add it to the right stage.
