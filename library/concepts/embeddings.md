---
id: embeddings
title: Embeddings
summary: Learned vectors that place meaning in geometry, so that similarity becomes a dot product.
tags: [representation, nlp]
difficulty: 2
est_minutes: 35
prereqs: [vectors-and-dot-product]
related: [positional-encoding]
sources:
  - title: Mikolov et al. — word2vec
    url: https://arxiv.org/abs/1301.3781
---

# Embeddings

An embedding is a lookup table: token id → a dense vector of `d_model` floats. The table is a parameter matrix of shape `[vocab_size, d_model]`, and it is **learned**, not designed.

```python
E = nn.Embedding(vocab_size, d_model)   # e.g. [50257, 768]
E(torch.tensor([1045, 716, 3375]))      # -> [3, 768]
```

## Why not one-hot

One-hot vectors are `vocab_size` long, almost entirely zeros, and — critically — **equidistant**. Every pair of distinct one-hot vectors has dot product 0. The representation asserts that "cat" is exactly as unrelated to "dog" as it is to "parliament".

Embeddings drop that. A `768`-dim dense vector has room to encode gradations, and because similarity is just a dot product ([[vectors-and-dot-product]]), *geometric* closeness becomes *semantic* closeness — for free, as a consequence of training.

## What the geometry ends up encoding

Trained embeddings famously support arithmetic:

```
E("king") - E("man") + E("woman") ≈ E("queen")
```

This works because gradient descent has no reason to waste dimensions: directions in the space get reused as reusable *features* (plurality, tense, gender, formality). Don't over-romanticize it — the analogies are noisy and cherry-picked in the literature — but the underlying claim holds. Directions mean things.

## The thing that trips people up

A token embedding is **context-free**. `E("bank")` is one fixed vector, identical in "river bank" and "central bank". The embedding table cannot disambiguate; it has no access to neighbors.

Resolving that is precisely the job of [[attention-scaled-dot-product]]: each layer rewrites every token's vector as a weighted mixture of the other tokens' vectors, so by the output layer, "bank" *is* contextual. Embeddings are the starting point, not the answer.

## Two practical notes

- **Weight tying.** Many models share the embedding matrix with the output projection (`logits = h @ E.T`). Saves `vocab_size × d_model` parameters and usually helps.
- **Position is absent.** The table maps *ids*, so `E("dog bites man")` and `E("man bites dog")` produce the same *set* of vectors. Order must be injected separately — see [[positional-encoding]].

:::check
Why is `E("bank")` the same vector in "river bank" and "central bank", and which component of a transformer fixes that?
:::

:::check
What does the embedding matrix know about the order of tokens in a sentence?
:::
