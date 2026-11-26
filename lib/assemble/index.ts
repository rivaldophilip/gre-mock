// Assemble a quiz from the bank (docs/BANK.md, Assembly). Pure: lib/quiz.ts builds the context and stores the result.
//   mock: the blueprint's slots aimed by the allocators, filled slot by slot down the fallback ladder, repaired until
//         the blueprint rules pass, then ordered (TC / QC block first, sets kept together).
//   custom: one section of the chosen types, targets and levels; no blueprint rules.
import { exactCount, failureOf, fallbackOf, fillSlot, poolKey, poolOf, take } from "./ladder";
import { scorer } from "./score";
import { matchTargets, mockPlan, placeRevisits, readingSplits } from "./plan";
import { customPlan } from "./custom";
import { orderSection, repair, violation } from "./rules";
import { newState, type FillState } from "./score";
import type { Cand, Ctx, Fallback, Picked, QuizSpec, Slot, Target, UnitCand } from "./types";
import type { Layout, LayoutItem } from "../virtual-test";
import { REVISIT_MAX } from "../priority/revisit";

export type Assembly = { layout: Layout; fallbacks: Fallback[]; failures: Fallback[] };

const clonePools = (p: Map<string, number[]>) => new Map([...p].map(([k, v]) => [k, [...v]]));
const nearest = (pool: number[] | undefined, level: number) => (pool?.length ? pool.reduce((b, x) => (Math.abs(x - level) < Math.abs(b - level) ? x : b)) : null);
const gotText = (ctx: Ctx) => (c: Cand) => {
  const what = ctx.measure === "quant" || c.unitId ? (c.primary ? ctx.conceptName(c.primary) : c.slotType) : c.keyWords.join(" / ") || c.slotType;
  return `${what} L${c.difficulty}${ctx.seen.has(c.ref) ? `, ${c.ref.replace(":", " ")}` : ""}`;
};

type Run = { picks: Picked[]; wanted: Map<string, number | null>; failures: Fallback[] };

/** Fill one slot down the ladder and record it. */
function fill(slot: Slot, ctx: Ctx, st: FillState, run: Run, units: Map<string, UnitCand>, sc = scorer(ctx)) {
  const pool = st.pools.get(poolKey(slot.section, slot.slotType));
  const p = fillSlot(slot, ctx, st, sc);
  if (!p) {
    run.failures.push(failureOf(slot, ctx, slot.kind === "item" ? (pool?.[0] ?? null) : null));
    return null;
  }
  run.wanted.set(slot.id, slot.kind === "item" ? nearest(pool, p.cands[0].difficulty) : null);
  take(p, st, units);
  run.picks.push(p);
  return p;
}

/**
 * A section's reading passages: the blueprint's split first, then the nearest other splits of the same question
 * total, taking the first split the bank can fill with unseen passages; if none can, the blueprint's split down the
 * whole ladder. A split other than the blueprint's is no fallback: older passages come in other sizes.
 */
function fillReading(section: 1 | 2, total: number, preferred: number[], target: Target, ctx: Ctx, st: FillState, run: Run, units: Map<string, UnitCand>, levelRange?: [number, number]) {
  const sc = scorer(ctx);
  const slotsFor = (split: number[]) => split.map((n, i): Slot => ({ id: `s${section}-rc${i + 1}`, section, kind: "unit", slotType: "rc", size: n, target, ...(levelRange ? { levelRange } : {}) }));
  for (const split of readingSplits(total, preferred).slice(0, 30)) {
    const trial: FillState = { ...st, used: new Set(st.used), usedUnits: new Set(st.usedUnits), usedKeys: new Set(st.usedKeys), usedPairs: new Set(st.usedPairs), groups: new Set(st.groups), primaries: new Map(st.primaries), variants: new Map(st.variants), pools: clonePools(st.pools), domains: new Map([...st.domains].map(([k, v]) => [k, new Set(v)])) };
    const got: Picked[] = [];
    for (const slot of slotsFor(split)) {
      const p = fillSlot(slot, ctx, trial, sc, [1, 3]);
      if (!p) break;
      take(p, trial, units);
      got.push(p);
    }
    if (got.length === split.length) {
      for (const p of got) {
        take(p, st, units);
        run.picks.push(p);
        run.wanted.set(p.slot.id, null);
      }
      return;
    }
  }
  for (const slot of slotsFor(preferred)) fill(slot, ctx, st, run, units, sc);
}

