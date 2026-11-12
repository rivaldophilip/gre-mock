// Novelty copy for the judge, and a checker for its verdicts: is each new item a setup an earlier test already used?
//   npm run -s novelty -- <id>                      write content/.blind/<id>.novelty.md (each item beside the earlier items it could repeat)
//   npm run -s novelty -- <id> --only s1q3,p2       just those items (or verbal passages), in <id>.novelty.only.md
//   npm run -s novelty -- <id> --check [file|-] [--only ids]
//       read the judge's lines, print what to rewrite, then the next step. "-" reads stdin and saves it beside the copy.
//   npm run -s novelty -- --audit quant|verbal [--tests id,id]   a novelty copy for every listed test (default: all)
// Earlier means a lower test number, so the first use of a setup stays and later copies are the ones to rewrite.
import fs from "node:fs";
import { TestSchema, type Question, type Test } from "../lib/types";
import { itemText, measureTests, pastItems, primaryOf, setupOverlap, setupText, type PastItem } from "../lib/setup-history";
import { containment, shingles } from "../lib/ngram";
import { die, readTestFile } from "./lib/test-file";

const DIR = "content/.blind";
/** Other-concept items shown beside a quant item when their masked stems overlap at least this much. */
const CROSS_TH = 0.2;
const CROSS_MAX = 3;
/** Earlier TC / SE items shown per verbal item (those sharing a key word, then the closest wording). */
const VERBAL_MAX = 5;

const testNo = (id: string) => Number(/-(\d+)$/.exec(id)?.[1] ?? 0);
const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();

const keyWords = (q: Question) => new Set(q.tags.filter((t) => t.kind === "word" && t.role === "key").map((t) => t.id));

function quantSections(test: Test, earlier: PastItem[], only?: Set<string>): string[] {
  const out: string[] = [];
  for (const q of test.questions) {
    if (only && !only.has(q.id)) continue;
    const c = primaryOf(q);
    const same = earlier.filter((e) => e.concept === c);
    const cross = earlier
      .filter((e) => e.concept !== c)
      .map((e) => ({ e, s: setupOverlap(setupText(q), e.text) }))
      .filter((x) => x.s >= CROSS_TH)
      .sort((a, b) => b.s - a.s)
      .slice(0, CROSS_MAX)
      .map((x) => x.e);
    out.push(`### ${test.id} ${q.id} (${q.type}, ${c})`, itemText(q), "");
    if (q.revisits) out.push(revisitNote(q.revisits), "");
    out.push(same.length || cross.length ? "Earlier items:" : "Earlier items: none");
    for (const e of [...same, ...cross]) out.push(`- ${e.testId} ${e.qid}${e.concept !== c ? ` (${e.concept})` : ""}: ${e.shown}${e.setup !== e.text ? ` [setup: ${e.setup}]` : ""}`);
    out.push("");
  }
  return out;
}

function verbalSections(test: Test, earlierTests: Test[], only?: Set<string>): string[] {
  const out: string[] = [];
  const isArg = (t: Test, pid: string) => t.questions.some((q) => q.passageId === pid && q.subtype === "arg");
  const pText = (t: Test, pid: string) => oneLine(t.passages.find((p) => p.id === pid)!.paragraphs.join(" "));
  // passages: reading passages against earlier reading passages (opening), arguments against earlier arguments (whole)
  for (const p of test.passages) {
    if (only && !only.has(p.id)) continue;
    const arg = isArg(test, p.id);
    out.push(`### ${test.id} ${p.id} (${arg ? "argument" : "reading passage"})`, arg ? pText(test, p.id) : pText(test, p.id).slice(0, 600), "", "Earlier items:");
    for (const t of earlierTests)
      for (const e of t.passages.filter((x) => isArg(t, x.id) === arg))
        out.push(`- ${t.id} ${e.id}: ${arg ? pText(t, e.id) : `${e.title ? e.title + ": " : ""}${pText(t, e.id).slice(0, 220)}…`}`);
    out.push("");
  }
  // TC and SE: earlier items that share a key word, then the closest wording
  const pool = earlierTests.flatMap((t) => t.questions.filter((q) => q.type === "tc" || q.type === "se").map((q) => ({ t, q })));
  for (const q of test.questions.filter((x) => x.type === "tc" || x.type === "se")) {
    if (only && !only.has(q.id)) continue;
    const keys = keyWords(q);
    const mine = shingles(q.prompt, 3);
    const ranked = pool
      .map((x) => ({ ...x, shared: [...keyWords(x.q)].filter((k) => keys.has(k)).length, s: containment(mine, shingles(x.q.prompt, 3)) }))
      .filter((x) => x.shared > 0 || x.s >= 0.15)
      .sort((a, b) => b.shared - a.shared || b.s - a.s)
      .slice(0, VERBAL_MAX);
    const revisited = q.revisits ? pool.find((x) => `${x.t.id}:${x.q.id}` === q.revisits) : undefined;
    if (revisited && !ranked.some((x) => x.t.id === revisited.t.id && x.q.id === revisited.q.id)) ranked.unshift({ ...revisited, shared: 0, s: 0 });
    out.push(`### ${test.id} ${q.id} (${q.type})`, itemText(q), "", ...(q.revisits ? [revisitNote(q.revisits), ""] : []), ranked.length ? "Earlier items:" : "Earlier items: none");
    for (const x of ranked) out.push(`- ${x.t.id} ${x.q.id}: ${itemText(x.q)}`);
    out.push("");
  }
  return out;
}

