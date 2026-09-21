---
id: taylor-remainder-and-error-bounds
title: Taylor Remainder and Error Bounds
field: Power and Taylor Series
summary: How wrong is a truncated Taylor polynomial? Lagrange's remainder answers it — and turns approximation from a hope into a guarantee.
tags: [series, approximation, error-analysis]
difficulty: 4
est_minutes: 45
prereqs: [taylor-and-maclaurin-series]
related: [alternating-series-and-absolute-convergence]
checks:
  - q: State the Lagrange form of the remainder and explain how it generalizes the Mean Value Theorem.
    a: R_N(x) = f^{(N+1)}(c)(x−a)^{N+1}/(N+1)! for some c between a and x. At N=0 it reduces to f(x) = f(a) + f'(c)(x−a), which is exactly the MVT.
  - q: Since c is unknown, how is the remainder formula usable at all?
    a: You bound it. Replace f^{(N+1)}(c) by M, the maximum of |f^{(N+1)}| on the interval between a and x, giving |R_N| ≤ M|x−a|^{N+1}/(N+1)!. The result is a guaranteed bound rather than the exact error.
  - q: Which two factors in the bound explain why Taylor approximation degrades away from the center?
    a: "|x−a|^{N+1} grows with distance from the center, and M is taken over a wider interval so it can only increase. The (N+1)! in the denominator is what fights back as you add terms."
  - q: When can you skip Lagrange entirely, and what do you use instead?
    a: When the series alternates with decreasing terms tending to zero — then the error is at most the first omitted term. That bound is far easier and usually tighter, and it covers sine, cosine, and arctangent.
---

# Taylor Remainder and Error Bounds

[[taylor-and-maclaurin-series]] left an unanswered question. If you truncate

$$
f(x) \approx T_N(x) = \sum_{n=0}^{N}\frac{f^{(n)}(a)}{n!}(x-a)^n
$$

how wrong is the answer? Without a bound, an approximation is a guess.

## Defining the remainder

$$
R_N(x) = f(x) - T_N(x)
$$

Then $f(x) = \sum \frac{f^{(n)}(a)}{n!}(x-a)^n$ holds **exactly when $R_N(x)\to 0$** as $N\to\infty$. That's the missing piece from the previous concept: convergence of the series is one thing, convergence *to $f$* is this.

## Lagrange's form

```formula
title: The Lagrange form of the remainder
tex: "R_N(x) = \\frac{f^{(N+1)}(c)}{(N+1)!}(x-a)^{N+1}"
symbols: [remainder, x-var, equals, f-fn, c-mean, factorial, bound-a]
reading: >-
  The error left after N terms equals the next derivative of f, evaluated at some
  unknown point c between a and x, divided by (N+1) factorial, times the distance
  from the centre raised to the N+1.
steps:
  - Compare this with a term of the Taylor series — it is the very next term, with one change.
  - "That change is c: the derivative is taken at some interior point, not at the centre a."
  - You are never told where c is. That is why the formula is used to bound the error, not to compute it.
  - Replace f at c by its largest possible value on the interval and the equality becomes a usable inequality.
notes:
  c-mean: The whole difficulty and the whole power. Because c is unknown you cannot evaluate this; because c is guaranteed to exist you can bound it.
  factorial: The term that wins. (N+1)! outgrows everything, which is why adding terms works — and why e^x, sin and cos equal their series everywhere.
  bound-a: The centre again. (x−a) growing is why an approximation degrades as you move away from where it was built.
why: >-
  Set N = 0 and this reads f(x) = f(a) + f′(c)(x−a) — the Mean Value Theorem.
  **Taylor's theorem is the MVT with more derivatives**, which is the fact that
  makes the formula hard to misremember: it is the next term of the series with
  the derivative evaluated somewhere you do not know.
```

Look at its shape: it is **the next term of the series**, with the derivative evaluated at some unknown interior point $c$ rather than at $a$. That's an appealingly tidy statement.


Check $N=0$:

$$
f(x) = f(a) + f'(c)(x-a)
$$

which is exactly the Mean Value Theorem. **Taylor's theorem is the MVT with more derivatives**, and knowing that makes the formula hard to misremember.

## Using it, given that c is unknown

You can't evaluate $f^{(N+1)}(c)$. You don't need to — you need an upper bound. Let

