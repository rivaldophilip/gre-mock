// The assembly context from plain rows (bank metadata and the user's own tables). Pure, so tests build one by hand;
// lib/quiz.ts fetches the rows.
import { markPending, scoreAll, type LoggedEvent } from "../priority/compute";
import { rng } from "../priority/allocate";
import { REVISIT_MIN_DAYS } from "../priority/revisit";
import { synonymMap } from "../priority/synonyms";
import { heldRefs, latestResults, type AttemptRow, type QuizRow } from "../holds";
import type { Blueprint } from "../blueprint-rules";
import type { SlotType } from "../qtypes";
import type { Cand, Ctx, Revisit, UnitCand } from "./types";

export type CtxRows = {
  measure: "verbal" | "quant";
  seed: number;
  now: Date;
  items: (Omit<Cand, "slotType"> & { slotType: string })[];
  units: { id: string; sourceId: string; measure: string; shape: string; n: number; status: string }[];
  passages: Map<string, { paragraphs: number; domain: string | null }>;
  responses: { id: number; attemptId: number; questionId: string; isCorrect: boolean; guessed: boolean; updatedAt: Date; finalized: boolean }[];
  attempts: (AttemptRow & { id: number })[];
  quizzes: QuizRow[];
  vocab: { id: string; lemma: string; yield: number; exposureOnly: boolean; isSecondary: boolean; pink: boolean; senses: unknown }[];
  concepts: { id: string; name: string; area: string; yield: number }[];
  events: (LoggedEvent & { kind: string })[];
  variants: Record<string, string[]>;
  blueprint: Blueprint;
  /** a draft being confirmed: its own items do not hold against it */
  except?: number;
};

const SKILL_AREAS = ["reading", "argument"];
const DAY = 86_400_000;

export function buildCtx(r: CtxRows): Ctx {
  const items = r.items.filter((i) => i.measure === r.measure).map((i) => ({ ...i, slotType: i.slotType as SlotType }));
  const bySource = new Map<string, string[]>();
  for (const i of r.items) (bySource.get(i.sourceId) ?? bySource.set(i.sourceId, []).get(i.sourceId)!).push(i.ref);
  const byUnit = new Map<string, Cand[]>();
  for (const i of items) if (i.unitId) (byUnit.get(i.unitId) ?? byUnit.set(i.unitId, []).get(i.unitId)!).push(i);
  const units: UnitCand[] = r.units
    .filter((u) => u.measure === r.measure && u.status !== "gone")
    .map((u) => ({
      id: u.id,
      sourceId: u.sourceId,
      kind: u.shape.startsWith("di") ? "di" : u.shape.startsWith("arg") ? "argument" : "reading",
      shape: u.shape,
      n: u.n,
      status: u.status,
      paragraphs: r.passages.get(u.id)?.paragraphs ?? 1,
      domain: r.passages.get(u.id)?.domain ?? null,
      items: (byUnit.get(u.id) ?? []).sort((a, b) => a.position - b.position),
    }));

  const seen = new Set(r.responses.map((x) => x.questionId));
  const held = heldRefs(r.quizzes, r.attempts, (sid) => bySource.get(sid) ?? [], r.except);
  const results = latestResults(r.responses.filter((x) => x.finalized));
  const byRef = new Map(items.map((i) => [i.ref, i]));

  // what held items already aim at is damped (and drawn last), as for a brief with untaken tests (docs/PRIORITY.md)
  const pending = new Map<string, string[]>();
  const hold = (id: string, by: string) => pending.set(id, [...(pending.get(id) ?? []), by]);
  for (const ref of held) {
    const c = byRef.get(ref);
    if (!c) continue;
    if (c.primary) hold(c.primary, ref.split(":")[0]);
    for (const k of c.keyWords) hold(k, ref.split(":")[0]);
  }
  const ev = (kind: string) => r.events.filter((e) => e.kind === kind);
  const conceptRows = r.concepts.filter((c) => (r.measure === "quant" ? !SKILL_AREAS.includes(c.area) : SKILL_AREAS.includes(c.area)));
  const areaOf = new Map(r.concepts.map((c) => [c.id, c.area]));
  const conceptScores = markPending(scoreAll(conceptRows.map((c) => ({ id: c.id, yield: c.yield })), ev("concept"), r.now), pending).map((s) => ({ ...s, area: areaOf.get(s.itemId)! }));
  const vocab = r.vocab.filter((v) => !v.pink);
  const wordScores = r.measure === "verbal" ? markPending(scoreAll(vocab.map((v) => ({ id: v.id, yield: v.yield, exposureOnly: v.exposureOnly })), ev("word"), r.now), pending).filter((s) => !s.dismissed && !s.exposureOnly) : [];
  const secondary = new Set(r.vocab.filter((v) => v.isSecondary).map((v) => v.id));
  const syn = r.measure === "verbal" ? synonymMap(r.vocab) : new Map<string, Set<string>>();
  const names = new Map(r.concepts.map((c) => [c.id, c.name]));

  const variantUse = new Map<string, Map<string, number>>();
  const seenGroups = new Set<string>();
  for (const ref of seen) {
    const c = byRef.get(ref);
    if (!c) continue;
    if (c.setupGroup) seenGroups.add(c.setupGroup);
    if (c.primary && c.variant) {
      const m = variantUse.get(c.primary) ?? new Map<string, number>();
      variantUse.set(c.primary, m.set(c.variant, (m.get(c.variant) ?? 0) + 1));
    }
  }

  // revisits: the latest finished answer (a drill answer counts when it is locked) was wrong or guessed, it is old
  // enough, and no sibling of it has been shown yet
  const doneAt = new Map(r.attempts.filter((a) => a.finishedAt && a.mode !== "replay").map((a) => [a.id, a.finishedAt!]));
  const drillRuns = new Set(r.attempts.filter((a) => a.mode === "drill").map((a) => a.id));
  const latest = new Map<string, { ok: boolean; guessed: boolean; at: Date }>();
  for (const x of r.responses) {
    if (!x.finalized) continue;
    const at = doneAt.get(x.attemptId) ?? (drillRuns.has(x.attemptId) ? x.updatedAt : null);
    if (!at) continue;
    const was = latest.get(x.questionId);
    if (!was || was.at < at) latest.set(x.questionId, { ok: x.isCorrect, guessed: x.guessed, at });
  }
  const shownSibling = new Set(items.filter((c) => c.revisits && seen.has(c.ref)).map((c) => c.revisits!));
  const revisits: Revisit[] = [...latest]
    .filter(([ref, a]) => byRef.has(ref) && (!a.ok || a.guessed) && !shownSibling.has(ref) && (r.now.getTime() - a.at.getTime()) / DAY >= REVISIT_MIN_DAYS)
    .map(([ref, a]) => ({ ref, at: a.at.getTime(), result: a.ok ? ("guessed" as const) : ("missed" as const) }))
    .sort((a, b) => a.at - b.at);

  return {
    measure: r.measure,
    items,
    units,
    seen,
    held,
    results,
    conceptScores,
    wordScores,
    isSecondary: (id) => secondary.has(id),
    synonyms: (id) => syn.get(id) ?? [],
    conceptName: (id) => names.get(id) ?? id,
    variants: r.variants,
    variantUse,
    seenGroups,
    revisits,
    blueprint: r.blueprint,
    random: rng(r.seed),
  };
}
