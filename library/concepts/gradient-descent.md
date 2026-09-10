---
id: gradient-descent
title: Gradient Descent
summary: Follow the negative gradient in small steps — the optimizer underneath every model you'll train.
tags: [math, optimization, foundations]
difficulty: 2
est_minutes: 35
prereqs: []
related: [backpropagation]
sources:
  - title: Kingma & Ba — Adam
    url: https://arxiv.org/abs/1412.6980
---

# Gradient Descent

The gradient `∇L(θ)` points in the direction of steepest *increase* of the loss. So step the other way:

$$\theta \leftarrow \theta - \eta \nabla L(\theta)$$

`η` is the **learning rate**, and it is the hyperparameter most likely to be the reason your training run failed.

- too small → crawls, or parks in the first mediocre basin it finds
- too large → overshoots, oscillates, diverges to NaN

## Three variants you'll actually meet

| Variant | Gradient computed on | Trade-off |
|---|---|---|
| Batch GD | the entire dataset | smooth, accurate, unusably slow |
| SGD | one sample | noisy, fast, the noise itself helps escape bad minima |
| **Mini-batch** | 32–4096 samples | what everyone actually uses; GPU-shaped |

## Why plain SGD isn't enough

Loss surfaces are anisotropic: steep in some directions, nearly flat in others. A single global `η` is either too big for the steep directions or too small for the flat ones. The fixes stack up:

- **Momentum** — accumulate a velocity vector so consistent directions build speed and oscillations cancel.
- **Adam** — keep a per-parameter running estimate of both the mean and variance of the gradient, and normalize by it. Effectively a separate learning rate per parameter.
- **Warmup + decay** — start `η` near zero and ramp up, then anneal. Near-universal for transformers, where early large steps wreck the attention layers before they've learned anything.

```python
# One mini-batch step, unrolled.
for x_batch, y_batch in loader:
    loss = criterion(model(x_batch), y_batch)
    grads = backward(loss)          # <- this is [[backpropagation]]
    for p, g in zip(params, grads):
        p -= lr * g
```

The `backward(loss)` line is the part that needs [[chain-rule]] to make sense. Descent itself is the easy half.

:::check
Why does Adam usually converge faster than SGD on a loss surface that is much steeper in some directions than others?
:::

:::check
Transformer training almost always uses learning-rate warmup. What does a large step early in training damage?
:::
