---
id: ratio-and-root-tests
title: The Ratio and Root Tests
summary: Ask whether a series eventually behaves like a geometric one — the only tests that handle factorials, and the engine behind radius of convergence.
tags: [series, convergence, tests]
difficulty: 3
est_minutes: 40
prereqs: [integral-and-comparison-tests]
related: [power-series-and-radius-of-convergence, alternating-series-and-absolute-convergence]
checks:
  - q: What does the ratio test compute, and what is the geometric intuition behind the cutoff at 1?
    a: L = lim |a_{n+1}/aₙ|, the eventual ratio between consecutive terms. If that ratio settles near L the series eventually behaves like a geometric series with r = L, which converges exactly when L < 1.
  - q: What happens at L = 1, and why can't the test be patched to handle it?
    a: The test is inconclusive. Every p-series has L = 1, yet some converge and some diverge — so the ratio alone cannot distinguish them, and no refinement of the same limit can.
  - q: Which test do you reach for when terms contain factorials, and why does it work so well there?
    a: The ratio test. The ratio (n+1)!/n! collapses to n+1, so factorials cancel almost entirely instead of having to be estimated.
  - q: Why does the ratio test prove absolute convergence rather than just convergence?
    a: It is computed on |aₙ|, so what it establishes is convergence of ∑|aₙ|. That is why it applies directly to series with arbitrary signs, without any alternation hypothesis.
---

# The Ratio and Root Tests

Comparison tests need a known series that resembles yours. When terms contain **factorials** or **$n$th powers**, nothing recognizable is available — $n!$ doesn't resemble any $p$-series. These two tests need no comparison partner: they interrogate the series' own internal growth rate.

## The ratio test

```formula
title: The ratio test
tex: 'L = \lim_{n\to\infty}\left|\frac{a_{n+1}}{a_n}\right|'
symbols: [L-limit, equals, limit, n-index, infinity, abs-bars, frac-bar, a-term, plus]
reading: Compare each term to the one before it, and see what that ratio settles down to.
steps:
  - Form the ratio of consecutive terms — the next one over the current one.
  - Take absolute values, so this is a question about size and not about sign.
  - Let n run to infinity and see where the ratio settles.
  - Below 1 the terms are eventually shrinking geometrically and the series converges absolutely. Above 1 they grow, and it diverges.
notes:
  frac-bar: The ratio is the whole idea — it asks whether the series is *eventually geometric*, and geometric series are the one family whose behaviour is completely known.
  abs-bars: Makes this a test about magnitude, which is why it proves absolute convergence and gets alternating series for free.
  L-limit: L = 1 is genuinely inconclusive, not a near miss — ∑1/n diverges and ∑1/n² converges, and both give exactly 1.
why: >-
  Ratios are what **factorials and nth powers** collapse under: (n+1)!/n! is just n+1. That is why this is the test to reach for whenever you see a factorial or something raised to the n, and why it is the engine behind finding a power series' radius of convergence.
```

$$
\begin{cases} L<1 & \text{converges absolutely}\\ L>1 & \text{diverges}\\ L=1 & \text{inconclusive}\end{cases}
$$

**The intuition is geometric series.** If consecutive terms eventually sit in a fixed ratio $L$, then far out the series behaves like $\sum r^n$ with $r = L$ — and from [[infinite-series-and-convergence]], that converges exactly when $|r|<1$. The test says: the eventual ratio is what matters, and the cutoff is inherited from the geometric case.

Note the absolute values. The conclusion is **absolute** convergence, so the test applies to any signs without needing alternation.

## Why factorials

$$
\sum\frac{n!}{n^n}: \quad \left|\frac{a_{n+1}}{a_n}\right| = \frac{(n+1)!}{(n+1)^{n+1}}\cdot\frac{n^n}{n!} = \frac{n^n}{(n+1)^n} = \frac{1}{\left(1+\frac1n\right)^n}\to\frac1e < 1
$$

Converges. The key move is $\frac{(n+1)!}{n!} = n+1$ — **the factorial cancels almost completely**, leaving something manageable. Nothing else in the toolkit does that. Whenever you see $n!$, reach for the ratio test first.

Same story for $\sum\frac{x^n}{n!}$, whose ratio is $\frac{|x|}{n+1}\to 0$ for every $x$. That's how you learn $e^x$'s series converges everywhere.

## The root test

$$
L = \lim_{n\to\infty}\sqrt[n]{|a_n|}
$$

with the same three cases. Use it when the whole term is raised to the $n$th power, so the root cancels cleanly:

$$
\sum\left(\frac{2n+3}{3n+2}\right)^n: \quad \sqrt[n]{|a_n|} = \frac{2n+3}{3n+2}\to\frac23<1 \ \Rightarrow\ \text{converges}
$$

The ratio test would produce a mess here. The useful limit $\sqrt[n]{n}\to 1$ from [[sequences-and-their-limits]] handles most polynomial factors that come along.

The root test is strictly stronger — whenever the ratio limit exists, the root limit exists and equals it, but not conversely. In practice the ratio test is easier to compute, so it's the default; the root test is the specialist for $n$th powers.

## L = 1 is genuinely inconclusive

$$
\sum\frac1n \ \text{(diverges)}: \quad \frac{a_{n+1}}{a_n} = \frac{n}{n+1}\to 1
$$
$$
\sum\frac1{n^2}\ \text{(converges)}: \quad \frac{a_{n+1}}{a_n} = \frac{n^2}{(n+1)^2}\to 1
$$

Same limit, opposite verdicts. **Every $p$-series gives $L=1$.** So when the ratio test returns 1, it has told you nothing at all — go back to comparison or the integral test. Concluding "$L=1$ so it diverges" is a real and costly error.

The pattern is clean: the ratio test detects **exponential** behaviour, and is blind to **polynomial** behaviour. Comparison tests are the reverse. The two toolkits are complementary, not redundant.

## Which test, when

| Term contains | Use |
|---|---|
| $n!$ | ratio |
| $(\text{something})^n$ | root |
| $r^n$ with constant $r$ | ratio, or recognize it as geometric |
| powers of $n$ only | comparison — ratio will give 1 |
| $\ln n$ | integral test |

## Why this is the last test you'll need

Applied to a power series $\sum c_n x^n$, the ratio test produces a condition of the form $|x| < R$ — convergence for $x$ inside an interval, divergence outside. That is the entire origin of the **radius of convergence**, and it makes the ratio test the computational engine of [[power-series-and-radius-of-convergence]] and everything built on it.

:::check
What does the ratio test compute, and what is the geometric intuition behind the cutoff at 1?
:::

:::check
What happens at $L=1$, and why can't the test be patched to handle it?
:::

:::check
Which test do you reach for when terms contain factorials, and why does it work so well there?
:::

:::check
Why does the ratio test prove *absolute* convergence rather than just convergence?
:::
