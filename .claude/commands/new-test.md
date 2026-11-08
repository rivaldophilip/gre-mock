---
description: Generate, verify and publish one new hard GRE mock test (verbal or quant)
argument-hint: verbal|quant
---
Create one new hard GRE **$ARGUMENTS** test by following `docs/QUIZ-AUTHORING.md` end to end:
brief → author (one Write; quant also writes its verify script) → `check` until OK → blind-solve → `blind --check` until clean → register → commit and push.

Keep it lean:
- Before authoring, read only `content/briefs/<id>.md`, `docs/QUIZ-AUTHORING.md` and `docs/HARD-PATTERNS.md`, plus `<id>.local.md` exemplars for a type you are unsure about. Don't read schema, scripts or old tests unless a message is not enough.
- Write the test in one Write call and fix it with Edit. Run every script as `npm run -s …` and follow its `next:` line.
- Use one `gre-blind-solver` agent. Pipe its reply to `npm run -s blind -- <id> --check -`; don't save it to a file yourself. Send rewritten items to the same agent with `--only`.

Don't stop before registering and pushing unless a step can't be completed. The final report gives:
- the test id;
- the solver's agreement: the `N/27 match the key` line, plus the reading-skill agreement for verbal;
- the `coverage:` lines from the last `check`;
- the items you rewrote or retagged, and why.
