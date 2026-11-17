# Brief verbal-017 (verbal, seed 69618)

Untaken tests (their targets are damped, so this test spreads to other items): quant-011, quant-012, quant-013, verbal-014, verbal-015, verbal-016

## Slots

| sec | slot | type | level | passage |
|---|---|---|---|---|
| 1 | 1 | tc1 | 4 |  |
| 1 | 2 | tc2 | 3 |  |
| 1 | 3 | tc3 | 5 |  |
| 1 | 4 | se | 4 |  |
| 1 | 5 | se | 3 |  |
| 1 | 6 | se | 5 |  |
| 1 | 7 | se | 4 |  |
| 1 | 8 | rc | 4 | p1 (1-2 paragraphs, 2 questions) |
| 1 | 9 | rc_multi (2 keys) | 5 | p1 |
| 1 | 10 | rc | 3 | p2 (1 paragraph, 2 questions) |
| 1 | 11 | rc_select | 3 | p2 |
| 1 | 12 | arg | 4 | a1 |
| 2 | 1 | tc1 | 4 |  |
| 2 | 2 | tc2 | 5 |  |
| 2 | 3 | tc3 | 5 |  |
| 2 | 4 | tc3 | 4 |  |
| 2 | 5 | se | 5 |  |
| 2 | 6 | se | 4 |  |
| 2 | 7 | se | 5 |  |
| 2 | 8 | rc | 4 | p3 (2-4 paragraphs, 4 questions) |
| 2 | 9 | rc | 5 | p3 |
| 2 | 10 | rc_multi (3 keys) | 4 | p3 |
| 2 | 11 | rc_select | 5 | p3 |
| 2 | 12 | rc | 4 | p4 (1 paragraph, 2 questions) |
| 2 | 13 | rc | 5 | p4 |
| 2 | 14 | rc | 4 | p5 (1 paragraph, 1 question) |
| 2 | 15 | arg | 3 | a2 |

Format (the validator enforces it): passage shapes as in the table, at most 2 reading passages longer than one paragraph; each rc_multi with the key count shown; rc_select on a multi-paragraph passage sets `paras`; at least 2 of the 3-blank TCs are 3-5 sentence passages; at least 3 TC blanks have all-phrase choices. Details: docs/QUIZ-AUTHORING.md, Structure rules.

Type focus (need >= 0.4, put the weakest items here): rc

## Key words (29 keys across TC blanks and SE pairs)

SE partners: * = also a key word (best pair); otherwise a bank synonym may be the second key.

- **ascertain**: verb to find out with certainty through investigation (new, never tested). Synonyms: none in bank
- **disabuse**: verb to free someone from a mistaken belief or illusion (new, never tested). Synonyms: none in bank
- **augment**: verb to make greater in size, amount or strength (new, never tested). Synonyms: bolster, enhance
- **deleterious**: adjective causing harm or damage (new, never tested). Synonyms: noxious, pernicious
- **gauche**: adjective lacking social grace; awkward and tactless (new, never tested). Synonyms: unsophisticated, indecorous
- **refute**: verb to prove a claim or argument to be false (new, never tested). Synonyms: debunk, gainsay
- **remedial**: adjective intended to correct a deficiency or cure a problem (new, never tested). Synonyms: salutary
- **obscure**: adjective not clearly understood or known; hard to perceive; little known (new, never tested). Synonyms: abstruse, adumbrate, arcane, cryptic, esoteric, vague
- **rescind**: verb to revoke, cancel or repeal officially (new, never tested). Synonyms: abrogate, annul
- **confound**: verb to confuse or perplex; to prove wrong (new, never tested). Synonyms: flummox
- **attenuate**: verb to reduce in force, effect or value; to make thin (new, never tested). Synonyms: rarefy
- **indefatigable**: adjective incapable of being tired out; tireless (new, never tested). Synonyms: dogged
- **bucolic**: adjective relating to the pleasant aspects of country or rural life (new, never tested). Synonyms: rustic, idyllic
- **secrete** [secondary: everyday sense is the trap]: verb to hide away or conceal in a secret place (new, secondary sense (never tested)). Synonyms: none in bank
- **kindle** [secondary: everyday sense is the trap]: verb to arouse or inspire a feeling or interest (new, secondary sense (never tested)). Synonyms: none in bank
- **exculpate**: verb to clear of blame or guilt (review, missed as the answer). Synonyms: exonerate, vindicate
  - used before: 002:s1q5 (distractors implicate, castigate, perturb, expiate); 005:s2q6 (distractors denigrate, edify, disparage, implicate). New sentence logic, no distractor from these.
