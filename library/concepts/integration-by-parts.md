---
id: integration-by-parts
title: Integration by Parts
summary: The product rule reversed — trade the integral you can't do for one you can, and know when the trade is going backwards.
tags: [integration, techniques]
difficulty: 3
est_minutes: 45
prereqs: [u-substitution]
related: [trigonometric-integrals, taylor-and-maclaurin-series]
sources:
  - title: OpenStax Calculus Volume 2 — §3.1
    url: https://openstax.org/details/books/calculus-volume-2
checks:
  - q: Integration by parts is the reverse of which derivative rule, and how does the formula follow from it?
    a: The product rule. Integrating (uv)' = u'v + uv' gives uv = ∫u'v + ∫uv', and rearranging gives ∫u dv = uv − ∫v du.
  - q: What is the criterion for a good choice of u, and what does LIATE encode?
    a: u should get simpler when differentiated and dv should be something you can antidifferentiate. LIATE (log, inverse trig, algebraic, trig, exponential) orders function types by how much they improve under differentiation.
  - q: For ∫ e^x sin x dx, parts never terminates. What makes the method still work?
    a: Applying parts twice reproduces the original integral I on the right-hand side, giving an equation like I = (stuff) − I. Solving algebraically for I finishes it — you never actually antidifferentiate directly.
  - q: Why is ∫ ln x dx a parts problem when there is visibly no product?
    a: Take u = ln x and dv = dx. The "product" is with 1. Differentiating ln x gives 1/x, which is algebraic and integrable, so the trade is a strict improvement.
---

# Integration by Parts

[[u-substitution]] reverses the chain rule. Integration by parts reverses the **product rule**, and between them they cover most of what is doable.

## Deriving it takes one line

$$
\frac{d}{dx}(uv) = u'v + uv'
$$

Integrate both sides:

$$
uv = \int u'v\,dx + \int uv'\,dx
$$

Rearrange, and write $du = u'dx$, $dv = v'dx$:

```formula
title: Integration by parts
tex: '\int u\,dv = uv - \int v\,du'
symbols: [integral, u-fn, dv, equals, v-fn, minus, du]
reading: The integral of u against dv equals the product uv, minus the integral of v against du.
steps:
  - Split the integrand in two — one piece is u, everything left over including the dx is dv.
  - Differentiate u to get du; antidifferentiate dv to get v. That is the only calculus in the method.
  - uv comes for free. No integration is involved in that term at all.
  - What remains, the integral of v du, is your new problem. The whole method is a bet that it is easier than the one you started with.
notes:
  equals: Not a simplification — a trade. Both sides are equally true; only the right-hand one might be easier to compute.
  dv: Carries the dx. Whatever you call dv must include it, or v comes out wrong and nothing downstream works.
  du: Costs you a derivative, while v costs you an integral. That asymmetry is the whole reason the method has a right and a wrong choice of u.
why: Read this as a **trade, not a solution**. You are swapping one integral for another, and it is only progress if the new one is easier. Choosing u badly trades **downhill** and leaves you worse off than when you started — which is exactly what LIATE below is for.
```

You are not evaluating anything. You are **trading** $\int u\,dv$ for $\int v\,du$. The method works exactly when the new integral is easier than the old one, and it is perfectly possible to trade downhill.

## Choosing u — LIATE

Pick $u$ to be whatever comes first in this list:

| | Type | Example | Why it's high priority |
|---|---|---|---|
| **L** | Logarithmic | $\ln x$ | derivative $1/x$ is a huge simplification |
| **I** | Inverse trig | $\arctan x$ | derivative is algebraic |
| **A** | Algebraic | $x^2$ | degree drops by one |
| **T** | Trigonometric | $\sin x$ | cycles, no simpler |
| **E** | Exponential | $e^x$ | never simplifies, but always integrates |

The rule behind the mnemonic: **$u$ should improve when differentiated, and $dv$ must be something you can actually antidifferentiate.** LIATE is a heuristic that usually satisfies both, not a theorem.

## Three patterns worth recognizing on sight

**1. Polynomial times exponential or trig — repeat until the polynomial dies.**

$$
\int x^2 e^x dx
$$

Each application drops the degree by one, so three passes finish it. For these, the tabular method is faster: differentiate $x^2$ down to zero in one column, antidifferentiate $e^x$ in the other, and multiply along diagonals with alternating signs.

$$
\int x^2 e^x dx = x^2 e^x - 2x e^x + 2e^x + C
$$

**2. A lone function that isn't a product.**

$$
\int \ln x\,dx
$$

There's no visible product, so manufacture one with $dv = dx$:

$$
u = \ln x,\ dv = dx \ \Rightarrow\ du = \tfrac{1}{x}dx,\ v = x
$$
$$
\int \ln x\,dx = x\ln x - \int x\cdot\tfrac{1}{x}dx = x\ln x - x + C
$$

Same trick handles $\int \arctan x\,dx$ and $\int \arcsin x\,dx$.

**3. The circular case — solve for the integral.**

$$
I = \int e^x \sin x\,dx
$$

Parts once gives $\int e^x\cos x\,dx$; parts again gives back $-I$. Nothing simplified — but now you have an *equation*:

$$
I = e^x\sin x - e^x\cos x - I \ \Longrightarrow\ 2I = e^x(\sin x - \cos x) \ \Longrightarrow\ I = \frac{e^x(\sin x - \cos x)}{2} + C
$$

Two requirements people miss: you must be **consistent** in the second application (if you took $u$ trigonometric the first time, take it trigonometric again — switching just undoes your work and returns $I = I$), and the $+C$ appears only after dividing.

## Definite integrals

$$
\int_a^b u\,dv = \Big[uv\Big]_a^b - \int_a^b v\,du
$$

The boundary term gets evaluated at the limits. Forgetting to evaluate it — carrying $uv$ along as if it were still an antiderivative — is the standard slip here.

## Where it comes back

Integration by parts is how the recursion in reduction formulas gets built, and it is the engine behind the integral form of the Taylor remainder in [[taylor-remainder-and-error-bounds]]. It also shows up constantly inside [[trigonometric-integrals]] once the identities have been applied.

:::check
Integration by parts is the reverse of which derivative rule, and how does the formula follow from it?
:::

:::check
What is the criterion for a good choice of $u$, and what does LIATE encode?
:::

:::check
For $\int e^x \sin x\,dx$, parts never terminates. What makes the method still work?
:::

:::check
Why is $\int \ln x\,dx$ a parts problem when there is visibly no product?
:::
