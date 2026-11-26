// Validate a source file before it is synced into the bank.  usage: npm run -s validate -- verbal-001
// The checks are also exported for `npm run check` (the authoring loop) and `npm run bank:sync` (the gate).
import fs from "node:fs";
import path from "node:path";
import { TestSchema, type Question, type Test } from "../lib/types";
import { passageSentences, splitSentences } from "../lib/sentences";
import { parseNumber } from "../lib/scoring";
import { containment, MIN_SHINGLES, SETUP_TH, shingles } from "../lib/ngram";
import { earlierTests, pastItems, primaryOf, setupOverlap, setupText, sharedSkeleton } from "../lib/setup-history";
import { isBankId, isDrillId } from "../lib/test-path";
import { listSources } from "../lib/sources";
import { blueprintType, difficultyRules, isLongTc3, isPhraseBlank, LONG_TC3_MIN, openingBlockRules, PHRASE_BLANKS_MIN, typeCountRules, verbalItemRules, verbalLayoutRules, type Blueprint } from "../lib/blueprint-rules";
import { REVISIT_MAX } from "../lib/priority/revisit";
import { choiceIsWord } from "../lib/vocab-match";
import { readTestFile } from "./lib/test-file";

export { TOP_CAP, LONG_TC3_MIN, PHRASE_BLANKS_MIN, MULTI_PARA_MAX, LABEL_CHOICE, isPhraseBlank, difficultyRules, difficultyLine } from "../lib/blueprint-rules";

/** Verbal tests from this number on follow the official-format rules in verbalFormatRules (earlier tests predate them). */
export const VERBAL_FORMAT_FROM = 15;
/** Verbal tests from this number on set an arg-role item's portions in **bold**, as the real test does (earlier ones quote them in the stem). */
export const ARG_BOLD_FROM = 18;
/** Verbal tests from this number on may not open an RC choice with a summary label and a colon ("qualified approval: …"); the real test never does. */
export const NO_LABEL_CHOICES_FROM = 18;
/** Quant tests from this number on carry a `setup` and `variant` on every question (earlier ones were backfilled). */
export const QUANT_SETUP_FROM = 11;
/** Tests from these numbers on must not reuse an earlier setup (quant) or an earlier item's company (verbal); earlier ones were taken first. */
export const NOVELTY_FROM = { quant: 7, verbal: 8 } as const;

/** A rule that started at mock number `n` applies to this source: mocks from n on, and every bank batch. */
export const ruleFrom = (id: string, n: number) => isBankId(id) || Number(/-(\d+)$/.exec(id)?.[1] ?? 0) >= n;

/**
 * The official-format rules for a verbal mock (docs/QUIZ-AUTHORING.md, Structure rules): the passage layout
 * (lib/blueprint-rules.ts, verbalLayoutRules) and the rules each item meets on its own (verbalItemRules).
 */
export function verbalFormatRules(test: Test, blueprint: Blueprint): string[] {
  return [...verbalLayoutRules(test, blueprint), ...verbalItemRules(test, { argBold: ruleFrom(test.id, ARG_BOLD_FROM), noLabels: ruleFrom(test.id, NO_LABEL_CHOICES_FROM) })];
}

/** The first bit of TeX-like or slash-fraction math left outside `$...$` (it would show raw, e.g. `a_50`, `Σ_{n=1}^{49}`, `1/50`), or "". */
export function plainMath(s: string): string {
  const out = s.replace(/\\\$/g, "").replace(/\$(?:\\.|[^$\\])+\$/g, " ");
  const m = /[_^\\Σ∑√]|\d\s*\/\s*\d/.exec(out);
  return m ? out.slice(Math.max(0, m.index - 12), m.index + 12).trim() : "";
}

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

/** The concept-variant pairs ("concept\nvariant") the test's brief assigned to its slots; empty without a brief. */
function briefVariants(id: string, dir: string): Set<string> {
  const file = path.join(dir, `${id}.json`);
  if (!fs.existsSync(file)) return new Set();
  const b = JSON.parse(fs.readFileSync(file, "utf8")) as { conceptSlots?: { concept: string; variant?: string }[] };
  return new Set((b.conceptSlots ?? []).filter((s) => s.variant).map((s) => `${s.concept}\n${s.variant}`));
}

