// Validate a test file before it is registered.  usage: npm run -s validate -- verbal-001
// The checks are also exported for `npm run check` (the authoring loop) and `npm run register` (the gate).
import fs from "node:fs";
import path from "node:path";
import { TestSchema, type Question, type Test } from "../lib/types";
import { passageSentences } from "../lib/sentences";
import { parseNumber } from "../lib/scoring";
import { containment, MIN_SHINGLES, shingles } from "../lib/ngram";
import { choiceIsWord } from "../lib/vocab-match";
import { readTestFile } from "./lib/test-file";

type Rated = Pick<Question, "section" | "difficulty">;

/** The section difficulty rules (docs/QUIZ-AUTHORING.md), one entry per rule, each with whether it passes. */
export function difficultyRules(questions: Rated[]) {
  const out: { rule: string; ok: boolean }[] = [];
  for (const n of [1, 2] as const) {
    const qs = questions.filter((q) => q.section === n);
    if (!qs.length) continue;
    const avg = qs.reduce((a, q) => a + q.difficulty, 0) / qs.length;
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
  for (const r of difficultyRules(test.questions)) if (!r.ok) err(`difficulty: ${r.rule} fails; raise levels honestly (harder items), see docs/HARD-PATTERNS.md`);
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
    if (q.type.startsWith("rc")) {
      // every reading question names the skill it tests; argument items test an argument skill
      const primaries = q.tags.filter((t) => t.kind === "concept" && t.role === "primary");
      if (primaries.length !== 1) err(`${where}: needs exactly one primary skill tag (data/rc_skills.json)`);
      else if (q.subtype === "arg" && skills.get(primaries[0].id) !== "argument") err(`${where}: argument item needs an arg-* primary skill`);
    }
  }
  for (const p of test.passages) for (const t of p.tags) if (t.kind === "word" && !vocab.has(t.id)) err(`passage ${p.id}: word tag "${t.id}" not in vocab`);

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
