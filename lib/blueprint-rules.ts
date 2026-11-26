// The rules a whole mock must meet (docs/QUIZ-AUTHORING.md, Structure rules), apart from any one item: section
// difficulty, the cap on items above official hard, the blueprint's type counts, the opening TC / QC block and the
// passage layout. Pure, so `validate` checks an authored mock with them and quiz assembly (lib/assemble) checks a
// layout it builds from the bank. Per-item rules stay in scripts/validate-test.ts.
import { splitSentences } from "./sentences";
import { slotType, type SlotType } from "./qtypes";
import type { Question, Test } from "./types";

export type Rated = Pick<Question, "section" | "difficulty">;

/** At most this many items per section may sit above official hard difficulty (levels 6-7, docs/CALIBRATION.md). */
export const TOP_CAP = 2;
/** Raw quant solver rating from which an item usually calibrates to level 6+ (scripts/blind-test.ts). */
export const TOP_RATING = 4;
/** Minimum 3-blank TCs of 3-5 sentences, and minimum blanks whose choices are all phrases, per verbal test. */
export const LONG_TC3_MIN = 2;
export const PHRASE_BLANKS_MIN = 3;
/** At most this many reading passages (not arguments) may run past one paragraph. */
export const MULTI_PARA_MAX = 2;
/** A reading choice that opens with a short label and a colon. */
export const LABEL_CHOICE = /^[A-Za-z][\w'-]*(?:,? [\w'-]+){0,4}:\s/;

/** True when every choice of a TC blank is a multi-word phrase ("at odds with", "a perfunctory"). */
export const isPhraseBlank = (choices: string[]) => choices.every((c) => /\s/.test(c.trim()));

/** A 3-blank TC written as a short passage (3-5 sentences). */
export const isLongTc3 = (q: Pick<Question, "type" | "blanks" | "prompt">) => q.type === "tc" && q.blanks?.length === 3 && splitSentences(q.prompt).length >= 3;

export type Blueprint = {
  sections: { n: 1 | 2; minutes: number; slots: { type: string; level: number }[] }[];
  passages?: Record<string, { questions: number; paragraphs?: string }[]>;
};

/** The section difficulty rules, one entry per rule, each with whether it passes. */
export function difficultyRules(questions: Rated[]) {
  const out: { rule: string; ok: boolean }[] = [];
  for (const n of [1, 2] as const) {
    const qs = questions.filter((q) => q.section === n);
    if (!qs.length) continue;
    const avg = qs.reduce((a, q) => a + q.difficulty, 0) / qs.length;
    const top = qs.filter((q) => q.difficulty >= 6).length;
    if (top) out.push({ rule: `S${n} L6+ ${top} (<=${TOP_CAP})`, ok: top <= TOP_CAP });
    if (n === 1) out.push({ rule: `S1 avg ${avg.toFixed(2)} (>=3.75)`, ok: avg >= 3.75 });
    else {
      const l3 = qs.filter((q) => q.difficulty <= 3).length;
      const l5 = qs.filter((q) => q.difficulty >= 5).length;
      out.push({ rule: `S2 avg ${avg.toFixed(2)} (>=4.2)`, ok: avg >= 4.2 });
      out.push({ rule: `S2 L3 ${l3} (<=2)`, ok: l3 <= 2 });
      out.push({ rule: `S2 L5 ${l5} (>=${Math.ceil(qs.length / 3)})`, ok: l5 >= qs.length / 3 });
    }
  }
  return out;
}

/** One line for the author: `S1 avg 3.83 (>=3.75) ✓ · S2 avg 4.27 (>=4.2) ✓ · ...` */
export const difficultyLine = (questions: Rated[]) => difficultyRules(questions).map((r) => `${r.rule} ${r.ok ? "✓" : "✗"}`).join(" · ");

/**
 * The top tier of a section: items the blind solver rated TOP_RATING+ (bank batches record `solverRating`), or, for
 * an item without a rating (the mocks, whose ratings sit in the gitignored .blind/), a level of 6 or more.
 */
