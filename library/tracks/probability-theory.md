---
id: probability-theory
title: Probability Theory
goal: Read a probability formula you have never seen and say what each symbol is doing — then decide whether the model behind it actually applies to the situation in front of you.
tags: [probability, mathematics]
stages:
  - title: What probability is attached to
    goal: Fix the sample space before computing anything, because most paradoxes are manufactured upstream of the arithmetic.
    concepts: [sample-spaces-and-events, probability-axioms, counting-and-combinatorics]
  - title: Conditioning
    goal: Handle information correctly — which direction the bar points, and what independence does and does not buy.
    concepts: [conditional-probability, independence, law-of-total-probability, bayes-theorem]
  - title: Random variables
    goal: Attach numbers to outcomes so they can be averaged, and learn which operations need independence and which do not.
    concepts: [random-variables-and-distributions, expectation, variance-and-standard-deviation, joint-distributions-and-covariance]
  - title: The distributions worth knowing cold
    goal: Recognise the three that cover most of practice, and know the assumptions each one is quietly making.
    concepts: [bernoulli-and-binomial, poisson-and-rare-events, the-normal-distribution]
  - title: Why any of it converges
    goal: Understand what averaging buys you, how fast, and where the guarantees stop.
    concepts: [law-of-large-numbers, central-limit-theorem]
---

# Probability Theory

Probability is unusual among mathematical subjects in that the formulas are short and the mistakes are conceptual. Almost nothing here is computationally hard. What goes wrong is upstream — the wrong sample space, the bar pointing the wrong way, an independence assumption nobody checked.

So this track is organised around **what each formula assumes**, not around how to evaluate it.

## What you should be able to do at the end

- Write down $\Omega$ for a problem and justify why its outcomes are equally likely, or admit that they are not.
- Compute $P(A \mid B)$ from $P(B \mid A)$ without being told to, and say out loud why the two differ.
- Explain the medical-test result to someone who does not believe it.
- Decide whether a real dataset could plausibly be binomial, Poisson, or normal — and name the specific assumption you would check first.
- Say why quadrupling your sample size only halves your error.

## Checkpoints

**After stage 1.** Do the birthday problem from scratch, including why the complement is the right move. Then do the two-children problem and explain in one sentence why the answer is 1/3 rather than 1/2.

**After stage 2.** Reproduce the medical-test table in whole people, without fractions, and state the base rate at which the test becomes more useful than useless. Then find a news article quoting a conditional probability and decide which direction its bar points.

**After stage 3.** Prove $\operatorname{Var}(X+Y) = \operatorname{Var}(X)+\operatorname{Var}(Y)+2\operatorname{Cov}(X,Y)$ and say exactly where independence enters. Construct two uncorrelated dependent variables from memory.

**After stage 4.** Take a real count dataset, compute its mean and variance, and decide whether Poisson is defensible. If the variance is much larger, say what that implies about the process.

**After stage 5.** Simulate the central limit theorem for a badly skewed distribution and see how large $n$ has to get. Then try it for a Cauchy and watch it fail to converge at all — that failure teaches more than the successes.

## What this track deliberately skips

- **Measure theory.** σ-algebras, measurability, and the construction of Lebesgue integration. They matter for a rigorous treatment and change none of the answers here.
- **Statistical inference.** Estimators, hypothesis tests, p-values, regression. This track builds the probability those need, and stops there.
- **Markov chains and stochastic processes.** The natural sequel, and a substantial subject of its own.
- **Moment generating functions**, beyond one mention in the CLT proof sketch. A clean tool, but it obscures more than it reveals on first contact.
- **The full catalogue of distributions.** Geometric, negative binomial, gamma, beta. Three understood properly beats twelve half-recognised.

## What it assumes

Integration, at the level of the [[riemann-sums-and-the-definite-integral]] definition, is genuinely needed from stage 3 onward — a density is a thing you integrate, and expectation is a weighted integral. [[improper-integrals]] matter because every density integrates over an infinite range.

The connection is not decorative. The normal distribution is the reason $\int e^{-x^2}dx$ is worth caring about, and the Poisson normalises because of the exponential series from [[taylor-and-maclaurin-series]]. If you have done Calculus 2, those links will pay off; if not, stages 1 and 2 are entirely self-contained.
