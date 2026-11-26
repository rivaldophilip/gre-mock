import { elapsedMs, type SectionState } from "./clock";

type AttemptLike = { id: number; testId: string; startedAt: Date; abandonedAt: Date | null; sectionState: unknown; mode?: string };

/** Abandoned attempts are hidden from every list and take no number; so are endless-vocab drill batches and miss replays, which are not mocks. */
export const isListed = (a: AttemptLike) => !a.abandonedAt && a.mode !== "drill" && a.mode !== "replay";

/**
 * Whether a response logs item events: not in a miss replay, and not for an item a quiz reused (answered before,
 * docs/BANK.md). Both are scored; neither says anything new about the words, concepts or skills in them.
 */
export const logsItemEvents = (a: { mode: string }, q: { reused?: boolean }) => a.mode !== "replay" && !q.reused;

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
 * Mocks numbered 1, 2, … within their measure (all verbal tests, all quant tests), by when each test was first
 * finished, so a progress chart's x axis reads "your 7th verbal mock" and a test's retakes share its number.
 */
export function mockNumbers<A extends AttemptLike & { finishedAt: Date | null }>(attempts: A[], measureOf: (a: A) => string | undefined): Map<string, number> {
  const out = new Map<string, number>();
  const seen = new Map<string, number>();
  const done = attempts.filter((a) => isListed(a) && a.finishedAt);
  for (const a of done.sort((x, y) => x.finishedAt!.getTime() - y.finishedAt!.getTime() || x.id - y.id)) {
    const m = measureOf(a);
    if (!m || out.has(a.testId)) continue;
    const n = (seen.get(m) ?? 0) + 1;
    seen.set(m, n);
    out.set(a.testId, n);
  }
  return out;
}

type PointLike = { measure: string; attemptNo: number; timeMs: number; score: { mid: number } };
export type ScoreSummary = { n: number; avg: number | null; best: number | null };

/**
 * Tiles over a set of finished attempts: counts and average time cover every attempt; scores cover first
 * attempts only, since a retake re-uses seen questions and reads high.
 */
export function summarizePoints(points: PointLike[]) {
  const mean = (xs: number[]) => (xs.length ? xs.reduce((t, x) => t + x, 0) / xs.length : null);
  const score = (m: string): ScoreSummary => {
    const mids = points.filter((p) => p.measure === m && p.attemptNo === 1).map((p) => p.score.mid);
    return { n: mids.length, avg: mean(mids), best: mids.length ? Math.max(...mids) : null };
  };
  return {
    n: points.length,
    verbal: points.filter((p) => p.measure === "verbal").length,
    quant: points.filter((p) => p.measure === "quant").length,
    retakes: points.filter((p) => p.attemptNo > 1).length,
    avgTimeMs: mean(points.map((p) => p.timeMs)),
    vScore: score("verbal"),
    qScore: score("quant"),
  };
}
