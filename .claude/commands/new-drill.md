---
description: Add endless-vocab stock (TC / SE items aimed at untested words); runs /bank-fill verbal as a tcse batch
argument-hint: [count, default 20]
---
Drill batches are replaced by **tcse** bank batches: the drill serves every unseen TC / SE item in the question bank (`docs/BANK.md`). Run the `/bank-fill verbal` steps (`.claude/commands/bank-fill.md`) with `npm run -s bank:brief -- verbal --kind tcse --count $ARGUMENTS` (20 when no count is given) as the brief step.
