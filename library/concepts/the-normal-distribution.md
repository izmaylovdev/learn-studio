---
id: the-normal-distribution
title: The Normal Distribution
field: Named Distributions
summary: Two parameters fix the whole shape — and its importance is not that data is normal, but that averages are, almost regardless of what they average.
tags: [probability, distributions]
difficulty: 4
est_minutes: 45
prereqs: [random-variables-and-distributions, variance-and-standard-deviation]
related: [central-limit-theorem, improper-integrals, u-substitution]
sources:
  - title: Blitzstein & Hwang, Introduction to Probability — Ch. 5
    url: https://projects.iq.harvard.edu/stat110/home
checks:
  - q: Why does the normal density have no elementary antiderivative, and what is done instead?
    a: Its integrand is e^(−x²) up to scaling, which provably has no elementary antiderivative. Probabilities are obtained by standardising to Z and reading tabulated or numerically computed values of Φ.
  - q: What does standardising do, and why does it work for any normal?
    a: Z = (X − μ)/σ shifts the mean to 0 and scales the standard deviation to 1. It works because a normal stays normal under affine transformation, so every normal question reduces to one about the standard normal.
  - q: Why is the normal important if real data is so often not normal?
    a: Because the central limit theorem makes sums and averages approximately normal whatever the underlying distribution, provided the variance is finite. The normality that matters is of the estimator, not of the data.
---

# The Normal Distribution

The bell curve. Two parameters — where it sits and how wide it is — determine everything else about it.

## The density

```formula
title: The normal density
tex: 'f(x) = \frac{1}{\sigma\sqrt{2\pi}}\,e^{-\frac{(x-\mu)^2}{2\sigma^2}}'
symbols: [density-f, x-var, equals, frac-bar, sigma-sd, radical, pi-const, e-const, minus, mu-mean]
reading: The density falls off as e to the minus the squared distance from the mean, measured in units of the standard deviation.
steps:
  - The heart of it is (x − μ)² — squared distance from the centre, so the curve is symmetric about μ.
  - Dividing by σ² measures that distance in standard deviations rather than raw units.
  - Putting it in a negative exponent makes the density decay, and decay very fast — squared in the exponent means the tails vanish quickly.
  - The fraction in front is only a normalising constant, chosen so the total area is exactly 1.
notes:
  mu-mean: Location. Changing it slides the curve without altering its shape at all.
  sigma-sd: Scale, and it appears twice — once setting the width in the exponent, once keeping the total area at 1 as the curve gets wider or narrower.
  e-const: The exponential decay is what makes the tails thin. Something six sigma out is not merely unlikely, it is unlikely by a factor of about a billion.
  radical: The √(2π) is not adjustable. It is exactly what makes the area 1, and computing it requires a polar-coordinates trick because the integral has no elementary antiderivative.
why: >-
  Everything except (x − μ)²/σ² is bookkeeping. The distribution is really just **"decay exponentially in the squared number of standard deviations from centre"** — and because the exponent is squared rather than linear, the tails are extraordinarily thin. That thinness is a genuine modelling risk: financial returns have fatter tails than normal, and assuming otherwise underprices rare disasters.
```

## Standardising

Any normal becomes the **standard** normal, $\mu = 0$ and $\sigma = 1$, under

$$
Z = \frac{X - \mu}{\sigma}
$$

This works because a normal remains normal under any affine transformation — a property most distributions do not have. So there is only ever **one** normal distribution to know, and every question about any other reduces to it.

The rules from [[variance-and-standard-deviation]] confirm the parameters: $E[Z] = 0$ and $\operatorname{Var}(Z) = \sigma^2/\sigma^2 = 1$.

| Within | Probability |
|---|---|
| $\mu \pm \sigma$ | 68% |
| $\mu \pm 2\sigma$ | 95% |
| $\mu \pm 3\sigma$ | 99.7% |

Worth memorising. Compare Chebyshev's guarantee of "at least 75%" within 2σ — the normal does far better, which is the price of assuming a shape.

## The integral you cannot do

$$
\int e^{-x^2}\,dx \quad \text{has no elementary antiderivative}
$$

This is not a gap in your technique; it is a theorem. No amount of substitution or parts will produce one — the same wall met in [[u-substitution]].

So normal probabilities are never computed by antidifferentiation. They come from tables or numerical routines for

$$
\Phi(z) = \int_{-\infty}^{z}\frac{1}{\sqrt{2\pi}}e^{-t^2/2}\,dt
$$

which is an improper integral of exactly the kind in [[improper-integrals]] — and the fact that it converges at all is the exponential decay doing its work.

The **definite** integral over the whole line can be done, by a trick: square it, read the result as a double integral over the plane, and switch to polar coordinates, where the extra $r$ from the area element makes it elementary. That is where $\sqrt{2\pi}$ comes from, and it is a rare case where the two-dimensional problem is easier than the one-dimensional one.

## Why it is everywhere

Not because data is normal. Heights are roughly normal; incomes, city sizes, and stock returns emphatically are not.

The reason is the [[central-limit-theorem]]: **sums and averages** of many independent contributions are approximately normal whatever they are averaging, provided the variance is finite. So the normality that matters is usually of the *estimator*, not of the data.

Two limits on that, both practical:

- **Finite variance is required.** Cauchy-distributed data has none, and averaging it never becomes normal — the average of $n$ Cauchy variables is Cauchy again, however large $n$ gets.
- **Tails converge slowest.** The approximation is good near the centre long before it is good four sigma out. Using it to price rare catastrophic events is exactly where it is least trustworthy.

:::check
Why does the normal density have no elementary antiderivative, and what is done instead?
:::

:::check
What does standardising do, and why does it work for any normal?
:::

:::check
Why is the normal important if real data is so often not normal?
:::
