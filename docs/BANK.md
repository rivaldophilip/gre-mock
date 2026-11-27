# Question bank and quiz assembly

Questions are written ahead of time by topic and kept in one shared **question bank**. The webapp assembles each quiz from the bank when the user asks for one: a full mock or a custom quiz. Authoring (what to write next, writing, checking) and serving (what to ask this user now) are separate jobs.

- **Source of truth:** the JSON files in the repo: `content/tests` (mocks), `content/drill` (drill batches) and `content/bank/{quant,verbal}` (bank batches).
- **The bank database:** `npm run bank:sync` copies the files into `gre_bank`. The app reads `gre_bank`; it no longer reads `content/` at runtime, apart from the study guides.
- **No LLM calls in the app.** Claude Code refills the bank offline (`/bank-fill`), with the same check, blind-solver and novelty-judge steps as a mock.

## The bank database (`gre_bank`)

The schema is `lib/db/bank.ts`, with migrations in `drizzle-bank/` and config in `drizzle.bank.config.ts`. `npm run bank:init` creates the database and migrates it. `npm run db:migrate` migrates the registry, then the bank, then every user database.

The app reaches the bank only through `bankDb()` (`lib/db/index.ts`), and only reads it. `dbFor()` and the session check in `lib/auth.ts` accept `gre_u_<id>` names only, so a session can never name the bank. Item bodies include their keys, so only the server reads them.

| table | holds |
|---|---|
| `sources` | one row per file: kind (mock, drill or batch), measure, title, sections, position in source order |
| `items` | one row per question: `ref` (the primary key), type and `slotType`, section and position, `difficulty`, `solverRating`, `primary` concept or skill, `variant`, `setup`, `setupGroup`, `keyWords`, `revisits`, `unitId`, `passageId`, `figureId`, `status`, the `body` as written, `hash` |
| `passages`, `figures` | bodies by ref (`<source>:<id>`); a passage also has its kind (reading or argument), paragraph count and `domain` |
| `units` | sets served together: a passage with its questions, an argument, or a DI set, with a `shape` from its actual counts (`rc4-long`, `rc3`, `rc2`, `rc1`, `arg1`, `di3`) and its level span |
| `item_tags` | every tag of every item, with a passage's tags copied onto each of its questions |
| `batches` | a bank batch's brief and targets |
| `meta` | `version`, bumped by every sync that changes a row |

**Refs** are `<sourceId>:<qid>` (`quant-005:s2q14`, `qbank-003:s1q7`). Responses, revisit links and the review page's anchors (`qAnchor`) use them. A ref never changes. App code gets an item's ref from the loaded question (`refOf(q)`, `lib/ref.ts`), never by joining a test id and a question id. In an assembled quiz, `q.id` is a display id (`s1q1`).

**Sync.** `npm run -s bank:sync -- <id>… | --all` (`npm run register` is an alias):
- It validates every source first and refuses an invalid one.
- A bank batch also needs its blind and novelty checks on record. For a mock or drill batch, a missing check only warns.
- Rows are built by the pure `scripts/lib/bank-rows.ts` and upserted by hash, so an unchanged file costs only reads. Quant setup groups are recomputed (`conceptHistory`) and moved items regrouped.
- **Retire, never delete.** A `"retired": true` item keeps its row with status `retired`; quizzes and the drill skip it, but old attempts still show it. An item that has left its file becomes `gone`, never deleted, so every ref resolves.
- `npm run -s bank:verify` rebuilds every source from the bank and deep-compares it with its JSON. All sources must come back identical.
- `user:add` no longer registers anything: a new account reads the shared bank.

**In the app** (`lib/bank.ts`): item metadata and tags for the whole bank are loaded once and memoised per version. Bodies, passages and figures are fetched by ref and cached the same way. The version is re-read at most every 5 seconds, so a sync shows up without a redeploy. `loadTestById(db, id)` (`lib/test-load.ts`) returns either a source as written (retired items included, so its old attempts resume and review) or a `quiz-<id>` (`lib/virtual-test.ts`, `quizTest`). In a quiz, items are numbered `s1q1…` in layout order and passages, figures and DI sets are renamed `p1`, `a1`, `f1`, `d1`, since two sources can both have a `p1`. Every question carries its ref and a `reused` flag.

## Quizzes (per-user database)

