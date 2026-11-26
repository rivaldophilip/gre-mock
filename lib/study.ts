import { z } from "zod";
import { isListed } from "./attempt-summary";
import { slotType, type SlotType } from "./qtypes";
import type { Question, Test } from "./types";
import conceptVariants from "@/data/concept_variants.json";

const VARIANTS: Record<string, string[]> = conceptVariants;

/** A study guide (content/study/<measure>.json). Strings use the Rich markup: $math$, **bold**, *italic*. */
const Lines = z.array(z.string().min(1)).min(1);
const Slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const Svg = z.string().startsWith("<svg");
/**
 * Fields every topic card shares. `id` is permanent within its topic (marks are keyed by it), so a card that
 * changes meaning gets a new id; `variant` names the data/concept_variants.json sub-form it teaches, so a later
 * miss on that sub-form brings it back from the archive; `added` (YYYY-MM-DD) flags cards written after a reader
 * may already have studied the topic.
 */
const base = { id: Slug, variant: z.string().min(1).optional(), added: z.iso.date().optional() };
/**
 * A tile, drawn like a formula-sheet card: a short plain `name`, then the point itself as one Rich line (`text`) or a
 * formula (`tex`, bare TeX), an optional one-line `note` (when it applies, why), an optional one-line `example` and
 * an optional drawing (inline SVG drawn with currentColor and theme vars).
 */
const tile = { name: z.string().min(1), text: z.string().min(1).optional(), tex: z.string().min(1).optional(), note: z.string().min(1).optional(), example: z.string().min(1).optional(), svg: Svg.optional() };
export type TileCard = Extract<StudyCard, { kind: "rule" | "shortcut" | "trap" | "limit" }>;
export const isTile = (c: StudyCard): c is TileCard => c.kind === "rule" || c.kind === "shortcut" || c.kind === "trap" || c.kind === "limit";

export const CardSchema = z.discriminatedUnion("kind", [
  /** the one-sentence intuition the topic hangs on */
  z.object({ ...base, kind: z.literal("idea"), text: z.string().min(1) }),
  /** a full question worked step by step */
  z.object({ ...base, kind: z.literal("example"), q: z.string().min(1), steps: Lines, svg: Svg.optional() }),
  /** a short argument, the right answer under a label ("Assumed", "Weakens"), and the tempting wrong answers, each with why it fails */
  z.object({ ...base, kind: z.literal("contrast"), q: z.string().min(1), label: z.string().min(1), answer: z.string().min(1), wrong: z.array(z.object({ text: z.string().min(1), why: z.string().min(1) })).min(1) }),
  /** a fact to know cold */
  z.object({ ...base, ...tile, kind: z.literal("rule") }),
  /** a faster way in */
  z.object({ ...base, ...tile, kind: z.literal("shortcut") }),
  /** a mistake the test is built to catch */
  z.object({ ...base, ...tile, kind: z.literal("trap") }),
  /** one disguise of a pattern: its name, a question, how to spot it, the steps */
  z.object({ ...base, kind: z.literal("case"), pattern: Slug, name: z.string().min(1), q: z.string().min(1), spot: z.string().min(1), steps: Lines, svg: Svg.optional() }),
  /** a look-alike the pattern's method does not fit */
  z.object({ ...base, ...tile, kind: z.literal("limit"), pattern: Slug }),
]);
export type StudyCard = z.infer<typeof CardSchema>;
export type CardKind = StudyCard["kind"];

/** The lanes a topic shows its cards in, in this order; `case` and `limit` cards render inside their pattern instead. */
export const LANES: { kind: Exclude<CardKind, "case" | "limit">; label: string }[] = [
  { kind: "idea", label: "Big idea" },
  { kind: "example", label: "Worked example" },
  { kind: "contrast", label: "More examples" },
  { kind: "rule", label: "Rules to remember" },
  { kind: "shortcut", label: "Shortcuts & tips" },
  { kind: "trap", label: "Watch out" },
];
export const KIND_LABEL: Record<CardKind, string> = { idea: "Big idea", example: "Worked example", contrast: "Example", rule: "Rule", shortcut: "Shortcut", trap: "Watch out", case: "Pattern", limit: "Not this method" };

