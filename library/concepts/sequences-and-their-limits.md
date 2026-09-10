---
id: sequences-and-their-limits
title: Sequences and Their Limits
field: Sequences and Series
summary: An infinite list of numbers and the question of where it settles — the object every series is secretly built from.
tags: [sequences, convergence, foundations]
difficulty: 2
est_minutes: 35
prereqs: []
related: [infinite-series-and-convergence]
checks:
  - q: What does it mean for a sequence to converge, and what are the three possible behaviours otherwise?
    a: aₙ → L means the terms eventually stay arbitrarily close to L. Otherwise it can diverge to ±∞, oscillate between values without settling, or wander without limit. Only the first is convergence.
  - q: For which values of r does rⁿ converge, and what does it converge to?
    a: Converges for −1 < r ≤ 1. It goes to 0 for |r|<1 and to 1 for r=1. At r=−1 it oscillates between ±1; for |r|>1 it blows up. This is the fact geometric series are built on.
  - q: How do you find the limit of a sequence given by a discrete formula using L'Hôpital's rule, which requires a continuous variable?
    a: Replace n with a real variable x and take the limit of the corresponding function. If f(x) → L then aₙ = f(n) → L. The converse fails — f can oscillate between integers while f(n) is constant.
  - q: What does the Monotone Convergence Theorem let you conclude without ever computing a limit?
    a: A sequence that is increasing and bounded above converges (similarly decreasing and bounded below). It proves existence without producing the value, which is how recursively defined sequences are usually handled.
---

# Sequences and Their Limits

A **sequence** is an infinite ordered list $a_1, a_2, a_3, \dots$ — formally, a function whose domain is the positive integers. Written $\{a_n\}$.

The only question of interest: **as $n$ grows without bound, do the terms settle down to a single number?**

```formula
title: What convergence of a sequence means
tex: '\lim_{n\to\infty} a_n = L'
symbols: [limit, n-index, infinity, a-term, equals, L-limit]
reading: As the index runs off to infinity, the terms settle down to the single number L.
steps:
  - aₙ is one term — a number picked out of the list by its position.
  - Let the position run off without bound.
  - If the terms eventually stay as close to L as you like, and never leave again, the sequence converges to L.
  - If no such L exists, the sequence diverges. Oscillating forever counts as diverging.
notes:
  a-term: A single number, not a sum and not the sequence itself. Confusing a sequence with its series is the most expensive mistake available in this stage.
  L-limit: One fixed number the terms approach. It need not be a term of the sequence, and usually is not.
  limit: Everything infinite in this course is defined this way — by a limit of finite things. Nothing is ever actually added up infinitely many times.
why: >-
  A sequence is a **list**; a series is a **sum**. They are different objects with different questions, and the reference facts here are the ones every convergence test later calls on: **n! beats aⁿ beats n^p beats ln n**, and knowing that ordering cold is what makes the ratio test quick.
```

If such an $L$ exists the sequence **converges**; otherwise it **diverges**. Divergence covers three quite different behaviours — running off to $\pm\infty$, oscillating between fixed values, or wandering unpredictably — and it's worth naming which one you have, because they behave differently inside series.

## Sequence versus series — settle this now

This distinction causes more confusion in Calculus 2 than anything else in the course.

| | Sequence $\{a_n\}$ | Series $\sum a_n$ |
|---|---|---|
| What it is | a list of terms | a sum of terms |
| $\{1/n\}$ | $1, \tfrac12, \tfrac13,\dots \to 0$, **converges** | $1+\tfrac12+\tfrac13+\cdots = \infty$, **diverges** |

Same numbers, opposite verdicts. The terms shrinking to zero says nothing about whether their sum is finite — that's precisely the trap the divergence test is designed around, and it's covered in [[infinite-series-and-convergence]].

## Computing limits

**Everything from Calculus 1 carries over**, because $n\to\infty$ is just a limit. Rational expressions: divide by the highest power.

$$
\lim_{n\to\infty}\frac{3n^2+5}{2n^2-n} = \frac32
$$

**L'Hôpital, with a caveat.** L'Hôpital's rule requires a differentiable function of a real variable, and $a_n$ is defined only at integers. The bridge: if $f(x)\to L$ as $x\to\infty$ and $a_n = f(n)$, then $a_n\to L$.

$$
\lim_{n\to\infty}\frac{\ln n}{n} \ \leftarrow\ \lim_{x\to\infty}\frac{\ln x}{x} \stackrel{\text{L'H}}{=} \lim_{x\to\infty}\frac{1}{x} = 0
$$

The implication only runs one way. $f(x) = \sin(\pi x)$ has no limit, but $f(n) = 0$ for every integer $n$, so the sequence converges. You may use the function to conclude things about the sequence, never the reverse.

**Squeeze theorem**, for anything with a bounded oscillating factor:

$$
-\frac1n \le \frac{\cos n}{n}\le\frac1n \ \Longrightarrow\ \frac{\cos n}{n}\to 0
$$

**Continuous functions pass through limits.** If $a_n\to L$ and $f$ is continuous at $L$, then $f(a_n)\to f(L)$. This is what licenses the standard trick of taking logs to handle $a_n^{b_n}$ forms.

## The reference sequences

Know these cold; they are the yardsticks everything else gets compared to.

$$
r^n \to \begin{cases}0 & |r|<1\\ 1 & r=1\\ \text{diverges} & \text{otherwise}\end{cases} \qquad \frac{1}{n^p}\to 0\ (p>0) \qquad \sqrt[n]{n}\to 1 \qquad \left(1+\frac{x}{n}\right)^n\to e^x
$$

And the **growth hierarchy** — each dominates everything to its left as $n\to\infty$:

$$
\ln n \ \ll\ n^p \ \ll\ a^n \ \ll\ n! \ \ll\ n^n
$$

Any ratio of a slower to a faster term goes to zero. This single fact resolves most limit questions in this stage on sight, and it's what makes the ratio test in [[ratio-and-root-tests]] so effective against factorials.

## Convergence without a value

$$
\text{increasing} + \text{bounded above} \ \Longrightarrow\ \text{converges}
$$

The **Monotone Convergence Theorem**. It proves a limit exists without producing it — the sequence is climbing but can't get past the ceiling, so it must approach something.

This is the standard tool for recursively defined sequences like $a_{n+1} = \sqrt{2+a_n}$, where no closed form is available: show it's increasing (induction), show it's bounded (induction), conclude it converges, *then* find $L$ by taking limits of both sides to get $L = \sqrt{2+L}$.

Getting the value requires knowing the limit exists first. Solving $L=\sqrt{2+L}$ for a divergent sequence would produce a confident, meaningless answer.

:::check
What does it mean for a sequence to converge, and what are the three possible behaviours otherwise?
:::

:::check
For which values of $r$ does $r^n$ converge, and what does it converge to?
:::

:::check
How do you find the limit of a sequence given by a discrete formula using L'Hôpital's rule, which requires a continuous variable?
:::

:::check
What does the Monotone Convergence Theorem let you conclude without ever computing a limit?
:::
