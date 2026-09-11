---
id: probability-axioms
title: The Probability Axioms
field: Probability Foundations
summary: Three rules generate the entire subject — and the one that does real work is that disjoint pieces add, which is exactly why overlapping ones do not.
tags: [probability, foundations, definitions]
difficulty: 2
est_minutes: 35
prereqs: [sample-spaces-and-events]
related: [conditional-probability, counting-and-combinatorics]
sources:
  - title: Blitzstein & Hwang, Introduction to Probability — Ch. 1
    url: https://projects.iq.harvard.edu/stat110/home
checks:
  - q: State the three axioms, and derive P(Aᶜ) = 1 − P(A) from them.
    a: Non-negativity (P(A) ≥ 0), normalisation (P(Ω) = 1), and countable additivity (disjoint events add). A and Aᶜ are disjoint and their union is Ω, so P(A) + P(Aᶜ) = P(Ω) = 1.
  - q: Why does P(A ∪ B) subtract P(A ∩ B), and when can you skip that term?
    a: Adding P(A) and P(B) counts the overlap twice, once in each, so it has to come off once. You can skip it only when the events are disjoint, which makes the overlap empty and its probability zero.
  - q: Two events are mutually exclusive. Are they independent?
    a: Almost never. Disjoint events are maximally dependent — if one occurs the other definitely did not, so P(A|B) = 0 rather than P(A). They coincide only in the degenerate case where one has probability zero.
---

# The Probability Axioms

Probability is not defined by what it means. It is defined by what it must obey. Any function $P$ on events satisfying three rules *is* a probability, and everything else in the subject is derived from them.

## The three rules

1. **Non-negativity.** $P(A) \ge 0$ for every event.
2. **Normalisation.** $P(\Omega) = 1$ — something happens.
3. **Countable additivity.** If $A_1, A_2, \ldots$ are pairwise disjoint, $P\!\left(\bigcup_i A_i\right) = \sum_i P(A_i)$.

That is the whole foundation. Notice what is *not* here: nothing about repeated trials, nothing about long-run frequency, nothing about belief. Those are interpretations. The mathematics is indifferent to which one you hold.

**Rule 3 is the one that does the work**, and its precondition is the thing to keep hold of: pieces add *when they do not overlap*. Every mistake below is that precondition being ignored.

## What follows immediately

Each of these is two lines from the axioms, and each is worth being able to rederive rather than recall.

| Result | Why |
|---|---|
| $P(A^c) = 1 - P(A)$ | $A$ and $A^c$ are disjoint and fill $\Omega$ |
| $P(\varnothing) = 0$ | complement of $\Omega$ |
| $A \subseteq B \Rightarrow P(A) \le P(B)$ | $B$ splits into $A$ and $B \setminus A$, both non-negative |
| $P(A) \le 1$ | $A \subseteq \Omega$ |

The complement rule earns its keep constantly. "At least one" problems are nearly always easier read as "not none" — the complement of a union of many overlapping things is an intersection, and intersections of independent events multiply.

## When events overlap

```formula
title: The inclusion–exclusion rule
tex: 'P(A \cup B) = P(A) + P(B) - P(A \cap B)'
symbols: [prob-P, event-A, cup, event-B, equals, plus, minus, cap]
reading: The probability of either event is the sum of their probabilities, minus the probability of both.
steps:
  - Adding P(A) and P(B) covers every outcome in the union — at least once.
  - But every outcome in the overlap has been covered twice, once by each term.
  - Subtracting the overlap once leaves everything counted exactly once.
  - If nothing overlaps that last term is zero, and this collapses back to the third axiom.
notes:
  cup: Inclusive or. The union contains the outcomes where both happen, which is precisely why the correction is needed.
  cap: The double-counted part. Not a fudge factor — it is the exact amount by which the naive sum overshoots.
  minus: Subtracted once, not twice. It was added twice and should have been added once.
why: >-
  The third axiom only lets you add **disjoint** things, and this is what you do when they are not. The pattern generalises — three events need the three pairwise overlaps subtracted and the triple overlap added back — and the alternating signs keep going. **Reaching for P(A) + P(B) without checking for overlap is the most common first mistake in the subject.**
```

## Disjoint is not independent

These two words get confused constantly and they are close to opposites.

- **Disjoint** — the events cannot both happen. $P(A \cap B) = 0$.
- **Independent** — knowing one happened tells you nothing about the other. $P(A \cap B) = P(A)P(B)$.

If $A$ and $B$ are disjoint and both have positive probability, then learning $B$ occurred tells you $A$ definitely did *not*. That is about as informative as evidence gets, so they are strongly **dependent**. The two conditions coincide only when one of the events has probability zero, which is a degenerate case and not a useful intuition.

See [[independence]] for what the second condition actually buys you.

## What the axioms deliberately leave out

They do not say which events are measurable — for a continuous $\Omega$ you cannot consistently assign a probability to *every* subset, and the sets you can are the ones in a σ-algebra. This is a real restriction and it never bites at this level, because every set you can describe in words is measurable.

They also do not tell you what $P$ *is* for a given experiment. Choosing that is modelling, and it is where the actual difficulty lives. The axioms only guarantee your model will not contradict itself.

Next: [[counting-and-combinatorics]] for evaluating $P$ when outcomes are equally likely, and [[conditional-probability]] for what happens when information arrives.

:::check
State the three axioms, and derive $P(A^c) = 1 - P(A)$ from them.
:::

:::check
Why does $P(A \cup B)$ subtract $P(A \cap B)$, and when can you skip that term?
:::

:::check
Two events are mutually exclusive. Are they independent?
:::
