// The one command to run after every Write or Edit of a test: tags (verbal), validates, runs the quant key check,
// and compares the test with its brief. Prints OK or the problems by question, then the next step.
// usage: npm run -s check -- <test-id>
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { TestSchema, type Test } from "../lib/types";
import { tagTest } from "./tag-test";
import { difficultyLine, validateTest } from "./validate-test";
import { readTestFile, writeTestFile } from "./lib/test-file";
import type { VocabEntry } from "../lib/vocab-match";

type Brief = {
  keyWords?: { id: string; word: string }[];
  skillSlots?: { skill: string }[];
  passageWords?: { id: string }[];
  conceptSlots?: { concept: string }[];
};
type BankWord = VocabEntry & { senses?: { synonyms?: string[] }[] };

const count = (xs: string[]) => xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<string, number>());
const fmtCount = (m: Map<string, number>) => [...m].map(([k, n]) => (n > 1 ? `${k}×${n}` : k)).join(", ");
/** What `want` asks for that `have` lacks, counting repeats. */
const lacking = (want: string[], have: string[]) => {
  const h = count(have);
  return want.filter((x) => (h.get(x) ?? 0) > 0 ? (h.set(x, h.get(x)! - 1), false) : true);
};

/** Verbal: brief key words spent as keys, skill slots against skill tags, passage words per passage. */
function verbalCoverage(test: Test, brief: Brief) {
  const lines: string[] = [];
  const keyTags = test.questions.flatMap((q) => q.tags.filter((t) => t.kind === "word" && t.role === "key").map((t) => t.id));
  const briefKeys = brief.keyWords ?? [];
  const unusedKeys = briefKeys.filter((k) => !keyTags.includes(k.id)).map((k) => k.word);
  lines.push(`key words ${briefKeys.length - unusedKeys.length}/${briefKeys.length} used as keys${unusedKeys.length ? ` (unused: ${unusedKeys.join(", ")})` : ""}`);
  const skillTags = test.questions.filter((q) => q.type.startsWith("rc")).flatMap((q) => q.tags.filter((t) => t.kind === "concept" && t.role === "primary").map((t) => t.id));
  const missing = lacking((brief.skillSlots ?? []).map((s) => s.skill), skillTags);
  lines.push(`skills ${fmtCount(count(skillTags))}${missing.length ? ` (brief slots not tagged: ${missing.join(", ")})` : ""}`);
  const thin = test.passages.filter((p) => !p.id.startsWith("a")).map((p) => `${p.id} ${p.tags.filter((t) => t.role === "passage").length}`);
  lines.push(`passage words per passage (aim 3-6): ${thin.join(", ")}`);
  return { lines, unusedKeys };
}

function quantCoverage(test: Test, brief: Brief) {
  const primaries = test.questions.flatMap((q) => q.tags.filter((t) => t.kind === "concept" && t.role === "primary").map((t) => t.id));
  const missing = lacking((brief.conceptSlots ?? []).map((c) => c.concept), primaries);
  return [`concepts ${new Set(primaries).size} distinct primaries${missing.length ? ` (brief concepts with no primary tag: ${[...new Set(missing)].join(", ")})` : ", all brief concepts covered"}`];
}

/** The quant key check: content/verify/<id>.py, which compares computed answers with the JSON keys. */
function runVerify(id: string): { ok: boolean; out: string } {
  const file = `content/verify/${id}.py`;
  if (!fs.existsSync(file)) return { ok: false, out: `no ${file} yet: write it with content/verify/keys.py (example: content/verify/quant-002.py)` };
  const r = spawnSync("python3", [file], { encoding: "utf8" });
  const lines = `${r.stdout}\n${r.stderr}`.split("\n").filter((l) => l.trim());
  if (r.status === 0) return { ok: true, out: lines.at(-1) ?? "verify script passed" };
  return { ok: false, out: `${file} failed:\n` + lines.slice(-12).map((l) => "    " + l).join("\n") };
}

function main() {
  const id = process.argv[2];
  const raw = readTestFile(id, "npm run -s check -- <test-id>") as Test;
  const briefFile = `content/briefs/${id}.json`;
  const brief: Brief | null = fs.existsSync(briefFile) ? JSON.parse(fs.readFileSync(briefFile, "utf8")) : null;
  const problems: string[] = [];
  const info: string[] = [];

  // tagging needs a well-formed file; a schema failure is reported alone
  if (!TestSchema.safeParse(raw).success) return report(id, validateTest(raw, id).errors, [], [], "fix these with Edit");

  let unusedKeys: string[] = [];
  const notInBank = new Set<string>();
  if (raw.measure === "verbal") {
    const vocab = JSON.parse(fs.readFileSync("data/vocab.json", "utf8")) as BankWord[];
    const { missingKeys } = tagTest(raw, vocab, (brief?.passageWords ?? []).map((w) => w.id));
    writeTestFile(id, raw);
    for (const m of missingKeys) {
      notInBank.add(m.id);
      // bank words whose senses list the missing word as a synonym are the likeliest replacements
      const near = vocab.filter((v) => v.senses?.some((s) => s.synonyms?.some((w) => w.toLowerCase() === m.text.toLowerCase()))).map((v) => v.lemma);
      problems.push(`${m.id}: key "${m.text}" is not a bank word; use a bank word${near.length ? ` (bank words with this sense: ${near.slice(0, 6).join(", ")})` : ""}`);
    }
  }

  const v = validateTest(raw, id);
  const test = v.test!;
  // a key that is not a bank word also has no word tag; the bank message above already covers it
  problems.push(...v.errors.filter((e) => !(/ has no word tag /.test(e) && notInBank.has(e.split(" ")[0]))));
  if (raw.measure === "quant") {
    const r = runVerify(id);
    (r.ok ? info : problems).push(r.out);
  }
  const coverage: string[] = [];
  if (brief) {
    if (raw.measure === "verbal") {
      const c = verbalCoverage(test, brief);
      coverage.push(...c.lines);
      unusedKeys = c.unusedKeys;
    } else coverage.push(...quantCoverage(test, brief));
  } else coverage.push(`no ${briefFile}; coverage against the brief skipped`);
  if (unusedKeys.length && notInBank.size) problems.push(`unused brief key words, to replace a non-bank key: ${unusedKeys.join(", ")}`);

  const head = `${test.questions.length} questions, ${test.passages.length} passages${info.length ? " · " + info.join(" · ") : ""}`;
  report(id, problems, v.warns, [head, `difficulty: ${difficultyLine(test.questions)}`, ...coverage.map((c) => "coverage: " + c)],
    problems.length ? "fix these with Edit" : `npm run -s blind -- ${id}, then give content/.blind/${id}.md to the gre-blind-solver agent`);
}

function report(id: string, problems: string[], warns: string[], lines: string[], next: string) {
  if (problems.length) console.log(`INVALID: ${id} — ${problems.length} problem(s)\n` + problems.map((p) => "  - " + p).join("\n"));
  else console.log(`OK: ${id} — ${lines.shift()}`);
  for (const l of problems.length ? lines.slice(1) : lines) console.log(l);
  for (const w of warns) console.log("warn: " + w);
  console.log(`next: ${next}${problems.length ? `, then npm run -s check -- ${id}` : ""}`);
  process.exit(problems.length ? 1 : 0);
}

main();
