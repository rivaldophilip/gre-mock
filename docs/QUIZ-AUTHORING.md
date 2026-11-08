# Authoring a hard GRE mock test

Output: one **original** 27-question test (Section 1 = 12 questions, Section 2 = 15) as `content/tests/<measure>-NNN.json`. The same steps run for `verbal` and `quant`. **Never copy, closely paraphrase or reuse stems/passages from ETS or Big Book material.** The repo is public. Official items (local only, `../books/extracted/reference/items.jsonl`) are for style and difficulty calibration.

Read this page, the brief and `docs/HARD-PATTERNS.md`; nothing else is needed. Every command below prints what is wrong by question id and ends with a `next:` line naming the step to run. Open `lib/types.ts`, the scripts or older tests only if a message is not enough. Run the scripts as `npm run -s …` (no npm banner).

## Steps

1. **Brief.** `npm run -s brief -- <measure>` (add `--user <email>` once there is more than one account). Read `content/briefs/<id>.md`. It has the slot table (type, level and passage of every slot) and what to target:
   - verbal: key words with their bank synonyms, reading-skill slots, distractor words and passage words;
   - quant: concept slots.

   Skim `content/briefs/<id>.local.md` (official exemplars, one per slot type and level) only for a type you are unsure how to pitch. The `.json` brief is for scripts; don't read it.
2. **Author** the whole test in one Write, using the shapes below. Write `$...$` for math. Spend the brief as the structure rules say:
   - key words as keys;
   - distractor words for about 40% of distractors, with the weak ones first;
   - 3-6 passage words woven into each reading passage;
   - the weakest review items on the slots of the brief's type-focus line, if it names any.

   Write each RC question's skill tag and each quant question's concept tags. Do **not** write word tags; check fills them. An irregular form (`forsworn`) is the one exception: tag that by hand.

   **Quant:** also write `content/verify/<id>.py` with `content/verify/keys.py`, using `content/verify/quant-002.py` as the example. Compute each answer (brute force, or exact arithmetic with `fractions`) and hand it to `t.qc` / `t.choice` / `t.where` / `t.sel` / `t.value`, which compare it with the JSON key. End with `t.done()`. Never restate a key by hand.
3. **Check.** `npm run -s check -- <id>` after the Write and after every round of Edits, until it prints `OK`. Fix with Edit, not a rewrite. One run does all of the following:
   - fills the verbal word tags;
   - validates the test, including the 25% overlap check against earlier tests and the official corpus;
   - runs the quant verify script;
   - prints the difficulty rules and coverage against the brief: unused key words, skill slots, passage words per passage, and quant concepts.

   A key choice that is not a bank word fails here, and the message names bank words with that sense. Treat coverage gaps as things to fix where the brief allows; they are not errors.
4. **Blind-solve with one solver.**
   - `npm run -s blind -- <id>` writes `content/.blind/<id>.md`. This copy has no keys, explanations, tags or difficulty, and it includes the skill list.
   - Give that path to the `gre-blind-solver` agent. Pass its reply straight to the checker, with no file to write: `npm run -s blind -- <id> --check - <<'EOF'` … reply … `EOF`. The checker saves the reply to `content/.blind/<id>.answers.txt` and prints only what needs action, one line per issue, each with the solver's note and what to do:
     - **WRONG** (key and solver answer, both in letters) or **flagged** (a real ambiguity): rewrite the item.
     - **Too easy:** the check already adds the solver's rating offset (`data/solver-calibration.json`; solvers rate about 1.5 levels below official difficulty). It offers either a rewrite, or a retag to the honest level when the section rules still pass. Take the retag only if the item is otherwise sound.
     - **Skill mismatch:** make the stem test the tagged skill, or retag it if the brief's skill mix still holds.
   - After fixes, run `npm run -s check -- <id>`, then `npm run -s blind -- <id> --only s1q3,s2q5`. This writes `<id>.only.md`, and the full copy stays. SendMessage that path to the **same** solver, then check its reply with `--check - --only s1q3,s2q5`.
5. **Register and publish.** `npm run -s register -- <id>` writes to every user's database. It refuses a test that does not validate, and warns if no blind check is on record. Then run `git add content && git commit && git push` (Vercel redeploys).

