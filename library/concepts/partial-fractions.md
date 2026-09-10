---
id: partial-fractions
title: Partial Fractions
summary: Any rational function can be broken into pieces that are each a logarithm or an arctangent — the work is algebra, not calculus.
tags: [integration, techniques, algebra]
difficulty: 3
est_minutes: 45
prereqs: [u-substitution]
related: [improper-integrals]
checks:
  - q: What must be true about the degrees before you can decompose, and what do you do if it isn't?
    a: The numerator's degree must be strictly less than the denominator's. If not, do polynomial long division first; the quotient integrates trivially and the proper remainder gets decomposed.
  - q: What term does a repeated linear factor (x−a)³ contribute to the decomposition, and why isn't one term enough?
    a: Three terms - A/(x−a) + B/(x−a)² + C/(x−a)³. One term has one degree of freedom, but matching a numerator of degree 2 over that denominator needs three, so a single term cannot represent every such function.
  - q: An irreducible quadratic factor x²+bx+c gets a numerator of what form, and what two integrals does it produce?
    a: A linear numerator Ax+B. Splitting it gives a logarithm (from the part matching the derivative of the quadratic) plus an arctangent (from the leftover constant, after completing the square).
  - q: Why is every partial-fractions problem guaranteed to be integrable in elementary terms?
    a: Every real polynomial factors into linear and irreducible quadratic factors, and each resulting piece integrates to a power, a logarithm, or an arctangent. So the method always terminates — unusually for integration, success is guaranteed in advance.
---

# Partial Fractions

$$
\int \frac{3x+11}{x^2 - x - 6}\,dx
$$

No substitution helps — the numerator is not the derivative of the denominator. But the fraction can be *taken apart*:

$$
\frac{3x+11}{(x-3)(x+2)} = \frac{4}{x-3} - \frac{1}{x+2}
$$

and each piece is a logarithm. That is the entire method: **reverse the process of adding fractions over a common denominator.** The calculus is trivial; the algebra is the work.

## The procedure

**Step 0 — check the degrees.** The numerator must have degree strictly less than the denominator. If not, do polynomial long division first:

$$
\frac{x^3}{x^2-1} = x + \frac{x}{x^2-1}
$$

The polynomial part integrates on sight; decompose the proper remainder. Skipping this step produces an inconsistent linear system, which is a confusing way to discover the mistake.

**Step 1 — factor the denominator completely** over the reals, into linear factors and irreducible quadratics.

**Step 2 — write one term per factor**, by this table:

| Factor in denominator | Contributes |
|---|---|
| $(x-a)$ | $\dfrac{A}{x-a}$ |
| $(x-a)^k$ | $\dfrac{A_1}{x-a} + \dfrac{A_2}{(x-a)^2} + \cdots + \dfrac{A_k}{(x-a)^k}$ |
| $x^2+bx+c$ irreducible | $\dfrac{Ax+B}{x^2+bx+c}$ |
| $(x^2+bx+c)^k$ | one such term per power, up to $k$ |

Two rules govern the whole table: **repeated factors get every power up to the multiplicity**, and **quadratic factors get linear numerators**. A repeated factor needs all the lower powers because one term supplies one degree of freedom, and you need as many as the numerator's degree allows.

**Step 3 — solve for the constants.** Multiply through by the denominator, then either substitute the roots (fastest for distinct linear factors — each root kills all but one term) or expand and match coefficients (necessary when quadratics are involved).

## The two integrals it always reduces to

Every piece is one of:

$$
\int\frac{A\,dx}{(x-a)^k} = \begin{cases} A\ln|x-a| & k=1\\[4pt] \dfrac{A}{(1-k)(x-a)^{k-1}} & k>1\end{cases}
$$

and, for a quadratic piece, **split the numerator in two**:

$$
\int\frac{Ax+B}{x^2+1}dx = \frac{A}{2}\int\frac{2x\,dx}{x^2+1} + B\int\frac{dx}{x^2+1} = \frac{A}{2}\ln(x^2+1) + B\arctan x + C
$$

The first part is arranged to match the derivative of the denominator — a [[u-substitution]]. The second is the arctangent. For a general quadratic, complete the square first to reach $u^2+a^2$.

**Logs from linear factors, arctangents from quadratic ones.** If your answer has no arctangent but the denominator had an irreducible quadratic, you dropped something.

## Why it always works

Two facts combine into a guarantee. Every real polynomial factors into linear and irreducible quadratic factors (the fundamental theorem of algebra, over $\mathbb{R}$), and every resulting piece integrates to a power, log, or arctangent.

So **every rational function has an elementary antiderivative.** This is rare and worth appreciating: contrast $\int e^{-x^2}dx$, which provably does not. For rational functions there is no searching and no cleverness — only bookkeeping. When a problem *is* a rational function, you already know you will win.

## Where it turns up

Beyond integration exercises: solving separable differential equations with logistic-type right-hand sides, inverting Laplace transforms, and — closer to this course — summing telescoping series, where decomposing $\frac{1}{n(n+1)}$ into $\frac{1}{n}-\frac{1}{n+1}$ is exactly this method. See [[infinite-series-and-convergence]].

:::check
What must be true about the degrees before you can decompose, and what do you do if it isn't?
:::

:::check
What term does a repeated linear factor $(x-a)^3$ contribute to the decomposition, and why isn't one term enough?
:::

:::check
An irreducible quadratic factor $x^2+bx+c$ gets a numerator of what form, and what two integrals does it produce?
:::

:::check
Why is every partial-fractions problem guaranteed to be integrable in elementary terms?
:::
