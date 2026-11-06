# Priority model

Everything is derived from the append-only `item_events` table. Weights live in `lib/priority/config.ts`; the math in `lib/priority/compute.ts`; slot allocation in `lib/priority/allocate.ts`. Unit tests: `tests/priority.test.ts`.

## Events

Positive weight = evidence of weakness, negative = mastery.

| Word event | Trigger | w |
|---|---|---|
| `dont_know` | tapped in review | +1.0 |
| `key_missed` | answer word you did not select | +0.8 |
| `distractor_chosen` | wrong word you selected | +0.6 |
| `key_guessed` | key selected, question flagged "guessed" | +0.3 |
| `key_partial` | key selected but the question was wrong (e.g. other SE pick wrong) | −0.3 |
| `key_correct` | key selected, question right, not guessed | −0.6 |
| `distractor_rejected` | distractor not picked on a question you got right | −0.15 |
| `exposure` | word in a passage/stem | 0 (coverage only) |

Concepts: primary wrong +0.8, secondary wrong +0.4, right-but-guessed +0.3, right-but-slow +0.2 (>105 s quant, >90 s verbal), primary right −0.6, secondary right −0.3.

Events are emitted when a response is *finalized*: on "Check answer" in Practice mode, on section end in Exam mode.

## Scores per item (each event decayed by `0.5^(age_days/21)`)

- Weakness `S = (Σ⁺ + 0.5) / (Σ⁺ + Σ|⁻| + 1.5)`. Untested = 0.33.
- Coverage `C = min(1, n_key + 0.3·n_distractor + 0.15·n_passage)`; novelty `N = 1 − C`.
- Due `D = min(1, days_since_last_test / I)`, `I = [1,3,7,14,30][min(streak,4)]`; never tested → 0.
- Yield `Y`: words `min(1, source_count/5)` +0.2 for secondary-sense/ETS words (+0.3 more for words attested in official materials); concepts hand-set in `data/concepts.json`.
- Priority `P = 0.40·S + 0.30·N + 0.15·D + 0.15·Y`, ×0.3 if tested in the last 2 days.

## Slot allocation (`npm run brief`)

- Verbal: 29 key slots — 50% review (weakness evidence, ranked by P), 40% new (N·Y), 10% wildcard (random Y ≥ 0.6). If a bucket runs dry (first test: no history) the others fill in. ~40% of distractors come from weak words. Each RC passage gets 3–6 passage-tier words.
- Quant: 27 concept slots — 50% highest weakness·yield, 35% least covered, 15% balance the four areas.
- Reading skills: the 13 RC slots get skills from `data/rc_skills.json` by the same 50 / 35 / 15 rule. The 2 argument slots draw from the `argument` area, the other 11 from `reading`. Skills repeat when there are more slots than skills, and the brief lists official exemplars per skill.

## Reading skills

Each RC question has one primary skill tag (`kind: "concept"`; areas `reading` / `argument`, stored in the concepts table) and optionally a secondary one. A skill gets the concept events and weights above. The "slow" threshold is the verbal pace (90 s per question), so the first question on a long passage, which includes reading time, can register as slow. The skills' `yield` comes from how often each skill is tested in medium/hard official reading items (`scripts/concept_yields.py`). The official items' skills were assigned from their question stems (`reference/rc_skills.jsonl`, local only). After tagging questions a user has already answered, run `npm run backfill:concepts`.
