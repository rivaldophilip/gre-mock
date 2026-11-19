// Fill the word tags of a verbal test from its text, so authors never write them.  usage: npm run tag -- verbal-003
// TC/SE choices that are bank words get key/distractor tags with `at`. The other GRE words a reader sees get `stem`
// (question text) and `passage` tags: every bank word except the secondary-sense ones (whose everyday use is not the
// GRE word), plus the brief's passage words. Review and Practice ask about these; untapped ones log seen_known.
// Concept (reading-skill) tags are left as the author wrote them. Safe to re-run.
import fs from "node:fs";
import type { Question, Tag, Test } from "../lib/types";
import { vocabIndex, wordIdOf, type VocabEntry } from "../lib/vocab-match";
import { testPath, writeTestFile } from "./lib/test-file";

type Raw = Omit<Test, "questions" | "passages"> & { questions: (Question & { tags?: Tag[] })[]; passages?: { id: string; paragraphs: string[]; tags?: Tag[] }[] };

/** Surface forms that match a bank word by inflection or spelling but are not that word ("according to", "species", the late "novels"). */
const NOT_THE_WORD = new Set(["according", "accordingly", "species", "novels", "novelist", "novelists"]);

/** The bank words in a text that count as GRE words when they are not the answer choices: secondary-sense ones are left out. */
function gre(text: string, index: Map<string, string>, secondary: Set<string>, wanted: Set<string> = new Set()): Set<string> {
  const found = new Set<string>();
  for (const token of text.toLowerCase().match(/[a-z][a-z-]*/g) ?? []) {
    if (NOT_THE_WORD.has(token)) continue;
    const id = wordIdOf(token, index);
    if (id && (wanted.has(id) || !secondary.has(id))) found.add(id);
  }
  return found;
}

export function tagTest(test: Raw, vocab: (VocabEntry & { isSecondary?: boolean })[], passageWords: string[] = []) {
  const index = vocabIndex(vocab);
  const secondary = new Set(vocab.filter((v) => v.isSecondary).map((v) => v.id));
  const untagged: string[] = [];
  const missingKeys: { id: string; text: string }[] = [];
  for (const q of test.questions) {
    if (q.type !== "tc" && q.type !== "se") continue;
    const sel = "sel" in q.key ? q.key.sel : [];
    const words: Tag[] = [];
    const slots: [string, number[], boolean][] =
      q.type === "tc"
        ? (q.blanks ?? []).flatMap((b, i) => b.map((c, j) => [c, [i, j], sel[i] === j] as [string, number[], boolean]))
        : (q.choices ?? []).map((c, j) => [c, [j], sel.includes(j)] as [string, number[], boolean]);
    for (const [text, at, isKey] of slots) {
      const id = wordIdOf(text, index);
      if (id) words.push({ kind: "word", id, role: isKey ? "key" : "distractor", at });
      else if (isKey) missingKeys.push({ id: q.id, text });
      else untagged.push(`${q.id} "${text}"`);
    }
    q.tags = [...(q.tags ?? []).filter((t) => !(t.kind === "word" && (t.role === "key" || t.role === "distractor"))), ...words];
  }
  // question text: the prompt, and the choices of a question whose choices are not tagged as words (RC, arguments)
  for (const q of test.questions) {
    const own = new Set((q.tags ?? []).filter((t) => t.kind === "word" && t.role !== "stem").map((t) => t.id));
    const text = [q.prompt, ...(q.type === "tc" || q.type === "se" ? [] : (q.choices ?? []))].join(" ");
    const found = [...gre(text, index, secondary)].filter((id) => !own.has(id));
    q.tags = [...(q.tags ?? []).filter((t) => !(t.kind === "word" && t.role === "stem")), ...found.map((id): Tag => ({ kind: "word", id, role: "stem" }))];
  }
  const wanted = new Set(passageWords);
  for (const p of test.passages ?? []) {
    const have = new Set((p.tags ?? []).map((t) => t.id));
    const found = [...gre(p.paragraphs.join(" "), index, secondary, wanted)].filter((id) => !have.has(id));
    p.tags = [...(p.tags ?? []), ...found.map((id): Tag => ({ kind: "word", id, role: "passage" }))];
  }
  return { untagged, missingKeys };
}

if (process.argv[1]?.endsWith("tag-test.ts")) {
  const id = process.argv[2];
  if (!id) {
    console.error("usage: npm run -s tag -- <test-id>");
    process.exit(1);
  }
  const file = testPath(id);
  const test = JSON.parse(fs.readFileSync(file, "utf8")) as Raw;
  if (test.measure !== "verbal") {
    console.log("quant tests carry concept tags only; nothing to tag");
    process.exit(0);
  }
  const vocab = JSON.parse(fs.readFileSync("data/vocab.json", "utf8")) as VocabEntry[];
  const briefFile = `content/briefs/${id}.json`;
  const brief = fs.existsSync(briefFile) ? JSON.parse(fs.readFileSync(briefFile, "utf8")) : {};
  const { untagged, missingKeys } = tagTest(test, vocab, (brief.passageWords ?? []).map((w: { id: string }) => w.id));
  writeTestFile(id, test);
  const n = test.questions.reduce((a, q) => a + (q.tags ?? []).filter((t) => t.kind === "word" && t.role !== "stem").length, 0);
  const ns = test.questions.reduce((a, q) => a + (q.tags ?? []).filter((t) => t.kind === "word" && t.role === "stem").length, 0);
  const np = (test.passages ?? []).reduce((a, p) => a + (p.tags ?? []).length, 0);
  console.log(`tagged ${id}: ${n} choice tags, ${ns} question-text tags, ${np} passage tags`);
  if (untagged.length) console.log(`not bank words (left untagged, fine for distractors): ${untagged.join(", ")}`);
  if (missingKeys.length) {
    console.error(`KEY CHOICES NOT IN THE BANK (use a bank word, or add it to data/definitions.json and rebuild vocab): ${missingKeys.map((m) => `${m.id} "${m.text}"`).join(", ")}`);
    process.exit(1);
  }
}
