---
id: joint-distributions-and-covariance
title: Joint Distributions and Covariance
field: Random Variables
summary: How two random variables move together — and why zero covariance is much weaker than independence.
tags: [probability, random-variables]
difficulty: 4
est_minutes: 45
prereqs: [variance-and-standard-deviation, independence]
related: [expectation, central-limit-theorem]
sources:
  - title: Blitzstein & Hwang, Introduction to Probability — Ch. 7
    url: https://projects.iq.harvard.edu/stat110/home
checks:
  - q: Why do the marginal distributions not determine the joint distribution?
    a: The marginals say how each variable behaves alone, and say nothing about how they pair up. Two variables that are independent and two that are perfectly correlated can have identical marginals and completely different joints.
  - q: Give two variables with zero covariance that are not independent.
    a: Let X be uniform on [−1,1] and Y = X². Cov(X,Y) = E[X³] − E[X]E[X²] = 0 by symmetry, yet Y is a deterministic function of X. Covariance only detects linear association.
  - q: Why is correlation preferred to covariance for reporting?
    a: Covariance is in the product of the two variables' units, so its size is uninterpretable. Dividing by both standard deviations gives a unitless number bounded in [−1,1], where the magnitude means something.
---

# Joint Distributions and Covariance

One variable at a time is not enough. Almost every interesting question — does this predict that, does averaging help, is this portfolio risky — is about how two variables move together.

## The joint distribution carries information the marginals do not

The **joint** distribution gives $P(X = x, Y = y)$, or a joint density $f(x,y)$. From it you recover each variable alone by summing or integrating the other out:

$$
f_X(x) = \int f(x,y)\,dy
$$

These are the **marginals**, and the direction is one-way. Given the joint you can always get the marginals; **given the marginals you cannot recover the joint**.

Two fair coins provides the sharpest example. Let $X$ be the first flip. Compare $Y = $ the second flip, and $Y = X$. Both $Y$s are fair coins with identical marginals. The joints could not be more different — one pair is independent, the other is perfectly determined. Everything about the relationship lives in the joint and nowhere else.

## Covariance

```formula
title: Covariance
tex: '\operatorname{Cov}(X,Y) = E[XY] - E[X]\,E[Y]'
symbols: [cov-op, rv-X, rv-Y, equals, expect-E, minus]
reading: The covariance is the mean of the product minus the product of the means.
steps:
  - Start from the definition — the average of (X − μₓ)(Y − μᵧ).
  - That product is positive when both variables sit on the same side of their means, negative when they are on opposite sides.
  - Expanding with linearity collapses it to the mean of the product minus the product of the means.
  - If the two are independent those two quantities are equal, and the covariance is zero.
notes:
  minus: The same shape as the variance formula, and for the same reason. Cov(X,X) *is* Var(X) — variance is the special case where the two variables coincide.
  expect-E: E[XY] factors into E[X]E[Y] exactly when X and Y are independent. That factoring is what the whole quantity is testing for.
  cov-op: In the product of the two units. Metres times kilograms is not interpretable, which is why the correlation exists.
why: >-
  Covariance measures **linear** co-movement and nothing else. That is its power — it is the cross term in Var(X+Y) = Var(X) + Var(Y) + 2Cov(X,Y), so it is exactly what independence has to kill for variances to add — and its limitation: **zero covariance does not mean independent**, only that no straight line describes the relationship.
```

## The direction that fails

Independent $\Rightarrow$ covariance zero. **The converse is false**, and the counterexample is worth remembering rather than reconstructing.

Let $X$ be uniform on $[-1, 1]$ and $Y = X^2$. Then

$$
\operatorname{Cov}(X, Y) = E[X^3] - E[X]E[X^2] = 0 - 0 \cdot E[X^2] = 0
$$

Zero covariance. And yet $Y$ is a deterministic function of $X$ — knowing $X$ tells you $Y$ exactly. The dependence is perfect and entirely non-linear, so covariance is blind to it.

This is why "uncorrelated" and "independent" are different words. The one exception: for **jointly normal** variables they do coincide, which is a special property of that family and not a general fact. Assuming it elsewhere is a real modelling error.

## Correlation

$$
\rho = \frac{\operatorname{Cov}(X,Y)}{\sigma_X \sigma_Y} \in [-1, 1]
$$

Dividing by both standard deviations cancels the units and bounds the result. Now the magnitude means something: $\pm 1$ exactly when $Y$ is an affine function of $X$, and 0 for no linear relationship.

Two warnings that are not clichés:

- **Correlation is not causation** — and worse, it is not even *association*, as the $X, X^2$ example shows. A reported $\rho$ near zero does not license "these are unrelated".
- **Correlation is not slope.** A steep relationship with lots of scatter can have low $\rho$; a shallow, tight one can have high $\rho$. It measures tightness, not strength.

## Why this drives the limit theorems

$$
\operatorname{Var}(X + Y) = \operatorname{Var}(X) + \operatorname{Var}(Y) + 2\operatorname{Cov}(X,Y)
$$

Independence sets the cross term to zero, variances add, and averaging $n$ of them gives $\sigma^2/n$ — a standard deviation of $\sigma/\sqrt{n}$. **That $\sqrt{n}$ is the payoff for the whole chapter**, and it is why both the [[law-of-large-numbers]] and the [[central-limit-theorem]] insist on independence.

When the cross terms do not vanish, averaging helps far less than $\sqrt{n}$ suggests. Correlated observations carry less information than their count implies — which is exactly why sampling the same neighbourhood twice is not the same as sampling two neighbourhoods.

Covariance is not only a nuisance term, though. Stacked into a matrix it becomes the object a state estimator carries around, and there the off-diagonal entries are what let a measurement of one quantity correct another that was never observed — see [[gaussian-random-vectors]] and [[covariance-propagation]].

:::check
Why do the marginal distributions not determine the joint distribution?
:::

:::check
Give two variables with zero covariance that are not independent.
:::

:::check
Why is correlation preferred to covariance for reporting?
:::
