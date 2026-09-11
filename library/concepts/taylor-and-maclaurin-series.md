---
id: taylor-and-maclaurin-series
title: Taylor and Maclaurin Series
field: Power and Taylor Series
summary: Build a power series that matches a function's every derivative at a point — the payoff of the whole course, and the reason a calculator can evaluate sine.
tags: [series, power-series, approximation]
difficulty: 4
est_minutes: 55
prereqs: [power-series-and-radius-of-convergence, integration-by-parts]
related: [taylor-remainder-and-error-bounds]
sources:
  - title: 3Blue1Brown — Taylor series
    url: https://www.3blue1brown.com/lessons/taylor-series
checks:
  - q: Where does the coefficient formula cₙ = f⁽ⁿ⁾(a)/n! come from?
    a: Assume f(x) = ∑cₙ(x−a)ⁿ, differentiate n times, and set x = a. All terms below degree n vanish from differentiating and all terms above vanish at x = a, leaving f⁽ⁿ⁾(a) = n!cₙ.
  - q: Why is there an n! in the denominator?
    a: Differentiating (x−a)ⁿ exactly n times produces a factor of n!. Dividing by n! cancels it so the coefficient isolates the derivative cleanly.
  - q: A Taylor series can converge everywhere and still not equal its function. What is the standard example?
    a: f(x) = e^{−1/x²} with f(0)=0 has every derivative zero at 0, so its Maclaurin series is identically 0 — converging everywhere, but equal to f only at x=0. Convergence of the series and equality with f are separate claims.
  - q: What is the fastest way to find the Maclaurin series of x²e^{−x}?
    a: Start from the known series for e^x, substitute −x, then multiply through by x². Manipulating known series beats computing derivatives in nearly every case.
---

# Taylor and Maclaurin Series

[[power-series-and-radius-of-convergence]] built functions out of series. Now run it backwards: **given a function, find a power series equal to it.**

## Deriving the coefficients

Suppose $f(x) = \sum_{n=0}^{\infty}c_n(x-a)^n$ on some interval. What must the $c_n$ be?

Set $x = a$: every term with a factor of $(x-a)$ dies, leaving $f(a) = c_0$.

Differentiate, then set $x=a$: $f'(a) = c_1$.

Differentiate twice: the $(x-a)^2$ term contributes $2c_2$, so $f''(a) = 2c_2$.

In general, differentiating $n$ times kills everything below degree $n$, and setting $x=a$ kills everything above:

$$
f^{(n)}(a) = n!\,c_n \qquad\Longrightarrow\qquad \boxed{c_n = \frac{f^{(n)}(a)}{n!}}
$$

```formula
title: The Taylor series of f about a
tex: 'f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!} (x-a)^n'
symbols: [f-fn, x-var, equals, sigma-sum, n-index, infinity, factorial, bound-a]
reading: >-
  f at x is the infinite sum, over n, of the n-th derivative of f at the centre,
  divided by n factorial, times x minus the centre to the n-th power.
steps:
  - Each term is built from one derivative of f, all of them measured at the single point a.
  - Dividing by n! cancels the n! that differentiating (x−a)ⁿ produces, so the coefficient isolates the derivative cleanly.
  - (x−a)ⁿ measures how far you have moved from the centre. At x = a every term but the first vanishes.
  - The ∑ to ∞ is the claim that matching every derivative at one point pins the function down on a whole interval.
notes:
  bound-a: Here a is not a limit of integration — it is the centre, the one point where the polynomial is forced to agree with f. Setting a = 0 gives a Maclaurin series.
  n-index: Both the term counter and the number of derivatives taken. Those are the same number, which is the whole trick.
  factorial: The counterweight. Without it the coefficients would be n! times too big, and the series would not converge to anything useful.
  equals: The most loaded symbol here. The series can converge and still not equal f — proving this equals requires showing the remainder goes to zero.
why: >-
  Read it as an infinite polynomial that has been forced to agree with f in
  value, slope, curvature, and every higher derivative — all at the single point
  a. **The surprise is that pinning a function down at one point constrains it
  across an interval**, which is a statement about how rigid smooth functions
  are, not about the algebra.
```

The **$n!$ is there to cancel the $n!$ that differentiation produces** from $(x-a)^n$ — not an arbitrary normalization.


Centered at $a=0$ it's called a **Maclaurin series**, which is the case you'll use nine times out of ten.

## What it means

The partial sums are the Taylor polynomials:

$$
T_1(x) = f(a) + f'(a)(x-a)
$$

