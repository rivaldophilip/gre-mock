# Priority model

Everything is derived from the append-only `item_events` table. Weights live in `lib/priority/config.ts`; the math in `lib/priority/compute.ts`; slot allocation in `lib/priority/allocate.ts`. Unit tests: `tests/priority.test.ts`. Each event row stores its weight when logged, so after changing a weight run `npm run reweight [-- --apply]` to bring logged events in line.

## Events

Positive weight = evidence of weakness, negative = mastery.

| Word event | Trigger | w |
|---|---|---|
| `dont_know` | tapped in review, or in Practice once the answer is shown (passage, TC/SE sentence, choice chips, or the passage/stem word chips) | +0.6 |
| `key_missed` | answer word you did not select | +0.8 |
| `distractor_chosen` | wrong word you selected | +0.6 |
| `key_guessed` | key selected, question flagged "guessed" | +0.3 |
| `key_partial` | key selected but the question was wrong (other types; not TC or SE, see below) | −0.3 |
| `key_correct` | key selected, question right, not guessed | −0.6 |
| `key_slow` | key right (`key_correct` or `key_guessed`), but the question took > 90 s (logged in addition) | +0.2 |
| `distractor_rejected` | distractor not picked on a question you got right | −0.15 |
| `exposure` | word in a passage/stem | 0 (coverage only; once per attempt, however many questions share the passage) |
| `seen_known` | word shown but not judged by the answer (passage, stem, or an unpicked distractor on a wrong question), logged alongside `exposure` | −0.3 (once per attempt; dropped if that attempt tagged the word `dont_know` or logged a `key_*` / `distractor_*` event for it) |
| `dismissed` | Dismiss on ticked words in the /stats weakest-words list (see Dismissing a word) | 0 |

Text completion and SE are judged per word: on a wrong question, a right blank (TC) or a right pick (SE) logs `key_correct` (or `key_guessed`), and the distractors of a right blank `distractor_rejected`; only the wrong blank's or pick's words log `key_missed` / `distractor_chosen`. `npm run rebuild:words [-- --apply]` re-derives the word events that older TC/SE answers logged.

A word tagged `dont_know` in an attempt where its answer also logged a weakness event (`key_missed`, `distractor_chosen`, `key_guessed`, `key_slow`) counts once toward S, at the largest of those weights (so a missed key tagged "didn't know" adds +0.8, not +1.4). The tag sits below `key_missed` and level with `distractor_chosen`: a miss shows the gap, the tag only reports it. Both events stay logged and still count for coverage.

Which words are "shown": `npm run tag` (run by `check`) tags every bank word in a verbal question's text (`stem`: the prompt, plus the choices of RC and argument questions) and in its passage (`passage`), except secondary-sense words, whose everyday use in prose is not the GRE word, and a few surface forms that only look like bank words (`NOT_THE_WORD` in `scripts/tag-test.ts`: "according", "species", "novels"). A TC/SE choice word keeps its key/distractor tag instead. The brief's passage words are tagged even when secondary-sense, and only they count toward check's "3-6 per passage".

`seen_known` is how a word you saw and understood loses priority: once the answer is shown (Practice) or in review, the passage's and stem's bank words are listed as chips with the choice words, and leaving one untapped is the evidence. One test gives one credit per word, however many questions show it, and tagging it "didn't know" later in review (or undoing a mis-tap) is reflected at once, since the rule is applied when scoring. It adds no coverage and does not count toward the streak. It is not backfilled: attempts finalized before it existed have none, and `rebuild:words` leaves it alone.

Concepts: primary wrong +0.8, secondary wrong +0.4, right-but-guessed +0.3, right-but-slow +0.2 (>105 s quant, >90 s verbal), primary right −0.6, secondary right −0.3.

**Silly mistakes (quant).** Once a wrong quant answer is shown (after Check in Practice, in review after the section in Exam), "Silly mistake?" marks it a slip rather than a gap (`responses.silly`, `POST /api/attempts/<id>/silly`). Its `concept_wrong_*` events then weigh `SILLY_FACTOR` (½): primary +0.4, secondary +0.2. Undoing restores the full weights. Only those events change: the answer still scores as wrong and still joins the revisit queue. `npm run reweight` keeps the halving.

Events are emitted when a response is *finalized*: on "Check answer" in Practice mode, on section end in Exam mode. Blank questions emit nothing (they are also left out of accuracy). Abandoning an attempt ("Discard attempt" on the dashboard) finalizes nothing, so an Exam section not yet submitted leaves no events; checked Practice answers and finished sections keep theirs. `npm run cleanup:unanswered [-- --apply]` removes events that older attempts logged for blanks.

