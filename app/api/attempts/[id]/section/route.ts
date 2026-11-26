import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { finalizeSection, isClosed, loadAttemptTest, sectionStatus, secondsLeft, type SectionState } from "@/lib/attempts";
import { closeQuiz } from "@/lib/quiz";

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
  if (a.abandonedAt) return NextResponse.json({ error: "attempt abandoned" }, { status: 409 });
  const st = { ...(a.sectionState as SectionState) };
  const key = String(section);
  const now = new Date().toISOString();

  if (!test.sections.some((s) => s.n === section)) return NextResponse.json({ error: "no such section" }, { status: 400 });
  if (action === "start") {
    if (section > 1 && !sectionStatus(a, (section - 1) as 1 | 2).finished) return NextResponse.json({ error: `finish section ${section - 1} first` }, { status: 409 });
    // only the first start resets the position; a repeated start (double click, retry) is a no-op
    if (!st[key]?.startedAt) {
      st[key] = { startedAt: now, lastSeenAt: now };
      await db.update(schema.attempts).set({ sectionState: st, currentPosition: 0 }).where(eq(schema.attempts.id, a.id));
    }
  } else {
    if (!st[key]?.finishedAt) {
      st[key] = { ...st[key], startedAt: st[key]?.startedAt ?? now, finishedAt: now };
      await db.update(schema.attempts).set({ sectionState: st }).where(eq(schema.attempts.id, a.id));
      a = { ...a, sectionState: st };
      await finalizeSection(a, test, section);
    }
    // a custom quiz has one section, a mock two
    if (test.sections.every((s) => st[String(s.n)]?.finishedAt) && !isClosed(a)) {
      await db.update(schema.attempts).set({ finishedAt: new Date() }).where(eq(schema.attempts.id, a.id));
      await closeQuiz(db, a.testId, "done");
    }
  }
  a = { ...a, sectionState: st };
  return NextResponse.json({ ok: true, sectionState: st, secondsLeft: secondsLeft(a, test, section) });
}
