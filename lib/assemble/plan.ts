// A mock's slot plan (docs/BANK.md, Assembly): the blueprint's slots, what each aims at, and the levels each type
// draws from. Targets come from the same allocators the briefs use (lib/priority/allocate.ts), so a quiz aims where a
// brief would have.
import { allocateConcepts, allocateVerbalKeys, assignVariants, pairSeKeys } from "../priority/allocate";
import { REVISIT_MAX } from "../priority/revisit";
import { poolKey } from "./ladder";
import { pairKey } from "./score";
import type { Cand, Ctx, Slot, Target } from "./types";
import type { SlotType } from "../qtypes";

export const QUANT_AREAS = ["arithmetic", "algebra", "geometry", "data"];
/** Verbal key-word slots, as a brief allocates them (15 TC blanks + 7 SE pairs). */
export const KEY_SLOTS = 29;
/**
 * A bank item cannot be written to order, so a TC / SE slot aims at any of the most needed words, not just the 29 a
 * brief would key: the allocator's picks first, then the next by priority up to this many.
 */
export const WORD_TARGETS = 120;

export type Plan = {
  slots: Slot[];
  pools: Map<string, number[]>;
  /** quant: the concept targets in priority order, with the variant each should take */
  concepts: { id: string; variant?: string }[];
  /** verbal: SE key pairs worth keying (a bonus for an SE item that keys one) */
  wantedPairs: Set<string>;
  /** verbal: the reading section totals and the blueprint's passage sizes, per section */
  reading: Map<1 | 2, number[]>;
};

const any: Target = { kind: "any", ids: [], label: "any topic" };

/** The blueprint's slots, a unit per DI set (quant), and each section's level pools. Reading passages are planned per section by the caller. */
export function blueprintPlan(ctx: Ctx): Plan {
  const slots: Slot[] = [];
  const pools = new Map<string, number[]>();
  const reading = new Map<1 | 2, number[]>();
  for (const sec of ctx.blueprint.sections) {
    const n = sec.n;
    let k = 0;
    for (const s of sec.slots) (pools.get(poolKey(n, s.type)) ?? pools.set(poolKey(n, s.type), []).get(poolKey(n, s.type))!).push(s.level);
    const di = sec.slots.filter((s) => s.type === "di").length;
    if (di) slots.push({ id: `s${n}-di`, section: n, kind: "unit", slotType: "di", size: di, target: any });
    const args = sec.slots.filter((s) => s.type === "arg").length;
    for (let i = 0; i < args; i++) slots.push({ id: `s${n}-arg${i + 1}`, section: n, kind: "unit", slotType: "arg", size: 1, target: any });
    if (ctx.blueprint.passages?.[String(n)]) reading.set(n, ctx.blueprint.passages[String(n)].map((p) => p.questions));
    for (const s of sec.slots) {
      if (s.type === "di" || s.type === "arg" || s.type.startsWith("rc")) continue;
      slots.push({ id: `s${n}-${s.type}-${++k}`, section: n, kind: "item", slotType: s.type as SlotType, level: s.level, target: any });
    }
  }
  return { slots, pools, concepts: [], wantedPairs: new Set(), reading };
}

/** The mock plan with its targets: concepts (quant), or key words and reading / argument skills (verbal). */
export function mockPlan(ctx: Ctx): Plan {
  const plan = blueprintPlan(ctx);
  if (ctx.measure === "quant") {
    const n = ctx.blueprint.sections.reduce((t, s) => t + s.slots.length, 0);
    const picks = allocateConcepts(ctx.conceptScores.filter((s) => QUANT_AREAS.includes(s.area)), n, QUANT_AREAS, ctx.random).map((p) => p.itemId);
    const variants = assignVariants(picks, ctx.variants, ctx.variantUse, ctx.random);
    plan.concepts = picks.map((id, i) => ({ id, variant: variants[i] }));
    for (const s of plan.slots) if (s.slotType === "di") s.target = { kind: "concept", ids: picks, label: "your target concepts" };
  } else {
    const drawn = allocateVerbalKeys(ctx.wordScores, ctx.isSecondary, KEY_SLOTS, ctx.random);
    const { keys, pairs } = pairSeKeys(drawn, ctx.wordScores, ctx.synonyms, { keep: ctx.isSecondary });
    plan.wantedPairs = new Set(pairs.map((p) => pairKey(p)));
    const picked = keys.map((k) => k.itemId);
    const more = [...ctx.wordScores].filter((w) => !w.pending && !picked.includes(w.itemId)).sort((a, b) => b.P - a.P).map((w) => w.itemId);
    const words: Target = { kind: "words", ids: [...picked, ...more].slice(0, WORD_TARGETS), label: "your target words" };
    for (const s of plan.slots) if (s.slotType.startsWith("tc") || s.slotType === "se") s.target = words;
    const slotsOf = ctx.blueprint.sections.flatMap((s) => s.slots.map((x) => x.type));
    const nArg = slotsOf.filter((t) => t === "arg").length;
    const nRc = slotsOf.filter((t) => t.startsWith("rc")).length;
    const skills = (area: string, k: number) => allocateConcepts(ctx.conceptScores.filter((s) => s.area === area), k, [area], ctx.random).map((p) => p.itemId);
    const reading = skills("reading", nRc);
    const argument = skills("argument", nArg);
    for (const s of plan.slots) if (s.slotType === "arg") s.target = { kind: "skill", ids: argument, label: "your target argument skills" };
    plan.concepts = reading.map((id) => ({ id }));
  }
  return plan;
}