- **meticulous**: adjective extremely careful and precise about details (review, chosen as a wrong answer). Synonyms: conscientious, exact, fastidious, scrupulous, painstaking, punctilious
  - used before: 003:s1q4 (distractors cavalier, venal, nonchalant, austere). New sentence logic, no distractor from these.
- **debase**: verb to lower in quality, value or dignity (review, missed as the answer). Synonyms: abase, adulterate, degrade
  - used before: 007:s2q4 (distractors profligate, eccentric). New sentence logic, no distractor from these.
- **hortatory**: adj strongly urging or encouraging a course of action (review, tagged 'didn't know'). Synonyms: none in bank
- **nominal** [secondary: everyday sense is the trap]: adjective existing in name only; very small in amount (review, right but slow). Synonyms: trifling
  - used before: 005:s1q3 (distractors monotonous, hortatory, pronounced, patent, laconic, discreet). New sentence logic, no distractor from these.
- **jettison** [secondary: everyday sense is the trap]: verb to throw overboard or discard as unneeded (review, right but slow). Synonyms: abandon
  - used before: 005:s2q2 (distractors diverge). New sentence logic, no distractor from these.
  - **revisit verbal-005:s2q2** (you missed it): That the trustees, who for decades had answered every proposal for a second building by reciting the founder's stipulation that the collection be kept under one roof, should have (i) ___ that stipulation the moment the holdings began to (ii) ___ will surprise only those who mistook their piety for conviction: a rule invoked chiefly because it cost nothing to obey was never likely to survive the first occasion on which obeying it would. · blank 1: enshrine / jettison / reaffirm; blank 2: dwindle / diverge / burgeon. Write a sibling, not a copy: new sentence logic: a contrast instead of a cause, or a concession instead of a restatement. Set `"revisits": "verbal-005:s2q2"`.
- **acquiesce**: verb to accept or comply passively, without protest (review, chosen as a wrong answer). Synonyms: accede, assent, capitulate, defer
- **extol**: verb to praise enthusiastically (review, chosen as a wrong answer). Synonyms: laud, tout
  - used before: 005:s1q5 (distractors censure, eclipse, castigate, enhance); 007:s2q7 (distractors disparage, explicate, denigrate, demarcate). New sentence logic, no distractor from these.
- **mercenary**: adjective motivated chiefly by money or personal gain (review, missed as the answer). Synonyms: venal, avaricious
  - used before: 006:s1q4 (distractors equitable, phlegmatic, complicit). New sentence logic, no distractor from these.
  - **revisit verbal-006:s1q4** (you missed it): Those who defended the magistrate on the ground that no one had ever seen him favor a friend or a faction missed the point of the charge against him: it was not that he was partial but that he was ___, his judgments going, with perfect evenhandedness, to whichever party had last visited his chambers with a satchel. · choices: evenhanded / venal / equitable / phlegmatic / mercenary / complicit. Write a sibling, not a copy: new format: an SE item becomes a TC blank, or a TC blank becomes an SE pair. Set `"revisits": "verbal-006:s1q4"`.
- **opprobrium**: noun harsh public criticism or disgrace arising from shameful conduct (review, missed as the answer). Synonyms: censure, stigma
  - used before: 003:s1q7 (distractors disaffection, mirth); 010:s2q3 (distractors equanimity, equivocate, acquiesce, concur). New sentence logic, no distractor from these.
- **mitigate**: verb to make less severe, serious or painful (review, missed as the answer). Synonyms: alleviate, ameliorate, assuage, temper, palliate
  - used before: 004:s2q3 (distractors compound, intransigent, adverse, incumbent); 010:s1q6 (distractors exacerbate, abrogate). New sentence logic, no distractor from these.
  - **revisit verbal-004:s2q3** (you missed it): The firms' lawyers portrayed the regulators as implacable, but the record suggests otherwise: the agency had offered from the outset to (i) ___ the penalties of any company (ii) ___ enough to open its books to independent auditors, and if it later imposed the full fines on most of them, that was because its offer had always been (iii) ___ on the auditors' finding nothing the companies had not already disclosed, a condition few of them, as it turned out, could meet. · blank 1: compound / mitigate / levy; blank 2: intransigent / adverse / amenable; blank 3: incumbent / contingent / incidental. Write a sibling, not a copy: a different SE partner or a different sense of the word. Set `"revisits": "verbal-004:s2q3"`.
- **incontrovertible**: adjective too clear or certain to be denied or disputed (review, missed as the answer). Synonyms: irrefragable
  - used before: 008:s2q2 (distractors vindicate, placate, inconclusive, contentious). New sentence logic, no distractor from these.
- **mellifluous**: adjective sweetly flowing and pleasant to hear (review, chosen as a wrong answer). Synonyms: none in bank
  - used before: 004:s1q2 (distractors decorum, strident); 010:s2q4 (distractors grating, acerbic, polemical, conjectural). New sentence logic, no distractor from these.
  - **revisit verbal-004:s1q2** (you missed it): The broker had expected the auction house to be a refuge from the (i) ___ of the trading floor, and in one sense it was: no one shouted. But she soon found the auctioneer's (ii) ___ patter more wearing than any din, its unbroken sweetness leaving her no pause in which to think. · blank 1: decorum / cacophony / tedium; blank 2: strident / staccato / mellifluous. Write a sibling, not a copy: a new context and no distractor shared with the earlier item. Set `"revisits": "verbal-004:s1q2"`.
- **belittle**: verb to make someone or something seem unimportant (review, missed as the answer). Synonyms: disparage, denigrate
  - used before: 007:s1q2 (distractors appropriate, laud, exonerate). New sentence logic, no distractor from these.

## Reading skills for the 13 RC slots (arg-* on argument slots)

Write each slot's question as its variant (the form of the skill earlier mocks used least); a skill drawn twice gets two. Put a variant on a slot whose format fits it (an EXCEPT variant on a single-answer rc slot).

- **rc-select-verify** ×2 (review, wrong on a question testing it; wildcard, wrong on a question testing it): Each statement checked independently against the text (select-all or EXCEPT). Traps: a true-in-the-world but unsupported choice; one half-right choice. Variants: select-all inference about a claim the passage makes; select-all detail (which of these the passage mentions).
- **rc-function** (review, wrong on a question testing it): Why a sentence, example or paragraph is there (to concede, illustrate, qualify, contrast). Traps: an accurate paraphrase that misstates its role. Variant: the job of a concession or qualification.
- **rc-inference** (review, wrong on a question touching it): What must be true or is most strongly supported, including what a scholar or group the passage cites believes or would agree with. Traps: plausible but unsupported, true in the world but not in the passage, extreme wording, the author's view given for a cited party's. Variant: which case is NOT an instance of a category the passage defines.
- **rc-vocab-context** (review, wrong on a question testing it): What a word or phrase means as used here. Traps: the word's common sense where the passage uses a secondary one. Variant: a common word used in a secondary sense.
- **rc-main-idea** (review, wrong on a question testing it): The passage's central claim, or why the author wrote it. Traps: too narrow (one paragraph's point), too broad, right topic with the wrong verb ("refute" vs "qualify"). Variant: primary purpose, where the trap is the verb (qualify / refute / reconcile).
- **rc-structure** (review, wrong on a question testing it): How the passage or a paragraph is built (claim then counterexample, two views then a synthesis). Traps: one move out of order or missing. Variant: the organization of a few sentences within a paragraph.
- **rc-attitude** ×2 (new, wrong on a question touching it): The author's stance and degree of certainty toward a view or person. Traps: tone too strong ("scathing") or the opposite polarity; a view the author only reports, or floats as speculation, read as one the author holds. Variants: a cited party's attitude, distinct from the author's; the author's attitude toward a school or view the passage reports.
- **rc-detail** (new, right but slow): What the passage says explicitly. Traps: right words from the wrong part of the passage, distortions of degree or scope. Variant: which question the passage gives enough information to answer.
- **rc-application** (new, wrong on a question testing it): Which new situation parallels, would be explained by, or would be judged by the passage's idea. Variant: a finding the author would count as evidence of a phenomenon the passage names.
- **arg-strengthen** (review, wrong on a question testing it): New information that most supports the conclusion or a proposed explanation. Traps: supports a related but different conclusion. Variant: ruling out an alternative cause.
- **arg-paradox** (new, covered, no weakness): Information that explains how two apparently conflicting facts can both be true; the hard form adds a constraint (explain the discrepancy while leaving a stated theory intact). Traps: explains only one side, or resolves it by breaking the constraint. Variant: a constrained discrepancy (explain it while leaving a stated theory intact).

