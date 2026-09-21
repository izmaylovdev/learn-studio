---
id: gaussian-random-vectors
title: Gaussian Random Vectors
field: Vectors and Covariance
summary: Why a single variance cannot describe a position estimate, and what the covariance matrix adds — an ellipse, a direction of ignorance, and correlations the filter exploits.
tags: [probability, gaussian, kalman]
difficulty: 3
est_minutes: 45
prereqs: [the-normal-distribution, matrix-algebra-for-estimation]
related: [joint-distributions-and-covariance, covariance-propagation]
sources:
  - title: Bishop, Pattern Recognition and Machine Learning — §2.3
    url: https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/
checks:
  - q: >-
      A GPS fix is quoted as "±5 m". What can a covariance matrix say that this number cannot?
    a: >-
      That the error is not the same in every direction. A receiver with satellites low on one horizon is sharp across one axis and vague along another, and the covariance's off-diagonal entry says the two errors are coupled — an error east comes with an error north. "±5 m" collapses an ellipse to a circle, which throws away both the shape and the correlation, and it is the correlation the filter later uses to infer velocity it never measured.
  - q: >-
      Why is the quadratic form in the exponent a squared distance, and what units is it measured in?
    a: >-
      (x−μ)ᵀΣ⁻¹(x−μ) is the Mahalanobis distance squared. Σ⁻¹ rescales each direction by its own variance, so the result is measured in standard deviations rather than metres — it is the multi-dimensional version of the z-score. Level sets of constant distance are the uncertainty ellipses.
  - q: >-
      For Gaussians, zero correlation implies independence — but for general random variables it does not. Why is the Gaussian special?
    a: >-
      Because a joint Gaussian is completely determined by its mean and covariance, so if the covariance is diagonal there is no remaining freedom for a dependence to hide in — the density factors into a product of one-dimensional ones. A general joint distribution has structure the covariance does not capture, which is how uncorrelated-but-dependent pairs exist.
  - q: >-
      What does it mean geometrically for a covariance matrix to have a very small eigenvalue, and why is that dangerous in a filter?
    a: >-
      The uncertainty ellipse is squashed nearly flat along that eigenvector — the filter is claiming it knows that one combination of states almost exactly. It is dangerous because it makes the filter nearly deaf along that direction: the gain for any measurement informing it goes to zero, so an error there can never be corrected. That is the geometry of filter divergence.
---

# Gaussian Random Vectors

Your phone says the position fix is accurate to ±5 metres. Picture that as a circle of radius five.

The picture is wrong, and it is wrong in a way that matters. If the visible satellites are clustered low on one horizon, the receiver pins down one direction well and the perpendicular one badly. The true region is an **ellipse**, sometimes a very long thin one. And the ellipse is usually tilted, which means something stranger still: knowing that you are further east than you thought tells you something about how far north you are.

A single variance cannot say any of this. What can is a matrix.

## From a number to a matrix

For one variable, the whole distribution is two numbers, $\mu$ and $\sigma^2$. For a vector of $n$ components, the mean is still just a vector — one number per component. The spread needs more.

The natural move is to ask the covariance question for every *pair*:

$$
\Sigma_{ij} = \operatorname{Cov}(x_i, x_j) = E\big[(x_i - \mu_i)(x_j - \mu_j)\big]
$$

Stack those into a grid. The diagonal holds the ordinary variances — $\Sigma_{ii} = \operatorname{Var}(x_i)$ — and the off-diagonal entries hold [[joint-distributions-and-covariance]]'s coupling terms. Compactly:

$$
\Sigma = E\big[(x - \mu)(x - \mu)^\top\big]
$$

which is the sandwich from [[matrix-algebra-for-estimation]] with $A$ absent: a column times a row is a matrix, and that is where the grid comes from.

## The density, and why the exponent is a distance

In one dimension the normal density has $e^{-(x-\mu)^2/2\sigma^2}$ in it: the squared distance from the mean, measured in standard deviations. The multi-dimensional version says exactly the same thing, with $\Sigma^{-1}$ doing the rescaling that $1/\sigma^2$ did:

```formula
title: The multivariate normal density
tex: 'f(x) \;=\; \frac{1}{\sqrt{(2\pi)^n \det \Sigma}}\; e^{-\frac{1}{2}(x-\mu)^\top \Sigma^{-1} (x-\mu)}'
symbols: [density-f, frac-bar, radical, pi-const, n-index, det-op, Sigma-cov, e-const, mu-mean, transpose]
reading: The density at a point x falls off exponentially in the squared distance from the mean, where distance is measured in units of the spread, and the fraction in front is whatever makes the whole thing integrate to one.
steps:
  - Start in the exponent — everything that carries meaning is there.
  - x − μ is the displacement from the centre, a vector.
  - Sandwiching it around Σ⁻¹ turns that vector into one number, the squared distance in units of standard deviation.
  - The minus sign and the exponential turn distance into a bump that decays: near the centre it is close to 1, far away it is close to 0.
  - Everything in front of the e is bookkeeping — the constant that makes the bump's total volume equal 1.
notes:
  det-op: The volume of the uncertainty ellipsoid. A wider distribution is a lower peak, and this is the term that does the trading.
  Sigma-cov: Inverted here, which is the whole point — dividing by the spread is what makes the exponent unitless. In one dimension Σ⁻¹ is just 1/σ².
  transpose: The pairing that turns a displacement into a squared length. It is why the exponent is a number and not a vector.
  n-index: The number of state components. The 2π appears once per dimension, because an n-dimensional Gaussian is a product of n one-dimensional ones once you rotate into its own axes.
why: >-
  The messy normalising constant is why people avoid this formula, and it is the part that never matters. What matters is that the exponent is a **squared distance measured in standard deviations** — the Mahalanobis distance. That is the multi-dimensional z-score, and it is what a filter uses to decide whether a measurement is a plausible surprise or an outlier to be thrown away.
```

Setting that exponent to a constant traces out the ellipses. The one-sigma ellipse — Mahalanobis distance 1 — is the standard way to draw a filter's belief, and in two dimensions it contains about **39%** of the probability, not 68%. The one-dimensional intuition does not survive the move to more dimensions, which is a good thing to be surprised by once rather than repeatedly.

```viz
type: distribution
```

## Reading the ellipse

The eigenvectors of $\Sigma$ are the ellipse's axes, and the square roots of its eigenvalues $\lambda$ are the semi-axis lengths. Three cases are worth being able to sketch from the matrix alone:

| $\Sigma$ | Picture | Meaning |
|---|---|---|
| $\begin{bmatrix} 4 & 0 \\ 0 & 4\end{bmatrix}$ | circle, radius 2 | equally uncertain in every direction, no coupling |
| $\begin{bmatrix} 9 & 0 \\ 0 & 1\end{bmatrix}$ | axis-aligned, wide | sharp in $y$, vague in $x$, errors unrelated |
| $\begin{bmatrix} 4 & 3 \\ 3 & 4\end{bmatrix}$ | tilted 45° | an error in $x$ comes with one in $y$ |

That third case is the one that earns the whole apparatus. The filter will exploit exactly this: a tracker that measures only position builds up a correlation between its position error and its velocity error, and then a single position measurement corrects the velocity it never observed. Delete the off-diagonal entries and that inference is gone.

## Two properties that do all the work

**Linear maps preserve Gaussianity.** If $x$ is Gaussian, so is $Ax$ — with mean $A\mu$ and covariance $A\Sigma A^\top$. [[covariance-propagation]] is this sentence and its consequences.

**Conditioning preserves Gaussianity.** If $x$ and $z$ are jointly Gaussian, then $x$ given an observed $z$ is again Gaussian, with a mean and covariance you can write down. [[conditioning-a-joint-gaussian]] is that one.

Those two closure properties are the entire reason the Kalman filter exists. The filter does exactly two things — push the belief forward through a linear map, and condition it on a measurement — and the Gaussian is the one family where both operations land you back in the family, describable by the same two numbers you started with. For any other distribution, "predict then update" grows the description without bound, and you are into particle filters.

## Where the assumption is doing real work

Zero correlation implies independence **for Gaussians** and not in general. The reason is not deep: a joint Gaussian is fully determined by $\mu$ and $\Sigma$, so a diagonal $\Sigma$ leaves no room for a dependence to hide in, and the density factors. A general joint distribution carries structure the covariance never sees — which is why [[joint-distributions-and-covariance]] can build uncorrelated but dependent pairs.

So when a filter treats two noise sources as independent because you wrote a diagonal $Q$, it is relying on the Gaussian assumption to make that stick. If the real noise is heavy-tailed, an outlier five sigma out is not the once-in-a-million event the model thinks it is, and the filter will swallow it.

## Failure modes

- **Quoting one number for a multi-dimensional error.** "±5 m" is an average over directions, and averaging over directions is the thing you must not do.
- **Assuming the one-sigma ellipse holds 68% of the mass.** It holds 39% in two dimensions, 20% in three. For a 95% region in 2-D you need about 2.45σ, not 1.96.
- **Near-singular covariance.** A tiny eigenvalue means an almost-flat ellipse: the filter believes it knows one combination of states exactly, and will refuse to be corrected along it.
- **Trusting the tails.** The Gaussian's tails are extraordinarily thin. Real sensors produce occasional wild readings, and a filter that believes the density literally will accept one as a genuine surprise and lurch.

:::check
A GPS fix is quoted as "±5 m". What can a covariance matrix say that this number cannot?
:::

:::check
Why is the quadratic form in the exponent a squared distance, and what units is it measured in?
:::

:::check
For Gaussians, zero correlation implies independence — but for general random variables it does not. Why is the Gaussian special?
:::

:::check
What does it mean geometrically for a covariance matrix to have a very small eigenvalue, and why is that dangerous in a filter?
:::
