---
id: work-and-physical-applications
title: Work and Physical Applications
field: Applications of Integration
summary: Work, fluid force, and center of mass are all the same integral in different clothes — force times distance, summed over slices that each move a different amount.
tags: [applications, integration, physics]
difficulty: 3
est_minutes: 45
prereqs: [area-between-curves]
related: [volumes-of-revolution]
checks:
  - q: Why does work require an integral rather than the formula W = Fd?
    a: W = Fd assumes constant force over the whole distance. When force varies with position, you slice the motion into pieces short enough that the force is effectively constant, compute F(x)dx for each, and integrate.
  - q: In a pumping problem, what varies from slice to slice, and what is the slice of work?
    a: Each horizontal slab of liquid has its own weight (density × g × area × dy) and its own distance to lift (the gap from that slab's depth to the outlet). dW = (weight of slab)·(distance that slab travels).
  - q: A spring problem gives "a force of 10 N stretches the spring 0.2 m". What must you do before integrating?
    a: Find the spring constant from Hooke's law - k = F/x = 50 N/m. The problem states a data point, not k, and the integrand is kx.
  - q: Why is fluid force on a vertical wall an integral while force on a horizontal tank bottom is not?
    a: Pressure depends on depth. A horizontal bottom is all at one depth, so F = pA directly. A vertical wall spans many depths, so you slice it into horizontal strips of constant depth and integrate p(y)·w(y)dy.
---

# Work and Physical Applications

These problems have a reputation for being fiddly. They're not conceptually harder than [[area-between-curves]] — they just require you to be honest about what one slice is, because the physics is doing the setup.

## Work with a variable force

$$
W = F\cdot d
$$

is only valid when $F$ is constant. When force depends on position, slice the motion into pieces so short that $F$ is essentially constant across each:

```formula
title: Work done by a varying force
tex: 'W = \int_a^b F(x)\,dx'
symbols: [W-work, equals, integral, bound-a, bound-b, F-force, x-var, dx]
reading: The work is the integral of the force over the distance it acts through.
steps:
  - Work is force times distance — but only while the force stays constant.
  - Chop the motion into steps so short that the force barely changes across each one.
  - Over one such step the work really is F(x) times dx, because F is effectively constant there.
  - Add the steps up. The integral is what makes "effectively constant" exact.
notes:
  F-force: How hard you must push when you are *at x*. If this were a constant you would not need calculus at all — that dependence is the entire reason for the integral.
  dx: One short displacement, chosen short enough that F does not vary across it.
  W-work: A total, accumulated. In a pumping problem every slab weighs the same but travels a different distance, and that asymmetry is what makes it an integral rather than a multiplication.
why: >-
  The physics does the setup and the calculus is the easy part. Be honest about **what one slice is and how far it moves** — those are different quantities, and treating the distance as a constant is what makes pumping problems go wrong. Two choices cause nearly all the errors: **where you put y = 0**, and whether the distance is measured to the rim or to a spout above it.
```

**Springs.** Hooke's law says $F(x) = kx$, with $x$ measured from the natural length:

$$
W = \int_0^{d}kx\,dx = \frac{kd^2}{2}
$$

Problems almost never hand you $k$. They say something like "a force of 10 N stretches the spring 0.2 m", from which $k = 10/0.2 = 50$. Finding $k$ first is a step, and forgetting it is the standard error here.

## Pumping problems — where two things vary

Emptying a tank is the archetype, and the reason it feels harder is that **the slice and the distance are different quantities**.

Slice the liquid into horizontal slabs of thickness $dy$. For a slab at height $y$:

$$
dW = \underbrace{\rho\,g\,A(y)\,dy}_{\text{weight of this slab}}\times\underbrace{d(y)}_{\text{how far }\textit{this}\text{ slab moves}}
$$

- $A(y)$ — cross-sectional area at height $y$, from the tank's geometry
- $d(y)$ — distance from $y$ up to the outlet, **not** a constant

$$
W = \rho g\int_{c}^{d} A(y)\,d(y)\,dy
$$

For a cone, cylinder, or sphere, $A(y)$ comes from similar triangles or the circle equation. Two decisions cause nearly all the errors: **where you put $y=0$**, and whether $d(y)$ is measured to the tank's rim or to a spout above it. Both are choices; make them explicitly and write them down, because $d(y)$ depends on both.

Note that the slabs at the bottom weigh the same as those at the top (for a cylinder) but travel farther. That asymmetry is exactly why this is an integral and not a multiplication.

## Fluid force

Pressure at depth $h$ is $p = \rho g h$. On a **horizontal** surface — a tank bottom — every point is at the same depth, so $F = pA$ with no calculus.

On a **vertical** wall, depth varies down the wall, so slice into horizontal strips of constant depth:

$$
dF = \underbrace{\rho g h(y)}_{\text{pressure at this depth}}\cdot\underbrace{w(y)\,dy}_{\text{area of this strip}} \qquad\Longrightarrow\qquad F = \rho g\int h(y)\,w(y)\,dy
$$

$w(y)$ is the width of the wall at that depth — a triangular end plate on a trough gives $w$ linear in $y$, a circular porthole gives $w = 2\sqrt{r^2-y^2}$.

## Average value and center of mass

The **average value** of a function on $[a,b]$:

$$
f_{\text{avg}} = \frac{1}{b-a}\int_a^b f(x)\,dx
$$

which is just the ordinary average — add up the values, divide by how many — with the sum replaced by an integral. The Mean Value Theorem for Integrals says a continuous $f$ actually attains this value somewhere on the interval.

The **centroid** of a region weights position by area:

$$
\bar{x} = \frac{1}{A}\int x\,[f(x)-g(x)]\,dx, \qquad \bar{y} = \frac{1}{A}\int \frac{f(x)+g(x)}{2}\,[f(x)-g(x)]\,dx
$$

Read $\bar x$ as "average $x$-coordinate, weighted by how much region sits at each $x$". The $\frac{f+g}{2}$ in $\bar y$ is the midpoint height of the slice — the slice's own center of mass.

## The pattern

Every problem in this concept is the same three steps:

1. Slice so that the varying quantity is **constant on each slice**.
2. Write what one slice contributes, with all its $y$-dependence explicit.
3. Integrate over the range of slices.

If you find yourself hunting for the right formula, you've skipped step 1.

:::check
Why does work require an integral rather than the formula $W=Fd$?
:::

:::check
In a pumping problem, what varies from slice to slice, and what is the slice of work?
:::

:::check
A spring problem gives "a force of 10 N stretches the spring 0.2 m". What must you do before integrating?
:::

:::check
Why is fluid force on a vertical wall an integral while force on a horizontal tank bottom is not?
:::
