---
id: area-between-curves
title: Area Between Curves
summary: The first real application of slicing — and the place to learn the habit that carries every later one. Draw it, name the slice, then integrate.
tags: [applications, integration, geometry]
difficulty: 2
est_minutes: 35
prereqs: [fundamental-theorem-of-calculus]
related: [volumes-of-revolution, polar-coordinates-and-area]
checks:
  - q: What is the height of a vertical slice between two curves, and why is it top minus bottom rather than the absolute value?
    a: (top − bottom)·dx. Using top minus bottom and identifying which is which on each subinterval is what keeps the contribution positive; |f−g| says the same thing but hides the case split you still have to do.
  - q: When should you integrate with respect to y instead of x?
    a: When horizontal slices need fewer cases — typically when the region's left and right boundaries are single functions of y but the top or bottom boundary changes formula partway across, or when solving for y would require splitting a curve into branches.
  - q: The curves y = x and y = x³ enclose region on [−1,1]. Why does ∫₋₁¹ (x − x³) dx give the wrong area?
    a: The curves cross at 0 and swap order, so on [−1,0] the integrand is negative and cancels part of the other half — giving 0. You must split at the crossing point and integrate top minus bottom separately on each piece.
---

# Area Between Curves

$$
A = \int_a^b \big[f(x) - g(x)\big]\,dx \qquad (f \ge g \text{ on } [a,b])
$$

The formula is easy. The reason this concept exists is the **method**, because it is the same method for volume, arc length, work, and everything else in this stage.

## The slice

Go back to [[riemann-sums-and-the-definite-integral]]: an integral adds up slices. A vertical slice of this region is a thin rectangle of width $dx$, whose height is the vertical gap between the curves:

$$
\underbrace{[f(x) - g(x)]}_{\text{height}}\cdot\underbrace{dx}_{\text{width}} = \text{area of one slice}
$$

Integrating adds them from $a$ to $b$. **Write down the slice before you write the integral.** Every application later in this course is a different slice with the same surrounding machinery, and the students who struggle in stage 3 are almost always the ones who memorized formulas here instead of the slicing habit.

## The procedure

1. **Sketch it.** Not optional. You cannot identify "top" without seeing the region.
2. **Find the intersections** — set $f=g$. These are usually your limits.
3. **Determine which curve is on top**, on each subinterval.
4. **Integrate** top minus bottom.

## Where it goes wrong: curves that cross

$y = x$ and $y = x^3$ on $[-1,1]$. They intersect at $-1, 0, 1$, and they **swap order at 0**: $x^3 \ge x$ on $[-1,0]$, and $x \ge x^3$ on $[0,1]$.

$$
\int_{-1}^{1}(x - x^3)\,dx = 0
$$

Zero — the two halves cancel, because on the left half the integrand is negative. The correct computation splits at the crossing:

$$
A = \int_{-1}^{0}(x^3 - x)\,dx + \int_{0}^{1}(x - x^3)\,dx = \frac14 + \frac14 = \frac12
$$

Writing $\int|f-g|$ is correct but doesn't save you: to evaluate it you still have to find where the sign flips. **Always find all intersections in the interval, not just the outermost two.**

## Integrating in y

Sometimes horizontal slices are far cleaner. A slice of height $dy$ has width (right curve minus left curve), both expressed as functions of $y$:

$$
A = \int_c^d \big[x_{\text{right}}(y) - x_{\text{left}}(y)\big]\,dy
$$

The classic case is a region bounded by $y^2 = x$ and a line. In $x$ you must split the parabola into two branches $y = \pm\sqrt{x}$ and integrate twice; in $y$ it is a single integral.

**Choose the variable that produces fewer cases**, not the one that feels familiar. Deciding this before setting up is often the whole difficulty of the problem.

## What "area" means here

This is genuine geometric area — a positive number — because you arranged for the integrand to be non-negative by taking top minus bottom. That's the difference from a bare $\int f$, which returns signed area. The sign bookkeeping doesn't vanish; you did it up front by identifying which curve is on top.

:::check
What is the height of a vertical slice between two curves, and why is it top minus bottom rather than the absolute value?
:::

:::check
When should you integrate with respect to $y$ instead of $x$?
:::

:::check
The curves $y=x$ and $y=x^3$ enclose region on $[-1,1]$. Why does $\int_{-1}^{1}(x-x^3)dx$ give the wrong area?
:::
