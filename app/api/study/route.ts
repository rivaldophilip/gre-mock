import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { loadStudy } from "@/lib/content";
import { MARK_KINDS, markIds } from "@/lib/study";

const Body = z.object({
  measure: z.enum(["verbal", "quant"]),
  kind: z.enum(MARK_KINDS),
  id: z.string().min(1).max(300),
  state: z.enum(["archived", "deleted", "shown"]),
});

/** Archive, delete, or restore (state "shown") one formula card or topic of a study guide. */
export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const { measure, kind, id, state } = body.data;
  const guide = loadStudy(measure);
  if (!guide || !markIds(guide)[kind].has(id)) return NextResponse.json({ error: "not found" }, { status: 404 });

  const db = await userDb();
  const t = schema.studyMarks;
  if (state === "shown") {
    await db.delete(t).where(and(eq(t.measure, measure), eq(t.kind, kind), eq(t.itemId, id)));
  } else {
    const updatedAt = new Date();
    await db.insert(t).values({ measure, kind, itemId: id, state, updatedAt }).onConflictDoUpdate({ target: [t.measure, t.kind, t.itemId], set: { state, updatedAt } });
  }
  return NextResponse.json({ ok: true });
}
