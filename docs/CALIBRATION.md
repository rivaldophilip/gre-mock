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

The levels only ever go up: an item is never lowered by this calibration.

**Cap: at most 2 items at level 6+ per section.** The real GRE has almost none, so more would turn a mock into a poor guide to test day. The validator enforces the cap. For new quant tests the blind check flags a section with more than 2 items rated 4+ and names the extra ones to ease. Existing mocks over the cap had their extra items rewritten to official-L5 difficulty and re-rated. The first pass retagged 44 quant items to L6 and 4 to L7 across quant-001 to quant-010. Applying the cap below then eased 13 of the L6 items. Re-rated, 9 of them now measure L5 and 4 measure L4 (retagged 4). That leaves 31 at L6 and 4 at L7.

## Caveats

- An LLM's rating is not a human P+. Official items may also sit in the models' training data, which would make them look easier than they are. Treat L6 and L7 as "harder than official hard items on the same ruler", not as measured P+.
- Our Sonnet ratings are slightly inflated because authors rewrote items until Sonnet rated them high enough. Haiku carries half the weight of z for this reason.

## Re-running

1. Build the anchor blind copies (`content/.blind/pp1-*.md`, `content/.blind/off-*.md`, with keys alongside).
2. Run the solver on each anchor (Sonnet twice, Haiku at least once) and on each quant test's blind copy (Haiku twice).
3. Compute z with the formula above and set `difficulty` to 6 or 7 where it qualifies.
4. Re-register the tests.

The authoring "too easy" check caps targets at 5, so L6 and L7 come only from this calibration.

## Level mix per mock vs official material (2026-11-08)

The ruler score is z: 0 is a typical official hard item (L5), negative is easier. The profile columns sort items by z into official-equivalent bands:
- ≤L2-like: z < −1.52
- L3–4-like: −1.52 to −0.55 (the ruler cannot separate official L3 from L4)
- L5-like: −0.55 to 1
- L6: 1 to 2
- L7: 2 and above

**Reference sets on the ruler**

| set | mean z | ≤L2 / L3–4 / L5 / L6 / L7 |
|---|---|---|
| quant official L2, L3, L4, L5 | −1.80, −1.24, −1.10, 0.00 | L5 set: 0 / 4 / 5 / 1 / 0 |
| quant PowerPrep T1 section 1 (20) | −1.46 | 8 / 6 / 6 / 0 / 0 |
| verbal official L2, L3, L4, L5 | −0.35, −0.67, −0.44, 0.00 | L5 set: 1 / 1 / 5 / 3 / 0 |
| verbal PowerPrep T1 section 1 (20) | −0.75 | 5 / 9 / 5 / 1 / 0 |

**Real P+ mix of the official corpus (share of items per level)**

| source | L2 | L3 | L4 | L5 |
|---|---|---|---|---|
| quant, Official Guide | 37% | 26% | 24% | 13% |
| quant, Big Book | 55% | 23% | 15% | 7% |
| verbal, Official Guide | 39% | 29% | 20% | 12% |
| verbal, Big Book | 56% | 34% | 8% | 2% |

**Our mocks** (27 items each: L3 / L4 / L5 / L6 / L7 after the cap; the ruler columns were measured before it)

| mock | levels | mean z | ruler profile ≤L2 / L3–4 / L5 / L6 / L7 |
|---|---|---|---|
| quant-001 | 4 / 13 / 7 / 3 / 0 | −0.36 | 5 / 4 / 15 / 3 / 0 |
| quant-002 | 5 / 13 / 6 / 3 / 0 | −0.63 | 9 / 2 / 12 / 4 / 0 |
| quant-003 | 5 / 11 / 8 / 3 / 0 | −0.33 | 5 / 6 / 12 / 4 / 0 |
| quant-004 | 5 / 9 / 9 / 4 / 0 | −0.16 | 5 / 6 / 11 / 5 / 0 |
| quant-005 | 5 / 12 / 8 / 2 / 0 | −0.43 | 6 / 2 / 17 / 2 / 0 |
| quant-006 | 5 / 11 / 7 / 4 / 0 | +0.09 | 1 / 5 / 15 / 6 / 0 |
| quant-007 | 5 / 12 / 6 / 2 / 2 | 0.00 | 5 / 3 / 13 / 4 / 2 |
| quant-008 | 5 / 13 / 5 / 4 / 0 | −0.14 | 4 / 4 / 14 / 5 / 0 |
| quant-009 | 5 / 10 / 8 / 4 / 0 | −0.09 | 3 / 6 / 11 / 7 / 0 |
| quant-010 | 5 / 11 / 7 / 2 / 2 | −0.03 | 4 / 4 / 13 / 4 / 2 |
| verbal-001 | 5 / 12 / 10 / – / – | −0.36 | 2 / 8 / 16 / 1 / 0 |
| verbal-002 | 5 / 13 / 9 / – / – | −0.11 | 2 / 5 / 18 / 2 / 0 |
| verbal-003 | 5 / 13 / 9 / – / – | −0.24 | 2 / 4 / 19 / 2 / 0 |
| verbal-004 | 5 / 12 / 10 / – / – | −0.12 | 4 / 2 / 18 / 3 / 0 |
| verbal-005 | 5 / 12 / 10 / – / – | −0.36 | 4 / 6 / 17 / 0 / 0 |
| verbal-006 | 5 / 12 / 10 / – / – | −0.54 | 6 / 5 / 16 / 0 / 0 |
| verbal-007 | 5 / 13 / 9 / – / – | −0.47 | 5 / 7 / 15 / 0 / 0 |
| verbal-008 | 5 / 12 / 10 / – / – | −0.27 | 3 / 5 / 17 / 2 / 0 |
| verbal-009 | 5 / 12 / 10 / – / – | −0.02 | 1 / 5 / 17 / 4 / 0 |

Verbal profiles above L5 are shown for information only. The verbal ruler puts some official L2 and L4 items at z ≥ 1 too, so no verbal item is retagged to 6 or 7.
