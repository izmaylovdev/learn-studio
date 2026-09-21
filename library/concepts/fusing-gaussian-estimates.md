---
id: fusing-gaussian-estimates
title: Fusing Gaussian Estimates
field: Fusing Estimates
summary: Two opinions about the same quantity combine into one that is sharper than either — because precisions add. This is the Kalman update, in one dimension, with no matrices in the way.
tags: [estimation, gaussian, kalman, bayes]
difficulty: 2
est_minutes: 40
prereqs: [gaussian-random-vectors]
related: [bayes-theorem, conditioning-a-joint-gaussian, the-kalman-gain]
sources:
  - title: Maybeck, Stochastic Models, Estimation and Control — Vol. 1, Ch. 1
    url: https://www.cs.unc.edu/~welch/kalman/maybeck.html
checks:
  - q: >-
      Two independent estimates of the same quantity are fused. Why is the result sharper than either input, and why is that not information from nowhere?
    a: >-
      Because precisions — the reciprocals of the variances — add: 1/σ² = 1/σ₁² + 1/σ₂². Two independent looks at the same quantity really are two pieces of evidence, and evidence accumulates, so the combined uncertainty must be below both. It is the same reason averaging n samples gives σ/√n. Nothing is conjured: the second estimate carried real information that the first did not have.
  - q: >-
      Write the fused mean in the form μ₁ + K(μ₂ − μ1) and say what K means at its two extremes.
    a: >-
      K = σ₁²/(σ₁² + σ₂²). At K = 0 the second estimate is infinitely noisy and is ignored entirely — the answer stays at μ₁. At K = 1 the first estimate is worthless (σ₁² → ∞) and the answer jumps all the way to μ₂. In between, K is the fraction of the disagreement you act on, and it is decided purely by the ratio of the two variances.
  - q: >-
      Both thermometers are calibrated against the same faulty reference. What does the fusion formula get wrong, and in which direction?
    a: >-
      The formula assumes independent errors, and these share one. The fused mean is still reasonable, but the fused variance is far too small — the filter reports confidence that reflects two independent looks when it really had one and an echo. The error is always in the over-confident direction, which is the dangerous one: a filter that under-states its uncertainty stops listening to measurements that could correct it.
  - q: >-
      Why does this scalar result deserve to be called the Kalman update?
    a: >-
      Because it is the Kalman update with n = 1. μ₁, σ₁² are the prediction; μ₂, σ₂² are the measurement and its noise R; μ₂ − μ₁ is the innovation; K is the Kalman gain; and the fused variance (1−K)σ₁² is the covariance update. Every matrix in the general filter is playing the part one of these scalars plays here.
---

# Fusing Gaussian Estimates

Two thermometers in the same tank. One reads 20.0 °C, the other 22.0 °C.

Say 21.0 and you have assumed something you were not told: that the two are equally trustworthy. Suppose instead that the first is a laboratory probe good to ±0.1 °C and the second a cheap thermistor good to ±2.0 °C. Now 21.0 looks absurd — it is nearly ten standard deviations away from the good instrument's reading.

So the answer must lean towards the sharper one. How far?

And before the arithmetic, a question worth guessing at. The lab probe alone gives ±0.1 °C. **After combining it with the cheap one, is the answer more or less certain than ±0.1?**

Most people say less — the bad thermometer surely contaminates things. It does not. The answer comes out *sharper than the best input*, always, and understanding why is the whole of this page.

## Precisions add

Two independent Gaussian opinions about the same quantity multiply, as likelihoods do in [[bayes-theorem]]. Multiplying two Gaussian bumps gives another Gaussian bump, and if you push the exponents together the result is short:

$$
\frac{1}{\sigma^2} = \frac{1}{\sigma_1^2} + \frac{1}{\sigma_2^2}
$$

The reciprocal of variance is called **precision**, and this says precisions add. That is the sentence to keep.

It is also the answer to the guess. Adding a positive number to $1/\sigma_1^2$ makes the total precision bigger, so $\sigma$ must come out below $\sigma_1$. Nothing has been conjured — the cheap thermistor genuinely carries information, just not much of it. The lab probe's precision is 100; the thermistor's is 0.25. Total 100.25, giving ±0.0999 °C. A real improvement, and a tiny one, which is exactly as it should be.

Two equal instruments, precision $1/\sigma^2$ each, give $2/\sigma^2$ and a fused spread of $\sigma/\sqrt{2}$ — the $\sqrt{n}$ law from [[law-of-large-numbers]], arriving here as a special case.

## The mean, written the way a filter writes it

The precision-weighted average is the obvious form:

$$
\mu = \frac{\mu_1/\sigma_1^2 + \mu_2/\sigma_2^2}{1/\sigma_1^2 + 1/\sigma_2^2}
$$

Correct, symmetric, and not how anyone implements it. Multiply through and rearrange into a form that treats the first estimate as where you already were and the second as news arriving:

