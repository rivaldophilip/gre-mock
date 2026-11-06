import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { finalizeSection, loadAttemptTest, sectionStatus, secondsLeft, type SectionState } from "@/lib/attempts";

const Body = z.object({ section: z.union([z.literal(1), z.literal(2)]), action: z.enum(["start", "finish"]) });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const db = await userDb();
  const { id } = await ctx.params;
  const body = Body.safeParse(await req.json().catch(() => null));
  const loaded = await loadAttemptTest(Number(id));
  if (!body.success || !loaded) return NextResponse.json({ error: "bad request" }, { status: 400 });
  let { a } = loaded;
  const { test } = loaded;
  const { section, action } = body.data;
  const st = { ...(a.sectionState as SectionState) };
  const key = String(section);
  const now = new Date().toISOString();

  if (action === "start") {
    if (section === 2 && !sectionStatus(a, 1).finished) return NextResponse.json({ error: "finish section 1 first" }, { status: 409 });
    // only the first start resets the position; a repeated start (double click, retry) is a no-op
    if (!st[key]?.startedAt) {
      st[key] = { startedAt: now };
      await db.update(schema.attempts).set({ sectionState: st, currentPosition: 0 }).where(eq(schema.attempts.id, a.id));
    }
  } else {
    if (!st[key]?.finishedAt) {
      st[key] = { ...st[key], startedAt: st[key]?.startedAt ?? now, finishedAt: now };
      await db.update(schema.attempts).set({ sectionState: st }).where(eq(schema.attempts.id, a.id));
      a = { ...a, sectionState: st };
      await finalizeSection(a, test, section);
    }
    if (st["1"]?.finishedAt && st["2"]?.finishedAt && !a.finishedAt) {
      await db.update(schema.attempts).set({ finishedAt: new Date() }).where(eq(schema.attempts.id, a.id));
    }
  }
  a = { ...a, sectionState: st };
  return NextResponse.json({ ok: true, sectionState: st, secondsLeft: secondsLeft(a, test, section) });
}
