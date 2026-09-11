---
id: fundamental-theorem-of-calculus
title: The Fundamental Theorem of Calculus
field: Foundations of the Integral
summary: Two statements that link the limit-of-sums definition to antiderivatives — one lets you evaluate integrals, the other builds functions out of them.
tags: [integration, foundations, theorems]
difficulty: 3
est_minutes: 45
prereqs: [riemann-sums-and-the-definite-integral]
related: [improper-integrals]
sources:
  - title: Stewart, Calculus — §5.3
    url: https://openstax.org/details/books/calculus-volume-1
checks:
  - q: State both parts of the FTC and say which one you use to evaluate a definite integral.
    a: "Part 1: if F(x) = ∫ₐˣ f(t)dt then F'(x) = f(x) — differentiating an accumulation returns the integrand. Part 2: ∫ₐᵇ f = F(b) − F(a) for any antiderivative F. Part 2 is the evaluation tool; Part 1 is what guarantees an antiderivative exists."
  - q: Differentiate ∫ₓ² ^{x³} sin(t) dt with respect to x.
    a: By Part 1 plus the chain rule, and splitting at a constant to handle the variable lower limit - sin(x³)·3x² − sin(x²)·2x.
  - q: Why is applying Part 2 to ∫₋₁¹ (1/x²) dx and getting −2 not merely wrong but obviously wrong?
    a: The integrand is positive everywhere it is defined, so no correct answer can be negative. Part 2 requires f continuous on [a,b]; 1/x² blows up at 0, so the hypothesis fails and the integral must be handled as an improper integral (it diverges).
---

# The Fundamental Theorem of Calculus

[[riemann-sums-and-the-definite-integral]] defines the integral as a limit of sums. That definition is honest, and for computing anything it is close to useless. Do $\int_0^1 x^2\,dx$ from the definition once: you need a closed form for $\sum i^2$, then a limit, and half a page later you have $1/3$. Now do $\int_0^1 x^3\,dx$. You need a different closed form, and none of the work transfers.

So there is a real question here, and it is not rhetorical: **is there any reason to expect a shortcut to exist?** Areas and slopes were invented for unrelated purposes — one for measuring fields, one for measuring motion. Nothing up to this point suggests they have anything to do with each other.

They turn out to be the same question asked in two directions, and the connection is close enough to arithmetic that the first time you see it, it looks like cheating.

## Part 1 — let the endpoint move

Fix the left end of an integral and let the right end slide. Every position of the right end gives you one number, so what you are holding is a function:

$$
F(x) = \int_a^x f(t)\,dt
$$

Now ask the only question you know how to ask about any function: **how fast does it change?** It is worth guessing before reading on. $F$ is built out of an integral, so a reasonable expectation is that its derivative is some other integral, or at least something with a $\int$ still in it.

Push $x$ a little further right, to $x+h$. The only new area is a thin sliver sitting between $x$ and $x+h$. If $h$ is small, the curve barely moves across that width — so the sliver is very nearly a rectangle, of height $f(x)$ and width $h$:

$$
F(x+h) - F(x) \;\approx\; f(x)\cdot h
$$

Divide by $h$ and shrink it:

$$
F'(x) \;=\; \lim_{h\to 0}\frac{F(x+h)-F(x)}{h} \;=\; f(x)
$$

No integral survived. The derivative of an accumulation is just the thing being accumulated, and the reason is the single line above: **the rate at which area piles up is the height of the curve, because height is what a thin sliver of area is made of.**

Continuity is doing real work in that argument, and it is worth seeing where. It is what guarantees $f$ cannot jump around inside the sliver no matter how thin you make it — which is what turns "very nearly a rectangle" into an equality in the limit. Drop continuity and the sliver stops being a rectangle and the argument stops.

That statement is Part 1, and $F$ is called an **accumulation function**.

Watch the two panels move together — the claim is that the lower one's *slope* is
the upper one's *height*, at every instant:

```viz
type: scene
name: ftc-accumulate
```

Note the dummy variable. $t$ is the variable of integration and is consumed by the integral; $x$ is the variable of the function $F$. Writing $\int_a^x f(x)dx$ is a genuine error, not just sloppy style.

**With a chain rule on top.** If the limit is a function $u(x)$:

$$
\frac{d}{dx}\int_a^{u(x)} f(t)\,dt = f(u(x))\cdot u'(x)
$$

And if *both* limits vary, split at any constant $c$ and use $\int_{v}^{u} = \int_{c}^{u} - \int_{c}^{v}$:

$$
\frac{d}{dx}\int_{v(x)}^{u(x)} f(t)\,dt = f(u(x))u'(x) - f(v(x))v'(x)
$$

## Part 2 — the evaluation theorem

If $F$ is **any** antiderivative of $f$ on $[a,b]$, then

