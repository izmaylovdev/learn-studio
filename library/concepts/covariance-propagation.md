---
id: covariance-propagation
title: Covariance Propagation
field: Vectors and Covariance
summary: Pushing an uncertainty through a linear map — and the surprise that correlations the filter later exploits are manufactured by the propagation itself.
tags: [estimation, gaussian, kalman]
difficulty: 3
est_minutes: 40
prereqs: [gaussian-random-vectors]
related: [variance-and-standard-deviation, matrix-algebra-for-estimation, the-predict-step]
sources:
  - title: Bar-Shalom, Li & Kirubarajan, Estimation with Applications to Tracking and Navigation — Ch. 1
    url: https://onlinelibrary.wiley.com/doi/book/10.1002/0471221279
checks:
  - q: >-
      Why does a linear map act on covariance as AΣAᵀ rather than as AΣ, and what does the double hit mean dimensionally?
    a: >-
      Covariance is quadratic in the deviations, so each of the two factors (x−μ) gets multiplied by A — once as a column and once as a row, which is the transpose. Dimensionally it means that doubling A quadruples every entry of the covariance, so the standard deviations only double. That is the right answer: if you rescale a quantity by two, its spread scales by two, and its variance by four.
  - q: >-
      Start with position and velocity uncorrelated and step a constant-velocity model forward. Where does the position–velocity correlation come from?
    a: >-
      From the propagation itself. New position depends on old position and old velocity, while new velocity depends only on old velocity — so the two outputs share the velocity term and therefore co-vary. Explicitly, FΣFᵀ has off-diagonal Δt·σ_v², which is nonzero even though the input covariance was diagonal. Nobody measured anything; the coupling was created by the dynamics.
  - q: >-
      Why does that manufactured correlation matter to a filter that only ever measures position?
    a: >-
      Because correction flows along correlations. When the position measurement arrives, the update reduces the position error, and the nonzero off-diagonal entry carries part of that correction into the velocity estimate. Zero the off-diagonal and the filter can never learn velocity at all — it would be estimating an unobserved state from nothing.
  - q: >-
      When is AΣAᵀ exact but the Gaussian answer still wrong?
    a: >-
      Always, when the input is not Gaussian. The sandwich is an identity about means and covariances and needs no distributional assumption at all, so the first two moments come out right for any distribution. What needs the Gaussian assumption is the claim that those two moments describe the whole output distribution — for a skewed or bimodal input, the propagated mean and covariance are correct and badly incomplete.
---

# Covariance Propagation

You are on a straight road. You believe you are at the 100 m mark, give or take 2 m, and that you are doing 10 m/s, give or take 0.1 m/s. Nothing about those two beliefs is related — the odometer and the speedometer are separate instruments.

Ten seconds pass with no new information. Where are you now, and how sure are you?

The mean is easy: 200 m, 10 m/s. The spread takes one minute of thought and produces something that ought to be surprising.

## The naive answer, and why it is close but wrong in structure

Most people get the position variance right on the first try. Position is $p + 10v$, the two inputs are independent, so the variances add with the coefficient squared:

$$
\operatorname{Var}(p + 10 v) = \sigma_p^2 + 100\,\sigma_v^2 = 4 + 1 = 5
$$

So roughly ±2.24 m rather than ±2 m. Fine.

Now answer the second question: **are your new position error and new velocity error still independent?**

The instinct is yes — you did not do anything, no measurement arrived, nothing was mixed. The instinct is wrong, and seeing why is the point of this page.

New position is $p + 10v$. New velocity is $v$. Both of them contain $v$. If your velocity belief was too high, then your new position is too far *and* your velocity is still too high — the two errors now move together. The propagation manufactured a correlation out of a model that had none.

## The general rule

Write the whole thing as one linear map $x' = Ax$. Then:

