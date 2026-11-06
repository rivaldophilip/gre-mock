import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { WORD_W } from "@/lib/priority/config";

const Body = z.object({ word: z.string().min(2).max(40), attemptId: z.number().int().optional() });

function slug(w: string) {
  return w.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Tag a word as "didn't know". Unknown words join the bank as tier=user_added. */
export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const lemma = body.data.word.trim().toLowerCase().replace(/[^a-z'-]/g, "");
  const id = slug(lemma);
  if (id.length < 2) return NextResponse.json({ error: "bad word" }, { status: 400 });
  const [existing] = await db().select({ id: schema.vocab.id }).from(schema.vocab).where(eq(schema.vocab.id, id));
  let added = false;
  if (!existing) {
    await db().insert(schema.vocab).values({ id, lemma, tier: "user_added", yield: 0.6, sources: ["user"], sourceCount: 0 }).onConflictDoNothing();
    added = true;
  }
  await db().insert(schema.itemEvents).values({
    kind: "word",
    itemId: id,
    event: "dont_know",
    weight: WORD_W.dont_know,
    attemptId: body.data.attemptId ?? null,
  });
  return NextResponse.json({ ok: true, id, added });
}
