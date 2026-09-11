---
id: law-of-large-numbers
title: The Law of Large Numbers
field: Limit Theorems
summary: Sample averages converge to the true mean — which is a statement about averages, not about individual outcomes, and the difference is the gambler's fallacy.
tags: [probability, limits]
difficulty: 4
est_minutes: 40
prereqs: [variance-and-standard-deviation, expectation]
related: [central-limit-theorem, sequences-and-their-limits]
sources:
  - title: Blitzstein & Hwang, Introduction to Probability — Ch. 10
    url: https://projects.iq.harvard.edu/stat110/home
checks:
  - q: The sample average converges to μ. Does the number of heads converge to n/2?
    a: No — the opposite. The *proportion* converges to 1/2, but the absolute difference between heads and tails typically grows like √n. Deviations are not corrected, they are diluted.
  - q: Why does the law require finite variance (or at least a finite mean), and what breaks without it?
    a: The proof bounds the spread of the average by σ²/n, which needs σ² finite. Without a finite mean there is nothing to converge to — Cauchy sample means are Cauchy for every n and never settle.
  - q: What is the gambler's fallacy, and precisely which sentence of the law does it misread?
    a: The belief that a run of tails makes heads more likely. It reads "the average tends to 1/2" as a force acting on future flips, but the flips are independent — the average is pulled back by the growing weight of new data, not by correction of the old.
---

# The Law of Large Numbers

Average enough independent observations and the average settles on the true mean. This is the theorem that makes statistics possible — and the one most widely misread.

## The statement

Let $X_1, X_2, \ldots$ be independent with the same distribution, mean $\mu$, and finite variance $\sigma^2$. Let $\bar{X}_n$ be the average of the first $n$. Then

```formula
title: The sample mean converges
tex: '\bar{X}_n \to \mu \quad \text{as} \quad n \to \infty'
symbols: [xbar, n-trials, to-arrow, mu-mean, infinity]
reading: The average of the first n observations tends to the true mean as n grows without bound.
steps:
  - Each observation is random, so the average of the first n is random too.
  - Its expected value is μ for every n, however small — averaging does not introduce bias.
  - What changes with n is the spread. The variance of the average is σ²/n, which shrinks.
  - As n grows the distribution of the average concentrates onto a single point, and that point is μ.
notes:
  xbar: Itself a random variable — a different sample gives a different value. The theorem is about the shrinking spread of *its* distribution, not about any one sample.
  mu-mean: A fixed number, a property of the distribution. It is what you are trying to learn, and it never moves.
  to-arrow: Hiding a subtlety. The weak law and the strong law use genuinely different notions of convergence, and both are called this arrow.
why: >-
  The mechanism is **Var(X̄ₙ) = σ²/n**, which comes straight from variances adding for independent variables. Deviations are not corrected — they are **diluted**. Each new observation is a smaller fraction of a larger pile, and the old deviation simply matters less. That distinction is the entire difference between this theorem and the gambler's fallacy.
```

## The proof in one line

Chebyshev's inequality from [[variance-and-standard-deviation]], applied to the average:

$$
P\big(|\bar{X}_n - \mu| \ge \varepsilon\big) \le \frac{\sigma^2}{n\varepsilon^2} \;\longrightarrow\; 0
$$

That is the weak law, complete. Everything rests on $\operatorname{Var}(\bar{X}_n) = \sigma^2/n$, which itself rests on independence making variances add — see [[joint-distributions-and-covariance]]. **The whole theorem is a consequence of that one fact.**

## The gambler's fallacy

Ten tails in a row. Is heads now more likely?

No. The flips are independent, and the coin has no memory of the ten. But the law says the proportion tends to 1/2 — so what fixes the imbalance?

**Nothing does.** It gets swamped. After 10 tails and then 990 fair flips, you expect about 495 heads and 505 tails: a proportion of 0.495, already close to half, with the original deficit of 10 still fully present. The average is dragged toward $\mu$ by the *weight of new data*, not by any correction of the old.

Sharper still: the absolute gap between heads and tails typically **grows** like $\sqrt{n}$, even as the proportion converges. Both things are true at once, and holding them together is the point of this concept.

## Weak and strong

- **Weak law.** For any $\varepsilon$, $P(|\bar{X}_n - \mu| > \varepsilon) \to 0$. For each large $n$ the average is probably close.
- **Strong law.** $P(\bar{X}_n \to \mu) = 1$. The sequence itself converges, for almost every infinite run.

The strong law is genuinely stronger: the weak law leaves room for infinitely many rare excursions, and the strong law rules them out. In practice the weak one is what you use.

## Where it fails

**No finite mean.** The Cauchy distribution has none. The average of $n$ Cauchy variables is again Cauchy — the *same* distribution, for every $n$. More data buys nothing, because there is nothing to converge to. This is not a pathology of the proof; the theorem is simply false there.

**Dependence.** Correlated observations carry less information than their count suggests. If the cross terms do not vanish, $\operatorname{Var}(\bar{X}_n)$ shrinks more slowly than $\sigma^2/n$ or not at all.

**Heavy tails.** Even with a finite mean, convergence can be far too slow to be useful. A finite variance is what makes the $\sqrt{n}$ rate available.

## What it does not tell you

Only *that* the average converges, never **how fast**. The rate — and the shape of the error while it is still converging — is the [[central-limit-theorem]], which is the more useful of the two in practice.

:::check
The sample average converges to $\mu$. Does the number of heads converge to $n/2$?
:::

:::check
Why does the law require finite variance (or at least a finite mean), and what breaks without it?
:::

:::check
What is the gambler's fallacy, and precisely which sentence of the law does it misread?
:::
