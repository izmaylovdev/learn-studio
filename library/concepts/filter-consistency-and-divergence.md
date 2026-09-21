---
id: filter-consistency-and-divergence
title: Filter Consistency and Divergence
field: Filters in Practice
summary: How to tell a working filter from a confidently wrong one using only its own residuals — and the feedback loop that makes a wrong filter get worse instead of settling.
tags: [kalman, diagnostics, tuning]
difficulty: 4
est_minutes: 50
prereqs: [tuning-and-initialising-a-filter, observability-and-what-a-filter-can-know]
related: [the-kalman-gain, the-kalman-filter-loop, the-normal-distribution]
sources:
  - title: Bar-Shalom, Li & Kirubarajan, Estimation with Applications to Tracking and Navigation — §5.4
    url: https://onlinelibrary.wiley.com/doi/book/10.1002/0471221279
  - title: Simon, Optimal State Estimation — Ch. 10
    url: https://academic.csuohio.edu/simond/estimation/
checks:
  - q: >-
      Without access to the truth, what can you check, and what makes it checkable?
    a: >-
      The innovations. The filter does not merely produce them — it predicts their distribution in advance, saying each should be zero-mean with covariance S. That turns every measurement into a falsifiable prediction the filter made about itself, and the residuals can be compared against it with no external reference. Nothing else in a running filter has that property: the state estimate and P are both unfalsifiable from the inside.
  - q: >-
      The time-averaged normalised innovation squared comes out at 6 for a scalar sensor. What does that mean and what are the candidate causes?
    a: >-
      It should average 1 for a scalar measurement, so surprises are about six times larger than the filter expected — the filter is over-confident by roughly a factor of six in variance. The causes are a Q that is too small, an R that is too small, or a model that is structurally wrong. Checking whether the innovations are also autocorrelated separates them: white but too large points at the noise covariances, patterned points at the model.
  - q: >-
      Why should the innovations be white, and what does it mean when they are not?
    a: >-
      Because each innovation is by construction the part of the measurement that could not be predicted from everything before it. If consecutive innovations correlate, then one of them could have been partly predicted from its predecessor, so the filter left information on the table — which only happens when the model is unable to represent what is going on. Autocorrelation is therefore a structural diagnosis, most often a missing state, and no amount of retuning Q or R will remove it.
  - q: >-
      Describe the divergence feedback loop, and say why it accelerates rather than settling.
    a: >-
      A too-small P produces a small gain, so measurements barely correct the estimate and the true error grows. But P is computed from F, H, Q and R alone and never sees that error, so it keeps shrinking on schedule — which makes the next gain smaller still. Less correction means more error, which means a smaller P, which means even less correction. It is positive feedback with no term anywhere in the loop that responds to how badly the filter is actually doing, which is why it runs away instead of reaching an equilibrium.
---

# Filter Consistency and Divergence

Your filter reports a position with a standard deviation of 30 cm. Is it right?

You cannot answer by looking at $P$, because $P$ is where the claim came from. And you cannot answer by comparing against the truth, because if the truth were available you would not have built a filter.

This looks like a dead end, and it is not, because of one property of the innovation that is easy to walk past. The filter does not only produce $y_k$ — it **predicts its distribution in advance**. It says, before the measurement arrives, that the surprise will be zero-mean with covariance $S_k$.

That is a falsifiable prediction the filter makes about itself, and checking it needs nothing external.

## The normalised innovation

Divide each innovation by the spread the filter claimed for it, in the multi-dimensional sense of [[gaussian-random-vectors]]:

```formula
title: The normalised innovation squared
tex: 'y_k^\top S_k^{-1} y_k \;\sim\; \chi^2_m'
symbols: [y-innov, k-step, transpose, S-innov-cov, sim-dist, chi-sq]
reading: The innovation, measured in units of the spread the filter predicted for it, has a chi-squared distribution with as many degrees of freedom as the measurement has components.
steps:
  - The innovation is the surprise, in the sensor's own units — metres, degrees, volts.
  - Sandwiching it around S inverse converts it into a squared distance measured in standard deviations, which is unitless.
  - If the filter's claim about S was right, that quantity is a sum of m squared standard normals.
  - A chi-squared with m degrees of freedom has mean m — so the running average of this statistic should sit at m, and that is the whole test.
notes:
  chi-sq: >-
    Its mean equals its degrees of freedom, which is what makes this usable
    without a table. For a scalar sensor you are checking whether a running
    average sits near 1.
  S-innov-cov: >-
    The filter's own prediction about how surprised it would be. Everything
    here is testing that number, not the estimate.
  sim-dist: >-
    An assertion that holds only if every assumption holds — linear model,
    correct F and H, correct Q and R, Gaussian white noise. That is why a
    failure is informative: something in that list is false.
  y-innov: >-
    The only quantity in a running filter that touches reality. The estimate and
    the covariance are both beliefs; this is a comparison.
why: >-
  This turns a running filter into something **testable from the inside**. Average the statistic over a few hundred steps: come out near m and the filter's confidence is earned; come out far above and it is over-confident, which is the dangerous direction; far below and it is wasting information, which is merely inefficient. It is the only honest feedback available on Q — a quantity that, by construction, can never be measured directly.
```

