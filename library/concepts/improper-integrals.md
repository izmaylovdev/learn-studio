---
id: improper-integrals
title: Improper Integrals
summary: Integrals over infinite intervals or across infinite discontinuities are defined by limits — and whether they converge is the same question series will ask.
tags: [integration, convergence, limits]
difficulty: 3
est_minutes: 45
prereqs: [fundamental-theorem-of-calculus]
related: [partial-fractions, integral-and-comparison-tests]
checks:
  - q: What are the two kinds of improper integral, and how is each one defined?
    a: "Type 1 - an infinite limit of integration, defined as lim_{t→∞} ∫ₐᵗ f. Type 2 - the integrand has an infinite discontinuity in or at the edge of the interval, defined as a one-sided limit approaching the bad point. Both replace the bad feature with a limit."
  - q: For which p does ∫₁^∞ x^{-p} dx converge, and for which does ∫₀¹ x^{-p} dx converge?
    a: The first converges for p > 1, the second for p < 1. Out at infinity the tail must decay fast enough; near zero the blow-up must be mild enough. p = 1 diverges in both cases — the logarithm sits exactly on the boundary.
  - q: Why must ∫_{−∞}^{∞} f be split into two independent limits rather than taken as lim_{t→∞} ∫_{−t}^{t}?
    a: The symmetric limit can be finite when the integral diverges — for f(x)=x it gives 0 by cancellation. Convergence must not depend on how the two ends approach infinity, so each half must converge on its own.
  - q: What does an improper integral have to do with infinite series?
    a: Both ask whether infinitely many contributions add to something finite, and the integral test makes the connection precise - a positive decreasing f has ∑f(n) and ∫f converging or diverging together.
---

# Improper Integrals

$\int_a^b f$ was defined for a **bounded** $f$ on a **bounded** interval. Break either condition and the definition doesn't apply. Improper integrals extend it, in the only reasonable way: replace the offending feature with a limit.

## Type 1 — infinite interval

```formula
title: Making an infinite interval finite again
tex: '\int_a^{\infty} f(x)\,dx = \lim_{t\to\infty}\int_a^{t} f(x)\,dx'
symbols: [integral, bound-a, infinity, f-fn, x-var, dx, equals, limit, t-var]
reading: The integral out to infinity is defined as the limit of the honest, finite integral up to t, as t runs away.
steps:
  - The left side is not yet defined. The Riemann integral was built for a bounded interval, and this one is not.
  - Replace infinity with a finite endpoint t. Now everything on the right is an ordinary definite integral.
  - Evaluate it as usual. The answer is a function of t.
  - Take the limit. If it exists and is finite the integral converges to it; otherwise it diverges.
notes:
  infinity: Not a number and not an endpoint. It cannot be substituted into an antiderivative — the limit is the only way to reach it.
  t-var: The whole device. Integrating to t is legal, so you do that first and only then ask what happens as t leaves.
  limit: This is where convergence is decided, not in the integration.
why: Both 1/x and 1/x² decay to zero, yet one encloses finite area and the other infinite. **Decaying to zero is not enough — the decay has to be fast enough.** That distinction is the whole subject here, and it returns unchanged when you get to infinite series.
```

If the limit exists and is finite, the integral **converges** to it; otherwise it **diverges**.

$$
\int_1^{\infty}\frac{dx}{x^2} = \lim_{t\to\infty}\left[-\frac{1}{x}\right]_1^t = \lim_{t\to\infty}\left(1 - \frac{1}{t}\right) = 1
$$

$$
\int_1^{\infty}\frac{dx}{x} = \lim_{t\to\infty}\big[\ln x\big]_1^t = \lim_{t\to\infty}\ln t = \infty
$$

Both integrands shrink to zero. One encloses finite area, the other infinite. **Decaying to zero is not enough — the decay has to be fast enough**, and that distinction is the whole subject of convergence, here and again in [[infinite-series-and-convergence]].

## Type 2 — infinite discontinuity

If $f$ blows up at an endpoint, take a one-sided limit toward it:

$$
\int_0^1\frac{dx}{\sqrt{x}} = \lim_{t\to 0^+}\int_t^1 x^{-1/2}dx = \lim_{t\to 0^+}\big(2 - 2\sqrt{t}\big) = 2
$$

Unbounded region, finite area. And if the blow-up is **interior** to the interval, you must split there:

$$
\int_{-1}^{1}\frac{dx}{x^2} = \int_{-1}^{0}\frac{dx}{x^2} + \int_{0}^{1}\frac{dx}{x^2}
$$

Both halves diverge, so the whole thing diverges. Applying the evaluation theorem blindly gives $-2$ — a negative answer for a positive integrand, which is the error [[fundamental-theorem-of-calculus]] warns about. **Always scan the interval for points where the integrand is undefined before you evaluate.**

## The p-integrals — the reference facts

$$
\int_1^{\infty}\frac{dx}{x^p}\ \text{converges} \iff p > 1 \qquad\qquad \int_0^1\frac{dx}{x^p}\ \text{converges} \iff p < 1
$$

The two conditions point opposite ways, and the reason is worth stating plainly:

- **Out at infinity**, a large $p$ means fast decay, so large $p$ is good.
- **Near zero**, a large $p$ means a violent blow-up, so small $p$ is good.

$p=1$ diverges in both cases. The logarithm is the exact boundary — it goes to infinity, just barely. Memorize these two; the comparison tests use them as the yardstick for everything else.

## Both ends infinite

$$
\int_{-\infty}^{\infty}f = \int_{-\infty}^{c}f + \int_{c}^{\infty}f
$$

for any convenient $c$, and **both halves must converge independently**. The tempting shortcut $\lim_{t\to\infty}\int_{-t}^{t}f$ is not the definition, and it gives wrong answers: for $f(x)=x$ it returns $0$ by symmetry, though the integral plainly diverges. Convergence should not depend on the two ends racing to infinity in lockstep.

(That symmetric limit does have a name — the Cauchy principal value — and real uses. It is just not what "converges" means.)

## Comparison, without evaluating

Often you cannot find the antiderivative but only need to know whether the integral is finite. If $0 \le f(x) \le g(x)$ on $[a,\infty)$:

- $\int g$ converges $\Rightarrow$ $\int f$ converges
- $\int f$ diverges $\Rightarrow$ $\int g$ diverges

$$
\int_1^{\infty} e^{-x^2}dx \ \text{converges, because } e^{-x^2}\le e^{-x} \text{ for } x\ge 1
$$

$e^{-x^2}$ has no elementary antiderivative at all, yet convergence is settled in one line. This is the same logic, in the same shape, as the comparison tests for series in [[integral-and-comparison-tests]] — and that is not a coincidence but a theorem.

## Why this bridges to series

An improper integral asks: do infinitely many shrinking contributions add up to something finite? A series asks the same question with a sum instead of an integral. The integral test makes the correspondence exact. Everything you learn here about *how fast is fast enough* transfers directly.

:::check
What are the two kinds of improper integral, and how is each one defined?
:::

:::check
For which $p$ does $\int_1^{\infty}x^{-p}dx$ converge, and for which does $\int_0^1 x^{-p}dx$ converge?
:::

:::check
Why must $\int_{-\infty}^{\infty}f$ be split into two independent limits rather than taken as $\lim_{t\to\infty}\int_{-t}^{t}f$?
:::

:::check
What does an improper integral have to do with infinite series?
:::
