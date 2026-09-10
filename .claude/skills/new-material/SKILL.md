---
name: new-material
description: Write a new concept into the learning library and wire it into the knowledge graph. Use when the user wants to learn or capture a new topic, asks to "add a concept/material/note on X", or wants an existing concept expanded or split.
---

# Add a concept to the library

## 1. Find where it belongs before writing anything

```bash
npm run index
ls library/concepts/
```

Read the 2-3 nearest existing concepts in full. You need to know what's already
been explained so the new material doesn't repeat it — it should *link* to it.

Decide:
- **Prereqs** — what must genuinely be understood first. Be strict; every prereq
  is a gate that blocks this concept on the dashboard until it's mastered.
- **Related** — sideways connections, no ordering.
- **Inbound links** — which *existing* concepts should now point at this one.
  This is the step that's easy to skip and the reason libraries rot into
  disconnected islands.

If the topic is genuinely two ideas, write two files. A concept should be one
sitting, roughly 25-60 minutes.

## 2. Write it

Schema and renderer features are in `CLAUDE.md`. Follow the writing standards
there — mechanism over vocabulary, failure modes included, checks that test
recall rather than recognition.

Structure that works:

1. The thing itself, stated precisely (equation, definition, signature)
2. Why it exists — what breaks without it
3. How it actually works, with a worked example or code
4. The failure modes and what people get wrong
5. What it connects to next

Three to five `:::check` blocks, with matching `checks:` answers in frontmatter,
in the same order. `npm run check` warns if the counts disagree, because the
reader pairs them positionally and a mismatch shows the wrong answer.

Consider an interactive figure — a ` ```viz ` block, listed in `CLAUDE.md`. Only
where dragging something teaches what a paragraph can't, and only if an existing
`type` fits; building a new one is a code change, not an authoring step.

If the concept turns on a formula the reader has to decode rather than just read,
add a ` ```formula ` block. Check `library/symbols.yml` first and reuse ids;
adding a symbol there is cheap, but two entries for the same glyph is a bug. Put
the general meaning in the lexicon and the local meaning in the block's `notes:`.

## 3. Wire the inbound links

Edit existing concepts to add `[[new-concept-id]]` where the reference is
genuinely useful, and add the id to their `related:` where the connection is
strong. Do not add links that don't earn their place.

## 4. Validate

```bash
npm run check
```

Fix every error. Warnings about `[[links]]` with no file are acceptable only if
you intend that gap as a marker for future material — say so to the user.

## 5. Report

Tell the user what you added, what it links to and from, and whether it unlocked
anything on the dashboard. If you left a deliberate gap, name it.
