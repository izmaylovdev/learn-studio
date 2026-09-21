---
id: conditioning-a-joint-gaussian
title: Conditioning a Joint Gaussian
field: Fusing Estimates
summary: How to learn about a quantity you cannot measure from one you can — and the peculiarity that makes the Kalman gain computable before any data arrives.
tags: [probability, gaussian, kalman, conditioning]
difficulty: 4
est_minutes: 50
prereqs: [fusing-gaussian-estimates, covariance-propagation]
related: [conditional-probability, joint-distributions-and-covariance, the-kalman-gain]
sources:
  - title: Bishop, Pattern Recognition and Machine Learning — §2.3.1
    url: https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/
  - title: The Matrix Cookbook — §8 (conditional Gaussians)
    url: https://www.math.uwaterloo.ca/~hwolkowi/matrixcookbook.pdf
checks:
  - q: >-
      Why can't the scalar fusion formula handle a measurement, and what does building a joint distribution fix?
    a: >-
      Scalar fusion combines two opinions about the same quantity. A measurement is a different quantity in a different space — a range in metres against a state of position and velocity — so there are no two densities over the same variable to multiply. Putting x and z in one joint Gaussian fixes this by making the relationship between them explicit in the cross-covariance, after which observing z is ordinary conditioning rather than fusion.
  - q: >-
      What is Σxz Σzz⁻¹ doing, and what is its one-dimensional form?
    a: >-
      It is a regression coefficient — the least-squares slope of x on z. It converts an offset in measurement space into the offset in state space it implies, by asking how strongly the two co-vary relative to how much z varies on its own. In one dimension it is ρ·σx/σz, and the units work out: it must carry metres of measurement into metres per second of state.
  - q: >-
      The conditional covariance does not depend on the value of z that was observed. Why is that remarkable, and what does a filter get from it?
    a: >-
      In general, learning a surprising value should leave you in a different epistemic state than learning an expected one — heteroscedastic models do exactly that. For Gaussians the reduction Σxz Σzz⁻¹ Σzx depends only on the covariances, never on the number observed. A filter gets to precompute its entire covariance and gain sequence from the model alone, before any data exists, which is how steady-state gains and offline tuning are possible at all.
  - q: >-
      If the cross-covariance between state and measurement is zero, what happens, and when does that occur in a real filter?
    a: >-
      Nothing happens — the conditional mean is the prior mean and the covariance is unchanged. The measurement is literally uninformative about that state. It occurs whenever a state component has no path to any sensor, which is the unobservable case: the corresponding gain entries are zero, the estimate coasts on the model alone, and its uncertainty grows without bound.
---

# Conditioning a Joint Gaussian

The scalar fusion in [[fusing-gaussian-estimates]] worked because both opinions were about **the same number**. Two thermometers, one temperature, two densities over the same axis — multiply and be done.

A filter is never in that situation. It believes something about a state — position and velocity, say — and what arrives is a range in metres from a single radar. Those are different quantities, in different spaces, with different dimensions. There is no pair of densities over a common variable to multiply, and the formula from the previous page simply does not apply.

So we need a different move. Not "combine two beliefs", but **"learn about one thing by observing another"**.

## Put them in the same distribution

The trick is to stop thinking of the measurement as external. Before the radar reports, the reading is itself a random quantity — you have beliefs about it, because you have beliefs about the state and you know what the radar does. So write down the joint distribution of the state and the not-yet-seen measurement:

$$
\begin{bmatrix} x \\ z \end{bmatrix} \sim
N\left(
\begin{bmatrix} \mu_x \\ \mu_z \end{bmatrix},
\begin{bmatrix} \Sigma_{xx} & \Sigma_{xz} \\ \Sigma_{zx} & \Sigma_{zz} \end{bmatrix}
\right)
$$

Now the measurement arriving is not a fusion problem at all. It is [[conditional-probability]] — slice the joint distribution at the observed value of $z$ and look at what is left over $x$.

For a general joint distribution that slice could be any shape at all. For a Gaussian it is another Gaussian, and both of its parameters are available in closed form. That closure is the whole reason this subject has clean equations.

## The conditional mean

