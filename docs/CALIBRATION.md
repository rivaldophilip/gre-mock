# Difficulty calibration against real GRE items (levels 6 and 7)

Levels 1–5 follow official P+ bands (docs/QUIZ-AUTHORING.md). In November 2026 we checked our tests against real GRE items. Some quant items turned out harder than typical official hard items, so quant now has two more levels. Numbers are in `data/difficulty-calibration.json`.

## Method

- **Anchors** (local only, never committed):
  - PowerPrep Test 1, the first verbal and quant sections (40 items, from the explanation PDF in `../books/`). This is the medium section every test-taker sees.
  - 80 official items of known P+ from `../books/extracted/reference/items.jsonl`: 10 per level L2–L5 per measure, stratified by type. Four of them were dropped because extraction broke them (wrong passage attached, or a missing premise).
- **Rulers.** Each set was blind-solved by the `gre-blind-solver` agent on two models:
  - Sonnet: two runs on the anchors. It is the authoring solver.
  - Haiku: never used as an authoring target, so its ratings are not biased by rewrites aimed at it.
  - Each reported difficulty rating, 1–5, is the measurement. Accuracy is useless as a signal: both models get 95–100% of official items right at every level, so they are no stand-in for human test-takers.
- **How well the ratings track P+** (correlation with official P+):
  - Quant: −0.58 (Sonnet) and −0.50 (Haiku), usable.
  - Verbal: −0.22 (Sonnet) and −0.04 (Haiku), close to noise.

## Results (mean rating)

| set | Sonnet quant | Haiku quant | Sonnet verbal |
|---|---|---|---|
| official L2 / L3 / L4 / L5 | 1.75 / 1.94 / 2.25 / 2.75 | 2.60 / 3.00 / 2.90 / 3.60 | 2.50 / 2.78 / 2.72 / 3.05 |
| PowerPrep T1 section 1 | 2.12 | 2.65 | 2.48 |
| ours, authored L3 / L4 / L5 | 2.18 / 2.81 / 3.49 | 2.54 / 3.33 / 3.80 | 2.31 / 2.70 / 3.13 |

- **PowerPrep section 1** rates between official L3 and L4 (estimated P+ ≈ 46), as a medium section should. This sanity-checks the rulers.
- **Quant** is about one level harder than labelled on Sonnet: our L4 ≈ official L5, and our L5 sits 0.7 above it. On Haiku the gap is about 0.2–0.4. Part of the Sonnet gap comes from the authoring checker: its offset of 1.5 was measured on 8 items, while the official means imply about 2 at L4–L5, so authors were pushed past official difficulty.
- **Verbal** L5 ≈ official L5. The rulers cannot separate verbal levels finely, so verbal gets no levels above 5.

## Levels 6 and 7 (quant only)

Per item, the score is z = mean over the two rulers of (rating − official-L5 mean) / official-L5 SD, using Sonnet 2.75 ± 0.64 and Haiku 3.60 ± 0.49 (two Haiku runs averaged).

| level | rule | among official items | meaning vs. GRE hard (L5: P+ under 30, median about 22) |
|---|---|---|---|
| 6 | z ≥ 1 | 1 of 38 official items (1 of 10 official hard items) | Matches the hardest tenth of official hard items, an estimated P+ of about 10–17. That is about 1.3–2 times fewer correct answers than a median hard GRE item. |
| 7 | z ≥ 2 | none (the highest official z is 1.38) | Beyond every official item measured, an estimated P+ under 10 (extrapolated). That is more than 2 times fewer correct answers than a median hard item. |

The levels only ever go up: an item is never lowered by this calibration. The first pass retagged 44 quant items to L6 and 4 to L7 across quant-001 to quant-010.

## Caveats

- An LLM's rating is not a human P+. Official items may also sit in the models' training data, which would make them look easier than they are. Treat L6 and L7 as "harder than official hard items on the same ruler", not as measured P+.
- Our Sonnet ratings are slightly inflated because authors rewrote items until Sonnet rated them high enough. Haiku carries half the weight of z for this reason.

## Re-running

1. Build the anchor blind copies (`content/.blind/pp1-*.md`, `content/.blind/off-*.md`, with keys alongside).
2. Run the solver on each anchor (Sonnet twice, Haiku at least once) and on each quant test's blind copy (Haiku twice).
3. Compute z with the formula above and set `difficulty` to 6 or 7 where it qualifies.
4. Re-register the tests.

The authoring "too easy" check caps targets at 5, so L6 and L7 come only from this calibration.
