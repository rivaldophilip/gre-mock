// Validate a test file before it is registered.  usage: npm run -s validate -- verbal-001
// The checks are also exported for `npm run check` (the authoring loop) and `npm run register` (the gate).
import fs from "node:fs";
import path from "node:path";
import { TestSchema, type Question, type Test } from "../lib/types";
import { passageSentences, splitSentences } from "../lib/sentences";
import { parseNumber } from "../lib/scoring";
import { containment, MIN_SHINGLES, SETUP_TH, shingles } from "../lib/ngram";
import { measureTests, pastItems, primaryOf, setupOverlap, setupText } from "../lib/setup-history";
import { REVISIT_MAX } from "../lib/priority/revisit";
import { choiceIsWord } from "../lib/vocab-match";
import { readTestFile } from "./lib/test-file";

type Rated = Pick<Question, "section" | "difficulty">;

/** At most this many items per section may sit above official hard difficulty (levels 6-7, docs/CALIBRATION.md). */
export const TOP_CAP = 2;

/** Verbal tests from this number on follow the official-format rules in verbalFormatRules (earlier tests predate them). */
export const VERBAL_FORMAT_FROM = 15;
/** Quant tests from this number on carry a `setup` and `variant` on every question (earlier ones were backfilled). */
export const QUANT_SETUP_FROM = 11;
/** Tests from these numbers on must not reuse an earlier setup (quant) or an earlier item's company (verbal); earlier ones were taken first. */
export const NOVELTY_FROM = { quant: 7, verbal: 8 } as const;
/** Minimum 3-blank TCs of 3-5 sentences, and minimum blanks whose choices are all phrases, per verbal test. */
export const LONG_TC3_MIN = 2;
export const PHRASE_BLANKS_MIN = 3;
/** At most this many reading passages (not arguments) may run past one paragraph. */
export const MULTI_PARA_MAX = 2;

/** True when every choice of a TC blank is a multi-word phrase ("at odds with", "a perfunctory"). */
export const isPhraseBlank = (choices: string[]) => choices.every((c) => /\s/.test(c.trim()));

/**
 * The official-format rules for verbal (docs/QUIZ-AUTHORING.md, Structure rules): passage shapes from the blueprint,
 * TC length and phrase blanks, and a select-all key count other than the habitual two.
 */
