import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { TestSchema, type Test } from "@/lib/types";
import { isPhraseBlank, validateTest, verbalFormatRules } from "@/scripts/validate-test";

const blueprint = JSON.parse(fs.readFileSync("data/blueprints.json", "utf8")).verbal;
const load = (id: string) => JSON.parse(fs.readFileSync(`content/tests/${id}.json`, "utf8"));

describe("verbal format rules", () => {
  it("leave tests written before them alone", () => {
    const raw = load("verbal-014");
    expect(validateTest(raw, "verbal-014").errors).toEqual([]);
  });
  it("name the gaps an old-style test has", () => {
    const rules = verbalFormatRules(TestSchema.parse(load("verbal-014")), blueprint).join("\n");
    expect(rules).toMatch(/run past one paragraph/);
    expect(rules).toMatch(/blueprint wants 4 \+ 2 \+ 1/);
    expect(rules).toMatch(/3-blank TC\(s\) of 3-5 sentences/);
    expect(rules).toMatch(/phrase choices/);
    expect(rules).toMatch(/every rc_multi has 2 keys/);
  });
  it("apply from verbal-015 on", () => {
    const raw = { ...load("verbal-014"), id: "verbal-015" };
    expect(validateTest(raw, "verbal-015").errors.filter((e) => e.startsWith("format:")).length).toBeGreaterThan(0);
  });
  it("count a blank as a phrase blank only when every choice is a phrase", () => {
    expect(isPhraseBlank(["at odds with", "wary of", "lend credence to"])).toBe(true);
    expect(isPhraseBlank(["at odds with", "wary", "lend credence to"])).toBe(false);
  });
});

describe("select-in-passage scope", () => {
  const t = load("verbal-014") as Test;
  const q = t.questions.find((x) => x.type === "rc_select" && t.passages.find((p) => p.id === x.passageId)!.paragraphs.length > 1);
  const scoped = (paras: number[]) => {
    const raw = structuredClone(t);
    raw.questions.find((x) => x.id === q!.id)!.paras = paras;
    return validateTest(raw, "verbal-014").errors;
  };
  it("accepts the key's own paragraph and rejects the other", () => {
    expect(q).toBeDefined();
    const outside = [[0], [1]].map((paras) => scoped(paras).some((m) => /outside paras/.test(m)));
    expect(outside.filter(Boolean)).toHaveLength(1);
  });
  it("rejects a paragraph the passage lacks", () => {
    expect(scoped([7]).join("\n")).toMatch(/names a paragraph the passage lacks/);
  });
});

import { splitSentences } from "@/lib/sentences";
describe("boldface argument portions", () => {
  // verbal-015's arg-role item quotes its two statements; from ARG_BOLD_FROM on they must be bold
  const as018 = (bold: boolean) => {
    const t = TestSchema.parse({ ...load("verbal-015"), id: "verbal-018" });
    const q = t.questions.find((x) => x.id === "s1q12")!;
    const a1 = t.passages.find((p) => p.id === "a1")!;
    if (bold) {
      q.prompt = "In the argument above, the two portions in boldface play which of the following roles?";
      a1.paragraphs = [a1.paragraphs[0].replace("This prediction is probably mistaken.", "**This prediction is probably mistaken.**").replace("The district's grain output is therefore", "**The district's grain output is therefore").replace(/fall\.$/, "fall.**")];
    }
    return verbalFormatRules(t, blueprint).join("\n");
  };
  it("asks for bold portions on an arg-role item from verbal-018 on", () => {
    expect(as018(false)).toMatch(/s1q12 \(arg-role\): set the 1-2 portions in \*\*bold\*\*/);
    expect(as018(true)).not.toMatch(/arg-role/);
    expect(verbalFormatRules(TestSchema.parse(load("verbal-015")), blueprint).join("\n")).not.toMatch(/arg-role/);
  });
  it("splits sentences around bold markers", () => {
    expect(splitSentences("Analysts predict congestion. **This prediction is probably mistaken.** The tunnel is low.")).toEqual([
      "Analysts predict congestion.",
      "**This prediction is probably mistaken.**",
      "The tunnel is low.",
    ]);
  });
});

describe("label-colon reading choices", () => {
  it("flags a label-colon choice from verbal-018 on, not before", () => {
    const raw = load("verbal-014");
    const q = raw.questions.find((x: { choices?: string[] }) => x.choices?.some((c) => c.startsWith("unreserved:")));
    expect(verbalFormatRules(TestSchema.parse(raw), blueprint).join("\n")).not.toMatch(/summary label/);
    expect(verbalFormatRules(TestSchema.parse({ ...raw, id: "verbal-018" }), blueprint).join("\n")).toMatch(new RegExp(`${q.id}: \\d choice\\(s\\) open with a summary label`));
  });
});
