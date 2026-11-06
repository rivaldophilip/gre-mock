/** Per-section clock, stored in attempts.section_state[n]. All times are ISO strings / ms. */
export interface SectionClock {
  startedAt?: string;
  finishedAt?: string;
  /** total time the clock was paused (revealed answers in practice mode, time away from the page) */
  pausedMs?: number;
  /** set while paused */
  pausedAt?: string;
  /** why it is paused: a revealed practice answer (until the next navigation), or the test-taker left the page */
  pausedFor?: PauseReason;
  /** last heartbeat from an open page; a running clock that has not heard one for STALE_MS counts as paused since then */
  lastSeenAt?: string;
}
export type SectionState = Record<string, SectionClock>;
export type PauseReason = "reveal" | "away";

/** A running clock with no heartbeat for this long is treated as paused from its last heartbeat (crash, lost connection). */
export const STALE_MS = 60_000;

/** When the clock effectively stopped: an explicit pause, or the last heartbeat of a page that went quiet. */
function stoppedAt(st: SectionClock, now: number): number | null {
  if (st.pausedAt) return new Date(st.pausedAt).getTime();
  if (st.lastSeenAt && !st.finishedAt) {
    const seen = new Date(st.lastSeenAt).getTime();
    if (now - seen > STALE_MS) return seen;
  }
  return null;
}

/** True when the clock is stopped because the test-taker is away (paused on leaving, or no heartbeat). */
export function isAway(st: SectionClock | undefined, now = Date.now()): boolean {
  if (!st?.startedAt || st.finishedAt) return false;
  if (st.pausedAt) return st.pausedFor === "away";
  return stoppedAt(st, now) !== null;
}

/** Time the section clock has actually run: wall time since start minus every pause, including a current one. */
export function elapsedMs(st: SectionClock | undefined, now = Date.now()): number {
  if (!st?.startedAt) return 0;
  const stop = stoppedAt(st, now);
  const paused = (st.pausedMs ?? 0) + (stop !== null ? Math.max(0, now - stop) : 0);
  return Math.max(0, now - new Date(st.startedAt).getTime() - paused);
}

/** The clock after pausing (no-op if already paused, not started, or finished). A stale clock pauses from its last heartbeat. */
export function paused(st: SectionClock | undefined, now = Date.now(), reason: PauseReason = "reveal"): SectionClock | null {
  if (!st?.startedAt || st.finishedAt || st.pausedAt) return null;
  const from = stoppedAt(st, now) ?? now;
  return { ...st, pausedAt: new Date(from).toISOString(), pausedFor: reason };
}

/**
 * The clock after resuming: the pause (or the silent gap after the last heartbeat) is folded into pausedMs.
 * With `only`, a pause for another reason is left alone. No-op if there is nothing to resume.
 */
export function resumed(st: SectionClock | undefined, now = Date.now(), only?: PauseReason): SectionClock | null {
  if (!st?.startedAt || st.finishedAt) return null;
  if (st.pausedAt && only && (st.pausedFor ?? "reveal") !== only) return null;
  const stop = stoppedAt(st, now);
  if (stop === null) return null;
  const { pausedAt: _p, pausedFor: _r, ...rest } = st;
  void _p;
  void _r;
  return { ...rest, pausedMs: (st.pausedMs ?? 0) + Math.max(0, now - stop), lastSeenAt: new Date(now).toISOString() };
}

/** The clock after a heartbeat: resumes a silent gap (so it does not count), then records the beat. */
export function heartbeat(st: SectionClock | undefined, now = Date.now()): SectionClock | null {
  if (!st?.startedAt || st.finishedAt) return null;
  if (st.pausedAt) return { ...st, lastSeenAt: new Date(now).toISOString() };
  return resumed(st, now) ?? { ...st, lastSeenAt: new Date(now).toISOString() };
}
