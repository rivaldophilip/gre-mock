// What the bank is short of for one user (docs/BANK.md, Stock target): unseen, unheld stock against the demand of
// the next two simulated mocks, a drill buffer, unit shapes, open shortfalls and revisit siblings not yet written.
// Pure over an assembly context, so bank:gaps and bank:brief rank the same gaps.
import { allocateConcepts, allocateVerbalKeys, rng } from "../../lib/priority/allocate";
import { markPending } from "../../lib/priority/compute";
import { DRILL_BATCH } from "../../lib/priority/config";
import { assembleMock } from "../../lib/assemble";
import { QUANT_AREAS, KEY_SLOTS } from "../../lib/assemble/plan";
import type { Cand, Ctx, Fallback } from "../../lib/assemble/types";

/** Mocks of stock to keep ahead per measure. */
export const MOCKS_AHEAD = 2;
/** The levels every concept and skill keeps unseen stock at. */
export const STOCK_LEVELS = [4, 5];
/** A batch is worth writing once the top gaps add up to this many items. */
export const DEFICIT_THRESHOLD = 10;

export type Gap = {
  kind: "concept" | "skill" | "words" | "type" | "unit" | "revisit" | "shortfall";
  id: string;
  level?: number;
  /** the slot types a dry-run or shortfall gap was short in, one per item it needs */
  types?: string[];
  need: number;
  have: number;
  deficit: number;
  /** how much a filled gap helps: the target's priority, or 1 for structural gaps */
  weight: number;
  why: string;
};

export type ShortfallRow = { id: number; slotType: string; wantedKind: string; wantedId: string | null; wantedLevel: number | null; step: number; resolvedAt: Date | null };

const fresh = (ctx: Ctx) => (c: Cand) => c.status === "active" && !ctx.seen.has(c.ref) && !ctx.held.has(c.ref);

/** The targets the next `n` mocks would draw (each run damps what the previous one took, as an untaken test does). */
export function simulatedTargets(ctx: Ctx, n = MOCKS_AHEAD, seed = 1) {
  const counts = new Map<string, number>();
  const words = new Map<string, number>();
  let concepts = ctx.conceptScores;
  let wordScores = ctx.wordScores;
  for (let i = 0; i < n; i++) {
    const random = rng(seed + i * 7919);
    const picks =
      ctx.measure === "quant"
        ? allocateConcepts(concepts.filter((s) => QUANT_AREAS.includes(s.area)), 27, QUANT_AREAS, random).map((p) => p.itemId)
        : [
            ...allocateConcepts(concepts.filter((s) => s.area === "reading"), 11, ["reading"], random).map((p) => p.itemId),
            ...allocateConcepts(concepts.filter((s) => s.area === "argument"), 2, ["argument"], random).map((p) => p.itemId),
          ];
    for (const p of picks) counts.set(p, (counts.get(p) ?? 0) + 1);
    const held = new Map(picks.map((p) => [p, [`sim-${i}`]]));
    concepts = markPending(concepts, held).map((s, j) => ({ ...s, area: concepts[j].area }));
    if (ctx.measure === "verbal") {
      const keys = allocateVerbalKeys(wordScores, ctx.isSecondary, KEY_SLOTS, random).map((k) => k.itemId);
      for (const k of keys) words.set(k, (words.get(k) ?? 0) + 1);
      wordScores = markPending(wordScores, new Map(keys.map((k) => [k, [`sim-${i}`]])));
    }
  }
  return { counts, words };
}

/**
 * The fallbacks the next `n` mocks would log, assembled for real against today's stock: each run holds what the one
 * before took and damps its targets, as an untaken mock does. This is the exact demand (slot type, target and level)
 * that simulatedTargets only estimates, so L3 slots and a second L4 of one concept show up before a quiz falls back.
 */
export function dryRunFallbacks(ctx: Ctx, n = MOCKS_AHEAD): Fallback[] {
  const out: Fallback[] = [];
  const byRef = new Map(ctx.items.map((c) => [c.ref, c]));
  let c = ctx;
  for (let i = 0; i < n; i++) {
    const a = assembleMock(c);
    out.push(...a.fallbacks, ...a.failures);
    const picked = a.layout.sections.flatMap((s) => s.items.map((x) => byRef.get(x.ref))).filter((x): x is Cand => !!x);
    const pending = (ids: string[]) => ids.reduce((m, id) => m.set(id, [...(m.get(id) ?? []), `dry-${i}`]), new Map<string, string[]>());
    c = {
      ...c,
      held: new Set([...c.held, ...picked.map((x) => x.ref)]),
      conceptScores: markPending(c.conceptScores, pending(picked.flatMap((x) => (x.primary ? [x.primary] : [])))) as Ctx["conceptScores"],
      wordScores: markPending(c.wordScores, pending(picked.flatMap((x) => x.keyWords))),
    };
  }
  return out;
}

