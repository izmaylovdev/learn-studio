---
id: law-of-total-probability
title: The Law of Total Probability
field: Conditioning and Independence
summary: Split the sample space into cases you can handle, solve each one, and weight by how likely the case was — the divide-and-conquer of probability.
tags: [probability, conditioning]
difficulty: 3
est_minutes: 35
prereqs: [conditional-probability]
related: [bayes-theorem, independence]
sources:
  - title: Blitzstein & Hwang, Introduction to Probability — Ch. 2
    url: https://projects.iq.harvard.edu/stat110/home
checks:
  - q: What two conditions must the events A₁, …, Aₙ satisfy for the law to apply?
    a: They must be pairwise disjoint and their union must be all of Ω — a partition. Disjointness lets the pieces add without double counting; exhaustiveness ensures no probability is left out.
  - q: Why is the weighted sum weighted by P(Aᵢ) rather than averaged evenly?
    a: Because the cases are not equally likely. Each conditional probability is only relevant in proportion to how often its case arises, and an even average would be the answer to a different question.
  - q: How does this law relate to Bayes' theorem?
    a: It supplies the denominator. Bayes needs P(B), which is rarely known directly, and the law computes it from the same conditional probabilities that appear in the numerator.
---

# The Law of Total Probability

When a probability is hard to compute directly, the move is almost always the same: **split into cases where it is easy, then weight the cases**.

## The statement

Let $A_1, \ldots, A_n$ be a **partition** of $\Omega$ — pairwise disjoint, and together covering everything. Then for any event $B$:

```formula
title: Splitting into cases
tex: 'P(B) = \sum_{i} P(B \mid A_i)\,P(A_i)'
symbols: [prob-P, event-B, equals, sigma-sum, i-index, given, event-A]
reading: The probability of B is the sum, over every case, of the probability of B in that case times the probability of that case.
steps:
  - The cases carve Ω into non-overlapping pieces that cover everything.
  - So B itself is carved into non-overlapping pieces — the part of B inside each case.
  - The third axiom lets those pieces add, since they do not overlap.
  - Each piece is P(B ∩ Aᵢ), which the multiplication rule rewrites as P(B|Aᵢ)P(Aᵢ).
notes:
  sigma-sum: Adding is only legal because the cases are disjoint. Overlapping cases would double-count the outcomes in the overlap, exactly as in inclusion-exclusion.
  given: Inside case Aᵢ the problem is usually easy — that is the entire reason for choosing this partition rather than another.
  event-A: The weights. A case that almost never happens contributes almost nothing, however extreme its conditional probability is.
why: >-
  This is **divide and conquer**, and choosing the partition is the whole skill — the right one makes every conditional probability obvious. It is also where Bayes' theorem gets its denominator, which is why the two are almost always used together. **The weighting is not decoration**: a rare case with a dramatic conditional probability still contributes very little, and forgetting that is the base-rate fallacy.
```

The simplest useful case is the two-way split, which is worth having automatic:

$$
P(B) = P(B \mid A)P(A) + P(B \mid A^c)P(A^c)
$$

## Worked: the two-factory problem

A component comes from factory 1 (60% of output, 2% defective) or factory 2 (40%, 5% defective). What fraction of components are defective?

$$
P(D) = 0.02 \cdot 0.6 + 0.05 \cdot 0.4 = 0.012 + 0.020 = 0.032
$$

3.2% — between the two rates, and closer to 2% because most output comes from factory 1. **The answer is always between the extremes**, which is a free sanity check: if your total comes out above every conditional probability, you have made an arithmetic error.

Note what would happen with an unweighted average: $(0.02 + 0.05)/2 = 0.035$. That is the answer to "what is the average of the two factories' defect rates", which is a different question and nobody asked it.

## Choosing the partition

The law is only as useful as the partition, and there are two rules of thumb.

**Condition on the thing you wish you knew.** If the problem would be easy if you knew which factory, which urn, which first card — partition on that.

**Condition on the first step.** For anything sequential, splitting on the outcome of stage one usually turns the problem into a smaller copy of itself. That is how gambler's-ruin and random-walk recursions are set up, and the resulting equation is often solvable outright.

## The trap

The partition must be a genuine partition. Two failures, both easy to miss:

- **Cases that overlap.** "It rained" and "it was cold" is not a partition. The overlap gets counted twice and the total can exceed 1 — which at least announces itself.
- **Cases that miss something.** "Factory 1 or factory 2" fails silently if a third supplier exists. The total comes out under 1, and the shortfall is exactly the probability you forgot.

Both are caught by the same check: **the weights must sum to 1.** Verify that before trusting anything downstream.

## Where it goes

Immediately into [[bayes-theorem]], which needs $P(B)$ in its denominator and almost never has it directly. The same idea reappears for random variables as the law of total expectation, $E[X] = E[\,E[X \mid Y]\,]$ — see [[expectation]].

:::check
What two conditions must the events $A_1, \ldots, A_n$ satisfy for the law to apply?
:::

:::check
Why is the weighted sum weighted by $P(A_i)$ rather than averaged evenly?
:::

:::check
How does this law relate to Bayes' theorem?
:::
