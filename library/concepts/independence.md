---
id: independence
title: Independence
field: Conditioning and Independence
summary: Independence is an assumption you impose, almost never a fact you verify — and pairwise independence is strictly weaker than the mutual kind.
tags: [probability, conditioning, definitions]
difficulty: 3
est_minutes: 35
prereqs: [conditional-probability]
related: [probability-axioms, joint-distributions-and-covariance, bernoulli-and-binomial]
sources:
  - title: Blitzstein & Hwang, Introduction to Probability — Ch. 2
    url: https://projects.iq.harvard.edu/stat110/home
checks:
  - q: Why is P(A ∩ B) = P(A)P(B) preferred as the definition of independence over P(A|B) = P(A)?
    a: It is symmetric in A and B, and it stays defined when P(B) = 0. The conditional version requires a non-zero denominator and hides the symmetry that is the actual content.
  - q: What is the difference between pairwise and mutual independence?
    a: Pairwise means every pair multiplies; mutual means every sub-collection does, including triples and larger. Pairwise is strictly weaker — two coin flips and their XOR are pairwise independent but the third is determined by the first two.
  - q: Why does independence make the binomial formula possible?
    a: It lets the probability of one specific sequence of successes and failures be a plain product p^k(1−p)^(n−k), identical for every sequence with the same k. Only then can you multiply by a count instead of summing distinct terms.
---

# Independence

Two events are independent when knowing about one tells you nothing about the other. That is the intuition; the definition is a product.

## The definition, and why it is the product one

$$
P(A \cap B) = P(A)\,P(B)
$$

You could equally define it as $P(A \mid B) = P(A)$ — "conditioning on $B$ changes nothing" — and for $P(B) > 0$ the two are identical.

```formula
title: Independence
tex: 'P(A \cap B) = P(A)\,P(B)'
symbols: [prob-P, event-A, cap, event-B, equals]
reading: Two events are independent when the probability of both is the product of their separate probabilities.
steps:
  - Start from the multiplication rule, which always holds — P(A ∩ B) = P(A|B)P(B).
  - Independence says the conditioning does nothing, so P(A|B) can be replaced by P(A).
  - What is left is a plain product with no conditional in it.
  - Read backwards, the product *is* the definition, and the conditional statement is a consequence.
notes:
  cap: The joint probability. Independence is a claim about this one number, not about the events individually — the same two events can be independent under one P and dependent under another.
  prob-P: Appears three times, and the whole content is that the left one factors into the right two. Nothing else in probability lets you split an intersection for free.
why: >-
  The product form is preferred for two reasons. It is **symmetric** — the conditional form makes it look as though independence is something B does to A — and it stays meaningful when **P(B) = 0**, where the conditional version is undefined. This is also the one thing that makes large problems tractable at all: without it, n events need a joint distribution over 2ⁿ combinations, and with it they need n numbers.
```

## Pairwise is not mutual

For three or more events, "independent" means **every sub-collection multiplies**, not just every pair:

$$
P(A \cap B) = P(A)P(B), \quad P(A \cap C) = P(A)P(C), \quad P(B \cap C) = P(B)P(C)
$$
$$
\text{and} \quad P(A \cap B \cap C) = P(A)P(B)P(C)
$$

The last condition does not follow from the first three. Flip two fair coins and let $A$ = first is heads, $B$ = second is heads, $C$ = the two agree. Every pair is independent — knowing the first coin tells you nothing about whether they agree. But $A$ and $B$ together determine $C$ completely, so the triple product fails badly.

**Pairwise independence is strictly weaker**, and the gap is not a technicality — it is exactly where the intuition "no two of these are related, so they are all unrelated" breaks.

## Conditional independence is a different claim

$A$ and $B$ can be independent yet become dependent once you condition on $C$, and vice versa. Neither implies the other.

The classic case: two coin flips are independent, but conditioned on "exactly one came up heads" they are perfectly anti-correlated. Nothing about the coins changed; the universe you are measuring in did.

This is why "controlling for" a variable can create an association that was not there — the effect has a name (Berkson's paradox) and it is a live problem in real data analysis, not a curiosity.

## Independence is an assumption

In practice you almost never *verify* independence. You assume it, because the alternative is unmanageable, and then the model is only as good as the assumption.

The assumptions that fail most often:

- **Draws without replacement.** Each draw changes what is left. For a small sample from a large population the dependence is negligible, which is why the binomial is used as an approximation to the hypergeometric.
- **Repeated measurements on the same subject.** Two readings from one person are more alike than two readings from two people.
- **Anything sharing a common cause.** Two stocks in the same sector are not independent, and the 2008 models that assumed they were are the standard cautionary tale.

## What it buys

Independence is what makes counting arguments work. In [[bernoulli-and-binomial]] it turns the probability of one specific sequence into a plain product $p^k(1-p)^{n-k}$ — the same for every sequence with $k$ successes, which is what lets you multiply by a count from [[counting-and-combinatorics]] instead of summing distinct terms.

It also makes variances add, which is the entire reason the [[central-limit-theorem]] has a $\sqrt{n}$ in it. Expectation is linear regardless; variance is not, and independence is the price of admission. See [[joint-distributions-and-covariance]].

:::check
Why is $P(A \cap B) = P(A)P(B)$ preferred as the definition of independence over $P(A \mid B) = P(A)$?
:::

:::check
What is the difference between pairwise and mutual independence?
:::

:::check
Why does independence make the binomial formula possible?
:::
