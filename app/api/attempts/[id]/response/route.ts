import { NextResponse } from "next/server";
import { serverTiming } from "@/lib/timing";
import { z } from "zod";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { eq } from "drizzle-orm";
import { canReveal, logResponseEvents, revealWords, isClosed, isDrill, isReplay, loadAttemptTest, sectionStatus, secondsLeft, setClockPaused } from "@/lib/attempts";
import { AnswerSchema } from "@/lib/types";
import { refOf } from "@/lib/ref";
import { scoreAnswer } from "@/lib/scoring";

const Body = z.object({
  questionId: z.string(),
  answer: AnswerSchema.nullable(),
  timeMs: z.number().int().min(0).max(3_600_000),
  guessed: z.boolean(),
  marked: z.boolean(),
  position: z.number().int().min(0).optional(),
  /** practice, drill and replay: lock the answer and reveal the key (in practice it also pauses the section clock) */
  commit: z.boolean().optional(),
  /**
   * practice mode, sent on every move: whether the question moved to has its answer shown (the section clock stops
   * while it is read) or is still open (the clock restarts). Stating the wanted state, not a change, keeps the clock
   * right even if an earlier request was lost.
   */
  review: z.boolean().optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const t0 = Date.now();
  const db = await userDb();
  const { id } = await ctx.params;
  const body = Body.safeParse(await req.json().catch(() => null));
  const loaded = await loadAttemptTest(Number(id));
  if (!body.success || !loaded) return NextResponse.json({ error: "bad request" }, { status: 400, headers: serverTiming(t0) });
  const { test } = loaded;
  let { a } = loaded;
  const q = test.questions.find((x) => x.id === body.data.questionId);
  if (!q) return NextResponse.json({ error: "unknown question" }, { status: 400, headers: serverTiming(t0) });
  if (isClosed(a) || sectionStatus(a, q.section).finished) return NextResponse.json({ error: "section closed" }, { status: 409, headers: serverTiming(t0) });
  // past the limit the clock runs negative and answers are still taken; the review shows the overtime
  if (body.data.review !== undefined && a.mode === "practice") a = await setClockPaused(a, q.section, body.data.review, "reveal");
  const clock = () => ({ secondsLeft: secondsLeft(a, test, q.section) });

  // Every query is a round trip to the database, so the ones that don't depend on each other run in parallel: a
  // Check waits on the attempt, one upsert and then one parallel step.
  const commit = !!body.data.commit && (a.mode === "practice" || isDrill(a) || isReplay(a));
  const savePosition = () =>
    body.data.position === undefined ? null : db.update(schema.attempts).set({ currentPosition: body.data.position }).where(eq(schema.attempts.id, a.id));

  const ans = body.data.answer ?? undefined;
  const values = {
    attemptId: a.id,
    questionId: refOf(q),
    answer: body.data.answer,
    isCorrect: scoreAnswer(q, ans),
    timeMs: body.data.timeMs,
    guessed: body.data.guessed,
    marked: body.data.marked,
    reused: !!q.reused,
    updatedAt: new Date(),
    // a Check claims the response in the same write (finalizeResponse's claim), so its events are logged once
    ...(commit ? { finalized: true } : {}),
  };
  // a locked (finalized) answer is never overwritten: the upsert then returns no row
  const [row] = await db
    .insert(schema.responses)
    .values(values)
    .onConflictDoUpdate({ target: [schema.responses.attemptId, schema.responses.questionId], set: values, setWhere: eq(schema.responses.finalized, false) })
    .returning();
  if (!row) {
    // answer is locked; still remember where the test-taker is
    await savePosition();
    return NextResponse.json({ ok: true, locked: true, ...clock() }, { headers: serverTiming(t0) });
  }

  if (commit) {
    // a drill attempt stays open: the drill pool is the shared bank, not one batch (lib/drill.ts)
    const [paused, reveal] = await Promise.all([
      a.mode === "practice" ? setClockPaused(a, q.section, true, "reveal") : a,
      revealWords(q, test),
      logResponseEvents(a, test, q, row),
      savePosition(),
    ]);
    a = paused;
    return NextResponse.json({
      ok: true,
      reveal: canReveal(a, test, q, row) ? { key: q.key, explanation: q.explanation, isCorrect: row.isCorrect, words: reveal } : null,
      ...clock(),
    }, { headers: serverTiming(t0) });
  }
  await savePosition();
  return NextResponse.json({ ok: true, ...clock() }, { headers: serverTiming(t0) });
}
