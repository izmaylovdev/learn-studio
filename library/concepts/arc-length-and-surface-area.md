---
id: arc-length-and-surface-area
title: Arc Length and Surface Area
field: Applications of Integration
summary: Slice a curve instead of a region — the Pythagorean theorem on an infinitesimal scale produces both formulas, and the ugly integrals that come with them.
tags: [applications, integration, geometry]
difficulty: 3
est_minutes: 45
prereqs: [volumes-of-revolution]
related: [trigonometric-substitution, parametric-curves-and-calculus]
checks:
  - q: Derive ds = √(1 + (dy/dx)²) dx in one line, and say what geometric fact it encodes.
    a: A tiny piece of curve is the hypotenuse of a triangle with legs dx and dy, so ds = √(dx²+dy²). Factor dx out - ds = √(1+(dy/dx)²)dx. It is the Pythagorean theorem applied to an infinitesimal piece of the curve.
  - q: What is the surface-area slice for revolving a curve, and why is ds used rather than dx?
    a: dS = 2πr·ds, a thin band of circumference 2πr and slant width ds. The band's width is measured along the curve, not along the axis; using dx would flatten the slant and undercount, exactly as a cone's lateral area uses slant height, not height.
  - q: Why are arc length integrals so often impossible to evaluate in closed form?
    a: The square root of 1 + f'(x)² is rarely a nice function. Even f(x)=x² gives √(1+4x²), which needs trig substitution, and most functions give integrands with no elementary antiderivative at all — so numerical methods are the norm.
---

# Arc Length and Surface Area

Everything so far sliced a **region**. Now slice a **curve**. The setup is identical; only the slice changes.

## The arc length element

Take a piece of the curve so short it's indistinguishable from a straight segment. It's the hypotenuse of a right triangle with legs $dx$ and $dy$:

$$
ds = \sqrt{dx^2 + dy^2}
$$

Factor out whichever differential you want to integrate against:

$$
ds = \sqrt{1 + \left(\frac{dy}{dx}\right)^2}\,dx \qquad\text{or}\qquad ds = \sqrt{\left(\frac{dx}{dy}\right)^2 + 1}\,dy
$$

```formula
title: Arc length of a graph
tex: "L = \\int_a^b \\sqrt{1 + f'(x)^2} \\, dx"
symbols: [L-len, integral, bound-a, bound-b, radical, one-const, plus, f-fn, prime, x-var, dx, equals]
reading: >-
  The length of the curve equals the integral, from a to b, of the square root of
  one plus the derivative squared, with respect to x.
steps:
  - One slice of curve is the hypotenuse of a triangle with legs dx and dy.
  - So ds = √(dx² + dy²). Factor dx out of the root and you get √(1 + (dy/dx)²)·dx.
  - f′(x) is that dy/dx — the slope of the curve at this point.
  - Integrating adds the hypotenuses, which is why the answer is a length and not an area.
notes:
  one-const: The horizontal run of the slice. It is why arc length can never come out shorter than the interval — the shortest a curve can be is straight.
  L-len: Distance *along* the curve, not the straight-line distance between its ends.
  radical: The reason most arc lengths cannot be computed exactly. √(1+f′²) is rarely a nice function — even f(x)=x² lands you in trig substitution.
  prime: The slope. Steeper curve, longer hypotenuse, larger integrand — which is why the integrand is never below 1.
  dx: The horizontal footprint of one slice. The slice itself is longer, by exactly the factor in front.
why: >-
  The whole formula is the Pythagorean theorem applied to an infinitesimal piece
  of curve, so it is worth deriving rather than memorizing. **Sanity check it:
  √(1+f′²) ≥ 1 always, so arc length can never come out shorter than the
  horizontal span** — as it must not.
```

**That is the Pythagorean theorem and nothing else.** Deriving it takes ten seconds, which is a better use of memory than storing the formula.


Two sanity checks worth doing once: a straight line $f'=m$ gives $L = \sqrt{1+m^2}\,(b-a)$, correct. And $\sqrt{1+f'^2}\ge 1$ always, so arc length is never shorter than the horizontal span — as it must be.

## Surface of revolution

Revolve the curve about an axis. Each arc-length piece sweeps a thin band — a truncated cone, effectively — of circumference $2\pi r$ and width $ds$:

$$
dS = 2\pi r\,ds \qquad\Longrightarrow\qquad S = 2\pi\int r\,ds
$$

with $r$ the distance from the curve to the axis: $r = f(x)$ about the $x$-axis, $r = x$ about the $y$-axis.

**The $ds$ is the whole point.** Using $dx$ would measure the band's width along the axis rather than along the slanted curve, undercounting the surface. It's the same reason a cone's lateral area uses slant height rather than height. Compare with [[volumes-of-revolution]], where $dx$ *is* correct — because there you're stacking flat plates, and a plate's volume doesn't care about the curve's slope.

## Why the integrals are so ugly

$$
f(x) = x^2 \ \Longrightarrow\ L = \int\sqrt{1+4x^2}\,dx
$$

That needs [[trigonometric-substitution]] with $2x = \tan\theta$, and lands you in $\int\sec^3\theta\,d\theta$ — the genuinely unpleasant case from [[trigonometric-integrals]]. And that's for a *parabola*.

Try $f(x) = \sin x$: $\int\sqrt{1+\cos^2 x}\,dx$ is an elliptic integral with no elementary antiderivative. Try an ellipse: same thing, which is where "elliptic integral" got its name.

**Most arc lengths cannot be computed exactly.** Textbook problems are reverse-engineered so that $1+f'^2$ happens to be a perfect square — functions like $f(x) = \frac{x^3}{3}+\frac{1}{4x}$ exist for no reason other than making this work out. Outside the exercises, arc length is computed numerically. Knowing this in advance saves you from assuming you've made an algebra error when the integral turns hostile.

## The parametric version

$ds = \sqrt{dx^2+dy^2}$ never mentioned a function $y=f(x)$ — it's a statement about the curve. For a curve given as $x(t), y(t)$:

$$
ds = \sqrt{\left(\frac{dx}{dt}\right)^2 + \left(\frac{dy}{dt}\right)^2}\,dt
$$

This is the more natural form, and it handles curves that fail the vertical line test — circles, spirals, anything self-intersecting. See [[parametric-curves-and-calculus]]. If a curve is a function of $x$, the two agree; if it isn't, only this one applies.

:::check
Derive $ds = \sqrt{1+(dy/dx)^2}\,dx$ in one line, and say what geometric fact it encodes.
:::

:::check
What is the surface-area slice for revolving a curve, and why is $ds$ used rather than $dx$?
:::

:::check
Why are arc length integrals so often impossible to evaluate in closed form?
:::