- **`quizzes`** (migration `drizzle/0005`): `measure`, `kind` (mock or custom), `title`, `spec`, `seed` and `bankVersion`.
  - `layout`: each section's items in order, as `{ref, slotId, slotType, level, target, unitId, reused, revisitOf}`.
  - `fallbacks`: the slots the ladder could not fill exactly.
  - `status`: draft, ready, started, done, abandoned or cancelled.
  - An attempt at a quiz has `testId = "quiz-<id>"`. Starting it marks the quiz started; finishing marks it done; abandoning marks it abandoned.
- **`shortfalls`**: one row per fallback (and per slot of a quiz that could not be assembled at all, with quiz id 0): what was wanted (kind, id, level), the ladder step and the ref that filled it. `bank:gaps` reads the open ones and marks them resolved once the stock covers them.
- **`responses.reused`**: the response was to an item the quiz reused.
- Migration `0006` drops the old `tests`, `questions` and `question_items` tables. Stats, study and drill now look items up in the bank.

**Seen and held** (`lib/holds.ts`):
- An item is **seen** once any response has its ref.
- An item is **held** while a ready or started quiz includes it, or while a mock (a source id) has an open exam or practice attempt. Drill and replay attempts hold nothing.
- A new quiz and the drill take neither seen nor held items, except through ladder steps 4–6.
- Holds also feed `markPending` in assembly and in the briefs, as an untaken test used to.

**Reused items** count toward the attempt's score but log **no item events** (`logsItemEvents`, the same rule as a replay). They are left out of /stats concept, skill and type accuracy and out of the study guide's numbers. The review page shows a **Seen before** badge, and they cannot be marked "silly mistake". The miss that brought them back still queues a sibling for the next refill.

## Assembly (`lib/assemble/*`, pure, tested in `tests/assemble.test.ts`)

`lib/quiz.ts` builds the context from both databases (`lib/assemble/rows.ts`, `context.ts`). It creates a quiz as `ready` when nothing fell back, otherwise as a `draft` plus shortfall rows, written together. Proceed (`confirmQuiz`) first re-checks that nothing in the draft has been seen or held since; a stale draft is cancelled. The API is `POST /api/quizzes`, `POST /api/quizzes/[id]/confirm` and `DELETE /api/quizzes/[id]`.

**Mock** (`plan.ts`, then `index.ts`):

