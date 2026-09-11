---
id: bernoulli-and-binomial
title: Bernoulli and Binomial
field: Named Distributions
summary: Counting successes in a fixed number of independent trials — three factors, one of which is a count and not a probability.
tags: [probability, distributions]
difficulty: 3
est_minutes: 40
prereqs: [independence, counting-and-combinatorics, random-variables-and-distributions]
related: [poisson-and-rare-events, central-limit-theorem, expectation]
sources:
  - title: Blitzstein & Hwang, Introduction to Probability — Ch. 3
    url: https://projects.iq.harvard.edu/stat110/home
checks:
  - q: What four assumptions does the binomial make, and which fails most often in practice?
    a: Fixed n, two outcomes per trial, constant p, and independence. Independence and constant p fail most often — sampling without replacement breaks both, as does any trial that influences the next.
  - q: Why does the formula have three factors rather than two?
    a: p^k(1−p)^(n−k) is the probability of one particular sequence with k successes. Every such sequence has that same probability, and the binomial coefficient counts how many there are.
  - q: The mean is np and the variance np(1−p). Where is the variance largest, and why does that make sense?
    a: At p = 0.5, where it is n/4. A fair coin is maximally unpredictable; as p approaches 0 or 1 the outcome becomes nearly certain and the spread collapses to zero.
---

# Bernoulli and Binomial

The simplest non-trivial random variable, and the distribution you get by adding up $n$ of them.

## Bernoulli — one trial

$X$ takes the value 1 with probability $p$ and 0 with probability $1-p$. That is the whole distribution.

$$
E[X] = p, \qquad \operatorname{Var}(X) = p(1-p)
$$

The expectation is immediate — $1 \cdot p + 0 \cdot (1-p)$. The variance follows from $E[X^2] = p$ (since $X^2 = X$ when $X$ is 0 or 1), giving $p - p^2$.

The choice of 0 and 1 is not arbitrary. It makes the **sum of Bernoullis a count**, and it makes $E[X] = P(\text{success})$ — an indicator variable's expectation is the probability of the thing it indicates. That identity is what makes the hat-check argument in [[expectation]] work.

## Binomial — n trials

Add $n$ independent Bernoullis with the same $p$, and $X$ counts the successes.

```formula
title: The binomial probability
tex: 'P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}'
symbols: [prob-P, rv-X, equals, k-count, binom-coef, n-trials, p-prob, one-const, minus]
reading: The chance of exactly k successes is the number of ways they could occur, times the probability of each success, times the probability of each failure.
steps:
  - Write down one particular sequence with k successes and n−k failures.
  - Independence makes its probability a plain product — p multiplied k times, and (1−p) multiplied n−k times.
  - Every other sequence with k successes has that exact same probability, since only the count enters.
  - So multiply by how many such sequences there are, which is n choose k.
notes:
  binom-coef: A count, not a probability. It is often much larger than 1, and it is the only factor here that is not.
  p-prob: Assumed identical on every trial and unaffected by the others. Both assumptions are doing real work and both fail routinely.
  one-const: 1 − p is the failure probability. It appears n − k times because that is how many trials did not succeed.
why: >-
  The three factors are **one sequence, then all sequences**. Independence gives the plain product; the count converts it from "this exact pattern" to "any pattern with this many". Drop the coefficient and you have answered a different question — the probability of one *specified* order, which is almost never what was asked.
```

```viz
type: distribution
```

## Mean and variance, the easy way

Directly summing $\sum_k k\binom{n}{k}p^k(1-p)^{n-k}$ is unpleasant. Decomposing is not:

$$
E[X] = \sum_{i=1}^n E[X_i] = np, \qquad \operatorname{Var}(X) = \sum_{i=1}^n \operatorname{Var}(X_i) = np(1-p)
$$

The first sum needs only linearity. **The second needs independence** — see [[variance-and-standard-deviation]] — and this is a case where the hypothesis is genuinely load-bearing rather than decorative.

The variance peaks at $p = 0.5$, where it equals $n/4$. That matches intuition: a fair coin is maximally unpredictable, and as $p$ heads toward 0 or 1 the result becomes nearly certain and the spread collapses.

## The assumptions, and where they break

| Assumption | Fails when |
|---|---|
| $n$ fixed in advance | you stop when you feel like it — optional stopping |
| two outcomes | "other" is quietly a third category |
| $p$ constant | trials differ, or the process drifts |
| independence | sampling without replacement, or trials influencing each other |

**Sampling without replacement breaks the last two at once.** Drawing 5 cards from 52 is hypergeometric, not binomial. The binomial is a good approximation when the sample is a small fraction of the population — under about 10% is the usual rule — because then the depletion barely moves $p$.

**Optional stopping** is the subtle one. If $n$ is chosen after looking at the data, the distribution is not binomial and the resulting p-values are not what they claim. This is not a technicality; it is a substantial part of why published findings fail to replicate.

## Where it goes

Two limits, in opposite directions, and they lead to the two most important distributions in the subject.

- **$n$ large, $p$ small, $np$ fixed** — the coefficient and the powers conspire, and you get [[poisson-and-rare-events]].
- **$n$ large, $p$ fixed** — the shape becomes a bell curve. That is the [[central-limit-theorem]] in its original form, and it is where [[the-normal-distribution]] first appeared historically.

:::check
What four assumptions does the binomial make, and which fails most often in practice?
:::

:::check
Why does the formula have three factors rather than two?
:::

:::check
The mean is $np$ and the variance $np(1-p)$. Where is the variance largest, and why does that make sense?
:::
