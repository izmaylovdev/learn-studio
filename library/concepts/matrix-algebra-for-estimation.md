---
id: matrix-algebra-for-estimation
title: Matrix Algebra for Estimation
field: Vectors and Covariance
summary: The five facts about matrices a filter actually uses — and why covariance always arrives sandwiched between a matrix and its transpose.
tags: [linear-algebra, estimation, kalman]
difficulty: 2
est_minutes: 40
prereqs: []
related: [gaussian-random-vectors, covariance-propagation]
sources:
  - title: Strang, Introduction to Linear Algebra — Ch. 1-2
    url: https://math.mit.edu/~gs/linearalgebra/
  - title: The Matrix Cookbook
    url: https://www.math.uwaterloo.ca/~hwolkowi/matrixcookbook.pdf
checks:
  - q: >-
      Why is Ax better read as "a combination of the columns of A" than as "rows times x"?
    a: >-
      Because the columns are where the input basis vectors land. Ax = x₁a₁ + x₂a₂ + … says the output is built by mixing fixed ingredients in proportions given by x, which makes rank, span and the meaning of a zero column immediate. The row-dot-product rule is the same arithmetic, but it tells you how to compute rather than what is happening.
  - q: >-
      Why does every covariance formula have the shape AΣAᵀ rather than AΣ?
    a: >-
      Covariance is quadratic — it is built from products of two deviations, so each deviation gets hit by A once. Written out, Cov(Ax) = E[A(x−μ)(x−μ)ᵀAᵀ] = A Σ Aᵀ. The lone transpose comes from the second factor being a row rather than a column, and AΣ would not even be symmetric, let alone a covariance.
  - q: >-
      What does it mean for a covariance matrix to be positive semi-definite, and what goes wrong if arithmetic makes it stop being so?
    a: >-
      It means aᵀΣa ≥ 0 for every direction a — the variance along any direction is non-negative, which is forced because that quadratic form is Var(aᵀx). If round-off makes it indefinite, the filter is claiming negative variance somewhere: its uncertainty ellipse has an imaginary axis, a Cholesky factorisation fails, and the gain computed from it is meaningless.
  - q: >-
      Why should you solve a linear system rather than form an inverse, and where does a Kalman filter still form one anyway?
    a: >-
      Solving is cheaper and far better conditioned — forming A⁻¹ and multiplying amplifies round-off in a way that a direct solve avoids. A filter still inverts the innovation covariance S, but S has the dimension of the *measurement*, which is usually small (often 1×1), so the cost and the conditioning are both tolerable.
---

# Matrix Algebra for Estimation

Most people leave a first linear algebra course able to multiply matrices and unable to say what the multiplication *is*. That is a fine outcome for passing exams and a bad one for building a filter, because every equation in the rest of this track is a sentence about linear maps, and reading them as grids of numbers means reading them as noise.

There are exactly five things the filter needs. This page is the whole of them.

## 1. A matrix is a machine, and its columns say what it does

Take the constant-velocity model. The state is position and velocity stacked into one column:

$$
x = \begin{bmatrix} p \\ v \end{bmatrix}
$$

and one time step of $\Delta t$ moves it to $p + v\,\Delta t$ with $v$ unchanged. Write that as a matrix:

$$
F = \begin{bmatrix} 1 & \Delta t \\ 0 & 1 \end{bmatrix}
$$

Now the useful question. What is $Fx$?

The rule you were taught says: dot each row with $x$. That gives the right answer and explains nothing. The better reading is to look at the **columns**:

$$
Fx \;=\; p \begin{bmatrix} 1 \\ 0 \end{bmatrix} \;+\; v \begin{bmatrix} \Delta t \\ 1 \end{bmatrix}
$$

Column one says *what a unit of position becomes*: still a unit of position, contributing nothing to velocity. Column two says *what a unit of velocity becomes*: it contributes $\Delta t$ of position and preserves itself. The output is those two ingredients mixed in the proportions $x$ specifies.

Read this way, several things stop being facts to memorise. A zero column means that input is destroyed. The number of independent columns is the rank — the number of genuinely distinct directions the map can reach. And the physics of your model is now *visible*: the $\Delta t$ in the top right is the only place velocity is allowed to affect position, and the $0$ in the bottom left is a flat claim that position does not affect velocity. Both are modelling decisions, and both are wrong for a car going round a corner.

## 2. Multiplication is composition, which is why order matters

$AB$ means "do $B$, then do $A$". That single sentence explains the whole strange multiplication rule, and it explains why $AB \ne BA$: rotating then stretching is not stretching then rotating.

It also explains the dimension rule without memorisation. $B$ takes something of size $n$ and produces something of size $m$; $A$ must therefore accept size $m$. The inner dimensions match because the output of one is the input of the other.

In a filter this shows up as $F^k$ — applying the physics $k$ times — and as $HF$, which means "step forward, then observe". $FH$ is not a typo for that; it is nonsense, because $H$'s output lives in measurement space and $F$ expects a state.

## 3. Transpose, and why covariance comes in a sandwich

Transposing flips a matrix across its diagonal. Two facts carry all the weight:

