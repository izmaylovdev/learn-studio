---
id: calculus-2
title: Calculus 2
goal: Evaluate any integral that can be evaluated, decide whether any series converges, and represent functions as power series with a stated error bound.
tags: [mathematics, calculus, integration, series]
stages:
  - title: What an integral actually is
    goal: Replace "integration is antidifferentiation" with the definition everything else is built on.
    concepts: [riemann-sums-and-the-definite-integral, fundamental-theorem-of-calculus, u-substitution]
  - title: Techniques of integration
    goal: Build the toolkit, and learn to recognize which tool a problem is asking for before starting.
    concepts: [integration-by-parts, trigonometric-integrals, trigonometric-substitution, partial-fractions, improper-integrals]
  - title: Applications — slicing
    goal: Turn geometry and physics problems into integrals by identifying what one slice contributes.
    concepts: [area-between-curves, volumes-of-revolution, arc-length-and-surface-area, work-and-physical-applications]
  - title: Sequences and series
    goal: Decide whether an infinite sum is finite, using the right test rather than every test.
    concepts: [sequences-and-their-limits, infinite-series-and-convergence, integral-and-comparison-tests, alternating-series-and-absolute-convergence, ratio-and-root-tests]
  - title: Power series
    goal: Represent functions as infinite polynomials, and bound the error when you truncate.
    concepts: [power-series-and-radius-of-convergence, taylor-and-maclaurin-series, taylor-remainder-and-error-bounds]
  - title: Parametric and polar
    goal: Describe curves that are not graphs of functions, and do calculus on them.
    concepts: [parametric-curves-and-calculus, polar-coordinates-and-area]
---

# Calculus 2

A full single-variable second course: integration techniques, applications, infinite series, and power series. Roughly 16 hours of material across 22 concepts.

The course has two halves that look unrelated and aren't. The first half asks *can I evaluate this integral*. The second asks *is this infinite sum finite*. [[improper-integrals]] is the hinge — it introduces convergence as a question about integrals, and the integral test then carries the same question straight into series.

## How to work through it

Stage 1 is not review. Most people arrive believing an integral is an antiderivative, and that belief quietly breaks stage 3, where every application requires slicing something and adding it up. Spend the time there.

In stage 2, resist the urge to start computing. Nearly every lost mark in techniques of integration comes from picking the wrong method, not from executing it badly — so practice *classifying* problems separately from solving them. Same in stage 4: given twenty series, say which test you would use for each and why, before evaluating a single one.

Answer the `:::check` questions out loud before revealing them. Recall is what moves a concept from *learning* to *mastered*; re-reading feels productive and isn't.

## Checkpoints

**After stage 2** — take twenty mixed integrals and, without solving any of them, write down the method each one needs and the feature that told you. Then solve the five you were least sure about. Misclassification is the failure mode this drills.

**After stage 3** — pick one solid and compute its volume by *both* washers and shells. Getting the same number two ways is the strongest evidence that you're slicing rather than pattern-matching formulas.

**After stage 4** — build your own decision tree for convergence tests from memory, then test it against a list of twenty series. Anywhere your tree gives no answer or the wrong one is exactly what to review.

**After stage 5** — compute $\int_0^1 e^{-x^2}dx$ to four decimal places using a Taylor series, and *prove* your answer is accurate to four places using an error bound. This integral has no elementary antiderivative, so it closes the loop the course opened.

**After stage 6** — find the arc length of one arch of a cycloid and the area of one petal of $r=\cos 3\theta$. Both punish careless limits, which is the point.

## What this track deliberately skips

Differential equations beyond separable ones, multivariable calculus, vectors and vector-valued functions, Fourier series, and formal $\varepsilon$–$N$ proofs of convergence. Each is a track of its own. This one is single-variable integration and series, and stops there.

## Prerequisites

Differentiation — the chain, product, and quotient rules — and limits including L'Hôpital's rule. If those are shaky, the first half of this track will feel like memorization, because [[u-substitution]] and [[integration-by-parts]] are just the chain and product rules read backwards.
