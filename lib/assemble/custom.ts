// A custom quiz's slots (docs/BANK.md): one section of the chosen length, spread over the chosen types (a set counts
// as its questions), aimed at the chosen concepts or skills (or the user's weakest), with levels spread evenly over
// the chosen range. No blueprint rules apply; the time is each type's target pace added up.
import { TYPE_INFO, type SlotType } from "../qtypes";
import { poolKey } from "./ladder";
import type { Ctx, QuizSpec, Slot, Target } from "./types";

type Custom = Extract<QuizSpec, { kind: "custom" }>;

export const CUSTOM_TYPES = {
  verbal: ["tc1", "tc2", "tc3", "se", "rc", "arg"],
  quant: ["qc", "mc", "mc_multi", "numeric", "di"],
} as const satisfies Record<string, readonly (SlotType | "rc")[]>;
export const CUSTOM_MAX = 40;

/** `n` levels spread evenly over [lo, hi]: 5 over 3-5 gives 3, 4, 4, 5, 5 (rounded, never outside the range). */
export function spreadLevels(n: number, lo: number, hi: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [Math.round((lo + hi) / 2)];
  return Array.from({ length: n }, (_, i) => Math.round(lo + ((hi - lo) * i) / (n - 1)));
}

/**
 * Split `length` questions over the types as evenly as it goes: an even share each, a DI set rounded to whole sets of
 * 3 (at least one when it fits), the rest shared by the other types; a reading allotment is filled with passages
 * later (any size). Returns type -> questions.
 */
export function spreadLength(length: number, types: (SlotType | "rc")[]): Map<SlotType | "rc", number> {
  const out = new Map<SlotType | "rc", number>(types.map((t) => [t, 0]));
  const share = length / types.length;
  let left = length;
  if (types.includes("di")) {
    const sets = Math.max(length >= 3 ? 1 : 0, Math.round(share / 3));
    out.set("di", Math.min(sets * 3, Math.floor(length / 3) * 3));
    left -= out.get("di")!;
  }
  const rest = types.filter((t) => t !== "di");
  if (!rest.length && left > 0) out.set("di", out.get("di")!); // only DI: the remainder (under 3) is dropped
  rest.forEach((t, i) => out.set(t, Math.floor(left / rest.length) + (i < left % rest.length ? 1 : 0)));
  return out;
}

/** The weakest targets of the measure (weakness evidence, by priority), or every one by priority if there is none yet. */
export function weakest(ctx: Ctx, areas: string[], n: number): string[] {
  const pool = ctx.conceptScores.filter((s) => areas.includes(s.area) && !s.dismissed);
  const weak = pool.filter((s) => s.weakEvidence > 0).sort((a, b) => b.P - a.P);
  return (weak.length ? weak : [...pool].sort((a, b) => b.P - a.P)).slice(0, Math.max(1, n)).map((s) => s.itemId);
}

/** Slots, level pools and minutes for a custom spec. Reading allotments are returned as totals, split into passages by the caller. */
export function customPlan(ctx: Ctx, spec: Custom) {
  const counts = spreadLength(Math.min(CUSTOM_MAX, spec.length), spec.types);
  const [lo, hi] = [Math.min(...spec.levels), Math.max(...spec.levels)];
  const slots: Slot[] = [];
  const pools = new Map<string, number[]>();
  const quantAreas = ["arithmetic", "algebra", "geometry", "data"];
  const chosen = spec.targets === "weakest" ? null : spec.targets;
  const targetFor = (areas: string[], k: number): Target => {
    const ids = chosen ? chosen.filter((id) => ctx.conceptScores.some((s) => s.itemId === id && areas.includes(s.area))) : weakest(ctx, areas, k);
    return ids.length ? { kind: ctx.measure === "quant" ? "concept" : "skill", ids, label: chosen ? "your chosen topics" : "your weakest topics" } : { kind: "any", ids: [], label: "any topic" };
  };
  // verbal TC / SE: "weakest" aims at the weakest words (the most needed ones while none is weak yet); chosen skills
  // say nothing about completions
  const weakWords = ctx.wordScores.filter((s) => s.weakEvidence > 0).sort((a, b) => b.P - a.P);
  const topWords = (weakWords.length && spec.targets === "weakest" ? weakWords : [...ctx.wordScores].sort((a, b) => b.P - a.P)).slice(0, 120).map((s) => s.itemId);
  const words: Target = topWords.length ? { kind: "words", ids: topWords, label: weakWords.length && spec.targets === "weakest" ? "your weakest words" : "your target words" } : { kind: "any", ids: [], label: "any words" };
  const range: [number, number] = [lo, hi];
  let readingTotal = 0;
  let k = 0;
  let minutesSec = 0;
  for (const [t, n] of counts) {
    if (!n) continue;
    const levels = spreadLevels(n, lo, hi);
    pools.set(poolKey(1, t), levels);
    minutesSec += n * TYPE_INFO[t === "rc" ? "rc" : t].paceSec;
    if (t === "rc") {
      readingTotal = n;
      continue;
    }
    if (t === "di") {
      // a data set tests data concepts: other chosen concepts cannot be its target
      for (let i = 0; i < n / 3; i++) slots.push({ id: `s1-di-${i + 1}`, section: 1, kind: "unit", slotType: "di", size: 3, levelRange: range, target: targetFor(["data"], 3) });
      continue;
    }
    if (t === "arg") {
      for (let i = 0; i < n; i++) slots.push({ id: `s1-arg-${i + 1}`, section: 1, kind: "unit", slotType: "arg", size: 1, levelRange: range, target: targetFor(["argument"], n) });
      continue;
    }
    // any of the chosen (or weakest) topics fills a slot exactly; scoring spreads the quiz over them
    const target = ctx.measure === "quant" ? targetFor(quantAreas, Math.max(n, 5)) : words;
    for (let i = 0; i < n; i++) slots.push({ id: `s1-${t}-${++k}`, section: 1, kind: "item", slotType: t, levelRange: range, target });
  }
  return { slots, pools, readingTotal, readingTarget: targetFor(["reading"], readingTotal), range, minutes: Math.max(1, Math.ceil(minutesSec / 60)) };
}
