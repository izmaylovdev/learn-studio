---
id: u-substitution
title: u-Substitution
field: Integration Techniques
summary: The chain rule read backwards — and the technique every other integration method eventually reduces to.
tags: [integration, techniques]
difficulty: 2
est_minutes: 40
prereqs: [fundamental-theorem-of-calculus]
related: [integration-by-parts, trigonometric-integrals]
checks:
  - q: What structural feature must an integrand have for u-substitution to work, and why?
    a: It must contain a composite f(g(x)) together with a factor that is g'(x) up to a constant. That is exactly the output shape of the chain rule, so substitution can run it in reverse.
  - q: When you change variables in a definite integral, what are the two valid ways to finish, and which is safer?
    a: Either convert the limits to u-values and evaluate in u, or back-substitute to x and use the original limits. Converting the limits is safer — forgetting to back-substitute while keeping x-limits is the classic error.
  - q: Why does ∫ x·e^{x²} dx yield to substitution while ∫ e^{x²} dx does not?
    a: The first has the derivative of the inner function x² present as the factor 2x (up to a constant). The second has no such factor, and no substitution can manufacture one — that integral has no elementary antiderivative at all.
---

# u-Substitution

Every derivative rule, read backwards, becomes an integration technique. The chain rule gives you substitution; the product rule gives you [[integration-by-parts]]. Those two, plus algebra, are essentially all of Calculus 2's integration toolkit.

## The reversal

The chain rule says

$$
\frac{d}{dx}\,F(g(x)) = F'(g(x))\cdot g'(x)
$$

So if you ever see that shape on the right, you know where it came from:

```formula
title: Substitution, as a shape you recognise
tex: "\\int f(g(x))\\,g'(x)\\,dx = \\int f(u)\\,du"
symbols: [integral, f-fn, g-fn, prime, x-var, dx, equals, u-fn, du]
reading: The integral of f of g of x, times the derivative of g, equals the plain integral of f in the new variable u.
steps:
  - Look for a composite — some function wrapped around an inner one. That inner function is g.
  - Check that g′(x) is already sitting in the integrand, up to a constant multiple. If it is not, this method does not apply.
  - Rename u = g(x). Then du = g′(x) dx, and the g′(x) dx you found is consumed whole.
  - What is left is an integral in u with no trace of x. If any x survives, the substitution was the wrong one.
notes:
  u-fn: Here u is not a chosen factor as in integration by parts — it is the inner function, renamed. Same letter, different job.
  prime: This tick is the entire precondition. The derivative of the inside must already be present; you cannot manufacture it.
  du: Absorbs the dx along with g′(x). That is why the right-hand side has no x left to integrate against.
why: >-
  This is the chain rule read backwards, and the whole skill is **recognising the shape** rather than doing any calculus. One character decides everything: ∫x·e^(x²)dx takes five lines, and ∫e^(x²)dx has **no elementary antiderivative at all**.
```

Mechanically: set $u = g(x)$, so $du = g'(x)\,dx$, and the integral becomes $\int f(u)\,du$.

The whole skill is **recognizing the shape**: a composite function, together with (a constant multiple of) the derivative of its inside.

## Worked, with the reasoning visible

$$
\int x\,e^{x^2}\,dx
$$

The composite is $e^{x^2}$, inner function $x^2$, whose derivative is $2x$. The integrand has $x$ — off only by the constant 2, and constants are free.

$$
u = x^2 \ \Rightarrow\ du = 2x\,dx \ \Rightarrow\ x\,dx = \tfrac{1}{2}du
$$
$$
\int x e^{x^2}dx = \tfrac{1}{2}\int e^u\,du = \tfrac{1}{2}e^u + C = \tfrac{1}{2}e^{x^2} + C
$$

Now change one character:

$$
\int e^{x^2}dx
$$

There is no $x$ to absorb into $du$, and you cannot conjure one — multiplying and dividing by $x$ moves an $x$ into the wrong place. This integral has **no elementary antiderivative**. The difference between a five-line exercise and an impossible one is a single factor.

## Definite integrals: change the limits

$$
\int_0^2 x e^{x^2}dx
$$

With $u = x^2$: when $x=0$, $u=0$; when $x=2$, $u=4$.

$$
= \frac{1}{2}\int_0^4 e^u\,du = \frac{1}{2}(e^4 - 1)
$$

The alternative is to find the antiderivative in $x$ and use the original limits. Both are correct. **What is never correct is evaluating a $u$-expression at the $x$-limits** — writing $\frac{1}{2}e^{u}\big|_0^2$. That mistake accounts for a remarkable share of lost exam points, and converting the limits immediately makes it impossible.

## Choosing u

In rough order of what to try:

1. **The inside of a composite** — the exponent, the thing under the root, the argument of a trig or log function.
2. **The denominator**, when its derivative is sitting in the numerator. This gives $\int \frac{du}{u} = \ln|u| + C$, which is worth recognizing on sight.
3. **The messiest sub-expression**, when nothing else suggests itself.

The absolute value in $\ln|u|$ is not decoration. $\int \frac{dx}{x} = \ln|x| + C$ is valid on both sides of zero; dropping the bars gives an answer undefined exactly where half your problems live.

## Where it shows up later

Substitution rarely finishes a hard problem by itself, but it is the last step of almost every hard problem:

- [[trigonometric-integrals]] — use an identity to create a $u$ whose derivative is present.
- [[trigonometric-substitution]] — substitute $x = a\sin\theta$, then finish with an ordinary $u$-sub.
- [[partial-fractions]] — split into pieces, each of which is $\int \frac{du}{u}$ or an arctangent.
- [[integration-by-parts]] — the remaining integral $\int v\,du$ is usually a substitution.

If substitution is shaky, everything downstream is shaky. It is worth being fluent rather than merely capable.

The impossible case above has a famous relative. $\int e^{-x^2}dx$ also has no elementary antiderivative, which is why normal-distribution probabilities are read from tables rather than computed — see [[the-normal-distribution]].

:::check
What structural feature must an integrand have for u-substitution to work, and why?
:::

:::check
When you change variables in a definite integral, what are the two valid ways to finish, and which is safer?
:::

:::check
Why does $\int x e^{x^2}dx$ yield to substitution while $\int e^{x^2}dx$ does not?
:::
