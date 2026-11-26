---
description: Refill the question bank for a measure (quizzes are now assembled from the bank); runs /bank-fill
argument-hint: verbal|quant
---
Mocks are no longer authored whole: the webapp assembles each quiz from the question bank (`docs/BANK.md`). To add questions for **$ARGUMENTS**, run the `/bank-fill $ARGUMENTS` steps (`.claude/commands/bank-fill.md`): `bank:gaps`, `bank:brief`, one Write, `check`, one blind solver, one novelty judge, `bank:sync`, commit and push.

Write a whole 27-question mock (`npm run -s brief -- <measure>`, `docs/QUIZ-AUTHORING.md`, Steps) only when the user asks for one by name.
