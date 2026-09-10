---
id: transformers-from-scratch
title: Transformers from Scratch
goal: Implement a working GPT-style decoder from first principles and explain every design choice in it.
tags: [ml, transformers, nlp]
stages:
  - title: Math you cannot skip
    goal: Build the four primitives every later concept assumes.
    concepts: [vectors-and-dot-product, softmax, chain-rule, gradient-descent]
  - title: How networks learn
    goal: Understand the backward pass and the representation the model starts from.
    concepts: [backpropagation, embeddings, layer-norm-residuals]
  - title: Attention
    goal: Derive scaled dot-product attention and everything bolted around it.
    concepts: [attention-scaled-dot-product, multi-head-attention, positional-encoding]
  - title: The full model, and running it
    goal: Assemble the block, then understand what changes at inference time.
    concepts: [transformer-block, kv-cache]
---

# Transformers from Scratch

The goal is not to *use* a transformer — it's to be able to write one on a whiteboard and defend every line. Four stages, roughly 8 hours of material, and a build project at the end of each half.

## How to work through this

Each concept has `:::check` questions. Answer them out loud before you look — recall is what moves a concept from *learning* to *mastered*, and re-reading is not recall. Grade yourself honestly in the reader; the scheduler uses those grades to decide when to bring a concept back.

## Checkpoints

**After stage 2** — implement a two-layer MLP with manual backprop in NumPy. No autograd. If the gradients match a finite-difference check, [[backpropagation]] is real to you.

**After stage 3** — implement single-head attention in NumPy, then multi-head. Verify that permuting the input rows permutes the output rows identically. That failure *is* the reason [[positional-encoding]] exists, and seeing it yourself is worth more than reading it.

**After stage 4** — implement a small GPT in PyTorch, train it on a few MB of text, and add a KV cache to the generation loop. Measure tokens/sec with and without. The gap is the point of [[kv-cache]].

## What this track deliberately skips

Tokenization (BPE), the training data pipeline, distributed training, RLHF, and encoder-decoder architectures. Each is a track of its own. This one is the decoder block and nothing else.
