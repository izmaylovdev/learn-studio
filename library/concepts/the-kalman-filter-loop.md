---
id: the-kalman-filter-loop
title: The Kalman Filter Loop
field: The Kalman Filter
summary: The five equations assembled — with the covariance update written the long way, because the short way is the one that fails at three in the morning.
tags: [kalman, estimation, implementation]
difficulty: 4
est_minutes: 55
prereqs: [the-kalman-gain]
related: [bayes-theorem, the-predict-step, tuning-and-initialising-a-filter, filter-consistency-and-divergence]
sources:
  - title: Welch & Bishop, An Introduction to the Kalman Filter
    url: https://www.cs.unc.edu/~welch/kalman/kalmanIntro.html
  - title: Labbe, Kalman and Bayesian Filters in Python
    url: https://github.com/rlabbe/Kalman-and-Bayesian-Filters-in-Python
checks:
  - q: >-
      In what sense is the update step Bayes' theorem?
    a: >-
      The predicted belief is the prior, the measurement model gives the likelihood of the reading under each candidate state, and the updated belief is the posterior. Bayes says posterior ∝ likelihood × prior; for Gaussians that product is another Gaussian, and its mean and covariance are exactly the two update equations. The filter is recursive Bayes with the integrals already done, which is possible only because Gaussians stay Gaussian under both prediction and conditioning.
  - q: >-
      The short covariance update is P = (I − KH)P. Why does the Joseph form exist?
    a: >-
      The short form is algebraically equivalent but only when K is exactly the optimal gain, and it is not symmetric in structure — round-off pushes the result off the symmetric positive-definite cone, and once there the errors compound. The Joseph form is a sandwich plus another sandwich, so it is structurally symmetric and positive semi-definite for any K whatsoever. It costs more multiplications and it is what you use when the filter has to run for a long time or with a suboptimal or approximate gain.
  - q: >-
      Why does the filter predict every tick but update only when a measurement arrives?
    a: >-
      Because the two steps answer different questions. Prediction is driven by the clock — time passing changes the state and inflates the covariance regardless of whether any sensor spoke. The update is driven by data arriving. Decoupling them lets a 100 Hz filter consume a 1 Hz GPS and a 50 Hz accelerometer without any of them needing to agree on a rate, and it is why a missed measurement merely widens the covariance rather than breaking anything.
  - q: >-
      If the innovation is zero, what happens, and what does that tell you about what the filter learns from?
    a: >-
      Nothing moves — the state update adds K times zero. But the covariance still shrinks, because the covariance update does not involve the innovation at all. So agreement is not evidence about where the system is, yet it is still evidence about how well you know it. That split is the clearest statement of the filter's structure: the measurement's value moves the estimate, and the measurement's mere existence sharpens the confidence.
---

# The Kalman Filter Loop

Everything is now in place. The loop is five equations, and four of them have already been derived — which means this page is mostly about the one that has not, and about the gap between an equation that is correct and code that survives a month of running.

## The loop

**Predict**, every tick of the clock:

$$
\hat{x}_{k \mid k-1} = F\hat{x}_{k-1 \mid k-1} + Bu_k
\qquad
P_{k \mid k-1} = F P_{k-1 \mid k-1} F^\top + Q
$$

**Update**, whenever a measurement arrives:

$$
y_k = z_k - H\hat{x}_{k \mid k-1}
\qquad
S_k = H P_{k \mid k-1} H^\top + R
\qquad
K_k = P_{k \mid k-1}H^\top S_k^{-1}
$$

and then the two that carry the answer.

```formula
title: The state update
tex: '\hat{x}_{k \mid k} \;=\; \hat{x}_{k \mid k-1} \;+\; K_k\,\big(z_k - H\hat{x}_{k \mid k-1}\big)'
symbols: [hat-est, x-state, k-step, given, equals, plus, K-gain, z-meas, minus, H-observation]
reading: The updated estimate is the prediction plus the gain times the difference between what the sensor said and what the prediction expected it to say.
steps:
  - Start at the prediction. If no measurement had arrived, this would be the final answer for this step.
  - Inside the bracket, H x̂ is what a perfect sensor would have read had the prediction been true.
  - Subtracting it from the actual reading leaves the innovation — the surprise, and the only new information in the step.
  - The gain converts that surprise from measurement units into a state correction, and decides what fraction of it to believe.
  - Add. Note the shape — old estimate plus gain times error — which is the shape of almost every recursive estimator ever written.
notes:
  minus: >-
    The innovation. It is the only place in the entire update where the observed
    number enters; everything else was fixed before the sensor spoke.
  K-gain: >-
    Recomputed every step. A filter with a frozen gain is a fixed low-pass
    filter, which is sometimes exactly what you want and is not this.
  given: >-
    Both bars are real conditioning. The left side has seen z_k, the right side
    has not, and they are two different beliefs about the same instant.
  hat-est: >-
    Still an estimate afterwards. The update does not produce the truth — it
    produces a better-informed belief, with its own covariance to say how much.
  z-meas: >-
    Arrives in its own space and units. It is never compared to the state, only
    to H x̂, which is the prediction translated into the sensor's language.
why: >-
  This is [[bayes-theorem]] with the integral already evaluated. The prediction is the prior, the measurement model supplies the likelihood, and this is the posterior mean — the general rule specialised to the one family where the answer stays in the family. Notice what the estimate does **not** depend on: the raw measurement never enters on its own, only the innovation. A filter learns from **disagreement**, and a measurement that confirms the prediction moves the estimate not at all.
```

