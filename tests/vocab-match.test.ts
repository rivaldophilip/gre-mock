import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { baseForms, choiceIsWord, vocabIndex, wordIdOf, type VocabEntry } from "@/lib/vocab-match";
import { tagTest } from "@/scripts/tag-test";

const vocab = JSON.parse(fs.readFileSync("data/vocab.json", "utf8")) as VocabEntry[];
const index = vocabIndex(vocab);

describe("wordIdOf", () => {
  it("matches regular inflections to the bank lemma", () => {
    expect(wordIdOf("disparaging", index)).toBe("disparage");
    expect(wordIdOf("lionized", index)).toBe("lionize");
    expect(wordIdOf("mendicants", index)).toBe("mendicant");
    expect(wordIdOf("vilified", index)).toBe("vilify");
    expect(wordIdOf("exculpating", index)).toBe("exculpate");
    expect(wordIdOf("Appropriated", index)).toBe("appropriate");
  });
  it("returns null for words outside the bank", () => {
    expect(wordIdOf("synthetic", index)).toBeNull();
    expect(wordIdOf("at odds with", index)).toBeNull();
  });
  it("finds the bank word inside a phrase choice", () => {
    expect(wordIdOf("a perfunctory", index)).toBe("perfunctory");
    expect(wordIdOf("lend credence to", index)).toBe("credence");
    expect(wordIdOf("impervious to", index)).toBe("impervious");
  });
  it("lists the literal form first", () => {
    expect(baseForms("abetted")).toEqual(expect.arrayContaining(["abetted", "abet"]));
  });
});

describe("choiceIsWord", () => {
  it("accepts inflections the old prefix rule rejected", () => {
    const v = vocab.find((x) => x.id === "disparage")!;
    expect(choiceIsWord("disparaging", v)).toBe(true);
    expect(choiceIsWord("extol", v)).toBe(false);
  });
  it("accepts a phrase that holds the word", () => {
    const v = vocab.find((x) => x.id === "credence")!;
    expect(choiceIsWord("lend credence to", v)).toBe(true);
    expect(choiceIsWord("lend support to", v)).toBe(false);
  });
});

describe("tagTest", () => {
  for (const id of ["verbal-001", "verbal-002"]) {
    it(`rebuilds the committed choice tags of ${id}`, () => {
      const orig = JSON.parse(fs.readFileSync(`content/tests/${id}.json`, "utf8"));
      const copy = structuredClone(orig);
      for (const q of copy.questions) q.tags = q.tags.filter((t: { kind: string; role: string }) => !(t.kind === "word" && ["key", "distractor"].includes(t.role)));
      const { missingKeys } = tagTest(copy, vocab);
      expect(missingKeys).toEqual([]);
      const norm = (qs: { tags: unknown[] }[]) => qs.map((q) => q.tags.map((t) => JSON.stringify(t)).sort());
      expect(norm(copy.questions)).toEqual(norm(orig.questions));
    });
  }
  it("tags the GRE words in question text and passages, leaving out choice words, secondary-sense words and misfires", () => {
    const raw = {
      id: "t", measure: "verbal", title: "t",
      questions: [
        { id: "q1", section: 1, type: "se", difficulty: 4, prompt: "The critic would not concede the ___ point, still sure of it, according to the species list.", choices: ["obdurate", "candid", "a", "b", "c", "d"], key: { sel: [0, 1] }, explanation: { key: "k" }, tags: [] },
        { id: "q2", section: 1, type: "rc", difficulty: 4, prompt: "The author mentions the digression in order to", passageId: "p1", choices: ["refute a claim", "b", "c", "d", "e"], key: { sel: [0] }, explanation: { key: "k" }, tags: [] },
      ],
      passages: [{ id: "p1", paragraphs: ["A provincial reading of the late novels."], tags: [] }],
    };
    tagTest(raw as never, vocab);
    const stem = (i: number) => raw.questions[i].tags.filter((t: { role: string }) => t.role === "stem").map((t: { id: string }) => t.id);
    // "still" is secondary-sense, "according"/"species" are not those bank words; choices carry their own tags
    expect(stem(0)).toEqual(["concede"]);
    expect(stem(1)).toEqual(["digression", "refute"]);
    expect(raw.passages[0].tags.map((t: { id: string }) => t.id)).toEqual(["provincial"]);
    // safe to re-run
    tagTest(raw as never, vocab);
    expect(stem(0)).toEqual(["concede"]);
    expect(raw.passages[0].tags).toHaveLength(1);
  });
});
