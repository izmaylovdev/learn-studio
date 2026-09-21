---
id: the-predict-step
title: The Predict Step
field: The Kalman Filter
summary: Push the belief forward through the model — where the mean travels for free, the ellipse shears, and the filter's uncertainty can only grow.
tags: [kalman, estimation]
difficulty: 3
est_minutes: 40
prereqs: [linear-gaussian-state-space-models, covariance-propagation, process-and-measurement-noise]
related: [the-kalman-gain, the-kalman-filter-loop]
sources:
  - title: Welch & Bishop, An Introduction to the Kalman Filter
    url: https://www.cs.unc.edu/~welch/kalman/kalmanIntro.html
checks:
  - q: >-
      The mean prediction is one matrix multiply and the covariance prediction is a sandwich plus an addition. Why the asymmetry?
    a: >-
      Because expectation is linear and covariance is quadratic. E[Fx] = F·E[x] needs nothing at all — not independence, not a distribution — so the mean travels through unchanged in form. Covariance is built from products of two deviations, so F hits it twice, once on each side, and the added Q reflects a disturbance that contributes no mean but does contribute spread.
  - q: >-
      Why can the predict step never reduce uncertainty?
    a: >-
      Because FPFᵀ is positive semi-definite whenever P is, and Q is positive semi-definite by construction, so their sum can have no negative variance in any direction. Physically it is obvious once stated — time passing with no new information cannot teach you anything. Only the update step, which brings in a measurement, is able to shrink the ellipse.
  - q: >-
      Between measurements, why does a constant-velocity filter's position uncertainty grow faster than linearly?
    a: >-
      Two things grow it at once. The existing velocity uncertainty is converted into position uncertainty by the shear in F, contributing Δt²σ_v² — quadratic in elapsed time. On top of that Q adds its own Δt⁴ position term from the unmodelled acceleration. So dead reckoning degrades in a way that gets worse the longer it goes on, which is why an outage of twice the length costs far more than twice the accuracy.
  - q: >-
      What does the subscript k|k−1 mean, and why keep track of it?
    a: >-
      It means "at step k, given every measurement up to and including step k−1" — a genuine conditioning bar. Keeping it explicit separates the two distinct beliefs the filter holds at the same instant: the prediction, which has not yet seen z_k, and the update, which has. Most implementation bugs are a confusion between those two, such as computing the gain from the already-updated covariance.
---

# The Predict Step

Nothing arrives. A tick of the clock passes and the filter has to say what it believes now.

It has two things to move forward: where it thinks the system is, and how sure it is. The first is easy enough that it is worth asking why the second is not.

## The mean travels for free

$$
\hat{x}_{k \mid k-1} = F\,\hat{x}_{k-1 \mid k-1} + B\,u_k
$$

That is it. Run the estimate through the model exactly as if it were the truth, and add whatever you deliberately did.

The reason this needs no care is that expectation is linear: $E[Fx] = F\,E[x]$, with no assumption about independence, about distributions, about anything. Averages pass straight through linear maps, which is the single most useful property in the subject and the reason [[expectation]] is introduced before variance.

The control term is free accuracy. If you commanded an acceleration, you know it; feeding it through $B$ shifts the prediction without adding any uncertainty at all, because a known quantity has no spread. Leaving it out does not make the filter wrong, but it forces $Q$ to grow large enough to cover your own deliberate actions, and a large $Q$ costs precision everywhere.

## The covariance does not

```formula
title: Predicting the covariance
tex: 'P_{k \mid k-1} \;=\; F\,P_{k-1 \mid k-1}\,F^\top \;+\; Q'
symbols: [P-cov, k-step, given, equals, F-transition, transpose, plus, Q-proc-noise]
reading: The new covariance is the old one pushed through the model from both sides, plus the process noise the model does not account for.
steps:
  - Start with what you believed a moment ago — an ellipse in state space.
  - F on the left and its transpose on the right push that ellipse through the dynamics. This shears and rotates it; it does not merely inflate it.
  - Adding Q inflates it further, by the amount you are willing to admit the model is wrong.
  - Both terms are positive semi-definite, so the result is never smaller than what you started with in any direction.
notes:
  given: >-
    A real conditioning bar. The left side is the belief at step k given data
    through k−1 — after the clock has moved but before the sensor has spoken.
  transpose: >-
    The tell-tale of a quadratic quantity. One F would be a mean-style update
    and would not even return a symmetric matrix.
  Q-proc-noise: >-
    The only term that does not depend on what you already believed. It is a
    flat addition per step, which is why coasting for twice as long costs more
    than twice as much.
  F-transition: >-
    Applied twice, so any error in it is felt twice over. A one-percent error
    in F is a two-percent error in the predicted covariance.
  P-cov: >-
    A belief about a belief. Nothing here has been checked against the world —
    this number will be exactly as accurate as F and Q deserve.
why: >-
  This line is the reason a filter can lose track without noticing. Prediction is where confidence is **manufactured**, from F and Q alone, with no contact with reality anywhere in it. If F is wrong or Q is too small, P still comes out small and well-behaved, and the filter will go on reporting it. The measurement never gets to object, because by the time it arrives the gain has already been computed from this number.
```

