// Fill the word tags of a verbal test from its text, so authors never write them.  usage: npm run tag -- verbal-003
// TC/SE choices that are bank words get key/distractor tags with `at`; passages get the brief's passage words they use.
// Concept (reading-skill) tags are left as the author wrote them. Safe to re-run.
import fs from "node:fs";
import type { Question, Tag, Test } from "../lib/types";
import { vocabIndex, wordIdOf, type VocabEntry } from "../lib/vocab-match";

type Raw = Omit<Test, "questions" | "passages"> & { questions: (Question & { tags?: Tag[] })[]; passages?: { id: string; paragraphs: string[]; tags?: Tag[] }[] };

export function tagTest(test: Raw, vocab: VocabEntry[], passageWords: string[] = []) {
  const index = vocabIndex(vocab);
  const untagged: string[] = [];
  const missingKeys: string[] = [];
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
      else (isKey ? missingKeys : untagged).push(`${q.id} "${text}"`);
    }
    q.tags = [...(q.tags ?? []).filter((t) => !(t.kind === "word" && (t.role === "key" || t.role === "distractor"))), ...words];
  }
  const wanted = new Set(passageWords);
  for (const p of test.passages ?? []) {
    const have = new Set((p.tags ?? []).map((t) => t.id));
    const found = new Set<string>();
    for (const token of p.paragraphs.join(" ").toLowerCase().match(/[a-z][a-z-]*/g) ?? []) {
      const id = wordIdOf(token, index);
      if (id && wanted.has(id) && !have.has(id)) found.add(id);
    }
    p.tags = [...(p.tags ?? []), ...[...found].map((id): Tag => ({ kind: "word", id, role: "passage" }))];
  }
  return { untagged, missingKeys };
}

if (process.argv[1]?.endsWith("tag-test.ts")) {
  const id = process.argv[2];
  if (!id) {
    console.error("usage: npm run tag -- <test-id>");
    process.exit(1);
  }
  const file = `content/tests/${id}.json`;
  const test = JSON.parse(fs.readFileSync(file, "utf8")) as Raw;
  if (test.measure !== "verbal") {
    console.log("quant tests carry concept tags only; nothing to tag");
    process.exit(0);
  }
  const vocab = JSON.parse(fs.readFileSync("data/vocab.json", "utf8")) as VocabEntry[];
  const briefFile = `content/briefs/${id}.json`;
  const brief = fs.existsSync(briefFile) ? JSON.parse(fs.readFileSync(briefFile, "utf8")) : {};
  const { untagged, missingKeys } = tagTest(test, vocab, (brief.passageWords ?? []).map((w: { id: string }) => w.id));
  fs.writeFileSync(file, JSON.stringify(test, null, 1) + "\n");
  const n = test.questions.reduce((a, q) => a + (q.tags ?? []).filter((t) => t.kind === "word").length, 0);
  const np = (test.passages ?? []).reduce((a, p) => a + (p.tags ?? []).length, 0);
  console.log(`tagged ${id}: ${n} choice tags, ${np} passage tags`);
  if (untagged.length) console.log(`not bank words (left untagged, fine for distractors): ${untagged.join(", ")}`);
  if (missingKeys.length) {
    console.error(`KEY CHOICES NOT IN THE BANK (use a bank word, or add it to data/definitions.json and rebuild vocab): ${missingKeys.join(", ")}`);
    process.exit(1);
  }
}
