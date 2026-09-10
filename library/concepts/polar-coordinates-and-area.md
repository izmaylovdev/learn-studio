---
id: polar-coordinates-and-area
title: Polar Coordinates and Area
summary: Locate points by distance and angle — and slice regions into circular sectors instead of rectangles, which changes the area formula in a way worth understanding rather than memorizing.
tags: [polar, curves, applications]
difficulty: 3
est_minutes: 45
prereqs: [parametric-curves-and-calculus]
related: [area-between-curves]
checks:
  - q: Why is the polar area element (1/2)r²dθ rather than r dθ?
    a: The slice is a thin circular sector, not a rectangle. A sector of radius r and angle dθ has area (dθ/2π)·πr² = (1/2)r²dθ. The extra factor of r comes from the sector widening as it goes out.
  - q: What is the most common error when setting up polar area limits?
    a: Using 0 to 2π reflexively. The correct limits are the θ-values that trace the region exactly once — for a rose curve or a single loop that is usually a much smaller range, and 0 to 2π would multiply-count.
  - q: Give dy/dx for a polar curve r = f(θ) and say why it isn't dr/dθ.
    a: Convert to parametric - x = r cos θ, y = r sin θ, then dy/dx = (r'sinθ + r cosθ)/(r'cosθ − r sinθ). dr/dθ measures how fast the radius changes, which is not the slope in the xy-plane.
  - q: Why can two different (r, θ) pairs name the same point, and what problem does that cause?
    a: θ is periodic and r may be taken negative, so (r,θ), (r,θ+2π), and (−r,θ+π) coincide. Consequently, intersections of polar curves can occur at parameter values where the two equations are not simultaneously satisfied, so solving the equations may miss intersection points — including the origin.
---

# Polar Coordinates and Area

Instead of "go across $x$, then up $y$", say **"face angle $\theta$, walk distance $r$"**.

$$
x = r\cos\theta, \qquad y = r\sin\theta, \qquad r^2 = x^2+y^2, \qquad \tan\theta = \frac{y}{x}
$$

For anything built around a center — circles, spirals, flowers, orbits — polar equations are dramatically simpler. The unit circle is $r=1$ rather than $x^2+y^2=1$. A three-petaled rose is $r = \cos 3\theta$, which has no usable Cartesian form at all.

## Points have many names

$(r,\theta)$, $(r,\theta+2\pi)$, and $(-r,\theta+\pi)$ are all the same point, and the origin is $(0,\theta)$ for **every** $\theta$. Cartesian coordinates have no such ambiguity.

This causes a specific, notorious problem: **solving two polar equations simultaneously can miss intersection points.** Two curves can pass through the same point at different $\theta$ values, so the equations are never satisfied together there. The origin is the usual casualty. The remedy is to sketch, and to check the origin separately by asking whether each curve reaches $r=0$ at any $\theta$.

## The area element

Here is the one genuinely new idea. In Cartesian coordinates you slice into rectangles. In polar coordinates a natural slice is a thin **circular sector** — pinned at the origin, opening by angle $d\theta$, extending out to $r$.

A full circle of radius $r$ has area $\pi r^2$. A sector is the fraction $\frac{d\theta}{2\pi}$ of it:

```formula
title: Area swept in polar coordinates
tex: 'A = \frac{1}{2} \int_{\alpha}^{\beta} r(\theta)^2 \, d\theta'
symbols: [equals, half, integral, alpha-bound, beta-bound, r-fn, theta-var, d-theta]
reading: >-
  The area is one half the integral, from the starting angle to the ending angle,
  of the radius squared with respect to the angle.
steps:
  - One slice is a thin circular sector pinned at the origin, not a rectangle.
  - A sector of angle dθ is the fraction dθ/2π of a full circle of area πr², which is where both the ½ and the r² come from.
  - The limits are the angles that trace the region exactly once — usually found by solving r = 0.
  - The ∫ then adds the sectors as dθ shrinks to nothing.
notes:
  half: Not a fudge factor and not removable. It is what is left of the 2π in the sector fraction after the πr² cancels into it.
  r-fn: A function of θ, not an independent variable. As you sweep the angle, r is what responds.
  d-theta: You are sweeping an angle, not a length. Writing dx here would be a different integral over a different axis.
  theta-var: The variable of integration, consumed by dθ — it does not survive into the answer.
why: >-
  Compare with area under a curve, where a slice is f(x)·dx — height times width.
  Here the slice is a wedge, so the contribution is ½r²·dθ. **Writing ∫r dθ, as if
  the slice were a rectangle, is the standard error** — and it is dimensionally
  wrong, which is the fastest way to catch it.
```


