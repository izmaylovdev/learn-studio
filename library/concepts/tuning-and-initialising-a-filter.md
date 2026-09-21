---
id: tuning-and-initialising-a-filter
title: Tuning and Initialising a Filter
field: Filters in Practice
summary: Two knobs that are really one, the lag that over-smoothing buys you, and why a wildly uncertain starting guess is safer than a slightly wrong confident one.
tags: [kalman, tuning, implementation]
difficulty: 3
est_minutes: 45
prereqs: [the-kalman-filter-loop, process-and-measurement-noise]
related: [filter-consistency-and-divergence, fusing-gaussian-estimates]
sources:
  - title: Bar-Shalom, Li & Kirubarajan, Estimation with Applications to Tracking and Navigation — §5.5
    url: https://onlinelibrary.wiley.com/doi/book/10.1002/0471221279
  - title: Labbe, Kalman and Bayesian Filters in Python — Ch. 8
    url: https://github.com/rlabbe/Kalman-and-Bayesian-Filters-in-Python
checks:
  - q: >-
      Multiply both Q and R by 100. What changes in the filter's output?
    a: >-
      The estimates do not change at all. The gain depends only on the ratio — scaling both leaves K identical at every step, so the sequence of x̂ is bit-for-bit the same. What does change is P, which comes out 100 times larger, so the filter reports the same answers with a hundredfold weaker claim of confidence. Tuning is therefore a one-dimensional problem: fix R by measuring it, and move Q alone.
  - q: >-
      A constant-velocity filter is tracking a target that starts to accelerate steadily. What does the estimate do, and why is tightening Q the wrong instinct?
    a: >-
      It lags behind by a roughly constant offset, proportional to the acceleration and to the square of the filter's time constant. The filter is not noisy, it is systematically behind. Tightening Q lengthens the memory and makes the lag worse; loosening Q shortens it at the cost of a noisier estimate. The lag is the price of a model that has no acceleration in it, and the real fixes are a larger Q, a state with acceleration in it, or a model that switches.
  - q: >-
      Why is a very large P₀ with a bad initial guess safe, while a small P₀ with the same guess is not?
    a: >-
      Because the gain is P/(P+R). With a huge P₀ the first gain is nearly 1, so the filter throws its guess away and jumps essentially onto the first measurement — the bad guess is erased in one step. With a small P₀ the filter believes the guess, computes a tiny gain, and barely moves towards measurements that contradict it. The error stays large while P keeps shrinking on schedule, which is the classic route into divergence.
  - q: >-
      Why not simply set P₀ to an enormous number like 10¹² times the identity?
    a: >-
      Because it wrecks the conditioning. The first update has to subtract quantities differing by twelve orders of magnitude, and in double precision that loses most of the significant digits — the resulting P can come back non-symmetric or indefinite. The better move is to build the initial state directly from the first measurements, using two-point differencing for any rate, and set P₀ from R and the sample interval so that every entry is a number the arithmetic can handle.
---

# Tuning and Initialising a Filter

The derivation is done, the code is right, and the filter tracks badly. It lags on turns, or it jitters, or it slowly walks away from the truth.

The instinct is to start adjusting $Q$ and $R$, watching the output, and stopping when it looks better. That instinct wastes most of its effort, for a reason worth establishing before any turning of knobs.

## There is only one knob

Multiply both $Q$ and $R$ by the same constant $c$. Follow it through: $P_{k \mid k-1}$ becomes $cP$, so

$$
K = cP H^\top (H\,cP\,H^\top + cR)^{-1} = cPH^\top \cdot c^{-1}(HPH^\top + R)^{-1}
$$

and the two factors of $c$ cancel. **The gain is unchanged.** So is every estimate the filter will ever produce — bit for bit, the same sequence of $\hat{x}$.

What does change is $P$ itself, which comes out $c$ times larger. The filter makes identical decisions and reports a different confidence in them.

So the two matrices do two separate jobs, and only one of them affects tracking:

- **The ratio $Q/R$** sets the gain, and therefore everything about how the filter behaves.
- **The overall scale** sets only the reported covariance, which matters for gating and for anything downstream that consumes $P$.

Since $R$ is the one you can actually measure — bolt the sensor down, log, take the sample covariance — the procedure is forced. **Measure $R$. Fix it. Tune $Q$ alone.** An afternoon spent characterising the sensor removes a whole dimension from the search.

## What the ratio buys and costs

In steady state the filter settles: prediction inflates $P$ by exactly as much as the update deflates it, and the gain stops changing. For a scalar random-walk model the fixed point is short enough to write down.

