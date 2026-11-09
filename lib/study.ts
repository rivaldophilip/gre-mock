import { z } from "zod";
import { isListed } from "./attempt-summary";
import { slotType, type SlotType } from "./qtypes";
import type { Test } from "./types";

/** A study guide (content/study/<measure>.json). Strings use the Rich markup: $math$, **bold**, *italic*. */
const Lines = z.array(z.string().min(1)).min(1);
export const StudySchema = z.object({
  measure: z.enum(["verbal", "quant"]),
  intro: z.string().min(1),
  /** formula tiles: a plain name, the formula (bare TeX, no $), and an optional one-line note (Rich) */
  quickRef: z
    .array(z.object({ title: z.string().min(1), items: z.array(z.object({ name: z.string().min(1), tex: z.string().min(1), note: z.string().optional() })).min(1) }))
    .min(1),
  formats: z.array(
    z.object({
      type: z.enum(["tc1", "tc2", "tc3", "se", "rc", "rc_multi", "rc_select", "arg", "qc", "mc", "mc_multi", "numeric", "di"]),
      title: z.string().min(1),
      rules: Lines,
    }),
  ),
  pacing: Lines,
  sections: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        title: z.string().min(1),
        /** concept (or reading-skill) ids this section teaches; a question counts here if any of its tags is one of them */
        concepts: z.array(z.string()).min(1),
        /** the one-sentence intuition the section hangs on */
        idea: z.string().min(1),
        example: z.object({ q: z.string().min(1), steps: Lines }),
        facts: Lines,
        tricks: Lines,
        traps: Lines,
      }),
    )
    .min(1),
});
export type Study = z.infer<typeof StudySchema>;
export type StudySection = Study["sections"][number];

/** Over this, a question counts as a long sink in the pacing summary. */
export const LONG_MS = 180_000;

export interface Miss {
  testId: string;
  attemptId: number;
  qid: string;
  type: SlotType;
  difficulty: number;
  timeMs: number;
  guessed: boolean;
  trap?: string;
}

export interface Tally {
  n: number;
  correct: number;
  avgMs: number;
}

export interface StudyStats {
  overall: Tally & { tests: number };
  sections: Map<string, Tally & { misses: Miss[] }>;
  formats: Map<SlotType, Tally>;
  pacing: { hitMs: number; missMs: number; long: number; longRight: number; guessed: number; guessedRight: number };
}

type AttemptRow = { id: number; testId: string; startedAt: Date; finishedAt: Date | null; abandonedAt: Date | null; sectionState: unknown };
type ResponseRow = { attemptId: number; questionId: string; isCorrect: boolean; timeMs: number; guessed: boolean };

const tally = (rows: { ok: boolean; ms: number }[]): Tally => ({
  n: rows.length,
  correct: rows.filter((r) => r.ok).length,
  avgMs: rows.length ? rows.reduce((t, r) => t + r.ms, 0) / rows.length : 0,
});

/**
 * The guide's live numbers: every response of a finished, listed attempt at a test of this measure, grouped by
 * section (via concept tags, primary or secondary), by format, and for pacing. A question tagged with concepts
 * of two sections counts in both.
 */
export function studyStats(guide: Study, attempts: AttemptRow[], responses: ResponseRow[], tests: Map<string, Test>): StudyStats {
  const done = new Map(attempts.filter((a) => isListed(a) && a.finishedAt && tests.get(a.testId)?.measure === guide.measure).map((a) => [a.id, a]));
  const rows = responses.flatMap((r) => {
    const a = done.get(r.attemptId);
    if (!a) return [];
    const qid = r.questionId.slice(r.questionId.indexOf(":") + 1);
    const q = tests.get(a.testId)!.questions.find((x) => x.id === qid);
    if (!q) return [];
    return [{ a, q, r, ok: r.isCorrect, ms: r.timeMs, concepts: new Set(q.tags.filter((t) => t.kind === "concept").map((t) => t.id)) }];
  });

  const sections = new Map<string, Tally & { misses: Miss[] }>();
  for (const s of guide.sections) {
    const mine = rows.filter((x) => s.concepts.some((c) => x.concepts.has(c)));
    const misses = mine
      .filter((x) => !x.ok)
      .map((x) => ({ testId: x.a.testId, attemptId: x.a.id, qid: x.q.id, type: slotType(x.q), difficulty: x.q.difficulty, timeMs: x.ms, guessed: x.r.guessed, trap: x.q.explanation.trap || undefined }));
    sections.set(s.id, { ...tally(mine), misses });
  }

  const formats = new Map<SlotType, Tally>();
  for (const t of new Set(rows.map((x) => slotType(x.q)))) formats.set(t, tally(rows.filter((x) => slotType(x.q) === t)));

  const long = rows.filter((x) => x.ms > LONG_MS);
  const guessed = rows.filter((x) => x.r.guessed);
  return {
    overall: { ...tally(rows), tests: done.size },
    sections,
    formats,
    pacing: {
      hitMs: tally(rows.filter((x) => x.ok)).avgMs,
      missMs: tally(rows.filter((x) => !x.ok)).avgMs,
      long: long.length,
      longRight: long.filter((x) => x.ok).length,
      guessed: guessed.length,
      guessedRight: guessed.filter((x) => x.ok).length,
    },
  };
}

/** Weakest first: lowest accuracy, then more misses. Sections with no data go last, in guide order. */
export function orderSections<S extends { id: string }>(sections: S[], stats: Map<string, Tally>): S[] {
  const acc = (s: S) => {
    const t = stats.get(s.id);
    return t && t.n ? t.correct / t.n : Infinity;
  };
  const missed = (s: S) => {
    const t = stats.get(s.id);
    return t ? t.n - t.correct : 0;
  };
  return sections
    .map((s, i) => ({ s, i }))
    .sort((x, y) => acc(x.s) - acc(y.s) || missed(y.s) - missed(x.s) || x.i - y.i)
    .map((x) => x.s);
}