/** A revisit is meant to be close to its earlier item: the judge is told which one, so `similar` to it passes. */
const revisitNote = (ref: string) =>
  `Deliberate revisit of ${ref.replace(":", " ")}: a sibling of that item is intended. Judge it **similar** if it keeps the insight but makes a real structural change, **same** if it does not. Judge it against the other earlier items as usual.`;

export function noveltyCopy(test: Test, dir = "content/tests", only?: Set<string>): string {
  const head = [
    `# Novelty check: ${test.id}`,
    "",
    "Each item below is followed by earlier items it could repeat. Judge each item against them only.",
    "",
  ];
  const body =
    test.measure === "quant"
      ? quantSections(test, pastItems("quant", test.id, dir), only)
      : verbalSections(test, measureTests("verbal", dir).filter((t) => testNo(t.id) < testNo(test.id)), only);
  return [...head, ...body].join("\n");
}

export type Verdict = { id: string; verdict: "new" | "similar" | "same"; earlier: string; note: string };

/** Lines like `quant-011 s1q3 | same | quant-004 s2q2 | note` (the test id may be left out); tolerant of markdown. */
export function parseVerdicts(text: string): Map<string, Verdict> {
  const out = new Map<string, Verdict>();
  for (const raw of text.split("\n")) {
    const line = raw.replace(/^[\s*>`-]+|[`*]+$/g, "").trim();
    const cells = line.split("|").map((c) => c.trim());
    if (cells.length < 3) continue;
    const id = /(?:^|\s)((?:s\d+q\d+)|(?:[pa]\d+))$/.exec(cells[0])?.[1];
    const verdict = cells[1].toLowerCase();
    if (!id || !["new", "similar", "same"].includes(verdict)) continue;
    out.set(id, { id, verdict: verdict as Verdict["verdict"], earlier: cells[2] ?? "-", note: cells.slice(3).join(" | ") });
  }
  return out;
}

/** Where the novelty check is recorded; `register` warns when a test has none. */
export const noveltyRecord = (id: string) => `${DIR}/${id}.novelty.json`;

function readReply(args: string[], fallback: string, again: string): string {
  const v = args[args.indexOf("--check") + 1];
  if (v === "-") {
    const text = fs.readFileSync(0, "utf8");
    fs.writeFileSync(fallback, text);
    return text;
  }
  const file = !v || v.startsWith("--") ? fallback : v;
  if (!fs.existsSync(file)) die(`no ${file}. Pipe the judge's reply instead: ${again} --check - <<'EOF' … EOF`);
  return fs.readFileSync(file, "utf8");
}

