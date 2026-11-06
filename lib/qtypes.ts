import type { Question } from "./types";

/**
 * Question kinds as the blueprint counts them: text completions split by blank count, arguments and
 * data-interpretation sets split out of rc / mc. Same mapping as scripts/validate-test.ts.
 */
export type SlotType = "tc1" | "tc2" | "tc3" | "se" | "rc" | "rc_multi" | "rc_select" | "arg" | "qc" | "mc" | "mc_multi" | "numeric" | "di";

export function slotType(q: Pick<Question, "type" | "blanks" | "subtype" | "setId">): SlotType {
  if (q.type === "tc") return `tc${Math.min(3, Math.max(1, q.blanks?.length ?? 1))}` as SlotType;
  if (q.subtype === "arg") return "arg";
  if (q.setId && q.type !== "qc") return "di";
  return q.type;
}

export interface TypeInfo {
  label: string;
  /** one line on what the question asks you to do */
  what: string;
  /** target seconds per question at real-exam pace (verbal ~41 min / 27, quant ~47 min / 27, by format) */
  paceSec: number;
}

export const TYPE_INFO: Record<SlotType, TypeInfo> = {
  tc1: { label: "Text Completion, 1 blank", what: "Pick the one word that best completes a sentence.", paceSec: 45 },
  tc2: { label: "Text Completion, 2 blanks", what: "Fill two blanks; both must be right to score.", paceSec: 70 },
  tc3: { label: "Text Completion, 3 blanks", what: "Fill three blanks in a short passage; all three must be right.", paceSec: 90 },
  se: { label: "Sentence Equivalence", what: "Pick the two words that each complete the sentence and give it the same meaning.", paceSec: 50 },
  rc: { label: "Reading, one answer", what: "A question about a passage with a single correct choice.", paceSec: 80 },
  rc_multi: { label: "Reading, select all that apply", what: "Tick every choice the passage supports (one, two or all three); no partial credit.", paceSec: 90 },
  rc_select: { label: "Reading, select a sentence", what: "Click the sentence in the passage that does what the question describes.", paceSec: 80 },
  arg: { label: "Argument (critical reasoning)", what: "One-paragraph argument: weaken, strengthen, find the assumption or resolve a paradox.", paceSec: 90 },
  qc: { label: "Quantitative Comparison", what: "Is Quantity A greater, smaller, equal, or can't it be determined?", paceSec: 75 },
  mc: { label: "Multiple choice, one answer", what: "A standard problem with five choices and one correct answer.", paceSec: 100 },
  mc_multi: { label: "Multiple choice, select all that apply", what: "Pick every correct choice; you must get the exact set.", paceSec: 115 },
  numeric: { label: "Numeric Entry", what: "Type the answer yourself (integer, decimal or fraction); no choices to work back from.", paceSec: 110 },
  di: { label: "Data Interpretation", what: "Questions that share one table or chart; read the figure, then compute.", paceSec: 115 },
};

export const typeLabel = (q: Pick<Question, "type" | "blanks" | "subtype" | "setId">) => TYPE_INFO[slotType(q)].label;

/** Weights for the per-type practice-need score (see docs/PRIORITY.md). */
export const NEED_W = { miss: 0.7, slow: 0.3 } as const;

export interface TypeStat {
  type: SlotType;
  n: number;
  correct: number;
  guessed: number; // right but flagged "guessed"
  avgMs: number;
  /** Laplace-smoothed chance of missing the next one: (wrong + ½·guessed + 1) / (n + 2) */
  missP: number;
  /** avg time over target pace */
  paceRatio: number;
  /** 0 at ≤ 0.8× pace, 1 at ≥ 1.5× pace */
  slow: number;
  /** 0..1, higher = practice this type first */
  need: number;
}

export function typeStats(rows: { type: SlotType; isCorrect: boolean; guessed: boolean; timeMs: number }[]): TypeStat[] {
  const by = new Map<SlotType, { n: number; correct: number; guessed: number; ms: number }>();
  for (const r of rows) {
    const s = by.get(r.type) ?? { n: 0, correct: 0, guessed: 0, ms: 0 };
    s.n++;
    if (r.isCorrect) {
      s.correct++;
      if (r.guessed) s.guessed++;
    }
    s.ms += r.timeMs;
    by.set(r.type, s);
  }
  return [...by.entries()]
    .map(([type, s]) => {
      const avgMs = s.ms / s.n;
      const missP = (s.n - s.correct + 0.5 * s.guessed + 1) / (s.n + 2);
      const paceRatio = avgMs / 1000 / TYPE_INFO[type].paceSec;
      const slow = Math.min(1, Math.max(0, (paceRatio - 0.8) / 0.7));
      return { type, n: s.n, correct: s.correct, guessed: s.guessed, avgMs, missP, paceRatio, slow, need: NEED_W.miss * missP + NEED_W.slow * slow };
    })
    .sort((a, b) => b.need - a.need);
}
