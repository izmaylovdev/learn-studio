---
id: the-kalman-gain
title: The Kalman Gain
field: The Kalman Filter
summary: The one term everyone remembers, derived twice — by conditioning a Gaussian and by minimising a variance — and why the second derivation makes the filter work on noise that is not Gaussian at all.
tags: [kalman, estimation, optimality]
difficulty: 4
est_minutes: 50
prereqs: [the-predict-step, conditioning-a-joint-gaussian]
related: [fusing-gaussian-estimates, the-kalman-filter-loop, filter-consistency-and-divergence]
sources:
  - title: Kalman, A New Approach to Linear Filtering and Prediction Problems (1960)
    url: https://www.cs.unc.edu/~welch/kalman/media/pdf/Kalman1960.pdf
  - title: Simon, Optimal State Estimation — Ch. 5
    url: https://academic.csuohio.edu/simond/estimation/
checks:
  - q: >-
      Read K = PHᵀS⁻¹ aloud as a ratio. What is each factor doing?
    a: >-
      PHᵀ is the cross-covariance between the state and the measurement — how much of the state's uncertainty is visible to this sensor, and through which components. S = HPHᵀ + R is the total uncertainty in the comparison being made, the filter's own doubt seen through the sensor plus the sensor's doubt. So K reads as "the share of the disagreement that is mine", and dividing by S converts a surprise in measurement units into a correction in state units.
  - q: >-
      The gain can be derived by conditioning a joint Gaussian or by minimising the trace of the posterior covariance. Why does it matter that both give the same answer?
    a: >-
      Because the second derivation never mentions Gaussians. It asks only for the linear estimator with the smallest posterior variance, and needs nothing beyond the first two moments of the noise. So for non-Gaussian noise with the stated covariances, the Kalman gain is still the best possible *linear* estimator — it just is no longer the best estimator overall. Gaussianity is what upgrades "best linear" to "best, full stop".
  - q: >-
      What makes the gain large, and what makes it small?
    a: >-
      Only the ratio of the two uncertainties. A large P — an uncertain prediction — makes K large and the filter follows the sensor. A large R — a noisy sensor — makes K small and the filter trusts its model. Neither the size of the innovation nor the value of the measurement appears anywhere in K, which is why the gain sequence can be computed before any data exists.
  - q: >-
      Why does a filter invert S rather than P, and what does that buy?
    a: >-
      S has the dimension of the measurement, which is usually far smaller than the state — often 1×1. Inverting it is cheap and well conditioned, whereas inverting a large state covariance would be neither. When a measurement really is high-dimensional, the standard remedy is sequential update: apply the components one at a time, replacing one large inverse with several scalar divisions, which is valid whenever R is diagonal.
---

# The Kalman Gain

The prediction says the object is at 100 m. The radar says 104 m.

Who is right? Neither — that is not a question the filter can answer. The question it *can* answer is how far to move, and the whole of the Kalman filter's reputation rests on the fact that there is a single best answer, computable, and that it changes at every step as conditions change.

## Two routes to the same matrix

The first route is already done. [[conditioning-a-joint-gaussian]] says the correction to the state, given an observed $z$, is $\Sigma_{xz}\Sigma_{zz}^{-1}$ times the surprise. All that remains is to work out what those two covariances are for a filter.

The state's uncertainty is $P$, the prediction from the last page. The measurement is $z = Hx + v$, so:

$$
\Sigma_{xz} = \operatorname{Cov}(x,\, Hx + v) = P H^\top,
\qquad
\Sigma_{zz} = H P H^\top + R
$$

Both are the sandwich rule with the pieces filled in — the $R$ appears additively because the sensor noise is independent of the state. Substituting gives the gain.

```formula
title: The Kalman gain
tex: 'K_k \;=\; P_{k \mid k-1} H^\top \left( H P_{k \mid k-1} H^\top + R \right)^{-1}'
symbols: [K-gain, k-step, given, equals, P-cov, H-observation, transpose, plus, R-meas-noise]
reading: The gain is the covariance between state and measurement, divided by the total uncertainty in the measurement comparison.
steps:
  - The left factor, P Hᵀ, says how much of the state's uncertainty this sensor can see, and which state components it reaches.
  - Inside the bracket, H P Hᵀ is the filter's own uncertainty projected into measurement space — how surprised it expected to be.
  - Adding R includes the sensor's own noise. The bracket is the innovation covariance S, the total doubt in the comparison.
  - Inverting it divides the surprise by how surprising a surprise of that size actually is.
  - The result carries a quantity in measurement units into a correction in state units, which is the dimensional job of the gain.
notes:
  K-gain: >-
    Not square, in general. It maps the measurement space into the state space,
    so a 3-state filter with one scalar sensor has a 3×1 gain — one number per
    state, saying how much of a one-unit surprise each component absorbs.
  P-cov: >-
    The predicted covariance, not the updated one. Computing K from the
    already-updated P is the single most common implementation bug, and it
    makes the filter over-confident rather than obviously broken.
  R-meas-noise: >-
    The term that stops the gain reaching 1. With a perfect sensor, R = 0 and
    the filter would throw its prediction away at every step.
  H-observation: >-
    Appears three times, in three different roles — selecting what is visible,
    projecting the covariance, and projecting it back. It is never inverted in
    any of them.
  transpose: >-
    Both transposes come from the same place: covariance is quadratic, so every
    projection of it into measurement space happens on both sides.
why: >-
  Everything about the gain is a **ratio of uncertainties**, and nothing in it depends on the data. Not the measurement, not the innovation, not the state. That is why K can be computed offline from the model alone, why filters can ship with a precomputed steady-state gain and no matrix inverse at run time, and why you can answer "how accurate will this system be?" before the hardware exists. It also explains the failure mode: since the gain never consults reality, a model that is wrong produces a gain that is wrong, confidently and forever.
```