— the tangent line, the linear approximation from Calculus 1. $T_2$ adds curvature by matching $f''$. Each new term matches one more derivative at $a$.

**A Taylor series is the limit of getting the tangent line's idea exactly right.** Matching every derivative at a single point pins down the function on a whole interval — which is a genuinely surprising fact about how rigid smooth functions are.

Watch it happen one term at a time — and watch what it still costs at the edges.

```viz
type: scene
name: taylor-build
```

Then take the controls yourself. The scene only shows sin&nbsp;x; the cases with a *finite* radius are
the ones worth poking at.

```viz
type: taylor
```

## The series to memorize

These six are the working set. Everything else comes from manipulating them.

$$
e^x = \sum_{n=0}^{\infty}\frac{x^n}{n!} = 1+x+\frac{x^2}{2!}+\cdots \qquad R=\infty
$$

$$
\sin x = \sum_{n=0}^{\infty}\frac{(-1)^n x^{2n+1}}{(2n+1)!} = x - \frac{x^3}{3!}+\frac{x^5}{5!}-\cdots \qquad R=\infty
$$

$$
\cos x = \sum_{n=0}^{\infty}\frac{(-1)^n x^{2n}}{(2n)!} = 1 - \frac{x^2}{2!}+\frac{x^4}{4!}-\cdots \qquad R=\infty
$$

$$
\frac{1}{1-x} = \sum_{n=0}^{\infty}x^n \qquad R=1
$$

$$
\ln(1+x) = \sum_{n=1}^{\infty}\frac{(-1)^{n+1}x^n}{n} \qquad R=1
$$

$$
\arctan x = \sum_{n=0}^{\infty}\frac{(-1)^n x^{2n+1}}{2n+1} \qquad R=1
$$

Sine is odd and has only odd powers; cosine is even and has only even powers. Worth noticing — it's a free check on any answer.

## Manipulate, don't differentiate

Computing $f^{(n)}(a)$ for general $n$ is usually miserable. Almost every problem is better solved by transforming a known series.

**Substitute.** $e^{-x^2} = \sum\frac{(-x^2)^n}{n!} = \sum\frac{(-1)^n x^{2n}}{n!}$.

**Multiply.** $x^2e^{-x} = x^2\sum\frac{(-x)^n}{n!} = \sum\frac{(-1)^n x^{n+2}}{n!}$.

**Differentiate or integrate term by term.** $\ln(1+x)$ falls out of integrating the geometric series for $\frac{1}{1+x}$.

Now the payoff — a genuinely hard integral, done in three lines:

$$
\int e^{-x^2}dx = \int\sum\frac{(-1)^nx^{2n}}{n!}dx = C + \sum\frac{(-1)^n x^{2n+1}}{n!(2n+1)}
$$

That function has **no elementary antiderivative** — [[fundamental-theorem-of-calculus]] flagged it as impossible. As a series it's routine, and truncating gives numerical values to any precision you like. This is how such integrals are actually computed, and it is the practical high point of Calculus 2.

Series also make limits trivial:

$$
\lim_{x\to 0}\frac{\sin x - x}{x^3} = \lim_{x\to0}\frac{-x^3/6 + x^5/120-\cdots}{x^3} = -\frac16
$$

versus three applications of L'Hôpital.

## Convergence is not equality

Two separate claims hide in $f(x) = \sum\frac{f^{(n)}(a)}{n!}(x-a)^n$:

1. the series converges, and
2. it converges **to $f(x)$**.

They can come apart. Take

$$
f(x) = \begin{cases}e^{-1/x^2} & x\ne 0\\ 0 & x = 0\end{cases}
$$

Every derivative at 0 is zero — the function flattens against the axis faster than any polynomial. So its Maclaurin series is $0+0x+0x^2+\cdots = 0$, which converges everywhere and equals $f$ only at $x=0$.

The function is smooth but not **analytic**. Proving the series actually equals the function requires showing the remainder goes to zero, which is [[taylor-remainder-and-error-bounds]].

Outside calculus, this series is why the Poisson probabilities sum to 1 — the normalising constant $e^{-\lambda}$ is cancelled exactly by the Maclaurin series for $e^{\lambda}$. See [[poisson-and-rare-events]].

:::check
Where does the coefficient formula $c_n = f^{(n)}(a)/n!$ come from?
:::

:::check
Why is there an $n!$ in the denominator?
:::

:::check
A Taylor series can converge everywhere and still not equal its function. What is the standard example?
:::

:::check
What is the fastest way to find the Maclaurin series of $x^2e^{-x}$?
:::
