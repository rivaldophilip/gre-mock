// Blind copy for the solver, and a checker for its answers.
//   npm run blind -- <id> [--only s1q3,s2q5]        write content/.blind/<id>.md (no keys, explanations, tags, difficulty)
//   npm run blind -- <id> --check <answers.txt>     compare the solver's lines with the key; print only what needs action
//   npm run blind -- --calibrate verbal|quant [--check <answers.txt>]   official items of known P+, to measure the solver's rating offset
import fs from "node:fs";
import path from "node:path";
import { TestSchema, type Question, type Test } from "../lib/types";
import { passageSentences } from "../lib/sentences";
import { parseNumber } from "../lib/scoring";

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

export type SolverLine = { id: string; answer: string; difficulty: number | null; skill: string | null; problems: string };

/** Lines like `s1q3 | B C A | high | 4 | rc-inference | none`; tolerant of markdown and annotations. */
export function parseAnswers(text: string): Map<string, SolverLine> {
  const out = new Map<string, SolverLine>();
  for (const line of text.split("\n")) {
    const cells = line.split("|").map((c) => c.replace(/[*`]/g, "").trim());
    if (cells[0] === "") cells.shift();
    if (cells.at(-1) === "") cells.pop();
    const id = cells[0]?.match(/^-?\s*((?:s[12]q\d+)|(?:c\d+))\b/)?.[1];
    if (!id || cells.length < 3) continue;
    const diff = cells.slice(2).map((c) => c.match(/^([1-5])\b/)).find(Boolean);
    const skill = cells.slice(2).map((c) => c.match(/\b((?:rc|arg)-[a-z-]+)/)?.[1]).find(Boolean) ?? null;
    out.set(id, { id, answer: cells[1], difficulty: diff ? Number(diff[1]) : null, skill, problems: cells.at(-1) ?? "" });
  }
  return out;
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

export function checkAnswers(test: Test, answers: Map<string, SolverLine>, offset: number, only?: Set<string>) {
  const issues: string[] = [];
  let right = 0;
  const qs = test.questions.filter((q) => !only || only.has(q.id));
  for (const q of qs) {
    const a = answers.get(q.id);
    if (!a) {
      issues.push(`${q.id}  no answer from the solver`);
      continue;
    }
    if (matches(q, readAnswer(q, a.answer))) right++;
    else issues.push(`${q.id}  WRONG: solver "${a.answer}", key ${JSON.stringify(q.key)}`);
    if (a.difficulty !== null && a.difficulty + offset < q.difficulty - 1)
      issues.push(`${q.id}  too easy: rated ${a.difficulty} (+${offset} = ${a.difficulty + offset}) vs target ${q.difficulty}`);
    const primary = q.tags.find((t) => t.kind === "concept" && t.role === "primary")?.id;
    const secondary = q.tags.filter((t) => t.kind === "concept" && t.role === "secondary").map((t) => t.id);
    if (q.type.startsWith("rc") && a.skill && primary && a.skill !== primary && !secondary.includes(a.skill))
      issues.push(`${q.id}  skill: solver says ${a.skill}, tagged ${primary}`);
    const prob = a.problems.trim();
    if (!NO_PROBLEM.test(prob.replace(/\([^)]*\)/g, "").split(/[.;:,]/)[0].trim())) issues.push(`${q.id}  flagged: ${prob}`);
  }
  return { right, total: qs.length, issues };
}

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

function main() {
  const args = process.argv.slice(2);
  const opt = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
  fs.mkdirSync(DIR, { recursive: true });
  if (args[0] === "--calibrate") {
    const measure = args[1];
    if (measure !== "verbal" && measure !== "quant") throw new Error("usage: npm run blind -- --calibrate verbal|quant [--check <answers.txt>]");
    const { md, key } = calibrationSet(measure);
    const checkFile = opt("--check");
    if (!checkFile) {
      fs.writeFileSync(`${DIR}/calibration-${measure}.md`, md);
      console.log(`wrote ${DIR}/calibration-${measure}.md (${Object.keys(key).length} items); give it to the gre-blind-solver agent, save its reply, then --check it`);
      return;
    }
    const ans = parseAnswers(fs.readFileSync(checkFile, "utf8"));
    const gaps = Object.entries(key).flatMap(([id, lv]) => (ans.get(id)?.difficulty ? [lv - ans.get(id)!.difficulty!] : []));
    if (!gaps.length) throw new Error("no ratings found in the answers file");
    const offset = Math.round((gaps.reduce((a, b) => a + b, 0) / gaps.length) * 2) / 2;
    const cal = fs.existsSync(CAL) ? JSON.parse(fs.readFileSync(CAL, "utf8")) : {};
    cal[measure] = { model: opt("--model") ?? cal[measure]?.model ?? "sonnet", offset, measuredAt: new Date().toISOString().slice(0, 10), items: gaps.length };
    fs.writeFileSync(CAL, JSON.stringify(cal, null, 1) + "\n");
    console.log(`solver rates ${offset} levels below official difficulty on average (${gaps.length} items); saved to ${CAL}`);
    return;
  }
  const id = args[0];
  if (!id) throw new Error("usage: npm run blind -- <test-id> [--only ids] [--check <answers.txt>]");
  const test = TestSchema.parse(JSON.parse(fs.readFileSync(`content/tests/${id}.json`, "utf8")));
  const only = opt("--only") ? new Set(opt("--only")!.split(",")) : undefined;
  const checkFile = opt("--check");
  if (!checkFile) {
    const file = `${DIR}/${id}.md`;
    fs.writeFileSync(file, blindCopy(test, only));
    console.log(`wrote ${file} (${only ? only.size : test.questions.length} items)`);
    return;
  }
  const cal = calibration(test.measure);
  if (!cal) console.warn(`warn: no ${test.measure} calibration in ${CAL}; difficulty compared with offset 0`);
  const { right, total, issues } = checkAnswers(test, parseAnswers(fs.readFileSync(checkFile, "utf8")), cal?.offset ?? 0, only);
  console.log(`${id}: ${right}/${total} match the key${issues.length ? "" : "; nothing to fix"}`);
  for (const i of issues) console.log("  " + i);
}

if (process.argv[1]?.endsWith("blind-test.ts")) main();
