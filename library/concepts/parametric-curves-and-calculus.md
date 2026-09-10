---
id: parametric-curves-and-calculus
title: Parametric Curves and Calculus
summary: Describe a curve by where a particle is at each time — it frees you from the vertical line test and makes arc length natural rather than awkward.
tags: [parametric, curves, applications]
difficulty: 3
est_minutes: 45
prereqs: [arc-length-and-surface-area]
related: [polar-coordinates-and-area]
checks:
  - q: What can a parametric curve represent that y = f(x) cannot, and why?
    a: Curves failing the vertical line test — circles, spirals, self-intersecting paths — because x and y are both outputs of an independent parameter t, so a single x may correspond to many points on the curve.
  - q: Give dy/dx for a parametric curve and explain why it is not dy/dt divided by nothing.
    a: dy/dx = (dy/dt)/(dx/dt) by the chain rule, valid where dx/dt ≠ 0. Both coordinates change with t, so the slope is the ratio of the two rates, not either one alone.
  - q: How do you compute the second derivative, and what is the classic mistake?
    a: d²y/dx² = [d/dt(dy/dx)]/(dx/dt). The mistake is taking (d²y/dt²)/(d²x/dt²), which is not what the chain rule gives — you must differentiate the first derivative with respect to t and then divide by dx/dt again.
  - q: Why is the parametric arc-length formula more fundamental than the y = f(x) version?
    a: ds = √(dx²+dy²) is a statement about the curve itself, with no function required. The parametric form factors out dt and applies to any curve; the f(x) form is the special case x = t.
---

# Parametric Curves and Calculus

$y = f(x)$ can only describe curves passing the vertical line test. That rules out a circle, a spiral, and every path that loops back on itself — which is most interesting motion.

**Parametric form** gives both coordinates as functions of a third variable:

$$
x = x(t), \qquad y = y(t), \qquad t\in[\alpha,\beta]
$$

Think of $t$ as time and the curve as the trail of a moving particle. The curve is the *set of positions*; the parametrization also records **when** and **how fast** each point is reached.

$$
x = \cos t,\ y = \sin t,\ t\in[0,2\pi] \quad\text{— the unit circle, counterclockwise, once}
$$

Change to $t\in[0,4\pi]$ and you trace it twice. Same curve, different parametrization — a distinction that matters when you integrate, because you'd get twice the arc length.

## Eliminating the parameter

Solve for $t$ and substitute to recover a Cartesian equation. From $x=\cos t$, $y=\sin t$: square and add to get $x^2+y^2=1$.

**But information is lost.** The Cartesian equation says nothing about direction, starting point, or how many times the curve is traced. When a problem asks about motion, keep the parameter.

## Slope

Both coordinates vary with $t$, so the chain rule gives the slope as a ratio of rates:

$$
\frac{dy}{dx} = \frac{dy/dt}{dx/dt}, \qquad \frac{dx}{dt}\ne 0
$$

At points where $dx/dt = 0$ and $dy/dt \ne 0$ the tangent is **vertical**. Where both vanish you may have a cusp — the particle stops and reverses, as at the cusps of a cycloid.

**The second derivative** is where people slip:

$$
\frac{d^2y}{dx^2} = \frac{\frac{d}{dt}\left(\frac{dy}{dx}\right)}{\frac{dx}{dt}}
$$

Take the first derivative, differentiate *that* with respect to $t$, then divide by $dx/dt$ again. It is emphatically **not** $\frac{d^2y/dt^2}{d^2x/dt^2}$ — that expression corresponds to nothing. The rule is: every conversion from a $t$-derivative to an $x$-derivative costs one division by $dx/dt$.

## Arc length, in its natural form

From [[arc-length-and-surface-area]], $ds = \sqrt{dx^2+dy^2}$. Factor out $dt$:

$$
L = \int_{\alpha}^{\beta}\sqrt{\left(\frac{dx}{dt}\right)^2+\left(\frac{dy}{dt}\right)^2}\,dt
$$

This is the **more fundamental** version. The $\sqrt{1+f'(x)^2}$ formula is just the case $x = t$, and it inherits an artificial restriction — it can't measure a circle's circumference in one integral. This one can:

$$
L = \int_0^{2\pi}\sqrt{\sin^2t+\cos^2t}\,dt = \int_0^{2\pi}1\,dt = 2\pi
$$

The integrand $\sqrt{(x')^2+(y')^2}$ is the particle's **speed**, so arc length is $\int \text{speed}\,dt$ — total distance travelled. That reading makes the formula obvious rather than memorized.

```viz
type: parametric
```

**The parametrization must trace the curve exactly once**, or you'll count some of it twice. This is the practical reason to care about the distinction above.

## Area under a parametric curve

$$
A = \int_a^b y\,dx = \int_{\alpha}^{\beta} y(t)\,x'(t)\,dt
$$

Substituting $dx = x'(t)\,dt$ — the same change of variables as [[u-substitution]], with limits converted to $t$-values.

If $x'(t) < 0$ over part of the range, the curve is moving leftward and that portion contributes negatively. For a closed curve traced once, this is exactly what makes the interior area come out right, with the sign determined by orientation.

## Surface of revolution

$$
S = 2\pi\int r(t)\sqrt{(x')^2+(y')^2}\,dt
$$

Same $2\pi r\,ds$ slice as before; only $ds$ has been rewritten. **The pattern throughout this concept is that nothing new is happening** — every formula is an old one with $ds$, $dx$, or $dy$ expressed through $t$.

## Next

Polar coordinates are a special parametrization, $x = r(\theta)\cos\theta$, $y = r(\theta)\sin\theta$, with enough structure of their own to be worth separate treatment — see [[polar-coordinates-and-area]].

:::check
What can a parametric curve represent that $y=f(x)$ cannot, and why?
:::

:::check
Give $dy/dx$ for a parametric curve and explain why it is not $dy/dt$ divided by nothing.
:::

:::check
How do you compute the second derivative, and what is the classic mistake?
:::

:::check
Why is the parametric arc-length formula more fundamental than the $y=f(x)$ version?
:::
