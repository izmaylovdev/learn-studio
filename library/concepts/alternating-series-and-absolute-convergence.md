---
id: alternating-series-and-absolute-convergence
title: Alternating Series and Absolute Convergence
summary: Signs that alternate can rescue a series that would otherwise diverge — and the difference between absolute and conditional convergence is stranger than it sounds.
tags: [series, convergence, tests]
difficulty: 3
est_minutes: 45
prereqs: [integral-and-comparison-tests]
related: [ratio-and-root-tests, taylor-remainder-and-error-bounds]
checks:
  - q: State the three hypotheses of the alternating series test.
    a: The series alternates in sign, the magnitudes bₙ are eventually decreasing, and bₙ → 0. All three are required; alternation plus terms going to zero is not enough without monotonicity.
  - q: What is the error bound for a truncated alternating series, and why is it so simple?
    a: "|S − S_N| ≤ b_{N+1}, the first omitted term. Because the partial sums oscillate around the limit with shrinking swings, S is always trapped between consecutive partial sums."
  - q: Define absolute and conditional convergence, and give the standard example of each.
    a: ∑aₙ converges absolutely if ∑|aₙ| converges — e.g. ∑(−1)ⁿ/n². It converges conditionally if it converges but ∑|aₙ| diverges — e.g. the alternating harmonic series ∑(−1)ⁿ⁺¹/n.
  - q: Why does the distinction matter, beyond terminology?
    a: A conditionally convergent series can be rearranged to sum to any real number whatsoever (Riemann's rearrangement theorem), so its sum depends on the order of the terms. Absolutely convergent series can be rearranged freely, which is what lets power series be manipulated term by term.
---

# Alternating Series and Absolute Convergence

Every test in [[integral-and-comparison-tests]] assumed positive terms. Once signs vary, those arguments collapse — $S_N$ is no longer increasing, so "bounded implies convergent" is unavailable.

Alternating signs turn out to help enormously.

## The alternating series test

For $\sum(-1)^{n}b_n$ with $b_n > 0$, the series converges if:

1. $b_n$ is **eventually decreasing**, and
2. $b_n \to 0$

That's it. Compare how much work the positive-term case required.

The reason is visual: the partial sums step forward by $b_1$, back by $b_2$, forward by $b_3$ — each step smaller than the last. The sums oscillate with shrinking swings, and get squeezed onto a single point.

$$
S_2 < S_4 < S_6 < \cdots < S < \cdots < S_5 < S_3 < S_1
$$

**All three conditions are needed** (including alternation). Terms tending to zero alone is famously not enough — [[infinite-series-and-convergence]] shows the harmonic series failing. And monotonicity genuinely matters: you can construct alternating series with $b_n \to 0$ non-monotonically that diverge.

The headline case:

$$
\sum_{n=1}^{\infty}\frac{(-1)^{n+1}}{n} = 1 - \frac12+\frac13-\frac14+\cdots = \ln 2
$$

converges, while $\sum \frac1n$ diverges. **The signs are doing all the work** — cancellation between consecutive terms is what keeps the partial sums bounded.

## The error bound — unusually good

Truncate after $N$ terms. Because $S$ is always caught between consecutive partial sums:

$$
\big|S - S_N\big| \le b_{N+1}
$$

**The error is at most the first term you left out.** No other convergence test hands you an error estimate this cheaply, and it makes alternating series the pleasant case for numerical work. To get $\ln 2$ to within $0.001$, take 1000 terms — slow, but you know in advance that it suffices.

This bound reappears in [[taylor-remainder-and-error-bounds]], where alternating Taylor series (sine, cosine, arctangent) inherit it directly and let you skip the Lagrange remainder entirely.

## Absolute versus conditional

$$
\sum a_n \ \text{converges \textbf{absolutely}} \iff \sum|a_n| \ \text{converges}
$$

$$
\sum a_n \ \text{converges \textbf{conditionally}} \iff \sum a_n \text{ converges but } \sum|a_n| \text{ diverges}
$$

**Absolute convergence implies convergence.** So a valid strategy for any series with mixed signs is: throw away the signs and run a positive-term test. If $\sum|a_n|$ converges, you're done — and you never needed the alternating series test.

| Series | $\sum|a_n|$ | Verdict |
|---|---|---|
| $\sum\frac{(-1)^n}{n^2}$ | $\sum\frac1{n^2}$ converges | absolutely convergent |
| $\sum\frac{(-1)^n}{n}$ | $\sum\frac1n$ diverges | conditionally convergent |
| $\sum(-1)^n$ | diverges | divergent |

## Why the distinction is not bookkeeping

Here is the fact that makes it worth caring about — **Riemann's rearrangement theorem**:

> A conditionally convergent series can be rearranged to converge to *any real number you choose*, or to diverge.

The alternating harmonic series sums to $\ln 2$. Reorder its terms and you can make it sum to $\pi$, or $-17$, or nothing at all. Nothing is being smuggled in: it's the same terms, each used exactly once, in a different order.

This is possible because the positive terms alone sum to $+\infty$ and the negative terms alone to $-\infty$. You have unlimited supply of both, so you can steer the partial sums anywhere — overshoot your target with positives, undershoot with negatives, repeat. The terms shrink to zero, so the sums close in on whatever you aimed at.

**Absolutely convergent series are immune.** Their sum is independent of order. That is exactly the licence needed to add, multiply, differentiate, and integrate power series term by term inside their radius of convergence — see [[power-series-and-radius-of-convergence]]. Absolute convergence is what makes "infinite sums behave like finite ones" true.

:::check
State the three hypotheses of the alternating series test.
:::

:::check
What is the error bound for a truncated alternating series, and why is it so simple?
:::

:::check
Define absolute and conditional convergence, and give the standard example of each.
:::

:::check
Why does the distinction matter, beyond terminology?
:::
