// The fallback ladder (docs/BANK.md): how one slot is filled when the bank has no exact match. Each step widens what
// may fill the slot; within a step the best-scoring candidate wins. Step 1 is the only exact one: any later step is a
// fallback, shown for confirmation and logged as a shortfall.
//   1 unseen, the slot's target, a level still open for its type
//   2 unseen, the slot's target, a level within one of an open one
//   3 unseen, a substitute target (the highest-priority concept or skill with stock), level open or within one
//   4 reuse an item missed or guessed before: the slot's target, a level still open
//   5 reuse a missed item: the slot's target, any level
//   6 reuse a missed item of a substitute target
//   7 any unseen item of the slot's type, any level
//   8 nothing: assembly fails and says what is missing
// A unit slot (passage, argument, DI set) is judged whole: 1 unseen, within a custom quiz's level range, with a target
// skill or concept; 2 the same outside the range; 3 unseen in range, any target; 4-6 a unit whose every item was seen
// and one of them missed; 7 any unseen unit. A mock sets no range, so its steps 1 and 2 are one.
import { scoreItem, scoreUnit, pairKey, scorer, type FillState, type Scorer } from "./score";
import type { Cand, Ctx, Fallback, Picked, Slot, UnitCand } from "./types";
import { MULTI_PARA_MAX } from "../blueprint-rules";

export const STEP_NOTE: Record<number, string> = {
  2: "nearby difficulty",
  3: "related topic",
  4: "you missed it",
  5: "you missed it, other difficulty",
  6: "you missed it, other topic",
  7: "any topic",
};

/** The level pool a slot type draws from: reading questions share one, as do a DI set's. */
export const poolOf = (slotType: string) => (slotType === "rc" || slotType === "rc_multi" || slotType === "rc_select" ? "rc" : slotType);
export const poolKey = (section: number, slotType: string) => `${section}|${poolOf(slotType)}`;

/** Take the nearest open level (the higher on a tie) out of a pool. */
export function consumeLevel(pool: number[] | undefined, level: number) {
  if (!pool?.length) return;
  let best = 0;
  for (let i = 1; i < pool.length; i++) {
    const d = Math.abs(pool[i] - level) - Math.abs(pool[best] - level);
    if (d < 0 || (d === 0 && pool[i] > pool[best])) best = i;
  }
  pool.splice(best, 1);
}

const fresh = (ctx: Ctx, c: Cand) => !ctx.seen.has(c.ref) && !ctx.held.has(c.ref);
const reusable = (ctx: Ctx, c: Cand) => ctx.seen.has(c.ref) && !ctx.held.has(c.ref) && !!ctx.results.get(c.ref)?.missed;
const onTarget = (slot: Slot, c: Cand) => {
  const t = slot.target;
  if (t.kind === "concept" || t.kind === "skill") return !!c.primary && t.ids.includes(c.primary);
  if (t.kind === "words") return c.keyWords.some((k) => t.ids.includes(k));
  return true;
};

/** May this item go in the quiz at all: not used, and (verbal) no key word or SE pair twice, (quant) no setup group twice. */
function allowed(c: Cand, st: FillState): boolean {
  if (st.used.has(c.ref) || c.status !== "active") return false;
  if (c.keyWords.some((k) => st.usedKeys.has(k))) return false;
  if (c.type === "se" && st.usedPairs.has(pairKey(c.keyWords))) return false;
  if (c.setupGroup && st.groups.has(c.setupGroup)) return false;
  return true;
}

