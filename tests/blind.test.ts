import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { TestSchema } from "@/lib/types";
import { blindCopy, checkAnswers, parseAnswers } from "@/scripts/blind-test";

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
    expect(answers.get("s1q9")).toMatchObject({ answer: "A C", difficulty: 4, skill: "rc-inference" });
  });
});

describe("checkAnswers", () => {
  const only = new Set(answers.keys());
  const { right, total, issues } = checkAnswers(test, answers, 1.5, only);
  const about = (id: string) => issues.filter((i) => i.startsWith(id + " "));
  it("counts matches and reports the wrong sentence", () => {
    expect(total).toBe(6);
    expect(right).toBe(5);
    expect(about("s1q11").join()).toMatch(/WRONG/);
  });
  it("adds the offset before calling an item too easy", () => {
    expect(about("s1q1")).toEqual([]); // 3 + 1.5 vs target 4
    expect(about("s1q6").join()).toMatch(/too easy/); // 2 + 1.5 vs target 5
  });
  it("flags real problems, a wrong skill, but not a secondary skill", () => {
    expect(about("s1q6").join()).toMatch(/flagged/);
    expect(about("s1q9")).toEqual([]);
    expect(about("s2q12").join()).toMatch(/skill/);
  });
});