## What it looks like

Take $\sigma_p = 2$ m, $\sigma_v = 0.1$ m/s, uncorrelated, and coast ten seconds with $\Delta t = 10$:

$$
P_{k-1 \mid k-1} = \begin{bmatrix} 4 & 0 \\ 0 & 0.01\end{bmatrix}
\;\longrightarrow\;
FPF^\top = \begin{bmatrix} 5 & 0.1 \\ 0.1 & 0.01\end{bmatrix}
$$

Three things happened, and only one of them was inflation.

- Position variance rose from 4 to 5, because velocity uncertainty has been converted into position uncertainty.
- Velocity variance did not change at all. Coasting teaches you nothing about speed and costs you nothing either — the velocity row of $F$ is $\begin{bmatrix}0 & 1\end{bmatrix}$, so nothing touches it.
- An off-diagonal term appeared out of nothing. That is the channel the next measurement will travel along to correct a velocity nobody measured.

Then $Q$ is added on top, which for a constant-velocity model inflates all three entries, including the off-diagonal one — for the reasons in [[process-and-measurement-noise]].

## Uncertainty only goes one way

$FPF^\top$ is a sandwich and therefore positive semi-definite; $Q$ is positive semi-definite by construction. The sum cannot have negative variance in any direction, so

$$
\text{prediction never shrinks the ellipse.}
$$

This is worth stating as a law because it gives the filter its rhythm. Prediction inflates, update deflates, and a filter in steady state is one where the two exactly cancel. Watching $P$ over time, you should see a sawtooth: growth between measurements, a drop at each one. A trace that only falls means $Q$ is too small; one that only rises means the measurements are not being applied.

## Predicting many steps

Nothing requires one prediction per measurement. Predict as often as you like — a filter running at 100 Hz with a 1 Hz GPS does ninety-nine predictions for every update, and that is the normal arrangement, not a compromise.

But the cost compounds. For a constant-velocity model, coasting for an elapsed time $t$ contributes roughly

$$
t^2 \sigma_v^2 \;+\; \tfrac{1}{4}\,t^4\sigma_a^2
$$

to the position variance. Quadratic from converted velocity uncertainty, quartic from the unmodelled acceleration. **Dead reckoning is exactly this loop with the update step deleted**, and the quartic term is why inertial navigation drifts the way it does — a tunnel twice as long is far more than twice as bad.

## Failure modes

- **Forgetting $Q$.** $P$ then falls monotonically, the gain follows, and the filter stops listening. The most common cause of divergence there is.
- **Forgetting the transpose.** $FPF$ is not symmetric and is not a covariance. Some libraries will not complain.
- **Reusing $F$ after $\Delta t$ changes.** Both $F$ and $Q$ contain the step. A late sample needs both rebuilt.
- **Applying the control input twice**, or applying the commanded value when the actuator saturated. $u$ must be what actually happened, not what was asked for.
- **Drifting asymmetry.** After thousands of steps $P$ slowly stops being symmetric. Re-symmetrising with $\tfrac{1}{2}(P + P^\top)$ costs nothing and prevents a class of late-night failures.

:::check
The mean prediction is one matrix multiply and the covariance prediction is a sandwich plus an addition. Why the asymmetry?
:::

:::check
Why can the predict step never reduce uncertainty?
:::

:::check
Between measurements, why does a constant-velocity filter's position uncertainty grow faster than linearly?
:::

:::check
What does the subscript k|k−1 mean, and why keep track of it?
:::
