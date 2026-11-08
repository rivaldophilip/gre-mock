import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { TestSchema } from "@/lib/types";
import { blindCopy, checkAnswers, keyText, parseAnswers } from "@/scripts/blind-test";
import { validateTest } from "@/scripts/validate-test";

const test = TestSchema.parse(JSON.parse(fs.readFileSync("content/tests/verbal-002.json", "utf8")));
const answers = parseAnswers(fs.readFileSync("tests/fixtures/verbal-002.answers.txt", "utf8"));

describe("blindCopy", () => {
  it("leaves out keys, explanations and difficulty", () => {
    const md = blindCopy(test);
    expect(md).not.toMatch(/"sel"|Trap pair|The look-alike of the key/);
    expect(md).not.toContain(test.questions[0].explanation.key);
    expect(md).toContain("### s2q15 (argument, passage a2)");
    expect(md).toContain("rc-main-idea");
  });
  it("limits the copy to --only items and the passages they use", () => {
    const md = blindCopy(test, new Set(["s2q13"]));
    expect(md).toContain("### p5");
    expect(md).not.toContain("### p1");
  });
});

describe("parseAnswers", () => {
  it("reads table, bullet and bold lines", () => {
    expect([...answers.keys()]).toEqual(["s1q1", "s1q3", "s1q6", "s1q9", "s1q11", "s2q12"]);
    expect(answers.get("s1q9")).toMatchObject({ answer: "A C", confidence: "high", difficulty: 4, skill: "rc-inference" });
  });
  it("keeps the solver's prose under an item as its note", () => {
    const a = parseAnswers("id | answer | confidence | difficulty | skill | problems\ns2q9 | D | low | 5 | rc-inference | B is also defensible\nB fits the second paragraph too.\n\ns1q2 | C | high | 2 | | none");
    expect(a.get("s2q9")?.note).toBe("B fits the second paragraph too.");
    expect(a.get("s1q2")?.note).toBe("");
  });
});

describe("keyText", () => {
  const q = (id: string) => test.questions.find((x) => x.id === id)!;
  it("shows the key the way the solver answers", () => {
    expect(keyText(q("s1q3"))).toBe("B C A");
    expect(keyText(q("s1q6"))).toBe("B E");
    expect(keyText(q("s1q11"))).toBe("sentence 3");
    expect(keyText({ type: "numeric", key: { value: "3/8" } })).toBe("3/8");
  });
});

describe("checkAnswers", () => {
  const only = new Set(answers.keys());
  const { right, total, issues } = checkAnswers(test, answers, 1.5, only);
  const about = (id: string) => issues.filter((i) => i.startsWith(id + " "));
  it("counts matches and reports the wrong sentence", () => {
    expect(total).toBe(6);
    expect(right).toBe(5);
    expect(about("s1q11").join()).toMatch(/WRONG: solver "2" \(high\), key "sentence 3"/);
  });
  it("adds the offset before calling an item too easy", () => {
    expect(about("s1q1")).toEqual([]); // 3 + 1.5 vs target 4
    expect(about("s1q6").join()).toMatch(/too easy/); // 2 + 1.5 vs target 5
  });
  it("offers a retag to the honest level only while the section rules hold", () => {
    expect(about("s1q6").join()).toMatch(/set difficulty 5→4 \(sections still pass\)/); // S1 avg 3.92 -> 3.83
    const tight = { ...test, questions: test.questions.map((q) => (q.id === "s1q1" ? { ...q, difficulty: 3 } : q.id === "s1q3" ? { ...q, difficulty: 4 } : q)) }; // S1 avg 3.75
    const r = checkAnswers(tight, answers, 1.5, only);
    expect(r.issues.find((i) => i.startsWith("s1q6 ") && i.includes("too easy"))).toMatch(/would break S1 avg 3.67/);
    expect(r.act).toContain("s1q6");
  });
  it("flags real problems, a wrong skill, but not a secondary skill", () => {
    expect(about("s1q6").join()).toMatch(/flagged/);
    expect(about("s1q9")).toEqual([]);
    expect(about("s2q12").join()).toMatch(/skill/);
  });
});

describe("validateTest", () => {
  it("names schema errors by question id, not array index", () => {
    const raw = JSON.parse(fs.readFileSync("content/tests/verbal-002.json", "utf8"));
    delete raw.questions[3].key;
    const { errors, schemaFailed } = validateTest(raw, "verbal-002");
    expect(schemaFailed).toBe(true);
    expect(errors[0]).toMatch(/^s1q4 \(se\)\.key: /);
  });
});