Recalibrate only after changing the solver's model: `npm run -s blind -- --calibrate verbal|quant` builds a local file of official items with known P+. Give it to the solver, then `--calibrate <measure> --check -` with its reply stores the new offset.

**Improving the pipeline.** After a run, `python3 scripts/session_stats.py` (add `--commands` for the command list) summarizes the newest transcript: tool calls, errors, how many check and blind rounds ran, and tokens. When a step keeps looping or erroring, fix its script's message or this page, not the next test.

## Structure rules (the validator enforces most)

- Difficulty levels: 3 = P+ 45–60, 4 = 30–45, 5 = < 30. Section 1 average ≥ 3.75 (about 4×L3, 5×L4, 3×L5). Section 2: ≤ 2 items at L3, ≥ one-third at L5, average ≥ 4.2.
- Each section opens with its TC block (verbal) or QC block (quant). Within a type block, mix easy and hard; don't climb.
- Question ids are `s1q1` … `s2q15`. Passages are `p1, p2, …` (reading) and `a1, a2` (arguments), as the brief's slot table assigns them.
- **Verbal.** TC: 1 blank = 5 choices; 2–3 blanks = 3 choices per blank; one `___` per blank, written `(i) ___` when there are several. SE: 6 choices, 2 keys. RC: `rc` has 5 choices; `rc_multi` has 3 choices, select all; `rc_select` keys a sentence index across the whole passage (sentences split on `. ` before a capital). Arguments: `type: "rc"`, `subtype: "arg"`, a one-paragraph passage.
- **Verbal key words.** Spend the brief's 29 key words (each in the GRE sense the brief gives) as the keys of the 15 TC blanks and 7 SE pairs. For an SE pair, use two key words the brief marks with `*`. If there aren't enough such pairs, pair a key word with one of its listed bank synonyms, and use any leftover key words as distractors. For words marked `[secondary]`, build the sentence so the everyday sense is the trap.
- **Verbal skill tags.** Every RC question gets exactly one `{"kind":"concept","id":<skill>,"role":"primary"}` from the brief, plus an optional `secondary`. Argument items need an `arg-*` skill; `rc-select-verify` suits `rc_multi`. Write the stem so the skill is unambiguous (function: "…primarily in order to").
- **Quant.** QC key: 0 = A greater, 1 = B greater, 2 = equal, 3 = cannot be determined. MC: 5 choices. `mc_multi`: 5–6 choices, at least 1 key. `numeric`: `{"kind":"single"|"fraction"}`, key `{"value":"3/8"}`. Section 1 has one 3-question data-interpretation set sharing `setId` and `figureId`; the figure is a `table` or inline `svg`. Each question gets one `primary` concept tag from `data/concepts.json`, plus optional `secondary` tags.
- **Explanations.** Verbal: `key` (why the key fits: signal words, logic per blank) and `distractors` (choice text → why it fails, including the SE trap pair). Quant: `steps` (numbered), `fast` and `trap`.
- Every item gets a `difficulty` of 1–5. No placeholders, no `TODO`.

## Shapes (copy these; word tags are added by `npm run -s check`)

