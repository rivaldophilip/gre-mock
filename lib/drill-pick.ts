// Endless vocab: which drill item comes next. Pure, so the weighting is tested without a database.
import type { Question } from "./types";

export type DrillItem = { testId: string; q: Question };

/** The bank words an item shows as answer choices (its key and distractor tags). */
export const choiceWordIds = (q: Question) => [...new Set(q.tags.filter((t) => t.kind === "word" && (t.role === "key" || t.role === "distractor")).map((t) => t.id))];

/**
 * Weight of an unanswered item: squared so an item showing nine never-seen words is picked far more often than one
 * showing two, while every item keeps some chance (the pool is meant to empty, not to strand its last items).
 */
export const drillWeight = (untestedChoices: number) => (1 + untestedChoices) ** 2;

/**
 * Draw the next item among those not answered yet, weighted by how many of its choice words are still untested.
 * `exclude` (the item on screen) is skipped unless it is the only one left. Returns null when the pool is empty.
 */
export function drawDrill(
  items: DrillItem[],
  answered: Set<string>,
  isUntested: (wordId: string) => boolean,
  random: () => number = Math.random,
  exclude?: string,
): DrillItem | null {
  const open = items.filter((x) => !answered.has(`${x.testId}:${x.q.id}`));
  const pool = open.length > 1 && exclude ? open.filter((x) => `${x.testId}:${x.q.id}` !== exclude) : open;
  if (!pool.length) return null;
  const weights = pool.map((x) => drillWeight(choiceWordIds(x.q).filter(isUntested).length));
  let r = random() * weights.reduce((t, w) => t + w, 0);
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r < 0) return pool[i];
  }
  return pool[pool.length - 1];
}

/** A locked answer as the miss pool reads it. */
export type LockedAnswer = { questionId: string; isCorrect: boolean; guessed: boolean; updatedAt: Date; id: number };

/**
 * The miss pool: TC / SE items (refs in `items`) whose latest locked answer, in any attempt (mock, retake, drill or
 * replay), was wrong, blank or guessed. A sure right answer anywhere takes the item out; a later miss puts it back.
 */
export function latestMisses(answers: LockedAnswer[], items: Map<string, DrillItem>): DrillItem[] {
  const latest = new Map<string, LockedAnswer>();
  for (const a of answers) {
    if (!items.has(a.questionId)) continue;
    const was = latest.get(a.questionId);
    if (!was || was.updatedAt < a.updatedAt || (+was.updatedAt === +a.updatedAt && was.id < a.id)) latest.set(a.questionId, a);
  }
  return [...latest.values()].filter((a) => !a.isCorrect || a.guessed).map((a) => items.get(a.questionId)!);
}

/** A random miss to replay, skipping the one on screen unless it is the only one left. Null when there is none. */
export function drawMiss(misses: DrillItem[], random: () => number = Math.random, exclude?: string): DrillItem | null {
  const pool = misses.length > 1 && exclude ? misses.filter((x) => `${x.testId}:${x.q.id}` !== exclude) : misses;
  return pool.length ? pool[Math.floor(random() * pool.length)] : null;
}
