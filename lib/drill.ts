import "server-only";
import { and, eq, inArray, isNull, like } from "drizzle-orm";
import { schema } from "./db";
import { userDb } from "./session";
import { listDrillIds, listTestIds, loadTest, publicQuestion } from "./content";
import { scoreAll } from "./priority/compute";
import { drawDrill, drawMiss, latestMisses, type DrillItem } from "./drill-pick";
import type { PublicQuestion } from "./types";

const { attempts, responses, itemEvents, tests, vocab } = schema;

/**
 * Every drill item of a registered batch, which ones are answered (a locked response), and each bank word's coverage
 * now. A batch on disk that has not been registered is a draft still going through its checks, so it stays out.
 */
async function pool() {
  const db = await userDb();
  const registered = new Set((await db.select({ id: tests.id }).from(tests).where(like(tests.id, "drill-%"))).map((t) => t.id));
  const items: DrillItem[] = listDrillIds().filter((id) => registered.has(id)).flatMap((id) => {
    const t = loadTest(id);
    return t ? t.questions.map((q) => ({ testId: id, q })) : [];
  });
  const drillAttempts = await db.select().from(attempts).where(and(eq(attempts.mode, "drill"), isNull(attempts.abandonedAt)));
  const answered = new Set<string>();
  if (drillAttempts.length) {
    const rows = await db
      .select({ q: responses.questionId })
      .from(responses)
      .where(and(eq(responses.finalized, true), inArray(responses.attemptId, drillAttempts.map((a) => a.id))));
    for (const r of rows) answered.add(r.q);
  }
  const [words, events] = await Promise.all([
    db.select({ id: vocab.id, yield: vocab.yield }).from(vocab),
    db.select().from(itemEvents).where(eq(itemEvents.kind, "word")),
  ]);
  // the same scoring /stats counts "untested" with (C === 0: never a key, distractor or passage word)
  const scores = scoreAll(words, events.map((e) => ({ itemId: e.itemId, event: e.event, weight: e.weight, createdAt: e.createdAt, attemptId: e.attemptId })));
  const untested = new Set(scores.filter((s) => s.C === 0).map((s) => s.itemId));
  return { db, items, answered, untested, drillAttempts };
}

/** Every TC / SE item that can be missed: the verbal mocks' and the drill batches', by ref. */
function vocabItems(drill: DrillItem[]): Map<string, DrillItem> {
  const mocks = listTestIds()
    .filter((id) => id.startsWith("verbal-"))
    .flatMap((id) => {
      const t = loadTest(id);
      return t ? t.questions.filter((q) => q.type === "tc" || q.type === "se").map((q) => ({ testId: id, q })) : [];
    });
  return new Map([...mocks, ...drill].map((x) => [`${x.testId}:${x.q.id}`, x]));
}

/** The TC / SE items whose latest locked answer anywhere was wrong, blank or guessed (see latestMisses). */
async function missPool(db: Awaited<ReturnType<typeof userDb>>, drill: DrillItem[]) {
  const rows = await db
    .select({ questionId: responses.questionId, isCorrect: responses.isCorrect, guessed: responses.guessed, updatedAt: responses.updatedAt, id: responses.id })
    .from(responses)
    .where(eq(responses.finalized, true));
  return latestMisses(rows, vocabItems(drill));
}

export type DrillSummary = { left: number; total: number; untested: number; misses: number };

/** What the dashboard card shows: questions left in the pool, bank words never tested, and misses to replay. */
export async function drillSummary(): Promise<DrillSummary> {
  const { db, items, answered, untested } = await pool();
  const misses = await missPool(db, items);
  return { left: items.filter((x) => !answered.has(`${x.testId}:${x.q.id}`)).length, total: items.length, untested: untested.size, misses: misses.length };
}

export type DrillPick = DrillSummary & { attemptId: number; ref: string; question: PublicQuestion; from: string };

/**
 * The next drill question: an unanswered item, weighted toward the most untested choice words, with its batch's
 * attempt (created on first use; nothing is logged until the answer is checked). Null when the pool is empty.
 */
export async function pickNext(exclude?: string): Promise<DrillPick | (DrillSummary & { attemptId: null })> {
  const { db, items, answered, untested, drillAttempts } = await pool();
  const left = items.filter((x) => !answered.has(`${x.testId}:${x.q.id}`)).length;
  const summary = { left, total: items.length, untested: untested.size, misses: (await missPool(db, items)).length };
  const pick = drawDrill(items, answered, (w) => untested.has(w), Math.random, exclude);
  if (!pick) return { ...summary, attemptId: null };
  let a = drillAttempts.find((x) => x.testId === pick.testId && !x.finishedAt);
  if (!a) [a] = await db.insert(attempts).values({ testId: pick.testId, mode: "drill", timerOn: false }).returning();
  return { ...summary, attemptId: a.id, ref: `${pick.testId}:${pick.q.id}`, question: publicQuestion(pick.q), from: pick.testId };
}

/**
 * The next miss to replay, at random (never the one in `exclude` while another is left), with a replay attempt for
 * its test that has not answered it yet: a response row is one per attempt and question, and a miss missed again
 * comes back. `left` is the miss count. Null attempt when nothing is left to replay.
 */
export async function pickReplay(exclude?: string): Promise<DrillPick | (DrillSummary & { attemptId: null })> {
  const { db, items, untested } = await pool();
  const misses = await missPool(db, items);
  const summary = { left: misses.length, total: items.length, untested: untested.size, misses: misses.length };
  const pick = drawMiss(misses, Math.random, exclude);
  if (!pick) return { ...summary, attemptId: null };
  const ref = `${pick.testId}:${pick.q.id}`;
  const runs = await db.select().from(attempts).where(and(eq(attempts.mode, "replay"), eq(attempts.testId, pick.testId), isNull(attempts.abandonedAt)));
  const used = runs.length
    ? new Set((await db.select({ a: responses.attemptId }).from(responses).where(and(eq(responses.questionId, ref), inArray(responses.attemptId, runs.map((r) => r.id))))).map((r) => r.a))
    : new Set<number>();
  let a = runs.find((r) => !used.has(r.id));
  if (!a) [a] = await db.insert(attempts).values({ testId: pick.testId, mode: "replay", timerOn: false }).returning();
  return { ...summary, attemptId: a.id, ref, question: publicQuestion(pick.q), from: pick.testId };
}
