// Plain-language derivations of the priority numbers, for the hover explanations on /stats.
import { HALF_LIFE_DAYS, P_WEIGHTS, RECENT_DAYS, RECENT_FACTOR, SMOOTH } from "./config";
import { REASONS, type ItemScore } from "./compute";
import { TYPE_INFO, NEED_W, type TypeStat } from "../qtypes";

const f2 = (x: number) => x.toFixed(2);
const pct = (x: number) => `${Math.round(100 * x)}%`;

export function weaknessWhy(s: ItemScore): string {
  const ev = s.evidence.map((e) => `${REASONS[e.event] ?? e.event} ${f2(e.mass)}`).join(", ");
  return [
    `Weakness = (weak + ${SMOOTH.prior}) / (weak + mastery + ${SMOOTH.total})`,
    `= (${f2(s.weakEvidence)} + ${SMOOTH.prior}) / (${f2(s.weakEvidence)} + ${f2(s.mastery)} + ${SMOOTH.total}) = ${pct(s.S)}.`,
    ev ? `Weak evidence: ${ev}.` : "No weak evidence.",
    `Mastery comes from right, unguessed answers. Each event's weight halves every ${HALF_LIFE_DAYS} days. A rough chance you'd miss it next time; untested starts at 33%.`,
  ].join("\n");
}

export function oddsWhy(
  s: ItemScore,
  odds: number,
  ctx: { trials: number; noun: string; slots: number; reviewSlots: number; rank?: number; rankOf: number },
): string {
  const parts = [
    `${pct(odds)}: picked in ${Math.round(odds * ctx.trials)} of ${ctx.trials} simulated briefs for the next test (${ctx.slots} ${ctx.noun} slots).`,
    `Priority P = ${P_WEIGHTS.S}×weakness ${f2(s.S)} + ${P_WEIGHTS.N}×novelty ${f2(s.N)} + ${P_WEIGHTS.D}×due ${f2(s.D)} + ${P_WEIGHTS.Y}×yield ${f2(s.Y)}${s.recent ? ` then ×${RECENT_FACTOR} (seen in the last ${RECENT_DAYS} days)` : ""} = ${f2(s.P)}.`,
    ctx.rank !== undefined
      ? `It ranks #${ctx.rank} of ${ctx.rankOf} items with weakness evidence; the top ${ctx.reviewSlots} by P take the review slots, and the rest are drawn partly at random.`
      : `The top ${ctx.reviewSlots} weak items by P take the review slots; the rest are drawn partly at random.`,
    `Due ${f2(s.D)}: days since last tested ÷ the review interval (streak ${s.streak}).`,
  ];
  return parts.join("\n");
}

export function avgTimeWhy(n: number, avgMs: number, slowSec: number, noun: string): string {
  return `Mean of ${n} question${n === 1 ? "" : "s"} where this ${noun} was tested: ${Math.round(avgMs / 1000)}s. A right answer slower than ${slowSec}s with this as the tested item logs a "slow" event (+0.2 weakness), so slow items come back sooner.`;
}

export function missWhy(t: TypeStat): string {
  return `Chance of missing the next one = (wrong ${t.n - t.correct} + ½×guessed-right ${t.guessed} + 1) / (answered ${t.n} + 2) = ${pct(t.missP)}. The +1/+2 keeps a few answers from reading as 0% or 100%.`;
}

export function paceWhy(t: TypeStat): string {
  const info = TYPE_INFO[t.type];
  return `Average ${Math.round(t.avgMs / 1000)}s against a target of ${info.paceSec}s at real-exam pace (${t.paceRatio.toFixed(2)}×). Slowness ${pct(t.slow)}: 0 at 0.8× pace or faster, 100% at 1.5× or slower.`;
}

export function needWhy(t: TypeStat): string {
  return `Practice need = ${NEED_W.miss}×miss chance ${pct(t.missP)} + ${NEED_W.slow}×slowness ${pct(t.slow)} = ${pct(t.need)}. Taking longer than the target counts against a type even when you get it right. npm run brief passes this ranking to the next test.`;
}