/** The items a miss is about: its primary concept (quant) or its key words (verbal). */
const aimsOf = (c: Cand) => (c.keyWords.length ? c.keyWords : c.primary ? [c.primary] : []);

/**
 * Deliberate revisits (docs/PRIORITY.md): a miss whose sibling the bank holds unseen comes back as that sibling, in a
 * free slot of the sibling's type, when what the miss was about is among the targets (at most REVISIT_MAX).
 * Returns the targets the revisits now cover.
 */
export function placeRevisits(slots: Slot[], ctx: Ctx, targets: string[]): string[] {
  const covered: string[] = [];
  const byRef = new Map(ctx.items.map((c) => [c.ref, c]));
  let placed = 0;
  for (const r of ctx.revisits) {
    if (placed >= REVISIT_MAX) break;
    const missed = byRef.get(r.ref);
    if (!missed || !aimsOf(missed).some((t) => targets.includes(t))) continue;
    const sib = ctx.items.find((c) => c.revisits === r.ref && c.status === "active" && !c.unitId && !ctx.seen.has(c.ref) && !ctx.held.has(c.ref));
    if (!sib) continue;
    const slot = slots.find((s) => s.kind === "item" && !s.forced && s.slotType === sib.slotType);
    if (!slot) continue;
    slot.forced = sib.ref;
    slot.revisitOf = r.ref;
    slot.target = { kind: ctx.measure === "quant" ? "concept" : "words", ids: aimsOf(sib), label: "a revisit" };
    covered.push(...aimsOf(sib).filter((t) => targets.includes(t)).slice(0, 1));
    placed++;
  }
  return covered;
}

/**
 * Give each item slot a target so that as many as possible can be filled exactly: a bipartite matching (Kuhn's
 * augmenting paths) between slots and targets, where an edge means the bank has an unseen item of the slot's type for
 * that target. Targets are tried in priority order. Slots left over take the leftover targets in order (the ladder
 * then falls back). Returns slot index -> target index.
 */
export function matchTargets(slotCount: number, targetCount: number, edge: (slot: number, target: number) => boolean, fillLeftovers = true): Map<number, number> {
  const slotOf = new Map<number, number>(); // slot -> target
  const targetOf = new Map<number, number>(); // target -> slot
  const tryTarget = (t: number, seen: Set<number>): boolean => {
    for (let s = 0; s < slotCount; s++) {
      if (seen.has(s) || !edge(s, t)) continue;
      seen.add(s);
      const other = slotOf.get(s);
      if (other === undefined || tryTarget(other, seen)) {
        slotOf.set(s, t);
        targetOf.set(t, s);
        return true;
      }
    }
    return false;
  };
  for (let t = 0; t < targetCount; t++) tryTarget(t, new Set());
  const freeTargets = [...Array(targetCount).keys()].filter((t) => !targetOf.has(t));
  for (let s = 0; s < slotCount && freeTargets.length && fillLeftovers; s++) if (!slotOf.has(s)) slotOf.set(s, freeTargets.shift()!);
  return slotOf;
}

/** Ways to split a section's reading questions into passages, the blueprint's own split first, then the nearest ones. */
export function readingSplits(total: number, preferred: number[]): number[][] {
  const out: number[][] = [];
  const rec = (left: number, max: number, acc: number[]) => {
    if (left === 0) return void out.push([...acc]);
    for (let n = Math.min(max, left, 5); n >= 1; n--) rec(left - n, n, [...acc, n]);
  };
  rec(total, 5, []);
  const want = [...preferred].sort((a, b) => b - a);
  const dist = (p: number[]) => Math.abs(p.length - want.length) * 10 + p.reduce((t, x, i) => t + Math.abs(x - (want[i] ?? 0)), 0) + want.slice(p.length).reduce((t, x) => t + x, 0);
  return out.filter((p) => Math.abs(p.length - want.length) <= 1).sort((a, b) => dist(a) - dist(b));
}
