import { NextResponse } from "next/server";
import { z } from "zod";
import { canMarkSilly, loadAttemptTest, pairKey, responseFor, setSilly } from "@/lib/attempts";

const Body = z.object({ questionId: z.string(), silly: z.boolean() });

/** Mark a wrong quant answer, once shown, as a silly mistake (or undo it): its concept weakness then counts half. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = Body.safeParse(await req.json().catch(() => null));
  const loaded = await loadAttemptTest(Number(id));
  if (!body.success || !loaded) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const { a, test } = loaded;
  const q = test.questions.find((x) => x.id === body.data.questionId);
  const r = q && (await responseFor(a.id, pairKey(test.id, q.id)));
  if (!q || !r || !canMarkSilly(a, test, q, r)) return NextResponse.json({ error: "not a revealed wrong quant answer" }, { status: 409 });
  await setSilly(r.id, body.data.silly);
  return NextResponse.json({ ok: true, silly: body.data.silly });
}
