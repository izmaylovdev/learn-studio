---
id: linear-gaussian-state-space-models
title: Linear-Gaussian State-Space Models
field: State-Space Models
summary: The four matrices you have to write down before any filter can run — and why choosing the state is the one decision no amount of tuning can repair.
tags: [estimation, modelling, kalman]
difficulty: 3
est_minutes: 50
prereqs: [covariance-propagation]
related: [gaussian-random-vectors, process-and-measurement-noise, observability-and-what-a-filter-can-know]
sources:
  - title: Welch & Bishop, An Introduction to the Kalman Filter
    url: https://www.cs.unc.edu/~welch/kalman/kalmanIntro.html
  - title: Simon, Optimal State Estimation — Ch. 5
    url: https://academic.csuohio.edu/simond/estimation/
checks:
  - q: >-
      What is the test for whether your chosen state vector is big enough?
    a: >-
      The Markov test — given the state now, does the past add anything to your prediction of the future? If knowing where the object was a second ago would improve the forecast, the state is missing something, usually a rate. Position alone fails for anything moving; position and velocity passes for constant-velocity motion; a manoeuvring target needs acceleration too, or a Q large enough to admit that it does not have it.
  - q: >-
      Why is H generally not square, and why is it never inverted?
    a: >-
      Because you measure fewer things than you estimate — a two-component state observed by one range sensor gives a 1×2 H. It is never inverted because the filter never asks which state produced this reading, a question with infinitely many answers. It asks the forward question — given this state, what would the sensor have read. That direction is always well defined, and it is what makes estimating unmeasured components possible at all.
  - q: >-
      A sensor has a slow, unknown bias. Why is putting the bias in the state better than enlarging R?
    a: >-
      Because a bias is not noise. Enlarging R tells the filter the readings are noisy but still centred on the truth, so it averages them and converges to a wrong answer with a confident covariance. Putting the bias in the state as an extra component with near-zero process noise lets the filter estimate and subtract it, which is the only way to remove a systematic error. It costs one state and requires the bias to be observable, usually through a second sensor or through motion.
  - q: >-
      What does each zero in F assert, and what is the consequence of one being wrong?
    a: >-
      A zero in row i, column j asserts that state j has no direct effect on state i over one step. The zero in the bottom-left of the constant-velocity F says position does not affect velocity — true on a straight road, false for anything on a curve or a spring. When such a claim is wrong the prediction is systematically off in a way no gain can repair, the innovations acquire a pattern instead of looking like noise, and the covariance, which knows nothing about the error, keeps shrinking anyway.
---

# Linear-Gaussian State-Space Models

The common mental model is that a Kalman filter smooths noisy sensor data. It is a reasonable guess and it leads in exactly the wrong direction, because a smoother needs no model and this thing is nothing but model.

What the filter actually does is run a **simulation of your system** and let measurements nudge it. Its output is mostly the simulation. When the simulation is wrong — when the thing accelerates and your model says it cannot — the filter does not notice, because nothing inside it compares the model against reality. It reports a confident answer that happens to be wrong.

So the four matrices below are not configuration. They are the content.

## The two equations

```formula
title: The linear-Gaussian state-space model
tex: 'x_k = F x_{k-1} + B u_k + w_k, \qquad z_k = H x_k + v_k'
symbols: [x-state, k-step, equals, F-transition, plus, B-control, u-control, w-proc-noise, z-meas, H-observation, v-meas-noise]
reading: The state at each step is the previous state pushed through the physics, plus whatever you deliberately did, plus a random disturbance — and each measurement is a linear view of the current state, plus sensor noise.
steps:
  - Read the first equation as a simulator. Given where the system was, F says where it goes if nothing interferes.
  - Bu is what you did on purpose. It is known exactly, so it shifts the prediction without adding any doubt.
  - w is everything else — the gust, the bump, the physics you left out. Never known, only budgeted for through its covariance Q.
  - The second equation is the sensor. H says what a perfect instrument would read if the state were exactly x.
  - v is the sensor's own error, with covariance R. No measurement ever sees the state directly.
notes:
  F-transition: >-
    The physics, discretised. Every entry is a claim, and every zero is the
    claim that one component does not affect another over one step.
  H-observation: >-
    Usually not square and never inverted. It points from state space to
    measurement space, which is the only direction that is well defined.
  w-proc-noise: >-
    The honesty term — the difference between "F is the physics" and "F is my
    best guess at the physics". Pretending it is zero is the most common way to
    break a filter.
  k-step: >-
    Everything here is discrete. There is no continuous time anywhere in the
    filter, only a sequence of steps spaced Δt apart, and Δt is buried inside F.
  z-meas: >-
    The only quantity in the whole system that comes from outside. Everything
    else is either a belief or a modelling decision.
why: >-
  These two lines say something strong enough to be worth resisting — **the future depends on the past only through the present state**. That is the Markov assumption, and it is what makes recursive estimation possible at all: the filter can discard every measurement it has ever seen and keep only x̂ and P, because by assumption those two objects hold everything the history had to say. Choosing a state large enough to make that true is the modelling problem, and no amount of tuning substitutes for getting it right.
```

