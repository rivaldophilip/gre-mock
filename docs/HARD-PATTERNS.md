# What makes GRE items hard (analysis in our own words)

Derived from the official items with low P+ (share of real test-takers correct): verbal items at P+ ≤ 35 and the "Hard" practice sets, quant items at P+ ≤ 40. This is analysis only; nothing here reproduces official text. Observed in the corpus: official verbal items span P+ 10–94 (mean ≈ 54); quant mean ≈ 50, with the hardest quant items at P+ 10–17.

Levels (L3 = P+ 45–60, L4 = 30–45, L5 = under 30) and the section rules are defined once, in `docs/QUIZ-AUTHORING.md`, Structure rules.

## Text completion
- **Hard TCs are logic puzzles, not vocabulary quizzes.** The hardest 3-blank items give a two- or three-sentence passage whose blanks must stay mutually consistent; one early blank usually fixes the others (a "rather than…" or "however…" turn flips polarity partway).
- **Stacked contrast.** Two pivots in one sentence (concession + "yet", "not X but Y", "far from…") so the answer has to be derived from the *double negative*, not from the nearest signal word.
- **Blanks that are noun phrases.** Choices like "adjective + noun" pairs (e.g. an austerity/prolixity/prodigality triple) make the test-taker evaluate a concept, not a word. Distractors are fluent, on-topic, and wrong only in polarity or degree.
- **Rare key, easy-looking distractor.** The key is often a less common word (lionization, marginalization-type abstract nouns, "belies" in its secondary sense = contradicts) while a familiar word fits the topic but not the logic.
- **Secondary senses.** *belie, temper, qualify, hedge, foster, stem, tell, afford* in their non-default meanings. The wrong answers are the default meaning.
- **Distractors carry the right topic and the wrong direction**: pick the polarity that agrees with the nearest signal word, then check the *second* blank against it.
- Single-blank L5 items: the sentence's meaning rests on a *relationship* between clauses (cause vs. concession) and one choice matches only one reading.
- **Length.** Most official 3-blank items (7 of 12) are short passages of 3–5 sentences, and a PowerPrep section had 4 of its 6 TCs at three sentences. Ours were all 1–2 sentences until verbal-015. The length is where the difficulty comes from: the clue for a blank sits a sentence or two away, often after it.
- **Solve order.** In the hard items the first blank is nearly undecidable alone: each choice is plausible until a later blank is fixed, and that later blank is the one the text pins down. Build at least one TC per test this way.
- **Phrase blanks.** About a quarter of official blanks (19 of 77) offer phrases, never mixed with single words in one blank: verb or adjective + preposition (*at odds with, wary of, lend credence to*), article + adjective (*a perfunctory*), or a whole noun phrase (*the fragility of the consensus*). The preposition can carry the logic (*receptive to* vs *impervious to*), so the phrase is tested as a unit.
- **Other signals the official explanations lean on:** a colon that introduces an explanation of what precedes it; proportional structures ("the more X, the more Y"); a turn word whose meaning still runs the same way (*indeed*, *not only … but*), which punishes the reader who flips polarity on reflex; time contrasts (*once / now*, *initially / ultimately*).
- **Connotation keys.** Two choices both fit the logic, but only one has the right connotation or degree (*frugal* vs *stingy* for someone the sentence admires). Make the decoy the word a careless reader gets from the topic alone.

## Sentence equivalence
- The two keys are *not necessarily the dictionary-closest synonyms*; they only need to give the same sentence meaning. Hard items use keys with different surface registers (e.g. a clinical word and a figurative one).
- **Trap pairs:** two choices that are true synonyms of each other yet both wrong for the sentence (wrong polarity or wrong intensity). Always include at least one such pair; solvers who hunt "the synonym pair" fall in.
- **Near-pair decoys:** a choice that pairs with a key in meaning but is stronger/weaker than the sentence permits.
- Keys with secondary meanings, so the familiar sense is the decoy.
- Sentence carries 2+ constraints (e.g. tone + direction); one key satisfies only one.
- **Lone perfect fit.** One choice fits the sentence best of all, but nothing among the six means the same, so it can't be half of a pair. The keys are the two that fit slightly less snugly and agree with each other. ETS warns test-takers against fixating on such a word, which makes it a fair trap.

