// The one command to run after every Write or Edit of a test: tags (verbal), validates, runs the quant key check,
// and compares the test with its brief. Prints OK or the problems by question, then the next step.
// usage: npm run -s check -- <test-id>
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { TestSchema, type Test } from "../lib/types";
import { tagTest } from "./tag-test";
import { difficultyLine, DRILL_LEVELS, validateTest } from "./validate-test";
import { readTestFile, writeTestFile } from "./lib/test-file";
import type { VocabEntry } from "../lib/vocab-match";
import { isDrillId } from "../lib/test-path";

type Brief = {
  keyWords?: { id: string; word: string; bucket?: string }[];
  skillSlots?: { skill: string }[];
  passageWords?: { id: string }[];
  distractorWords?: { untested?: { id: string }[]; review?: { id: string }[] };
  /** set by briefs from the untested-word push on (lib/priority/config.ts); older briefs keep the old aims */
  wordTargets?: { untestedDistractorShare: number; passageWordsMin: number; exposureOnlyChoices?: false };
  /** drill briefs: the least share of choice words from the brief, and the missed drill items to sibling */
  drillTargets?: { untestedChoiceShare: number; exposureOnlyChoices?: false };
  revisits?: { ref: string; keys: string[] }[];
  conceptSlots?: { concept: string }[];
  slots?: { type: string; keys?: number }[];
};
type BankWord = VocabEntry & { senses?: { synonyms?: string[] }[] };

const count = (xs: string[]) => xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<string, number>());
const fmtCount = (m: Map<string, number>) => [...m].map(([k, n]) => (n > 1 ? `${k}×${n}` : k)).join(", ");
/** What `want` asks for that `have` lacks, counting repeats. */
const lacking = (want: string[], have: string[]) => {
  const h = count(have);
  return want.filter((x) => (h.get(x) ?? 0) > 0 ? (h.set(x, h.get(x)! - 1), false) : true);
};

/**
 * Verbal: brief key words spent as keys, skill slots against skill tags, passage words per passage, and the share
 * of distractor words drawn from the brief's untested list. A brief with `wordTargets` turns the last two into problems.
 */
function verbalCoverage(test: Test, brief: Brief) {
  const lines: string[] = [];
  const problems: string[] = [];
  const targets = brief.wordTargets;
  const keyTags = test.questions.flatMap((q) => q.tags.filter((t) => t.kind === "word" && t.role === "key").map((t) => t.id));
  const briefKeys = brief.keyWords ?? [];
  const unusedKeys = briefKeys.filter((k) => !keyTags.includes(k.id)).map((k) => k.word);
  lines.push(`key words ${briefKeys.length - unusedKeys.length}/${briefKeys.length} used as keys${unusedKeys.length ? ` (unused: ${unusedKeys.join(", ")})` : ""}`);
  const skillTags = test.questions.filter((q) => q.type.startsWith("rc")).flatMap((q) => q.tags.filter((t) => t.kind === "concept" && t.role === "primary").map((t) => t.id));
  const missing = lacking((brief.skillSlots ?? []).map((s) => s.skill), skillTags);
  lines.push(`skills ${fmtCount(count(skillTags))}${missing.length ? ` (brief slots not tagged: ${missing.join(", ")})` : ""}`);
  // only the brief's passage words count toward the aim; other GRE words in a passage are tagged too
  const briefPassage = new Set((brief.passageWords ?? []).map((w) => w.id));
  const perPassage = test.passages.filter((p) => !p.id.startsWith("a")).map((p) => ({ id: p.id, n: new Set(p.tags.filter((t) => t.role === "passage" && briefPassage.has(t.id)).map((t) => t.id)).size }));
  lines.push(`passage words per passage (aim ${targets?.passageWordsMin ?? 3}-6): ${perPassage.map((p) => `${p.id} ${p.n}`).join(", ")}`);
  if (targets) {
    const thin = perPassage.filter((p) => p.n < targets.passageWordsMin);
    if (thin.length) problems.push(`passage words: ${thin.map((p) => `${p.id} has ${p.n}`).join(", ")}; weave in brief passageWords to reach ${targets.passageWordsMin} each`);
  }
  // untested at brief time: the distractor list, plus the passage pool (never-seen words too)
  // and a new key word the test spends as a distractor (a brief with fewer than 7 SE key pairs has spares)
  const spareKeys = (brief.keyWords ?? []).filter((k) => k.bucket === "new" && !keyTags.includes(k.id));
  const untested = new Set([...(brief.distractorWords?.untested ?? []), ...(brief.passageWords ?? []), ...spareKeys].map((w) => w.id));
  const distractors = [...new Set(test.questions.flatMap((q) => q.tags.filter((t) => t.kind === "word" && t.role === "distractor").map((t) => t.id)))];
  if (distractors.length) {
    const fresh = distractors.filter((d) => untested.has(d)).length;
    const want = targets ? Math.ceil(targets.untestedDistractorShare * distractors.length) : 0;
    lines.push(`distractor words from the untested list ${fresh}/${distractors.length}${targets ? ` (aim ≥ ${want})` : ""}`);
    if (targets && fresh < want) problems.push(`distractor words: ${fresh} of ${distractors.length} come from the brief's untested list, need ${want}; swap ${want - fresh} other distractors for distractorWords.untested words`);
  }
  const wantKeys = (brief.slots ?? []).filter((s) => s.type === "rc_multi" && s.keys).map((s) => s.keys!);
  if (wantKeys.length) {
    const have = test.questions.filter((q) => q.type === "rc_multi").map((q) => ("sel" in q.key ? q.key.sel.length : 0));
    const same = [...have].sort().join() === [...wantKeys].sort().join();
    lines.push(`select-all key counts ${have.join(", ")}${same ? " (as the brief draws)" : ` (brief draws ${wantKeys.join(", ")}: match it)`}`);
  }
  return { lines, unusedKeys, problems };
}

