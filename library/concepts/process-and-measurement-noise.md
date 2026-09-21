---
id: process-and-measurement-noise
title: Process and Measurement Noise
field: State-Space Models
summary: R you can measure, Q you have to admit to — and why a diagonal Q is wrong for almost every model anyone actually writes.
tags: [estimation, modelling, kalman, tuning]
difficulty: 4
est_minutes: 50
prereqs: [linear-gaussian-state-space-models]
related: [covariance-propagation, tuning-and-initialising-a-filter, variance-and-standard-deviation]
sources:
  - title: Bar-Shalom, Li & Kirubarajan, Estimation with Applications to Tracking and Navigation — §6.2
    url: https://onlinelibrary.wiley.com/doi/book/10.1002/0471221279
  - title: Simon, Optimal State Estimation — Ch. 8
    url: https://academic.csuohio.edu/simond/estimation/
checks:
  - q: >-
      R can usually be measured directly and Q cannot. Why not?
    a: >-
      R is the spread of a sensor about a known truth, so you can hold the sensor still, record a few thousand readings and take their sample covariance. Q is the covariance of the difference between your model and reality — and you would need the true state at every step to observe it. Since knowing the true state is the whole problem, Q is never measured. It is chosen, as a budget for how wrong F is, and then checked through the filter's own residuals.
  - q: >-
      Why is a diagonal Q wrong for a constant-velocity model?
    a: >-
      Because the thing Q is standing in for — an unmodelled acceleration — moves position and velocity together. One acceleration a over one step adds ½aΔt² to position and aΔt to velocity, so those two errors are perfectly correlated, not independent. The correct Q therefore has an off-diagonal entry of order Δt³. A diagonal Q asserts that position can be disturbed without velocity being disturbed, which corresponds to no physical disturbance at all.
  - q: >-
      What happens to a filter when Q is set to zero, and why does it get worse rather than staying wrong?
    a: >-
      With Q zero, prediction adds no uncertainty, so P shrinks monotonically towards zero. The gain shrinks with it, so each new measurement moves the estimate less than the last. Eventually the filter is effectively deaf — it ignores the sensor entirely and coasts on a model that was never exact. The error grows while the reported covariance keeps falling, which is the definition of divergence and the reason it accelerates instead of settling.
  - q: >-
      How does Q scale with the time step, and why does that matter for a filter running at a variable rate?
    a: >-
      For an unmodelled acceleration the entries scale as Δt⁴, Δt³ and Δt² across the block — not linearly, and not identically. So a Q tuned at 100 Hz is wrong by orders of magnitude at 10 Hz, and merely reusing it after a dropped sample injects the wrong amount of uncertainty. Both F and Q have to be rebuilt from the actual elapsed time, which is why production filters carry Δt as an argument rather than a constant.
---

# Process and Measurement Noise

Two matrices, and almost everyone gets one of them wrong.

$R$ is the easy one. It describes a sensor, sensors exist, and you can characterise one in an afternoon: bolt it down so the truth is constant, log a few thousand readings, take the sample covariance. Do this even when the datasheet quotes a number — datasheet figures are typically best-case, at one temperature, over one bandwidth, and the real device is worse.

$Q$ is not like that at all, and the first useful step is to notice **why you cannot measure it**.

## Why Q is unmeasurable in principle

$Q$ is the covariance of $w$, and $w$ is defined by $w_k = x_k - Fx_{k-1}$: the amount by which reality departed from your model over one step. To sample it you would need $x_k$ and $x_{k-1}$ — the true state, twice.

If you had the true state, you would not be building a filter.

So $Q$ is never observed. It is **declared**: a statement of how much you are willing to admit your model is wrong. That makes it a modelling parameter rather than a measurement, which is why tuning a filter is mostly tuning $Q$, and why the diagnostics in [[filter-consistency-and-divergence]] exist — they are the only feedback available on a quantity that cannot be observed directly.

## Where Q gets its shape

The temptation is to write $Q = \operatorname{diag}(q_1, q_2)$ and turn the knobs. It is wrong, and the reason is physical rather than mathematical.

Ask what $Q$ is standing in for in a constant-velocity model. The answer is an **acceleration you did not model** — a gust, a bump, a foot on the pedal. Suppose over one step there is a constant unknown acceleration $a$. Then in that step it adds

$$
\tfrac{1}{2} a\,\Delta t^2 \ \text{ to position} \qquad\text{and}\qquad a\,\Delta t \ \text{ to velocity}
$$

Those are not two separate disturbances. They are **one** disturbance seen in two components, and they are perfectly correlated: if position was pushed forward, velocity was pushed up, every time. Writing the error as $w = (\tfrac{1}{2}\Delta t^2,\ \Delta t)^\top a$ and applying the sandwich from [[covariance-propagation]] gives the covariance directly.