## Reading comprehension
- **Select-all (3 choices).** The hardest items (P+ ≈ 14–26) have one tempting choice that is *true in the real world / plausible but unsupported*, and one correct choice that needs a two-step inference across sentences. Official key counts run about 40% one key, 40% two, 20% all three (7 / 7 / 3 of 17). Tests up to verbal-014 had 23 two-key items, 5 one-key and no three-key, which teaches a habit the real test punishes. The brief now draws each slot's count.
- **Inference vs. "primarily in order to" (function) questions:** wrong answers state something the passage says but misidentify *why* the author said it. Function of a mentioned detail is among the lowest-P+ RC question families.
- **Dense academic register**: science (ecology, physical chemistry, paleontology), intellectual history, philosophy of science; arguments that *qualify* a hypothesis rather than reject it.
- **Distractor families**: half-right (correct first half, extreme second half), extreme quantifiers (*always, only, all*), reversed relation, outside knowledge, scope shift (about a different party than asked).
- **Argument items.** The 14 official arguments (Official Guide plus one PowerPrep section) are weaken 4, paradox 3, strengthen 2, boldface 2, and one each of complete-the-passage, most-reliably-inferred, the-point-emphasized and which-statement-contradicts-the-information. None is an assumption, flaw or evaluate item: those are GMAT habits, so the skill weights now favour the official mix. Hard ones have a paradox whose resolution is a fact about measurement rather than the mechanism, or a constrained paradox (explain the discrepancy while leaving a stated theory intact), or a strengthen item aimed at a proposed *explanation* rather than a conclusion. Complete-the-passage usually ends in "since ___" or "because ___", so the key is the missing premise.
- **Long passages.** One passage per test runs several paragraphs and carries 4 questions (6 of 24 official passages do). The rest are one paragraph: ETS describes the majority as one paragraph, with only one or two longer.
- **Select-in-passage**: the answer is the sentence performing a role (counterexample, concession, thesis), often a middle sentence, not the first or last. On a long passage the question is limited to one or two marked paragraphs (`paras`). Variants: the passage asks a question and the key is the sentence that helps answer it; the key is the one sentence that separates two approaches the passage otherwise blurs.
- **Cited views.** About one official stem in eight asks what a scholar or group the passage cites believes, hypothesizes or would agree with, not what the author thinks. ETS frames the skill as telling ideas the author advances from those the author merely reports or floats as speculation. Write such stems in addition to "the author's attitude toward …", with a distractor that gives the author's view to the cited party.
- **Rarer stem forms worth one item every test or two:** EXCEPT / NOT (about 5% of official stems), "the passage provides information to answer which question", "which sequence of events would conform to the passage's account".
- **By skill** (ids in `data/rc_skills.json`; its descriptions list each skill's traps). How to push each one to L4–L5:
  - *Inference:* the key needs two sentences combined. The best distractor is a claim the reader would believe anyway, or the right claim stated one notch too strongly.
  - *Select-all / EXCEPT:* each choice must be checked separately. Include one true-but-unsupported choice, and make the number of correct choices unpredictable.
  - *Function:* ask about a detail embedded in a concession or qualification. The distractors accurately restate what the detail says but misstate why it is there.
  - *Main idea:* the passage qualifies a view rather than rejecting it. Distractors use the right topic with the wrong verb (refute / defend / reconcile) or cover only one paragraph.
  - *Detail:* the answer sits in a different paragraph from the stem's keywords. The distractors reuse the passage's words with a reversed relation.
  - *Attitude:* the author's stance is mixed or measured. Distractors misjudge the intensity (scathing, unreserved) or attribute a quoted view to the author.
  - *Structure:* two passage structures that differ by one move (concede then rebut vs. rebut then concede).
  - *Word in context:* the passage uses the word in a secondary sense, and the everyday sense is among the choices.
  - *Application:* the new case matches on a surface feature but not on the structural one, or the other way round.
  - *Argument skills:* weaken or strengthen through the unstated assumption, not the premises. Assumption keys are necessary, not merely sufficient, and stated mildly. Paradox keys explain both facts; evaluate keys are questions whose two answers would push the argument in opposite directions.

## Quantitative
- **QC with hidden cases.** The relationship flips on negatives, zero, fractions between 0 and 1, or non-integers. Figures "not drawn to scale". A single case analysis (two cases suffice to prove D) makes it L4–L5.
- **Remainders / units digits / divisibility** with large exponents or factorials; "how many integers satisfy…" counting with a hidden exclusion.
- **Multi-answer quant** needs min/max bounding: the choices are tests against a feasible range derived from constraints, and a choice is correct only if it holds for *all* admissible values.
- **Absolute-value inequalities** and **inscribed/composite figures** (circles in squares, shaded regions): the setup, not the arithmetic, is the difficulty.
- **Counting with restrictions** and **conditional probability** (without-replacement, "given that"): P+ in the teens-twenties.
- **Statistics:** standard deviation compared qualitatively (no computation), median effects of added data, weighted averages with changing group sizes.
- **Data interpretation**: percent-of-percent and "approximately" comparisons where a rough estimate decides; distractors correspond to using the wrong base.
- Numeric-entry and fraction-entry items: no choices to back-solve from; wrong answers come from a plausible slip (unit, off-by-one, inclusive count).
- **What the 40 hardest repaired quant items (P+ 10–34) have in common.** These are drawn from the page-image transcriptions. Almost none are hard because of heavy computation. The recurring drivers:
  - *The question asks for a neighbouring quantity:* the difference rather than the ratio, the count rather than the percent, or a percent of a percent ("0.01 percent" read as 0.01).
  - *Structure beats arithmetic:* a factorable power, an expression that equals −1 (a reversed numerator/denominator), symmetric combinations, or a value that factors cleanly so that brute multiplication becomes a trap for the clock.
  - *Divisibility of a factorial by a composite:* the composite fails only when it contains a prime larger than the factorial's base.
  - *Hidden second case in geometry:* a given angle can be the vertex angle or a base angle; lines that look perpendicular or concurrent need not be; equal shaded areas need not imply equal unshaded areas.
  - *Exponent behaviour off the integer line:* a base between 0 and 1, or a comparison that flips with whether x is above or below 1.
  - *Scaling:* area scales with the square of the linear ratio; an inverse proportion is read as direct.
  - *Must-be-true multi-answer:* each statement needs its own check against the full feasible range (a bounded price interval, a sign pattern of intercepts).
  - *Probability and counting:* without-replacement products; casework over several group sizes; counting squares among C(n,4) vertex choices.
  - *Rank tracking in data:* a value's percentile/quartile after the set grows; the median of an even-size set falling on either side of a threshold.
- **Trap taxonomy** for explanations: wrong base for percent, assuming integers, assuming positive, double-counting overlap, off-by-one in inclusive counts, using the figure as if to scale.

## Calibrating our own items
- A level-5 item should be one a strong test-taker misses on the first read under time pressure, but whose key is *unarguable* afterward. Avoid difficulty from ambiguity: if two solvers defend different answers, rewrite.
- Raise difficulty by (verbal) adding a second constraint or a secondary-sense key, (quant) adding a case split or a bounding step, not by obscure trivia.
- **Don't overshoot (quant).** Official hard items (P+ < 30) usually turn on one hidden case or trap plus one more step. Calibration (`docs/CALIBRATION.md`) showed our quant drifting about a level above its labels, because items stacked three or more moves (case split + bounding + a neighbouring-quantity question). Give an L5 item two moves at most. Leave the extreme items (level 6+, at most 2 per section) to the few that need them, and keep the rest of the section at real-test difficulty.
