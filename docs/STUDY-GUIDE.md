# Study guide cards

`content/study/<measure>.json` holds the `/study` guide. Each topic (`sections[]`) is an ordered list of **cards**. The reader archives (studied) or deletes each card on its own, so every unit of teaching is its own card: one rule, one shortcut, one trap. Never group several bullets into one card.

## Card kinds

| kind | shows under | fields | use for |
|---|---|---|---|
| `idea` | the accent box at the top | `text` | the one-sentence intuition the topic hangs on (one per topic) |
| `example` | Worked example | `q`, `steps[]`, `svg?` | a full question worked step by step (at least one per topic) |
| `contrast` | More examples | `q`, `label`, `answer`, `wrong[{text, why}]` | verbal: an argument, the right answer, and the tempting wrong ones |
| `rule` | Rules to remember | tile | a fact to know cold |
| `shortcut` | Shortcuts & tips | tile | a faster way in |
| `trap` | Watch out | tile | a mistake the test is built to catch |
| `case` | its pattern | `pattern`, `name`, `q`, `spot`, `steps[]`, `svg?` | one disguise of a pattern drill |
| `limit` | its pattern, Not this method | tile + `pattern` | a look-alike the pattern's method does not fit |

**Tiles** are drawn like formula-sheet cards and are written the same way: dense and self-explanatory at a glance.
- `name`: what it is, in a few plain words ("Tangent", "Fixed sum", "Every pair once").
- `text` (one short Rich line) **or** `tex` (bare TeX formula): the point itself. Not a paragraph.
- `note` (optional): one line on when it applies or why.
- `example` (optional): one line, shown after "e.g.".
- `svg` (optional): a drawing.

**Don't repeat the formula sheet.** If a quick-reference tile (`quickRef`) already states a formula or fact, leave it out of the topics. A topic card should add something the tile doesn't: when to reach for it, a trap, or a move.

A pattern drill is a header in the topic's `patterns[]` (`id`, `title`, `idea`) plus its `case` and `limit` cards, which name it in `pattern`. Lanes always show in the order above. Within a lane, cards keep file order, so a new card can go anywhere in the array.

## Ids and marks

- `id` is kebab-case and unique within its topic. A reader's mark is stored as `<topic id>/<card id>`, so **an id is permanent**. Fixing wording keeps the id. A card that now teaches something different gets a new id, so it shows up unstudied. Never reuse a retired id.
- A new card on a topic that already exists gets `"added": "YYYY-MM-DD"` (today). A reader who archived cards there before that day sees it flagged **new**, and the topic header shows the count.
- `variant` (optional) names the sub-form the card teaches, copied exactly from `data/concept_variants.json` under one of the topic's concepts. When a later mock misses a question with that `variant`, the archived card comes back. A card without one stays archived, and the topic only shows "missed since studied".
- `StudySchema` (`lib/study.ts`) rejects duplicate ids, unknown patterns, patterns with no case, and variants from another topic. `npm test` also checks the math, the SVGs, and that every topic has an `idea` and an `example`.
