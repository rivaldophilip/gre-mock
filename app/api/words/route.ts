import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { WORD_W } from "@/lib/priority/config";

const Body = z.object({ word: z.string().min(2).max(40), attemptId: z.number().int().optional() });

function slug(w: string) {
  return w.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Candidate base forms for an inflected word as it appears in a passage ("abated" -> "abate"). */
function candidates(lemma: string): string[] {
  const out = [lemma];
  for (const [suf, rep] of [["ies", "y"], ["ied", "y"], ["es", ""], ["s", ""], ["ed", ""], ["ed", "e"], ["ing", ""], ["ing", "e"], ["ly", ""], ["ily", "y"]] as const) {
    if (lemma.endsWith(suf) && lemma.length - suf.length >= 3) out.push(lemma.slice(0, -suf.length) + rep);
  }
  // doubled consonant: "abetted" -> "abet"
  const m = lemma.match(/^(.*([bcdfgklmnprstvz]))\2(ed|ing)$/);
  if (m) out.push(m[1]);
  return [...new Set(out.map(slug))];
}

/** Resolve a tapped word to a bank entry: exact id, then a known variant, then an inflection. */
async function resolve(lemma: string) {
  const ids = candidates(lemma);
  const rows = await db()
    .select({ id: schema.vocab.id, lemma: schema.vocab.lemma, senses: schema.vocab.senses })
    .from(schema.vocab)
    .where(inArray(schema.vocab.id, ids));
  const byId = new Map(rows.map((r) => [r.id, r]));
  for (const id of ids) if (byId.has(id)) return byId.get(id)!;
  const [v] = await db()
    .select({ id: schema.vocab.id, lemma: schema.vocab.lemma, senses: schema.vocab.senses })
    .from(schema.vocab)
    .where(sql`${lemma} = any(${schema.vocab.variants})`);
  return v ?? null;
}

function parse(raw: unknown) {
  const body = Body.safeParse(raw);
  if (!body.success) return null;
  const lemma = body.data.word.trim().toLowerCase().replace(/[^a-z'-]/g, "");
  if (slug(lemma).length < 2) return null;
  return { lemma, attemptId: body.data.attemptId ?? null };
}

const sameTag = (id: string, attemptId: number | null) =>
  and(
    eq(schema.itemEvents.kind, "word"),
    eq(schema.itemEvents.itemId, id),
    eq(schema.itemEvents.event, "dont_know"),
    attemptId === null ? isNull(schema.itemEvents.attemptId) : eq(schema.itemEvents.attemptId, attemptId),
  );

/** Tag a word as "didn't know" (once per attempt). Unknown words join the bank as tier=user_added. */
export async function POST(req: Request) {
  const p = parse(await req.json().catch(() => null));
  if (!p) return NextResponse.json({ error: "bad request" }, { status: 400 });
  let v = await resolve(p.lemma);
  let added = false;
  if (!v) {
    const id = slug(p.lemma);
    await db().insert(schema.vocab).values({ id, lemma: p.lemma, tier: "user_added", yield: 0.6, sources: ["user"], sourceCount: 0 }).onConflictDoNothing();
    v = { id, lemma: p.lemma, senses: null };
    added = true;
  }
  const [dup] = await db().select({ id: schema.itemEvents.id }).from(schema.itemEvents).where(sameTag(v.id, p.attemptId)).limit(1);
  if (!dup) {
    await db().insert(schema.itemEvents).values({ kind: "word", itemId: v.id, event: "dont_know", weight: WORD_W.dont_know, attemptId: p.attemptId });
  }
  return NextResponse.json({ ok: true, id: v.id, lemma: v.lemma, added, senses: v.senses });
}

/** Undo a "didn't know" tag made in this attempt (a mis-tap). */
export async function DELETE(req: Request) {
  const p = parse(await req.json().catch(() => null));
  if (!p) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const v = await resolve(p.lemma);
  if (!v) return NextResponse.json({ ok: true, removed: 0 });
  const gone = await db().delete(schema.itemEvents).where(sameTag(v.id, p.attemptId)).returning({ id: schema.itemEvents.id });
  return NextResponse.json({ ok: true, removed: gone.length });
}
