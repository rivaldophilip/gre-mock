/** All tunable weights for the priority model. See docs/PRIORITY.md. */

export const WORD_W = {
  dont_know: 0.6, // below key_missed: a miss is shown evidence, the tag a self-report
  key_missed: 0.8,
  distractor_chosen: 0.6,
  key_guessed: 0.3,
  key_partial: -0.3,
  key_correct: -0.6,
  key_slow: 0.2, // key right (guessed or not) but slower than SLOW_MS.verbal
  distractor_rejected: -0.15,
  exposure: 0,
  // shown (passage, stem, unjudged distractor) and not tagged "didn't know"; counted once per attempt (compute.ts)
  seen_known: -0.3,
} as const;

export const CONCEPT_W = {
  wrong_primary: 0.8,
  wrong_secondary: 0.4,
  guessed: 0.3,
  slow: 0.2,
  right_primary: -0.6,
  right_secondary: -0.3,
} as const;
/** A wrong quant answer the test-taker marks "silly mistake" (after the answer is shown) logs its wrong_* weights at this share. */
export const SILLY_FACTOR = 0.5;

/** "slow" = more than 1.5x pace (1:10 quant, 1:00 verbal per question). */
export const SLOW_MS = { quant: 105_000, verbal: 90_000 } as const;
/**
 * The first question opened on a shared passage also carries the passage's first read, so its "slow" limit is
 * raised by the passage's length at this reading speed (words per minute).
 */
export const READING_WPM = 250;

export const HALF_LIFE_DAYS = 21;
export const SMOOTH = { prior: 0.5, total: 1.5 } as const;
export const COVERAGE_W = { key: 1.0, distractor: 0.3, passage: 0.15 } as const;
export const INTERVALS_DAYS = [1, 3, 7, 14, 30] as const;
export const P_WEIGHTS = { S: 0.4, N: 0.3, D: 0.15, Y: 0.15 } as const;
export const RECENT_DAYS = 2;
export const RECENT_FACTOR = 0.3;
/** Items already tested by a registered test the user has not finished: damped, and not drawn as new, until it is taken. */
export const PENDING_FACTOR = 0.3;
/**
 * Untested-word push (verbal), while untested words remain: the share of key slots that go to untested words
 * (quant concepts and reading skills keep 0.5), the least share of a test's distractor words that must come from
 * the brief's untested list, and the least brief passage words per reading passage. `check` enforces the last two
 * for briefs that record them. Back to 0.5 / 0.6 / 3 to rebalance toward review.
 */
export const NEW_KEY_SHARE = 0.7;
export const UNTESTED_DISTRACTOR_SHARE = 0.75;
export const PASSAGE_WORDS_MIN = 5;
/** Untested synonym pairs the verbal brief seeds into its untested distractor list, one per SE item's trap pair. */
export const SE_TRAP_PAIRS = 7;
export const WORD_YIELD_SOURCES_CAP = 5;
export const WORD_YIELD_BONUS = 0.2;
/**
 * Endless vocab drill batches (scripts/drill-brief.ts): questions per batch, and the least share of a batch's choice
 * words (keys and distractors) that must come from the brief (its untested words, then review words). `check` enforces the share.
 */
export const DRILL_BATCH = 20;
export const DRILL_UNTESTED_SHARE = 0.9;
/**
 * The untested share of a drill brief's distractor list. Keys take untested words first; the rest of the list is
 * review words (seen before, least held by pending tests, then weakest), so the untested pool lasts for keys.
 */
export const DRILL_FRESH_DISTRACTORS = 0.5;
