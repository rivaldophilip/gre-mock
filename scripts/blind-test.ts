// Blind copy for the solver, and a checker for its answers.
//   npm run -s blind -- <id>                      write content/.blind/<id>.md (no keys, explanations, tags, difficulty)
//   npm run -s blind -- <id> --only s1q3,s2q5     write content/.blind/<id>.only.md with just those items (the full copy stays)
//   npm run -s blind -- <id> --check [file|-] [--only ids]
//       compare the solver's lines with the key and print only what needs action, then the next step.
//       The file defaults to content/.blind/<id>.answers.txt (<id>.only.answers.txt with --only); "-" reads stdin and saves it there.
//   npm run -s blind -- --calibrate verbal|quant [--check file|-]   official items of known P+, to measure the solver's rating offset
import fs from "node:fs";
import path from "node:path";
import { TestSchema, type Question, type Test } from "../lib/types";
import { passageSentences } from "../lib/sentences";
import { parseNumber } from "../lib/scoring";
import { difficultyRules, TOP_CAP } from "./validate-test";
import { die, readTestFile } from "./lib/test-file";

const L = "ABCDEFGHI";
const DIR = "content/.blind";
const CAL = "data/solver-calibration.json";
const QC_CHOICES = ["Quantity A is greater.", "Quantity B is greater.", "The two quantities are equal.", "The relationship cannot be determined from the information given."];

export function blindCopy(test: Test, only?: Set<string>): string {
  const qs = test.questions.filter((q) => !only || only.has(q.id));
  let out = `# ${test.measure} items (blind copy)\n`;
  const used = new Set<string>();
  for (const sec of [1, 2]) {
    const inSec = qs.filter((q) => q.section === sec);
    if (!inSec.length) continue;
    out += `\n## Section ${sec}\n`;
    for (const q of inSec) {
      if (q.passageId) used.add(q.passageId);
      if (q.figureId) used.add(q.figureId);
      const kind = q.subtype === "arg" ? "argument" : q.type;
      out += `\n### ${q.id} (${kind}${q.passageId ? `, passage ${q.passageId}` : ""}${q.figureId ? `, figure ${q.figureId}` : ""})\n${q.prompt}\n`;
      if (q.qc) out += `${q.qc.info ? q.qc.info + "\n" : ""}Quantity A: ${q.qc.a}\nQuantity B: ${q.qc.b}\n${QC_CHOICES.map((c, j) => `${L[j]}. ${c}`).join("\n")}\n`;
      if (q.blanks) q.blanks.forEach((b, i) => (out += `Blank (${["i", "ii", "iii"][i]}): ${b.map((c, j) => `${L[j]}. ${c}`).join("   ")}\n`));
      if (q.choices) {
        const how = q.type === "se" ? "Select exactly two." : q.type === "rc_multi" || q.type === "mc_multi" ? "Select all that apply (one or more)." : "Select one.";
        out += `${how}\n${q.choices.map((c, j) => `${L[j]}. ${c}`).join("\n")}\n`;
      }
      if (q.type === "rc_select") out += "Answer with the sentence number from the numbered passage.\n";
      if (q.numeric) out += `Enter ${q.numeric.kind === "fraction" ? "a fraction" : "a number"}${q.numeric.unit ? ` (${q.numeric.unit})` : ""}.\n`;
    }
  }
  const passages = test.passages.filter((p) => used.has(p.id));
  if (passages.length) out += "\n## Passages\n";
  for (const p of passages) {
    out += `\n### ${p.id}\n`;
    const s = passageSentences(p.paragraphs);
    s.forEach((x, i) => (out += `[${i}] ${x.text}${x.para !== s[i + 1]?.para ? "\n\n" : " "}`));
  }
  const figures = test.figures.filter((f) => used.has(f.id));
  if (figures.length) out += "\n## Figures\n";
  for (const f of figures) {
    out += `\n### ${f.id}${f.caption ? `: ${f.caption}` : ""}\n`;
    if (f.table) out += `| ${f.table.head.join(" | ")} |\n|${f.table.head.map(() => "---").join("|")}|\n${f.table.rows.map((r) => `| ${r.join(" | ")} |`).join("\n")}\n`;
    if (f.svg) out += "```svg\n" + f.svg + "\n```\n";
  }
  if (test.measure === "verbal") {
    const skills = JSON.parse(fs.readFileSync("data/rc_skills.json", "utf8")) as { id: string; name: string; description: string }[];
    out += "\n## Reading skills (name one per reading/argument item)\n" + skills.map((s) => `- ${s.id} (${s.name}): ${s.description}`).join("\n") + "\n";
  }
  return out;
}