```json
{ "id": "verbal-003", "measure": "verbal", "title": "Verbal Hard Mock 3",
  "sections": [{ "n": 1, "minutes": 18 }, { "n": 2, "minutes": 23 }],
  "passages": [
    { "id": "p1", "paragraphs": ["First paragraph.", "Second paragraph."] },
    { "id": "a1", "paragraphs": ["One-paragraph argument."] } ],
  "figures": [],
  "questions": [
    { "id": "s1q1", "section": 1, "type": "tc", "difficulty": 4, "prompt": "… ___ …",
      "blanks": [["w1", "w2", "w3", "w4", "w5"]], "key": { "sel": [2] },
      "explanation": { "key": "…", "distractors": { "w1": "…", "w2": "…", "w4": "…", "w5": "…" } } },
    { "id": "s1q3", "section": 1, "type": "tc", "difficulty": 5, "prompt": "… (i) ___ … (ii) ___ … (iii) ___ …",
      "blanks": [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]], "key": { "sel": [1, 2, 0] },
      "explanation": { "key": "(i) … (ii) … (iii) …", "distractors": { "a": "…" } } },
    { "id": "s1q4", "section": 1, "type": "se", "difficulty": 4, "prompt": "… ___ …",
      "choices": ["w1", "w2", "w3", "w4", "w5", "w6"], "key": { "sel": [1, 3] },
      "explanation": { "key": "…", "distractors": { "w1": "Trap pair with w5: …" } } },
    { "id": "s1q8", "section": 1, "type": "rc", "difficulty": 4, "passageId": "p1", "prompt": "The primary purpose of the passage is to",
      "choices": ["…", "…", "…", "…", "…"], "key": { "sel": [2] },
      "explanation": { "key": "…", "distractors": { "…": "…" } },
      "tags": [{ "kind": "concept", "id": "rc-main-idea", "role": "primary" }] },
    { "id": "s1q9", "section": 1, "type": "rc_multi", "difficulty": 5, "passageId": "p1",
      "prompt": "Consider each of the choices separately and select all that apply. The passage suggests which of the following about …",
      "choices": ["…", "…", "…"], "key": { "sel": [0, 2] }, "explanation": { "key": "A: … B: … C: …" },
      "tags": [{ "kind": "concept", "id": "rc-select-verify", "role": "primary" }, { "kind": "concept", "id": "rc-inference", "role": "secondary" }] },
    { "id": "s1q11", "section": 1, "type": "rc_select", "difficulty": 3, "passageId": "p2", "prompt": "Select the sentence that …",
      "key": { "sel": [3] }, "explanation": { "key": "The fourth sentence (…) …" },
      "tags": [{ "kind": "concept", "id": "rc-detail", "role": "primary" }] },
    { "id": "s1q12", "section": 1, "type": "rc", "subtype": "arg", "difficulty": 4, "passageId": "a1",
      "prompt": "Which of the following, if true, most seriously weakens the argument?",
      "choices": ["…", "…", "…", "…", "…"], "key": { "sel": [1] }, "explanation": { "key": "…" },
      "tags": [{ "kind": "concept", "id": "arg-weaken", "role": "primary" }] } ] }
```

Quant question shapes (the test wrapper is the same, with `"measure": "quant"` and the figures it uses):

```json
{ "id": "s1q1", "section": 1, "type": "qc", "difficulty": 4, "prompt": "$0 < x < 1$.", "qc": { "a": "$\\dfrac1x$", "b": "$1+x$" },
  "key": { "sel": [3] }, "explanation": { "key": "…", "steps": ["…"], "trap": "…" },
  "tags": [{ "kind": "concept", "id": "number-sense-qc", "role": "primary" }] }
{ "id": "s1q5", "section": 1, "type": "mc", "difficulty": 3, "prompt": "…", "choices": ["5", "8", "10", "12", "15"], "key": { "sel": [2] }, "explanation": { "key": "…", "steps": ["…"], "fast": "…", "trap": "…" }, "tags": [ … ] }
{ "id": "s1q8", "section": 1, "type": "mc_multi", "difficulty": 4, "prompt": "… Select all …", "choices": ["…", "…", "…", "…", "…", "…"], "key": { "sel": [1, 3, 5] }, "explanation": { … }, "tags": [ … ] }
{ "id": "s1q9", "section": 1, "type": "numeric", "difficulty": 3, "prompt": "…", "numeric": { "kind": "single" }, "key": { "value": "24" }, "explanation": { … }, "tags": [ … ] }
{ "id": "s1q10", "section": 1, "type": "mc", "setId": "di1", "figureId": "fig1", "difficulty": 4, "prompt": "…", "choices": [ … ], "key": { "sel": [2] }, "explanation": { … }, "tags": [ … ] }
"figures": [{ "id": "fig1", "caption": "…", "table": { "head": ["Division", "2019"], "rows": [["North", "48"]] } }]
```

## Hardness checklist
See `docs/HARD-PATTERNS.md`. In short: 3-blank TCs with a pivot and stacked negation; secondary senses; SE trap pairs (true synonyms that don't fit the sentence); dense academic RC with half-right and extreme distractors, EXCEPT-style multi items, and select-all with an unsupported-but-true choice; weaken/assumption arguments; QC with hidden cases (negatives, fractions, zero, figures not to scale); multi-answer quant needing min/max bounding. Make a clue indirect rather than definitional: a sentence that defines the key in other words reads as level 2.