## Choosing the state is the whole job

There is a test, and it is the sentence above turned into a question:

> Given the state now, would knowing the past improve my prediction of the future?

If yes, the state is too small.

Track a car with a state of position alone. Knowing it was at 90 m a second ago and is at 100 m now clearly improves the forecast over knowing only that it is at 100 m. The test fails, so position alone is not a state. Add velocity and it passes — for a car going straight at constant speed. Put the car into a bend and it fails again, because the *rate of turn* is now something the past reveals and the state does not hold.

This is why filters have more states than the quantity you care about. You do not estimate velocity because you want velocity; you estimate it because without it the Markov property is false and every equation downstream is invalid.

The escape hatch is $Q$. A state that is slightly too small can be rescued by admitting the error as process noise, which is what [[process-and-measurement-noise]] is for. A state that is badly too small cannot be, and the symptom is unmistakable once you know to look: the innovations stop being noise and start being a pattern.

## Three models worth being able to write from memory

**Constant velocity.** State $(p, v)$, step $\Delta t$:

$$
F = \begin{bmatrix} 1 & \Delta t \\ 0 & 1 \end{bmatrix}, \qquad H = \begin{bmatrix} 1 & 0 \end{bmatrix}
$$

$H$ is $1 \times 2$: one sensor, two states. Reading it aloud — "the measurement is one times position plus zero times velocity" — is exactly right, and is why the filter can still estimate velocity, through the correlation that [[covariance-propagation]] builds.

**Random walk.** A thermometer in a room. State is temperature, $F = 1$, $H = 1$. The entire model says "it is roughly what it was", and everything interesting lives in $Q$: how fast can the room actually change?

**Constant velocity with a sensor bias.** State $(p, v, b)$, and the sensor reads position plus its own bias:

$$
F = \begin{bmatrix} 1 & \Delta t & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 1 \end{bmatrix}, \qquad H = \begin{bmatrix} 1 & 0 & 1 \end{bmatrix}
$$

This third one is the move that separates people who have shipped a filter from people who have read about one. A slowly drifting offset is not noise — it does not average away — so inflating $R$ cannot help. Promoting it to a state with almost no process noise lets the filter estimate it and subtract it. The price is that $b$ must be observable: with only this one sensor it is not, because $p$ and $b$ appear only as a sum. [[observability-and-what-a-filter-can-know]] is where that gets diagnosed.

## What the model is quietly claiming

Six assumptions, each of which fails somewhere real:

| Assumption | Fails when |
|---|---|
| $F$ and $H$ are linear | range, bearing, anything with a rotation in it |
| the state is Markov | a state component was left out |
| noise is additive | the error scales with the signal, as in multiplicative sensor gain |
| noise is zero-mean | the sensor has a bias — put it in the state |
| noise is white | vibration, quantisation, a sensor that filters internally |
| $w$ and $v$ are independent of each other and of $x$ | an accelerometer whose noise grows with acceleration |

The filter is optimal when all six hold. When they do not, it still runs, still produces numbers, and still reports a covariance — which is why the diagnostics in [[filter-consistency-and-divergence]] are not optional extras.

## Failure modes

- **A state that is too small.** The signature is innovations with structure — drift, or a sign that persists for many steps.
- **A state that is too large.** Adding components "just in case" costs observability, and an unobservable state's covariance grows without bound until the arithmetic suffers.
- **Angles.** A heading state near $\pi$ wraps to $-\pi$, and the innovation becomes enormous. Every angular filter needs explicit wrapping in the innovation, and $\pm\pi$ is where untested filters go wrong.
- **Variable $\Delta t$.** $F$ and $Q$ both contain it, so a sample arriving late must rebuild both. Filters that assume a fixed rate drift whenever the scheduler slips.
- **Mismatched rates.** Measurements at 1 Hz with prediction at 100 Hz is fine and normal — predict every tick, update only when a measurement exists. Filters that require one measurement per step are doing it wrong.

:::check
What is the test for whether your chosen state vector is big enough?
:::

:::check
Why is H generally not square, and why is it never inverted?
:::

:::check
A sensor has a slow, unknown bias. Why is putting the bias in the state better than enlarging R?
:::

:::check
What does each zero in F assert, and what is the consequence of one being wrong?
:::