export type SolverLine = { id: string; answer: string; confidence: string | null; difficulty: number | null; skill: string | null; problems: string; note: string };

/**
 * Lines like `s1q3 | B C A | high | 4 | rc-inference | none`; tolerant of markdown and annotations.
 * Prose under an item (the solver's reason for a flag or a low confidence) is kept as that item's note.
 */
export function parseAnswers(text: string): Map<string, SolverLine> {
  const out = new Map<string, SolverLine>();
  let last: SolverLine | null = null;
  for (const line of text.split("\n")) {
    const cells = line.split("|").map((c) => c.replace(/[*`]/g, "").trim());
    if (cells[0] === "") cells.shift();
    if (cells.at(-1) === "") cells.pop();
    const id = cells[0]?.match(/^-?\s*((?:s[12]q\d+)|(?:c\d+))\b/)?.[1];
    if (!id || cells.length < 3) {
      const prose = line.replace(/^[\s>*-]+/, "").trim();
      if (last && prose && !line.includes("|") && !prose.startsWith("#")) last.note = (last.note ? last.note + " " : "") + prose;
      continue;
    }
    const diff = cells.slice(2).map((c) => c.match(/^([1-5])\b/)).find(Boolean);
    const skill = cells.slice(2).map((c) => c.match(/\b((?:rc|arg)-[a-z-]+)/)?.[1]).find(Boolean) ?? null;
    const confidence = cells.slice(2).map((c) => c.match(/^(high|medium|low)\b/i)?.[1].toLowerCase()).find(Boolean) ?? null;
    last = { id, answer: cells[1], confidence, difficulty: diff ? Number(diff[1]) : null, skill, problems: cells.at(-1) ?? "", note: "" };
    out.set(id, last);
  }
  return out;
}

/** The key as the solver sees it in the blind copy: letters (per blank for tc), a sentence number, or a value. */
export function keyText(q: Pick<Question, "type" | "key">): string {
  if ("value" in q.key) return q.key.value;
  if (q.type === "rc_select") return `sentence ${q.key.sel[0]}`;
  return (q.type === "tc" ? q.key.sel : [...q.key.sel].sort()).map((i) => L[i]).join(" ");
}

/** The solver's answer in key form: choice indices, a sentence index, or a number. */
function readAnswer(q: Pick<Question, "type">, raw: string): number[] | number {
  const s = raw.replace(/\([^)]*\)/g, " ");
  if (q.type === "rc_select") return [Number(s.match(/\d+/)?.[0] ?? NaN)];
  if (q.type === "numeric") return parseNumber(s.match(/-?\d[\d,]*(?:\.\d+)?(?:\s*\/\s*-?\d+(?:\.\d+)?)?/)?.[0]);
  return [...s.matchAll(/\b([A-I])\b/g)].map((m) => L.indexOf(m[1]));
}

function matches(q: Question, got: number[] | number): boolean {
  if ("value" in q.key) return typeof got === "number" && Math.abs(got - parseNumber(q.key.value)) < 1e-9;
  const want = q.key.sel;
  if (typeof got === "number") return false;
  if (q.type === "tc") return got.length === want.length && got.every((g, i) => g === want[i]);
  return got.length === want.length && [...got].sort().every((g, i) => g === [...want].sort()[i]);
}

const NO_PROBLEM = /^(none|no|n\/a|ok|-|–|—)?$/i;
function calibration(measure: string): { offset: number; model?: string } | null {
  if (!fs.existsSync(CAL)) return null;
  return (JSON.parse(fs.readFileSync(CAL, "utf8")) as Record<string, { offset: number; model?: string }>)[measure] ?? null;
}

/**
 * Compare the solver's lines with the key. Each issue is one line per item (plus the solver's note), worded as the
 * action to take; `act` lists the items to fix and re-solve. A too-easy item is offered a retag to its honest level
 * when the section difficulty rules still pass with it (and with the retags offered before it).
 */
export function checkAnswers(test: Test, answers: Map<string, SolverLine>, offset: number, only?: Set<string>) {
  const issues: string[] = [];
  const act = new Set<string>();
  let right = 0;
  let levels = test.questions.map((q) => ({ id: q.id, section: q.section, difficulty: q.difficulty }));
  let retags = 0;
  const qs = test.questions.filter((q) => !only || only.has(q.id));
  for (const q of qs) {
    const a = answers.get(q.id);
    if (!a) {
      issues.push(`${q.id}  no answer from the solver (its reply has no line for this id)`);
      act.add(q.id);
      continue;
    }
    const mine: string[] = [];
    if (matches(q, readAnswer(q, a.answer))) right++;
    else mine.push(`${q.id}  WRONG: solver "${a.answer}"${a.confidence ? ` (${a.confidence})` : ""}, key "${keyText(q)}"; rewrite so only the key is defensible`);
    // levels 6-7 come from calibration against official items (docs/CALIBRATION.md), so the authoring bar stops at 5
    const target = Math.min(5, q.difficulty);
    if (a.difficulty !== null && a.difficulty + offset < target - 1) {
      const est = a.difficulty + offset;
      const honest = Math.max(1, Math.min(5, Math.round(est)));
      const trial = levels.map((x) => (x.id === q.id ? { ...x, difficulty: honest } : x));
      const broken = difficultyRules(trial).filter((r) => !r.ok);
      const head = `${q.id}  too easy: rated ${a.difficulty} (+${offset} = ${est}) vs target ${target}; rewrite it harder`;
      if (broken.length) mine.push(`${head} (retagging it ${honest} would break ${broken.map((r) => r.rule).join(", ")})`);
      else {
        mine.push(`${head}, or set difficulty ${q.difficulty}→${honest} (sections still pass${retags ? " with the retags above" : ""})`);
        levels = trial;
        retags++;
      }
    }
    const primary = q.tags.find((t) => t.kind === "concept" && t.role === "primary")?.id;
    const secondary = q.tags.filter((t) => t.kind === "concept" && t.role === "secondary").map((t) => t.id);
    if (q.type.startsWith("rc") && a.skill && primary && a.skill !== primary && !secondary.includes(a.skill))
      mine.push(`${q.id}  skill: solver says ${a.skill}, tagged ${primary}; make the stem test ${primary}, or retag it if the brief's skill mix still holds`);
    const prob = a.problems.trim();
    if (!NO_PROBLEM.test(prob.replace(/\([^)]*\)/g, "").split(/[.;:,]/)[0].trim())) mine.push(`${q.id}  flagged: ${prob}`);
    else if (a.confidence === "low" && !mine.length) mine.push(`${q.id}  low confidence on the right answer; check for a second defensible choice`);
    if (!mine.length) continue;
    if (a.note) mine[0] += `\n      solver's note: ${a.note}`;
    issues.push(...mine);
    act.add(q.id);
  }
  // quant: a raw rating of 4+ is where items land at level 6+ after calibration (official hard items get 4 about 15% of
  // the time), so more than TOP_CAP per section overshoots the real GRE; ease the extra ones (docs/CALIBRATION.md)
  if (test.measure === "quant")
    for (const n of [1, 2] as const) {
      const top = test.questions
        .filter((q) => q.section === n && (answers.get(q.id)?.difficulty ?? 0) >= TOP_RATING)
        .sort((x, y) => answers.get(y.id)!.difficulty! - answers.get(x.id)!.difficulty!);
      if (top.length <= TOP_CAP) continue;
      const ease = top.slice(TOP_CAP).map((q) => q.id);
      issues.push(
        `S${n} too hard: ${top.length} items rated ${TOP_RATING}+ (${top.map((q) => q.id).join(", ")}), cap ${TOP_CAP} per section; ` +
          `ease ${ease.join(", ")} to official-L5 difficulty (drop one move, keep the trap and the level-5 tag)`,
      );
      ease.forEach((id) => act.add(id));
    }
  return { right, total: qs.length, issues, act: [...act] };
}

/** Raw quant solver rating from which an item usually calibrates to level 6+. */
export const TOP_RATING = 4;

// ---- calibration set: official items of known P+ (local corpus only, never committed)
const REF = path.resolve("../books/extracted/reference/items.jsonl");
const levelOfP = (p: number) => (p < 30 ? 5 : p < 45 ? 4 : p < 60 ? 3 : 2);
function calibrationSet(measure: string) {
  const all = fs.readFileSync(REF, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const byId = new Map(all.map((x) => [x.id, x]));
  const types = measure === "verbal" ? ["tc1", "tc2", "tc3", "se", "arg"] : ["qc", "mc", "numeric"];
  // boldface items lose their bold in the text corpus, so they cannot be solved from it
  const pool = all.filter((x) => types.includes(x.type) && typeof x.pplus === "number" && !/boldface/i.test(String(x.stem))).sort((a, b) => a.id.localeCompare(b.id));
  // three items each at levels 5 and 4, two at level 3
  const items = ([[5, 3], [4, 3], [3, 2]] as const).flatMap(([lv, n]) => pool.filter((x) => levelOfP(x.pplus) === lv).slice(0, n));
  let md = `# Calibration items (${measure})\n`;
  const key: Record<string, number> = {};
  items.forEach((x, n) => {
    const id = `c${n + 1}`;
    key[id] = levelOfP(x.pplus);
    md += `\n### ${id}\n`;
    if (x.passage_id) md += `Passage: ${byId.get(x.passage_id)?.text ?? ""}\n`;
    md += `${x.stem}\n`;
    if (x.qa) md += `Quantity A: ${x.qa}\nQuantity B: ${x.qb}\n`;
    const ch = x.choices;
    if (Array.isArray(ch) && Array.isArray(ch[0])) md += ch.map((b: string[], i: number) => `Blank ${i + 1}: ${b.map((c, j) => `${L[j]}. ${c}`).join("   ")}`).join("\n") + "\n";
    else if (Array.isArray(ch)) md += ch.map((c: string, j: number) => `${L[j]}. ${c}`).join("\n") + "\n";
  });
  return { md, key };
}

/** The solver's reply: `--check -` reads stdin (saved to `fallback` for the record), `--check <file>` a file, bare `--check` the fallback. */
function readReply(args: string[], fallback: string): string {
  const v = args[args.indexOf("--check") + 1];
  if (v === "-") {
    const text = fs.readFileSync(0, "utf8");
    fs.writeFileSync(fallback, text);
    return text;
  }
  const file = !v || v.startsWith("--") ? fallback : v;
  if (!fs.existsSync(file)) die(`no ${file}. Pipe the solver's reply instead: npm run -s blind -- ${args[0] === "--calibrate" ? `--calibrate ${args[1]}` : args[0]} --check - <<'EOF' … EOF`);
  return fs.readFileSync(file, "utf8");
}

/** Where `check` records each blind check; `register` warns when a test has none. */
export const checkRecord = (id: string) => `${DIR}/${id}.checked.json`;

function main() {
  const args = process.argv.slice(2);
  const opt = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
  fs.mkdirSync(DIR, { recursive: true });
  if (args[0] === "--calibrate") {
    const measure = args[1];
    if (measure !== "verbal" && measure !== "quant") die("usage: npm run -s blind -- --calibrate verbal|quant [--check file|-]");
    const { md, key } = calibrationSet(measure);
    if (!args.includes("--check")) {
      fs.writeFileSync(`${DIR}/calibration-${measure}.md`, md);
      console.log(`wrote ${DIR}/calibration-${measure}.md (${Object.keys(key).length} items)\nnext: give it to the gre-blind-solver agent, then npm run -s blind -- --calibrate ${measure} --check - with its reply`);
      return;
    }
    const ans = parseAnswers(readReply(args, `${DIR}/calibration-${measure}.answers.txt`));
    const gaps = Object.entries(key).flatMap(([id, lv]) => (ans.get(id)?.difficulty ? [lv - ans.get(id)!.difficulty!] : []));
    if (!gaps.length) die("no ratings found in the solver's reply: expected lines like `c1 | B | high | 3 | | none`");
    const offset = Math.round((gaps.reduce((a, b) => a + b, 0) / gaps.length) * 2) / 2;
    const cal = fs.existsSync(CAL) ? JSON.parse(fs.readFileSync(CAL, "utf8")) : {};
    cal[measure] = { model: opt("--model") ?? cal[measure]?.model ?? "sonnet", offset, measuredAt: new Date().toISOString().slice(0, 10), items: gaps.length };
    fs.writeFileSync(CAL, JSON.stringify(cal, null, 1) + "\n");
    console.log(`solver rates ${offset} levels below official difficulty on average (${gaps.length} items); saved to ${CAL}`);
    return;
  }
  const id = args[0];
  const usage = "npm run -s blind -- <test-id> [--only ids] [--check [file|-]]";
  const parsed = TestSchema.safeParse(readTestFile(id, usage));
  if (!parsed.success) die(`${id} does not parse as a test; run npm run -s check -- ${id} and fix what it reports first`);
  const test = parsed.data;
  const only = opt("--only") ? new Set(opt("--only")!.split(",").map((x) => x.trim())) : undefined;
  const unknown = [...(only ?? [])].filter((x) => !test.questions.some((q) => q.id === x));
  if (unknown.length) die(`--only names ids not in ${id}: ${unknown.join(", ")} (ids look like s1q3, s2q15)`);
  const base = `${DIR}/${id}${only ? ".only" : ""}`;
  if (!args.includes("--check")) {
    fs.writeFileSync(`${base}.md`, blindCopy(test, only));
    console.log(`wrote ${base}.md (${only ? only.size : test.questions.length} items)`);
    console.log(`next: ${only ? "SendMessage the same gre-blind-solver agent" : "give the gre-blind-solver agent"} the path ${base}.md, then npm run -s blind -- ${id}${only ? ` --only ${[...only].join(",")}` : ""} --check - <<'EOF' with its reply`);
    return;
  }
  const cal = calibration(test.measure);
  if (!cal) console.warn(`warn: no ${test.measure} calibration in ${CAL}; difficulty compared with offset 0`);
  const { right, total, issues, act } = checkAnswers(test, parseAnswers(readReply(args, `${base}.answers.txt`)), cal?.offset ?? 0, only);
  fs.writeFileSync(checkRecord(id), JSON.stringify({ at: new Date().toISOString(), only: only ? [...only] : null, right, total, toFix: act }) + "\n");
  console.log(`${id}: ${right}/${total} match the key${issues.length ? "" : "; nothing to fix"}`);
  for (const i of issues) console.log("  " + i);
  const ids = act.join(",");
  console.log(
    act.length
      ? `next: fix ${act.join(", ")} with Edit, npm run -s check -- ${id}, then npm run -s blind -- ${id} --only ${ids} and SendMessage the same solver the new file`
      : `next: npm run -s register -- ${id}, then commit and push`,
  );
}

if (process.argv[1]?.endsWith("blind-test.ts")) main();