```formula
title: Process noise from an unmodelled acceleration
tex: 'Q \;=\; \begin{bmatrix} \Delta t^4/4 & \Delta t^3/2 \\ \Delta t^3/2 & \Delta t^2 \end{bmatrix}\,\sigma_a^2'
symbols: [Q-proc-noise, equals, delta-change, t-var, sigma-sd]
reading: The process noise covariance for a constant-velocity model is a fixed pattern of powers of the time step, scaled by how hard the unknown acceleration can push.
steps:
  - One unknown acceleration disturbs both components at once — half a t squared of position, a t of velocity.
  - Collect those two coefficients into a column and sandwich the acceleration's variance between it and its transpose.
  - The top-left is the position coefficient squared, the bottom-right the velocity coefficient squared.
  - The off-diagonals are the product of the two coefficients. They are non-zero because there was only ever one disturbance.
  - Everything is scaled by a single number — how violently the world is allowed to accelerate your model.
notes:
  Q-proc-noise: >-
    Rank one, not full rank. There is only one underlying disturbance here, so
    the matrix has one non-zero eigenvalue — and that is correct, not a defect.
  delta-change: >-
    Marks an elapsed interval rather than an instant. Δt appears to the fourth,
    third and second power across the three distinct entries — nothing about Q
    scales linearly with the step.
  sigma-sd: >-
    The only real knob. Everything else in the matrix is fixed by the model's
    structure, which is why tuning a filter is a one-parameter problem far more
    often than it looks.
  t-var: >-
    The clock, and the only thing in this matrix that changes at run time. A
    filter with a variable sample rate rebuilds Q from it on every step.
why: >-
  This is the concrete form of a general principle: **Q inherits its structure from the physics you left out, not from the states you kept.** The off-diagonal term is the whole point. A diagonal Q would claim that position can be disturbed while velocity is not, which corresponds to no physical event whatsoever — it would mean the object teleported. Getting the shape right matters more than getting σ_a right, because the shape is what determines *which combinations* of state the filter stays willing to correct.
```

The competing derivation treats the acceleration as continuous white noise rather than piecewise constant, and gives $\Delta t^3/3$ in the top-left instead of $\Delta t^4/4$. The difference is smaller than the uncertainty in $\sigma_a$ and does not matter. The presence of the off-diagonal term does.

## Reading Q as a time constant

There is a more intuitive handle on $\sigma_a$ than "the variance of the unmodelled acceleration", and it is the one to use when tuning.

$Q$ sets how fast the filter forgets. A large $Q$ means the prediction is barely trusted, so the estimate follows recent measurements and discards older ones quickly; a small $Q$ means a long memory and heavy smoothing. So pick $\sigma_a$ by answering a question about the *system*: how hard can this thing actually accelerate between samples? A pedestrian, 1 m/s². A car, 3. A quadrotor dodging, 10. That number is usually knowable within a factor of two, which is far better than starting from a blank matrix.

## R, and the ways it is not what the datasheet says

$R$ is measurable, which does not make it easy.

- **White is an assumption, not a property.** A sensor with an internal low-pass filter produces readings whose errors are heavily correlated from one to the next. The filter treats each as fresh evidence and becomes over-confident — the same double-counting as in [[fusing-gaussian-estimates]], arriving through the back door.
- **Quantisation is not Gaussian.** A sensor resolving to 1 cm has a uniform error of variance $(0.01)^2/12$, and near the truth its error is not random at all.
- **A bias is not noise.** If the mean is not zero, no value of $R$ fixes it. Put the bias in the state.
- **$R$ often depends on conditions.** GPS accuracy depends on satellite geometry, and good receivers report a per-fix covariance. Use it: $R$ is allowed to change every step.

The asymmetry with $Q$ is worth keeping in mind. When a filter misbehaves, the instinct is to adjust $R$, because $R$ feels like the empirical quantity. But $R$ is the one you can check independently — so a filter that is wrong despite a measured $R$ is telling you about $Q$, or about the model.

## Failure modes

- **$Q = 0$.** The classic. $P$ falls monotonically, the gain follows it to zero, the filter stops listening and the error grows unchecked. This is divergence, and it is why $Q$ exists.
- **Diagonal $Q$.** Physically incoherent for any model with a rate in it, as above.
- **$Q$ not rebuilt when $\Delta t$ changes.** The entries scale as $\Delta t^4$, $\Delta t^3$, $\Delta t^2$ — a constant $Q$ is wrong the moment the sample rate wobbles.
- **Tuning both $Q$ and $R$.** Only their ratio affects the estimate; scaling both changes nothing but the reported confidence. Measure $R$, fix it, and tune $Q$ alone. [[tuning-and-initialising-a-filter]] makes this precise.
- **Units.** Every entry of $Q$ carries the units of the corresponding pair of states. Mixing metres and centimetres inside one state vector produces a $Q$ that cannot be reasoned about at all.

:::check
R can usually be measured directly and Q cannot. Why not?
:::

:::check
Why is a diagonal Q wrong for a constant-velocity model?
:::

:::check
What happens to a filter when Q is set to zero, and why does it get worse rather than staying wrong?
:::

:::check
How does Q scale with the time step, and why does that matter for a filter running at a variable rate?
:::