The section clock (`lib/clock.ts`) pauses while the test-taker is off the page (Pause & exit, or the page hidden or closed) and resumes on return; a page that stops sending heartbeats for 60 s counts as paused from its last one.

## Scores per item (each event decayed by `0.5^(age_days/21)`)

- Weakness `S = (Σ⁺ + 0.5) / (Σ⁺ + Σ|⁻| + 1.5)`. Untested = 0.33.
- Coverage `C = min(1, n_key + 0.3·n_distractor + 0.15·n_passage)`; novelty `N = 1 − C`. For an exposure-only word (below), `n_passage` weighs 1, so one showing covers it.
- Due `D = min(1, days_since_last_test / I)`, `I = [1,3,7,14,30][min(streak,4)]`; never tested → 0.
- Yield `Y`: words `min(1, source_count/5)` +0.2 for secondary-sense/ETS words (+0.3 more for words attested in official materials); concepts hand-set in `data/concepts.json`.
- Priority `P = 0.40·S + 0.30·N + 0.15·D + 0.15·Y`, ×0.3 if tested in the last 2 days.

## Exposure-only words

Some bank words are too rare or too technical to be a fair TC / SE choice; the GRE would only show them in a passage. They are `exposureOnly` in `data/vocab.json`: every `passage`-tier word, plus the curated `data/exposure_only.txt` (rarities from other tiers; never a secondary-sense word, whose everyday-sense trap only works as a choice). `build_vocab.py` sets the flag and `npm run seed` copies it to `vocab.exposure_only`.

- **Shown, never chosen.** Briefs leave them out of key slots, both distractor lists, SE trap pairs and bank synonyms (`bankSynonyms`), and drill briefs leave them out altogether (a drill item has no passage). So they never get a revisit sibling either. Briefs from this rule on record `wordTargets.exposureOnlyChoices: false` (drill: `drillTargets`), and `check` rejects one used as a key or distractor; older tests keep theirs.
- **Covered by one showing.** A passage or stem showing gives C = 1, whatever is tapped. Weakness still moves as usual: leaving it untapped logs `seen_known`, a "didn't know" tap raises S.
- **Passage-word pool.** The brief's passage words take exposure-only words first: never shown (C < 1), then shown ones with weakness above the untested prior (tapped "didn't know"), by P, so a missed word returns in a later passage; untested bank words fill the rest of the 40.
- **/stats.** A covered exposure-only word counts as Tested on the Words card. The drill card's untested count leaves exposure-only words out.

## Dismissing a word

Ticking words on the /stats weakest-words list and pressing Dismiss (`POST /api/words/dismiss` with `ids`) is for a word you already know (a slip, such as a common word picked as a wrong choice) or one not worth the time. One `dismissed` event is logged, with weight 0, so S, coverage and recency do not change. While it is newer than the word's every positive event, `ItemScore.dismissed` holds and the word is not targeted anywhere: it is left off the weak list and the /stats odds, and the verbal brief (keys, SE partners, both distractor lists, the passage-word pool) and the drill brief drop it before allocating. The drill card's untested count leaves it out too. A later weakness event (a miss, a guess, a "didn't know" tap) brings it back with its full history; a right answer or a `seen_known` does not. It can still turn up when an author uses it unprompted. A row click ticks a word, Shift-click a range; the header row turns into the selection bar on wider screens, and a toolbar docks to the bottom on phones. Esc clears the ticks, Delete dismisses them, and a toast offers Undo. A secondary-sense word asks first and names its GRE sense, since that trap is usually why it was missed. "Dismissed (n)" under the list restores a word (`DELETE`, which removes its `dismissed` rows).

## Slot allocation (quiz assembly, and briefs)

The allocators below run when the app assembles a mock from the question bank (`lib/assemble`, `docs/BANK.md`): they pick the quiz's targets, and the fallback ladder finds an unseen item for each. `bank:gaps` runs them too, for the next two simulated mocks, to decide what the next bank batch should hold. A mock brief (`npm run brief`) still uses them for its slots.