```formula
title: The evaluation theorem
tex: '\int_a^b f(x)\,dx = F(b) - F(a)'
symbols: [integral, bound-a, bound-b, f-fn, x-var, dx, equals, F-antideriv]
reading: >-
  The integral of f from a to b equals any antiderivative of f evaluated at the
  top limit minus the same antiderivative at the bottom limit.
steps:
  - The left side is a limit of sums — see the definition of the definite integral.
  - The right side involves no sums, no limits, and no slices at all.
  - F is any function whose derivative is f. Which one you pick cannot matter, because the constant cancels in the subtraction.
  - Evaluate top first, then subtract bottom. Reversing that flips the sign.
notes:
  equals: This equals had to be earned. It is the content of a theorem, not a definition — the two sides were defined by completely unrelated processes.
  F-antideriv: "“Any” antiderivative. This is doing real work: it is why you may drop the +C on a definite integral."
  dx: Still marks the variable of integration, even though nothing is being sliced on the right-hand side.
why: >-
  The two sides come from different worlds — one is an infinite limiting process,
  the other is arithmetic on two numbers. **That they always agree is the reason
  calculus is usable at all**, and it is why the hypotheses matter: f must be
  continuous on the whole of [a, b], or the right-hand side computes something
  that is not the integral.
```

This is the workhorse. It turns "compute a limit of sums" into "find an antiderivative and subtract."

Why it is true is worth three lines, because they explain the otherwise arbitrary-looking subtraction.

Chop $[a,b]$ into slices. Across one slice, $F$ changes by $F(t_{i+1}) - F(t_i)$. Add those changes over every slice and almost everything cancels — each interior value shows up once with a plus and once with a minus — so all that survives is the two ends:

$$
\sum_i \big(F(t_{i+1}) - F(t_i)\big) = F(b) - F(a)
$$

That is exact for **any** number of slices, and notice it has nothing to do with integration yet. It is bookkeeping. The other half is the mean value theorem: on each slice there is some point $c_i$ where $f(c_i)$ equals $F$'s average rate of change across that slice, which makes $F(t_{i+1}) - F(t_i) = f(c_i)\,\Delta x$ exactly. Substitute:

$$
\sum_i f(c_i)\,\Delta x = F(b) - F(a)
$$

The left side is a Riemann sum, and it converges to the integral. The right side never depended on $n$ in the first place. **Two quantities that were equal at every step, only one of which ever needed a limit** — and that is the whole theorem.

Watch the *difference* readout below: it is zero at every n, not merely in the limit.

```viz
type: scene
name: ftc-telescope
```


Two details worth pinning down:

- **Any antiderivative works.** Antiderivatives differ by a constant, and the constant cancels in $F(b)-F(a)$. This is why you drop the $+C$ on definite integrals — not laziness, cancellation.
- **The two parts are not the same statement.** Part 1 says accumulation functions are antiderivatives, which *guarantees an antiderivative exists* for any continuous $f$. Part 2 says any antiderivative computes the integral. Part 1 is the existence claim; Part 2 is the computation.

## The hypothesis you will violate

Part 2 requires $f$ continuous on $[a,b]$. Ignore that and you get confident nonsense:

$$
\int_{-1}^{1} \frac{1}{x^2}\,dx \ \stackrel{?}{=} \ \left[-\frac{1}{x}\right]_{-1}^{1} = -1 - 1 = -2
$$

A positive integrand cannot have a negative integral. The antiderivative $-1/x$ is not continuous across $x=0$, so Part 2 simply does not apply. The correct treatment is in [[improper-integrals]] — and the correct answer is that the integral diverges.

**Whenever the antiderivative has a discontinuity inside the interval of integration, stop and check.** This is one of the most common ways to lose points on a Calculus 2 exam, because the arithmetic feels fine.

## Why techniques of integration exist

Part 2 reduces integration to antidifferentiation, and antidifferentiation is *hard*. Differentiation is an algorithm — product rule, chain rule, done. Antidifferentiation is a search. Worse, plenty of perfectly innocent functions have no elementary antiderivative at all:

$$
\int e^{-x^2}dx, \qquad \int \frac{\sin x}{x}\,dx, \qquad \int \sqrt{1+x^4}\,dx
$$

None of these can be written with elementary functions. That is a theorem, not a gap in your technique. Everything in the next stage — [[u-substitution]], [[integration-by-parts]], [[trigonometric-substitution]], [[partial-fractions]] — is a strategy for the cases where a search *can* succeed.

:::check
State both parts of the FTC and say which one you use to evaluate a definite integral.
:::

:::check
Differentiate $\int_{x^2}^{x^3} \sin(t)\,dt$ with respect to $x$.
:::

:::check
Why is applying Part 2 to $\int_{-1}^{1} \frac{1}{x^2}dx$ and getting $-2$ not merely wrong but *obviously* wrong?
:::
