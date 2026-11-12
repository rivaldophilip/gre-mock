// Deliberate revisits (docs/PRIORITY.md): an item the user missed or guessed comes back once, as a sibling that keeps
// its decisive insight and changes something structural. Only items from finished attempts qualify, so a test that is
// still untaken never seeds a repeat; everything else a later test asks must be new.
import type { Question, Test } from "../types";
import { INTERVALS_DAYS } from "./config";

/** At most this many revisit slots per test (quant concept slots, verbal TC/SE keys); the rest must be new. */
export const REVISIT_MAX = 4;
/** A miss waits this long before it comes back, so the revisit is spaced rather than immediate. */
export const REVISIT_MIN_DAYS = INTERVALS_DAYS[1];

/** The structural changes a sibling makes, handed out in turn so revisits vary. */
export const REVISIT_CHANGES = {
  quant: [
    "run it backwards: give what the earlier item asked for, and ask for one of its givens",
    "change the format (quantitative comparison, multiple choice or numeric entry) and the question asked",
    "combine the same insight with a second concept",
    "keep the insight but move the trap: a different wrong path should tempt",
  ],
  verbal: [
    "new sentence logic: a contrast instead of a cause, or a concession instead of a restatement",
    "new format: an SE item becomes a TC blank, or a TC blank becomes an SE pair",
    "a different SE partner or a different sense of the word",
    "a new context and no distractor shared with the earlier item",
  ],
} as const;

export type Answered = { questionId: string; isCorrect: boolean; guessed: boolean; at: Date };
export type Revisit = { ref: string; testId: string; qid: string; result: "missed" | "guessed"; at: Date; question: Question };

/** "quant-005:s2q14" */
export const refOf = (testId: string, qid: string) => `${testId}:${qid}`;

/**
 * Items to revisit, oldest miss first: the latest finished answer to each question was wrong or guessed, it is at least
 * REVISIT_MIN_DAYS old, and no test revisits it yet. Verbal revisits are TC and SE items (word level).
 */
export function revisitQueue(answers: Answered[], tests: Test[], now: Date, minDays = REVISIT_MIN_DAYS): Revisit[] {
  const latest = new Map<string, Answered>();
  for (const a of answers) if (!latest.has(a.questionId) || latest.get(a.questionId)!.at < a.at) latest.set(a.questionId, a);
  const revisited = new Set(tests.flatMap((t) => t.questions.flatMap((q) => (q.revisits ? [q.revisits] : []))));
  const byRef = new Map(tests.flatMap((t) => t.questions.map((q) => [refOf(t.id, q.id), { t, q }] as const)));
  const out: Revisit[] = [];
  for (const a of latest.values()) {
    const hit = byRef.get(a.questionId);
    if (!hit || (a.isCorrect && !a.guessed) || revisited.has(a.questionId)) continue;
    if ((now.getTime() - a.at.getTime()) / 86_400_000 < minDays) continue;
    if (hit.t.measure === "verbal" && hit.q.type !== "tc" && hit.q.type !== "se") continue;
    out.push({ ref: a.questionId, testId: hit.t.id, qid: hit.q.id, result: a.isCorrect ? "guessed" : "missed", at: a.at, question: hit.q });
  }
  return out.sort((x, y) => x.at.getTime() - y.at.getTime());
}

/**
 * Pair revisits with a brief's targets: each target (a concept slot, or a verbal key word) takes at most one revisit
 * whose item has that target (primary concept, or key word), up to REVISIT_MAX. Returns target index -> revisit.
 */
export function matchRevisits(targets: string[], queue: Revisit[], targetsOf: (q: Question) => string[]): Map<number, Revisit> {
  const out = new Map<number, Revisit>();
  const used = new Set<string>();
  for (const r of queue) {
    if (out.size >= REVISIT_MAX) break;
    const mine = new Set(targetsOf(r.question));
    const i = targets.findIndex((t, j) => !out.has(j) && mine.has(t));
    if (i < 0 || used.has(r.ref)) continue;
    out.set(i, r);
    used.add(r.ref);
  }
  return out;
}
