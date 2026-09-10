---
id: riemann-sums-and-the-definite-integral
title: Riemann Sums and the Definite Integral
summary: An integral is not "the opposite of a derivative" — it is the limit of a sum, and every application in Calculus 2 comes from that definition.
tags: [integration, foundations, definitions]
difficulty: 2
est_minutes: 40
prereqs: []
related: [fundamental-theorem-of-calculus]
sources:
  - title: MIT 18.01 — The Definite Integral
    url: https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/
checks:
  - q: What does each of dx, f(x), and the integral sign contribute to the meaning of the definition?
    a: dx is the width of a slice, f(x) is the height of that slice, f(x)·dx is the area of one slice, and the integral sign is the limit of the sum of all such slices as the widths go to zero.
  - q: An integral of a function that is negative on part of the interval gives what, exactly?
    a: Signed area. Regions below the axis contribute negatively, because f(x_i*) is negative there while Δx stays positive. To get geometric area you must integrate |f(x)| or split the interval at the zeros.
  - q: Why is "set up the integral" the hard step in an application problem, and what does that step actually require?
    a: Because evaluating is mechanical once the integral exists. Setting up requires identifying the slice — what quantity one thin piece contributes, expressed as (something)·dx — and the limits over which slices accumulate.
---

# Riemann Sums and the Definite Integral

Most people leave Calculus 1 believing an integral is an antiderivative. That belief will get you through a homework set and then fail you for the rest of Calculus 2, because **every application in this course — area, volume, arc length, work, probability — is built by slicing something into pieces and adding them up.** Antiderivatives are just how you *evaluate* the result.

## The definition

Chop $[a,b]$ into $n$ pieces of width $\Delta x = \frac{b-a}{n}$, pick a sample point $x_i^*$ in each, and add up rectangles:

$$
\int_a^b f(x)\,dx = \lim_{n \to \infty} \sum_{i=1}^{n} f(x_i^*)\,\Delta x
$$

Read the notation as a sentence. The $\sum$ became $\int$ (an elongated S, for *sum*). The $\Delta x$ became $dx$ — a width that has shrunk to nothing. The $f(x_i^*)$ became $f(x)$ — a height.

```formula
title: The definition of the definite integral
tex: '\int_a^b f(x)\,dx = \lim_{n \to \infty} \sum_{i=1}^{n} f(x_i^*)\, \Delta x'
symbols: [integral, bound-a, bound-b, f-fn, x-var, dx, equals, limit, n-index, infinity, sigma-sum, i-index, sample-point, delta-x]
reading: >-
  The integral of f from a to b is what the sum of n rectangles approaches as the
  number of rectangles grows without bound.
steps:
  - The left side is the thing being defined. It does not yet mean anything.
  - On the right, Δx is the width of one slice and f(xᵢ*) is its height, so their product is one rectangle's area.
  - The ∑ adds those rectangles up for i = 1 to n — a finite, ordinary sum.
  - The lim is what turns a finite approximation into an exact quantity, and it is the only hard part.
notes:
  equals: This equals sign is a definition, not a theorem. Nothing is being proved — the left side is being given meaning by the right.
  x-var: A dummy. It is consumed by the integration and never appears in the answer, which is why ∫f(x)dx and ∫f(t)dt are the same number.
  dx: The trace left by Δx after the limit. Both mark a width; dx is the one that has already shrunk to nothing.
why: >-
  Read right to left and the notation stops being arbitrary: ∑ became ∫ (an
  elongated S, still for sum), Δx became dx (a width that has shrunk to nothing),
  and f(xᵢ*) became f(x) (a height). **Every application in this course is built
  by choosing a different slice and running this same machine.**
```


$$
\underbrace{f(x)}_{\text{height}} \cdot \underbrace{dx}_{\text{width}} = \text{area of one infinitesimal slice}
$$

**That product is the thing to internalize.** In every application later in this course you will write down what one slice contributes and then integrate it. The pattern never changes; only the slice does.

```viz
type: riemann
```

| Application | One slice contributes |
|---|---|
| Area under a curve | $f(x)\,dx$ |
| Area between curves | $[f(x) - g(x)]\,dx$ — see [[area-between-curves]] |
| Volume by disks | $\pi r(x)^2\,dx$ — see [[volumes-of-revolution]] |
| Arc length | $\sqrt{1 + f'(x)^2}\,dx$ — see [[arc-length-and-surface-area]] |
| Work | $F(x)\,dx$ — see [[work-and-physical-applications]] |

## Signed area, not area

The definition does not know what "area" means. It multiplies heights by widths and adds. Where $f$ is negative, $f(x_i^*)\Delta x$ is negative.

$$
\int_0^{2\pi} \sin x \, dx = 0
$$

The sine curve encloses plenty of region; the integral is zero because the hump above the axis and the hump below cancel exactly. If you want *geometric* area you must integrate $|f(x)|$, which in practice means splitting the interval at the zeros of $f$ and negating the pieces where $f < 0$.

This trips people up constantly on exams. "Find the area" and "find the integral" are different instructions.

## Why the sample point stops mattering

You may have met left endpoints, right endpoints, and midpoints as separate rules. For a continuous $f$ they all converge to the same number — the gap between the left and right sums is at most $|f(b)-f(a)|\Delta x \to 0$. That's why the definition can say "pick any $x_i^*$" and still be well-defined.

The sample point only matters when you're *approximating* with finite $n$, which is where the midpoint rule and Simpson's rule earn their keep.

The definition is short enough to be code, and writing it once is worth more than
reading it three times:

```python
def riemann(f, a, b, n, rule="mid"):
    dx = (b - a) / n
    offset = {"left": 0.0, "mid": 0.5, "right": 1.0}[rule]
    return sum(f(a + (i + offset) * dx) for i in range(n)) * dx

riemann(lambda x: x**2, 0, 2, 1000)        # 2.666666... -> 8/3
riemann(lambda x: x**2, 0, 2, 10, "left")  # 2.28  -- visibly short
riemann(lambda x: x**2, 0, 2, 10, "mid")   # 2.665 -- errors cancel
```


## The properties, and where they come from

All of these are inherited from the corresponding facts about finite sums — nothing new is happening:

$$
\int_a^b [f+g] = \int_a^b f + \int_a^b g, \qquad \int_a^b cf = c\int_a^b f, \qquad \int_a^b f = \int_a^c f + \int_c^b f
$$

And the orientation convention $\int_b^a f = -\int_a^b f$, which is what makes the third property hold for *any* $c$, even one outside $[a,b]$.

There is deliberately **no** product rule and **no** quotient rule here. $\int fg \ne \int f \int g$. The absence of those is precisely why techniques like [[integration-by-parts]] and [[partial-fractions]] have to exist at all — integration has no algebra that mirrors the product and quotient rules for derivatives.

:::check
What does each of $dx$, $f(x)$, and the integral sign contribute to the meaning of the definition?
:::

:::check
An integral of a function that is negative on part of the interval gives what, exactly?
:::

:::check
Why is "set up the integral" the hard step in an application problem, and what does that step actually require?
:::