export const StudySchema = z.object({
  measure: z.enum(["verbal", "quant"]),
  intro: z.string().min(1),
  /** quick-reference tiles: a plain name, then either the formula (bare TeX, no $) or a short rule (Rich), an optional one-line note (Rich) and an optional drawing; a group may open with a short setup (Rich) and a drawing */
  quickRef: z
    .array(
      z.object({
        title: z.string().min(1),
        intro: z.string().min(1).optional(),
        svg: z.string().startsWith("<svg").optional(),
        items: z
          .array(
            z
              .object({ name: z.string().min(1), tex: z.string().min(1).optional(), text: z.string().min(1).optional(), note: z.string().optional(), svg: z.string().startsWith("<svg").optional() })
              .refine((it) => (it.tex === undefined) !== (it.text === undefined), "a tile has exactly one of tex or text"),
          )
          .min(1),
      }),
    )
    .default([]),
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
      z
        .object({
          id: z.string().regex(/^[a-z0-9-]+$/),
          title: z.string().min(1),
          /** concept (or reading-skill) ids this section teaches; a question counts here if any of its tags is one of them */
          concepts: z.array(z.string()).min(1),
          /** pattern drills: one method in every disguise it shows up in; the disguises are its `case` cards, the look-alikes it does not fit its `limit` cards */
          patterns: z.array(z.object({ id: Slug, title: z.string().min(1), idea: z.string().min(1) })).optional(),
          /** everything the topic teaches, one archivable card each, in file order within each lane (docs/STUDY-GUIDE.md) */
          cards: z.array(CardSchema).min(1),
        })
        .superRefine((s, ctx) => {
          const ids = s.cards.map((c) => c.id);
          for (const id of ids.filter((id, i) => ids.indexOf(id) !== i)) ctx.addIssue({ code: "custom", message: `${s.id}: duplicate card id ${id}` });
          const patterns = new Set((s.patterns ?? []).map((p) => p.id));
          for (const c of s.cards) {
            if (isTile(c) && (c.text === undefined) === (c.tex === undefined)) ctx.addIssue({ code: "custom", message: `${s.id}/${c.id}: a tile has exactly one of text or tex` });
            if ((c.kind === "case" || c.kind === "limit") && !patterns.has(c.pattern)) ctx.addIssue({ code: "custom", message: `${s.id}/${c.id}: unknown pattern ${c.pattern}` });
            if (c.variant && !s.concepts.some((k) => (VARIANTS[k] ?? []).includes(c.variant!))) ctx.addIssue({ code: "custom", message: `${s.id}/${c.id}: variant "${c.variant}" is not a sub-form of ${s.concepts.join(", ")}` });
          }
          for (const p of patterns) if (!s.cards.some((c) => c.kind === "case" && c.pattern === p)) ctx.addIssue({ code: "custom", message: `${s.id}: pattern ${p} has no case card` });
        }),
    )
    .min(1),
});
export type Study = z.infer<typeof StudySchema>;
export type StudySection = Study["sections"][number];
export type StudyPattern = NonNullable<StudySection["patterns"]>[number];

/** Over this, a question counts as a long sink in the pacing summary. */
export const LONG_MS = 180_000;

