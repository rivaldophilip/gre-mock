import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { sourceHead } from "@/lib/bank";
import { quizIdOf } from "@/lib/virtual-test";

const Body = z.object({ testId: z.string(), mode: z.enum(["exam", "practice"]), timerOn: z.boolean() });

/** Start an attempt: at a ready quiz (which is then started, so its items stay held), or at a synced source. */
export async function POST(req: Request) {
  const db = await userDb();
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const { testId, mode, timerOn } = body.data;
  const quizId = quizIdOf(testId);
  if (quizId !== null) {
    const [quiz] = await db.select().from(schema.quizzes).where(eq(schema.quizzes.id, quizId));
    if (!quiz || quiz.status !== "ready") return NextResponse.json({ error: quiz ? `quiz is ${quiz.status}` : "no such quiz" }, { status: quiz ? 409 : 400 });
    await db.update(schema.quizzes).set({ status: "started", updatedAt: new Date() }).where(eq(schema.quizzes.id, quizId));
  } else if (!(await sourceHead(testId))) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const [a] = await db.insert(schema.attempts).values({ testId, mode, timerOn }).returning({ id: schema.attempts.id });
  return NextResponse.json({ id: a.id });
}