function itemStep(step: number, c: Cand, slot: Slot, ctx: Ctx, pool: number[]): boolean {
  // a custom quiz asks for a range: any level inside it is exact
  const exact = pool.includes(c.difficulty) || (!!slot.levelRange && c.difficulty >= slot.levelRange[0] && c.difficulty <= slot.levelRange[1]);
  const near = exact || pool.some((x) => Math.abs(x - c.difficulty) <= 1) || !pool.length;
  switch (step) {
    case 1: return fresh(ctx, c) && onTarget(slot, c) && (exact || !pool.length);
    case 2: return fresh(ctx, c) && onTarget(slot, c) && near;
    case 3: return fresh(ctx, c) && near;
    case 4: return reusable(ctx, c) && onTarget(slot, c) && (exact || !pool.length);
    case 5: return reusable(ctx, c) && onTarget(slot, c);
    case 6: return reusable(ctx, c);
    case 7: return fresh(ctx, c);
    default: return false;
  }
}

function unitStep(step: number, u: UnitCand, slot: Slot, ctx: Ctx): boolean {
  const live = u.items.every((c) => c.status === "active" && !ctx.held.has(c.ref));
  if (!live) return false;
  const inRange = !slot.levelRange || u.items.every((c) => c.difficulty >= slot.levelRange![0] && c.difficulty <= slot.levelRange![1]);
  const allFresh = u.items.every((c) => !ctx.seen.has(c.ref));
  const hit = u.items.some((c) => onTarget(slot, c));
  const reuse = u.items.every((c) => ctx.seen.has(c.ref)) && u.items.some((c) => ctx.results.get(c.ref)?.missed);
  switch (step) {
    case 1: return allFresh && inRange && hit;
    case 2: return allFresh && hit; // a custom quiz's level range left
    case 3: return allFresh && inRange;
    case 4: case 5: return reuse && hit;
    case 6: return reuse;
    case 7: return allFresh;
    default: return false;
  }
}

export type Pools = Map<string, number[]>;

function unitFits(u: UnitCand, slot: Slot, st: FillState): boolean {
  if (st.usedUnits.has(u.id) || u.n !== slot.size) return false;
  const kind = slot.slotType === "di" ? "di" : slot.slotType === "arg" ? "argument" : "reading";
  if (u.kind !== kind) return false;
  if (kind === "reading" && u.paragraphs > 1 && st.multiPara >= MULTI_PARA_MAX) return false;
  return u.items.every((c) => allowed(c, st));
}

/** Mark a pick as taken. */
export function take(p: Picked, st: FillState, units?: Map<string, UnitCand>) {
  for (const c of p.cands) {
    st.used.add(c.ref);
    for (const k of c.keyWords) st.usedKeys.add(k);
    if (c.type === "se") st.usedPairs.add(pairKey(c.keyWords));
    if (c.setupGroup) st.groups.add(c.setupGroup);
    if (c.primary) st.primaries.set(c.primary, (st.primaries.get(c.primary) ?? 0) + 1);
    if (c.variant) st.variants.set(`${c.primary}|${c.variant}`, (st.variants.get(`${c.primary}|${c.variant}`) ?? 0) + 1);
    consumeLevel(st.pools.get(poolKey(p.slot.section, p.slot.kind === "unit" ? p.slot.slotType : c.slotType)), c.difficulty);
  }
  if (p.unitId) {
    st.usedUnits.add(p.unitId);
    const u = units?.get(p.unitId);
    if (u?.kind === "reading" && u.paragraphs > 1) st.multiPara++;
    if (u?.domain) (st.domains.get(p.slot.section) ?? st.domains.set(p.slot.section, new Set()).get(p.slot.section)!).add(u.domain);
  }
}

/** How many items could fill an item slot exactly (step 1) right now: the fewest go first, so the scarce ones are not taken by slots that had choice. */
export function exactCount(slot: Slot, ctx: Ctx, st: FillState): number {
  if (slot.kind === "unit") return 0;
  const pool = st.pools.get(poolKey(slot.section, slot.slotType)) ?? [];
  return ctx.items.filter((c) => c.slotType === slot.slotType && !c.unitId && allowed(c, st) && itemStep(1, c, slot, ctx, pool)).length;
}