## The covariance update, written the long way

The textbook short form is $P_{k \mid k} = (I - K_kH)P_{k \mid k-1}$, and it is correct — *provided* $K_k$ is exactly the optimal gain. Use it and move on if the filter runs for a minute.

For anything that runs longer, use this instead.

```formula
title: The Joseph form covariance update
tex: 'P_{k \mid k} \;=\; (I - K_k H)\,P_{k \mid k-1}\,(I - K_k H)^\top \;+\; K_k R\, K_k^\top'
symbols: [P-cov, k-step, given, equals, I-identity, minus, K-gain, H-observation, transpose, plus, R-meas-noise]
reading: The updated covariance is the predicted one squeezed from both sides by the part of the error the measurement did not remove, plus the sensor's own noise carried in through the gain.
steps:
  - I − KH is the fraction of the prior error that survives the update. With K = 0 nothing is removed and it is the identity.
  - Sandwiching P between it and its transpose is the usual rule for pushing a covariance through a linear map.
  - The second term is the sensor's noise, which the gain has just imported into the estimate. It is the price of listening.
  - Both terms are sandwiches, so both are symmetric and positive semi-definite whatever K happens to be.
notes:
  I-identity: >-
    The only place the identity matrix earns its keep. I − KH is the residual
    fraction, and reading it that way makes the whole line interpretable.
  transpose: >-
    Structural, not decorative. It is what makes the result symmetric by
    construction rather than by luck, which is the entire point of this form.
  R-meas-noise: >-
    Listening to a noisy sensor injects some of its noise. The optimal gain is
    exactly the one that balances this cost against the error it removes.
  K-gain: >-
    Appears four times. This form stays valid for a suboptimal K — an
    underweighted gain, a fixed gain, a linearised one — which the short form
    does not.
why: >-
  The short form subtracts, and subtraction of nearly equal quantities is where floating point goes to die. After enough steps it drifts off symmetry, then off positive-definiteness, and a covariance with a negative eigenvalue produces a gain that is meaningless — with no error raised anywhere. The Joseph form is two sandwiches added together, so it **cannot** produce a non-symmetric or indefinite result, whatever K it is given. It costs roughly twice the multiplications. Filters that have to run for months are written this way.
```

## Seeing the loop run

```viz
type: kalman
```

## In code

```python
def step(x, P, z, F, H, Q, R, B=None, u=None):
    # --- predict -----------------------------------------------------
    x = F @ x + (B @ u if u is not None else 0)
    P = F @ P @ F.T + Q

    if z is None:                 # no measurement this tick — coast
        return x, P

    # --- update ------------------------------------------------------
    y = z - H @ x                 # innovation
    S = H @ P @ H.T + R           # innovation covariance
    K = P @ H.T @ np.linalg.inv(S)

    x = x + K @ y
    A = np.eye(len(x)) - K @ H
    P = A @ P @ A.T + K @ R @ K.T # Joseph form
    P = (P + P.T) / 2             # and re-symmetrise anyway
    return x, P
```

Four things in that fragment are not in the equations and matter:

- **`z is None` returns early.** Predict on the clock, update on the data. A missing measurement is not an error; it just means the covariance stays wide.
- **`np.linalg.inv`** is the pedagogical version. Production code solves $S K^\top = H P^\top$ instead, or updates the components sequentially.
- **The re-symmetrisation** costs nothing and removes a whole category of slow failure.
- **Nothing validates $z$.** A real filter gates it — see below.

## What the loop never does

It never looks back. There is no history buffer, no window, no list of past measurements. The state and the covariance are the complete summary of everything the filter has ever seen, which is the payoff of the Markov assumption in [[linear-gaussian-state-space-models]]: constant memory and constant time per step, forever, regardless of how long it has been running.

It is worth appreciating how unusual that is. The optimal estimate given a million measurements takes the same work as the one given three.

## The one line to add before shipping

Gating. Before the update, ask whether the innovation is plausible under the filter's own covariance:

$$
y_k^\top S_k^{-1} y_k < \gamma
$$

If the surprise is larger than the model says is possible — $\gamma$ around 9 for a scalar measurement, being three sigma — throw the measurement away and predict through. This is the standard defence against the Gaussian's absurdly thin tails, and it is three lines.

It is also dangerous in exactly one way: a filter that has genuinely diverged rejects every measurement that could save it, because they all look impossible from where it now believes it is. Gates need a counter, and a run of consecutive rejections should trigger a reset rather than more rejecting. [[filter-consistency-and-divergence]] is where that gets diagnosed properly.

## Failure modes

- **Gain computed from the updated $P$.** Silent, and makes the filter over-confident.
- **Update applied without a prediction.** Two measurements in the same tick must each be preceded by their own predict, or the second one double-counts the same prior.
- **Short-form covariance update in a long-running filter.** As above.
- **No gating.** One bad reading from a sensor with a loose connector and the estimate lurches; with a small $R$ it may never recover.
- **Angle wrapping in the innovation.** $y$ for a heading near $\pm\pi$ must be wrapped into $(-\pi, \pi]$, or the filter sees a $2\pi$ surprise and destroys itself.

:::check
In what sense is the update step Bayes' theorem?
:::

:::check
The short covariance update is P = (I − KH)P. Why does the Joseph form exist?
:::

:::check
Why does the filter predict every tick but update only when a measurement arrives?
:::

:::check
If the innovation is zero, what happens, and what does that tell you about what the filter learns from?
:::