In simulation, where the truth is available, the stronger version is the **normalised estimation error squared**, $(x - \hat{x})^\top P^{-1}(x - \hat{x})$, which should average the number of *states*. Run it over many Monte Carlo repetitions before trusting a filter in the field. The innovation test is what you have afterwards.

## Reading the diagnosis

Two independent questions, four answers:

| Average NIS | Innovations | Diagnosis |
|---|---|---|
| ≈ m | white | The filter is consistent. Its covariance means what it says. |
| ≫ m | white | Over-confident. $Q$ too small, or $R$ too small. Fixable by tuning. |
| ≪ m | white | Under-confident. $Q$ or $R$ too large. Safe, but the estimate is noisier than it needs to be. |
| anything | **patterned** | The model is wrong. No tuning will fix this. |

The last row is the one that earns the table. Whiteness is a separate test from magnitude, and it diagnoses something tuning cannot reach.

The reasoning is short. The innovation is *by construction* the part of the measurement that could not be predicted from everything before it. If consecutive innovations correlate, then part of one was predictable from its predecessor — so the filter left information unused, which can only happen when its model is incapable of representing what is happening. A missing acceleration state shows up as innovations that drift positive through every turn. A sensor bias shows up as a non-zero mean. Neither is a noise-covariance problem, and turning $Q$ up merely widens the bounds until the failure stops triggering the test.

In practice: plot the innovations, plot their autocorrelation, and plot the running NIS against its bounds. Three plots, and between them they name the fault.

## Divergence

Now the failure these tests exist to catch.

Suppose $Q$ is too small. Then:

1. $P$ is smaller than the true error warrants.
2. The gain $K = PH^\top S^{-1}$ is correspondingly small.
3. Measurements barely move the estimate, so the true error grows.
4. But $P$ is computed from $F, H, Q, R$ alone — and, as [[conditioning-a-joint-gaussian]] showed, never consults the data. So it keeps shrinking on schedule.
5. Which makes the next gain smaller still. Return to step 3.

There is no term anywhere in that loop that responds to how badly the filter is actually doing. It is positive feedback, so it does not settle at a worse-but-stable operating point — it runs away. The estimate walks off, the covariance goes to zero, and the filter reports millimetre precision about a position it lost ten minutes ago.

Two things make this much worse than it sounds. **Gating** — the outlier rejection from [[the-kalman-filter-loop]] — starts discarding every measurement that could rescue the filter, because from where it now believes itself to be, they all look impossible. And **unobservable states** from [[observability-and-what-a-filter-can-know]] have zero gain by construction, so they are in a permanently diverged condition from the first step.

## What to do about it

- **Never let $Q$ be zero.** The cheapest insurance in the subject.
- **Floor the covariance.** Clamp $P$'s diagonal at a minimum below which you refuse to be confident. Crude, effective, and it breaks the loop at step 1.
- **Fading memory.** Multiply $P$ by $\alpha^2$ with $\alpha$ slightly above 1 at each prediction — say 1.01. This deliberately discounts old information at a fixed rate, guaranteeing the filter always keeps listening. It costs a little precision and buys robustness to exactly the failure above.
- **Adaptive $Q$.** Monitor the NIS and inflate $Q$ when it runs high. Powerful and easy to make unstable — the estimator is now tuning itself from its own residuals, and that loop needs its own damping.
- **Gate, and count.** Reject implausible measurements, but count consecutive rejections and reinitialise after a run of them. A gate without a counter converts a recoverable fault into a permanent one.
- **Watch the eigenvalues of $P$.** One eigenvalue climbing while the others settle means an unobservable or nearly unobservable direction, which is a modelling fault and not a tuning one.

## Failure modes

- **Trusting $P$ as a performance measure.** It is what the model implies, and it is right only if the model is.
- **Testing magnitude but not whiteness.** Half the diagnostic power, and the missing half is the one that finds structural faults.
- **Averaging NIS over too short a window.** Chi-squared is heavy-tailed; a handful of samples tells you very little. Hundreds.
- **Tuning until the test passes.** Inflating $Q$ until the NIS looks acceptable hides a wrong model behind an honest-looking covariance. If the innovations are still patterned, the filter is still wrong.
- **Running the consistency check only offline.** It costs a few multiplications per step. Ship it.

:::check
Without access to the truth, what can you check, and what makes it checkable?
:::

:::check
The time-averaged normalised innovation squared comes out at 6 for a scalar sensor. What does that mean and what are the candidate causes?
:::

:::check
Why should the innovations be white, and what does it mean when they are not?
:::

:::check
Describe the divergence feedback loop, and say why it accelerates rather than settling.
:::