$$
dA = \frac{d\theta}{2\pi}\cdot\pi r^2 = \frac{1}{2}r^2\,d\theta
$$

$$
\boxed{A = \frac12\int_{\alpha}^{\beta}r(\theta)^2\,d\theta}
$$

**The $r^2$ is not decoration and the $\frac12$ is not a fudge.** Both come from the sector's geometry: a slice at larger $r$ subtends more area for the same $d\theta$, because the arc at its far end is longer. Writing $\int r\,d\theta$ — as if the slice were a rectangle — is the standard error, and it is dimensionally wrong.

## Limits: the thing to be careful about

Reaching for $0$ to $2\pi$ is the second standard error. **The limits are the $\theta$-values that trace the region exactly once.**

For $r = \cos 3\theta$, one petal is traced as $\theta$ runs from $-\pi/6$ to $\pi/6$ — where $r$ goes from 0 out and back to 0. Integrating over $0$ to $2\pi$ would sweep the whole rose repeatedly and give a meaningless number.

**Find where $r=0$.** Those angles are where a loop opens and closes, and they are almost always your limits.

```viz
type: polar
```

## Area between polar curves

$$
A = \frac12\int_{\alpha}^{\beta}\left[r_{\text{outer}}^2 - r_{\text{inner}}^2\right]d\theta
$$

Directly analogous to [[area-between-curves]], but note that you subtract the **squares**, not the radii. Same reasoning as the washer method in [[volumes-of-revolution]]: you are differencing sector areas, and $(r_o - r_i)^2$ is not $r_o^2 - r_i^2$.

And the limits again require knowing exactly where the curves cross — with the intersection caveat above firmly in mind.

## Slope and arc length

A polar curve is a parametric curve with $\theta$ as the parameter, so everything from [[parametric-curves-and-calculus]] carries over. With $x = r(\theta)\cos\theta$ and $y = r(\theta)\sin\theta$, the product rule gives

$$
\frac{dy}{dx} = \frac{r'\sin\theta + r\cos\theta}{r'\cos\theta - r\sin\theta}
$$

$\frac{dr}{d\theta}$ is **not** the slope — it's how fast the radius grows as you sweep. Confusing the two is common.

Arc length simplifies unusually well. Substituting into $\sqrt{(x')^2+(y')^2}$, the cross terms cancel and $\sin^2+\cos^2$ collapses:

$$
L = \int_{\alpha}^{\beta}\sqrt{r^2 + \left(\frac{dr}{d\theta}\right)^2}\,d\theta
$$

Two contributions with a clean reading: $r\,d\theta$ is the distance covered by *sweeping around*, $dr$ the distance covered by *moving outward*, combined by Pythagoras. For $r=1$ it gives $\int_0^{2\pi}d\theta = 2\pi$, as it must.

## The curves worth recognizing

| Equation | Shape |
|---|---|
| $r = a$ | circle, center origin |
| $r = 2a\cos\theta$ | circle through the origin, center on the $x$-axis |
| $r = a(1\pm\cos\theta)$ | cardioid |
| $r = a\cos(n\theta)$ | rose — $n$ petals if $n$ odd, $2n$ if $n$ even |
| $r = a\theta$ | Archimedean spiral |

The rose's petal count is worth checking once rather than memorizing: for even $n$, the curve needs a full $2\pi$ sweep to close, producing $2n$ petals; for odd $n$ it retraces itself after $\pi$, giving $n$.

:::check
Why is the polar area element $\frac12 r^2 d\theta$ rather than $r\,d\theta$?
:::

:::check
What is the most common error when setting up polar area limits?
:::

:::check
Give $dy/dx$ for a polar curve $r=f(\theta)$ and say why it isn't $dr/d\theta$.
:::

:::check
Why can two different $(r,\theta)$ pairs name the same point, and what problem does that cause?
:::
