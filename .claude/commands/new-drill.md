---
description: Generate, verify and publish one endless-vocab drill batch (single TC / SE items aimed at untested words)
argument-hint: [count, default 20]
---
Create one drill batch of **$ARGUMENTS** items (20 when no count is given) by following `docs/QUIZ-AUTHORING.md`, Drill batches, end to end:
brief (`npm run -s brief:drill -- --count <n>`) → author `content/drill/<id>.json` (one Write) → `check` until OK → blind-solve → `blind --check` until clean → novelty check → `novelty --check` until clean → register → commit and push.

Keep it lean:
- Before authoring, read only `content/briefs/<id>.md`, the Drill batches section of `docs/QUIZ-AUTHORING.md`, and the TC / SE parts of `docs/HARD-PATTERNS.md`.
- Write the batch in one Write and fix it with Edit. Run every script as `npm run -s …` and follow its `next:` line.
- Use one `gre-blind-solver` agent, then one `gre-novelty-judge` agent, as for a mock. Send rewritten items back to the same agent with `--only`.
- Commit only the drill files (`content/drill/<id>.json`, `content/briefs/<id>.*`), not unrelated work in the tree.

The final report gives the batch id, the solver line (`N/N match the key`), the novelty line, the `coverage:` lines from the last `check`, and what was rewritten or retagged, and why.