/** The best candidate for a slot at the first ladder step that has one, or null (step 8). */
export function fillSlot(slot: Slot, ctx: Ctx, st: FillState, sc: Scorer = scorer(ctx), steps = [1, 2, 3, 4, 5, 6, 7]): Picked | null {
  const pool = st.pools.get(poolKey(slot.section, slot.slotType)) ?? [];
  if (slot.forced) {
    const c = ctx.items.find((x) => x.ref === slot.forced);
    if (c && allowed(c, st)) return { slot, cands: [c], step: 1, reused: [false] };
  }
  if (slot.kind === "unit") {
    for (const step of steps) {
      const ok = ctx.units.filter((u) => unitFits(u, slot, st) && unitStep(step, u, slot, ctx));
      if (!ok.length) continue;
      const best = argmax(ok, (u) => scoreUnit(u, slot, ctx, st, sc, pool) + 0.01 * ctx.random());
      return { slot, cands: best.items, step, unitId: best.id, reused: best.items.map((c) => ctx.seen.has(c.ref)) };
    }
    return null;
  }
  const typed = ctx.items.filter((c) => c.slotType === slot.slotType && !c.unitId && allowed(c, st));
  for (const step of steps) {
    const ok = typed.filter((c) => itemStep(step, c, slot, ctx, pool));
    if (!ok.length) continue;
    const best = argmax(ok, (c) => scoreItem(c, slot, ctx, st, sc, pool) + 0.01 * ctx.random());
    return { slot, cands: [best], step, reused: [ctx.seen.has(best.ref)] };
  }
  return null;
}

function argmax<T>(xs: T[], f: (x: T) => number): T {
  let best = xs[0];
  let bs = f(best);
  for (const x of xs.slice(1)) {
    const s = f(x);
    if (s > bs) [best, bs] = [x, s];
  }
  return best;
}

/** What a slot wanted, in words: "circles L5", "a 2-question reading passage", "TC words". */
function wantedText(slot: Slot, level: number | null, ctx: Ctx): string {
  const t = slot.target;
  const what = t.kind === "concept" || t.kind === "skill" ? (t.ids.length === 1 ? ctx.conceptName(t.ids[0]) : t.label) : t.label;
  if (slot.kind === "unit") return `${what} (${slot.size}-question ${slot.slotType === "di" ? "data set" : slot.slotType === "arg" ? "argument" : "passage"})`;
  return `${what}${level ? ` L${level}` : ""}`;
}

/** The fallback a pick at step 2-7 records, or null at step 1. */
export function fallbackOf(p: Picked, ctx: Ctx, wantedLevel: number | null, gotText: (c: Cand) => string): Fallback | null {
  if (p.step === 1) return null;
  const t = p.slot.target;
  const got = p.cands.length > 1 ? `${gotText(p.cands[0])} and ${p.cands.length - 1} more` : gotText(p.cands[0]);
  return {
    slotId: p.slot.id,
    slotType: p.slot.slotType,
    wantedKind: t.kind,
    wantedId: t.ids.length === 1 ? t.ids[0] : null,
    wantedLevel,
    step: p.step,
    refs: p.cands.map((c) => c.ref),
    note: `wanted ${wantedText(p.slot, wantedLevel, ctx)} → got ${got} (${STEP_NOTE[p.step]})`,
  };
}

/** The failure line for a slot nothing could fill. */
export function failureOf(slot: Slot, ctx: Ctx, wantedLevel: number | null): Fallback {
  const t = slot.target;
  return {
    slotId: slot.id,
    slotType: slot.slotType,
    wantedKind: t.kind,
    wantedId: t.ids.length === 1 ? t.ids[0] : null,
    wantedLevel,
    step: 8,
    refs: [],
    note: `no ${slot.kind === "unit" ? "" : `${slot.slotType} `}item left for ${wantedText(slot, wantedLevel, ctx)}, not even one to reuse`,
  };
}

export type { Scorer };
