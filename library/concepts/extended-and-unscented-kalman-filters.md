---
id: extended-and-unscented-kalman-filters
title: Extended and Unscented Kalman Filters
field: Filters in Practice
summary: What to do when the model bends — linearise the function, or sample it — and why the first option's failures are Taylor remainders wearing a disguise.
tags: [kalman, nonlinear, estimation]
difficulty: 5
est_minutes: 55
prereqs: [the-kalman-filter-loop]
related: [taylor-and-maclaurin-series, taylor-remainder-and-error-bounds, covariance-propagation, filter-consistency-and-divergence]
sources:
  - title: Julier & Uhlmann, Unscented Filtering and Nonlinear Estimation (2004)
    url: https://ieeexplore.ieee.org/document/1271397
  - title: Simon, Optimal State Estimation — Ch. 13-14
    url: https://academic.csuohio.edu/simond/estimation/
checks:
  - q: >-
      Push a Gaussian through a nonlinear function. Name the two things that break, beyond the output not being Gaussian.
    a: >-
      The mean moves and the spread is distorted. E[h(x)] is not h(E[x]) whenever h has curvature — for a convex h the mean of the output sits above the function of the mean, by roughly half the second derivative times the variance. And the covariance is no longer AΣAᵀ for any A, because no single linear map describes what the curve did. Both errors grow with the covariance, so an uncertain filter is distorted far more than a confident one.
  - q: >-
      In an EKF, where do you use the nonlinear function and where do you use its Jacobian?
    a: >-
      Use the nonlinear functions f and h to propagate the mean and to predict the measurement — they are exact and free. Use the Jacobians only to propagate the covariance and to compute the gain, which are the operations that genuinely need a linear map. Predicting the measurement with H x̂ instead of h(x̂) is a common bug that throws away accuracy for nothing.
  - q: >-
      Why is the EKF's error a Taylor remainder, and what does that predict about when it fails?
    a: >-
      Because linearising is truncating the Taylor expansion of f or h after the first-order term, so the discarded part is exactly the remainder — roughly the second derivative times the squared displacement from the linearisation point. The displacement is of order the filter's own uncertainty, so the error scales with curvature times covariance. It predicts that an EKF fails when the function is sharply curved on the scale of the current uncertainty: confident filters on gentle curves are fine, uncertain filters on sharp ones are not, and a large P is therefore doubly dangerous.
  - q: >-
      What does the UKF do differently, and what does it cost?
    a: >-
      It never linearises. It chooses 2n+1 deterministic sigma points whose sample mean and covariance match the current belief, pushes each one through the true nonlinear function, and reconstructs the mean and covariance from the transformed points. That captures the true mean and covariance to second order — third for a Gaussian — against the EKF's first, and it needs no derivatives at all, so it works on functions that are not differentiable or whose Jacobians are error-prone. It costs 2n+1 function evaluations per step instead of one plus a Jacobian.
---

# Extended and Unscented Kalman Filters

A radar gives you range. Range is

$$
h(x) = \sqrt{p_x^2 + p_y^2}
$$

and no amount of rearranging will turn that into a matrix times the state. The filter's entire derivation assumed it could.

So what actually breaks? Worth guessing before reading on, because the obvious answer — "the posterior is no longer Gaussian" — is true, is the least of the problems, and is not what causes filters to fail in the field.

## What a curve does to a Gaussian

Take a Gaussian in $x$ and push it through a bend. Three things happen.

**The distribution stops being Gaussian.** Expected, and survivable — the filter only ever carries two moments anyway.