$$
M = \max\big|f^{(N+1)}(t)\big| \quad\text{for } t \text{ between } a \text{ and } x
$$

Then

$$
\boxed{\big|R_N(x)\big| \le \frac{M\,|x-a|^{N+1}}{(N+1)!}}
$$

**Worked: approximate $\sin(0.5)$ with $T_3$.**

Every derivative of sine is $\pm\sin$ or $\pm\cos$, so $M \le 1$ always — sine is the friendliest possible case.

$$
|R_3(0.5)| \le \frac{1\cdot(0.5)^4}{4!} = \frac{0.0625}{24} \approx 0.0026
$$

$T_3(0.5) = 0.5 - \frac{0.125}{6} \approx 0.479167$, and the true value is $0.479426$. Actual error $\approx 0.00026$ — ten times better than the bound. **The bound is a guarantee, not a prediction**; it uses the worst-case derivative, so it is normally pessimistic. That is the right trade: you want certainty, not sharpness.

## Reading the bound

$$
\frac{M\,|x-a|^{N+1}}{(N+1)!}
$$

Three forces:

- **$(N+1)!$ in the denominator** — grows faster than anything, which is why adding terms works so well. This is the term that drives $R_N\to0$ and proves $e^x$, $\sin x$, $\cos x$ equal their series for every $x$.
- **$|x-a|^{N+1}$** — grows with distance from the center. Approximations are excellent near $a$ and degrade fast away from it.
- **$M$** — taken over a wider interval as $|x-a|$ grows, so it too can only get worse.

The last two are why you re-center. To approximate $\sin(100)$, don't use the Maclaurin series at $x=100$; use periodicity to bring the argument near zero. Same series, vastly smaller error.

```viz
type: taylor
```

Pick **ln(1+x)** and push the degree up: inside the shaded radius the approximation tightens, outside it nothing helps. That is the bound's two geometric factors fighting each other.

## The shortcut you should prefer

For an **alternating** series with decreasing terms tending to zero, [[alternating-series-and-absolute-convergence]] already gives

$$
|R_N| \le b_{N+1} = \text{first omitted term}
$$

No derivatives, no maximization, and usually a tighter bound. Sine, cosine, and arctangent all alternate, so this covers most of what you'll be asked.

Redo the example: the next term after $T_3$ for sine is $\frac{x^5}{5!}$, so $|R_3(0.5)| \le \frac{(0.5)^5}{120} \approx 0.00026$ — matching the true error almost exactly, and far sharper than Lagrange gave.

**Check for alternation first.** Reach for Lagrange only when the series doesn't alternate (like $e^x$) or when you need a bound valid across a whole interval.

The same bound turns up far from any exam. An extended Kalman filter replaces a curved model by its first-order Taylor expansion at the current estimate, so the error it commits is exactly $R_1$ — second derivative times squared displacement from the linearisation point. Since that displacement is of order the filter's own uncertainty, the bound reads as *curvature × covariance*, and it predicts precisely when the approximation stops being safe. See [[extended-and-unscented-kalman-filters]].

## Which N do I need?

The usual exam question inverts the bound: given a target accuracy, find $N$.

$$
\frac{M|x-a|^{N+1}}{(N+1)!} < \varepsilon
$$

There's no clean algebraic solution — the factorial doesn't invert. **Increase $N$ until it's satisfied.** That's the intended method, not a failure to find the trick.

```python
from math import factorial

def terms_needed(x, eps, M=1.0):
    """Smallest N with the Lagrange bound M|x|^(N+1)/(N+1)! below eps."""
    N = 0
    while M * abs(x) ** (N + 1) / factorial(N + 1) >= eps:
        N += 1
    return N

terms_needed(0.5, 1e-6)   # 6  -- close to the centre, cheap
terms_needed(3.0, 1e-6)   # 15 -- same accuracy, far more work
```

The two calls are the error bound's distance factor, priced out.


:::check
State the Lagrange form of the remainder and explain how it generalizes the Mean Value Theorem.
:::

:::check
Since $c$ is unknown, how is the remainder formula usable at all?
:::

:::check
Which two factors in the bound explain why Taylor approximation degrades away from the center?
:::

:::check
When can you skip Lagrange entirely, and what do you use instead?
:::
