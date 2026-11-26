import "server-only";
// Quizzes assembled from the bank (docs/BANK.md): create (ready, or a draft when anything fell back), confirm a draft
// (after re-checking nothing in it was seen or held since), cancel, and close once its attempt ends. The bank is read
// only; the quiz row and its shortfall rows are written together.
import { eq, inArray, sql } from "drizzle-orm";
import { schema, type DB } from "./db";
import { bankMetas } from "./bank";
import { assemble, type Assembly } from "./assemble";
import { buildCtx } from "./assemble/context";
import { contextRows } from "./assemble/rows";
import type { Fallback, QuizSpec } from "./assemble/types";
import { heldRefs } from "./holds";
import { quizIdOf, type Layout } from "./virtual-test";

const { quizzes, shortfalls, responses, attempts } = schema;

const MEASURE = { verbal: "Verbal", quant: "Quant" } as const;

/** "Quant mock 24" (numbered on from the authored mocks), or "Custom quant quiz · 10 questions". */
async function titleFor(db: DB, spec: QuizSpec, total: number) {
  if (spec.kind === "custom") return `Custom ${spec.measure} quiz · ${total} questions`;
  const metas = await bankMetas();
  const authored = [...metas.sources.values()].filter((s) => s.kind === "mock" && s.measure === spec.measure).length;
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(quizzes).where(sql`${quizzes.measure} = ${spec.measure} and ${quizzes.kind} = 'mock' and ${quizzes.status} <> 'cancelled'`);
  return `${MEASURE[spec.measure]} mock ${authored + n + 1}`;
}

type ShortfallRow = typeof shortfalls.$inferInsert;
const shortfallRows = (quizId: number, measure: string, fs: Fallback[]): ShortfallRow[] =>
  fs.map((f) => ({ quizId, slotId: f.slotId, measure, slotType: f.slotType, wantedKind: f.wantedKind, wantedId: f.wantedId, wantedLevel: f.wantedLevel, step: f.step, gotRef: f.refs[0] ?? null }));

/** Run inserts as one request where the driver can (Neon's batch), one by one on a local Postgres. */
async function writeTogether(db: DB, writes: (() => unknown)[]) {
  const batch = (db as unknown as { batch?: (q: unknown[]) => Promise<unknown> }).batch;
  if (typeof batch === "function") await batch.call(db, writes.map((w) => w()));
  else for (const w of writes) await w();
}

/** What the quiz holds, without any item content: counts per type, level and target. */
export type Preview = { total: number; minutes: number; byType: Record<string, number>; byLevel: Record<string, number>; byTarget: Record<string, number> };

export type CreateResult =
  | { ok: true; id: number; testId: string; title: string; status: "ready" | "draft"; fallbacks: Fallback[]; preview: Preview }
  | { ok: false; failures: Fallback[] };

