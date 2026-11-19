import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { TestSchema, type Question } from "@/lib/types";
import { choiceWordIds, drawDrill, drawMiss, drillWeight, latestMisses, type DrillItem, type LockedAnswer } from "@/lib/drill-pick";
import { isDrillId, testPath } from "@/lib/test-path";
import { attemptNumbers, isListed } from "@/lib/attempt-summary";
import { drillRules, validateTest } from "@/scripts/validate-test";
import { earlierTests } from "@/lib/setup-history";

const item = (testId: string, id: string, words: string[]): DrillItem => ({
  testId,
  q: {
    id, section: 1, type: "se", difficulty: 5, prompt: "… ___ …", choices: words, key: { sel: [0, 1] },
    explanation: { key: "…" },
    tags: words.map((w, i) => ({ kind: "word" as const, id: w, role: i < 2 ? ("key" as const) : ("distractor" as const), at: [i] })),
  } as Question,
});

describe("drill picking", () => {
  const fresh = item("drill-001", "s1q1", ["a", "b", "c", "d", "e", "f"]);
  const seen = item("drill-001", "s1q2", ["g", "h", "i", "j", "k", "l"]);
  const untested = (w: string) => "abcdef".includes(w);

  it("never serves an answered item, and returns null once the pool is empty", () => {
    expect(drawDrill([fresh, seen], new Set(["drill-001:s1q1"]), untested)?.q.id).toBe("s1q2");
    expect(drawDrill([fresh, seen], new Set(["drill-001:s1q1", "drill-001:s1q2"]), untested)).toBeNull();
  });

  it("skips the item on screen unless it is the last one", () => {
    expect(drawDrill([fresh, seen], new Set(), untested, () => 0, "drill-001:s1q1")?.q.id).toBe("s1q2");
    expect(drawDrill([fresh], new Set(), untested, () => 0, "drill-001:s1q1")?.q.id).toBe("s1q1");
  });

  it("weights items by their untested choice words", () => {
    expect(choiceWordIds(fresh.q)).toHaveLength(6);
    expect(drillWeight(6)).toBe(49);
    expect(drillWeight(0)).toBe(1);
    // weights 49 and 1: a draw below 49/50 lands on the fresh item
    expect(drawDrill([fresh, seen], new Set(), untested, () => 0.97)?.q.id).toBe("s1q1");
    expect(drawDrill([fresh, seen], new Set(), untested, () => 0.99)?.q.id).toBe("s1q2");
  });
});

describe("miss replay pool", () => {
  const mock = item("verbal-003", "s1q4", ["a", "b", "c", "d", "e", "f"]);
  const drill = item("drill-001", "s1q1", ["g", "h", "i", "j", "k", "l"]);
  const items = new Map([mock, drill].map((x) => [`${x.testId}:${x.q.id}`, x]));
  let id = 0;
  const ans = (questionId: string, day: number, isCorrect: boolean, guessed = false): LockedAnswer => ({ questionId, isCorrect, guessed, updatedAt: new Date(2026, 10, day), id: ++id });
  const refs = (a: LockedAnswer[]) => latestMisses(a, items).map((x) => `${x.testId}:${x.q.id}`).sort();

  it("holds TC / SE items whose latest answer, in any attempt, was wrong or guessed", () => {
    expect(refs([ans("verbal-003:s1q4", 1, false), ans("drill-001:s1q1", 1, true, true)])).toEqual(["drill-001:s1q1", "verbal-003:s1q4"]);
    expect(refs([ans("verbal-003:s1q4", 1, true)])).toEqual([]);
  });

  it("drops an item once a later answer is right and not guessed, and takes it back on a later miss", () => {
    expect(refs([ans("verbal-003:s1q4", 1, false), ans("verbal-003:s1q4", 2, true)])).toEqual([]);
    expect(refs([ans("verbal-003:s1q4", 2, true), ans("verbal-003:s1q4", 1, false)])).toEqual([]);
    expect(refs([ans("verbal-003:s1q4", 1, false), ans("verbal-003:s1q4", 2, true), ans("verbal-003:s1q4", 3, false)])).toEqual(["verbal-003:s1q4"]);
    expect(refs([ans("verbal-003:s1q4", 1, false), ans("verbal-003:s1q4", 2, true, true)])).toEqual(["verbal-003:s1q4"]);
  });

  it("ignores questions outside the vocab items (RC, quant)", () => {
    expect(refs([ans("verbal-003:s1q9", 1, false), ans("quant-001:s1q1", 1, false)])).toEqual([]);
  });

  it("skips the miss on screen unless it is the only one", () => {
    expect(drawMiss([mock, drill], () => 0, "verbal-003:s1q4")).toBe(drill);
    expect(drawMiss([mock], () => 0, "verbal-003:s1q4")).toBe(mock);
    expect(drawMiss([], () => 0)).toBeNull();
  });

  it("replay attempts stay out of mock lists", () => {
    expect(isListed({ testId: "verbal-003", startedAt: new Date(), abandonedAt: null, sectionState: {}, id: 1, mode: "replay" })).toBe(false);
  });
});

describe("drill batches", () => {
  it("live in content/drill", () => {
    expect(isDrillId("drill-001")).toBe(true);
    expect(isDrillId("verbal-001")).toBe(false);
    expect(testPath("drill-001")).toBe("content/drill/drill-001.json");
    expect(testPath("verbal-001")).toBe("content/tests/verbal-001.json");
  });

  it("are left out of mock attempt lists and numbering", () => {
    const base = { testId: "drill-001", startedAt: new Date(), abandonedAt: null, sectionState: {} };
    expect(isListed({ ...base, id: 1, mode: "drill" })).toBe(false);
    expect(isListed({ ...base, id: 2, mode: "practice" })).toBe(true);
    expect(attemptNumbers([{ ...base, id: 1, mode: "drill" }]).size).toBe(0);
  });

  it("are compared with every verbal mock and earlier batches only", () => {
    const ids = earlierTests({ id: "drill-001", measure: "verbal" }).map((t) => t.id);
    expect(ids).toContain("verbal-001");
    expect(ids.some((id) => isDrillId(id))).toBe(false);
  });

  it("drillRules: tc / se only, section 1, levels 4-5 with half at 5", () => {
    const t = TestSchema.parse({
      id: "drill-099", measure: "verbal", title: "x", sections: [{ n: 1, minutes: 60 }, { n: 2, minutes: 1 }],
      questions: [{ ...item("drill-099", "s1q1", ["a", "b", "c", "d", "e", "f"]).q, difficulty: 3 }, { ...item("drill-099", "s1q2", ["a", "b", "c", "d", "e", "f"]).q, section: 2 }],
    });
    const out = drillRules(t).join("\n");
    expect(out).toMatch(/s1q1: difficulty 3/);
    expect(out).toMatch(/s1q2: section 2/);
  });

  it("every batch on disk validates", () => {
    const dir = "content/drill";
    for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")) : []) {
      const id = f.replace(/\.json$/, "");
      expect(validateTest(JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8")), id).errors, id).toEqual([]);
    }
  });
});