```formula
title: Fusing two estimates, in gain form
tex: '\hat{x} \;=\; \hat{x}_1 \;+\; \frac{\sigma_1^2}{\sigma_1^2 + \sigma_2^2}\,\big(\hat{x}_2 - \hat{x}_1\big)'
symbols: [hat-est, frac-bar, sigma-sd, plus, minus, equals]
reading: The fused estimate is the first estimate, nudged towards the second by a fraction of their disagreement — and that fraction is the first estimate's variance over the total.
steps:
  - Start where you already were, at the first estimate. If no news arrives, that is the answer.
  - The bracket is the disagreement — how far the second estimate is from the first. This is the only new information in the problem.
  - The fraction in front decides how much of that disagreement to act on. It is between 0 and 1 always.
  - Note which variance is on top. A large σ₁² — a bad first estimate — makes the fraction large and moves you a long way.
notes:
  hat-est: Three hatted quantities, all estimates of the same physical thing. None of them is the truth, and the fusion never pretends to produce it.
  frac-bar: This fraction is the Kalman gain. Its numerator is the uncertainty you brought in, its denominator is the total uncertainty in the comparison — so it reads as "what share of the doubt is mine".
  sigma-sd: The means do not appear in the gain at all. How far apart the two estimates are has no effect on how much you move — only on how far that move takes you.
  minus: >-
    The disagreement, later called the innovation. If it is zero, nothing changes no matter what the gain is — agreement is not evidence.
why: >-
  This form separates the two things a filter has to do. **Where you were** and **what surprised you** are kept apart, and the gain is the single knob deciding how much surprise to absorb. Writing it as a weighted average hides that structure; writing it this way makes the update look like what it is — a correction proportional to an error — and it generalises to matrices without changing shape.
```

The fused variance, in the same style, is $\sigma^2 = (1 - K)\,\sigma_1^2$. Since $K$ is between 0 and 1, uncertainty can only shrink. **Measurements never make a filter less certain.** That sounds obvious and is a genuine asymmetry with the prediction step, which can only make it *more* uncertain.

```viz
type: fuse
```

## What the gain is actually doing

$K = \sigma_1^2/(\sigma_1^2 + \sigma_2^2)$ is a ratio, so only the *relative* quality of the two sources matters. Scaling both variances by a thousand leaves the estimate identical and only changes the reported confidence. That fact returns in [[tuning-and-initialising-a-filter]]: it is why tuning a filter is a one-dimensional problem dressed as a two-dimensional one.

Three readings worth being able to produce instantly:

- $\sigma_2 \to \infty$ (useless measurement): $K \to 0$. Ignore it. The estimate does not move.
- $\sigma_1 \to \infty$ (no prior belief): $K \to 1$. Jump to the measurement. This is how a filter initialises itself from its first reading.
- $\sigma_1 = \sigma_2$: $K = \tfrac{1}{2}$. The plain average — the answer the instinct gave, correct in the one case where the instinct's hidden assumption is true.

## The failure that is always the same failure

Every line above assumed the two errors are **independent**.

Suppose both thermometers were calibrated last month against the same faulty reference, so each reads about 1.5 °C high. Fusing them gives an estimate that is 1.5 °C wrong with a claimed precision of ±0.1 °C. The mean is no worse than either input — but the *stated confidence* is a fabrication, because the second reading was mostly an echo of the first.

The error is always in the over-confident direction. That direction is the dangerous one: a filter that under-states its own uncertainty computes a smaller gain next time, listens less, and drifts further. The whole of [[filter-consistency-and-divergence]] is about catching this.

In practice the culprit is rarely two thermometers. It is the same GPS fix reaching an estimator twice by different routes, or a smoothed sensor output treated as a fresh measurement at every tick. Sensor-network people call it *data incest*, which is memorable and accurate.

## Failure modes

- **Correlated errors treated as independent.** Over-confidence, as above. The fix is to model the shared term — put the bias in the state and estimate it.
- **Fusing a filtered signal.** A sensor that internally smooths is reporting an estimate, not a measurement. Its successive outputs are heavily correlated and $R$ is not what the datasheet says.
- **Fusing estimates of different quantities.** Two thermometers in different tanks are not two opinions about one number, and the formula will happily return an average of them.
- **Non-Gaussian noise.** With heavy tails, an outlier is far more likely than the model allows, and the fused mean is dragged much further than it should be. Gating on the innovation is the standard defence.

:::check
Two independent estimates of the same quantity are fused. Why is the result sharper than either input, and why is that not information from nowhere?
:::

:::check
Write the fused mean in the form μ₁ + K(μ₂ − μ1) and say what K means at its two extremes.
:::

:::check
Both thermometers are calibrated against the same faulty reference. What does the fusion formula get wrong, and in which direction?
:::

:::check
Why does this scalar result deserve to be called the Kalman update?
:::
