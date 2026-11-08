import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { isClosed, loadAttemptTest, secondsLeft, setClockPaused, type SectionState } from "@/lib/attempts";
import { heartbeat } from "@/lib/clock";

const Body = z.object({ section: z.union([z.literal(1), z.literal(2)]), action: z.enum(["pause", "resume", "heartbeat", "hold", "release"]) });

/**
 * The section clock while the test-taker comes and goes: "pause" when they leave the page (or press Pause & exit),
 * "resume" when they are back, "heartbeat" every few seconds while the page is open. A clock that stops hearing
 * heartbeats counts as paused from the last one (see lib/clock.ts), so a crash does not burn the section's time.
 * "hold" / "release" are the practice-mode Pause / Resume button: the test-taker stays on the page, and coming and
 * going does not lift the hold.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = Body.safeParse(await req.json().catch(() => null));
  const loaded = await loadAttemptTest(Number(id));
  if (!body.success || !loaded) return NextResponse.json({ error: "bad request" }, { status: 400 });
  let { a } = loaded;
  const { test } = loaded;
  const { section, action } = body.data;
  if (isClosed(a)) return NextResponse.json({ error: "attempt closed" }, { status: 409 });
  if (!a.timerOn) return NextResponse.json({ ok: true, secondsLeft: null });

  if (action === "heartbeat") {
    const st = a.sectionState as SectionState;
    const next = heartbeat(st[String(section)]);
    if (next) {
      const sectionState = { ...st, [String(section)]: next };
      const db = await userDb();
      await db.update(schema.attempts).set({ sectionState }).where(eq(schema.attempts.id, a.id));
      a = { ...a, sectionState };
    }
  } else if (action === "hold" || action === "release") {
    if (a.mode !== "practice") return NextResponse.json({ error: "practice only" }, { status: 409 });
    a = await setClockPaused(a, section, action === "hold", "hold");
  } else {
    a = await setClockPaused(a, section, action === "pause", "away");
  }
  return NextResponse.json({ ok: true, sectionState: a.sectionState, secondsLeft: secondsLeft(a, test, section) });
}
