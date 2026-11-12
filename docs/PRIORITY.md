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
| `key_partial` | key selected but the question was wrong (other types; not TC or SE, see below) | −0.3 |
| `key_correct` | key selected, question right, not guessed | −0.6 |
| `key_slow` | as `key_correct`, but the question took > 90 s (logged in addition) | +0.2 |
| `distractor_rejected` | distractor not picked on a question you got right | −0.15 |
| `exposure` | word in a passage/stem | 0 (coverage only) |

Text completion and SE are judged per word: on a wrong question, a right blank (TC) or a right pick (SE) logs `key_correct` (or `key_guessed`), and the distractors of a right blank `distractor_rejected`; only the wrong blank's or pick's words log `key_missed` / `distractor_chosen`. `npm run rebuild:words [-- --apply]` re-derives the word events that older TC/SE answers logged.

Concepts: primary wrong +0.8, secondary wrong +0.4, right-but-guessed +0.3, right-but-slow +0.2 (>105 s quant, >90 s verbal), primary right −0.6, secondary right −0.3.

Events are emitted when a response is *finalized*: on "Check answer" in Practice mode, on section end in Exam mode. Blank questions emit nothing (they are also left out of accuracy). Abandoning an attempt ("Discard attempt" on the dashboard) finalizes nothing, so an Exam section not yet submitted leaves no events; checked Practice answers and finished sections keep theirs. `npm run cleanup:unanswered [-- --apply]` removes events that older attempts logged for blanks.

The section clock (`lib/clock.ts`) pauses while the test-taker is off the page (Pause & exit, or the page hidden or closed) and resumes on return; a page that stops sending heartbeats for 60 s counts as paused from its last one.

## Scores per item (each event decayed by `0.5^(age_days/21)`)

- Weakness `S = (Σ⁺ + 0.5) / (Σ⁺ + Σ|⁻| + 1.5)`. Untested = 0.33.
- Coverage `C = min(1, n_key + 0.3·n_distractor + 0.15·n_passage)`; novelty `N = 1 − C`.
- Due `D = min(1, days_since_last_test / I)`, `I = [1,3,7,14,30][min(streak,4)]`; never tested → 0.
- Yield `Y`: words `min(1, source_count/5)` +0.2 for secondary-sense/ETS words (+0.3 more for words attested in official materials); concepts hand-set in `data/concepts.json`.
- Priority `P = 0.40·S + 0.30·N + 0.15·D + 0.15·Y`, ×0.3 if tested in the last 2 days.

## Slot allocation (`npm run brief`)

- Verbal: 29 key slots — 50% review (weakness evidence, ranked by P), 40% new (N·Y), 10% wildcard (random Y ≥ 0.6). If a bucket runs dry (first test: no history) the others fill in. ~40% of distractors come from weak words. Each RC passage gets 3–6 passage-tier words.
- Quant: 27 concept slots — 50% highest weakness·yield, 35% least covered, 15% balance the four areas. Each slot also gets a variant from `data/concept_variants.json`: the one used least for that concept, ties random (`assignVariants`). Uses are counted from the tests' own `variant` fields (every quant question records one), plus the `variant` of briefs whose test is not written yet. So a concept that recurs is tested in a different form. The brief also lists, under each slot, the setups earlier tests used for that concept (`conceptHistory` in `lib/setup-history.ts`), with those used in two or more tests marked **worn**. Weak concepts are meant to come back; their setups are not.
- Reading skills: the 13 RC slots get skills from `data/rc_skills.json` by the same 50 / 35 / 15 rule. The 2 argument slots draw from the `argument` area, the other 11 from `reading`. Skills repeat when there are more slots than skills, and the brief lists official exemplars per skill. Each skill slot also gets a variant from `data/concept_variants.json` the same way as quant (least used across earlier verbal briefs, field `variant` on `skillSlots`), so a skill that comes back in every mock is asked in a different form.
- **Untaken tests.** A registered test with no finished attempt has not produced any events yet. Its key words and primary skills or concepts are *pending*. P is multiplied by 0.3 (`PENDING_FACTOR`) once per untaken test that holds the item, and the allocators take pending items only after every other candidate, fewest holders first. So briefs made back to back spread across new targets instead of repeating the same weak items. Once every item is held (50 quant concepts fill after two tests of 27), the least-held come first, so further briefs rotate through the whole pool. Briefs not yet registered count too, but only when they are written to the same `content/briefs/`: make the briefs one after another, even when the authoring runs in parallel. Once the test is taken, its events count as usual. Where a pool is smaller than its slots (11 reading slots, 9 reading skills), pending items still fill the remainder.