## The other route, which assumes less

The derivation above used Gaussians twice — once to say the conditional is Gaussian, once to say its mean is the right estimate. Kalman's original argument does not.

Insist only that the estimator be **linear** in the measurement, $\hat{x}_{k \mid k} = \hat{x}_{k \mid k-1} + K(z_k - H\hat{x}_{k \mid k-1})$, with $K$ free. Substituting into the definition of the posterior covariance gives

$$
P_{k \mid k} = (I - KH)\,P_{k \mid k-1}\,(I - KH)^\top + K R K^\top
$$

for *any* $K$. Now choose $K$ to minimise the total variance $\operatorname{tr} P_{k \mid k}$. Differentiating with respect to $K$ and setting the result to zero gives exactly the same matrix.

That the two agree is not a coincidence — for Gaussians the conditional mean is the minimum-variance estimator — but the second derivation needed far less. It never mentioned a distribution. It asked for the first two moments and nothing else.

The consequence is the most under-quoted fact about the filter:

> With non-Gaussian noise of the stated covariances, the Kalman filter is still the **best linear unbiased estimator**. It is simply no longer the best estimator.

So a filter fed heavy-tailed sensor noise is not invalid. It is doing the best any linear method could, and a nonlinear method — gating outliers, a robust loss, a particle filter — could do better. Knowing which of those two situations you are in changes what you should build.

## Reading the gain

Check it against what you already know. In one dimension, $H = 1$ and everything is a scalar:

$$
K = \frac{P}{P + R}
$$

— the fusion gain from [[fusing-gaussian-estimates]], with $P$ playing the prior's variance and $R$ the measurement's. Every intuition from that page transfers unchanged:

- **Uncertain prediction, good sensor** ($P \gg R$): $K \to 1$. Follow the measurement.
- **Confident prediction, noisy sensor** ($P \ll R$): $K \to 0$. Hold the model.
- **Equal** : $K = \tfrac{1}{2}$. Split the difference.

And for a multi-state filter, the gain's *shape* is as informative as its size. In a constant-velocity tracker with a position-only sensor, $K$ is a two-element column: the first entry corrects position directly, and the second corrects velocity — non-zero only because $P$ has the off-diagonal term that [[covariance-propagation]] built. Set that term to zero and the second entry of $K$ vanishes, and the filter can never learn velocity.

## Why S and not P gets inverted

$S = HPH^\top + R$ lives in measurement space. A filter with twelve states and one scalar sensor inverts a $1\times1$ matrix — a division.

When the measurement genuinely has many components, the standard remedy is a **sequential update**: apply the components one at a time, each with its own scalar $S$, re-running the update between them. This is exactly equivalent when $R$ is diagonal, replaces one $m \times m$ inverse with $m$ divisions, and is much better conditioned. Most production filters do this.

## Failure modes

- **Singular $S$.** Two sensors reporting the same quantity with no independent noise, or $R = 0$. The gain blows up and the filter takes the measurement as gospel.
- **Using the updated $P$ to compute $K$.** Produces a gain that is too small, an over-confident filter, and no error message.
- **Gain collapsing to zero.** Either $P$ has been driven down by too small a $Q$, or the state is unobservable. Both are covered in [[filter-consistency-and-divergence]]; the distinction matters because only one is fixable by tuning.
- **Ignoring the gain entirely.** It is the cheapest diagnostic in the filter. A gain that changes shape when it should be steady, or a steady gain that should be adapting, tells you something is wrong long before the estimate visibly drifts.

:::check
Read K = PHᵀS⁻¹ aloud as a ratio. What is each factor doing?
:::

:::check
The gain can be derived by conditioning a joint Gaussian or by minimising the trace of the posterior covariance. Why does it matter that both give the same answer?
:::

:::check
What makes the gain large, and what makes it small?
:::

:::check
Why does a filter invert S rather than P, and what does that buy?
:::