/** The ranked gaps, largest weighted deficit first. */
export function bankGaps(ctx: Ctx, shortfalls: ShortfallRow[], revisitedRefs: Set<string>): Gap[] {
  const out: Gap[] = [];
  const isFresh = fresh(ctx);
  const stock = ctx.items.filter((c) => isFresh(c));
  const P = new Map(ctx.conceptScores.map((s) => [s.itemId, s.P]));
  const { counts, words } = simulatedTargets(ctx);
  const kind = ctx.measure === "quant" ? "concept" : "skill";

  // what the next mocks, assembled for real, would fall back on: one gap per target and level, as many items as slots
  const dry = new Map<string, Gap>();
  for (const f of dryRunFallbacks(ctx)) {
    const targeted = (f.wantedKind === "concept" || f.wantedKind === "skill") && f.wantedId;
    const id = targeted ? f.wantedId! : `${f.wantedKind}:${f.wantedId ?? f.slotType}`;
    const key = `${id}|${f.wantedLevel ?? ""}`;
    const g = dry.get(key);
    if (g) {
      g.need++;
      g.deficit++;
      g.types!.push(f.slotType);
      continue;
    }
    const w = targeted ? 2 + (P.get(id) ?? 0) : 2;
    dry.set(key, { kind: targeted ? kind : "shortfall", id, level: f.wantedLevel ?? undefined, types: [f.slotType], need: 1, have: 0, deficit: 1, weight: w, why: `the next ${MOCKS_AHEAD} mocks would fall back (dry run: ${f.slotType}, step ${f.step})` });
  }
  out.push(...dry.values());

  // concepts and skills: unseen L4 and L5 for every one; the simulated mocks' targets need as many items as they draw
  for (const s of ctx.conceptScores) {
    if (ctx.measure === "quant" && !QUANT_AREAS.includes(s.area)) continue;
    const mine = stock.filter((c) => c.primary === s.itemId);
    for (const level of STOCK_LEVELS) {
      const have = mine.filter((c) => c.difficulty === level).length;
      if (!have && !dry.has(`${s.itemId}|${level}`)) out.push({ kind, id: s.itemId, level, need: 1, have, deficit: 1, weight: P.get(s.itemId) ?? 0.5, why: `no unseen L${level} item` });
    }
    const want = counts.get(s.itemId) ?? 0;
    const have = mine.filter((c) => c.difficulty >= 3).length;
    if (want > have) out.push({ kind, id: s.itemId, need: want, have, deficit: want - have, weight: 1 + (P.get(s.itemId) ?? 0), why: `the next ${MOCKS_AHEAD} mocks would draw it ${want}×` });
  }

  // question types: each slot type MOCKS_AHEAD times over, TC / SE also a drill buffer (the drill shares the pool)
  const perType = new Map<string, number>();
  for (const sec of ctx.blueprint.sections) for (const s of sec.slots) if (!s.type.startsWith("rc") && s.type !== "arg" && s.type !== "di") perType.set(s.type, (perType.get(s.type) ?? 0) + 1);
  for (const [t, n] of perType) {
    const need = n * MOCKS_AHEAD + (t === "se" || t.startsWith("tc") ? Math.round((DRILL_BATCH * (t === "se" ? 0.4 : t === "tc3" ? 0.3 : t === "tc2" ? 0.2 : 0.1))) : 0);
    const have = stock.filter((c) => c.slotType === t && !c.unitId).length;
    if (have < need) out.push({ kind: "type", id: t, need, have, deficit: need - have, weight: 1.5, why: `${MOCKS_AHEAD} mocks${t === "se" || t.startsWith("tc") ? " and a drill batch" : ""} need ${need}` });
  }

  // units: whole sets unseen
  const freshUnit = (pred: (n: number, kind: string, paras: number) => boolean) =>
    ctx.units.filter((u) => u.status === "active" && pred(u.n, u.kind, u.paragraphs) && u.items.every(isFresh)).length;
  const unitNeeds: [string, number, (n: number, k: string, p: number) => boolean][] =
    ctx.measure === "quant"
      ? [["di3", MOCKS_AHEAD, (n, k) => k === "di" && n === 3]]
      : [
          ["rc4-long", MOCKS_AHEAD, (n, k) => k === "reading" && n >= 3],
          ["rc2", 3 * MOCKS_AHEAD, (n, k) => k === "reading" && n === 2],
          ["rc1", MOCKS_AHEAD, (n, k) => k === "reading" && n === 1],
          ["arg1", 2 * MOCKS_AHEAD, (n, k) => k === "argument"],
        ];
  for (const [shape, need, pred] of unitNeeds) {
    const have = freshUnit(pred);
    if (have < need) out.push({ kind: "unit", id: shape, need, have, deficit: need - have, weight: 2, why: `${MOCKS_AHEAD} mocks need ${need} unseen ${shape} sets` });
  }

  // verbal key words the simulated mocks aim at with no unseen item keyed with them
  if (ctx.measure === "verbal") {
    const keyed = new Set(stock.filter((c) => c.type === "tc" || c.type === "se").flatMap((c) => c.keyWords));
    const wP = new Map(ctx.wordScores.map((s) => [s.itemId, s.P]));
    for (const [w] of words) if (!keyed.has(w)) out.push({ kind: "words", id: w, need: 1, have: 0, deficit: 1, weight: wP.get(w) ?? 0.5, why: "a target word no unseen item keys" });
  }

  // open shortfalls a quiz logged, unless the stock now covers them or the dry run already asks for them; a concept or
  // skill one is a gap of that kind, so the brief writes it
  for (const f of shortfalls) {
    if (f.resolvedAt) continue;
    if (covered(ctx, stock, f)) continue;
    const targeted = (f.wantedKind === "concept" || f.wantedKind === "skill") && f.wantedId;
    if (targeted && dry.has(`${f.wantedId}|${f.wantedLevel ?? ""}`)) continue;
    const why = `a quiz ${f.step === 8 ? "could not be assembled" : `fell back (ladder step ${f.step})`}`;
    if (targeted) out.push({ kind, id: f.wantedId!, level: f.wantedLevel ?? undefined, types: [f.slotType], need: 1, have: 0, deficit: 1, weight: 2 + (P.get(f.wantedId!) ?? 0), why });
    else out.push({ kind: "shortfall", id: `${f.wantedKind}:${f.wantedId ?? f.slotType}`, level: f.wantedLevel ?? undefined, need: 1, have: 0, deficit: 1, weight: 2, why });
  }

  // revisit siblings: misses old enough to come back whose sibling is not written yet
  for (const r of ctx.revisits) {
    if (revisitedRefs.has(r.ref)) continue;
    out.push({ kind: "revisit", id: r.ref, need: 1, have: 0, deficit: 1, weight: 2.5, why: `you ${r.result} it; no sibling in the bank yet` });
  }

  return out.sort((a, b) => b.deficit * b.weight - a.deficit * a.weight);
}