## Repeats: revisits, not copies

The scores above work per concept or word, and nearly every quant concept carries some weakness evidence, so a concept coming back says nothing about *how* it should be asked. Two rules keep the repetition useful:

- **Everything is new by default.** The brief lists each concept's earlier setups (`conceptHistory`) and each key word's earlier items with their distractors. `check` rejects a quant item whose masked stem matches an earlier item of its concept (from quant-007 on) and a verbal TC or SE item that brings back an earlier item's distractors or SE key pair (from verbal-008 on). The novelty judge catches disguised copies. A key word may return; its sentence logic and company may not.
- **Revisits come from your misses.** `revisitQueue` (`lib/priority/revisit.ts`) holds the items whose latest finished answer was wrong or guessed, at least `REVISIT_MIN_DAYS` (3) old and not yet revisited. Items from untaken tests never qualify. The brief pairs up to `REVISIT_MAX` (4) of them with its slots: a quant concept slot of the same concept, or a verbal key word the item had as a key. It also names a structural change, in turn: run it backwards, change the format, add a concept, move the trap (verbal: new sentence logic, new format, a new partner or sense, new context and distractors). The author writes a sibling and sets `revisits: "<test>:<qid>"`. The validator checks the link (an earlier test, the same concept or a shared key word, at most 4 per test). The judge's **similar** to that item passes; **same** is still a rewrite. Review shows the link back to the earlier question and how it went.

A setup you answered right stays in the history and is not asked again. A missed one comes back once as a sibling, and if you miss the sibling, the sibling becomes the next revisit.

## Reading skills

Each RC question has one primary skill tag (`kind: "concept"`; areas `reading` / `argument`, stored in the concepts table) and optionally a secondary one. A skill gets the concept events and weights above. The "slow" threshold is the verbal pace (90 s per question), so the first question on a long passage, which includes reading time, can register as slow. The skills' `yield` comes from how often each skill is tested in medium/hard official reading items (`scripts/concept_yields.py`). The official items' skills were assigned from their question stems (`reference/rc_skills.jsonl`, local only). After tagging questions a user has already answered, run `npm run backfill:concepts`.

## On /stats

- **In next test**: chance the item is picked by the next `npm run brief`. The page reruns the brief's own allocators (`allocateVerbalKeys`, `allocateConcepts`) 200 times with different seeds and counts the picks (`selectionOdds`). Review picks are deterministic (≈100%); new and wildcard picks are random among ties, so they come out fractional.
- **Weakness**: `S` as a percentage, a smoothed estimate of the chance of missing the item next time.
- **Avg time**: mean `time_ms` of the responses where the word was the key, or the concept/skill was tagged (via `item_events.response_id`).
- Every number has a hover/tap explanation built in `lib/priority/explain.ts` from the item's own inputs.

## Question types

`lib/qtypes.ts` gives each blueprint type a friendly name, a one-line description and a target pace (seconds at real-exam speed). Per type: miss chance `(wrong + ½·guessed-right + 1) / (n + 2)`; slowness `clamp((avg / pace − 0.8) / 0.7, 0, 1)`; practice need `0.7·miss + 0.3·slow`. `npm run brief` writes this ranking as `typeFocus`, and the author puts the weakest review items on the top two types.

## Score estimate

`estimateBand` (`lib/scoring.ts`) is deliberately strict: a guessed-right answer earns ½ credit, unanswered counts as wrong, and the accuracy maps to 130–170 on a curve close to an official section (50% → 150, 70% → 156, 80% → 160, 94% → 166), with no bonus for the mocks being harder. The range is a ±1 standard-error Wilson interval, so short or partial attempts get wide bands.
