---
id: chain-rule
title: The Chain Rule
summary: The derivative of a composition is the product of derivatives — the single fact that makes deep networks trainable.
tags: [math, calculus, foundations]
difficulty: 2
est_minutes: 25
prereqs: []
related: [backpropagation]
---

# The Chain Rule

For `y = f(g(x))`:

$$\frac{dy}{dx} = \frac{dy}{dg} \cdot \frac{dg}{dx}$$

Local derivatives multiply along the path. That's it — but the consequences are the whole field.

## Why depth is possible at all

A neural network *is* a composition: `y = f_L(f_{L-1}(...f_1(x)))`. The chain rule says you can compute the gradient of the final loss with respect to a weight buried in layer 1 by multiplying the local derivatives along the path back to it. You never need a global closed form for the network. Each layer only has to know how to differentiate *itself*.

## The multivariate version

With multiple paths from `x` to `y`, contributions **sum** over paths:

$$\frac{\partial L}{\partial x} = \sum_{k} \frac{\partial L}{\partial u_k} \frac{\partial u_k}{\partial x}$$

This is why residual connections change gradient flow so dramatically — see [[layer-norm-residuals]]. A skip connection adds a second path with derivative exactly `1`, so the sum can never be smaller than that path alone.

## Vanishing and exploding, in one line

Multiplying `L` local derivatives means the product behaves geometrically:

- all local derivatives `< 1` → product decays to zero → **vanishing gradients**, early layers stop learning
- all local derivatives `> 1` → product blows up → **exploding gradients**, NaNs

A network 50 layers deep with local derivatives of 0.9 gives `0.9^50 ≈ 0.005`. That is the vanishing gradient problem, and it is arithmetic, not mystery.

:::check
A 30-layer network has average local derivative 0.8 per layer. Roughly what fraction of the output-layer gradient signal reaches layer 1?
:::
