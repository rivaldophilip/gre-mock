import { NextResponse } from "next/server";
import { userDb } from "@/lib/session";
import { cancelQuiz } from "@/lib/quiz";

/** Cancel a draft or discard a ready quiz, so its items go back to the bank's stock. */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const ok = await cancelQuiz(await userDb(), id);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not a draft or ready quiz" }, { status: 409 });
}
