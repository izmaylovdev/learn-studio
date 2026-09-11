---
id: random-variables-and-distributions
title: Random Variables and Distributions
field: Random Variables
summary: A random variable is a function, not a variable — and for continuous ones the density is not a probability, which is where most of the confusion lives.
tags: [probability, random-variables, definitions]
difficulty: 3
est_minutes: 45
prereqs: [probability-axioms, riemann-sums-and-the-definite-integral]
related: [expectation, variance-and-standard-deviation, the-normal-distribution]
sources:
  - title: Blitzstein & Hwang, Introduction to Probability — Ch. 3–5
    url: https://projects.iq.harvard.edu/stat110/home
checks:
  - q: In what sense is a random variable neither random nor a variable?
    a: It is a deterministic function from outcomes to numbers. The randomness is in which outcome occurs, not in the function, and X(ω) is a definite number once ω is known.
  - q: Why can a probability density exceed 1 when a probability cannot?
    a: A density is probability per unit length, not probability. On a narrow interval the density must be large for the area to reach a given probability — a uniform on [0, 0.1] has density 10 everywhere.
  - q: What does the CDF give you that a density does not?
    a: A number that is always a probability, always between 0 and 1, defined for discrete and continuous variables alike. The density is its derivative and only exists in the continuous case.
---

# Random Variables and Distributions

The name is doubly misleading, and unpicking it is most of the work.

## It is a function

A random variable $X$ is a **function from the sample space to the numbers**. Roll two dice; $\Omega$ is the 36 pairs, and $X(\omega) = $ the total is a perfectly deterministic rule. Feed it $(3,4)$ and you get 7, every time.

Nothing about $X$ is random. **The randomness is in which $\omega$ occurs.** Once it has, $X(\omega)$ is a definite number.

So why bother? Because outcomes are not numbers and you cannot average them. "Heads" has no mean. Attaching numbers to outcomes is what makes arithmetic — and therefore [[expectation]], variance, and every limit theorem — possible at all.

## The distribution forgets the sample space

The **distribution** of $X$ is how its probability is spread over the numbers. Two random variables on completely different experiments can have the same distribution, and for most purposes that is all you need to know about either.

This is a real simplification: once you have the distribution you can throw $\Omega$ away. It is also a real loss — see [[joint-distributions-and-covariance]], where two variables' joint behaviour is invisible to their separate distributions.

## Discrete and continuous

| | Discrete | Continuous |
|---|---|---|
| Described by | pmf $p(x) = P(X = x)$ | density $f(x)$ |
| Value at a point | is a probability | is **not** a probability |
| Total | $\sum_x p(x) = 1$ | $\int f(x)\,dx = 1$ |
| $P(a \le X \le b)$ | $\sum_{a \le x \le b} p(x)$ | $\int_a^b f(x)\,dx$ |

For a continuous variable, $P(X = x) = 0$ **for every single $x$**. Not "very small" — exactly zero. Any particular real number has no width, and probability here is area.

That has a consequence worth stating: $P(X \le a)$ and $P(X < a)$ are the same number in the continuous case and different in the discrete case. Endpoint pedantry matters on one side and not the other.

**A density can exceed 1.** A uniform on $[0, 0.1]$ has $f(x) = 10$. It has to, or the area would not reach 1. Density is probability *per unit length*, and lengths can be small.

## The CDF works for both

```formula
title: The cumulative distribution function
tex: 'F(x) = P(X \le x)'
symbols: [cdf-F, x-var, equals, prob-P, rv-X, le]
reading: F of x is the probability that the random variable lands at or below x.
steps:
  - Pick a threshold x anywhere on the number line.
  - Ask for the total probability sitting at or below it.
  - That number is F(x). It starts at 0 far to the left and climbs to 1 far to the right.
  - It never decreases, because moving the threshold right can only add probability.
notes:
  cdf-F: Always a probability, unlike the density. This is the object that exists for every random variable, discrete or continuous or neither.
  le: The "or equal" matters for discrete variables, where a single point can carry real probability, and is irrelevant for continuous ones, where it carries none.
  rv-X: The function; x is a number you are comparing it against. Keeping the capital and the lowercase apart is not a convention, it is the whole distinction.
why: >-
  The CDF **accumulates** the density, so the density is its derivative — the same relationship as in [[fundamental-theorem-of-calculus]], and for the same reason. That is also why probability of an interval is F(b) − F(a): the evaluation theorem, applied to a density.
```

The relationship in both directions:

$$
F(x) = \int_{-\infty}^{x} f(t)\,dt \qquad\Longleftrightarrow\qquad f(x) = F'(x)
$$

The integral runs to $-\infty$, so this is an improper integral — see [[improper-integrals]]. The requirement that it converge to 1 is exactly the normalisation condition.

## The mechanical errors

**Treating $f(x)$ as a probability.** It is a rate. It only becomes a probability after integrating over an interval.

**Losing the capital/lowercase distinction.** $X$ is the function; $x$ is a number. $P(X \le x)$ is a statement about both. Written sloppily this becomes unreadable, and unreadable notation here means unreachable answers.

**Forgetting to normalise.** A function that is non-negative is not yet a density. If $\int f \ne 1$, divide by whatever it is. Half the "find the constant $c$" exercises are exactly this.

**Integrating over the wrong support.** A density defined piecewise is zero outside its support, and integrating the formula outside the region where it applies gives nonsense. Write the support down.

:::check
In what sense is a random variable neither random nor a variable?
:::

:::check
Why can a probability density exceed 1 when a probability cannot?
:::

:::check
What does the CDF give you that a density does not?
:::
