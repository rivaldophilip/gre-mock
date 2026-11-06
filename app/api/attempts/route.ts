import { NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { loadTest } from "@/lib/content";

const Body = z.object({ testId: z.string(), mode: z.enum(["exam", "practice"]), timerOn: z.boolean() });

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success || !loadTest(body.data.testId)) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const [a] = await db()
    .insert(schema.attempts)
    .values({ testId: body.data.testId, mode: body.data.mode, timerOn: body.data.timerOn })
    .returning({ id: schema.attempts.id });
  return NextResponse.json({ id: a.id });
}