**The mean moves.** $E[h(x)] \neq h(E[x])$. For a function with curvature, the average of the outputs is not the output of the average; to second order the gap is $\tfrac{1}{2}h''\sigma^2$. This is [Jensen's inequality](https://en.wikipedia.org/wiki/Jensen%27s_inequality) with a name, and it is a *bias*, not noise — it does not average away over time, it accumulates.

**The covariance is not $A\Sigma A^\top$ for any $A$**, because no single linear map describes what the curve did to the spread.

Notice that all three worsen as the covariance grows. A confident filter on a gentle curve barely notices. An uncertain filter on a sharp one is being told a story. **The nonlinearity that matters is not the function's curvature but its curvature measured over the width of your current belief** — which means the same filter can be perfectly well behaved after convergence and badly wrong during initialisation.

## The EKF: pretend it is linear, locally

The obvious move is the one that works most of the time. At each step, replace $f$ and $h$ by their best linear approximations *at the current estimate* — and their best linear approximation is the first-order Taylor expansion from [[taylor-and-maclaurin-series]], with the derivative generalised to a matrix of partials.

```formula
title: The EKF Jacobian
tex: 'F_k \;=\; \frac{\partial f}{\partial x}\Big(\hat{x}_{k-1 \mid k-1}\Big)'
symbols: [F-transition, k-step, equals, frac-bar, partial-d, f-fn, x-state, hat-est, given]
reading: The transition matrix is the grid of partial derivatives of the nonlinear dynamics, evaluated at the current best estimate.
steps:
  - f is the true nonlinear dynamics — the thing that actually moves the state.
  - Its partial derivatives form a matrix — row i, column j is how much output i responds to input j.
  - Evaluate that matrix at the current estimate, which is the only point where the approximation is guaranteed to be any good.
  - Use it wherever the linear filter used F to move a covariance. Never use it to move the state.
notes:
  frac-bar: >-
    Not a division. It is the derivative notation, and the "fraction" is a
    matrix of partials — a Jacobian, one row per output, one column per input.
  partial-d: >-
    Partial, because f has several inputs. Each entry holds the others fixed,
    which is exactly the decomposition a linear approximation needs.
  hat-est: >-
    The linearisation point, and it changes every step. F is no longer a
    property of the system — it is a property of the current estimate, which is
    why an EKF can destabilise in a way a linear filter cannot.
  f-fn: >-
    Keep using it for the mean. The Jacobian is only for the covariance; using
    it to propagate the state throws away accuracy for nothing.
why: >-
  The EKF is one line of Taylor series applied twice per step, and every one of its failure modes is a **truncation error**. The discarded term is of order f″ times the squared displacement from the linearisation point, and the displacement is of order the filter's own uncertainty — so the error is roughly **curvature × covariance**. That single expression predicts almost everything about EKF behaviour: sharp curves are bad, large P is bad, and the two multiply. The remainder analysis in [[taylor-remainder-and-error-bounds]] is the honest way to bound it.
```

The loop is otherwise unchanged: predict with $\hat{x} = f(\hat{x})$, propagate with $P = F_kPF_k^\top + Q$, predict the measurement with $h(\hat{x})$, and use $H_k = \partial h/\partial x$ for $S$ and $K$.

That split is the rule to remember. **Nonlinear functions for the means, Jacobians for the covariances.** The means can be propagated exactly and for free; only the covariance operations actually require a matrix.

### Why the EKF is genuinely worse

- **It is no longer optimal**, not even among linear estimators. Every guarantee the last four pages established is gone; what remains is a heuristic that usually works.
- **It is biased.** The mean shift above is systematic and accumulates.
- **It can destabilise.** $F_k$ depends on $\hat{x}$, so a bad estimate produces a bad linearisation, which produces a worse estimate. That is another positive feedback loop, on top of the divergence loop from [[filter-consistency-and-divergence]], and the two compound.
- **Jacobians are a bug farm.** Hand-derived partials of a rotation or a projection are where sign errors and frame confusions live. Check them numerically against finite differences; the five minutes pays for itself.
- **Some functions have no useful Jacobian.** A lookup table, a threshold, a simulator you cannot differentiate.

## The UKF: sample the function instead

Julier and Uhlmann's observation is one sentence long and hard to forget: *it is easier to approximate a distribution than an arbitrary nonlinear function.*

So do not linearise. Instead:

1. Choose $2n+1$ **sigma points** — deterministic, not random — whose sample mean and covariance are exactly $\hat{x}$ and $P$. The standard set is the mean itself plus the columns of $\pm\sqrt{(n+\lambda)P}$, from a Cholesky factor.
2. Push every one of them through the **true** nonlinear function.
3. Take the weighted mean and covariance of the transformed points.

That is the whole idea. No derivatives anywhere.

| | EKF | UKF |
|---|---|---|
| Approximates | the function | the distribution |
| Mean accurate to | 1st order | 2nd order (3rd for Gaussians) |
| Covariance accurate to | 1st order | 2nd order |
| Needs derivatives | yes | no |
| Cost per step | 1 evaluation + Jacobian | $2n+1$ evaluations |
| Handles discontinuities | no | tolerably |

For a filter with a handful of states, $2n+1$ evaluations is nothing and the UKF is usually the better default — it is more accurate, it needs no derivation, and it cannot have a sign error in a Jacobian because it has no Jacobian. The EKF keeps its place where the functions are nearly linear, where the state is large enough for $2n+1$ propagations to hurt, or where the code has been flying for twenty years.

Both approximate the same thing and both are fragile in the same circumstance: a posterior that is genuinely **multi-modal** — two plausible positions rather than one uncertain one — is not describable by a mean and a covariance at all. Neither filter can represent it, and both will report something halfway between the two possibilities, which is the one answer that is certainly wrong. That is where particle filters begin, and where this track stops.

## Failure modes

- **Linearising far from the estimate.** The Jacobian is only trustworthy near where it was evaluated. Large innovations mean the correction lands outside that neighbourhood.
- **Propagating the mean with the Jacobian.** Use $f$ and $h$. Free accuracy, commonly discarded.
- **Wrong Jacobians.** Check numerically. Always.
- **Angles again.** Innovations and sigma-point means both need wrapping for angular states, and an unwrapped mean of headings near $\pm\pi$ is meaningless.
- **Cholesky failure in the UKF.** The sigma points need a factorisation of $P$, which fails the moment $P$ loses positive-definiteness — so the Joseph form and re-symmetrisation matter more here, not less.
- **Reaching for a UKF when the real problem is the model.** Neither filter fixes a missing state, and the innovation tests say which problem you have.

:::check
Push a Gaussian through a nonlinear function. Name the two things that break, beyond the output not being Gaussian.
:::

:::check
In an EKF, where do you use the nonlinear function and where do you use its Jacobian?
:::

:::check
Why is the EKF's error a Taylor remainder, and what does that predict about when it fails?
:::

:::check
What does the UKF do differently, and what does it cost?
:::
