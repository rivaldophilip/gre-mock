/** Per-section clock, stored in attempts.section_state[n]. All times are ISO strings / ms. */
export interface SectionClock {
  startedAt?: string;
  finishedAt?: string;
  /** practice mode: total time the clock was paused while the test-taker read revealed answers */
  pausedMs?: number;
  /** set while paused (after "Check answer", until the next navigation) */
  pausedAt?: string;
}
export type SectionState = Record<string, SectionClock>;

/** Time the section clock has actually run: wall time since start minus every pause, including a current one. */
export function elapsedMs(st: SectionClock | undefined, now = Date.now()): number {
  if (!st?.startedAt) return 0;
  const paused = (st.pausedMs ?? 0) + (st.pausedAt ? now - new Date(st.pausedAt).getTime() : 0);
  return Math.max(0, now - new Date(st.startedAt).getTime() - paused);
}

/** The clock after pausing (no-op if already paused, not started, or finished). */
export function paused(st: SectionClock | undefined, now = Date.now()): SectionClock | null {
  if (!st?.startedAt || st.finishedAt || st.pausedAt) return null;
  return { ...st, pausedAt: new Date(now).toISOString() };
}

/** The clock after resuming: the pause is folded into pausedMs (no-op if not paused). */
export function resumed(st: SectionClock | undefined, now = Date.now()): SectionClock | null {
  if (!st?.pausedAt) return null;
  const { pausedAt, ...rest } = st;
  return { ...rest, pausedMs: (st.pausedMs ?? 0) + Math.max(0, now - new Date(pausedAt).getTime()) };
}
