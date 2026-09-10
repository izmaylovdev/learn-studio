---
id: power-series-and-radius-of-convergence
title: Power Series and Radius of Convergence
summary: An infinite polynomial that converges on an interval — a function defined by a series, and the first step toward representing familiar functions as sums.
tags: [series, power-series, convergence]
difficulty: 3
est_minutes: 45
prereqs: [ratio-and-root-tests]
related: [taylor-and-maclaurin-series, alternating-series-and-absolute-convergence]
checks:
  - q: What are the only three possible convergence behaviours of a power series, and why only three?
    a: Converges only at the center, converges for all x, or converges exactly on |x−a| < R with the endpoints undetermined. The ratio test always produces a condition of the form |x−a| < R, and R = 0 or ∞ are the degenerate cases.
  - q: How do you find the radius, and why must the endpoints be handled separately?
    a: Apply the ratio test to |c_{n+1}(x−a)^{n+1} / cₙ(x−a)ⁿ| and solve L < 1 for |x−a|. At the endpoints L = 1 exactly, so the ratio test is inconclusive there and each endpoint must be tested by substituting it in and using another test.
  - q: The geometric series gives 1/(1−x) = ∑xⁿ for |x|<1. How do you get a series for 1/(1+x²) without any new work?
    a: Substitute −x² for x - 1/(1+x²) = ∑(−x²)ⁿ = ∑(−1)ⁿx^{2n}, valid for |x²|<1, i.e. |x|<1. Substitution into a known series is usually faster than computing derivatives.
  - q: What operations may you perform term by term inside the radius of convergence?
    a: Differentiation, integration, addition, and multiplication by powers of x — all valid inside the interval, with the radius preserved (though endpoint behaviour can change). Absolute convergence is what licenses this.
---

# Power Series and Radius of Convergence

$$
\sum_{n=0}^{\infty}c_n(x-a)^n = c_0 + c_1(x-a) + c_2(x-a)^2 + \cdots
$$

An **infinite polynomial**, centered at $a$. The new thing is that $x$ is a variable: for each $x$ you get a different numerical series, which may converge or not. So a power series defines a **function**, whose domain is exactly the set of $x$ where it converges.

## Only three possibilities

Apply the ratio test from [[ratio-and-root-tests]] to $\sum c_n(x-a)^n$. The $|x-a|$ factors out of the limit, so the condition $L<1$ always takes the form

$$
|x-a| < R
$$

Hence exactly three cases:

1. $R = 0$ — converges only at $x=a$ (rare, e.g. $\sum n!x^n$)
2. $R = \infty$ — converges for every $x$ (e.g. $\sum x^n/n!$)
3. $0 < R < \infty$ — converges on an interval of radius $R$ about $a$

The convergence set is always an interval centered at $a$. That symmetry isn't obvious in advance; it's a consequence of the ratio test's structure.

## Finding the interval

$$
\sum_{n=1}^{\infty}\frac{(x-2)^n}{n\,3^n}
$$

$$
\left|\frac{a_{n+1}}{a_n}\right| = \frac{|x-2|^{n+1}}{(n+1)3^{n+1}}\cdot\frac{n\,3^n}{|x-2|^n} = \frac{|x-2|}{3}\cdot\frac{n}{n+1}\to\frac{|x-2|}{3}
$$

Converges when $\frac{|x-2|}{3}<1$, i.e. $R = 3$, giving $-1 < x < 5$.

**Now the endpoints, one at a time.** At $|x-a| = R$ the ratio test gives exactly $L=1$ — inconclusive by construction. There is no shortcut; substitute and test.

- $x=5$: $\sum\frac{3^n}{n3^n} = \sum\frac1n$ — harmonic, **diverges**.
- $x=-1$: $\sum\frac{(-3)^n}{n3^n} = \sum\frac{(-1)^n}{n}$ — alternating harmonic, **converges** by [[alternating-series-and-absolute-convergence]].

Interval: $[-1, 5)$. The asymmetry is normal — the two endpoints are genuinely independent questions, and any of the four bracket combinations can occur.

## The geometric series as a factory

$$
\frac{1}{1-x} = \sum_{n=0}^{\infty}x^n, \qquad |x|<1
$$

Read right-to-left, this says a familiar function *equals* a power series. And you can generate a great many more by **substitution**, without computing a single derivative:

$$
\frac{1}{1+x^2} = \frac{1}{1-(-x^2)} = \sum(-x^2)^n = \sum(-1)^n x^{2n}, \qquad |x|<1
$$

$$
\frac{1}{2-x} = \frac{1}{2}\cdot\frac{1}{1-x/2} = \sum\frac{x^n}{2^{n+1}}, \qquad |x|<2
$$

Getting the algebra into the exact shape $\frac{1}{1-(\text{something})}$ is the whole technique, and the radius transfers along with the substitution.

## Term-by-term calculus

Inside the interval of convergence, a power series behaves like a polynomial:

$$
f'(x) = \sum_{n=1}^{\infty}nc_n(x-a)^{n-1}, \qquad \int f(x)\,dx = C + \sum_{n=0}^{\infty}\frac{c_n(x-a)^{n+1}}{n+1}
$$

**The radius $R$ is unchanged** by either operation, though endpoint behaviour can change — integration tends to improve it, differentiation to spoil it.

This is where absolute convergence earns its keep: rearranging infinitely many terms is only safe because convergence inside the radius is absolute, and Riemann's rearrangement theorem doesn't apply.

Term-by-term integration is also a construction tool. Integrate the $\frac{1}{1+x^2}$ series:

$$
\arctan x = \sum_{n=0}^{\infty}\frac{(-1)^n x^{2n+1}}{2n+1} = x - \frac{x^3}{3}+\frac{x^5}{5}-\cdots
$$

Setting $x=1$ gives $\frac{\pi}{4} = 1 - \frac13+\frac15-\cdots$ — a formula for $\pi$, obtained without a single derivative of $\arctan$.

## The question this raises

We now have functions defined *by* series. The natural inverse question — given a function, can I *find* its series? — is [[taylor-and-maclaurin-series]].

:::check
What are the only three possible convergence behaviours of a power series, and why only three?
:::

:::check
How do you find the radius, and why must the endpoints be handled separately?
:::

:::check
The geometric series gives $\frac{1}{1-x} = \sum x^n$ for $|x|<1$. How do you get a series for $\frac{1}{1+x^2}$ without any new work?
:::

:::check
What operations may you perform term by term inside the radius of convergence?
:::