export function verbalFormatRules(test: Test, blueprint: { passages?: Record<string, { questions: number; paragraphs?: string }[]> }): string[] {
  const out: string[] = [];
  const reading = test.passages.filter((p) => test.questions.some((q) => q.passageId === p.id && q.subtype !== "arg"));
  const multi = reading.filter((p) => p.paragraphs.length > 1);
  if (multi.length > MULTI_PARA_MAX) out.push(`${multi.length} reading passages run past one paragraph (${multi.map((p) => p.id).join(", ")}); at most ${MULTI_PARA_MAX}, as on the real test: make the others one paragraph`);
  for (const n of [1, 2] as const) {
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
  const long = tc.filter((q) => q.blanks?.length === 3 && splitSentences(q.prompt).length >= 3).length;
  if (long < LONG_TC3_MIN) out.push(`only ${long} 3-blank TC(s) of 3-5 sentences; write at least ${LONG_TC3_MIN} as short passages whose deciding clue sits a sentence away from the blank (docs/HARD-PATTERNS.md)`);
  const blanks = tc.flatMap((q) => (q.blanks ?? []).map((b, i) => ({ q, b, i })));
  for (const { q, b, i } of blanks) if (!isPhraseBlank(b) && b.some((c) => /\s/.test(c.trim()))) out.push(`${q.id}: blank ${i + 1} mixes phrases and single words; make all three choices the same form`);
  const phrase = blanks.filter((x) => isPhraseBlank(x.b)).length;
  if (phrase < PHRASE_BLANKS_MIN) out.push(`${phrase} TC blank(s) with phrase choices; at least ${PHRASE_BLANKS_MIN} of the 15 blanks need all-phrase choices ("at odds with", "a perfunctory", noun phrases), each holding its key word`);
  const multiKeys = test.questions.filter((q) => q.type === "rc_multi").map((q) => ("sel" in q.key ? q.key.sel.length : 0));
  if (multiKeys.length && multiKeys.every((k) => k === 2)) out.push(`every rc_multi has 2 keys; official select-all items have 1, 2 or 3 correct answers about 40/40/20: use the key counts the brief's slot table gives`);
  return out;
}

/** The section difficulty rules (docs/QUIZ-AUTHORING.md), one entry per rule, each with whether it passes. */
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

/** A zod path like questions.3.blanks, named by the question the author wrote: `s1q4 (tc).blanks`. */
function schemaWhere(raw: unknown, p: PropertyKey[]): string {
  const r = raw as { questions?: { id?: string; type?: string }[]; passages?: { id?: string }[] };
  const [head, i, ...rest] = p;
  if (head === "questions" && typeof i === "number") {
    const q = r.questions?.[i];
    return [`${q?.id ?? `question #${i + 1}`}${q?.type ? ` (${q.type})` : ""}`, ...rest].join(".");
  }
  if (head === "passages" && typeof i === "number") return [`passage ${r.passages?.[i]?.id ?? `#${i + 1}`}`, ...rest].join(".");
  return p.join(".") || "(test)";
}

/**
 * Setup reuse against earlier tests of the measure (lower numbers, so the first use of a setup stays and later copies
 * are flagged): an item whose masked stem matches an earlier item of the same primary concept is an error, and a
 * variant already used twice for that concept is a warning.
 */
export function sameSetups(test: Test, dir = "content/tests"): { error: boolean; message: string }[] {
  if (test.measure !== "quant" || Number(/-(\d+)$/.exec(test.id)?.[1] ?? 0) < NOVELTY_FROM.quant) return [];
  const earlier = pastItems(test.measure, test.id, dir);
  const out: { error: boolean; message: string }[] = [];
  for (const q of test.questions) {
    const c = primaryOf(q);
    if (!c) continue;
    const same = earlier.filter((e) => e.concept === c);
    for (const e of same) {
      const share = setupOverlap(setupText(q), e.text);
      if (share >= SETUP_TH)
        out.push({
          error: true,
          message: q.revisits === `${e.testId}:${e.qid}`
            ? `${q.id}: revisits ${e.testId} ${e.qid} but keeps its setup (${Math.round(share * 100)}% skeleton overlap); a sibling keeps the insight and changes the structure (the brief names the change)`
            : `${q.id}: same setup as ${e.testId} ${e.qid} (${c}, ${Math.round(share * 100)}% skeleton overlap); new numbers or names are not a new item, use a setup the brief does not list`,
        });
    }
    // a revisit shares its earlier item's form on purpose
    const reused = q.variant && !q.revisits ? same.filter((e) => e.variant === q.variant).length : 0;
    if (reused >= 2) out.push({ error: false, message: `${q.id}: variant "${q.variant}" of ${c} is already in ${reused} earlier items; prefer the brief's variant` });
  }
  return out;
}

/**
 * Revisit links (docs/PRIORITY.md): each names an item of an earlier test of the measure that shares the question's
 * primary concept (quant) or a key word (verbal), and a test holds at most REVISIT_MAX of them.
 */
export function revisitRules(test: Test, dir = "content/tests"): string[] {
  const out: string[] = [];
  const no = (tid: string) => Number(/-(\d+)$/.exec(tid)?.[1] ?? 0);
  const earlier = new Map(measureTests(test.measure, dir).filter((t) => no(t.id) < no(test.id)).flatMap((t) => t.questions.map((q): [string, Question] => [`${t.id}:${q.id}`, q])));
  const keys = (q: Question) => q.tags.filter((t) => t.kind === "word" && t.role === "key").map((t) => t.id);
  const links = test.questions.filter((q) => q.revisits);
  if (links.length > REVISIT_MAX) out.push(`${links.length} revisits; at most ${REVISIT_MAX} per test, every other item must be new`);
  for (const q of links) {
    const e = earlier.get(q.revisits!);
    if (!e) out.push(`${q.id}: revisits ${q.revisits}, which is not an item of an earlier ${test.measure} test`);
    else if (test.measure === "quant" && primaryOf(e) !== primaryOf(q)) out.push(`${q.id}: revisits ${q.revisits} (${primaryOf(e)}) but tests ${primaryOf(q)}; a revisit keeps the concept`);
    else if (test.measure === "verbal" && !keys(q).some((k) => keys(e).includes(k))) out.push(`${q.id}: revisits ${q.revisits} but shares no key word with it`);
  }
  return out;
}

/**
 * Verbal: a key word may come back, its company may not. A TC or SE item that shares a key word with an earlier TC or
 * SE item must not reuse any of that item's distractor words, and an SE item must not repeat its key pair.
 */
export function wordReuse(test: Test, dir = "content/tests"): string[] {
  if (test.measure !== "verbal" || Number(/-(\d+)$/.exec(test.id)?.[1] ?? 0) < NOVELTY_FROM.verbal) return [];
  const no = (tid: string) => Number(/-(\d+)$/.exec(tid)?.[1] ?? 0);
  const words = (q: Question, role: string) => q.tags.filter((t) => t.kind === "word" && t.role === role).map((t) => t.id);
  const earlier = measureTests("verbal", dir)
    .filter((t) => no(t.id) < no(test.id))
    .flatMap((t) => t.questions.filter((q) => q.type === "tc" || q.type === "se").map((q) => ({ ref: `${t.id} ${q.id}`, q })));
  const out: string[] = [];
  for (const q of test.questions.filter((x) => x.type === "tc" || x.type === "se")) {
    const mine = words(q, "key");
    for (const e of earlier) {
      const shared = mine.filter((k) => words(e.q, "key").includes(k));
      if (!shared.length) continue;
      const sameD = words(q, "distractor").filter((d) => words(e.q, "distractor").includes(d));
      if (sameD.length) out.push(`${q.id}: shares key ${shared.join(", ")} with ${e.ref} and also its distractor${sameD.length > 1 ? "s" : ""} ${sameD.join(", ")}; give the returning word new distractors`);
      if (q.type === "se" && e.q.type === "se" && mine.length === 2 && mine.every((k) => words(e.q, "key").includes(k)))
        out.push(`${q.id}: repeats the SE key pair ${mine.join(" / ")} of ${e.ref}; pair the word with a different synonym`);
    }
  }
  return out;
}

export type Validation = { errors: string[]; warns: string[]; test?: Test; schemaFailed?: boolean };

export function validateTest(raw: unknown, id: string): Validation {
  const errors: string[] = [];
  const warns: string[] = [];
  const err = (m: string) => errors.push(m);

  const parsed = TestSchema.safeParse(raw);
  if (!parsed.success) {
    const hint = "field shapes per type: docs/QUIZ-AUTHORING.md, Shapes";
    return { errors: [...parsed.error.issues.map((i) => `${schemaWhere(raw, i.path)}: ${i.message}`), hint], warns, schemaFailed: true };
  }
  const test: Test = parsed.data;
  if (test.id !== id) err(`id mismatch: file ${id}, test.id ${test.id}`);

  const blueprint = JSON.parse(fs.readFileSync("data/blueprints.json", "utf8"))[test.measure];
  const vocab = new Map((JSON.parse(fs.readFileSync("data/vocab.json", "utf8")) as { id: string; lemma: string; variants: string[] }[]).map((v) => [v.id, v]));
  const concepts = new Set((JSON.parse(fs.readFileSync("data/concepts.json", "utf8")) as { id: string }[]).map((c) => c.id));
  const skills = new Map((JSON.parse(fs.readFileSync("data/rc_skills.json", "utf8")) as { id: string; area: string }[]).map((c) => [c.id, c.area]));

  const testNo = (tid: string) => Number(/-(\d+)$/.exec(tid)?.[1] ?? 0);
  const formatRules = test.measure === "verbal" && testNo(test.id) >= VERBAL_FORMAT_FROM;
  const setupRules = test.measure === "quant" && testNo(test.id) >= QUANT_SETUP_FROM;
  const variants = JSON.parse(fs.readFileSync("data/concept_variants.json", "utf8")) as Record<string, string[]>;
  const slotType = (q: Question) => (q.type === "tc" ? `tc${q.blanks?.length}` : q.subtype === "arg" ? "arg" : q.type === "numeric" || q.type === "mc" || q.type === "mc_multi" || q.type === "qc" ? q.type : q.setId ? "di" : q.type);
  const typeOf = (q: Question) => (q.setId ? "di" : slotType(q));

  // ---- blueprint: counts per section, types, difficulty mix
  const ids = new Set<string>();
  for (const q of test.questions) {
    if (ids.has(q.id)) err(`duplicate question id ${q.id}`);
    ids.add(q.id);
  }
  for (const sec of blueprint.sections as { n: 1 | 2; slots: { type: string; level: number }[] }[]) {
    const qs = test.questions.filter((q) => q.section === sec.n);
    if (qs.length !== sec.slots.length) err(`section ${sec.n}: ${qs.length} questions, blueprint wants ${sec.slots.length}`);
    const want: Record<string, number> = {};
    const got: Record<string, number> = {};
    sec.slots.forEach((s) => (want[s.type] = (want[s.type] ?? 0) + 1));
    qs.forEach((q) => (got[typeOf(q)] = (got[typeOf(q)] ?? 0) + 1));
    for (const t of new Set([...Object.keys(want), ...Object.keys(got)])) if ((want[t] ?? 0) !== (got[t] ?? 0)) err(`section ${sec.n}: type ${t} x${got[t] ?? 0}, blueprint wants x${want[t] ?? 0}`);
  }
  for (const r of difficultyRules(test.questions))
    if (!r.ok)
      err(`difficulty: ${r.rule} fails; ${r.rule.includes("L6+") ? "ease the extra items to official-L5 difficulty and re-rate them, see docs/CALIBRATION.md" : "raise levels honestly (harder items), see docs/HARD-PATTERNS.md"}`);
  // block order: TC (verbal) / QC (quant) must open each section
  for (const n of [1, 2] as const) {
    const qs = test.questions.filter((q) => q.section === n);
    const lead = test.measure === "verbal" ? "tc" : "qc";
    const firstNon = qs.findIndex((q) => q.type !== lead);
    if (qs.slice(firstNon === -1 ? qs.length : firstNon).some((q) => q.type === lead)) err(`section ${n}: ${lead} items must form the opening block`);
    if (qs[0] && qs[0].type !== lead) err(`section ${n} must open with a ${lead} item`);
  }
  if (test.measure === "quant") {
    const di = test.questions.filter((q) => q.setId);
    if (new Set(di.map((q) => q.setId)).size !== 1 || di.length !== 3) err("quant needs exactly one data-interpretation set of 3 questions");
    for (const q of di) if (!q.figureId) err(`${q.id}: DI question needs figureId`);
  }

  // ---- per-question structure
  const slugOk = (s: string) => /^[a-z0-9-]+$/.test(s);
  for (const q of test.questions) {
    const where = `${q.id} (${q.type})`;
    const isSel = "sel" in q.key;
    const sel = isSel ? (q.key as { sel: number[] }).sel : [];
    const measureTypes = test.measure === "verbal" ? ["tc", "se", "rc", "rc_multi", "rc_select"] : ["qc", "mc", "mc_multi", "numeric"];
    if (!measureTypes.includes(q.type)) err(`${where}: type not allowed in ${test.measure} test`);
    switch (q.type) {
      case "tc": {
        const b = q.blanks ?? [];
        if (![1, 2, 3].includes(b.length)) err(`${where}: tc needs 1-3 blanks`);
        b.forEach((c, i) => c.length !== (b.length === 1 ? 5 : 3) && err(`${where}: blank ${i + 1} has ${c.length} choices, expected ${b.length === 1 ? 5 : 3}`));
        if ((q.prompt.match(/___/g) ?? []).length !== b.length) err(`${where}: prompt has ${(q.prompt.match(/___/g) ?? []).length} blank markers, ${b.length} blanks`);
        if (b.length === 1 && /\(i\)\s*___/.test(q.prompt)) err(`${where}: a single blank is a plain ___, not "(i) ___"`);
        if (sel.length !== b.length || sel.some((k, i) => !(k >= 0 && k < (b[i]?.length ?? 0)))) err(`${where}: bad tc key`);
        break;
      }
      case "se":
        if (q.choices?.length !== 6) err(`${where}: se needs 6 choices`);
        if (sel.length !== 2 || new Set(sel).size !== 2) err(`${where}: se needs 2 distinct keys`);
        if (!/___/.test(q.prompt)) err(`${where}: se prompt needs a ___ blank`);
        break;
      case "rc":
        if (q.choices?.length !== 5) err(`${where}: rc needs 5 choices`);
        if (sel.length !== 1) err(`${where}: rc needs 1 key`);
        break;
      case "rc_multi":
        if (q.choices?.length !== 3) err(`${where}: rc_multi needs 3 choices`);
        if (sel.length < 1) err(`${where}: rc_multi needs >=1 key`);
        break;
      case "rc_select": {
        const p = test.passages.find((x) => x.id === q.passageId);
        if (!p) err(`${where}: rc_select needs a passage`);
        else if (sel.length !== 1 || sel[0] >= passageSentences(p.paragraphs).length) err(`${where}: key sentence index out of range`);
        else if (q.paras) {
          if (q.paras.some((i) => i >= p.paragraphs.length)) err(`${where}: paras ${JSON.stringify(q.paras)} names a paragraph the passage lacks (0-based)`);
          else if (!q.paras.includes(passageSentences(p.paragraphs)[sel[0]].para)) err(`${where}: key sentence lies outside paras ${JSON.stringify(q.paras)}`);
        } else if (formatRules && p.paragraphs.length > 1) err(`${where}: on a multi-paragraph passage, set "paras" to the 1-2 paragraphs (0-based) the sentence is picked from`);
        break;
      }
      case "qc":
        if (!q.qc) err(`${where}: qc needs {a,b}`);
        if (sel.length !== 1 || sel[0] > 3) err(`${where}: qc key must be 0-3`);
        break;
      case "mc":
        if ((q.choices?.length ?? 0) < 4 || (q.choices?.length ?? 0) > 5) err(`${where}: mc needs 4-5 choices`);
        if (sel.length !== 1) err(`${where}: mc needs 1 key`);
        break;
      case "mc_multi":
        if ((q.choices?.length ?? 0) < 4) err(`${where}: mc_multi needs >=4 choices`);
        if (sel.length < 1) err(`${where}: mc_multi needs >=1 key`);
        break;
      case "numeric":
        if (!q.numeric) err(`${where}: numeric needs {kind}`);
        if (!("value" in q.key) || !Number.isFinite(parseNumber(q.key.value))) err(`${where}: numeric key is not a number`);
        break;
    }
    if (q.choices && isSel && sel.some((k) => k >= q.choices!.length)) err(`${where}: key index out of range`);
    if (q.passageId && !test.passages.some((p) => p.id === q.passageId)) err(`${where}: unknown passage ${q.passageId}`);
    if (q.figureId && !test.figures.some((f) => f.id === q.figureId)) err(`${where}: unknown figure ${q.figureId}`);
    if (q.type.startsWith("rc") && !q.passageId) err(`${where}: rc needs a passageId`);
    if (test.measure === "quant" && !(q.explanation.steps?.length)) err(`${where}: quant needs explanation.steps`);
    if (test.measure === "verbal" && q.type !== "rc_select") {
      const wrong = (q.type === "tc" ? q.blanks!.flatMap((b, i) => b.filter((_, j) => j !== sel[i])) : (q.choices ?? []).filter((_, j) => !sel.includes(j)));
      const missing = wrong.filter((c) => !(q.explanation.distractors && c in q.explanation.distractors));
      if (missing.length && ["tc", "se"].includes(q.type)) warns.push(`${where}: no distractor explanation for ${missing.join(", ")}`);
    }

    // ---- tags
    const kind = test.measure === "verbal" ? "word" : "concept";
    const passageHasTags = !!q.passageId && (test.passages.find((p) => p.id === q.passageId)?.tags.length ?? 0) > 0;
    if (!q.tags.length && !passageHasTags) err(`${where}: no tags`);
    for (const t of q.tags) {
      if (t.kind === "word") {
        const v = vocab.get(t.id);
        if (!v) {
          err(`${where}: word tag "${t.id}" is not in data/vocab.json`);
          continue;
        }
        if (t.at && (q.type === "tc" || q.type === "se")) {
          const text = (q.type === "tc" ? q.blanks?.[t.at[0]]?.[t.at[1]] : q.choices?.[t.at[0]])?.toLowerCase().trim();
          if (!text || !choiceIsWord(text, v)) err(`${where}: tag ${t.id} at [${t.at}] points to "${text}"`);
          const isKey = q.type === "tc" ? sel[t.at[0]] === t.at[1] : sel.includes(t.at[0]);
          if (t.role === "key" && !isKey) err(`${where}: tag ${t.id} marked key but sits on a wrong choice`);
          if (t.role === "distractor" && isKey) err(`${where}: tag ${t.id} marked distractor but sits on a key`);
        } else if ((t.role === "key" || t.role === "distractor") && (q.type === "tc" || q.type === "se")) err(`${where}: tag ${t.id} needs "at"`);
      } else if (test.measure === "quant" ? !concepts.has(t.id) : !skills.has(t.id)) {
        err(`${where}: concept tag "${t.id}" not in ${test.measure === "quant" ? "data/concepts.json" : "data/rc_skills.json"}`);
      }
      if (!slugOk(t.id)) err(`${where}: bad tag id ${t.id}`);
      if (kind === "word" && t.kind !== "word" && !q.type.startsWith("rc")) err(`${where}: skill tags belong on reading items only`);
    }
    if (test.measure === "verbal" && (q.type === "tc" || q.type === "se")) {
      const keyAts = q.type === "tc" ? sel.map((k, i) => `${i},${k}`) : sel.map((k) => `${k}`);
      for (const ka of keyAts) if (!q.tags.some((t) => t.role === "key" && t.at?.join(",") === ka)) err(`${where}: key choice [${ka}] has no word tag (npm run -s check tags it)`);
    }
    if (test.measure === "quant" && !q.tags.some((t) => t.kind === "concept" && t.role === "primary")) err(`${where}: needs a primary concept tag`);
    if (test.measure === "quant") {
      const primary = q.tags.find((t) => t.kind === "concept" && t.role === "primary")?.id;
      const options = primary ? variants[primary] ?? [] : [];
      if (setupRules && !q.setup) err(`${where}: needs "setup", the setup in one abstract line (no numbers or story)`);
      if (setupRules && options.length && !q.variant) err(`${where}: needs "variant", one of ${primary}'s variants in data/concept_variants.json (the brief names the slot's)`);
      if (q.variant && !options.includes(q.variant)) err(`${where}: variant "${q.variant}" is not one of ${primary}'s in data/concept_variants.json`);
    }
    if (q.type.startsWith("rc")) {
      // every reading question names the skill it tests; argument items test an argument skill
      const primaries = q.tags.filter((t) => t.kind === "concept" && t.role === "primary");
      if (primaries.length !== 1) err(`${where}: needs exactly one primary skill tag (data/rc_skills.json)`);
      else if (q.subtype === "arg" && skills.get(primaries[0].id) !== "argument") err(`${where}: argument item needs an arg-* primary skill`);
    }
  }
  for (const p of test.passages) for (const t of p.tags) if (t.kind === "word" && !vocab.has(t.id)) err(`passage ${p.id}: word tag "${t.id}" not in vocab`);
  for (const q of test.questions)
    if (q.type === "tc" && splitSentences(q.prompt).length > 5) err(`${q.id} (tc): ${splitSentences(q.prompt).length} sentences; a TC passage has 1-5`);
  if (formatRules) for (const m of verbalFormatRules(test, blueprint)) err(`format: ${m}`);

  // ---- placeholders
  const all = JSON.stringify(raw);
  for (const m of all.matchAll(/TODO|TBD|FIXME|lorem ipsum|XXX|\?\?\?|\[\.\.\.\]/gi)) err(`placeholder text: ${m[0]}`);

  // ---- originality: earlier tests and the local official corpus
  function textOf(q: Question) {
    const p = q.passageId ? test.passages.find((x) => x.id === q.passageId)?.paragraphs.join(" ") ?? "" : "";
    return [q.prompt, p, q.qc ? `${q.qc.a} ${q.qc.b} ${q.qc.info ?? ""}` : "", (q.choices ?? []).join(" ")].join(" ");
  }
  const mine = test.questions.map((q) => ({ q, sh: shingles(textOf(q)) }));
  const TH = 0.25;
  // one error per overlapping source, listing our items: questions on one passage all overlap together
  const overlaps = new Map<string, Set<string>>();
  const overlap = (source: string, where: string) => overlaps.set(source, (overlaps.get(source) ?? new Set()).add(where));
  for (const f of fs.readdirSync("content/tests").filter((f) => f.endsWith(".json") && f !== `${id}.json`)) {
    const other = TestSchema.safeParse(JSON.parse(fs.readFileSync(path.join("content/tests", f), "utf8")));
    if (!other.success) continue;
    for (const oq of other.data.questions) {
      const osh = shingles([oq.prompt, oq.passageId ? other.data.passages.find((p) => p.id === oq.passageId)?.paragraphs.join(" ") : "", (oq.choices ?? []).join(" ")].join(" "));
      for (const m of mine) if (m.sh.size >= MIN_SHINGLES && containment(m.sh, osh) > TH) overlap(`earlier test ${f}`, m.q.id);
    }
  }
  const REF = path.resolve("../books/extracted/reference/items.jsonl");
  if (fs.existsSync(REF)) {
    const refs = fs.readFileSync(REF, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as Record<string, unknown>);
    const refSh = refs.map((r) => ({ id: String(r.id), sh: shingles([r.stem, r.text, JSON.stringify(r.choices ?? "")].filter(Boolean).join(" ")) }));
    for (const m of mine) for (const r of refSh) if (m.sh.size >= MIN_SHINGLES && containment(m.sh, r.sh) > TH) overlap(`official item ${r.id}`, m.q.id);
    for (const p of test.passages) {
      const psh = shingles(p.paragraphs.join(" "));
      for (const r of refSh) if (containment(psh, r.sh) > TH) overlap(`official item ${r.id}`, `passage ${p.id}`);
    }
  } else warns.push("official reference corpus not found; skipped overlap check against it");
  for (const [source, where] of overlaps) err(`${[...where].join(", ")}: >${TH * 100}% 6-gram overlap with ${source}; rewrite from scratch`);
  for (const m of sameSetups(test)) (m.error ? err : (x: string) => warns.push(x))(m.message);
  for (const m of revisitRules(test)) err(`revisit: ${m}`);
  for (const m of wordReuse(test)) err(m);

  return { errors, warns, test };
}

if (process.argv[1]?.endsWith("validate-test.ts")) {
  const id = process.argv[2];
  const { errors, warns, test } = validateTest(readTestFile(id, "npm run -s validate -- <test-id>"), id);
  for (const w of warns) console.warn("warn:", w);
  if (errors.length) {
    console.error(`INVALID — ${errors.length} problem(s):\n` + errors.map((e) => "  - " + e).join("\n"));
    process.exit(1);
  }
  console.log(`OK: ${test!.id} — ${test!.questions.length} questions, ${test!.passages.length} passages`);
}
