---
name: study
description: Run a study or review session against the library — quiz what's due, grade recall, and record progress. Use when the user says "quiz me", "let's study", "what should I learn next", or asks about review status.
---

# Run a study session

## 1. Get the state

```bash
npm run index
```

This prints what's due, what's unlocked, and current mastery. For detail:

```bash
curl -s localhost:8787/api/graph | python3 -m json.tool | head -60   # if dev server is up
```

## 2. Pick the session

Priority order:

1. **Due for review** — anything past its `nextReview` date. These decay if
   skipped; they come first.
2. **In-flight** — concepts at `learning` that haven't been graded yet.
3. **Newly unlocked** in an active track — prereqs cleared, ready to start.

Six to ten items is a session. Say what you're covering and why before starting.

## 3. Quiz from the material, not from memory

Read the concept file and use its `:::check` questions, plus follow-ups that
connect it to its neighbours — cross-concept questions are where the graph earns
its keep. "How does the √d_k scaling in attention relate to softmax saturation?"
tests two nodes and the edge between them.

Ask one question at a time. Wait for an answer. Do not reveal the answer in the
question.

## 4. Grade honestly

After each answer, say what was right, fill the specific gap, then grade:

| Grade | Meaning |
|---|---|
| 5 | correct, immediate, explained the mechanism |
| 4 | correct with hesitation or a small gap |
| 3 | correct only after a hint |
| 1 | could not recall, or recalled the term but not the mechanism |

Grade the *mechanism*, not the vocabulary. Reciting a definition without the why
is a 3 at best. Being generous here corrupts the schedule and the user ends up
believing they know things they don't.

Record each grade:

```bash
curl -s -X POST localhost:8787/api/progress/<concept-id> \
  -H 'content-type: application/json' -d '{"grade": 4}'
```

If the dev server isn't running, batch the grades and tell the user to record
them in the reader, or start the server first.

## 5. Close the session

Report: what was solid, what was shaky, and what the next session should cover.
If a concept failed badly, say whether the problem is that concept or one of its
prerequisites — a wrong answer often means the gap is one node upstream, and
that's the more useful finding.
