---
id: positional-encoding
title: Positional Encoding
summary: Attention is order-blind, so position has to be injected — and how you inject it decides how far the model can extrapolate.
tags: [transformers, architecture]
difficulty: 3
est_minutes: 40
prereqs: [embeddings]
related: [attention-scaled-dot-product]
sources:
  - title: Su et al. — RoFormer (RoPE)
    url: https://arxiv.org/abs/2104.09864
---

# Positional Encoding

[[attention-scaled-dot-product]] is permutation-equivariant: shuffle the input tokens and the outputs shuffle with them, unchanged. So a bare transformer literally cannot distinguish *"the dog bit the man"* from *"the man bit the dog"*. Both are the same bag of vectors.

Position must be added by hand. Three generations of doing that:

## 1. Sinusoidal (original transformer)

Add a fixed, non-learned signal to the embedding:

$$PE_{(pos, 2i)} = \sin\!\left(\frac{pos}{10000^{2i/d}}\right), \qquad PE_{(pos, 2i+1)} = \cos\!\left(\frac{pos}{10000^{2i/d}}\right)$$

Each dimension is a sinusoid of a different wavelength — fast oscillation in early dims, very slow in later ones. Together they form a multi-scale binary-like code for absolute position.

The elegant property: `PE(pos + k)` is a fixed linear transform of `PE(pos)`, so *relative* offsets are learnable as linear maps. And since nothing is learned, it's defined for positions past the training length — though in practice quality degrades quickly there.

## 2. Learned absolute (GPT-2, BERT)

Just make it another lookup table, shape `[max_len, d_model]`, trained like [[embeddings]]. Simple, and slightly better in-distribution.

The hard limit: **position `max_len` has no row.** GPT-2 cannot process token 1025 at all. Context length is baked into the parameters.

## 3. RoPE — rotary, and what modern models use

Instead of *adding* to the embedding, **rotate** Q and K by an angle proportional to position, in 2D pairs of dimensions:

$$\tilde{q}_m = R_{\theta, m}\, q_m, \qquad \tilde{k}_n = R_{\theta, n}\, k_n$$

Then the dot product `q̃_m · k̃_n` depends **only on `m − n`**, the relative offset. Absolute position vanishes from the score by construction — you get relative positioning without an extra bias term, and rotation preserves vector norms so nothing destabilizes.

```python
# RoPE, applied to Q and K inside each attention head (not to the embedding).
def rope(x, pos, base=10000):
    d = x.shape[-1]
    freqs = base ** (-torch.arange(0, d, 2).float() / d)
    ang = pos[:, None] * freqs[None, :]
    cos, sin = ang.cos().repeat_interleave(2, -1), ang.sin().repeat_interleave(2, -1)
    x_swap = torch.stack([-x[..., 1::2], x[..., 0::2]], -1).flatten(-2)
    return x * cos + x_swap * sin
```

Note **where** it applies: to Q and K inside every attention layer, not once to the input embedding. That's the structural difference from the additive schemes.

## Why RoPE won

- Relative by construction, so patterns learned at short range transfer to long range.
- Extends past the training length by interpolating or rescaling `base` — this is the mechanism behind "we extended the context window to 128k" announcements (NTK scaling, YaRN, position interpolation).
- No extra parameters.

Everything in this section applies to the `Q`/`K` path only. Values are never rotated — position affects *who you attend to*, not *what you carry*.

:::check
Why can GPT-2 not process a sequence longer than its trained `max_len`, while a sinusoidal model at least produces something?
:::

:::check
RoPE is applied to Q and K but not V. Why is that the right place?
:::
