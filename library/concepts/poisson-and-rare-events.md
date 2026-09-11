---
id: poisson-and-rare-events
title: Poisson and Rare Events
field: Named Distributions
summary: What a binomial becomes when the trials are many and each is unlikely — one parameter that is both the mean and the variance, which is a testable claim.
tags: [probability, distributions]
difficulty: 3
est_minutes: 40
prereqs: [bernoulli-and-binomial]
related: [the-normal-distribution, sequences-and-their-limits, taylor-and-maclaurin-series]
sources:
  - title: Blitzstein & Hwang, Introduction to Probability — Ch. 4
    url: https://projects.iq.harvard.edu/stat110/home
checks:
  - q: What limit of the binomial produces the Poisson, and what does e^(−λ) come from?
    a: n → ∞ and p → 0 with np = λ held fixed. The e^(−λ) is the limit of (1 − λ/n)ⁿ, which is one of the standard reference sequences.
  - q: The Poisson has mean λ and variance λ. Why is that a testable claim about data?
    a: If a dataset's variance greatly exceeds its mean it cannot be Poisson. Overdispersion usually means clustering — the events are not occurring independently, which is exactly the assumption the model makes.
  - q: Why does the sum of the Poisson probabilities equal 1?
    a: Summing λᵏ/k! over all k is the Taylor series for e^λ, which cancels the e^(−λ) prefactor exactly. The normalisation is the exponential series in disguise.
---

# Poisson and Rare Events

Count how many rare things happen in a fixed window — calls to a switchboard in an hour, mutations per genome, typos per page. Many opportunities, each unlikely.

## It is a limit of the binomial

Take a binomial with $n$ trials and success probability $p$, and let $n \to \infty$ and $p \to 0$ while holding the mean $np = \lambda$ fixed. The result:

```formula
title: The Poisson probability
tex: 'P(X = k) = \frac{\lambda^k e^{-\lambda}}{k!}'
symbols: [prob-P, rv-X, equals, k-count, frac-bar, lambda-rate, e-const, factorial, minus]
reading: The chance of exactly k events is lambda to the k, times e to the minus lambda, over k factorial.
steps:
  - Start from the binomial with n trials and p = λ/n, then let n grow.
  - The n choose k coefficient times pᵏ tends to λᵏ/k! — the falling factorial cancels against the powers of n.
  - The failure factor (1 − λ/n)^(n−k) tends to e^(−λ), which is a standard limit.
  - What survives has no n in it at all. Only the rate λ remains.
notes:
  lambda-rate: The only parameter. It is both the mean and the variance, which is an unusually strong claim and one you can check against data.
  e-const: The fingerprint of a limit having been taken. It is what is left of (1 − λ/n)ⁿ once n has run to infinity.
  factorial: Grows faster than λᵏ, so the probabilities eventually collapse however large λ is. That is why the distribution has a peak rather than climbing forever.
why: >-
  The remarkable part is that **n and p disappear**. You do not need to know how many opportunities there were or how unlikely each one was — only their product. That is why the Poisson applies to situations with no identifiable trials at all, like the arrival of calls in continuous time.
```

Note the parameter count: the binomial needs $n$ and $p$, the Poisson needs only $\lambda$. **The limit throws information away**, and that is exactly what makes it useful.

## Why the probabilities sum to 1

$$
\sum_{k=0}^{\infty} \frac{\lambda^k e^{-\lambda}}{k!} = e^{-\lambda}\sum_{k=0}^{\infty}\frac{\lambda^k}{k!} = e^{-\lambda}e^{\lambda} = 1
$$

The sum is the Maclaurin series for $e^\lambda$ — see [[taylor-and-maclaurin-series]]. The normalising constant is not chosen to make things work; it falls out of the exponential series. The $(1-\lambda/n)^n \to e^{-\lambda}$ step is one of the reference limits from [[sequences-and-their-limits]].

## Mean equals variance

$$
E[X] = \lambda, \qquad \operatorname{Var}(X) = \lambda
$$

Both inherited from the binomial: $np \to \lambda$, and $np(1-p) \to \lambda$ because $p \to 0$.

**This is a strong, checkable claim.** Compute the sample mean and sample variance of your counts. If the variance is much larger, the data is not Poisson — the phenomenon has a name, *overdispersion*, and it almost always means the events are **clustered** rather than independent. Buses arriving in threes are not Poisson, however rare buses are.

Underdispersion is rarer and means the events are more regular than chance — something is enforcing spacing.

## The assumptions

- **Independence.** One event does not make another more likely. This is what clustering violates.
- **Constant rate.** $\lambda$ does not change across the window. Call centres at 3am and 3pm are not the same process, and pooling them is a modelling error, not a rounding error.
- **No simultaneity.** Two events do not occur at the same instant.

The rule of thumb for using it as an approximation to the binomial: $n \ge 20$ and $p \le 0.05$, or $n \ge 100$ and $np \le 10$.

## What comes with it

If counts in a window are Poisson, the **gaps between events** are exponential, with density $\lambda e^{-\lambda t}$. The two are the same process described from different angles — one counts, the other waits.

The exponential distribution is **memoryless**: $P(T > s+t \mid T > s) = P(T > t)$. Having waited ten minutes tells you nothing about the wait remaining. That is either obviously right or obviously wrong depending on what is being modelled — right for radioactive decay, badly wrong for machine parts that wear out — and it is the fastest way to decide whether the model belongs.

For large $\lambda$ the Poisson itself becomes bell-shaped, approaching [[the-normal-distribution]] with mean and variance both $\lambda$. Above $\lambda \approx 20$ the normal approximation is usually good enough.

:::check
What limit of the binomial produces the Poisson, and what does $e^{-\lambda}$ come from?
:::

:::check
The Poisson has mean $\lambda$ and variance $\lambda$. Why is that a testable claim about data?
:::

:::check
Why does the sum of the Poisson probabilities equal 1?
:::
