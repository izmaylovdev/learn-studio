---
id: taylor-remainder-and-error-bounds
title: Taylor Remainder and Error Bounds
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

$$
R_N(x) = \frac{f^{(N+1)}(c)}{(N+1)!}(x-a)^{N+1} \qquad \text{for some } c \text{ between } a \text{ and } x
$$

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

## The shortcut you should prefer

For an **alternating** series with decreasing terms tending to zero, [[alternating-series-and-absolute-convergence]] already gives

$$
|R_N| \le b_{N+1} = \text{first omitted term}
$$

No derivatives, no maximization, and usually a tighter bound. Sine, cosine, and arctangent all alternate, so this covers most of what you'll be asked.

Redo the example: the next term after $T_3$ for sine is $\frac{x^5}{5!}$, so $|R_3(0.5)| \le \frac{(0.5)^5}{120} \approx 0.00026$ — matching the true error almost exactly, and far sharper than Lagrange gave.

**Check for alternation first.** Reach for Lagrange only when the series doesn't alternate (like $e^x$) or when you need a bound valid across a whole interval.

## Which N do I need?

The usual exam question inverts the bound: given a target accuracy, find $N$.

$$
\frac{M|x-a|^{N+1}}{(N+1)!} < \varepsilon
$$

There's no clean algebraic solution — the factorial doesn't invert. **Increase $N$ until it's satisfied.** That's the intended method, not a failure to find the trick.

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
