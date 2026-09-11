---
id: bayes-theorem
title: Bayes' Theorem
field: Conditioning and Independence
summary: Reversing the conditioning bar — and the reason a 99%-accurate test for a rare disease still mostly returns false positives.
tags: [probability, conditioning, inference]
difficulty: 3
est_minutes: 45
prereqs: [conditional-probability, law-of-total-probability]
related: [independence, sample-spaces-and-events]
sources:
  - title: Blitzstein & Hwang, Introduction to Probability — Ch. 2
    url: https://projects.iq.harvard.edu/stat110/home
checks:
  - q: Derive Bayes' theorem in two lines from the definition of conditional probability.
    a: P(A ∩ B) equals both P(A|B)P(B) and P(B|A)P(A), since intersection is symmetric. Setting them equal and dividing by P(B) gives P(A|B) = P(B|A)P(A)/P(B).
  - q: A test is 99% accurate for a disease affecting 1 in 10,000. Someone tests positive. Roughly what is the chance they have it, and why?
    a: About 1%. Out of a million people, 100 are ill and 99 test positive; 999,900 are healthy and about 9,999 still test positive. The false positives outnumber true positives roughly 100 to 1 because the base rate is so much smaller than the error rate.
  - q: What role does the prior play, and what goes wrong if you ignore it?
    a: It is the base rate — how common the hypothesis is before evidence. Ignoring it means treating P(A|B) as if it were P(B|A), the prosecutor's fallacy, which for rare conditions is wrong by orders of magnitude.
---

# Bayes' Theorem

The theorem itself is two lines of algebra. Its consequences are so counterintuitive that trained professionals get them wrong under time pressure, which is why it is worth more than two lines of attention.

## The derivation

$P(A \cap B)$ can be written two ways, because intersection does not care about order:

$$
P(A \mid B)P(B) = P(A \cap B) = P(B \mid A)P(A)
$$

Divide by $P(B)$:

```formula
title: Bayes' theorem
tex: 'P(A \mid B) = \frac{P(B \mid A)\,P(A)}{P(B)}'
symbols: [prob-P, event-A, given, event-B, equals, frac-bar]
reading: The probability of A given B equals the probability of B given A, times the prior probability of A, divided by the overall probability of B.
steps:
  - Start with what you want — A given B — which is usually the direction you cannot measure.
  - The first factor on the right is the reverse conditional, which is usually the direction you can measure.
  - Multiply by the prior — how likely A was before any evidence arrived.
  - Divide by how likely the evidence was overall, which rescales the result back into a probability.
notes:
  given: The bar points the other way on each side. That reversal is the entire theorem, and forgetting it is the prosecutor's fallacy.
  event-A: The hypothesis. Its unconditional probability is the prior — the base rate — and it is the term people drop.
  frac-bar: The denominator almost never comes for free. It is computed with the law of total probability from the same conditionals already in the numerator.
why: >-
  The two conditional probabilities are related but **not equal**, and the prior is exactly the correction factor between them. "Probability of a positive test given illness" is a property of the test; "probability of illness given a positive test" is what the patient wants — and when the disease is rare those two numbers differ by **orders of magnitude**.
```

## The medical test, worked in whole people

Fractions make this easy to get wrong. Counting imaginary people makes it hard to get wrong.

A disease affects **1 in 10,000**. The test catches 99% of true cases and has a 1% false positive rate. You test positive. Do you have it?

Take a million people:

| | Ill | Healthy | Total |
|---|---|---|---|
| **Test +** | 99 | 9,999 | 10,098 |
| **Test −** | 1 | 989,901 | 989,902 |
| **Total** | 100 | 999,900 | 1,000,000 |

Of the 10,098 positives, 99 are genuinely ill. That is **about 1%**.

The test is not bad. The problem is that healthy people outnumber ill people 9,999 to 1, so even a small error rate applied to that huge group produces far more false positives than the disease produces true ones. **When the base rate is smaller than the error rate, most positives are false.**

The intuition to carry away: a test's accuracy is a statement about the columns of that table, and the question you care about is about the rows.

```viz
type: bayes
```

## The prosecutor's fallacy

Same error, higher stakes. "The chance of this DNA match occurring by coincidence is 1 in a million, therefore there is a one-in-a-million chance the defendant is innocent."

That swaps $P(\text{match} \mid \text{innocent})$ for $P(\text{innocent} \mid \text{match})$. If the database searched has 10 million people, roughly 10 innocent people match — and the correct probability of innocence given only the match is around 90%, not one in a million.

The number quoted was real. **The bar was pointing the wrong way.**

## Reading it as updating

Written as proportionality, the structure is clearer:

$$
\underbrace{P(A \mid B)}_{\text{posterior}} \;\propto\; \underbrace{P(B \mid A)}_{\text{likelihood}} \times \underbrace{P(A)}_{\text{prior}}
$$

Belief after evidence is belief before evidence, reweighted by how well the hypothesis predicted what you saw. The denominator is only there to make the posteriors sum to 1 across hypotheses — which is why it can often be ignored until the very end.

Two consequences worth stating plainly:

- **Evidence that every hypothesis predicts equally is worthless.** If $P(B \mid A) = P(B \mid A^c)$ the posterior equals the prior. Only *discriminating* evidence moves belief.
- **A prior of zero is permanent.** No finite evidence can revive a hypothesis you assigned probability zero. "Never be certain" is a mathematical statement here, not a rhetorical one.

## The denominator

$P(B)$ is rarely available directly, and this is where [[law-of-total-probability]] does its job:

$$
P(A \mid B) = \frac{P(B \mid A)P(A)}{P(B \mid A)P(A) + P(B \mid A^c)P(A^c)}
$$

Long, but every term in it is something the problem gave you. If you find yourself missing $P(B)$, you are not missing information — you have not expanded it yet.

:::check
Derive Bayes' theorem in two lines from the definition of conditional probability.
:::

:::check
A test is 99% accurate for a disease affecting 1 in 10,000. Someone tests positive. Roughly what is the chance they have it, and why?
:::

:::check
What role does the prior play, and what goes wrong if you ignore it?
:::