/** A brief still being authored, as far as its slots go. */
export type PendingBrief = { slots?: { type?: string; level?: number; concept?: string; skill?: string; unit?: string; revisit?: { ref: string } }[] };

/**
 * The gaps left once briefs still being authored are written: their slots count as stock (a concept's or skill's level
 * gap closes, its draw count and each type's count rise) and their revisits as written, so a sibling brief picks the
 * next gaps instead of the same ones.
 */
export function afterPending(gaps: Gap[], briefs: PendingBrief[]): Gap[] {
  const slots = briefs.flatMap((b) => b.slots ?? []);
  const revisits = new Set(slots.flatMap((s) => (s.revisit ? [s.revisit.ref] : [])));
  const target = (s: (typeof slots)[number]) => s.concept ?? s.skill;
  return gaps
    .flatMap((g) => {
      if (g.kind === "revisit") return revisits.has(g.id) ? [] : [g];
      let more = 0;
      if (g.kind === "concept" || g.kind === "skill") more = slots.filter((s) => target(s) === g.id && (g.level ? s.level === g.level : (s.level ?? 0) >= 3)).length;
      else if (g.kind === "type") more = slots.filter((s) => s.type === g.id && !s.unit).length;
      if (!more) return [g];
      const have = g.have + more;
      return have >= g.need ? [] : [{ ...g, have, deficit: g.need - have }];
    })
    .sort((a, b) => b.deficit * b.weight - a.deficit * a.weight);
}

/** Whether unseen stock now fills what a shortfall wanted. */
export function covered(ctx: Ctx, stock: Cand[], f: ShortfallRow): boolean {
  const lvl = (c: Cand) => f.wantedLevel === null || c.difficulty === f.wantedLevel;
  if (f.wantedKind === "concept" || f.wantedKind === "skill") return stock.some((c) => c.primary === f.wantedId && lvl(c));
  if (f.wantedKind === "words") return stock.some((c) => (f.wantedId ? c.keyWords.includes(f.wantedId) : c.slotType === f.slotType) && lvl(c));
  if (f.wantedKind === "rule") return false;
  return stock.some((c) => c.slotType === f.slotType && lvl(c));
}

export type BatchKind = "quant" | "tcse" | "rc";

/** The batch that closes the most of the top gaps: quant for quant; TC / SE or reading for verbal, whichever is shorter. */
export function recommendBatch(measure: "verbal" | "quant", gaps: Gap[]): { kind: BatchKind; deficit: number } {
  const total = (pred: (g: Gap) => boolean) => gaps.filter(pred).reduce((t, g) => t + g.deficit * g.weight, 0);
  if (measure === "quant") return { kind: "quant", deficit: total(() => true) };
  const tcse = total((g) => g.kind === "words" || (g.kind === "type" && (g.id === "se" || g.id.startsWith("tc"))) || (g.kind === "revisit") || (g.kind === "shortfall" && g.id.startsWith("words")));
  const rc = total((g) => g.kind === "skill" || g.kind === "unit" || (g.kind === "shortfall" && g.id.startsWith("skill")));
  return tcse >= rc ? { kind: "tcse", deficit: tcse } : { kind: "rc", deficit: rc };
}
