// A mock's layout against the blueprint rules (lib/blueprint-rules.ts), a repair loop that swaps items until they
// pass, and the order items are shown in.
import { difficultyRules, isTopTier, TOP_CAP } from "../blueprint-rules";
import { fillSlot, take, type Scorer } from "./ladder";
import { newState, type FillState } from "./score";
import type { Cand, Ctx, Picked } from "./types";

type Row = { section: 1 | 2; difficulty: number; solverRating?: number };
const rowsOf = (picks: Picked[]): Row[] => picks.flatMap((p) => p.cands.map((c) => ({ section: p.slot.section, difficulty: c.difficulty, solverRating: c.solverRating ?? undefined })));

/**
 * How far a layout is from passing: 0 when every rule holds. Each rule adds its shortfall (average levels below the
 * bar times the section's size, items over a cap, items under a floor), so a swap that helps lowers the number.
 */
export function violation(picks: Picked[], measure: "verbal" | "quant"): { score: number; failing: string[] } {
  const rows = rowsOf(picks);
  const failing = difficultyRules(rows).filter((r) => !r.ok).map((r) => r.rule);
  let score = 0;
  for (const n of [1, 2] as const) {
    const qs = rows.filter((r) => r.section === n);
    if (!qs.length) continue;
    const sum = qs.reduce((a, r) => a + r.difficulty, 0);
    score += Math.max(0, (n === 1 ? 3.75 : 4.2) * qs.length - sum);
    score += Math.max(0, qs.filter((r) => r.difficulty >= 6).length - TOP_CAP);
    if (n === 2) {
      score += Math.max(0, qs.filter((r) => r.difficulty <= 3).length - 2);
      score += Math.max(0, Math.ceil(qs.length / 3) - qs.filter((r) => r.difficulty >= 5).length);
    }
    if (measure === "quant") {
      const top = qs.filter((r) => isTopTier({ difficulty: r.difficulty, solverRating: r.solverRating })).length;
      if (top > TOP_CAP) {
        score += top - TOP_CAP;
        failing.push(`S${n} top tier ${top} (<=${TOP_CAP})`);
      }
    }
  }
  return { score, failing };
}

/** The fill state of every pick but one, so a swap can test the slot's alternatives against the rest. */
function stateWithout(picks: Picked[], skip: number, ctx: Ctx): FillState {
  const st = newState();
  picks.forEach((p, i) => i !== skip && take(p, st, new Map(ctx.units.map((u) => [u.id, u]))));
  return st;
}

/**
 * Swap picks, one at a time, for the candidate (ladder steps 1-2 only: unseen, the slot's own target) that lowers the
 * violation most, until the layout passes or no swap helps. Revisit siblings stay. Returns the new picks.
 */
export function repair(picks: Picked[], ctx: Ctx, sc: Scorer, maxRounds = 30): Picked[] {
  let cur = [...picks];
  let v = violation(cur, ctx.measure).score;
  for (let round = 0; round < maxRounds && v > 0; round++) {
    let best: { i: number; p: Picked; v: number } | null = null;
    cur.forEach((p, i) => {
      if (p.slot.forced) return;
      const st = stateWithout(cur, i, ctx);
      st.pools = new Map(); // a repair may leave the blueprint's level mix: the rules are what count
      for (const step of [1, 2]) {
        // every allowed alternative at this step, not just the best-scoring one
        const alts = alternatives(p, ctx, st, sc, step);
        for (const alt of alts) {
          const next = cur.map((x, j) => (j === i ? alt : x));
          const nv = violation(next, ctx.measure).score;
          if (nv < v - 1e-9 && (!best || nv < best.v)) best = { i, p: alt, v: nv };
        }
      }
    });
    if (!best) break;
    const b: { i: number; p: Picked; v: number } = best;
    cur = cur.map((x, j) => (j === b.i ? b.p : x));
    v = b.v;
  }
  return cur;
}

/** Candidates a slot could take at one step, each as a pick (the ladder's own filter, every match). */
function alternatives(p: Picked, ctx: Ctx, st: FillState, sc: Scorer, step: number): Picked[] {
  const out: Picked[] = [];
  const blocked = new Set<string>();
  // pull the ladder's best repeatedly, blocking each answer, to list the step's candidates in score order
  for (let k = 0; k < 8; k++) {
    const s2 = { ...st, used: new Set([...st.used, ...blocked]), usedUnits: new Set([...st.usedUnits, ...blocked]) };
    const alt = fillSlot(p.slot, ctx, s2, sc, [step]);
    if (!alt) break;
    out.push(alt);
    (alt.unitId ? [alt.unitId] : alt.cands.map((c) => c.ref)).forEach((r) => blocked.add(r));
  }
  return out.filter((a) => a.unitId !== p.unitId || a.cands[0].ref !== p.cands[0].ref);
}

const shuffle = <T>(xs: T[], random: () => number) => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * One section's items in display order: the opening TC (verbal) or QC (quant) block, then the other blocks (SE; MC,
 * select-all and numeric together; reading passages and arguments together), the DI set last. Each block is shuffled
 * with the quiz's seed; a set's questions stay together in their source order.
 */
export function orderSection(picks: Picked[], measure: "verbal" | "quant", random: () => number): Cand[] {
  const blockOf = (p: Picked) => {
    const t = p.slot.slotType;
    if (measure === "verbal") return t.startsWith("tc") ? 0 : t === "se" ? 1 : 2;
    return t === "qc" ? 0 : t === "di" ? 2 : 1;
  };
  const out: Cand[] = [];
  for (const b of [0, 1, 2]) for (const p of shuffle(picks.filter((x) => blockOf(x) === b), random)) out.push(...[...p.cands].sort((x, y) => x.position - y.position));
  return out;
}
