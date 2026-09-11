---
id: central-limit-theorem
title: The Central Limit Theorem
field: Limit Theorems
summary: Averages become normal whatever they average — the shape is universal, the rate is √n, and both facts are doing real work.
tags: [probability, limits]
difficulty: 4
est_minutes: 50
prereqs: [law-of-large-numbers, the-normal-distribution]
related: [joint-distributions-and-covariance, taylor-and-maclaurin-series, bernoulli-and-binomial]
sources:
  - title: Blitzstein & Hwang, Introduction to Probability — Ch. 10
    url: https://projects.iq.harvard.edu/stat110/home
checks:
  - q: What does the CLT add to the law of large numbers?
    a: The law says the average converges; the CLT says how fast and in what shape. The error shrinks like σ/√n and its distribution is approximately normal, which is what makes confidence intervals possible.
  - q: Why is the denominator σ/√n rather than σ/n?
    a: Because variances add and standard deviations do not. Var(X̄ₙ) = σ²/n, so the standard deviation is σ/√n. Dividing by that is what holds the spread at 1 as n grows.
  - q: To halve the width of a confidence interval, how much more data do you need, and why?
    a: Four times as much. The error scales as 1/√n, so halving it requires quadrupling n. This is the practical reason large improvements in precision are expensive.
---

# The Central Limit Theorem

The [[law-of-large-numbers]] says the sample average converges. This says **how fast, and in what shape** — and the shape does not depend on what you were averaging.

## The statement

For $X_1, \ldots, X_n$ independent and identically distributed with mean $\mu$ and finite variance $\sigma^2$:

```formula
title: The central limit theorem
tex: '\frac{\bar{X}_n - \mu}{\sigma/\sqrt{n}} \to N(0, 1)'
symbols: [frac-bar, xbar, minus, mu-mean, sigma-sd, radical, n-trials, to-arrow, normal-N]
reading: The sample mean, centred at the true mean and rescaled by its own standard deviation, tends to a standard normal.
steps:
  - Subtracting μ centres the average at zero — it removes the part that is not error.
  - What remains is the error, and its typical size is σ/√n rather than σ.
  - Dividing by that holds the spread fixed at 1 no matter how large n gets.
  - What is left converges in distribution to the standard normal — the same limit whatever you started from.
notes:
  radical: The √n is the whole practical content. Error shrinks like one over root n, so quadrupling the data halves the error and no faster.
  normal-N: The limit does not depend on the distribution of the Xᵢ. Uniform, exponential, a lopsided die — all give the same bell curve.
  xbar: Random, which is the point. The theorem describes the distribution of the estimator, not of the data.
  mu-mean: Subtracted to centre. Without it the ratio would run off to infinity rather than converge.
why: >-
  Two separate claims live here, and both matter. The **shape is universal** — the information about what you were averaging is destroyed in the limit, and only μ and σ survive. And the **rate is √n**, which is the reason "get more data" has sharply diminishing returns: to halve your uncertainty you need **four times** as much.
```

Equivalently, for large $n$: $\bar{X}_n \approx N(\mu,\ \sigma^2/n)$, and the sum $\approx N(n\mu,\ n\sigma^2)$.

Watch it happen. The source below is about as un-bell-like as a distribution gets, and nothing
anywhere is being fitted:

```viz
type: scene
name: clt-emerge
```

Now drive it yourself — the other sources, and the n in between the beats:

```viz
type: clt
```

## Why √n

Straight from [[variance-and-standard-deviation]]. Independence makes variances add, so the sum of $n$ copies has variance $n\sigma^2$, and dividing by $n$ to form the average gives $\sigma^2/n$. Take the square root for the standard deviation.

**Variances add; standard deviations do not.** That single asymmetry produces the $\sqrt{n}$ and everything that follows from it. It is also why independence is not a technicality here — with correlated data the cross terms survive and the rate degrades.

## What "universal" costs and buys

The limit forgets everything about the original distribution except $\mu$ and $\sigma$. That is why:

- A poll of 1000 works without knowing anything about the population's shape.
- The margin of error can be quoted before the data is collected.
- The same normal tables serve every field.

Historically the first case was the binomial with $p$ fixed and $n$ large — see [[bernoulli-and-binomial]]. The bell curve was discovered as the limiting shape of a binomial before it was understood as universal.

The proof sketch is worth carrying, because it explains where the normal comes from. Take logs of the moment generating function, expand as a series in $1/n$, and everything above second order dies in the limit — leaving a quadratic, which exponentiates to $e^{-t^2/2}$. The normal appears because a **second-order Taylor expansion is a quadratic**, and nothing higher survives. See [[taylor-and-maclaurin-series]].

## Where it fails, and it does

**Infinite variance.** The theorem's one hypothesis. Cauchy-distributed data never becomes normal under averaging — the average of $n$ Cauchy variables is Cauchy again. Heavy-tailed financial data converges slowly at best.

**Dependence.** Correlated observations carry less information than their count suggests, so the effective $n$ is smaller than the actual one — sometimes by a lot.

**The tails converge last.** The approximation is good near the centre long before it is good far out. Using the CLT to estimate the probability of a five-sigma event is exactly where it is least reliable, and that is exactly where risk models like to use it.

**"n ≥ 30" is not a theorem.** It is a rule of thumb for mildly skewed distributions. A strongly skewed one may need hundreds; a symmetric one is fine with a handful.

## The practical consequence

$$
\bar{X}_n \pm 1.96\,\frac{\sigma}{\sqrt{n}}
$$

is a 95% confidence interval, and its width scales as $1/\sqrt{n}$. **Halving it costs four times the data; a tenfold improvement costs a hundredfold.** This single fact sets the economics of nearly every experiment, poll, and A/B test that gets run.

:::check
What does the CLT add to the law of large numbers?
:::

:::check
Why is the denominator $\sigma/\sqrt{n}$ rather than $\sigma/n$?
:::

:::check
To halve the width of a confidence interval, how much more data do you need, and why?
:::
