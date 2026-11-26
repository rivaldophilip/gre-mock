// How good a candidate is for a slot, once the ladder step has decided it may fill it (docs/BANK.md, Assembly).
import type { Cand, Ctx, Slot, UnitCand } from "./types";

/** What the quiz holds so far: no item, key word, SE pair or setup group twice. */
export type FillState = {
  used: Set<string>;
  usedUnits: Set<string>;
  usedKeys: Set<string>;
  usedPairs: Set<string>;
  groups: Set<string>;
  primaries: Map<string, number>;
  variants: Map<string, number>;
  /** levels still open, per `${section}|${pool}` */
  pools: Map<string, number[]>;
  multiPara: number;
  domains: Map<number, Set<string>>;
  /** SE key pairs the allocator would like keyed (pairSeKeys) */
  wantedPairs: Set<string>;
};

export const pairKey = (ws: string[]) => [...ws].sort().join("|");

export function newState(): FillState {
  return { used: new Set(), usedUnits: new Set(), usedKeys: new Set(), usedPairs: new Set(), groups: new Set(), primaries: new Map(), variants: new Map(), pools: new Map(), multiPara: 0, domains: new Map(), wantedPairs: new Set() };
}

export type Scorer = {
  conceptP: (id: string | null) => number;
  wordP: (id: string) => number;
  untestedWord: (id: string) => boolean;
};

export function scorer(ctx: Ctx): Scorer {
  const cP = new Map(ctx.conceptScores.map((s) => [s.itemId, s.P]));
  const wP = new Map(ctx.wordScores.map((s) => [s.itemId, s.P]));
  const untested = new Set(ctx.wordScores.filter((s) => s.C === 0).map((s) => s.itemId));
  return { conceptP: (id) => (id ? (cP.get(id) ?? 0) : 0), wordP: (id) => wP.get(id) ?? 0, untestedWord: (id) => untested.has(id) };
}

const poolMean = (xs: number[] | undefined) => (xs?.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 4);

/** A single item for an item slot. Higher is better. */
export function scoreItem(c: Cand, slot: Slot, ctx: Ctx, st: FillState, sc: Scorer, pool: number[] | undefined): number {
  let s = 0;
  if (pool?.includes(c.difficulty)) s += 0.3;
  // the level the plan gave this slot, so it does not take a level another slot of its type needs
  if (slot.level !== undefined && c.difficulty === slot.level) s += 1.5;
  if (ctx.measure === "quant") {
    s += sc.conceptP(c.primary);
    if (slot.target.kind === "concept" && slot.target.ids.includes(c.primary ?? "")) s += 2;
    // spread concepts and forms: a substitute that repeats a concept already in the quiz ranks below one that does not
    s -= 1 * (st.primaries.get(c.primary ?? "") ?? 0);
    if (c.variant) {
      if (slot.variant && c.variant === slot.variant) s += 0.5;
      s -= 0.2 * ((ctx.variantUse.get(c.primary ?? "")?.get(c.variant) ?? 0) + (st.variants.get(`${c.primary}|${c.variant}`) ?? 0));
    }
    if (c.setupGroup && ctx.seenGroups.has(c.setupGroup)) s -= 2;
  } else {
    // TC / SE: the priority of its key words (aimed ones count double), plus untested distractors shown
    const aimed = new Set(slot.target.kind === "words" ? slot.target.ids : []);
    for (const k of c.keyWords) s += sc.wordP(k) * (aimed.has(k) ? 2 : 1);
    s += 0.1 * c.tags.filter((t) => t.kind === "word" && t.role === "distractor" && sc.untestedWord(t.id)).length;
    if (c.type === "se" && st.wantedPairs.has(pairKey(c.keyWords))) s += 1;
  }
  return s;
}

/** A unit (passage or DI set) for a unit slot. */
export function scoreUnit(u: UnitCand, slot: Slot, ctx: Ctx, st: FillState, sc: Scorer, pool: number[] | undefined): number {
  const aimed = new Set(slot.target.kind === "skill" || slot.target.kind === "concept" ? slot.target.ids : []);
  let s = 0;
  for (const p of new Set(u.items.map((c) => c.primary))) s += sc.conceptP(p) * (p && aimed.has(p) ? 1.5 : 0.5);
  // unseen words woven into the passage
  const passageWords = new Set(u.items.flatMap((c) => c.tags.filter((t) => t.kind === "word" && t.role === "passage").map((t) => t.id)));
  s += 0.05 * [...passageWords].filter(sc.untestedWord).length;
  const mean = u.items.reduce((a, c) => a + c.difficulty, 0) / u.items.length;
  s -= 0.3 * Math.abs(mean - poolMean(pool));
  if (u.domain && !st.domains.get(slot.section)?.has(u.domain)) s += 0.3;
  if (ctx.measure === "quant") for (const c of u.items) if (c.setupGroup && ctx.seenGroups.has(c.setupGroup)) s -= 1;
  return s;
}