- **New first.** While any item that no untaken test holds is still untested (never a key word, never a question's concept or skill, no weakness evidence), the allocator first gives a share of the slots to untested items (`allocateNewFirst`; half for quant concepts and reading skills, `NEW_KEY_SHARE` = 70% for verbal key words): never-seen ones before ones seen only in passages or as distractors, then by yield, ties random; quant spreads them round-robin over the four areas. The rest goes to the tested items by P. Either side fills in when the other runs dry, and held items still come last. The rules below apply once nothing untested is left. (Ranking everything by P alone would not do: an untested item's novelty alone puts its P (≈ 0.5) above that of a word missed a few days ago.)
- Verbal: 29 key slots — 50% review (weakness evidence, ranked by P), 40% new (N·Y), 10% wildcard (random Y ≥ 0.6). If a bucket runs dry (first test: no history) the others fill in. Then 7 SE pairs are formed (`pairSeKeys`): synonym pairs already among the picks, else a pick's best live bank synonym replaces the lowest-ranked non-review, non-secondary pick, but only one ranked no higher than the synonym, and never a pair an earlier SE item keyed. So all 29 picks can be keys (15 TC blanks + 7 × 2 SE). Distractors and passage words push untested words too (`lib/priority/config.ts`): the brief lists 60 never-seen words for distractors, seeded with `SE_TRAP_PAIRS` (7) pairs of bank synonyms for SE traps, and a separate pool of never-seen passage words. Words that an untaken test or another in-flight brief already shows as a distractor or passage word go last in both lists, so parallel briefs spend different words. At least `UNTESTED_DISTRACTOR_SHARE` (75%) of a test's distractor words come from the untested list (the rest from the weak list), and each reading passage weaves in at least `PASSAGE_WORDS_MIN` (5) passage words. The brief records both as `wordTargets`, and `check` rejects a test that misses them; briefs written before keep the old aims (about 40% weak distractors, 3–6 passage words). Set the three values back to 0.5 / 0.6 / 3 to rebalance toward review once the bank is covered.
- Quant: 27 concept slots — 50% highest weakness·yield, 35% least covered, 15% balance the four areas. Each slot also gets a variant from `data/concept_variants.json`: the one used least for that concept, ties random (`assignVariants`). Uses are counted from the tests' own `variant` fields (every quant question records one), plus the `variant` of briefs whose test is not written yet. So a concept that recurs is tested in a different form. The brief also lists, under each slot, the setups earlier tests used for that concept (`conceptHistory` in `lib/setup-history.ts`), with those used in two or more tests marked **worn**. Weak concepts are meant to come back; their setups are not.
- Reading skills: the 13 RC slots get skills from `data/rc_skills.json` by the same 50 / 35 / 15 rule. The 2 argument slots draw from the `argument` area, the other 11 from `reading`. Skills repeat when there are more slots than skills, and the brief lists official exemplars per skill. Each skill slot also gets a variant from `data/concept_variants.json` the same way as quant (least used across earlier verbal briefs, field `variant` on `skillSlots`), so a skill that comes back in every mock is asked in a different form.
- **Holds** (`lib/holds.ts`). A ready or started quiz, or a mock with an open exam or practice attempt, *holds* its items: no other quiz or the drill may take them, and what they aim at (key words, primary concepts or skills) is *pending* for allocation. Briefs (mock and bank batch) count the same holds (`bankHolds`, `scripts/lib/brief-parts.ts`), plus briefs whose source is not synced yet. A cancelled or finished quiz holds nothing; its unseen items go back to the stock.
- **Untaken tests.** A held test has not produced any events yet. Its key words and primary skills or concepts are *pending*. P is multiplied by 0.3 (`PENDING_FACTOR`) once per untaken test that holds the item, and the allocators take pending items only after every other candidate, fewest holders first. So briefs made back to back spread across new targets instead of repeating the same weak items. Once every item is held (50 quant concepts fill after two tests of 27), the least-held come first, so further briefs rotate through the whole pool. Briefs whose source is not synced yet count too, but only when they are written to the same `content/briefs/`: make the briefs one after another, even when the authoring runs in parallel. Once the test is taken, its events count as usual. Where a pool is smaller than its slots (11 reading slots, 9 reading skills), pending items still fill the remainder.

