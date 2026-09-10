---
id: fundamental-theorem-of-calculus
title: The Fundamental Theorem of Calculus
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

[[riemann-sums-and-the-definite-integral]] defines the integral as a limit of sums. Computing that limit directly is brutal — try it once for $\int_0^1 x^2\,dx$ and you'll never want to again. The FTC says you almost never have to.

It comes in two parts, and they say genuinely different things.

## Part 1 — differentiation undoes accumulation

If $f$ is continuous on $[a,b]$, define the **accumulation function**

$$
F(x) = \int_a^x f(t)\,dt
$$

Then $F$ is differentiable and

$$
F'(x) = f(x)
$$

Read it as a rate statement: $F(x)$ is how much has piled up by time $x$; $F'(x)$ is how fast it is piling up right now; and how fast it is piling up is exactly the height of the curve at $x$. Nothing mysterious.

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

$$
\int_a^b f(x)\,dx = F(b) - F(a)
$$

This is the workhorse. It turns "compute a limit of sums" into "find an antiderivative and subtract."

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