## Distractor words (about 40% of distractors)

Weak: apathy, blanch, pithy, pernicious, incisive, laud, shelve, acerbic, contingent, apogee, tacit, caustic, precursor, implicate, trenchant, insipid, opulent, inconclusive, curtail, rancorous, manifest, erudite, callous, denounce, complicit

Untested: inadvertent, misnomer, irk, importune, exaptation, entitled, impute, dissent, indiscernible, indistinct, disarm, distinction, divulge, incur, duplicity, abrade, antidote, dyspeptic, alchemy, condign, afford, disaffection, altruistic, attune, barter, hermeneutic, indemnify, antithesis, discursive, duress, grouse, animadversion, insensible, assent, homiletic

## Passage words (weave 3-6 into each passage)

clangor, doughty, objurgate, perpetrate, ramification, recourse, redolent, reductive, refract (2nd sense), regress, solipsistic, strife, subservient, surmount, valence (2nd sense), versatile, visionary, scintilla, wayward, ablation, acculturation, adduce, aeolian, albedo, aleatory, allegorical, alluvial, ambit, animadversion, animism, anomie, anthropocentric, antinomy, antiquarian, aporia, apostasy, arbitrage, archetypal, assemblage, atavistic

## Earlier tests (do not repeat topics)

- verbal-001: For decades, ecologists described forests as arenas of competition:… / Historians of Dutch painting have long treated the seventeenth-century… / A city's transit authority reports that after it replaced a downtown… / Linguists who study creoles, full languages that arise when speakers… / Students who reread a text feel that they have learned it: the words… / Critics have tended to read the late novels of a certain author as a… / A council member argues: 'Since the town banned plastic grocery bags…
- verbal-002: Biologists have long treated cryptic coloration (the mottled browns of… / Accounts of postwar painting often present the decade's abstract… / A regional health agency began mailing reminder postcards to patients… / For much of the twentieth century, historians of geology told the… / Judges asked to enforce the judgment of a foreign court commonly say… / The abandonment of the Norse settlements in Greenland in the fifteenth… / Over the past decade, reported cases of a tick-borne illness in…
- verbal-003: Economic historians long assumed that the rise in household… / The first planets found orbiting other stars were peculiar by the… / After the city of Harlow replaced its paper parking permits with a… / When the leaves of the sensitive plant Mimosa pudica are disturbed,… / The movement to perform eighteenth-century music on period instruments… / Historians of public health once told the story of the Victorian… / Opponents of a proposed tax on sugary drinks argue that it would drive…
- verbal-004: Zircon, a mineral that crystallizes from cooling magma, is prized by… / In the 1570s and 1580s a circle of English poets set out to write… / The young women who staffed the silk-reeling mills of central Japan in… / Asked to describe what they see, most people report a visual field… / Roman harbor walls built of concrete two thousand years ago still… / Three years ago the fisheries board of a coastal province required… / Since a coastal province began requiring storm shutters on all new…
- verbal-005: When a nineteenth-century naturalist called the lake a microcosm, he… / The portolan charts of the late Middle Ages, drawn on sheepskin for… / Until two years ago, Wexmoor College gave letter grades in all of its… / Few findings in behavioral economics have been more widely publicized… / To the reformers who campaigned against it, benefit of clergy was the… / For most of the nineteenth and early twentieth centuries, the… / At auctions of rare wines, bottles whose labels are stained or torn…
- verbal-006: For most of the twentieth century, textbooks demarcated the immune… / Around 1900 the pictorialists, determined to win for photography the… / Protestant reformers of the sixteenth century commonly taught that… / When sociologists began tracking individual households through… / Champions of the long take have tended to write in a hortatory mood,… / Two years ago the Calder Valley growers' cooperative began encouraging… / Director of the Hollis Municipal Museum: Visitors who rent our audio…
- verbal-007: For more than a century, paleontologists have repeated as a rule of… / Historians of mathematics have sometimes treated the European… / In the Kessel valley, apple growers who have put up nest boxes for… / In the classic anthropological account, a gift differs from a… / It has long been a commonplace that the boulevards cut through Paris… / For much of the twentieth century, comparative anatomists treated the… / Bookshops in Velden that moved their poetry sections from the back of…
- verbal-008: That sleep benefits memory is no longer seriously disputed; how it… / Critics who dismissed the realist novel's lists of furniture and… / Last year the public libraries of Brennan County stopped charging… / Histories of commercial credit in the nineteenth-century United States… / For a long time the anatomical theaters of early-modern Europe were… / When the bark of the cinchona tree reached Europe in the seventeenth… / Transportation analysts have predicted that the new toll on the Harbor…
- verbal-009: For most of the eighteenth century, chemists who wished to predict the… / Historians of pronunciation cannot hear medieval speakers, so they… / When the first detailed records from Antarctic ice cores were… / The margins of Gothic manuscripts teem with figures that seem to have… / Because a glacier's front advances when snowfall outpaces melting and… / Since the Hartwell Museum began requiring visitors to reserve a timed… / Planners in the Varden Valley expect that subsidizing drip irrigation,…
- verbal-010: For most of the twentieth century, the suppression of side shoots by a… / Critics have long been embarrassed by apostrophe, the ode's habit of… / Eighteen months ago the Corvan hotel chain replaced the paper comment… / It was long a commonplace that the printing press, by multiplying… / Offered \$100 today or \$110 in a week, many people take the \$100;… / In the head of a sunflower, the florets lie along two families of… / In the province of Vastra, restaurants are inspected at unannounced…
- verbal-011: For much of the twentieth century, anthropologists treated kinship as… / Of the signals that precede an eruption, the swelling of a volcano's… / Because Bach's last contrapuntal cycle was printed in open score, each… / Few features of Byzantine icons have invited more theorizing than… / When a volcano erupts after its warnings have gone unheeded, the… / Two years ago the town of Brask began requiring every restaurant that… / Last year the municipal pool in Corwin extended its hours, staying…
- verbal-012: Many bacteria regulate certain genes according to the abundance of… / When the polymath Francis Galton compared the heights of parents with… / For economists from Adam Smith onward, the craft guilds of early… / Western collectors who began buying Japanese woodblock prints in the… / When a population of bacteria is exposed to a lethal dose of an… / Since the city added bicycle lanes along Harbor Avenue two years ago,… / Each of the forty musicians in the Halden Chamber Orchestra has won at…
- verbal-013: Sailing among the atolls of the Indian Ocean in the 1830s, Charles… / The white walls of the early modernist house are usually read as a… / Karl Popper proposed that a theory counts as scientific only if some… / The classic theory of the demographic transition holds that birth… / Why so many species of small fish can live together on a single patch… / To reduce the amount of paper it uses, the Ostrow insurance company… / Every film that has won the Corvara Festival's top prize in the past…
- verbal-014: Defenders of federal constitutions have usually rested their case on a… / The lightest elements are primordial: hydrogen, helium and a trace of… / To cut costs, the Pell County transit authority plans to replace each… / For much of the twentieth century, literary historians treated the… / It was once a commonplace that the mechanical clock was a monastic… / In a celebrated essay, a historian of the English working class argued… / The average age of the members of the Larkspur Book Club is 61.…
  - stems: The duke's letters to his clockmaker were brief to the point… · Reviewers who dismissed the young novelist as a mere (i) ___… · Those who served under the admiral expected a (i) ___, and… · Collectors burned by the forgery scandal grew ___ of any… · Historians long treated the water-driven alarm and the… · The biographer is careful never to ___ the poet in his own… · His rivals took the envoy's endless requests for… · The author's attitude toward the view of the 'more recent… · Consider each of the choices separately and select all that… · In the context in which it appears, “settled” most nearly… · Select the sentence that explains why the elements heavier… · The transit authority's conclusion depends on which of the… · Engineers who had spent years quietly correcting the… · Critics who treat the mottoes cut into old sundials as… · The poem the nephew wrote in the year of the count's death… · Outsiders called the astronomers a (i) ___, and meant it to… · The candidate's answers at the hearing were ___: fluent,… · The boundary dispute the commissioners had hoped to settle… · The letter is remarkable less for its anger than for its… · The passage is primarily concerned with · The author's argument suggests that the traditional literary… · Consider each of the choices separately and select all that… · Which of the following best describes the organization of… · Which of the following is most closely analogous to the… · Select the sentence that introduces a reading of the… · In the context in which it appears, the phrase “who would… · The reasoning in Teodor's argument is most vulnerable to…

How to use this brief: docs/QUIZ-AUTHORING.md, step 2 and the structure rules.
