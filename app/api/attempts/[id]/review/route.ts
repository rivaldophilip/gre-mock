import { NextResponse } from "next/server";
import { canReveal, loadAttemptTest, responsesFor } from "@/lib/attempts";
import { refOf } from "@/lib/ref";
import { scoreAnswer } from "@/lib/scoring";
import type { Answer } from "@/lib/types";

/** Keys + explanations for whatever the attempt is allowed to see right now. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const loaded = await loadAttemptTest(Number(id));
  if (!loaded) return NextResponse.json({ error: "not found" }, { status: 404 });
  const { a, test } = loaded;
  const rows = new Map((await responsesFor(a.id)).map((r) => [r.questionId, r]));
  const out: Record<string, unknown> = {};
  for (const q of test.questions) {
    const r = rows.get(refOf(q));
    if (!canReveal(a, test, q, r)) continue;
    out[q.id] = {
      key: q.key,
      explanation: q.explanation,
      tags: q.tags,
      isCorrect: scoreAnswer(q, (r?.answer ?? undefined) as Answer | undefined),
    };
  }
  return NextResponse.json(out);
}
