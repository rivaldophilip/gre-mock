import "server-only";
// Tests as the app serves them, all from the question bank (docs/BANK.md): a source id (verbal-001, drill-003)
// loads that source as written, retired items included, so its old attempts still resume and review; `quiz-<id>`
// loads an assembled quiz from the user's own quizzes table.
import { eq } from "drizzle-orm";
import { schema, type DB } from "./db";
import { bankItems, bankMetas, bankParts } from "./bank";
import { quizIdOf, quizTest, sourceTest, type Layout } from "./virtual-test";
import type { Test } from "./types";

export async function loadTestById(db: DB, id: string): Promise<Test | null> {
  const quizId = quizIdOf(id);
  if (quizId !== null) {
    const [quiz] = await db.select().from(schema.quizzes).where(eq(schema.quizzes.id, quizId));
    if (!quiz) return null;
    const layout = quiz.layout as Layout;
    const refs = layout.sections.flatMap((s) => s.items.map((i) => i.ref));
    const items = await bankItems(refs);
    const metas = await bankMetas();
    const pRefs = refs.flatMap((r) => (metas.byRef.get(r)?.passageId ? [metas.byRef.get(r)!.passageId!] : []));
    const fRefs = refs.flatMap((r) => (metas.byRef.get(r)?.figureId ? [metas.byRef.get(r)!.figureId!] : []));
    const { passages, figures } = await bankParts(pRefs, fRefs);
    return quizTest({ id: quiz.id, measure: quiz.measure, title: quiz.title, layout }, items, passages, figures);
  }
  if (!/^[a-z]+-\d{3}$/.test(id)) return null;
  const metas = await bankMetas();
  const src = metas.sources.get(id);
  if (!src) return null;
  const refs = (metas.bySource.get(id) ?? []).filter((i) => i.status !== "gone").map((i) => i.ref);
  const items = await bankItems(refs);
  const pRefs = [...metas.passages.values()].filter((p) => p.sourceId === id).map((p) => p.ref);
  const fRefs = (metas.bySource.get(id) ?? []).flatMap((i) => (i.figureId ? [i.figureId] : []));
  const { passages, figures } = await bankParts(pRefs, fRefs);
  return sourceTest(src, [...items.values()], [...passages.values()], [...figures.values()]);
}

export type TestMeta = { id: string; measure: "verbal" | "quant"; title: string; total: number; kind: "mock" | "drill" | "batch" | "quiz"; quizKind?: "mock" | "custom"; minutes: number; sections: { n: 1 | 2; minutes: number }[] };

/**
 * Every test an attempt can name, without bodies: the synced sources and this user's quizzes. A custom quiz has no
 * score band and stays off the progress chart (quizKind "custom").
 */
export async function testMetas(db: DB): Promise<Map<string, TestMeta>> {
  const [metas, quizzes] = await Promise.all([bankMetas(), db.select().from(schema.quizzes)]);
  const out = new Map<string, TestMeta>();
  for (const s of metas.sources.values()) {
    const live = (metas.bySource.get(s.id) ?? []).filter((i) => i.status !== "gone");
    const minutes = (s.sections as { minutes: number }[]).reduce((t, x) => t + x.minutes, 0);
    out.set(s.id, { id: s.id, measure: s.measure as TestMeta["measure"], title: s.title, total: live.length, kind: s.kind as TestMeta["kind"], minutes, sections: s.sections as TestMeta["sections"] });
  }
  for (const q of quizzes) {
    const layout = q.layout as Layout;
    out.set(`quiz-${q.id}`, {
      id: `quiz-${q.id}`, measure: q.measure as TestMeta["measure"], title: q.title, kind: "quiz", quizKind: q.kind as "mock" | "custom",
      total: layout.sections.reduce((t, s) => t + s.items.length, 0), minutes: layout.sections.reduce((t, s) => t + s.minutes, 0),
      sections: layout.sections.map((s) => ({ n: s.n, minutes: s.minutes })),
    });
  }
  return out;
}
