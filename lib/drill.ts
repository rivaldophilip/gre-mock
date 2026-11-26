import "server-only";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { schema } from "./db";
import { userDb } from "./session";
import { publicQuestion } from "./content";
import { bankMetas, bankQuestions, type ItemMeta } from "./bank";
import { heldRefs } from "./holds";
import { scoreAll } from "./priority/compute";
import { drawDrill, drawMiss, latestMisses, type DrillItem } from "./drill-pick";
import type { PublicQuestion, Question } from "./types";

const { attempts, responses, itemEvents, vocab, quizzes } = schema;

/** A TC / SE item as the drill draws it: only its id and tags matter until it is picked (drill-pick.ts). */
const drillItem = (m: ItemMeta): DrillItem => ({ testId: m.sourceId, q: { id: m.qid, type: m.type, tags: m.tags, ref: m.ref } as Question });
const isVocab = (m: ItemMeta) => m.measure === "verbal" && (m.type === "tc" || m.type === "se");

/**
 * The drill pool is the shared bank's TC / SE stock (docs/BANK.md): every active item of any source (mocks, drill and
 * bank batches) that the user has never been shown and no open quiz or mock holds. So the drill and assembled mocks
 * draw on one pool, and an item answered in either is gone from both. Also each bank word's coverage now.
 */
async function pool() {
  const db = await userDb();
  const [metas, seenRows, quizRows, attemptRows, words, events] = await Promise.all([
    bankMetas(),
    db.selectDistinct({ q: responses.questionId }).from(responses),
    db.select({ id: quizzes.id, status: quizzes.status, layout: quizzes.layout }).from(quizzes),
    db.select().from(attempts),
    db.select({ id: vocab.id, yield: vocab.yield, exposureOnly: vocab.exposureOnly }).from(vocab),
    db.select().from(itemEvents).where(eq(itemEvents.kind, "word")),
  ]);
  const seen = new Set(seenRows.map((r) => r.q));
  const held = heldRefs(quizRows, attemptRows, (sid) => (metas.bySource.get(sid) ?? []).map((i) => i.ref));
  const stock = metas.items.filter((m) => isVocab(m) && m.status === "active");
  const items = stock.filter((m) => !seen.has(m.ref) && !held.has(m.ref)).map(drillItem);
  // the same scoring /stats counts "untested" with (C === 0: never a key, distractor or passage word); exposure-only
  // words are left out, since a drill item (no passage) never shows them, and so are dismissed ones
  const scores = scoreAll(words, events.map((e) => ({ itemId: e.itemId, event: e.event, weight: e.weight, createdAt: e.createdAt, attemptId: e.attemptId })));
  const untested = new Set(scores.filter((s) => s.C === 0 && !s.exposureOnly && !s.dismissed).map((s) => s.itemId));
  const drillAttempts = attemptRows.filter((a) => a.mode === "drill" && !a.abandonedAt);
  return { db, metas, items, total: stock.length, seen, untested, drillAttempts };
}

/** Every TC / SE item that can be missed, by ref: any source's, retired ones included (an old answer still counts). */
function vocabItems(metas: Awaited<ReturnType<typeof bankMetas>>): Map<string, DrillItem> {
  return new Map(metas.items.filter((m) => isVocab(m) && m.status !== "gone").map((m) => [m.ref, drillItem(m)]));
}

/** The TC / SE items whose latest locked answer anywhere was wrong, blank or guessed (see latestMisses). */
async function missPool(db: Awaited<ReturnType<typeof userDb>>, metas: Awaited<ReturnType<typeof bankMetas>>) {
  const rows = await db
    .select({ questionId: responses.questionId, isCorrect: responses.isCorrect, guessed: responses.guessed, updatedAt: responses.updatedAt, id: responses.id })
    .from(responses)
    .where(eq(responses.finalized, true));
  return latestMisses(rows, vocabItems(metas));
}

export type DrillSummary = { left: number; total: number; untested: number; misses: number };

/** What the dashboard card shows: questions left in the pool, bank words never tested, and misses to replay. */
export async function drillSummary(): Promise<DrillSummary> {
  const { db, metas, items, total, untested } = await pool();
  const misses = await missPool(db, metas);
  return { left: items.length, total, untested: untested.size, misses: misses.length };
}

export type DrillPick = DrillSummary & { attemptId: number; ref: string; question: PublicQuestion; from: string };

/** The question body for a picked item, as the runner may see it. */
async function shown(ref: string): Promise<PublicQuestion> {
  const q = (await bankQuestions([ref])).get(ref);
  if (!q) throw new Error(`drill item ${ref} is not in the bank`);
  return publicQuestion(q);
}

/**
 * The next drill question: an unseen item, weighted toward the most untested choice words, with an open drill attempt
 * on its source (created on first use; nothing is logged until the answer is checked). Null when the pool is empty.
 */
export async function pickNext(exclude?: string): Promise<DrillPick | (DrillSummary & { attemptId: null })> {
  const { db, metas, items, total, seen, untested, drillAttempts } = await pool();
  const summary = { left: items.length, total, untested: untested.size, misses: (await missPool(db, metas)).length };
  const pick = drawDrill(items, seen, (w) => untested.has(w), Math.random, exclude);
  if (!pick) return { ...summary, attemptId: null };
  let a = drillAttempts.find((x) => x.testId === pick.testId && !x.finishedAt);
  if (!a) [a] = await db.insert(attempts).values({ testId: pick.testId, mode: "drill", timerOn: false }).returning();
  const ref = pick.q.ref!;
  return { ...summary, attemptId: a.id, ref, question: await shown(ref), from: pick.testId };
}

/**
 * The next miss to replay, at random (never the one in `exclude` while another is left), with a replay attempt for
 * its source that has not answered it yet: a response row is one per attempt and question, and a miss missed again
 * comes back. `left` is the miss count. Null attempt when nothing is left to replay.
 */
export async function pickReplay(exclude?: string): Promise<DrillPick | (DrillSummary & { attemptId: null })> {
  const { db, metas, total, untested } = await pool();
  const misses = await missPool(db, metas);
  const summary = { left: misses.length, total, untested: untested.size, misses: misses.length };
  const pick = drawMiss(misses, Math.random, exclude);
  if (!pick) return { ...summary, attemptId: null };
  const ref = pick.q.ref!;
  const runs = await db.select().from(attempts).where(and(eq(attempts.mode, "replay"), eq(attempts.testId, pick.testId), isNull(attempts.abandonedAt)));
  const used = runs.length
    ? new Set((await db.select({ a: responses.attemptId }).from(responses).where(and(eq(responses.questionId, ref), inArray(responses.attemptId, runs.map((r) => r.id))))).map((r) => r.a))
    : new Set<number>();
  let a = runs.find((r) => !used.has(r.id));
  if (!a) [a] = await db.insert(attempts).values({ testId: pick.testId, mode: "replay", timerOn: false }).returning();
  return { ...summary, attemptId: a.id, ref, question: await shown(ref), from: pick.testId };
}