1. **Slots and targets.** Slots come from `data/blueprints.json`: one unit slot per DI set and per argument, and each section's reading questions as passages. Targets come from the brief allocators: `allocateConcepts` for quant concepts and for reading and argument skills, `assignVariants`, and `allocateVerbalKeys` plus `pairSeKeys` for verbal key words. A TC / SE slot aims at any of the 120 most needed words, the allocator's picks first: a bank item cannot be written to order.
2. **Units first.** DI sets, arguments, then reading. A section's reading total (4 and 7) is filled with the blueprint's split (2 + 2, 4 + 2 + 1) when unseen passages of those sizes exist, else with the nearest split of the same total (3 + 3 + 1, …). Older passages come in other sizes, so a different split is no fallback. At most 2 reading passages per quiz run past one paragraph.
3. **Revisits.** A miss at least `REVISIT_MIN_DAYS` old whose sibling (an item whose `revisits` is the miss's ref) is unseen goes into a free slot of the sibling's type, when what the miss was about is a target. At most `REVISIT_MAX` per quiz.
4. **Matching.** Quant concepts are matched to the single-item slots by stock (`matchTargets`: Kuhn's augmenting paths), first on an exact type and level, then on type only. The scarcest slots fill first.
5. **The ladder**, slot by slot (`ladder.ts`):
   1. unseen, the slot's target, a level still open for its type;
   2. unseen, the target, a level within one;
   3. unseen, a substitute target (the highest-priority one with stock);
   4. reuse an item missed or guessed before, same target and level;
   5. reuse a missed item, same target, any level;
   6. reuse a missed item of a substitute target;
   7. any unseen item of the slot's type;
   8. fail, and say what is missing.

   Levels are a multiset per section and type, so an item may take any level still open for its type. A unit has no level steps in a mock: step 1 is an unseen unit with a target skill or concept, 3 any unseen unit, 4–6 a unit whose every item was seen and one of them missed.
6. **Repair** (`rules.ts`). The blueprint rules (`lib/blueprint-rules.ts`) are checked: section averages, the L3 and L5 counts, at most 2 items at L6+, and at most 2 top-tier items per quant section (`solverRating` 4+, or L6+ for an item without a rating). Picks are swapped, using steps 1–2 only, until the rules pass. Whatever still fails becomes a fallback line. Whether a pick missed its level is then judged on the final layout: only items left over once levels are matched against the plan count as step 2.
7. **Order.** The opening TC (verbal) or QC (quant) block comes first, then SE; MC, select-all and numeric together; reading and arguments together; the DI set last. Each block is shuffled with the quiz's seed, and a set's questions keep their order.

No item, key word, SE key pair or quant setup group appears twice in one quiz. Scoring prefers the target concept, its least-used variant and a setup group not seen before (quant). For TC / SE it prefers the sum of priority over key words plus untested distractors. For units it prefers skill priority, untested passage words, closeness to the section's levels and a domain not yet in the section.

**Custom** (`custom.ts`): one section; minutes are each type's pace (`lib/qtypes.ts`) added up, and the timer is optional.
- The length is spread over the chosen types; a DI set takes 3 questions, and reading is filled with passages.
- Targets are the chosen concepts or skills, or **Target my weaknesses**: weakness evidence ranked by priority, or the most needed while none is weak yet. Any of them fills a slot exactly.
- Levels are spread evenly over the chosen range. Any level inside the range is exact; a set outside it is step 2.
- No blueprint rules apply. A custom quiz gets no score band and stays off the progress chart.

**Fallbacks.** Any fallback shows the confirmation dialog (`components/FallbackDialog.tsx`), with one line per slot, such as "wanted circles L5 → got circles L4 (nearby difficulty)". Proceed keeps the quiz; Cancel discards it and releases its holds. A draft stays on the dashboard under Ready until confirmed or discarded. Every fallback is logged as a shortfall.

## Drill on the shared pool

`lib/drill.ts`: the drill pool is every active TC / SE item of any source that is neither seen nor held. `drawDrill` is unchanged. An item answered in the drill is seen, so it never enters a mock, and the other way round. A drill attempt is per source (`testId` = the item's source, `mode: "drill"`) and stays open. Replay's miss pool reads the bank's TC / SE items, retired ones included.

## Stock target and refill

- **Stock target:** about `MOCKS_AHEAD` (2) full mocks ahead per measure. That means unseen L4 and L5 items for every concept and skill, enough of each slot type (TC / SE also a drill batch's worth), unseen units of each shape (quant `di3`; verbal `rc4-long`, `rc2`, `rc1`, `arg1`), and revisit siblings for misses.
- **`npm run -s bank:gaps [-- quant|verbal]`** (`scripts/lib/bank-gaps.ts`) ranks the gaps against that target. Demand is the next 2 simulated mocks (the allocators run twice, the second damped by the first), the drill buffer, unit shapes, open shortfalls (resolved here once covered) and unwritten siblings. It also **dry-runs** the next 2 mocks with the real assembler (`assembleMock`, the second holding what the first took): every slot that would fall back becomes a gap for its concept or skill at that level, with the slot's type, so L3 slots and a second item at one level are stocked before a quiz falls back. A logged concept or skill shortfall is a gap of that kind too, and the brief writes each such gap at the level and type it names. It ends with the batch to write when the weighted deficit reaches `DEFICIT_THRESHOLD` (10).
- **`npm run -s bank:brief [-- quant|verbal] [--kind quant|tcse|rc]`** writes `content/briefs/<id>.{json,md}`. The batch ids are `qbank-NNN` and `vbank-NNN`. Authoring rules are in `docs/QUIZ-AUTHORING.md`, Bank batches; the command is `/bank-fill`.
  - **quant:** 20–30 items over 4–8 concepts at levels 4 and 5 (or the level and type a gap names), revisit siblings, and a DI set when one is short. Each concept's earlier setups are listed once.
  - **tcse:** replaces drill batches. Standalone TC / SE items keyed with the words no unseen item keys, then untested words, with untested distractors and SE trap pairs. `check` enforces the drill's 90% brief-word share.
  - **rc:** a mock's reading (rc4-long, two rc2, rc1, two arguments) plus any shape the bank lacks, with skills, variants and passage words. Each passage records a `domain`.
- Pre-authored items cannot anticipate a future weak word. Assembly covers that with the ladder, and the next refill aims at the user's weak words.
