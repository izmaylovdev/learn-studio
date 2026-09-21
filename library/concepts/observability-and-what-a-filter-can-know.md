---
id: observability-and-what-a-filter-can-know
title: Observability and What a Filter Can Know
field: State-Space Models
summary: A test you can run on F and H before writing any code, that tells you which of your states the sensors could never determine — and what a filter does instead of telling you.
tags: [estimation, modelling, kalman, linear-algebra]
difficulty: 4
est_minutes: 45
prereqs: [linear-gaussian-state-space-models, matrix-algebra-for-estimation]
related: [conditioning-a-joint-gaussian, filter-consistency-and-divergence]
sources:
  - title: Simon, Optimal State Estimation — §1.4
    url: https://academic.csuohio.edu/simond/estimation/
  - title: Kalman, A New Approach to Linear Filtering and Prediction Problems (1960)
    url: https://www.cs.unc.edu/~welch/kalman/media/pdf/Kalman1960.pdf
checks:
  - q: >-
      A filter estimates a position and a sensor bias, and the only sensor reads their sum. What does it report, and what is wrong with it?
    a: >-
      It reports confident values for both, and the sum of them is right while each individually is arbitrary. Nothing in the data distinguishes position 10 with bias 2 from position 11 with bias 1. The filter does not fail or complain — it settles wherever its initial guess and the arithmetic put it, and only the covariance shows the problem, by growing without bound along the direction where position and bias trade off against each other.
  - q: >-
      What is the observability matrix testing, in words?
    a: >-
      Whether any state leaves a trace in the measurements, now or later. H says what a state contributes immediately; HF says what it contributes after one step of dynamics; HF² after two. Stacking them and asking for full rank asks whether the only state producing zero from all of them is the zero state — that is, whether two different initial states could ever produce identical measurement sequences forever.
  - q: >-
      Why does a constant-velocity model observed only in position pass the test, and what does the mechanism have to do with covariance?
    a: >-
      Because H = [1 0] alone misses velocity, but HF = [1 Δt] does not — velocity shows up in the next position measurement. The stack has rank 2, so both states are observable. The mechanism is the same one from covariance propagation: stepping forward makes position depend on old velocity, which creates the position–velocity correlation, and correction flows to velocity along that correlation. Observability is the structural version of asking whether such a channel exists at all.
  - q: >-
      Why is passing the rank test not enough in practice?
    a: >-
      Rank is binary and floating point is not. A system can be technically observable while the observability matrix is nearly rank-deficient, which means some combination of states is observable only through an extremely weak channel. The filter then needs an impractical amount of data to pin that combination down, its covariance stays huge along that direction, and numerical error can push it to the wrong side. The useful question is the smallest singular value, not the rank.
---

# Observability and What a Filter Can Know

Here is a filter that runs perfectly and is completely wrong.

You are tracking a position with a rangefinder you suspect has a constant offset, so you follow the good advice from [[linear-gaussian-state-space-models]] and put the offset in the state: $x = (p, b)$, with the sensor reading $z = p + b$.

Run it. The filter converges. It reports $p = 10.3$ m and $b = 0.7$ m, with covariances that look reasonable at a glance.

Now notice that $p = 10.6$, $b = 0.4$ would have produced *exactly the same measurements*. So would $p = 9.0$, $b = 2.0$. There is nothing in the data — not in this reading, not in a million of them — that separates these. The filter is reporting two numbers when the world only ever told it one.

And it did not warn you. Filters do not have a way to say "this question has no answer". They have $P$, and that is where the news is hiding.

## The test

Observability asks: could two different initial states produce identical measurements forever? If yes, no estimator of any kind can tell them apart, and the problem is with the sensors, not the algorithm.

Turning that into something checkable takes one idea. A state affects the measurements not only now but later, because the dynamics carry it forward. Its immediate contribution is $H$. After one step it has been through $F$, so its contribution is $HF$. After two steps, $HF^2$. Stack all of them and ask whether anything can hide:

```formula
title: The observability rank condition
tex: '\operatorname{rank} \begin{bmatrix} H \\ HF \\ HF^2 \\ \vdots \\ HF^{n-1} \end{bmatrix} \;=\; n'
symbols: [rank-op, H-observation, F-transition, n-index, equals, ellipsis]
reading: Stack what the sensor sees now, after one step, after two steps, and so on; the system is observable exactly when that stack has as many independent rows as there are states.
steps:
  - The first row is what the sensor sees immediately. For a position-only sensor, that is position and nothing else.
  - The second row is what it sees after the dynamics have run once — which is how velocity becomes visible, through the position it produced.
  - Keep going up to n−1 steps. Beyond that nothing new appears, because a matrix satisfies its own characteristic polynomial.
  - Full rank means the only state invisible to every row is the zero state.
  - Anything short of full rank names a direction in state space that no measurement, ever, can distinguish from zero.
notes:
  rank-op: >-
    Rank, not size. The stack is always tall; what matters is how many of its
    rows carry genuinely new information rather than repeating earlier ones.
  H-observation: >-
    On its own it says only what is measured directly. If observability
    depended on H alone, no filter could ever estimate an unmeasured state.
  F-transition: >-
    The dynamics are what make unmeasured states visible. A state that affects
    nothing and is measured by nothing is invisible — and F is where "affects
    nothing" is written down.
  n-index: >-
    The number of state components. Adding a state raises this bar, which is
    why a state added "just in case" can make the whole system unobservable.
why: >-
  This is a test on the **model**, run before any data exists and before any code is written. That is unusual and valuable: it separates "my filter is badly tuned" from "the question I am asking has no answer", and those two have identical symptoms in a running system. The bias example above fails it — H = [1 1] and HF = [1 1] are the same row, so the stack has rank 1 against n = 2. The correct response is not to tune, but to **add a sensor or add motion**, because nothing else can help.
```

## Why the constant-velocity case passes

Take $H = \begin{bmatrix} 1 & 0\end{bmatrix}$ and the usual $F$. Then

$$
HF = \begin{bmatrix} 1 & \Delta t \end{bmatrix}
$$

and the stack $\begin{bmatrix} 1 & 0 \\ 1 & \Delta t\end{bmatrix}$ has rank 2 whenever $\Delta t \ne 0$. Velocity is observable — not because any sensor measures it, but because it shows up in the *next* position.

That is the same mechanism as in [[covariance-propagation]], seen structurally rather than statistically. There, stepping forward created a position–velocity correlation, and correction flowed along it. Here, stepping forward puts velocity into the second row of the stack. Observability is the yes/no version of "is there a channel"; the covariance is the quantitative version of "how wide is it".

## What an unobservable filter actually does

It does not crash, and this is the part worth internalising.

Along the unobservable directions the gain is zero — [[conditioning-a-joint-gaussian]] showed that correction flows only through cross-covariance, and here there is none. So those combinations of state are never corrected. Each prediction adds $Q$, nothing takes it away, and the covariance grows without bound along that subspace.

Three consequences follow:

- The estimate along that direction is a **random walk from your initial guess**. It will drift, slowly, forever.
- $P$ grows until its condition number ruins the arithmetic, at which point the *observable* parts start to degrade too. Unobservability is not contained.
- Any summary statistic that averages over directions — a trace, an RMS error — will look bad without saying why.

The useful diagnostic is to watch the eigenvalues of $P$ rather than its diagonal. One eigenvalue climbing steadily while the others settle is the signature, and its eigenvector names exactly which combination of states is not determined.

## Rank is not the real question

Rank is a yes/no answer about exact arithmetic, and nothing in a filter is exact.

Consider the bias problem again, but with a second sensor that sees position with a very slightly different geometry. Now the stack has full rank — technically observable. In practice the second row is nearly a copy of the first, the smallest singular value of the stack is $10^{-6}$, and pinning down the bias would take an impossible amount of data. The filter behaves almost exactly like the unobservable one.

So the practical test is the **smallest singular value** of the observability matrix, or equivalently of the observability Gramian, relative to the largest. Treat it as a conditioning number: a ratio of $10^{6}$ means six digits of your precision go into separating states that barely differ, and single-precision arithmetic has seven.

## How unobservability gets fixed

None of these are tuning:

- **Add a sensor** that sees a different combination. Two rangefinders at different offsets separate $p$ from $b$ immediately.
- **Add motion.** Bearing-only tracking from a stationary observer cannot determine range; the same sensor on a moving platform can, because the geometry changes and the stack fills out. This is why bearing-only trackers manoeuvre deliberately.
- **Remove the state.** If a bias cannot be separated, estimating the sum is honest and estimating both is not.
- **Anchor it.** Give the unobservable combination a weak prior — a tiny process noise and an initial covariance — so it stays put rather than walking. This does not make it observable; it makes it harmless.

## Failure modes

- **Adding states defensively.** Every extra state raises the rank required. The third state added "in case it helps" is the one that quietly breaks observability.
- **Testing only at one $\Delta t$.** Observability can depend on the sample interval — a system observed at exactly the period of its own oscillation can be unobservable at that rate and fine at another.
- **Reading a small $P$ as success.** $P$ is model-derived and shrinks on schedule. In the unobservable directions it grows on schedule too, and that growth is the only warning you get.
- **Confusing it with controllability.** They are dual and different questions. Observability asks what the sensors can determine; controllability asks what the inputs can reach.

:::check
A filter estimates a position and a sensor bias, and the only sensor reads their sum. What does it report, and what is wrong with it?
:::

:::check
What is the observability matrix testing, in words?
:::

:::check
Why does a constant-velocity model observed only in position pass the test, and what does the mechanism have to do with covariance?
:::

:::check
Why is passing the rank test not enough in practice?
:::