```formula
title: Covariance through a linear map
tex: '\operatorname{Cov}(Ax) \;=\; A\,\Sigma\,A^\top'
symbols: [cov-op, A-matrix, x-state, equals, Sigma-cov, transpose]
reading: The covariance of a linearly transformed vector is the original covariance sandwiched between the matrix and its transpose.
steps:
  - Covariance is an average of (deviation)(deviation)ᵀ — two factors, not one.
  - Applying A to the vector applies it to each deviation, so A multiplies on the left.
  - The second factor is already a row, so A arrives on it as a transpose on the right.
  - Nothing about a distribution was assumed. This is an identity about second moments.
notes:
  A-matrix: Need not be square. A 1×2 row vector projects a 2-D state onto one number, and the sandwich correctly returns a 1×1 variance.
  transpose: The symmetry of the result is guaranteed by this pairing — transpose the whole right-hand side and you get it back unchanged.
  Sigma-cov: If Σ is positive semi-definite then so is AΣAᵀ, because aᵀAΣAᵀa is just the original quadratic form asked in the direction Aᵀa.
  cov-op: The mean travels separately and far more simply — E[Ax] = A·E[x]. Only the second moment needs the sandwich.
why: >-
  This one line is the **predict step** of the Kalman filter, and it is the reason the filter can estimate quantities it never measures. Because A hits the covariance twice, the map does not merely inflate the ellipse — it **shears and rotates** it, creating correlations between components that started independent. Every inference the filter later makes about velocity, from position measurements alone, travels along a correlation that this formula created.
```

Work the road example through it. With

$$
F = \begin{bmatrix} 1 & \Delta t \\ 0 & 1 \end{bmatrix}, \qquad
\Sigma = \begin{bmatrix} \sigma_p^2 & 0 \\ 0 & \sigma_v^2 \end{bmatrix}
$$

the sandwich gives

$$
F\Sigma F^\top = \begin{bmatrix} \sigma_p^2 + \Delta t^2 \sigma_v^2 & \Delta t\,\sigma_v^2 \\ \Delta t\,\sigma_v^2 & \sigma_v^2 \end{bmatrix}
$$

The top-left entry is the variance computed above. The bottom-right is unchanged, correctly — coasting teaches you nothing about your speed and costs you nothing either. And the off-diagonal $\Delta t\,\sigma_v^2$ is **not zero**, out of an input where it was.

```viz
type: covariance
```

## Why the created correlation is the whole trick

Hold on to what just happened, because the Kalman filter's most impressive behaviour rests on it.

Build a tracker that observes position only. It never measures velocity, and there is no sensor anywhere in the system that could. Yet after a few steps it reports a velocity estimate with a shrinking uncertainty.

The mechanism is here. Propagation couples the position error to the velocity error. A position measurement then shrinks the position error — and because the two are correlated, part of that correction flows into the velocity. **Correction flows along correlations.** Zero the off-diagonal entries of $P$ and the filter goes permanently blind to velocity, because there is no longer a channel connecting what it measures to what it wants.

That is also why a diagonal-only "simplified" filter is not a simplification. It is a different and much worse algorithm.

## Adding independent noise

Real dynamics are not exactly $Ax$. Something unmodelled happens — wind, a bump, an acceleration you did not command. If that disturbance is independent of the current state, covariances simply add:

$$
\operatorname{Cov}(Ax + w) = A\Sigma A^\top + Q, \qquad Q = \operatorname{Cov}(w)
$$

Independence is what buys the plus sign, exactly as in [[variance-and-standard-deviation]]. If the disturbance were correlated with the state, cross terms would appear and the formula would be wrong in a direction that makes the filter over-confident — which is the worse direction.

Note what this guarantees: prediction can only ever *increase* uncertainty. $Q$ is positive semi-definite, so nothing here can make the ellipse smaller. Shrinking is the update step's job, and only measurements do it.

## Failure modes

- **Nonlinear maps.** The sandwich is exact only for linear $A$. Push a Gaussian through a square root or an arctangent and the output is not Gaussian, its mean is not the map of the mean, and the ellipse is not $A\Sigma A^\top$. Everything in [[extended-and-unscented-kalman-filters]] exists to cope with this, and every EKF failure is a place where the sandwich was applied to something bent.
- **Assuming independence of the disturbance.** Vibration correlated with speed, or a temperature drift affecting both sensor and platform, breaks the additive rule.
- **Losing symmetry.** In floating point $A\Sigma A^\top$ comes back very slightly non-symmetric, and the error compounds over thousands of steps.
- **Believing the covariance is the whole story.** The sandwich needs no distributional assumption and is therefore *always* right about the first two moments — and for a non-Gaussian input, being right about two moments is not the same as being right.

:::check
Why does a linear map act on covariance as AΣAᵀ rather than as AΣ, and what does the double hit mean dimensionally?
:::

:::check
Start with position and velocity uncorrelated and step a constant-velocity model forward. Where does the position–velocity correlation come from?
:::

:::check
Why does that manufactured correlation matter to a filter that only ever measures position?
:::

:::check
When is AΣAᵀ exact but the Gaussian answer still wrong?
:::