## Endless vocab (the drill)
- **What it is.** The Endless vocab card on the verbal tab serves single TC / SE items one at a time (`/drill`). The pool is the bank's shared TC / SE stock (`lib/drill.ts`): every active item of any source (mocks, drill batches, bank batches) that is neither seen nor held. The drill and assembled mocks draw on one pool, so an item answered in either is gone from both, and the stock target counts drill use (`docs/BANK.md`). New stock comes from **tcse** bank batches, which aim at untested words as drill batches did.
- **Events.** A drill answer logs events only when it is checked, exactly like a practice answer (`finalizeResponse`), so drill results feed /stats and every later brief. Leaving or reloading an unchecked question logs nothing. "Didn't know" taps work as in practice mode. A drill attempt (`mode: "drill"`, untimed) is kept per source and stays open; it holds nothing. Drill attempts are left out of mock attempt lists, bands and the progress chart (`isListed`).
- **Picking.** `drawDrill` (`lib/drill-pick.ts`) draws among unseen items, weighted by `(1 + untested choice words)²` at the moment Next is pressed. A shown item never comes back; a missed one returns as a sibling in a later batch (a tcse brief's revisits), or as a reused item in a quiz whose bank ran short.
- **Replay misses.** "Replay misses" (`/drill?replay=1`) re-asks missed TC / SE items from the verbal mocks and the drill batches, one at a time, in random order. An item is in the miss pool while its latest locked answer, in any attempt (exam, practice, retake, drill or replay), is wrong, blank or guessed (`latestMisses`). A sure right answer anywhere takes it out, and a later miss puts it back. A replay attempt (`mode: "replay"`, one per source test, never finished) logs **no item events**, because recognising a question already seen proves little about its words. The same holds for an item a quiz **reused** (fallback ladder steps 4–6, `docs/BANK.md`): it is scored, but logs no item events and is left out of the concept, skill and type accuracy on /stats. Replays leave word scores, /stats coverage, `typeFocus` and the revisit queue unchanged, so a fixed miss still gets its sibling in a later brief. "Didn't know" taps still log as usual.

## Repeats: revisits, not copies

The scores above work per concept or word, and nearly every quant concept carries some weakness evidence, so a concept coming back says nothing about *how* it should be asked. Two rules keep the repetition useful:

- **Everything is new by default.** The brief lists each concept's earlier setups (`conceptHistory`) and each key word's earlier items with their distractors. `check` rejects a quant item whose masked stem matches an earlier item of its concept (from quant-007 on) and a verbal TC or SE item that brings back an earlier item's distractors or SE key pair (from verbal-008 on). The novelty judge catches disguised copies. A key word may return; its sentence logic and company may not.
- **Revisits come from your misses.** `revisitQueue` (`lib/priority/revisit.ts`) holds the items whose latest finished answer was wrong or guessed, at least `REVISIT_MIN_DAYS` (3) old and not yet revisited. Items from untaken tests never qualify. The brief pairs up to `REVISIT_MAX` (4) of them with its slots: a quant concept slot of the same concept, or a verbal key word the item had as a key. It also names a structural change, in turn: run it backwards, change the format, add a concept, move the trap (verbal: new sentence logic, new format, a new partner or sense, new context and distractors). The author writes a sibling and sets `revisits: "<test>:<qid>"`. The validator checks the link (an earlier test, the same concept or a shared key word, at most 4 per test). The judge's **similar** to that item passes; **same** is still a rewrite. Review shows the link back to the earlier question and how it went.

A setup you answered right stays in the history and is not asked again. A missed one comes back once as a sibling, and if you miss the sibling, the sibling becomes the next revisit.

## Reading skills

Each RC question has one primary skill tag (`kind: "concept"`; areas `reading` / `argument`, stored in the concepts table) and optionally a secondary one. A skill gets the concept events and weights above. The "slow" threshold is the verbal pace (90 s per question). The first question opened on a passage that two or more questions share also carries the passage's first read, so its threshold is raised by the passage length at `READING_WPM` (250 words a minute; about +60 s for 260 words). That question is the attempt's lowest response id among the passage's questions, since leaving a question always saves it. Later questions get no allowance: looking back at the passage is part of answering them. `npm run rebuild:slow [-- --apply]` drops the older slow events the allowance excuses. The skills' `yield` comes from how often each skill is tested in medium/hard official reading items (`scripts/concept_yields.py`). The official items' skills were assigned from their question stems (`reference/rc_skills.jsonl`, local only). After tagging questions a user has already answered, run `npm run backfill:concepts`.

## On /stats

- **In next test**: chance the item is picked by the next `npm run brief`. The page reruns the brief's own allocators (`allocateVerbalKeys`, `allocateConcepts`) 200 times with different seeds and counts the picks (`selectionOdds`). Review picks are deterministic (≈100%); new and wildcard picks are random among ties, so they come out fractional.
- **Weakness**: `S` as a percentage, a smoothed estimate of the chance of missing the item next time.
- **Avg time**: mean `time_ms` of the responses where the word was the key, or the concept/skill was tagged (via `item_events.response_id`).
- Every number has a hover/tap explanation built in `lib/priority/explain.ts` from the item's own inputs.

## Question types

`lib/qtypes.ts` gives each blueprint type a friendly name, a one-line description and a target pace (seconds at real-exam speed). Per type: miss chance `(wrong + ½·guessed-right + 1) / (n + 2)`; slowness `clamp((avg / pace − 0.8) / 0.7, 0, 1)`; practice need `0.7·miss + 0.3·slow`. `npm run brief` writes this ranking as `typeFocus`, and the author puts the weakest review items on the top two types.

## Score estimate

`estimateBand` (`lib/scoring.ts`) is deliberately strict: a guessed-right answer earns ½ credit, unanswered counts as wrong, and the accuracy maps to 130–170 on a curve close to an official section (50% → 150, 70% → 156, 80% → 160, 94% → 166), with no bonus for the mocks being harder. The range is a ±1 standard-error Wilson interval, so short or partial attempts get wide bands.
