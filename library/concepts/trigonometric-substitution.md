---
id: trigonometric-substitution
title: Trigonometric Substitution
summary: When a square root of a quadratic blocks you, trade x for a trig function so the Pythagorean identity collapses the root.
tags: [integration, techniques, trigonometry]
difficulty: 4
est_minutes: 50
prereqs: [trigonometric-integrals]
related: [arc-length-and-surface-area]
checks:
  - q: Which substitution goes with each of a²−x², a²+x², and x²−a², and what identity does each one exploit?
    a: "a²−x² → x = a sin θ, using 1−sin²=cos². a²+x² → x = a tan θ, using 1+tan²=sec². x²−a² → x = a sec θ, using sec²−1=tan². In each case the identity turns the radicand into a perfect square."
  - q: After integrating in θ, how do you convert back to x, and why is drawing a right triangle the reliable way?
    a: Build a right triangle encoding the substitution — e.g. x = a sin θ means opposite x, hypotenuse a — then read off any trig function of θ directly in terms of x. It avoids inverse-trig identity juggling and gets the third side right automatically.
  - q: An integrand contains √(x²+4x+13). Trig substitution does not apply directly. What is the missing step?
    a: Complete the square - x²+4x+13 = (x+2)²+9. Then substitute u = x+2 to reach the standard u²+a² form with a=3, and use u = 3 tan θ.
  - q: ∫ x/√(1−x²) dx and ∫ 1/√(1−x²) dx both contain the same radical. Why is trig substitution the wrong tool for one of them?
    a: The first has the derivative of the radicand present as the factor x, so a plain u-substitution with u = 1−x² finishes it in two lines. Trig substitution is for when no such factor exists.
---

# Trigonometric Substitution

[[u-substitution]] needs the derivative of the inside to be present. When it isn't, and you're staring at $\sqrt{a^2 - x^2}$ or friends, you substitute in the other direction: replace $x$ with a trig function chosen so a Pythagorean identity makes the root disappear.

## The three forms

| Radicand | Substitute | Identity used | Radical becomes |
|---|---|---|---|
| $a^2 - x^2$ | $x = a\sin\theta$ | $1-\sin^2 = \cos^2$ | $a\cos\theta$ |
| $a^2 + x^2$ | $x = a\tan\theta$ | $1+\tan^2 = \sec^2$ | $a\sec\theta$ |
| $x^2 - a^2$ | $x = a\sec\theta$ | $\sec^2-1 = \tan^2$ | $a\tan\theta$ |

There is nothing to memorize beyond "which identity turns this radicand into a perfect square." The sign pattern of the radicand picks the identity, and the identity picks the substitution.

```formula
title: The substitution that kills a radical
tex: 'x = a\sin\theta \quad\Rightarrow\quad \sqrt{a^2 - x^2} = a\cos\theta'
symbols: [x-var, equals, a-param, sin-fn, theta-var, implies, radical, minus, cos-fn]
reading: If you let x be a times sine theta, then the root of a squared minus x squared becomes simply a cosine theta.
steps:
  - The radicand has the shape a² − x², a difference. That shape picks the identity, and the identity picks the substitution.
  - Substituting x = a sin θ turns a² − x² into a²(1 − sin²θ).
  - 1 − sin²θ is cos²θ, so the radicand is now a perfect square — which is the entire point.
  - The square root of a perfect square is no square root at all, and what is left is an ordinary trigonometric integral.
notes:
  x-var: You are replacing the variable rather than renaming part of the integrand. This runs in the opposite direction to u-substitution.
  radical: This is the obstacle, not the answer. Everything here exists to make it disappear.
  theta-var: An angle you invented. It has to be converted back at the end — draw the triangle that x = a sin θ describes and read the answer off it.
  a-param: A fixed number, not a limit of integration. For √(4−x²) it is 2, because 4 = 2².
why: >-
  Nothing here is worth memorising beyond **which identity turns this radicand into a perfect square**. The sign pattern picks the identity and the identity picks the substitution — so the three-row table writes itself. But check for a plain u-substitution first, every time: this is the **expensive** tool.
```

## A full worked example

$$
\int \frac{dx}{x^2\sqrt{4-x^2}}
$$

Form $a^2 - x^2$ with $a = 2$, so $x = 2\sin\theta$, $dx = 2\cos\theta\,d\theta$, and $\sqrt{4-x^2} = 2\cos\theta$:

$$
\int \frac{2\cos\theta\,d\theta}{4\sin^2\theta\cdot 2\cos\theta} = \frac{1}{4}\int\csc^2\theta\,d\theta = -\frac{1}{4}\cot\theta + C
$$

Now convert back. **Draw the triangle** encoded by $\sin\theta = x/2$: opposite $x$, hypotenuse $2$, so adjacent $\sqrt{4-x^2}$. Read off $\cot\theta = \frac{\sqrt{4-x^2}}{x}$:

$$
= -\frac{\sqrt{4-x^2}}{4x} + C
$$

The triangle is not a shortcut, it is the *method*. Trying to convert back through $\theta = \arcsin(x/2)$ and inverse-trig identities is where people lose the thread.

## Complete the square first

Trig substitution applies to $\sqrt{\text{quadratic}}$, not only to the three tidy forms. Any quadratic becomes one of them after completing the square:

$$
\sqrt{x^2+4x+13} = \sqrt{(x+2)^2 + 9}
$$

Substitute $u = x+2$ to get $\sqrt{u^2+9}$, then $u = 3\tan\theta$. **Skipping the complete-the-square step is the most common reason a problem looks impossible when it isn't.** If you see a quadratic under a root and no obvious form, complete the square before concluding anything.

## Don't reach for it too early

$$
\int \frac{x\,dx}{\sqrt{1-x^2}} \qquad\text{vs}\qquad \int \frac{dx}{\sqrt{1-x^2}}
$$

The first has an $x$ in the numerator — the derivative of $1-x^2$ up to a constant. Ordinary substitution $u = 1-x^2$ finishes it immediately: $-\sqrt{1-x^2}+C$. Trig substitution would also work, in about four times the space.

The second has no such factor, and is the genuine trig-substitution case: $\arcsin x + C$.

**Check for a plain $u$-sub first, every time.** Trig substitution is the expensive tool.

## Definite integrals and the range of θ

Each substitution comes with a restricted range ($-\tfrac{\pi}{2}\le\theta\le\tfrac{\pi}{2}$ for sine, etc.) chosen so the substitution is invertible and the radical stays non-negative. Within that range you may write $\sqrt{\cos^2\theta} = \cos\theta$ rather than $|\cos\theta|$.

For a definite integral, convert the limits to $\theta$-values and you never need to convert back to $x$ at all — often the fastest route.

## Where you'll meet it again

Arc length and surface area produce $\sqrt{1 + f'(x)^2}$ almost by construction — see [[arc-length-and-surface-area]]. That is why those integrals are so often ugly, and why this technique is worth real fluency rather than recognition.

:::check
Which substitution goes with each of $a^2-x^2$, $a^2+x^2$, and $x^2-a^2$, and what identity does each one exploit?
:::

:::check
After integrating in $\theta$, how do you convert back to $x$, and why is drawing a right triangle the reliable way?
:::

:::check
An integrand contains $\sqrt{x^2+4x+13}$. Trig substitution does not apply directly. What is the missing step?
:::

:::check
$\int \frac{x\,dx}{\sqrt{1-x^2}}$ and $\int \frac{dx}{\sqrt{1-x^2}}$ both contain the same radical. Why is trig substitution the wrong tool for one of them?
:::
