---
name: new-track
description: Design a staged learning track for a complex topic, then write the concepts it needs. Use when the user wants to learn a big subject end-to-end, asks for a "learning path/track/curriculum/roadmap" for X, or wants an existing track restructured.
---

# Design a learning track

A track is an ordered path through the concept graph with a concrete, testable
end goal. It is not a reading list.

## 1. Pin down the goal first

Ask the user what they want to be able to *do* — build, derive, debug, decide.
"Learn Kubernetes" is not a goal; "deploy and debug a stateful service on a
cluster I provisioned myself" is. The goal determines what gets cut.

If the answer is obvious from context, state your reading of it and continue
rather than blocking.

## 2. Work backwards

Start at the goal and ask "what must be true first" until you hit things the user
already knows or that are genuinely foundational. That backward chain *is* the
prerequisite structure — write it down before grouping anything.

Then group into 3-5 stages. Each stage needs its own `goal:` — a reason to exist
that isn't just "the next four things".

Check the library for concepts that already exist. Reuse them. A track that
shares concepts with an existing track is a feature: that shared node is real
transfer, and the graph will show it.

## 3. Write the track file

Schema in `CLAUDE.md`. The body matters as much as the frontmatter:

- **Checkpoints** — a build or derivation after each stage that proves the stage
  landed. Reading is not evidence of learning; producing something is.
- **What this track deliberately skips**, and why. This is what keeps a track
  finishable, and it tells the user what the *next* track should be.

## 4. Write the missing concepts

Follow the `new-material` skill for each. Write them in prerequisite order so
each one can link back to what came before.

For a large track, write stage 1 completely, then confirm the depth and tone with
the user before continuing — it's much cheaper to recalibrate after four concepts
than after twelve.

## 5. Validate and activate

```bash
npm run check
```

Every id in every stage must resolve. Translate the track into each language
under `library/i18n/` — `library/i18n/<lang>/tracks/<id>.md` with `title`,
`goal`, the body, and one `title`/`goal` pair per stage in source order — and
stamp it with `npm run i18n -- stamp <lang> <id>`. Then tell the user to open the track page
and hit **Set active** — active tracks are what the dashboard prioritizes when
choosing what to study next.
