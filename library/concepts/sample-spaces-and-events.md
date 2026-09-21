---
id: sample-spaces-and-events
title: Sample Spaces and Events
field: Probability Foundations
summary: Probability is attached to sets of outcomes, not to outcomes — and choosing the wrong set of outcomes is how most "paradoxes" get manufactured.
tags: [probability, foundations, definitions]
difficulty: 2
est_minutes: 35
prereqs: []
related: [probability-axioms, counting-and-combinatorics]
sources:
  - title: Blitzstein & Hwang, Introduction to Probability — Ch. 1
    url: https://projects.iq.harvard.edu/stat110/home
checks:
  - q: Why is the sample space for two dice usually taken as 36 ordered pairs rather than the 11 possible totals?
    a: Because counting only gives probabilities when outcomes are equally likely. The 36 ordered pairs are; the 11 totals are not (one way to get 2, six ways to get 7), so counting them gives wrong answers.
  - q: An event is a set. Which set operations correspond to "A and B", "A or B", and "not A"?
    a: Intersection, union, complement. Every and/or/not in a word problem is a set operation on subsets of the same sample space.
  - q: Why does P attach to events rather than to individual outcomes?
    a: For a continuous sample space every individual outcome has probability zero, so a function on outcomes would carry no information at all. Defining P on sets is what lets an interval have positive probability while each of its points has none.
---

# Sample Spaces and Events

Before any number gets computed, two things have to be fixed — **what could happen**, and **which collections of those things you care about**. Nearly every famous probability paradox is manufactured by being careless about the first.

## The sample space

The sample space $\Omega$ is the set of all outcomes. Two requirements, both of which sound trivial and are not:

- **Exhaustive** — every possible result is in there somewhere.
- **Mutually exclusive** — exactly one occurs, never two at once.

Roll two dice. Here are two candidate sample spaces:

| | Sample space | Size |
|---|---|---|
| $\Omega_1$ | ordered pairs $(1,1), (1,2), \ldots, (6,6)$ | 36 |
| $\Omega_2$ | totals $2, 3, \ldots, 12$ | 11 |

Both are exhaustive and mutually exclusive, so both are legitimate. But only $\Omega_1$ has **equally likely** outcomes — and that is what you need if you intend to compute probabilities by counting.

```formula
title: Probability by counting
tex: 'P(A) = \frac{|A|}{|\Omega|}'
symbols: [prob-P, event-A, equals, frac-bar, card-bars, omega-space]
reading: The probability of an event is the number of outcomes in it, divided by the total number of outcomes.
steps:
  - Fix the sample space. Everything downstream is measured against it.
  - Count how many outcomes it contains — that is the denominator.
  - Count how many of those outcomes are in the event you care about.
  - Divide. The answer is a ratio of set sizes, not of anything physical.
notes:
  card-bars: A count of outcomes, which is why this formula is useless for a continuous sample space — both counts are infinite.
  omega-space: The denominator is the whole space, so this quietly assumes every outcome in it is equally likely. Nothing in the notation says so.
  frac-bar: A ratio of counts. It equals a probability only when the things being counted are genuinely interchangeable.
why: >-
  This is the definition everyone meets first and it is **not the definition of probability** — it is a special case that holds when outcomes are equally likely. Applied to the table of totals above it gives P(total is 7) = 1/11, which is wrong; the answer is 6/36. **The formula was fine and the sample space was not.**
```

## Events are sets

An **event** is any subset of $\Omega$. "The die shows even" is the set $\{2,4,6\}$. Because events are sets, the vocabulary of probability is the vocabulary of sets:

| Word | Set operation | Meaning |
|---|---|---|
| A **and** B | $A \cap B$ | outcomes in both |
| A **or** B | $A \cup B$ | outcomes in either, or both |
| **not** A | $A^c$ | outcomes not in A |
| A **implies** B | $A \subseteq B$ | every outcome of A is in B |

That table is worth more than it looks. Translating a word problem into set operations, before touching a formula, converts a reasoning problem into a bookkeeping problem — and the bookkeeping is easy.

**"Or" is always inclusive.** "A or B" includes the case where both happen. English is ambiguous about this; probability is not.

## Where sample spaces go wrong

**Counting things that are not interchangeable.** A family has two children; at least one is a girl. Probability both are girls? The naive answer is 1/2. But the sample space is $\{\text{GG}, \text{GB}, \text{BG}, \text{BB}\}$, "at least one girl" removes $\text{BB}$, and $\text{GG}$ is one of the three remaining — so 1/3. The pairs are equally likely; "number of girls" is not.

**Forgetting that order was part of the outcome.** $\text{GB}$ and $\text{BG}$ are two outcomes, not one. Collapsing them halves a count you needed.

**A sample space that cannot support the question.** If you model a coin as $\{\text{H}, \text{T}\}$ you cannot ask about the second flip. The space has to be rich enough to express every event you intend to name.

The habit worth building: **write $\Omega$ down explicitly before computing anything**, even when it feels obvious. Most of the difficulty in an introductory problem is already resolved once you have.

## Where this goes

Everything else is built on this. [[probability-axioms]] states the three rules any $P$ must satisfy; [[counting-and-combinatorics]] is how you evaluate $|A|$ when the sets get large; [[conditional-probability]] is what happens when you *shrink* the sample space in the light of information.

:::check
Why is the sample space for two dice usually taken as 36 ordered pairs rather than the 11 possible totals?
:::

:::check
An event is a set. Which set operations correspond to "A and B", "A or B", and "not A"?
:::

:::check
Why does $P$ attach to events rather than to individual outcomes?
:::
