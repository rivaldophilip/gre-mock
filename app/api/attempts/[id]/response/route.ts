import { NextResponse } from "next/server";
import { z } from "zod";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { eq } from "drizzle-orm";
import { canReveal, finalizeResponse, loadAttemptTest, pairKey, responseFor, sectionStatus } from "@/lib/attempts";
import { AnswerSchema } from "@/lib/types";
import { scoreAnswer } from "@/lib/scoring";

const GRACE_MS = 15_000;

const Body = z.object({
  questionId: z.string(),
  answer: AnswerSchema.nullable(),
  timeMs: z.number().int().min(0).max(3_600_000),
  guessed: z.boolean(),
  marked: z.boolean(),
  position: z.number().int().min(0).optional(),
  /** practice mode: lock the answer and reveal the key */
  commit: z.boolean().optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const db = await userDb();
  const { id } = await ctx.params;
  const body = Body.safeParse(await req.json().catch(() => null));
  const loaded = await loadAttemptTest(Number(id));
  if (!body.success || !loaded) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const { a, test } = loaded;
  const q = test.questions.find((x) => x.id === body.data.questionId);
  if (!q) return NextResponse.json({ error: "unknown question" }, { status: 400 });
  if (a.finishedAt || sectionStatus(a, q.section).finished) return NextResponse.json({ error: "section closed" }, { status: 409 });
  // the clock is server-side: past time (plus a small grace for the final in-flight save) answers are refused
  const started = sectionStatus(a, q.section).startedAt;
  if (a.timerOn && started) {
    const limitMs = test.sections.find((s) => s.n === q.section)!.minutes * 60_000 + GRACE_MS;
    if (Date.now() - new Date(started).getTime() > limitMs) return NextResponse.json({ error: "time is up" }, { status: 409 });
  }

  const qkey = pairKey(test.id, q.id);
  const existing = await responseFor(a.id, qkey);
  if (existing?.finalized) {
    // answer is locked; still remember where the test-taker is
    if (body.data.position !== undefined) {
      await db.update(schema.attempts).set({ currentPosition: body.data.position }).where(eq(schema.attempts.id, a.id));
    }
    return NextResponse.json({ ok: true, locked: true });
  }

  const ans = body.data.answer ?? undefined;
  const values = {
    attemptId: a.id,
    questionId: qkey,
    answer: body.data.answer,
    isCorrect: scoreAnswer(q, ans),
    timeMs: body.data.timeMs,
    guessed: body.data.guessed,
    marked: body.data.marked,
    updatedAt: new Date(),
  };
  const [row] = await db
    .insert(schema.responses)
    .values(values)
    .onConflictDoUpdate({ target: [schema.responses.attemptId, schema.responses.questionId], set: values })
    .returning({ id: schema.responses.id });
  if (body.data.position !== undefined) {
    await db.update(schema.attempts).set({ currentPosition: body.data.position }).where(eq(schema.attempts.id, a.id));
  }

  if (body.data.commit && a.mode === "practice") {
    await finalizeResponse(a, test, q, row.id);
    const fresh = await responseFor(a.id, qkey);
    return NextResponse.json({
      ok: true,
      reveal: canReveal(a, test, q, fresh) ? { key: q.key, explanation: q.explanation, isCorrect: fresh.isCorrect } : null,
    });
  }
  return NextResponse.json({ ok: true });
}
