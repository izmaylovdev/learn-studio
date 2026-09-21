---
id: kalman-filtering
title: The Kalman Filter
goal: Model a real system as a linear-Gaussian state-space problem, implement the filter from scratch, tune Q and R against measured data, and diagnose it from its own residuals when it drifts away from the truth.
tags: [estimation, control, probability, engineering]
stages:
  - title: Uncertainty with more than one number
    goal: A single variance cannot say that your position estimate is sharp along the road and vague across it. Learn to carry a covariance matrix and to push it through a linear map.
    concepts: [matrix-algebra-for-estimation, gaussian-random-vectors, covariance-propagation]
  - title: Combining two beliefs
    goal: The whole filter is one operation applied twice per second — take two Gaussian opinions about the same quantity and produce the single Gaussian that accounts for both.
    concepts: [fusing-gaussian-estimates, conditioning-a-joint-gaussian]
  - title: The model the filter assumes
    goal: Write your problem as F, H, Q, R. Nearly every filter that fails in the field fails here, before a single equation runs.
    concepts: [linear-gaussian-state-space-models, process-and-measurement-noise, observability-and-what-a-filter-can-know]
  - title: The filter itself
    goal: Derive the five equations, and be able to say what each one is doing without reciting it.
    concepts: [the-predict-step, the-kalman-gain, the-kalman-filter-loop]
  - title: Making it work on real data
    goal: Turn a correct derivation into a filter that survives contact with a sensor — tuned, initialised, monitored, and extended when the model stops being linear.
    concepts: [tuning-and-initialising-a-filter, filter-consistency-and-divergence, extended-and-unscented-kalman-filters]
---

# The Kalman Filter

Most introductions present the Kalman filter as five equations to memorise. Memorising them is a week's work and teaches nothing, because the equations are not the hard part — every one of them is a matrix multiply. The hard part is that the filter only works when the model you fed it is roughly true, and the standard failure is a filter that runs happily for hours while confidently reporting a position it has drifted away from.

So this track is organised around **what the filter believes** rather than around what it computes. The estimate is a probability distribution, not a number. Its covariance is the filter's own claim about how wrong it is. And the Kalman gain — the one term everyone remembers — is nothing more than the answer to "which of my two sources do I trust more right now", computed fresh at every step.

## What you should be able to do at the end

- Take a physical system, choose a state vector, and write down $F$, $H$, $Q$ and $R$ — then say which of those four choices you are least sure about.
- Derive the gain from scratch, either by minimising the posterior variance or by conditioning a joint Gaussian, and get the same answer both ways.
- Implement the loop in fifty lines, including the Joseph-form covariance update, and explain why the short form is the one that goes non-symmetric at 3 a.m.
- Look at a filter's innovation sequence and say whether the filter is consistent, over-confident, or lying.
- Decide whether a nonlinear problem needs an EKF, a UKF, or a change of state variables that makes it linear again.

## Checkpoints

**After stage 1.** Take a 2×2 covariance and draw its one-sigma ellipse by hand from the eigenvectors. Then push a random vector through $y = Ax$ for a non-square $A$ and verify $\operatorname{Cov}(y) = A\Sigma A^\top$ numerically against a simulation.

**After stage 2.** Fuse two scalar measurements of the same quantity and confirm the result is *sharper than either input* — then explain in one sentence why that is not true when the two measurements share a noise source.

**After stage 3.** Model something real: a thermometer in a room, a phone's altimeter, a robot on a straight track. Write the four matrices. Then write down, in prose, the physical assumption each zero in $F$ encodes.

**After stage 4.** Implement the filter for your stage-3 model and run it on simulated data where you know the truth. Plot the error against the filter's own $\pm\sigma$ band. If the error leaves the band far more than a third of the time, you have a bug or a bad $Q$ — find out which.

**After stage 5.** Break your own filter deliberately. Shrink $Q$ until it diverges, and catch the divergence from the innovations *before* looking at the truth. That is the skill the job actually requires.

## What this track deliberately skips

- **Continuous-time filtering.** The Kalman–Bucy filter, matrix Riccati differential equations, and stochastic differential equations. Everything here is discrete-time, which is what runs on hardware.
- **Optimal smoothing.** The Rauch–Tung–Striebel backward pass is a short addition once the forward filter is understood, but it answers a different question — what happened — rather than what is happening now.
- **Particle filters and the general nonlinear case.** The right tool when the posterior is genuinely multi-modal. This track gets as far as the EKF and UKF and says honestly where they stop.
- **Square-root and UD-factored implementations.** The numerically serious way to ship a filter on a 16-bit target. Stage 5 says why they exist; implementing one is a separate exercise.
- **System identification.** Learning $F$ and $Q$ from data rather than from physics. The track treats the model as something you write down and then tune.
- **Control.** LQG, the separation principle, and everything that uses the estimate to act. This track stops at the estimate.

## What it assumes

The probability half of [[probability-theory]] does most of the work here, and the debts are specific rather than decorative. [[the-normal-distribution]] is the only distribution in the whole subject — the filter is exactly optimal because Gaussians stay Gaussian under the two operations it performs. [[joint-distributions-and-covariance]] supplies the object the filter actually propagates. [[bayes-theorem]] is what the update step *is*, once you strip the matrices off.

The linear algebra is developed here rather than assumed, but only as far as estimation needs it: multiplication, transpose, inverse, symmetry and positive-definiteness. If you already know that material, read [[matrix-algebra-for-estimation]] for its notation and move on.

One genuine debt to calculus arrives late. [[taylor-and-maclaurin-series]] is the entire idea behind the extended filter — the EKF is a first-order Taylor expansion of a nonlinear model, and every one of its failure modes is a truncation error in disguise.