function main() {
  const args = process.argv.slice(2);
  const opt = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
  fs.mkdirSync(DIR, { recursive: true });
  if (args[0] === "--audit") {
    const measure = args[1];
    if (measure !== "verbal" && measure !== "quant") die("usage: npm run -s novelty -- --audit quant|verbal [--tests id,id]");
    const wanted = opt("--tests")?.split(",").map((x) => x.trim());
    const tests = measureTests(measure).filter((t) => (wanted ? wanted.includes(t.id) : testNo(t.id) > 1));
    for (const t of tests) fs.writeFileSync(`${DIR}/${t.id}.novelty.md`, noveltyCopy(t));
    console.log(`wrote ${tests.map((t) => `${DIR}/${t.id}.novelty.md`).join(", ")}`);
    console.log("next: give each path to the gre-novelty-judge agent, then npm run -s novelty -- <id> --check - <<'EOF' with its reply");
    return;
  }
  const id = args[0];
  const usage = "npm run -s novelty -- <test-id> [--only ids] [--check [file|-]]";
  const parsed = TestSchema.safeParse(readTestFile(id, usage));
  if (!parsed.success) die(`${id} does not parse as a test; run npm run -s check -- ${id} and fix what it reports first`);
  const test = parsed.data;
  const ids = new Set([...test.questions.map((q) => q.id), ...test.passages.map((p) => p.id)]);
  const only = opt("--only") ? new Set(opt("--only")!.split(",").map((x) => x.trim())) : undefined;
  const unknown = [...(only ?? [])].filter((x) => !ids.has(x));
  if (unknown.length) die(`--only names ids not in ${id}: ${unknown.join(", ")} (questions look like s1q3, passages like p2)`);
  const base = `${DIR}/${id}.novelty${only ? ".only" : ""}`;
  const again = `npm run -s novelty -- ${id}${only ? ` --only ${[...only].join(",")}` : ""}`;
  if (!args.includes("--check")) {
    fs.writeFileSync(`${base}.md`, noveltyCopy(test, "content/tests", only));
    console.log(`wrote ${base}.md`);
    console.log(`next: ${only ? "SendMessage the same gre-novelty-judge agent" : "give the gre-novelty-judge agent"} the path ${base}.md, then ${again} --check - <<'EOF' with its reply`);
    return;
  }
  const verdicts = parseVerdicts(readReply(args, `${base}.txt`, again));
  const judged = test.measure === "quant" ? test.questions.map((q) => q.id) : [...test.passages.map((p) => p.id), ...test.questions.filter((q) => q.type === "tc" || q.type === "se").map((q) => q.id)];
  const expected = judged.filter((x) => !only || only.has(x));
  const missing = expected.filter((x) => !verdicts.has(x));
  // a revisit judged similar to the item it revisits is what was asked for; anything else that repeats is a rewrite
  const revisitOf = new Map(test.questions.filter((q) => q.revisits).map((q) => [q.id, q.revisits!.replace(":", " ")]));
  const allowed = (v: Verdict) => v.verdict === "similar" && revisitOf.get(v.id) === v.earlier.replace(":", " ").trim();
  const flagged = expected.flatMap((x) => (verdicts.get(x) && verdicts.get(x)!.verdict !== "new" && !allowed(verdicts.get(x)!) ? [verdicts.get(x)!] : []));
  fs.writeFileSync(noveltyRecord(id), JSON.stringify({ at: new Date().toISOString(), only: only ? [...only] : null, judged: expected.length - missing.length, flagged: flagged.map((f) => f.id) }) + "\n");
  const sibs = expected.filter((x) => verdicts.get(x) && allowed(verdicts.get(x)!)).length;
  console.log(`${id}: ${expected.length - missing.length}/${expected.length} items judged, ${flagged.length} repeat${flagged.length === 1 ? "" : "s"}${sibs ? `, ${sibs} revisit${sibs === 1 ? "" : "s"} judged a sibling` : ""}`);
  for (const f of flagged)
    console.log(`  ${f.id}: ${f.verdict.toUpperCase()} as ${f.earlier}${f.note ? ` (${f.note})` : ""}; ${f.verdict === "same" ? "rewrite with a setup the brief does not list" : "rewrite unless the decisive step really differs"}`);
  if (missing.length) console.log(`  no verdict for ${missing.join(", ")}: ask the judge for those lines`);
  const act = flagged.map((f) => f.id);
  console.log(
    act.length
      ? `next: rewrite ${act.join(", ")} with Edit, npm run -s check -- ${id}, npm run -s blind -- ${id} --only ${act.filter((x) => /^s\d/.test(x)).join(",") || "<ids>"} (solver), then ${`npm run -s novelty -- ${id} --only ${act.join(",")}`} and SendMessage the same judge the new file`
      : `next: npm run -s register -- ${id}, then commit and push`,
  );
}

if (process.argv[1]?.endsWith("novelty-test.ts")) main();
