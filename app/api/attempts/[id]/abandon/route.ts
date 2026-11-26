import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { isClosed, loadAttemptTest, type SectionState } from "@/lib/attempts";
import { paused } from "@/lib/clock";
import { closeQuiz } from "@/lib/quiz";

/**
 * Give up on an unfinished attempt. Sections not yet submitted are left unfinalized, so they log no item events;
 * a finished section and checked practice answers keep theirs. The attempt stays reviewable.
 */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const loaded = await loadAttemptTest(Number(id));
  if (!loaded) return NextResponse.json({ error: "not found" }, { status: 404 });
  const { a } = loaded;
  if (isClosed(a)) return NextResponse.json({ ok: true });
  const st = { ...(a.sectionState as SectionState) };
  for (const k of Object.keys(st)) st[k] = paused(st[k], Date.now(), "away") ?? st[k];
  const db = await userDb();
  await db.update(schema.attempts).set({ abandonedAt: new Date(), sectionState: st }).where(eq(schema.attempts.id, a.id));
  // an abandoned quiz holds nothing more; its unseen items go back to the bank's stock
  await closeQuiz(db, a.testId, "abandoned");
  return NextResponse.json({ ok: true });
}
