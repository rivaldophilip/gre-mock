/** All tunable weights for the priority model. See docs/PRIORITY.md. */

export const WORD_W = {
  dont_know: 1.0,
  key_missed: 0.8,
  distractor_chosen: 0.6,
  key_guessed: 0.3,
  key_partial: -0.3,
  key_correct: -0.6,
  distractor_rejected: -0.15,
  exposure: 0,
} as const;

export const CONCEPT_W = {
  wrong_primary: 0.8,
  wrong_secondary: 0.4,
  guessed: 0.3,
  slow: 0.2,
  right_primary: -0.6,
  right_secondary: -0.3,
} as const;

/** "slow" = more than 1.5x pace (1:10 quant, 1:00 verbal per question). */
export const SLOW_MS = { quant: 105_000, verbal: 90_000 } as const;

export const HALF_LIFE_DAYS = 21;
export const SMOOTH = { prior: 0.5, total: 1.5 } as const;
export const COVERAGE_W = { key: 1.0, distractor: 0.3, passage: 0.15 } as const;
export const INTERVALS_DAYS = [1, 3, 7, 14, 30] as const;
export const P_WEIGHTS = { S: 0.4, N: 0.3, D: 0.15, Y: 0.15 } as const;
export const RECENT_DAYS = 2;
export const RECENT_FACTOR = 0.3;
export const WORD_YIELD_SOURCES_CAP = 5;
export const WORD_YIELD_BONUS = 0.2;