```formula
title: The conditional mean of a joint Gaussian
tex: 'E[x \mid z] \;=\; \mu_x \;+\; \Sigma_{xz}\,\Sigma_{zz}^{-1}\,(z - \mu_z)'
symbols: [expect-E, x-state, given, z-meas, equals, mu-mean, Sigma-cov, plus, minus]
reading: Given the measurement, the expected state is the state you expected anyway, corrected by how far the measurement came in from what you expected, converted into state units.
steps:
  - Start at μx — what you believed before the reading existed.
  - The bracket is the surprise, measured in the measurement's own space and units.
  - Σzz⁻¹ divides that surprise by how much z was going to vary anyway, turning metres into standard deviations.
  - Σxz then converts standard deviations of z into the state offset they imply, using how strongly the two co-vary.
  - Add the correction. If the reading came in exactly as expected, the bracket is zero and your belief does not move.
notes:
  given: This bar is doing the real work. Nothing about x has changed — what changed is the set of possibilities being averaged over, now cut down to those consistent with the observed z.
  Sigma-cov: It appears twice in different roles. Σzz⁻¹ normalises the surprise; Σxz carries it across into state space. Their product is a regression coefficient, ρσx/σz in one dimension.
  minus: The innovation. It is the only place the observed number enters the formula at all — everything else was known before the radar reported.
  z-meas: Lives in measurement space, which is usually much smaller than state space. That size difference is why the inverse here is affordable.
why: >-
  This is the Kalman update before it is dressed in H and R. Everything characteristic of the filter is already visible: a **correction proportional to a surprise**, with the constant of proportionality decided entirely by covariances. And the correction reaches components of x that were never measured — it flows through Σxz, which is the channel that [[covariance-propagation]] manufactured.
```

The matching covariance is

$$
\operatorname{Cov}(x \mid z) = \Sigma_{xx} - \Sigma_{xz}\Sigma_{zz}^{-1}\Sigma_{zx}
$$

and the subtracted term is a sandwich, so it is positive semi-definite. Conditioning can therefore only shrink the ellipse, never grow it — the matrix statement of "measurements never make a filter less certain".

## The peculiarity worth stopping on

Look at that covariance again. **The observed value of $z$ does not appear in it.**

This deserves more surprise than it usually gets. In general, learning a shocking value ought to leave you in a different state of knowledge than learning an expected one. Plenty of real models behave that way: in a heteroscedastic model the residual spread depends on where you are. For jointly Gaussian variables it simply does not. The reduction in uncertainty is fixed by the covariance structure, decided before any data existed.

Three consequences, all of them practical:

- A filter's entire covariance sequence $P_0, P_1, P_2, \dots$ can be computed **offline**, from the model alone.
- So can the gain sequence, which is why a filter can ship with a precomputed constant gain and no matrix inverse at run time.
- And "how accurate will this filter be?" is answerable at design time, before the hardware exists. That is why this apparatus is used for planning sensor suites, not only for processing their output.

It is also a warning. That covariance is a claim derived from assumptions, not a measurement of actual performance. It will keep shrinking on schedule whether or not the filter is tracking anything at all. [[filter-consistency-and-divergence]] is about the test that catches this.

## Correlation is the only channel

If $\Sigma_{xz} = 0$, both formulas collapse: the mean stays at $\mu_x$ and the covariance stays at $\Sigma_{xx}$. The measurement teaches nothing.

That is the right answer and it is worth stating as a rule. **Information flows to a state component only through its covariance with the measurement.** A state with no covariance path to any sensor is unobservable, its estimate coasts on the model, and its uncertainty grows forever. [[observability-and-what-a-filter-can-know]] turns that into a test you can run on $F$ and $H$ before writing any code.

## Consistency with the scalar case

Set $z = x + v$ — the measurement *is* the quantity, plus independent noise. Then $\Sigma_{xz} = \sigma_x^2$ and $\Sigma_{zz} = \sigma_x^2 + \sigma_v^2$, so the coefficient becomes

$$
\frac{\sigma_x^2}{\sigma_x^2 + \sigma_v^2}
$$

which is exactly the gain from the previous page. The two derivations are the same derivation; this one just does not require the two quantities to live in the same space.

## Failure modes

- **Marginally Gaussian is not jointly Gaussian.** Each of $x$ and $z$ can be perfectly normal while their joint distribution is not, and then the conditional is not Gaussian and these formulas are simply wrong. Joint normality is an assumption about the pair.
- **Singular $\Sigma_{zz}$.** Two sensors reporting the identical quantity with no independent noise make the measurement covariance non-invertible. The symptom is a gain that explodes; the cause is a redundant measurement.
- **Nonlinear relationships.** Conditioning on $z$ when $z$ depends on $x$ through a curve, not a line, leaves a non-Gaussian posterior that these two moments describe badly — see [[extended-and-unscented-kalman-filters]].
- **Reading the conditional covariance as performance.** It is what the model implies, not what the filter achieved. Those diverge silently and often.

:::check
Why can't the scalar fusion formula handle a measurement, and what does building a joint distribution fix?
:::

:::check
What is Σxz Σzz⁻¹ doing, and what is its one-dimensional form?
:::

:::check
The conditional covariance does not depend on the value of z that was observed. Why is that remarkable, and what does a filter get from it?
:::

:::check
If the cross-covariance between state and measurement is zero, what happens, and when does that occur in a real filter?
:::