/**
 * Drill batch: every brief key word spent as a key, and the share of choice words (keys and distractors) drawn from
 * the brief's words (its key words, its untested and review distractor lists, and the key words of the items it revisits).
 */
function drillCoverage(test: Test, brief: Brief) {
  const lines: string[] = [];
  const problems: string[] = [];
  const tagsOf = (role: string) => test.questions.flatMap((q) => q.tags.filter((t) => t.kind === "word" && t.role === role).map((t) => t.id));
  const keyTags = tagsOf("key");
  const unused = (brief.keyWords ?? []).filter((k) => !keyTags.includes(k.id)).map((k) => k.word);
  lines.push(`key words ${(brief.keyWords?.length ?? 0) - unused.length}/${brief.keyWords?.length ?? 0} used as keys${unused.length ? ` (unused: ${unused.join(", ")})` : ""}`);
  const untested = new Set([...(brief.keyWords ?? []), ...(brief.distractorWords?.untested ?? []), ...(brief.distractorWords?.review ?? [])].map((w) => w.id));
  for (const r of brief.revisits ?? []) for (const k of r.keys) untested.add(k);
  const choices = [...new Set([...keyTags, ...tagsOf("distractor")])];
  const fresh = choices.filter((w) => untested.has(w)).length;
  const share = brief.drillTargets?.untestedChoiceShare ?? 0.9;
  const want = Math.ceil(share * choices.length);
  lines.push(`choice words from the brief ${fresh}/${choices.length} (aim ≥ ${want})`);
  if (fresh < want) problems.push(`choice words: ${fresh} of ${choices.length} come from the brief, need ${want}; swap ${want - fresh} for words of the brief's distractor lists (choices not in the bank count against it too)`);
  const seen = new Map<string, number>();
  for (const c of test.questions.flatMap((q) => (q.type === "tc" ? (q.blanks ?? []).flat() : (q.choices ?? [])))) seen.set(c.toLowerCase(), (seen.get(c.toLowerCase()) ?? 0) + 1);
  const tagged = new Set(test.questions.flatMap((q) => q.tags.filter((t) => t.kind === "word" && (t.role === "key" || t.role === "distractor")).map((t) => (q.type === "tc" ? (q.blanks ?? [])[t.at?.[0] ?? -1]?.[t.at?.[1] ?? -1] : (q.choices ?? [])[t.at?.[0] ?? -1])?.toLowerCase())));
  const odd = [...seen].filter(([c, n]) => n > 1 || !tagged.has(c)).map(([c, n]) => (n > 1 ? `${c} ×${n} (repeated; counted once, nothing to fix)` : `${c} (not a bank word)`));
  if (odd.length) lines.push(`${odd.length} choice(s) the drill does not count: ${odd.join(", ")}`);
  return { lines, problems };
}

/**
 * Exposure-only words (data/exposure_only.txt, the passage tier) are shown in passages and stems only. Briefs from
 * that rule on carry `exposureOnlyChoices: false`, and a key or distractor among them is a problem; older tests keep theirs.
 */
function exposureOnlyChoices(test: Test, brief: Brief) {
  if (brief.wordTargets?.exposureOnlyChoices !== false && brief.drillTargets?.exposureOnlyChoices !== false) return [];
  const vocab = JSON.parse(fs.readFileSync("data/vocab.json", "utf8")) as { id: string; exposureOnly?: boolean }[];
  const only = new Set(vocab.filter((v) => v.exposureOnly).map((v) => v.id));
  return test.questions.flatMap((q) =>
    q.tags
      .filter((t) => t.kind === "word" && (t.role === "key" || t.role === "distractor") && only.has(t.id))
      .map((t) => `${q.id}: "${t.id}" is an exposure-only word (passages and stems only); replace this ${t.role} with a brief word`),
  );
}

/** `L5 5/10 (>= half) · levels 4-5` for a drill batch, whose rules replace the section ones. */
const drillLevelLine = (test: Test) => {
  const l5 = test.questions.filter((q) => q.difficulty >= 5).length;
  return `L5 ${l5}/${test.questions.length} (>= half) ${l5 >= test.questions.length / 2 ? "✓" : "✗"} · levels ${DRILL_LEVELS.join("-")}`;
};

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
    if (isDrillId(id)) {
      const c = drillCoverage(test, brief);
      coverage.push(...c.lines);
      problems.push(...c.problems);
    } else if (raw.measure === "verbal") {
      const c = verbalCoverage(test, brief);
      coverage.push(...c.lines);
      unusedKeys = c.unusedKeys;
      problems.push(...c.problems);
    } else coverage.push(...quantCoverage(test, brief));
    problems.push(...exposureOnlyChoices(test, brief));
  } else coverage.push(`no ${briefFile}; coverage against the brief skipped`);
  if (unusedKeys.length && notInBank.size) problems.push(`unused brief key words, to replace a non-bank key: ${unusedKeys.join(", ")}`);

  const head = `${test.questions.length} questions, ${test.passages.length} passages${info.length ? " · " + info.join(" · ") : ""}`;
  report(id, problems, v.warns, [head, `difficulty: ${isDrillId(id) ? drillLevelLine(test) : difficultyLine(test.questions)}`, ...coverage.map((c) => "coverage: " + c)],
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
