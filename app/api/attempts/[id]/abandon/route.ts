import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { isClosed, loadAttemptTest, type SectionState } from "@/lib/attempts";
import { paused } from "@/lib/clock";

/**
 * Give up on an unfinished attempt. Sections not yet submitted are left unfinalized, so they log no item events;
 * a finished section and checked practice answers keep theirs. The attempt stays reviewable, and the test can be
 * started again.
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
  return NextResponse.json({ ok: true });
}
