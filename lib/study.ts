import { z } from "zod";
import { isListed } from "./attempt-summary";
import { slotType, type SlotType } from "./qtypes";
import type { Test } from "./types";

/** A study guide (content/study/<measure>.json). Strings use the Rich markup: $math$, **bold**, *italic*. */
const Lines = z.array(z.string().min(1)).min(1);
export const StudySchema = z.object({
  measure: z.enum(["verbal", "quant"]),
  intro: z.string().min(1),
  /** quick-reference tiles: a plain name, then either the formula (bare TeX, no $) or a short rule (Rich), and an optional one-line note (Rich) */
  quickRef: z
    .array(
      z.object({
        title: z.string().min(1),
        items: z
          .array(
            z
              .object({ name: z.string().min(1), tex: z.string().min(1).optional(), text: z.string().min(1).optional(), note: z.string().optional() })
              .refine((it) => (it.tex === undefined) !== (it.text === undefined), "a tile has exactly one of tex or text"),
          )
          .min(1),
      }),
    )
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
        /** tips & tricks: a named move, when it applies, a quick worked case, and an optional drawing (inline SVG drawn with currentColor and theme vars) */
        tips: z
          .array(z.object({ title: z.string().min(1), text: z.string().min(1), example: z.string().min(1).optional(), svg: z.string().startsWith("<svg").optional() }))
          .optional(),
        /** pattern drills: one method in every disguise it shows up in, each with how to spot it and a worked case */
        patterns: z
          .array(
            z.object({
              title: z.string().min(1),
              idea: z.string().min(1),
              cases: z.array(z.object({ name: z.string().min(1), q: z.string().min(1), spot: z.string().min(1), steps: Lines })).min(1),
              /** look-alikes the method does not fit */
              notWhen: Lines.optional(),
            }),
          )
          .optional(),
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
  finishedAt: Date;
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
      .map((x) => ({ testId: x.a.testId, attemptId: x.a.id, qid: x.q.id, type: slotType(x.q), difficulty: x.q.difficulty, timeMs: x.ms, guessed: x.r.guessed, trap: x.q.explanation.trap || undefined, finishedAt: x.a.finishedAt! }));
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

export const MARK_KINDS = ["card", "topic"] as const;
export type MarkKind = (typeof MARK_KINDS)[number];
export type MarkState = "archived" | "deleted";
export interface Mark {
  state: MarkState;
  updatedAt: Date;
}

/** A formula card's mark id: its group and name, which are unique within a guide. */
export const cardId = (group: string, name: string) => `${group} / ${name}`;

/** Every id a guide can mark, by kind. */
export function markIds(guide: Study): Record<MarkKind, Set<string>> {
  return {
    card: new Set(guide.quickRef.flatMap((g) => g.items.map((it) => cardId(g.title, it.name)))),
    topic: new Set(guide.sections.map((s) => s.id)),
  };
}

/**
 * Splits items by the reader's marks, keeping their order. `missedSince` brings an archived item back to the
 * shown list when a mock finished after it was archived misses it (`back` names those); deleted items stay out.
 */
export function applyMarks<T>(items: T[], id: (t: T) => string, marks: Map<string, Mark>, missedSince?: (t: T, since: Date) => boolean) {
  const out = { shown: [] as T[], archived: [] as T[], deleted: [] as T[], back: new Set<string>() };
  for (const t of items) {
    const m = marks.get(id(t));
    if (!m) out.shown.push(t);
    else if (m.state === "deleted") out.deleted.push(t);
    else if (missedSince?.(t, m.updatedAt)) {
      out.shown.push(t);
      out.back.add(id(t));
    } else out.archived.push(t);
  }
  return out;
}