export interface Miss {
  testId: string;
  attemptId: number;
  /** the item's bank ref, which its review anchor is built from (lib/ref.ts, qAnchor) */
  ref: string;
  qid: string;
  type: SlotType;
  difficulty: number;
  timeMs: number;
  guessed: boolean;
  trap?: string;
  /** the question's sub-form of its primary concept, when the author named one */
  variant?: string;
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
type ResponseRow = { attemptId: number; questionId: string; isCorrect: boolean; timeMs: number; guessed: boolean; reused?: boolean };

const tally = (rows: { ok: boolean; ms: number }[]): Tally => ({
  n: rows.length,
  correct: rows.filter((r) => r.ok).length,
  avgMs: rows.length ? rows.reduce((t, r) => t + r.ms, 0) / rows.length : 0,
});

/**
 * The guide's live numbers: every response of a finished, listed attempt at a test of this measure, grouped by
 * section (via concept tags, primary or secondary), by format, and for pacing. A question tagged with concepts
 * of two sections counts in both. `items` holds the answered questions by ref (built from `tests`' questions when
 * left out); an item a quiz reused (docs/BANK.md) is left out, as it is of the concept stats.
 */
export function studyStats(guide: Study, attempts: AttemptRow[], responses: ResponseRow[], tests: Map<string, Pick<Test, "measure"> & Partial<Pick<Test, "questions">>>, items?: Map<string, Question>): StudyStats {
  const byRef = items ?? new Map([...tests].flatMap(([id, t]) => (t.questions ?? []).map((q) => [`${id}:${q.id}`, q] as const)));
  const done = new Map(attempts.filter((a) => isListed(a) && a.finishedAt && tests.get(a.testId)?.measure === guide.measure).map((a) => [a.id, a]));
  const rows = responses.flatMap((r) => {
    const a = done.get(r.attemptId);
    if (!a || r.reused) return [];
    const q = byRef.get(r.questionId);
    if (!q) return [];
    return [{ a, q, r, ok: r.isCorrect, ms: r.timeMs, concepts: new Set(q.tags.filter((t) => t.kind === "concept").map((t) => t.id)) }];
  });

  const sections = new Map<string, Tally & { misses: Miss[] }>();
  for (const s of guide.sections) {
    const mine = rows.filter((x) => s.concepts.some((c) => x.concepts.has(c)));
    const misses = mine
      .filter((x) => !x.ok)
      .map((x) => ({ testId: x.a.testId, attemptId: x.a.id, ref: x.r.questionId, qid: x.r.questionId.slice(x.r.questionId.indexOf(":") + 1), type: slotType(x.q), difficulty: x.q.difficulty, timeMs: x.ms, guessed: x.r.guessed, trap: x.q.explanation.trap || undefined, ...(x.q.variant ? { variant: x.q.variant } : {}), finishedAt: x.a.finishedAt! }));
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

/** card: a formula-sheet tile; piece: one card of a topic (pieceId); topic: legacy whole-topic marks, which can only be cleared */
export const MARK_KINDS = ["card", "piece", "topic"] as const;
export type MarkKind = (typeof MARK_KINDS)[number];
export type MarkState = "archived" | "deleted";
export interface Mark {
  state: MarkState;
  updatedAt: Date;
}

/** A formula card's mark id: its group and name, which are unique within a guide. */
export const cardId = (group: string, name: string) => `${group} / ${name}`;

/** A topic card's mark id: its topic and its own id. */
export const pieceId = (topicId: string, cardId: string) => `${topicId}/${cardId}`;

/** Every id a guide can mark, by kind. */
export function markIds(guide: Study): Record<MarkKind, Set<string>> {
  return {
    card: new Set(guide.quickRef.flatMap((g) => g.items.map((it) => cardId(g.title, it.name)))),
    piece: new Set(guide.sections.flatMap((s) => s.cards.map((c) => pieceId(s.id, c.id)))),
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

/** YYYY-MM-DD of a moment, in UTC (card `added` dates are plain days). */
const day = (d: Date) => d.toISOString().slice(0, 10);

/**
 * One topic's cards split by the reader's marks. An archived card comes back (`back`) when a mock finished after it
 * was archived misses a question of the same `variant`; cards without a variant stay archived, and `missedSince`
 * says a miss landed after something here was archived, so the reader can look over the shelf. `fresh` names shown
 * cards added on or after the day of the topic's latest archive: material written after the reader studied it.
 */
export function topicCards(s: StudySection, marks: Map<string, Mark>, misses: Miss[]) {
  const split = applyMarks(s.cards, (c) => pieceId(s.id, c.id), marks, (c, since) =>
    !!c.variant && misses.some((m) => m.variant === c.variant && m.finishedAt > since));
  const archivedAt = s.cards.flatMap((c) => {
    const m = marks.get(pieceId(s.id, c.id));
    return m?.state === "archived" ? [m.updatedAt] : [];
  });
  const latest = archivedAt.length ? day(new Date(Math.max(...archivedAt.map((d) => +d)))) : null;
  const fresh = new Set(latest ? split.shown.filter((c) => c.added && c.added >= latest).map((c) => c.id) : []);
  const missedSince = archivedAt.some((at) => misses.some((m) => m.finishedAt > at));
  return { ...split, back: new Set([...split.back].map((k) => k.slice(s.id.length + 1))), fresh, missedSince };
}
