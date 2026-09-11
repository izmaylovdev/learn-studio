---
id: variance-and-standard-deviation
title: Variance and Standard Deviation
field: Random Variables
summary: The average squared distance from the mean — squared so it cannot cancel, then square-rooted so it can be compared to the mean.
tags: [probability, random-variables]
difficulty: 3
est_minutes: 40
prereqs: [expectation]
related: [joint-distributions-and-covariance, law-of-large-numbers, the-normal-distribution]
sources:
  - title: Blitzstein & Hwang, Introduction to Probability — Ch. 4
    url: https://projects.iq.harvard.edu/stat110/home
checks:
  - q: Why square the deviations rather than take absolute values?
    a: Squares are differentiable everywhere and, decisively, they make variances add for independent variables. Mean absolute deviation is a perfectly good spread measure but has no such additivity, which is what every limit theorem relies on.
  - q: Derive Var(X) = E[X²] − (E[X])² and say why it is the computational form.
    a: Expand E[(X−μ)²] = E[X² − 2μX + μ²] and use linearity to get E[X²] − 2μE[X] + μ² = E[X²] − μ². It needs one pass over the data instead of two, because you never have to know the mean before you start.
  - q: Var(aX + b) = a²Var(X). Why does b disappear and why does a get squared?
    a: Shifting moves the whole distribution and its mean together, so distances from the mean are unchanged. Scaling multiplies every distance by a, and the variance is in squared units, so it picks up a².
---

# Variance and Standard Deviation

Expectation says where a distribution sits. Variance says how far it typically strays from there.

## The definition

$$
\operatorname{Var}(X) = E\big[(X - \mu)^2\big], \qquad \mu = E[X]
$$

The average squared distance from the mean. **Squared for a reason**: the raw deviations $X - \mu$ average to exactly zero, always, by construction. Positive and negative excursions cancel, so the unsquared version measures nothing.

Absolute values would also stop the cancellation. Squares win anyway, for one decisive reason given below.

## The computational form

```formula
title: Variance, the way you actually compute it
tex: '\operatorname{Var}(X) = E[X^2] - (E[X])^2'
symbols: [var-op, rv-X, equals, expect-E, minus]
reading: The variance is the mean of the squares minus the square of the mean.
steps:
  - Expand the definition — E[(X − μ)²] becomes E[X² − 2μX + μ²].
  - Linearity splits it into E[X²] − 2μE[X] + μ².
  - E[X] is μ, so the middle term is −2μ² and the last is +μ².
  - Those collapse to −μ², leaving the mean of the squares minus the square of the mean.
notes:
  minus: The order is not negotiable. Jensen's inequality guarantees E[X²] ≥ (E[X])², so this difference is never negative — reversing it would produce an impossible answer.
  expect-E: Two different expectations. The first averages the squares, the second squares an average, and the gap between them *is* the spread.
  var-op: In squared units. A variance of 4 on a measurement in metres is 4 square metres, which is why the standard deviation exists.
why: >-
  This form takes **one pass** over the data instead of two — you never need to know the mean before you start accumulating. That mattered enormously before computers and still matters for streaming data. Its weakness is real though: when the mean is large and the variance small it subtracts two nearly equal big numbers, and **catastrophic cancellation** can leave you with noise or even a negative answer.
```

## Standard deviation puts the units back

$$
\sigma = \sqrt{\operatorname{Var}(X)}
$$

Variance is in squared units and cannot be compared to the mean. The standard deviation can, which makes it the natural ruler for "how far is far".

That is what gives "three sigma" meaning across every distribution, while "three units" means nothing without context. Chebyshev's inequality makes it quantitative with no assumptions at all:

$$
P\big(|X - \mu| \ge k\sigma\big) \le \frac{1}{k^2}
$$

At least 75% of any distribution lies within 2σ of its mean; at least 89% within 3σ. Weak bounds — the normal distribution keeps 95% within 2σ — but they hold for *every* distribution with finite variance, which is why they survive into the [[law-of-large-numbers]].

## The two transformation rules

$$
\operatorname{Var}(aX + b) = a^2\operatorname{Var}(X)
$$

**$b$ vanishes** because shifting moves the distribution and its mean together — every distance from the mean is unchanged. **$a$ is squared** because it scales every distance by $a$, and variance lives in squared units.

This is why standardising works. Setting $Z = (X - \mu)/\sigma$ gives $E[Z] = 0$ and $\operatorname{Var}(Z) = 1$ for any $X$ whatever, which is the move behind every z-score and the statement of the [[central-limit-theorem]].

## Adding variances needs independence

$$
\operatorname{Var}(X + Y) = \operatorname{Var}(X) + \operatorname{Var}(Y) \qquad \textbf{only if independent}
$$

**This is the reason squares beat absolute values.** In general the cross term survives:

$$
\operatorname{Var}(X+Y) = \operatorname{Var}(X) + \operatorname{Var}(Y) + 2\operatorname{Cov}(X,Y)
$$

and independence is exactly what kills it — see [[joint-distributions-and-covariance]]. No comparable identity exists for mean absolute deviation, and without additivity there is no $\sqrt{n}$ and no central limit theorem.

The consequence to internalise: **variances add, standard deviations do not.** Sum $n$ independent copies and the variance is $n\sigma^2$, so the standard deviation is $\sigma\sqrt{n}$. Average them and the standard deviation is $\sigma/\sqrt{n}$. That $\sqrt{n}$ governs how fast averaging helps — to halve your error you need four times the data, which is the most practically important consequence in the whole subject.

Note the contrast with [[expectation]], which is linear unconditionally. Variance requires a hypothesis, and forgetting to check it is a standard error.

:::check
Why square the deviations rather than take absolute values?
:::

:::check
Derive $\operatorname{Var}(X) = E[X^2] - (E[X])^2$ and say why it is the computational form.
:::

:::check
$\operatorname{Var}(aX + b) = a^2\operatorname{Var}(X)$. Why does $b$ disappear and why does $a$ get squared?
:::
