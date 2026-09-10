---
id: vectors-and-dot-product
title: Vectors and the Dot Product
summary: The dot product is a similarity score — every attention mechanism is built on that one idea.
tags: [math, linear-algebra, foundations]
difficulty: 1
est_minutes: 25
prereqs: []
related: []
sources:
  - title: 3Blue1Brown — Dot products and duality
    url: https://www.3blue1brown.com/lessons/dot-products
---

# Vectors and the Dot Product

A vector is a list of numbers. The **dot product** of two vectors collapses them into a single number:

$$a \cdot b = \sum_i a_i b_i = \|a\| \|b\| \cos\theta$$

That second form is the one that matters for everything downstream. The dot product is **the cosine of the angle between two vectors, scaled by their lengths**. So:

| Geometry | Dot product |
|---|---|
| Pointing the same way | large and positive |
| Perpendicular | zero |
| Pointing opposite ways | large and negative |

## Why this is the whole game

If you represent two things as vectors, the dot product *is* a similarity score between them. No extra machinery. This is why [[embeddings]] work, and it is the reason the core of [[attention-scaled-dot-product]] is literally `Q @ K.T` — a matrix of every-query-against-every-key similarity.

## Length matters, and that's a problem

Because the dot product scales with `‖a‖‖b‖`, vectors that are merely *long* score high even when badly aligned. Two fixes you'll see constantly:

- **Normalize first** — divide by the norm, and the dot product becomes pure cosine similarity in `[-1, 1]`.
- **Divide by a constant** — the trick used in scaled attention, where high-dimensional random vectors have predictably large dot products.

```python
import numpy as np
a, b = np.array([1., 2., 3.]), np.array([2., 0., 1.])
a @ b                                        # 5.0  — raw
(a @ b) / (np.linalg.norm(a) * np.linalg.norm(b))  # 0.598 — cosine
```

## Matrix multiplication is just many dot products

`(A @ B)[i, j]` is the dot product of row `i` of `A` with column `j` of `B`. When you see `Q @ K.T` produce an `n × n` matrix, read it as: *"score every one of the n queries against every one of the n keys."* That reading carries you through the rest of the track.

:::check
Why does normalizing vectors before taking a dot product change the interpretation of the result?
:::
