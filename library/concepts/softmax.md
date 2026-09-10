---
id: softmax
title: Softmax
summary: Turns an arbitrary vector of scores into a probability distribution — differentiably, and with a temperature knob.
tags: [math, probability, foundations]
difficulty: 2
est_minutes: 30
prereqs: []
related: [attention-scaled-dot-product]
sources:
  - title: Goodfellow et al., Deep Learning — §6.2.2
    url: https://www.deeplearningbook.org/contents/mlp.html
---

# Softmax

Softmax takes a vector of real-valued scores (**logits**) and returns a vector that sums to 1:

$$\text{softmax}(z)_i = \frac{e^{z_i}}{\sum_j e^{z_j}}$$

## Three properties worth memorizing

1. **It's shift-invariant.** `softmax(z) == softmax(z - c)` for any constant `c`. This is not a curiosity — it is how you avoid overflow, by subtracting `max(z)` before exponentiating.
2. **It's differentiable everywhere.** Unlike `argmax`, which has zero gradient almost everywhere. That's the entire reason it exists: it's a *soft* argmax you can train through with [[backpropagation]].
3. **It's scale-sensitive.** Multiplying logits by a constant is not neutral — it sharpens or flattens the output. That constant is *temperature*.

## Temperature

$$\text{softmax}(z / T)$$

- `T → 0` — approaches a one-hot vector at the argmax. Confident, deterministic.
- `T = 1` — the plain softmax.
- `T → ∞` — approaches the uniform distribution. Maximally hedged.

This is the same temperature you set when sampling from an LLM, and it is why the scaling factor in [[attention-scaled-dot-product]] is not cosmetic: dividing scores by `√d_k` is a temperature choice that keeps the attention distribution from collapsing into one-hot.

```python
import numpy as np
def softmax(z, T=1.0):
    z = np.asarray(z, dtype=float) / T
    z = z - z.max()              # shift-invariance, for numerical stability
    e = np.exp(z)
    return e / e.sum()

softmax([2., 1., 0.])           # [0.665, 0.245, 0.090]
softmax([2., 1., 0.], T=0.25)   # [0.982, 0.018, 0.000] — nearly one-hot
softmax([20., 10., 0.])         # [1.000, 0.000, 0.000] — saturated
```

## The saturation failure mode

Look at that last line. Once logit *gaps* grow past ~10, softmax is numerically one-hot and its gradient vanishes: `∂softmax/∂z ≈ 0`. Training stalls. Every mitigation you'll meet — scaling by `√d_k`, [[layer-norm-residuals]], careful initialization — exists to keep logits in a range where softmax still has a usable gradient.

:::check
Why subtract `max(z)` before exponentiating, and why is that mathematically free?
:::

:::check
Attention scores are divided by `√d_k` before the softmax. Framed as temperature, what would go wrong if you skipped it for large `d_k`?
:::
