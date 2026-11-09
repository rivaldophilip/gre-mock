import { elapsedMs, type SectionState } from "./clock";

type AttemptLike = { id: number; testId: string; startedAt: Date; abandonedAt: Date | null; sectionState: unknown };

/** Abandoned attempts are hidden from every list and take no number. */
export const isListed = (a: AttemptLike) => !a.abandonedAt;

/** Attempt number within its own test (1, 2, …), counting only attempts that were not abandoned, oldest first. */
export function attemptNumbers(attempts: AttemptLike[]): Map<number, number> {
  const out = new Map<number, number>();
  const seen = new Map<string, number>();
  for (const a of [...attempts].filter(isListed).sort((x, y) => x.startedAt.getTime() - y.startedAt.getTime() || x.id - y.id)) {
    const n = (seen.get(a.testId) ?? 0) + 1;
    seen.set(a.testId, n);
    out.set(a.id, n);
  }
  return out;
}

/** Time spent working: both section clocks, without pauses (time away, Pause, reading a revealed practice answer). */
export function attemptTimeMs(a: AttemptLike, now = Date.now()): number {
  const st = a.sectionState as SectionState;
  return elapsedMs(st["1"], now) + elapsedMs(st["2"], now);
}

/** "42m", "1h 05m"; under a minute rounds up to "1m" so a started attempt never reads 0. */
export function fmtDuration(ms: number): string {
  const m = Math.max(ms > 0 ? 1 : 0, Math.round(ms / 60_000));
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
}

/**
 * Finished attempts numbered 1, 2, … within their measure (all verbal mocks, all quant mocks), by when they
 * were finished, so a progress chart's x axis reads "your 7th verbal mock" across every test and retake.
 */
export function finishedOrdinals<A extends AttemptLike & { finishedAt: Date | null }>(attempts: A[], measureOf: (a: A) => string | undefined): Map<number, number> {
  const out = new Map<number, number>();
  const seen = new Map<string, number>();
  const done = attempts.filter((a) => isListed(a) && a.finishedAt);
  for (const a of done.sort((x, y) => x.finishedAt!.getTime() - y.finishedAt!.getTime() || x.id - y.id)) {
    const m = measureOf(a);
    if (!m) continue;
    const n = (seen.get(m) ?? 0) + 1;
    seen.set(m, n);
    out.set(a.id, n);
  }
  return out;
}
