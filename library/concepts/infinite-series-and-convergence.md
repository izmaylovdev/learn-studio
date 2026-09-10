---
id: infinite-series-and-convergence
title: Infinite Series and Convergence
summary: An infinite sum is defined as the limit of its partial sums — which is why geometric and telescoping series can be evaluated exactly and almost nothing else can.
tags: [series, convergence, foundations]
difficulty: 3
est_minutes: 45
prereqs: [sequences-and-their-limits]
related: [integral-and-comparison-tests, partial-fractions]
checks:
  - q: What is the definition of ∑aₙ, and why must it be defined this way?
    a: It is lim_{N→∞} S_N where S_N = a₁+…+a_N. Addition is only defined for finitely many terms, so an infinite sum has no meaning until you define it as the limit of finite sums.
  - q: State the divergence test precisely, and state clearly what it cannot do.
    a: If aₙ does not tend to 0, then ∑aₙ diverges. It can never prove convergence — aₙ → 0 is necessary but not sufficient, as the harmonic series demonstrates.
  - q: When does ∑arⁿ converge and to what, and where does the formula come from?
    a: Converges iff |r| < 1, to a/(1−r) where a is the first term. S_N = a(1−r^N)/(1−r) from the telescoping trick S_N − rS_N, and r^N → 0 exactly when |r| < 1.
  - q: The harmonic series has terms going to zero yet diverges. What is the cheapest way to see that?
    a: Group terms as 1 + 1/2 + (1/3+1/4) + (1/5+…+1/8) + … Each group is at least 1/2, and there are infinitely many groups, so the partial sums grow without bound.
---

# Infinite Series and Convergence

You cannot add infinitely many numbers. Addition is defined for two things at a time, hence for any finite collection — and that's where it stops. So $\sum_{n=1}^{\infty}a_n$ has no meaning until we give it one.

## The definition

Build the **partial sums**, which form a sequence:

$$
S_N = \sum_{n=1}^{N}a_n = a_1 + a_2 + \cdots + a_N
$$

Then define

$$
\sum_{n=1}^{\infty}a_n = \lim_{N\to\infty}S_N
$$

**A series is a limit of a sequence** — the sequence of its partial sums. Everything from [[sequences-and-their-limits]] applies, and every theorem in the rest of this course is ultimately a statement about $\{S_N\}$.

## The divergence test

If $\sum a_n$ converges, then $S_N$ and $S_{N-1}$ both approach the same $S$, so

$$
a_N = S_N - S_{N-1} \to S - S = 0
$$

Contrapositive:

$$
\lim_{n\to\infty}a_n \ne 0 \ \Longrightarrow\ \sum a_n \text{ diverges}
$$

**This is the only thing the test says.** It is a one-way street:

$$
\sum\frac1n \ \text{diverges, yet}\ \frac1n\to 0
$$

The harmonic series is the standing counterexample, and it is why "the terms go to zero, so it converges" is wrong. Terms tending to zero is **necessary, not sufficient**.

Why does the harmonic series diverge? Group the terms:

$$
1 + \frac12 + \underbrace{\left(\frac13+\frac14\right)}_{>\,1/2} + \underbrace{\left(\frac15+\cdots+\frac18\right)}_{>\,1/2} + \underbrace{\left(\frac19+\cdots+\frac1{16}\right)}_{>\,1/2}+\cdots
$$

Each group exceeds $\tfrac12$, and there are infinitely many groups. The sum grows without bound — slowly (you need about $10^{43}$ terms to reach 100) but without limit.

**Still, run the divergence test first, always.** It's one limit, and it settles a large fraction of problems immediately.

## The two series you can actually evaluate

Almost no series has a computable exact sum. Two families do, and they matter out of all proportion.

### Geometric

$$
\sum_{n=0}^{\infty}ar^n = a + ar + ar^2 + \cdots
$$

Compute $S_N$ by the telescoping trick — write $S_N$, write $rS_N$, subtract:

$$
S_N - rS_N = a - ar^N \ \Longrightarrow\ S_N = \frac{a(1-r^N)}{1-r}
$$

Since $r^N\to 0$ exactly when $|r|<1$:

$$
\boxed{\sum_{n=0}^{\infty}ar^n = \frac{a}{1-r}\quad\text{iff }|r|<1}
$$

$a$ is **the first term of the series as written**, whatever index it starts at. $\sum_{n=3}^{\infty}2^{-n}$ has $a = 1/8$, not 1. Writing out the first two terms before applying the formula prevents this entirely.

Geometric series are the backbone of the ratio test, and the reason power series have a radius of convergence — see [[power-series-and-radius-of-convergence]].

### Telescoping

$$
\sum_{n=1}^{\infty}\frac{1}{n(n+1)} = \sum_{n=1}^{\infty}\left(\frac1n - \frac1{n+1}\right)
$$

by [[partial-fractions]]. Now write out $S_N$ and watch the interior cancel:

$$
S_N = \left(1-\frac12\right)+\left(\frac12-\frac13\right)+\cdots+\left(\frac1N-\frac1{N+1}\right) = 1 - \frac{1}{N+1} \to 1
$$

Only the ends survive. When you see a rational term whose denominator factors, try decomposing it — collapse is common.

## Algebra of series

$$
\sum(a_n + b_n) = \sum a_n + \sum b_n, \qquad \sum ca_n = c\sum a_n
$$

both valid **when the individual series converge**. Splitting a convergent series into two divergent halves and cancelling infinities is not allowed, and produces classic nonsense.

Also: **changing finitely many terms cannot change convergence.** It shifts the sum, but a finite amount of anything can't make an infinite sum finite or vice versa. This is why tests may ignore what happens for small $n$ and why "eventually positive" or "eventually decreasing" is good enough as a hypothesis.

## What comes next

Since exact evaluation is off the table for nearly everything, the rest of this stage is about deciding *convergence* without computing the sum: [[integral-and-comparison-tests]], [[alternating-series-and-absolute-convergence]], and [[ratio-and-root-tests]].

:::check
What is the definition of $\sum a_n$, and why must it be defined this way?
:::

:::check
State the divergence test precisely, and state clearly what it cannot do.
:::

:::check
When does $\sum ar^n$ converge and to what, and where does the formula come from?
:::

:::check
The harmonic series has terms going to zero yet diverges. What is the cheapest way to see that?
:::