export const isTopTier = (q: Pick<Question, "difficulty" | "solverRating">) => (q.solverRating !== undefined ? q.solverRating >= TOP_RATING : q.difficulty >= 6);

/** Quant: at most TOP_CAP top-tier items per section, or the section overshoots the real GRE (docs/CALIBRATION.md). */
export function topTierRules(questions: Pick<Question, "id" | "section" | "difficulty" | "solverRating">[]): string[] {
  const out: string[] = [];
  for (const n of [1, 2] as const) {
    const top = questions.filter((q) => q.section === n && isTopTier(q));
    if (top.length > TOP_CAP) out.push(`S${n}: ${top.length} top-tier items (${top.map((q) => q.id).join(", ")}), cap ${TOP_CAP}`);
  }
  return out;
}

/** A question as the blueprint counts it: a DI set item is "di" whatever its format. */
export const blueprintType = (q: Pick<Question, "type" | "blanks" | "subtype" | "setId">): SlotType => (q.setId ? "di" : slotType(q));

/** Per section: the question count and the count of each blueprint type against the blueprint's slots. */
export function typeCountRules(questions: Pick<Question, "section" | "type" | "blanks" | "subtype" | "setId">[], blueprint: Blueprint): string[] {
  const out: string[] = [];
  for (const sec of blueprint.sections) {
    const qs = questions.filter((q) => q.section === sec.n);
    if (qs.length !== sec.slots.length) out.push(`section ${sec.n}: ${qs.length} questions, blueprint wants ${sec.slots.length}`);
    const want: Record<string, number> = {};
    const got: Record<string, number> = {};
    sec.slots.forEach((s) => (want[s.type] = (want[s.type] ?? 0) + 1));
    qs.forEach((q) => (got[blueprintType(q)] = (got[blueprintType(q)] ?? 0) + 1));
    for (const t of new Set([...Object.keys(want), ...Object.keys(got)])) if ((want[t] ?? 0) !== (got[t] ?? 0)) out.push(`section ${sec.n}: type ${t} x${got[t] ?? 0}, blueprint wants x${want[t] ?? 0}`);
  }
  return out;
}

/** TC (verbal) / QC (quant) items open each section, as one block. `questions` are in display order. */
export function openingBlockRules(questions: Pick<Question, "section" | "type">[], measure: "verbal" | "quant"): string[] {
  const out: string[] = [];
  const lead = measure === "verbal" ? "tc" : "qc";
  for (const n of [1, 2] as const) {
    const qs = questions.filter((q) => q.section === n);
    const firstNon = qs.findIndex((q) => q.type !== lead);
    if (qs.slice(firstNon === -1 ? qs.length : firstNon).some((q) => q.type === lead)) out.push(`section ${n}: ${lead} items must form the opening block`);
    if (qs[0] && qs[0].type !== lead) out.push(`section ${n} must open with a ${lead} item`);
  }
  return out;
}

/**
 * The passage layout of a verbal mock: at most MULTI_PARA_MAX multi-paragraph reading passages, the blueprint's
 * passage shapes per section (`shapes`, off for a layout built from bank units, which may split a section's reading
 * questions differently), enough long 3-blank TCs and phrase blanks, and a select-all key count other than always two.
 */