$$
(AB)^\top = B^\top A^\top \qquad\text{and}\qquad (A^\top)^\top = A
$$

The reversal in the first one is not a quirk. If $B$ maps in and $A$ maps out, then the transposes map the other way, so their composition has to run in the other order.

Here is where it actually bites. Suppose you know the covariance $\Sigma$ of a random vector $x$ and you want the covariance of $Ax$. Covariance is built from *products of two deviations*, so each deviation gets multiplied by $A$ — once on the left, and once on what has become a row:

$$
\operatorname{Cov}(Ax) = E\big[A(x-\mu)(x-\mu)^\top A^\top\big] = A\,\Sigma\,A^\top
$$

That sandwich shape is the single most recognisable pattern in the whole subject. Every covariance line in a Kalman filter has it, and a covariance formula with an unpaired transpose is almost certainly a bug — the result would not even be square. [[covariance-propagation]] does nothing but work out the consequences.

## 4. A covariance matrix is symmetric and positive semi-definite

Symmetric is easy: $\Sigma_{ij}$ and $\Sigma_{ji}$ both mean "how do components $i$ and $j$ vary together", and that question has one answer.

The second property is the one worth deriving rather than stating. Pick any direction $a$ and ask for the variance of the system *along* that direction — that is, the variance of the scalar $a^\top x$. By the sandwich, it is $a^\top \Sigma a$. And a variance cannot be negative. So:

```formula
title: Every covariance matrix is positive semi-definite
tex: 'a^\top \Sigma\, a \;\ge\; 0 \quad \text{for every } a'
symbols: [a-direction, transpose, Sigma-cov, ge, zero-const]
reading: For any direction you pick, sandwiching the covariance matrix between that direction and its transpose gives a number that is never negative.
steps:
  - Pick any direction a — a list of weights, one per state component.
  - The scalar aᵀx is the system measured along that direction: so much position plus so much velocity.
  - Its variance, by the sandwich rule, is aᵀΣa.
  - Variance is an average of squares, so it cannot be negative. The inequality is forced, not assumed.
notes:
  a-direction: >-
    Not the state and not data — any direction you care to name. The claim is
    quantified over all of them, which is what makes it a property of Σ rather
    than of some particular question.
  transpose: This is what turns the sandwich into a single number rather than a matrix. Without it the expression would not even be defined.
  Sigma-cov: Any matrix failing this test is not a covariance matrix, whatever you are calling it. That is a usable test, not a definition.
  zero-const: Equality is allowed, and means something concrete — there is a direction along which the state has no spread at all, because it is determined exactly by the others.
why: >-
  This is the **health check** for a filter. Round-off in the covariance update can quietly make P indefinite, and the moment it does, the filter is claiming that the variance along some direction is **negative**. Nothing downstream complains: the Cholesky factorisation fails, or worse, doesn't, and the gain comes out meaningless. Most of the engineering in a production filter — Joseph form, square-root filters, forced re-symmetrisation — exists to protect this one inequality.
```

Geometrically, $\Sigma$ is an ellipse. Its eigenvectors are the axes; the square roots of its eigenvalues $\lambda$ are the semi-axis lengths. A near-zero eigenvalue means an ellipse squashed to a line — the filter claiming it knows one combination of states exactly.

## 5. Inverses, and why you should avoid them

$A^{-1}$ undoes $A$, and exists only when $A$ destroys nothing — when the columns are independent.

The practical advice is blunter than the theory: **do not form inverses.** Solving $Ax = b$ directly is cheaper and much better conditioned than computing $A^{-1}$ and multiplying. Numerical libraries provide a solve for exactly this reason.

The Kalman filter breaks this rule once, and it is worth knowing why it gets away with it. The gain contains $S^{-1}$, where $S$ is the *innovation* covariance — its size is the number of measurements, not the number of states. For a filter tracking twelve states from a single scalar sensor, that inverse is a division by one number. When the measurement is genuinely high-dimensional, the usual fix is to feed the components in one at a time, which replaces one large inverse with several scalar ones.

## The failure modes

- **Losing symmetry.** $P$ should stay symmetric, and in floating point it drifts. A cheap and standard patch is $P \leftarrow \tfrac{1}{2}(P + P^\top)$ after every update.
- **Losing positive-definiteness.** Worse, because it can happen while symmetry survives. This is the reason for the Joseph form in [[the-kalman-filter-loop]].
- **Conditioning.** If one state is measured in metres and another in nanoseconds, the entries of $P$ differ by twenty orders of magnitude and the inverse is garbage. The fix is to rescale the state, not to use more precision.
- **Silent dimension errors.** $HF$ and $FH$ both compile in a language with dynamic shapes and only one of them means anything.

:::check
Why is Ax better read as "a combination of the columns of A" than as "rows times x"?
:::

:::check
Why does every covariance formula have the shape AΣAᵀ rather than AΣ?
:::

:::check
What does it mean for a covariance matrix to be positive semi-definite, and what goes wrong if arithmetic makes it stop being so?
:::

:::check
Why should you solve a linear system rather than form an inverse, and where does a Kalman filter still form one anyway?
:::