```formula
title: The steady-state covariance
tex: 'P_\infty \;=\; \frac{(P_\infty + Q)\,R}{P_\infty + Q + R}'
symbols: [P-cov, infinity, equals, frac-bar, Q-proc-noise, R-meas-noise, plus]
reading: The settled uncertainty is the value that reproduces itself after one prediction and one update.
steps:
  - Start from the settled covariance and predict — which adds Q, giving P + Q.
  - Then update, which combines that with the sensor through the precision rule from scalar fusion.
  - In steady state the result has to be what you began with, which is what the equals sign is asserting.
  - Solve the quadratic and only the positive root is meaningful, since a variance cannot be negative.
notes:
  infinity: >-
    Not a limit taken to infinity in time so much as a fixed point. Real filters
    reach it within a handful of steps from almost any starting covariance.
  Q-proc-noise: >-
    Set it to zero and the equation forces P∞ = 0 — the filter converges to
    perfect confidence, whether or not it has converged to the right answer.
  R-meas-noise: >-
    Note that P∞ is always below R. A filter is always sharper than a single
    reading, because it is combining many of them.
  frac-bar: >-
    The same precision-weighted combination as in scalar fusion, written as one
    quantity rather than two, because the prior here is the filter's own past.
why: >-
  This is the whole tuning trade-off in one line. The solution scales with **√(QR)** for small Q, so quadrupling Q only doubles the steady-state spread — but it halves the filter's memory. The knob is not "accuracy versus inaccuracy". It is **smoothing versus responsiveness**, and the right setting depends entirely on how fast the thing you are tracking can actually change.
```

The cost of getting it wrong in the smooth direction is specific and measurable. Give a constant-velocity filter a target that accelerates at a steady $a$. The filter has no acceleration in its model, so it settles into a **constant lag** of roughly $a\tau^2$, where $\tau$ is the filter's effective memory. The estimate is not noisy; it is systematically behind, by an amount that grows with the square of how much you smoothed.

That is why "the filter is lagging, so I should trust the model more" is exactly backwards. Lag comes from trusting the model too much already.

## Choosing Q from the system, not from the plot

There is a better starting point than trial and error. From [[process-and-measurement-noise]], a constant-velocity $Q$ is a fixed pattern of powers of $\Delta t$ scaled by $\sigma_a^2$ — the variance of the acceleration the model does not know about. So ask a question about the world:

> How hard can this thing accelerate between samples?

A walking person, about 1 m/s². A road vehicle, 3. A quadrotor avoiding something, 10. That number is usually known within a factor of two, and a factor of two in $\sigma_a$ is a factor of $\sqrt{2}$ in the steady-state spread. Starting there and adjusting is a far shorter path than starting from a blank matrix.

Then confirm it with the residuals rather than by eye — [[filter-consistency-and-divergence]] gives the test, and it is the only feedback available on a quantity nobody can measure.

## Initialisation

Two objects to supply: $\hat{x}_0$ and $P_0$. The second matters more than people expect.

Recall $K = P/(P+R)$ in the scalar case. That single expression settles the whole question:

- **$P_0$ enormous.** First gain is nearly 1. The filter discards its initial guess and lands essentially on the first measurement. A bad $\hat{x}_0$ is erased in one step.
- **$P_0$ small.** First gain is nearly 0. The filter believes its guess and barely responds to measurements that contradict it — while $P$ continues shrinking on schedule, because [[conditioning-a-joint-gaussian]] showed that the covariance never looks at the data.

So the asymmetry is stark: **a wildly uncertain wrong guess is harmless; a slightly wrong confident guess is how filters diverge before they have started.** When unsure, be uncertain.

That said, do not reach for $10^{12}I$. The first update then subtracts numbers twelve orders of magnitude apart, which in double precision destroys most of the available digits and can return a $P$ that is not even symmetric. The better move is to build the initial state out of the data:

- **Position states**: take them from the first measurement. Set the corresponding block of $P_0$ to $R$ — exactly the uncertainty of one reading, which is precisely what you have.
- **Rate states**: two-point differencing. Use the first two measurements, $\hat{v} = (z_1 - z_0)/\Delta t$, with variance $2R/\Delta t^2$ — the factor of 2 because two noisy readings went into it.
- **Bias and other slow states**: from calibration if you have it, with a covariance reflecting how much you trust the calibration.

This is often called *two-point initialisation*, and it converges faster than any guess plus a large covariance, because it starts the filter inside the region where its linearisation and its numbers both behave.

## Failure modes

- **Tuning $Q$ and $R$ together.** Half the search is in a direction that cannot affect the estimate.
- **Tuning by eye on one dataset.** A filter tuned to look smooth on a quiet recording will lag badly on the first manoeuvre. Tune against the residual statistics, and always on data containing the hard case.
- **Over-confident initialisation.** The failure that happens before the first second of data.
- **$P_0$ astronomically large.** Conditioning, as above.
- **Forgetting that $R$ can change.** GPS reports a per-fix covariance that varies by an order of magnitude with satellite geometry. Using a constant $R$ throws that away.
- **Tuning a filter whose model is wrong.** No ratio fixes a missing state. The residual tests tell the difference, and they are the next page.

:::check
Multiply both Q and R by 100. What changes in the filter's output?
:::

:::check
A constant-velocity filter is tracking a target that starts to accelerate steadily. What does the estimate do, and why is tightening Q the wrong instinct?
:::

:::check
Why is a very large P₀ with a bad initial guess safe, while a small P₀ with the same guess is not?
:::

:::check
Why not simply set P₀ to an enormous number like 10¹² times the identity?
:::
