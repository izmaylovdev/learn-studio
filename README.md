# learn studio

A personal learning library that keeps the parts Claude artifacts drop: the
cross-references between materials, the prerequisite structure, and the memory of
what you've actually learned.

- **Library** — one markdown file per concept, with math, diagrams, and
  `[[wikilinks]]` between them.
- **Graph** — prerequisites form a DAG you can see; related links and inline
  mentions overlay it. Nodes are coloured by how well you know them.
- **Tracks** — ordered, staged paths through the graph for a big topic, with
  checkpoints and build projects.
- **Progress** — recall checks with self-grading, SM-2 scheduling, and a
  dashboard that answers "what should I study right now".

Everything is files. Git-versionable, greppable, yours.

## Run it

```bash
npm install
npm run dev     # → http://localhost:5273
```

## Add material

Ask Claude in this directory:

- `/new-material <topic>` — writes a concept and wires it into the graph
- `/new-track <topic>` — designs a staged track, then the concepts it needs
- `/study` — runs a review session against what's due

Or write the markdown yourself; see `CLAUDE.md` for the schema. Then:

```bash
npm run check   # validates references, catches prereq cycles
```

## What's here now

One track, **Transformers from Scratch** — 12 concepts from the dot product
through to the KV cache, staged in four parts with build checkpoints.