/**
 * Setup reuse against earlier tests of the measure (lower numbers, so the first use of a setup stays and later copies
 * are flagged): an item whose masked stem matches an earlier item of the same primary concept is an error, and a
 * variant already used twice for that concept is a warning.
 */
export function sameSetups(test: Test, dir = "content/tests"): { error: boolean; message: string }[] {
  if (test.measure !== "quant" || !ruleFrom(test.id, NOVELTY_FROM.quant)) return [];
  const earlier = pastItems(test.measure, test.id, dir);
  const assigned = briefVariants(test.id, path.join(dir, "..", "briefs"));
  const out: { error: boolean; message: string }[] = [];
  for (const q of test.questions) {
    const c = primaryOf(q);
    if (!c) continue;
    const same = earlier.filter((e) => e.concept === c);
    for (const e of same) {
      const share = setupOverlap(setupText(q), e.text);
      if (share >= SETUP_TH) {
        const shared = sharedSkeleton(setupText(q), e.text).map((g) => `"${g}"`).join(", ");
        out.push({
          error: true,
          message: q.revisits === `${e.testId}:${e.qid}`
            ? `${q.id}: revisits ${e.testId} ${e.qid} but keeps its setup (${Math.round(share * 100)}% skeleton overlap); a sibling keeps the insight and changes the structure (the brief names the change); reword the stem too, shared wording: ${shared}`
            : `${q.id}: same setup as ${e.testId} ${e.qid} (${c}, ${Math.round(share * 100)}% skeleton overlap); new numbers or names are not a new item, use a setup the brief does not list (shared wording: ${shared})`,
        });
      }
    }
    // a revisit shares its earlier item's form on purpose, and the brief's own variant is the least-used one on offer
    const reused = q.variant && !q.revisits && !assigned.has(`${c}\n${q.variant}`) ? same.filter((e) => e.variant === q.variant).length : 0;
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
  const earlier = new Map(earlierTests(test, dir).flatMap((t) => t.questions.map((q): [string, Question] => [`${t.id}:${q.id}`, q])));
  const keys = (q: Question) => q.tags.filter((t) => t.kind === "word" && t.role === "key").map((t) => t.id);
  const links = test.questions.filter((q) => q.revisits);
  if (links.length > REVISIT_MAX) out.push(`${links.length} revisits; at most ${REVISIT_MAX} per test, every other item must be new`);
  for (const q of links) {
    const e = earlier.get(q.revisits!);
    if (!e) out.push(`${q.id}: revisits ${q.revisits}, which is not an item of an earlier ${test.measure} test${isDrillId(test.id) || isBankId(test.id) ? " or batch" : ""}`);
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
  if (test.measure !== "verbal" || (!isDrillId(test.id) && !ruleFrom(test.id, NOVELTY_FROM.verbal))) return [];
  const words = (q: Question, role: string) => q.tags.filter((t) => t.kind === "word" && t.role === role).map((t) => t.id);
  const earlier = earlierTests(test, dir)
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

/** Questions per drill batch, and the levels its items sit at: the hard end of a mock (verbal tops out at 5). */
export const DRILL_MAX = 30;
export const DRILL_LEVELS = [4, 5];

/**
 * A drill batch (content/drill): standalone TC / SE items for the endless vocab mode, all in section 1, each at level
 * 4-5 with at least half at 5, so a spare-minute question is as hard as the hard end of a mock.
 */
export function drillRules(test: Test): string[] {
  const out: string[] = [];
  if (test.measure !== "verbal") out.push(`measure must be verbal`);
  if (test.questions.length > DRILL_MAX) out.push(`${test.questions.length} questions; at most ${DRILL_MAX} per batch`);
  if (test.passages.length || test.figures.length) out.push("no passages or figures: every item stands alone");
  for (const q of test.questions) {
    if (q.type !== "tc" && q.type !== "se") out.push(`${q.id}: type ${q.type}; a drill item is tc or se`);
    if (q.section !== 1) out.push(`${q.id}: section ${q.section}; every drill item is in section 1`);
    if (!DRILL_LEVELS.includes(q.difficulty)) out.push(`${q.id}: difficulty ${q.difficulty}; drill items are level ${DRILL_LEVELS.join(" or ")} (docs/HARD-PATTERNS.md)`);
  }
  const l5 = test.questions.filter((q) => q.difficulty >= 5).length;
  if (l5 < test.questions.length / 2) out.push(`only ${l5} of ${test.questions.length} items at level 5; at least half must be`);
  return out;
}

/** A bank batch's brief as batchRules reads it (scripts/bank-brief.ts writes it). */
export type BatchBrief = {
  slots: { qid?: string; type: string; level: number; unit?: string }[];
  units?: { id: string; shape: string }[];
};

/** Questions a unit shape holds: rc4-long 4, rc2 2, arg1 1, di3 3. */
export const shapeSize = (shape: string) => Number(/(\d+)/.exec(shape)?.[1] ?? 0);

/**
 * A bank batch (content/bank/<measure>): every item in section 1 with an s1qN id, the brief's slots (type and level,
 * in any order) and units (each a passage or DI set with the shape's question count, its id the unit's id), and the
 * mock's TC craft as batch-wide ratios: a third of the 3-blank TCs may be one sentence, and a fifth of the blanks are
 * all phrases, as LONG_TC3_MIN of 3 and PHRASE_BLANKS_MIN of 15 are in a mock.
 */
export function batchRules(test: Test, brief: BatchBrief): string[] {
  const out: string[] = [];
  for (const q of test.questions) {
    if (q.section !== 1) out.push(`${q.id}: section ${q.section}; every batch item is in section 1`);
    if (!/^s1q\d+$/.test(q.id)) out.push(`${q.id}: ids are s1q1, s1q2, …`);
  }
  const key = (type: string, level: number) => `${type} L${level}`;
  const want = brief.slots.map((s) => key(s.type, s.level)).sort();
  const got = test.questions.map((q) => key(blueprintType(q), q.difficulty)).sort();
  const missing = [...want];
  const extra: string[] = [];
  for (const g of got) {
    const i = missing.indexOf(g);
    if (i >= 0) missing.splice(i, 1);
    else extra.push(g);
  }
  if (missing.length || extra.length)
    out.push(`slots: the brief wants ${missing.length ? missing.join(", ") : "nothing more"}${extra.length ? `; the batch has ${extra.join(", ")} it does not ask for` : ""} (type and level per item; retag only an honest level)`);
  for (const u of brief.units ?? []) {
    const n = test.questions.filter((q) => q.passageId === u.id || q.setId === u.id).length;
    if (n !== shapeSize(u.shape)) out.push(`unit ${u.id} (${u.shape}): ${n} question(s) with passageId or setId "${u.id}", the shape wants ${shapeSize(u.shape)}`);
    if (u.shape === "rc4-long" && (test.passages.find((p) => p.id === u.id)?.paragraphs.length ?? 0) < 2) out.push(`unit ${u.id} (rc4-long): the long passage runs 2-4 paragraphs`);
    if (/^rc[12]$/.test(u.shape) && (test.passages.find((p) => p.id === u.id)?.paragraphs.length ?? 0) > 2) out.push(`unit ${u.id} (${u.shape}): a short passage is 1-2 paragraphs`);
  }
  const tc3 = test.questions.filter((q) => q.type === "tc" && q.blanks?.length === 3);
  const long = tc3.filter(isLongTc3).length;
  if (tc3.length && long < Math.ceil((tc3.length * LONG_TC3_MIN) / 3)) out.push(`${long} of ${tc3.length} 3-blank TCs run 3-5 sentences; write at least ${Math.ceil((tc3.length * LONG_TC3_MIN) / 3)} as short passages whose deciding clue sits a sentence away from the blank`);
  const blanks = test.questions.filter((q) => q.type === "tc").flatMap((q) => q.blanks ?? []);
  const phrase = blanks.filter(isPhraseBlank).length;
  if (blanks.length >= 5 && phrase < Math.ceil((blanks.length * PHRASE_BLANKS_MIN) / 15)) out.push(`${phrase} of ${blanks.length} TC blanks have all-phrase choices; at least ${Math.ceil((blanks.length * PHRASE_BLANKS_MIN) / 15)} need them`);
  const multiKeys = test.questions.filter((q) => q.type === "rc_multi").map((q) => ("sel" in q.key ? q.key.sel.length : 0));
  if (multiKeys.length >= 3 && multiKeys.every((k) => k === 2)) out.push(`every rc_multi has 2 keys; use the key counts the brief's slot table gives`);
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

  const formatRules = test.measure === "verbal" && !isDrillId(test.id) && ruleFrom(test.id, VERBAL_FORMAT_FROM);
  const setupRules = test.measure === "quant" && ruleFrom(test.id, QUANT_SETUP_FROM);
  const variants = JSON.parse(fs.readFileSync("data/concept_variants.json", "utf8")) as Record<string, string[]>;

  // ---- blueprint: counts per section, types, difficulty mix (a bank batch has its brief's slots instead)
  const ids = new Set<string>();
  for (const q of test.questions) {
    if (ids.has(q.id)) err(`duplicate question id ${q.id}`);
    ids.add(q.id);
  }
  const drill = isDrillId(test.id);
  const batch = isBankId(test.id);
  if (drill) for (const m of drillRules(test)) err(`drill: ${m}`);
  if (batch) {
    const briefFile = `content/briefs/${test.id}.json`;
    if (!fs.existsSync(briefFile)) err(`batch: no ${briefFile}; a batch starts with npm run -s bank:brief`);
    for (const m of batchRules(test, fs.existsSync(briefFile) ? (JSON.parse(fs.readFileSync(briefFile, "utf8")) as BatchBrief) : { slots: [] })) err(`batch: ${m}`);
  }
  if (!drill && !batch) {
    for (const m of typeCountRules(test.questions, blueprint)) err(m);
    for (const r of difficultyRules(test.questions))
      if (!r.ok)
        err(`difficulty: ${r.rule} fails; ${r.rule.includes("L6+") ? "ease the extra items to official-L5 difficulty and re-rate them, see docs/CALIBRATION.md" : "raise levels honestly (harder items), see docs/HARD-PATTERNS.md"}`);
    // block order: TC (verbal) / QC (quant) must open each section
    for (const m of openingBlockRules(test.questions, test.measure)) err(m);
    if (test.measure === "quant") {
      const di = test.questions.filter((q) => q.setId);
      if (new Set(di.map((q) => q.setId)).size !== 1 || di.length !== 3) err("quant needs exactly one data-interpretation set of 3 questions");
    }
  }
  for (const q of test.questions.filter((x) => x.setId)) if (!q.figureId) err(`${q.id}: DI question needs figureId`);

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
    if (test.measure === "quant") {
      const e = q.explanation;
      for (const [field, s] of [["key", e.key], ["fast", e.fast], ["trap", e.trap], ...(e.steps ?? []).map((x, i) => [`steps[${i}]`, x])] as [string, string | undefined][]) {
        const bare = plainMath(s ?? "");
        if (bare) err(`${where}: explanation.${field} has math outside $...$ ("${bare}"); write it as $...$ so it renders`);
      }
    }
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
  // a batch is no mock: its passage layout is the quiz's to meet (lib/assemble), and batchRules holds its TC ratios
  if (formatRules) for (const m of batch ? verbalItemRules(test, { argBold: true, noLabels: true }) : verbalFormatRules(test, blueprint)) err(`format: ${m}`);

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
  const others = listSources().filter((s) => s.id !== id).map((s) => s.file);
  for (const f of others) {
    const other = TestSchema.safeParse(JSON.parse(fs.readFileSync(f, "utf8")));
    if (!other.success) continue;
    for (const oq of other.data.questions) {
      const osh = shingles([oq.prompt, oq.passageId ? other.data.passages.find((p) => p.id === oq.passageId)?.paragraphs.join(" ") : "", (oq.choices ?? []).join(" ")].join(" "));
      for (const m of mine) if (m.sh.size >= MIN_SHINGLES && containment(m.sh, osh) > TH) overlap(`earlier test ${path.basename(f)}`, m.q.id);
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