/**
 * Whether a single item missed its level is a property of the final layout, not of the order slots were filled in: per
 * section and type, the levels the items have are matched against the levels the plan asked for, and only items left
 * over count as "nearby difficulty" (step 2). Items filled at step 3 or later keep their step.
 */
function settleLevels(picks: Picked[], pools: Map<string, number[]>, run: Run): Picked[] {
  const left = new Map([...pools].map(([k, v]) => [k, [...v]]));
  const out = picks.map((p) => ({ ...p }));
  const exact: Picked[] = [];
  for (const p of out) {
    if (p.slot.kind !== "item" || p.step > 2) continue;
    const pool = left.get(poolKey(p.slot.section, poolOf(p.slot.slotType)));
    const i = pool ? pool.indexOf(p.cands[0].difficulty) : -1;
    if (i >= 0 || !pool) {
      pool?.splice(i, 1);
      p.step = 1;
      run.wanted.set(p.slot.id, p.cands[0].difficulty);
      exact.push(p);
    }
  }
  for (const p of out) {
    if (p.slot.kind !== "item" || p.step > 2 || exact.includes(p)) continue;
    const pool = left.get(poolKey(p.slot.section, poolOf(p.slot.slotType)))!;
    const want = pool.length ? pool.reduce((b, x) => (Math.abs(x - p.cands[0].difficulty) < Math.abs(b - p.cands[0].difficulty) ? x : b)) : null;
    if (want !== null) pool.splice(pool.indexOf(want), 1);
    p.step = 2;
    run.wanted.set(p.slot.id, want);
  }
  return out;
}

function finish(ctx: Ctx, run: Run, sections: { n: 1 | 2; minutes: number }[], rules: boolean, pools: Map<string, number[]>): Assembly {
  // a custom quiz has a level range, not a level mix: its steps stand as filled
  const picks = rules ? settleLevels(repair(run.picks, ctx, scorer(ctx)), pools, run) : run.picks;
  const fallbacks: Fallback[] = [];
  for (const p of picks) {
    const f = fallbackOf(p, ctx, run.wanted.get(p.slot.id) ?? null, gotText(ctx));
    if (f) fallbacks.push(f);
  }
  if (rules) {
    const v = violation(picks, ctx.measure);
    if (v.failing.length)
      fallbacks.push({ slotId: "rules", slotType: "all", wantedKind: "rule", wantedId: null, wantedLevel: 5, step: 2, refs: [], note: `the bank lacks the hard items a mock needs: ${v.failing.join(", ")} (nearby difficulty)` });
  }
  const layout: Layout = {
    sections: sections.map((s) => ({
      n: s.n,
      minutes: s.minutes,
      items: orderSection(picks.filter((p) => p.slot.section === s.n), ctx.measure, ctx.random).map((c): LayoutItem => {
        const p = picks.find((x) => x.cands.includes(c))!;
        const t = p.slot.target;
        return {
          ref: c.ref,
          slotId: p.slot.id,
          slotType: c.slotType,
          level: c.difficulty,
          ...(t.kind !== "any" ? { target: t.ids.length === 1 ? t.ids[0] : t.label } : {}),
          ...(p.unitId ? { unitId: p.unitId } : {}),
          ...(ctx.seen.has(c.ref) ? { reused: true } : {}),
          ...(p.slot.revisitOf ? { revisitOf: p.slot.revisitOf } : {}),
        };
      }),
    })),
  };
  return { layout, fallbacks, failures: run.failures };
}

