---
id: kv-cache
title: The KV Cache
summary: Generation recomputes nothing it already computed — the cache is why the second token is 100× cheaper than the first, and why long contexts eat your VRAM.
tags: [transformers, inference, systems]
difficulty: 4
est_minutes: 45
prereqs: [transformer-block]
related: [multi-head-attention]
sources:
  - title: Pope et al. — Efficiently Scaling Transformer Inference
    url: https://arxiv.org/abs/2211.05102
---

# The KV Cache

Autoregressive generation appends one token at a time. Naively, generating token `n+1` means running the whole prefix of length `n` through every [[transformer-block]] again — `O(n²)` work per token, `O(n³)` for a sequence. Unusable.

The saving observation: **with causal masking, token `j`'s key and value vectors never change once computed.** Token `j` cannot see anything after it, so nothing later can alter its `K_j` or `V_j`. Cache them.

## What changes per step

For the newly generated token you need:

- its own `Q` — computed fresh, needed only for this step, never cached
- `K` and `V` for **all** positions — but positions `0..n-1` are already in the cache, so you compute only position `n` and append

```python
def step(x_new, cache, layer):
    q = x_new @ layer.Wq                     # [1, d]  — this token's query
    k, v = x_new @ layer.Wk, x_new @ layer.Wv
    cache.k = torch.cat([cache.k, k], dim=1) # append, never recompute
    cache.v = torch.cat([cache.v, v], dim=1)
    scores = (q @ cache.k.transpose(-2, -1)) / math.sqrt(d_k)
    return scores.softmax(-1) @ cache.v      # no mask needed — cache holds only the past
```

Note there's no causal mask in the decode path. The cache *is* the mask: it contains exactly the past, so attending to all of it is already causal.

Per-token cost drops from `O(n² d)` to `O(n d)`. This is the difference between a usable chatbot and a demo.

## Two phases, two bottlenecks

| Phase | What runs | Bound by |
|---|---|---|
| **Prefill** | whole prompt, one parallel pass | compute (big matmuls, GPU saturated) |
| **Decode** | one token at a time | **memory bandwidth** |

Decode is the counterintuitive one. Every step must read the entire cache plus all model weights from HBM to compute a *single* token. Arithmetic intensity is terrible — the GPU sits idle waiting on memory. That's why time-to-first-token and inter-token latency have completely different scaling behavior, and why batching many requests together is nearly free on decode: the weight read is amortized across the batch.

## The memory bill

$$\text{bytes} = 2 \times n_{\text{layers}} \times n_{\text{kv heads}} \times d_{\text{head}} \times \text{seq len} \times \text{batch} \times \text{bytes/param}$$

The leading `2` is K and V. Llama-2-7B in fp16, 4096 tokens, batch 1: `2 × 32 × 32 × 128 × 4096 × 2 B ≈ 2.1 GB` — for **one** sequence, on top of 13 GB of weights. Batch 16 at that length is 34 GB of cache alone. This, not the parameter count, is what limits how many concurrent users a GPU serves.

## How production shrinks it

- **GQA / MQA** — fewer K/V heads (see [[multi-head-attention]]). Llama-3's 8 KV heads instead of 64 cut the cache 8×. The single highest-leverage change available.
- **Quantized cache** — store K/V in int8 or fp8. 2× for a small quality cost.
- **PagedAttention (vLLM)** — allocate the cache in fixed pages instead of one contiguous max-length block, eliminating the internal fragmentation that wasted most of the reservation.
- **Sliding window / eviction** — keep the last `w` tokens plus a few "sink" tokens at the start. Bounds memory at the cost of true long-range recall.

## Where people get it wrong

- **Caching Q.** Useless. A query is consumed in the step that creates it.
- **Assuming it helps training.** It doesn't. Training sees the whole sequence at once with a causal mask, so there's nothing to reuse across steps — and [[backpropagation]] has its own, much larger, activation-memory problem.
- **Forgetting position.** With RoPE ([[positional-encoding]]), rotation is applied when the key is created, so cached keys already carry their position. Rotating again on read is a real and easy-to-miss bug.

:::check
Why can K and V be cached across generation steps, but Q cannot?
:::

:::check
Prefill is compute-bound and decode is memory-bandwidth-bound. What explains the difference?
:::

:::check
Which single architectural change most reduces KV cache size, and what does it trade away?
:::
