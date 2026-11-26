import { NextResponse } from "next/server";
import { userDb } from "@/lib/session";
import { confirmQuiz } from "@/lib/quiz";

/** Proceed with a draft quiz despite its fallbacks. 409 when it went stale (an item in it was seen or held since). */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const r = await confirmQuiz(await userDb(), id);
  return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.status === "stale" ? "the bank changed since; assemble it again" : `quiz is ${r.status}` }, { status: 409 });
}
