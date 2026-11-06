---
description: Generate, verify and publish one new hard GRE mock test (verbal or quant)
argument-hint: verbal|quant
---
Create one new hard GRE **$ARGUMENTS** test by following `docs/QUIZ-AUTHORING.md` end to end:
brief → author → tag + validate → (quant) verify script → blind-solve → register → commit and push.

Keep it lean:
- Before authoring, read only `content/briefs/<id>.md`, `docs/QUIZ-AUTHORING.md` and `docs/HARD-PATTERNS.md`, plus `<id>.local.md` exemplars for a type you are unsure about. Don't read schema, validator or old test files unless a command fails.
- Write the test in one Write call, and fix it with Edit.
- Use one `gre-blind-solver` agent. Send rewritten items back to the same agent with `--only`, and let `npm run blind -- <id> --check` do the comparison.

Don't stop before registering and pushing unless a step can't be completed. Report the test id, the solver's agreement (answers and, for verbal, the reading skills), the reading skills or concepts covered, and any items you rewrote.
