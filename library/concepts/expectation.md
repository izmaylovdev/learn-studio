---
id: expectation
title: Expectation
field: Random Variables
summary: A probability-weighted average, linear even when the variables are dependent — which is an unreasonably powerful fact and has no analogue for variance.
tags: [probability, random-variables]
difficulty: 3
est_minutes: 45
prereqs: [random-variables-and-distributions]
related: [variance-and-standard-deviation, law-of-large-numbers, joint-distributions-and-covariance]
sources:
  - title: Blitzstein & Hwang, Introduction to Probability — Ch. 4
    url: https://projects.iq.harvard.edu/stat110/home
checks:
  - q: Why is linearity of expectation remarkable, and what does it not require?
    a: E[X+Y] = E[X] + E[Y] holds even when X and Y are dependent. It requires nothing at all — no independence, no identical distributions — which is what lets it solve problems where the joint distribution is hopeless.
  - q: What is the law of the unconscious statistician, and why is it called that?
    a: E[g(X)] = ∫ g(x)f(x)dx — you can average g(X) using X's own density without ever finding the distribution of g(X). It is named for the fact that people use it without noticing it needs proof.
  - q: Give a case where the expected value is not a possible value, and one where it does not exist.
    a: A fair die has expectation 3.5, which it never shows. The Cauchy distribution has no expectation at all — its defining integral diverges, so the sample mean never settles down.
---

# Expectation

The expected value is the probability-weighted average of a random variable — the centre of mass of its distribution.

## The two forms

For a discrete variable, weight each value by its probability:

$$
E[X] = \sum_x x \, p(x)
$$

For a continuous one, the sum becomes an integral and the pmf becomes a density:

```formula
title: Expectation of a continuous variable
tex: 'E[X] = \int_{-\infty}^{\infty} x\,f(x)\,dx'
symbols: [expect-E, rv-X, equals, integral, infinity, x-var, density-f, dx, minus]
reading: The expected value is the integral of each value times the density at that value, over the whole line.
steps:
  - Chop the line into slices of width dx, exactly as in a Riemann sum.
  - The probability of landing in one slice is f(x)dx — density times width.
  - Its contribution to the average is the value x, weighted by that probability.
  - Integrating adds every slice's contribution. It is a weighted average with infinitely many weights.
notes:
  density-f: Supplies the weights. It is not being averaged — it is what x is being averaged against.
  integral: The continuous version of the discrete sum. Same operation, and the same slice-and-add reasoning from the definition of the integral.
  infinity: Both limits are infinite, so this is an improper integral and it can genuinely fail to converge. When it does, the expectation does not exist.
why: >-
  This is a **centre of mass** — with f as the mass density, E[X] is the balance point. That analogy is exact, not decorative, and it explains why a long tail drags the mean towards it while leaving the median alone. It also explains why the expectation can fail to exist: **a tail heavy enough makes the integral diverge**, and the Cauchy distribution is the standard example.
```

Notice the shape: $x \cdot f(x)\,dx$ is value × probability-of-this-slice, which is the same slice-then-add pattern as [[riemann-sums-and-the-definite-integral]]. Every application of integration in this course is a different thing being sliced.

## Linearity, which is the real content

$$
E[X + Y] = E[X] + E[Y] \qquad E[aX + b] = aE[X] + b
$$

**This holds always.** Not for independent variables — for *any* variables, however tangled. There is no other tool in probability with so few preconditions.

Why it matters: it lets you decompose a hopeless variable into easy pieces without ever finding its distribution. How many people get their own hat back, when $n$ hats are shuffled? Let $X_i$ be 1 if person $i$ does. These are dependent — knowing $n-1$ people got theirs forces the last one — but

$$
E[X] = \sum_{i=1}^n E[X_i] = n \cdot \frac{1}{n} = 1
$$

The answer is 1, for every $n$. Finding the distribution of $X$ directly is genuinely hard. The decomposition is one line, and it works *because* linearity does not care about the dependence.

**Variance has no such property.** $\text{Var}(X+Y) = \text{Var}(X) + \text{Var}(Y)$ needs independence, and confusing the two is a standard error — see [[variance-and-standard-deviation]].

## Averaging a function of X

$$
E[g(X)] = \int g(x)\,f(x)\,dx
$$

You do **not** need the distribution of $g(X)$ — you reweight using $X$'s own density. This is the law of the unconscious statistician, named for how routinely it is used without anyone noticing it requires proof.

The consequence people forget: $E[g(X)] \ne g(E[X])$ in general. For convex $g$, Jensen's inequality says $E[g(X)] \ge g(E[X])$. The average of the squares exceeds the square of the average — which is exactly why variance is positive.

## When expectation misleads

**It need not be attainable.** A fair die has $E[X] = 3.5$. "Expected" is a technical term, not a prediction.

**It need not exist.** The Cauchy density has tails so heavy that $\int |x| f(x)\,dx$ diverges. Its sample mean never settles down — averaging more data does not help, because the [[law-of-large-numbers]] requires a finite mean to converge to.

**It ignores spread entirely.** Two bets with the same expectation can be wildly different propositions. That is what the next concept is for.

**It is not the median.** For a skewed distribution the mean is dragged towards the long tail. Income is the standard example, and reporting one when the audience assumes the other is a reliable way to mislead without lying.

:::check
Why is linearity of expectation remarkable, and what does it not require?
:::

:::check
What is the law of the unconscious statistician, and why is it called that?
:::

:::check
Give a case where the expected value is not a possible value, and one where it does not exist.
:::