export function verbalLayoutRules(test: Pick<Test, "questions" | "passages">, blueprint: Blueprint, shapes = true): string[] {
  const out: string[] = [];
  const reading = test.passages.filter((p) => test.questions.some((q) => q.passageId === p.id && q.subtype !== "arg"));
  const multi = reading.filter((p) => p.paragraphs.length > 1);
  if (multi.length > MULTI_PARA_MAX) out.push(`${multi.length} reading passages run past one paragraph (${multi.map((p) => p.id).join(", ")}); at most ${MULTI_PARA_MAX}, as on the real test: make the others one paragraph`);
  for (const n of shapes ? ([1, 2] as const) : []) {
    const want = blueprint.passages?.[String(n)] ?? [];
    const order: string[] = [];
    for (const q of test.questions) if (q.section === n && q.passageId && q.subtype !== "arg" && !order.includes(q.passageId)) order.push(q.passageId);
    const sizes = order.map((id) => test.questions.filter((q) => q.passageId === id).length);
    if (sizes.join(",") !== want.map((w) => w.questions).join(","))
      out.push(`section ${n}: passages carry ${sizes.join(" + ") || "no"} questions, blueprint wants ${want.map((w) => w.questions).join(" + ")} (in slot order)`);
    else
      order.forEach((id, i) => {
        const [lo, hi = lo] = (want[i].paragraphs ?? "1-9").split("-").map(Number);
        const k = test.passages.find((p) => p.id === id)!.paragraphs.length;
        if (k < lo || k > hi) out.push(`passage ${id}: ${k} paragraph(s), blueprint wants ${want[i].paragraphs}`);
      });
  }
  const tc = test.questions.filter((q) => q.type === "tc");
  const long = tc.filter(isLongTc3).length;
  if (long < LONG_TC3_MIN) out.push(`only ${long} 3-blank TC(s) of 3-5 sentences; write at least ${LONG_TC3_MIN} as short passages whose deciding clue sits a sentence away from the blank (docs/HARD-PATTERNS.md)`);
  const phrase = tc.flatMap((q) => q.blanks ?? []).filter(isPhraseBlank).length;
  if (phrase < PHRASE_BLANKS_MIN) out.push(`${phrase} TC blank(s) with phrase choices; at least ${PHRASE_BLANKS_MIN} of the 15 blanks need all-phrase choices ("at odds with", "a perfunctory", noun phrases), each holding its key word`);
  const multiKeys = test.questions.filter((q) => q.type === "rc_multi").map((q) => ("sel" in q.key ? q.key.sel.length : 0));
  if (multiKeys.length && multiKeys.every((k) => k === 2)) out.push(`every rc_multi has 2 keys; official select-all items have 1, 2 or 3 correct answers about 40/40/20: use the key counts the brief's slot table gives`);
  return out;
}

/**
 * Verbal rules each item meets on its own: a TC blank's choices are all phrases or all single words, an arg-role
 * item sets its portions in **bold** (`argBold`), and no reading choice opens with a summary label (`noLabels`).
 */
export function verbalItemRules(test: Pick<Test, "questions" | "passages">, opts: { argBold: boolean; noLabels: boolean }): string[] {
  const out: string[] = [];
  for (const q of test.questions.filter((x) => x.type === "tc"))
    (q.blanks ?? []).forEach((b, i) => {
      if (!isPhraseBlank(b) && b.some((c) => /\s/.test(c.trim()))) out.push(`${q.id}: blank ${i + 1} mixes phrases and single words; make all three choices the same form`);
    });
  if (opts.argBold)
    for (const q of test.questions.filter((x) => x.tags.some((t) => t.kind === "concept" && t.id === "arg-role" && t.role === "primary"))) {
      const text = test.passages.find((p) => p.id === q.passageId)?.paragraphs.join(" ") ?? "";
      const spans = text.match(/\*\*[^*]+\*\*/g) ?? [];
      // a bold span split across two sentences would lose its markers when the runner renders sentence by sentence
      const split = spans.filter((b) => splitSentences(b.slice(2, -2)).length > 1);
      if (spans.length < 1 || spans.length > 2 || !/boldface/i.test(q.prompt))
        out.push(`${q.id} (arg-role): set the 1-2 portions in **bold** in the argument and ask about "the portions in boldface", as on the real test (found ${spans.length} bold span(s))`);
      else if (split.length) out.push(`${q.id} (arg-role): a bold portion spans two sentences; bold one sentence or clause at a time`);
    }
  if (opts.noLabels)
    for (const q of test.questions.filter((x) => x.type.startsWith("rc"))) {
      const labelled = (q.choices ?? []).filter((c) => LABEL_CHOICE.test(c));
      if (labelled.length) out.push(`${q.id}: ${labelled.length} choice(s) open with a summary label ("${labelled[0].split(":")[0]}: …"); write each choice as a bare phrase or a full sentence, as the real test does`);
    }
  return out;
}
