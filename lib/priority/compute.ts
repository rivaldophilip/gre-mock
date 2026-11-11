import {
  COVERAGE_W,
  HALF_LIFE_DAYS,
  INTERVALS_DAYS,
  P_WEIGHTS,
  PENDING_FACTOR,
  RECENT_DAYS,
  RECENT_FACTOR,
  SMOOTH,
  WORD_YIELD_BONUS,
  WORD_YIELD_SOURCES_CAP,
} from "./config";

export interface LoggedEvent {
  itemId: string;
  event: string;
  weight: number;
  createdAt: Date;
}

export interface ItemScore {
  itemId: string;
  S: number; // weakness 0..1
  C: number; // coverage 0..1
  N: number; // novelty
  D: number; // due
  Y: number; // yield
  P: number; // priority
  reason: string;
  weakEvidence: number; // decayed positive weight; > 0 means "has weakness evidence"
  mastery: number; // decayed |negative| weight
  /** decayed positive weight per event, largest first (for explaining S) */
  evidence: { event: string; mass: number }[];
  streak: number;
  recent: boolean; // ×RECENT_FACTOR applied
  lastTestedAt: Date | null;
  /** ids of the registered, unfinished tests (or unregistered briefs) that already target this item */
  pending?: string[];
}

const DAY = 86_400_000;

type Role = "key" | "distractor" | "passage" | "other";
function roleOf(event: string): Role {
  if (event.startsWith("key_") || event.startsWith("concept_")) return "key";
  if (event.startsWith("distractor_")) return "distractor";
  if (event === "exposure") return "passage";
  return "other"; // dont_know
}

const MASTERY = new Set(["key_correct", "concept_right_primary", "concept_right_secondary"]);

export function decay(ageDays: number): number {
  return Math.pow(0.5, Math.max(0, ageDays) / HALF_LIFE_DAYS);
}

export function intervalFor(streak: number): number {
  return INTERVALS_DAYS[Math.min(streak, INTERVALS_DAYS.length - 1)];
}

export function wordYield(sourceCount: number, secondaryOrEts: boolean): number {
  return Math.min(1, sourceCount / WORD_YIELD_SOURCES_CAP + (secondaryOrEts ? WORD_YIELD_BONUS : 0));
}

export const REASONS: Record<string, string> = {
  dont_know: "tagged 'didn't know'",
  key_missed: "missed as the answer",
  distractor_chosen: "chosen as a wrong answer",
  key_guessed: "answered correctly but guessed",
  key_slow: "right but slow",
  concept_wrong_primary: "wrong on a question testing it",
  concept_wrong_secondary: "wrong on a question touching it",
  concept_guessed: "right but guessed",
  concept_slow: "right but slow",
};

export function scoreItem(itemId: string, events: LoggedEvent[], yieldWeight: number, now: Date): ItemScore {
  let pos = 0;
  let neg = 0;
  let nKey = 0;
  let nDis = 0;
  let nPas = 0;
  let last: Date | null = null;
  let lastAny: Date | null = null;
  const reasonMass = new Map<string, number>();

  const sorted = [...events].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  for (const e of sorted) {
    const d = decay((now.getTime() - e.createdAt.getTime()) / DAY);
    if (e.weight > 0) {
      pos += e.weight * d;
      reasonMass.set(e.event, (reasonMass.get(e.event) ?? 0) + e.weight * d);
    } else if (e.weight < 0) neg += Math.abs(e.weight) * d;
    const r = roleOf(e.event);
    if (r === "key") nKey++;
    else if (r === "distractor") nDis++;
    else if (r === "passage") nPas++;
    if (r !== "other" && r !== "passage" && (!last || e.createdAt > last)) last = e.createdAt;
    if (!lastAny || e.createdAt > lastAny) lastAny = e.createdAt;
  }

  const S = (pos + SMOOTH.prior) / (pos + neg + SMOOTH.total);
  const C = Math.min(1, COVERAGE_W.key * nKey + COVERAGE_W.distractor * nDis + COVERAGE_W.passage * nPas);
  const N = 1 - C;

  // streak: consecutive mastery events at the end of the tested history
  let streak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const e = sorted[i];
    if (roleOf(e.event) === "passage") continue;
    if (MASTERY.has(e.event)) streak++;
    else if (e.weight > 0) break;
  }
  // clamped at 0: a timestamp read back in the wrong time zone can land in the future
  const D = last ? Math.min(1, Math.max(0, (now.getTime() - last.getTime()) / DAY / intervalFor(streak))) : 0;

  let P = P_WEIGHTS.S * S + P_WEIGHTS.N * N + P_WEIGHTS.D * D + P_WEIGHTS.Y * yieldWeight;
  const recent = !!lastAny && (now.getTime() - lastAny.getTime()) / DAY < RECENT_DAYS;
  if (recent) P *= RECENT_FACTOR;

  let reason = "never tested";
  if (events.length) {
    const top = [...reasonMass.entries()].sort((a, b) => b[1] - a[1])[0];
    reason = top ? REASONS[top[0]] ?? top[0] : C >= 1 ? "covered, no weakness" : "partly covered";
  }
  const evidence = [...reasonMass.entries()].map(([event, mass]) => ({ event, mass })).sort((a, b) => b.mass - a.mass);
  return { itemId, S, C, N, D, Y: yieldWeight, P, reason, weakEvidence: pos, mastery: neg, evidence, streak, recent, lastTestedAt: last };
}

export function scoreAll(
  items: { id: string; yield: number }[],
  events: LoggedEvent[],
  now: Date = new Date(),
): ItemScore[] {
  const by = new Map<string, LoggedEvent[]>();
  for (const e of events) {
    const arr = by.get(e.itemId);
    if (arr) arr.push(e);
    else by.set(e.itemId, [e]);
  }
  return items.map((it) => scoreItem(it.id, by.get(it.id) ?? [], it.yield, now));
}

/**
 * Items a registered but unfinished test already targets (as key / primary): the user has not
 * answered them yet, so a new brief should not pick them again. The allocators use them only
 * when nothing else is left, fewest holders first, and P is damped once per holder.
 * `pending` maps itemId -> the test ids that hold it.
 */
export function markPending(scores: ItemScore[], pending: Map<string, string[]>): ItemScore[] {
  return scores.map((s) => {
    const tests = pending.get(s.itemId);
    if (!tests?.length) return s;
    return { ...s, P: s.P * PENDING_FACTOR ** tests.length, pending: tests, reason: `${s.reason}; already in untaken ${tests.join(", ")}` };
  });
}

/** How many untaken tests already hold an item (0 when none). */
export function heldBy(s: ItemScore): number {
  return s.pending?.length ?? 0;
}
