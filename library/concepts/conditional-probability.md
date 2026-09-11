---
id: conditional-probability
title: Conditional Probability
field: Conditioning and Independence
summary: Conditioning does not change the world, it changes the sample space you measure against — which is why P(A given B) and P(B given A) are unrelated numbers.
tags: [probability, conditioning, definitions]
difficulty: 3
est_minutes: 40
prereqs: [probability-axioms]
related: [independence, bayes-theorem, law-of-total-probability]
sources:
  - title: Blitzstein & Hwang, Introduction to Probability — Ch. 2
    url: https://projects.iq.harvard.edu/stat110/home
checks:
  - q: Geometrically, what does conditioning on B do?
    a: It replaces Ω by B as the universe, and rescales everything so that B has probability 1. P(A|B) is the fraction of B that is also in A, which is why the denominator is P(B) rather than 1.
  - q: Why are P(A|B) and P(B|A) different, and what single quantity do they share?
    a: They are the same overlap P(A ∩ B) divided by different denominators. They agree only when P(A) = P(B). Confusing them is the prosecutor's fallacy.
  - q: What does the multiplication rule P(A ∩ B) = P(A|B)P(B) let you do that the definition does not?
    a: Build up the probability of a sequence of dependent events one stage at a time, each conditioned on everything before it — which is how tree diagrams and sampling-without-replacement problems get computed.
---

# Conditional Probability

Information does not change what happened. It changes **which outcomes are still on the table**, and therefore what fraction of them look the way you care about.

## The picture first

Draw $\Omega$ as a square with area 1. Event $A$ is a blob, event $B$ is another, and they overlap.

Learning that $B$ occurred does not shrink $A$. It throws away everything outside $B$ and **rescales what is left so that $B$ has area 1**. The question "how likely is $A$ now?" becomes "what fraction of $B$ is also in $A$?"

```formula
title: Conditioning on B
tex: 'P(A \mid B) = \frac{P(A \cap B)}{P(B)}'
symbols: [prob-P, event-A, given, event-B, equals, frac-bar, cap]
reading: The probability of A given B is the probability that both happened, divided by the probability of B.
steps:
  - B is now the whole universe. Everything outside it is discarded.
  - Of the outcomes still standing, the ones that also give you A are exactly the overlap.
  - So the numerator is the overlap, not P(A) — the part of A outside B is gone.
  - Dividing by P(B) rescales the shrunken universe back up to total probability 1.
notes:
  given: Not a change to the world, a change of denominator. The outcomes were always there; you have just stopped counting some of them.
  frac-bar: The division is the rescaling. Without it the conditional probabilities would not sum to 1 over a partition, and would not be probabilities at all.
  cap: Symmetric — P(A ∩ B) is the same number as P(B ∩ A). The *conditional* probabilities are not symmetric, and the denominator is the only reason why.
why: >-
  Because the numerator is symmetric and the denominator is not, **P(A|B) and P(B|A) are the same overlap measured against two different universes**. They agree only when P(A) = P(B). Treating them as interchangeable is the prosecutor's fallacy, and it is the error [[bayes-theorem]] exists to correct.
```

The definition needs $P(B) > 0$. Conditioning on something impossible is not a limiting case, it is undefined.

## The multiplication rule

Rearrange, and the definition becomes a tool for building probabilities rather than dissecting them:

$$
P(A \cap B) = P(A \mid B)\,P(B)
$$

Chained, this handles any sequence of dependent stages:

$$
P(A_1 \cap A_2 \cap A_3) = P(A_1)\,P(A_2 \mid A_1)\,P(A_3 \mid A_1 \cap A_2)
$$

**This is what a tree diagram is.** Each branch is a conditional probability, and multiplying along a path gives the probability of that path. Drawing three cards without replacement is one line: $\frac{4}{52}\cdot\frac{3}{51}\cdot\frac{2}{50}$ for three aces — each factor conditioned on the draws before it.

## Conditional probabilities are probabilities

Fix $B$. Then $P(\,\cdot \mid B)$ satisfies all three axioms — it is non-negative, gives $B$ probability 1, and adds over disjoint events. So every rule you know still applies **inside the conditioning**:

$$
P(A^c \mid B) = 1 - P(A \mid B)
$$

What is *not* true is the same manipulation on the other side of the bar. $P(A \mid B^c)$ has no fixed relationship to $P(A \mid B)$, and

$$
P(A \mid B) + P(A \mid B^c) \ne 1 \quad \text{in general}
$$

Those are two different universes, and there is no reason their answers should complement each other. **Complementing the wrong side of the bar** is the most common mechanical slip here.

## Why it matters more than it looks

Almost every real probability question is conditional, because you almost always know something. The unconditional $P(A)$ is the special case where you know nothing — and it is usually the least interesting number available.

Two directions from here. Fixing what conditioning does *not* do gives [[independence]]. Assembling an unconditional probability out of conditional pieces gives [[law-of-total-probability]], and reversing the bar gives [[bayes-theorem]].

:::check
Geometrically, what does conditioning on $B$ do?
:::

:::check
Why are $P(A \mid B)$ and $P(B \mid A)$ different, and what single quantity do they share?
:::

:::check
What does the multiplication rule $P(A \cap B) = P(A \mid B)P(B)$ let you do that the definition does not?
:::
