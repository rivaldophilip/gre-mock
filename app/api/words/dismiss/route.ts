import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";
import { schema } from "@/lib/db";
import { userDb } from "@/lib/session";
import { WORD_W } from "@/lib/priority/config";

const Body = z.object({ ids: z.array(z.string().min(1).max(60)).min(1).max(500) });

const dismissals = (ids: string[]) =>
  and(eq(schema.itemEvents.kind, "word"), inArray(schema.itemEvents.itemId, ids), eq(schema.itemEvents.event, "dismissed"));

/** Dismiss words from the weakest list (known, or not worth it): no brief or drill targets them until a later miss. */
export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const db = await userDb();
  const found = await db.select({ id: schema.vocab.id }).from(schema.vocab).where(inArray(schema.vocab.id, [...new Set(body.data.ids)]));
  if (!found.length) return NextResponse.json({ error: "unknown words" }, { status: 404 });
  // a fresh row each time: a word missed after an earlier dismissal is live again, and dismissing it again must be newer
  await db.insert(schema.itemEvents).values(found.map((v) => ({ kind: "word", itemId: v.id, event: "dismissed", weight: WORD_W.dismissed })));
  return NextResponse.json({ ok: true, dismissed: found.length });
}

/** Restore dismissed words (or undo a dismissal): drop their dismissals, so their own history decides again. */
export async function DELETE(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const db = await userDb();
  const gone = await db.delete(schema.itemEvents).where(dismissals(body.data.ids)).returning({ id: schema.itemEvents.id });
  return NextResponse.json({ ok: true, removed: gone.length });
}