/** A full mock, as data/blueprints.json lays it out. */
export function assembleMock(ctx: Ctx): Assembly {
  const plan = mockPlan(ctx);
  const st = newState();
  st.pools = clonePools(plan.pools);
  st.wantedPairs = plan.wantedPairs;
  const units = new Map(ctx.units.map((u) => [u.id, u]));
  const run: Run = { picks: [], wanted: new Map(), failures: [] };
  const sc = scorer(ctx);

  // sets first: they hold several slots each and are the scarcest stock
  for (const slot of plan.slots.filter((s) => s.kind === "unit")) fill(slot, ctx, st, run, units, sc);
  if (ctx.measure === "verbal")
    for (const [n, sizes] of plan.reading) fillReading(n, sizes.reduce((a, b) => a + b, 0), sizes, { kind: "skill", ids: plan.concepts.map((c) => c.id), label: "your target reading skills" }, ctx, st, run, units);

  const items = plan.slots.filter((s) => s.kind === "item");
  if (ctx.measure === "quant") {
    // the DI set already covers its concepts; the rest go to the single-item slots
    const targets = [...plan.concepts];
    for (const c of run.picks.flatMap((p) => p.cands)) {
      const i = targets.findIndex((t) => t.id === c.primary);
      if (i >= 0) targets.splice(i, 1);
    }
    while (targets.length > items.length) targets.pop();
    for (const id of placeRevisits(items, ctx, targets.map((t) => t.id))) {
      const i = targets.findIndex((t) => t.id === id);
      if (i >= 0) targets.splice(i, 1);
    }
    const free = items.filter((s) => !s.forced);
    const stock = (s: Slot, t: { id: string }, exact: boolean) =>
      ctx.items.some((c) => c.slotType === s.slotType && !c.unitId && c.primary === t.id && c.status === "active" && !ctx.seen.has(c.ref) && !ctx.held.has(c.ref) && (!exact || c.difficulty === s.level));
    // exact edges (the slot's own type and level) first; slots and targets still unmatched then try any level
    const exact = matchTargets(free.length, targets.length, (i, j) => stock(free[i], targets[j], true), false);
    const restSlots = [...free.keys()].filter((i) => !exact.has(i));
    const usedT = new Set(exact.values());
    const restTargets = [...targets.keys()].filter((j) => !usedT.has(j));
    const loose = matchTargets(restSlots.length, restTargets.length, (i, j) => stock(free[restSlots[i]], targets[restTargets[j]], false));
    const match = new Map([...exact, ...[...loose].map(([i, j]) => [restSlots[i], restTargets[j]] as const)]);
    for (const [i, j] of match) {
      free[i].target = { kind: "concept", ids: [targets[j].id], label: ctx.conceptName(targets[j].id) };
      free[i].variant = targets[j].variant;
    }
  } else placeRevisits(items, ctx, items[0]?.target.ids ?? []);
  // revisits first; then exact fills, the slot with the fewest exact candidates each time; then the rest down the ladder
  const left = [...items].sort((a, b) => Number(!!b.forced) - Number(!!a.forced));
  for (const slot of left.filter((x) => x.forced)) fill(slot, ctx, st, run, units, sc);
  const open = left.filter((x) => !x.forced);
  for (;;) {
    const scored = open.map((slot) => ({ slot, n: exactCount(slot, ctx, st) })).filter((x) => x.n > 0);
    if (!scored.length) break;
    const next = scored.reduce((a, b) => (b.n < a.n ? b : a)).slot;
    const p = fillSlot(next, ctx, st, sc, [1]);
    if (!p) break;
    run.wanted.set(next.id, p.cands[0].difficulty);
    take(p, st, units);
    run.picks.push(p);
    open.splice(open.indexOf(next), 1);
  }
  for (const slot of open) fill(slot, ctx, st, run, units, sc);
  if (run.picks.filter((p) => p.slot.revisitOf).length > REVISIT_MAX) throw new Error("revisit cap broken");
  return finish(ctx, run, ctx.blueprint.sections.map((s) => ({ n: s.n, minutes: s.minutes })), true, plan.pools);
}

/** A custom quiz: one section, the chosen types, targets and level range. */
export function assembleCustom(ctx: Ctx, spec: Extract<QuizSpec, { kind: "custom" }>): Assembly {
  const plan = customPlan(ctx, spec);
  const st = newState();
  st.pools = clonePools(plan.pools);
  const units = new Map(ctx.units.map((u) => [u.id, u]));
  const run: Run = { picks: [], wanted: new Map(), failures: [] };
  const sc = scorer(ctx);
  for (const slot of plan.slots.filter((s) => s.kind === "unit")) fill(slot, ctx, st, run, units, sc);
  // reading in 2-question passages by default (a 1 for an odd total); fillReading tries other splits too
  const t = plan.readingTotal;
  if (t) fillReading(1, t, [...Array(Math.floor(t / 2)).fill(2), ...(t % 2 ? [1] : [])], plan.readingTarget, ctx, st, run, units, plan.range);
  for (const slot of plan.slots.filter((s) => s.kind === "item")) fill(slot, ctx, st, run, units, sc);
  return finish(ctx, run, [{ n: 1, minutes: plan.minutes }], false, plan.pools);
}

export function assemble(ctx: Ctx, spec: QuizSpec): Assembly {
  return spec.kind === "mock" ? assembleMock(ctx) : assembleCustom(ctx, spec);
}

export type { Ctx, QuizSpec, Fallback };