/** Assemble and save a quiz: `ready` when every slot was filled exactly, otherwise a `draft` waiting for Proceed. */
export async function createQuiz(db: DB, spec: QuizSpec): Promise<CreateResult> {
  const seed = Math.floor(Math.random() * 1e9);
  const metas = await bankMetas();
  const rows = await contextRows(db, metas, spec.measure, seed);
  const ctx = buildCtx(rows);
  const out: Assembly = assemble(ctx, spec);
  const [{ id }] = await db.execute(sql`select nextval(pg_get_serial_sequence('quizzes', 'id'))::int as id`).then((r) => (r as unknown as { rows: { id: number }[] }).rows);
  if (out.failures.length) {
    // nothing is saved but what was missing, so bank:gaps sees it (quiz id 0: no quiz came of it)
    await db.insert(shortfalls).values(shortfallRows(0, spec.measure, [...out.failures, ...out.fallbacks]));
    return { ok: false, failures: out.failures };
  }
  const total = out.layout.sections.reduce((t, s) => t + s.items.length, 0);
  const status = out.fallbacks.length ? "draft" : "ready";
  const title = await titleFor(db, spec, total);
  const row = { id, measure: spec.measure, kind: spec.kind, title, spec, seed, bankVersion: metas.version, layout: out.layout, fallbacks: out.fallbacks, status };
  await writeTogether(db, [() => db.insert(quizzes).values(row), ...(out.fallbacks.length ? [() => db.insert(shortfalls).values(shortfallRows(id, spec.measure, out.fallbacks))] : [])]);
  const preview: Preview = { total, minutes: out.layout.sections.reduce((t, s) => t + s.minutes, 0), byType: {}, byLevel: {}, byTarget: {} };
  const bump = (m: Record<string, number>, k: string) => (m[k] = (m[k] ?? 0) + 1);
  for (const s of out.layout.sections)
    for (const i of s.items) {
      bump(preview.byType, i.slotType);
      bump(preview.byLevel, String(i.level));
      // a unit's target is its set's (a skill list); show the item's own primary instead
      const primary = metas.byRef.get(i.ref)?.primary;
      bump(preview.byTarget, primary ? ctx.conceptName(primary) : spec.measure === "verbal" ? "vocabulary" : "other");
    }
  return { ok: true, id, testId: `quiz-${id}`, title, status, fallbacks: out.fallbacks, preview };
}

/**
 * Proceed with a draft: it becomes ready unless, since it was assembled, an item in it was shown elsewhere (and the
 * draft did not already reuse it) or another quiz or mock now holds it. Returns false when it went stale.
 */
export async function confirmQuiz(db: DB, id: number): Promise<{ ok: boolean; status: string }> {
  const [q] = await db.select().from(quizzes).where(eq(quizzes.id, id));
  if (!q) return { ok: false, status: "missing" };
  if (q.status !== "draft") return { ok: q.status === "ready", status: q.status };
  const layout = q.layout as Layout;
  const refs = layout.sections.flatMap((s) => s.items);
  const [metas, seenRows, att, qz] = await Promise.all([
    bankMetas(),
    db.selectDistinct({ q: responses.questionId }).from(responses).where(inArray(responses.questionId, refs.map((i) => i.ref))),
    db.select({ testId: attempts.testId, mode: attempts.mode, finishedAt: attempts.finishedAt, abandonedAt: attempts.abandonedAt }).from(attempts),
    db.select({ id: quizzes.id, status: quizzes.status, layout: quizzes.layout }).from(quizzes),
  ]);
  const seen = new Set(seenRows.map((r) => r.q));
  const held = heldRefs(qz, att, (sid) => (metas.bySource.get(sid) ?? []).map((i) => i.ref), id);
  const stale = refs.some((i) => (seen.has(i.ref) && !i.reused) || held.has(i.ref) || metas.byRef.get(i.ref)?.status !== "active");
  if (stale) {
    await db.update(quizzes).set({ status: "cancelled", updatedAt: new Date() }).where(eq(quizzes.id, id));
    return { ok: false, status: "stale" };
  }
  await db.update(quizzes).set({ status: "ready", updatedAt: new Date() }).where(eq(quizzes.id, id));
  return { ok: true, status: "ready" };
}

/** Cancel a draft or discard a ready quiz: its items are no longer held. A started quiz is abandoned through its attempt. */
export async function cancelQuiz(db: DB, id: number): Promise<boolean> {
  const [q] = await db.select({ status: quizzes.status }).from(quizzes).where(eq(quizzes.id, id));
  if (!q || (q.status !== "draft" && q.status !== "ready")) return false;
  await db.update(quizzes).set({ status: "cancelled", updatedAt: new Date() }).where(eq(quizzes.id, id));
  return true;
}

/** The attempt at a quiz ended: finished (done) or abandoned. A no-op for a source's attempt. */
export async function closeQuiz(db: DB, testId: string, status: "done" | "abandoned") {
  const id = quizIdOf(testId);
  if (id === null) return;
  await db.update(quizzes).set({ status, updatedAt: new Date() }).where(eq(quizzes.id, id));
}
