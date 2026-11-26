---
description: Refill the question bank: pick the largest gaps, write, verify and sync up to 3 batches (quant or verbal)
argument-hint: [quant|verbal]
---
Refill the question bank for **$ARGUMENTS** (both measures when none is given) by following `docs/QUIZ-AUTHORING.md`, Bank batches, and `docs/BANK.md`, Stock target and refill. With no argument the scripts pick the measure and batch kind themselves.

Loop, at most 3 batches:
1. `npm run -s bank:gaps [-- <measure>]`. Stop when it recommends nothing (the weighted deficit is under the threshold).
2. `npm run -s bank:brief [-- <measure>]` (add `--kind` only to override its pick). Read only `content/briefs/<id>.md`, plus the Bank batches section of `docs/QUIZ-AUTHORING.md` and `docs/HARD-PATTERNS.md` (the parts for the batch's types).
3. Write `content/bank/<measure>/<id>.json` in one Write (quant also `content/verify/<id>.py`), and fix it with Edit.
4. `npm run -s check -- <id>` until it prints OK.
5. Blind-solve with one `gre-blind-solver` agent: `npm run -s blind -- <id>`, give it the path, then `npm run -s blind -- <id> --check`. Send rewrites to the same agent with `--only`.
6. Novelty with one `gre-novelty-judge` agent: `npm run -s novelty -- <id>`, then `--check`, and send rewrites to the same judge with `--only`.
7. `npm run -s bank:sync -- <id>`.
8. Commit only the batch's files (`content/bank/<measure>/<id>.json`, `content/briefs/<id>.*`, `content/verify/<id>.py`) and push.
9. Run `bank:gaps` again and repeat while it still recommends a batch.

Keep it lean: run every script as `npm run -s …` and follow its `next:` line; don't read the schema, scripts or old tests unless a message is not enough.

The final report gives, per batch: the id and kind, the solver line (`N/N match the key`), the novelty line, the `coverage:` lines from the last `check`, what was rewritten or retagged and why, and the `bank:gaps` deficit before and after.
