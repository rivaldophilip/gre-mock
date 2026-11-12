import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { TestSchema, type Test } from "@/lib/types";
import { matchRevisits, revisitQueue, REVISIT_MAX, type Answered } from "@/lib/priority/revisit";
import { allocateVerbalKeys } from "@/lib/priority/allocate";
import { markPending, scoreAll } from "@/lib/priority/compute";
import { primaryOf } from "@/lib/setup-history";
import { revisitRules, wordReuse } from "@/scripts/validate-test";
import { parseVerdicts } from "@/scripts/novelty-test";

const load = (id: string): Test => TestSchema.parse(JSON.parse(fs.readFileSync(`content/tests/${id}.json`, "utf8")));
const now = new Date("2026-11-12T00:00:00Z");
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000);

describe("revisitQueue", () => {
  const tests = [load("quant-004"), load("quant-005")];
  const ans = (questionId: string, isCorrect: boolean, guessed: boolean, d: number): Answered => ({ questionId, isCorrect, guessed, at: daysAgo(d) });

  it("takes misses and guesses, oldest first, and skips right answers", () => {
    const q = revisitQueue([ans("quant-005:s2q14", false, false, 5), ans("quant-004:s2q3", true, true, 9), ans("quant-004:s1q1", true, false, 9)], tests, now);
    expect(q.map((r) => [r.ref, r.result])).toEqual([
      ["quant-004:s2q3", "guessed"],
      ["quant-005:s2q14", "missed"],
    ]);
  });
  it("waits for spacing and counts only the latest answer", () => {
    expect(revisitQueue([ans("quant-005:s2q14", false, false, 1)], tests, now)).toEqual([]);
    expect(revisitQueue([ans("quant-005:s2q14", false, false, 9), ans("quant-005:s2q14", true, false, 4)], tests, now)).toEqual([]);
  });
  it("skips an item a test already revisits", () => {
    const later = load("quant-005");
    later.id = "quant-099";
    later.questions[0].revisits = "quant-004:s2q3";
    expect(revisitQueue([ans("quant-004:s2q3", false, false, 9)], [...tests, later], now)).toEqual([]);
  });
});

describe("matchRevisits", () => {
  it("gives each target at most one revisit, up to the cap", () => {
    const t = load("quant-005");
    const queue = t.questions.map((question, i) => ({ ref: `quant-005:${question.id}`, testId: t.id, qid: question.id, result: "missed" as const, at: daysAgo(30 - i), question }));
    const targets = [...new Set(t.questions.map((x) => primaryOf(x)!))];
    const m = matchRevisits(targets, queue, (x) => [primaryOf(x)!]);
    expect(m.size).toBe(REVISIT_MAX);
    for (const [i, r] of m) expect(primaryOf(r.question)).toBe(targets[i]);
    expect(new Set([...m.values()].map((r) => r.ref)).size).toBe(m.size);
  });
});

describe("revisitRules", () => {
  it("accepts a link to an earlier item of the same concept and rejects others", () => {
    const t = load("quant-009");
    t.questions.find((q) => q.id === "s2q4")!.revisits = "quant-005:s2q14"; // triangles -> triangles
    t.questions.find((q) => q.id === "s2q3")!.revisits = "quant-005:s2q14"; // std-dev -> triangles
    t.questions.find((q) => q.id === "s1q1")!.revisits = "quant-011:s1q1"; // not earlier
    const out = revisitRules(t).join("\n");
    expect(out).not.toMatch(/s2q4/);
    expect(out).toMatch(/s2q3: revisits quant-005:s2q14 \(triangles\) but tests std-dev-normal/);
    expect(out).toMatch(/s1q1: revisits quant-011:s1q1, which is not an item of an earlier quant test/);
  });
  it("caps revisits per test", () => {
    const t = load("quant-009");
    t.questions.forEach((q) => delete q.revisits);
    t.questions.slice(0, REVISIT_MAX + 1).forEach((q) => (q.revisits = "quant-001:s1q1"));
    expect(revisitRules(t).join("\n")).toMatch(new RegExp(`${REVISIT_MAX + 1} revisits; at most ${REVISIT_MAX}`));
  });
});

describe("wordReuse", () => {
  it("lets a key word return but not its distractors or SE pair", () => {
    const t = load("verbal-011");
    const fake = structuredClone(t);
    // the same item a test later: same keys, same distractors
    fake.id = "verbal-099";
    const out = wordReuse(fake).join("\n");
    expect(out).toMatch(/shares key .* with verbal-011 s1q4 and also its distractor/);
    expect(out).toMatch(/repeats the SE key pair .* of verbal-011/);
  });
  it("leaves tests before the cut-off alone", () => {
    expect(wordReuse(load("verbal-005"))).toEqual([]);
  });
});

describe("secondary-sense top-up", () => {
  it("rotates by how many untaken tests hold a word", () => {
    const items = Array.from({ length: 30 }, (_, i) => ({ id: `w${i}`, yield: i < 6 ? 0.9 : 0.5 }));
    const secondary = (id: string) => Number(id.slice(1)) < 12;
    // the six high-yield secondary words are already held by untaken tests
    const scores = markPending(scoreAll(items, [], now), new Map(["w0", "w1", "w2", "w3", "w4", "w5"].map((w) => [w, ["verbal-010", "verbal-011"]])));
    const keys = allocateVerbalKeys(scores, secondary, 10, () => 0.5).map((k) => k.itemId);
    const held = keys.filter((k) => Number(k.slice(1)) < 6);
    expect(keys.filter(secondary).length).toBeGreaterThanOrEqual(4);
    expect(held).toEqual([]);
  });
});

describe("parseVerdicts on a revisit", () => {
  it("keeps the earlier id for the sibling check", () => {
    expect(parseVerdicts("quant-011 s2q4 | similar | quant-005 s2q14 | obtuse range, run backwards").get("s2q4")?.earlier).toBe("quant-005 s2q14");
  });
});
