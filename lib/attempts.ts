import "server-only";
import { and, eq } from "drizzle-orm";
import { schema } from "./db";
import { userDb } from "./session";
import { loadTest, orderedQuestions } from "./content";
import { eventsForResponse } from "./events";
import { scoreAnswer } from "./scoring";
import type { Answer, Question, Test } from "./types";

const { attempts, responses, itemEvents } = schema;

export type SectionState = Record<string, { startedAt?: string; finishedAt?: string }>;
export type Attempt = typeof attempts.$inferSelect;

export async function getAttempt(id: number): Promise<Attempt | null> {
  const db = await userDb();
  const [a] = await db.select().from(attempts).where(eq(attempts.id, id));
  return a ?? null;
}

export function sectionStatus(a: Attempt, n: 1 | 2) {
  const st = (a.sectionState as SectionState)[String(n)];
  return { started: !!st?.startedAt, finished: !!st?.finishedAt, startedAt: st?.startedAt };
}

/** Seconds left in a section, from server time (so refresh cannot reset the clock). */
export function secondsLeft(a: Attempt, test: Test, n: 1 | 2, now = Date.now()): number | null {
  if (!a.timerOn) return null;
  const st = (a.sectionState as SectionState)[String(n)];
  if (!st?.startedAt) return null;
  const total = test.sections.find((s) => s.n === n)!.minutes * 60;
  return Math.max(0, Math.round(total - (now - new Date(st.startedAt).getTime()) / 1000));
}

export function pairKey(testId: string, qid: string) {
  return `${testId}:${qid}`;
}

/** Can the key/explanation for this question be shown right now? */
export function canReveal(a: Attempt, test: Test, q: Question, resp?: { finalized: boolean }): boolean {
  if (a.finishedAt) return true;
  if (a.mode === "practice") return !!resp?.finalized;
  return sectionStatus(a, q.section).finished;
}

/**
 * Emit item events for one response. Idempotent: the response is claimed by flipping `finalized`
 * first, so a double click or a timer racing the Finish button cannot log the events twice.
 */
export async function finalizeResponse(a: Attempt, test: Test, q: Question, respId: number) {
  const db = await userDb();
  const [r] = await db
    .update(responses)
    .set({ finalized: true })
    .where(and(eq(responses.id, respId), eq(responses.finalized, false)))
    .returning();
  if (!r) return;
  const ans = (r.answer ?? undefined) as Answer | undefined;
  const passageTags = q.passageId ? (test.passages.find((p) => p.id === q.passageId)?.tags ?? []) : [];
  const evs = eventsForResponse(q, test.measure, ans, { guessed: r.guessed, timeMs: r.timeMs }, passageTags);
  if (evs.length) {
    await db
      .insert(itemEvents)
      .values(evs.map((e) => ({ kind: e.kind, itemId: e.itemId, event: e.event, weight: e.weight, responseId: r.id, attemptId: a.id })));
  }
  await db.update(responses).set({ isCorrect: scoreAnswer(q, ans) }).where(eq(responses.id, r.id));
}

export async function finalizeSection(a: Attempt, test: Test, n: 1 | 2) {
  const db = await userDb();
  const rows = await db.select().from(responses).where(eq(responses.attemptId, a.id));
  const byQ = new Map(rows.map((r) => [r.questionId, r]));
  for (const q of orderedQuestions(test).filter((q) => q.section === n)) {
    const r = byQ.get(pairKey(test.id, q.id));
    if (r) await finalizeResponse(a, test, q, r.id);
    else {
      // unanswered: record the miss so stats still see it
      const [ins] = await db
        .insert(responses)
        .values({ attemptId: a.id, questionId: pairKey(test.id, q.id), answer: null, isCorrect: false })
        .onConflictDoNothing()
        .returning({ id: responses.id });
      if (ins) await finalizeResponse(a, test, q, ins.id);
    }
  }
}

export async function loadAttemptTest(id: number) {
  const a = await getAttempt(id);
  if (!a) return null;
  const test = loadTest(a.testId);
  if (!test) return null;
  return { a, test };
}

export async function responsesFor(attemptId: number) {
  const db = await userDb();
  return db.select().from(responses).where(eq(responses.attemptId, attemptId));
}

export async function responseFor(attemptId: number, qkey: string) {
  const db = await userDb();
  const [r] = await db
    .select()
    .from(responses)
    .where(and(eq(responses.attemptId, attemptId), eq(responses.questionId, qkey)));
  return r;
}
