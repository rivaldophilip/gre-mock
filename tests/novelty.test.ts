import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { TestSchema } from "@/lib/types";
import { publicTest } from "@/lib/content";

vi.mock("server-only", () => ({}));
import { conceptHistory, setupOverlap, setupText, testVariants } from "@/lib/setup-history";
import { SETUP_TH } from "@/lib/ngram";
import { noveltyCopy, parseVerdicts } from "@/scripts/novelty-test";
import { sameSetups, validateTest } from "@/scripts/validate-test";

const load = (id: string) => TestSchema.parse(JSON.parse(fs.readFileSync(`content/tests/${id}.json`, "utf8")));
const item = (id: string, qid: string) => load(id).questions.find((q) => q.id === qid)!;

describe("setupOverlap", () => {
  it("matches a setup reused with new numbers and names", () => {
    // two values at mean ± 1 SD added to a list, compare the new SD
    expect(setupOverlap(setupText(item("quant-001", "s2q2")), setupText(item("quant-005", "s1q4")))).toBeGreaterThanOrEqual(SETUP_TH);
    // a 45°-30° triangle split by an altitude
    expect(setupOverlap(setupText(item("quant-003", "s2q11")), setupText(item("quant-004", "s2q12")))).toBeGreaterThanOrEqual(SETUP_TH);
  });
  it("leaves different setups of one concept apart", () => {
    expect(setupOverlap(setupText(item("quant-010", "s1q4")), setupText(item("quant-004", "s2q2")))).toBeLessThan(SETUP_TH);
  });
});

describe("conceptHistory", () => {
  it("groups repeats and marks a setup from two or more tests as worn", () => {
    const sd = conceptHistory("quant").get("std-dev-normal")!;
    const worn = sd.find((g) => g.items.some((i) => i.testId === "quant-005" && i.qid === "s1q4"))!;
    expect(worn.worn).toBe(true);
    expect(worn.items.map((i) => i.testId)).toEqual(expect.arrayContaining(["quant-001", "quant-004", "quant-005", "quant-006"]));
  });
  it("lists a group under every concept its items carry", () => {
    // two tiny tests whose items share a setup line under different primary concepts
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hist-"));
    const q = (concept: string) => ({ id: "s1q1", section: 1, type: "qc", difficulty: 3, prompt: "$x > 0$", qc: { a: "$x$", b: "$1$" }, key: { sel: [3] }, explanation: { key: "x" }, tags: [{ kind: "concept", id: concept, role: "primary" }], setup: "the same setup line" });
    const test = (id: string, concept: string) => ({ id, measure: "quant", title: id, sections: [{ n: 1, minutes: 1 }, { n: 2, minutes: 1 }], questions: [q(concept)] });
    fs.writeFileSync(path.join(dir, "quant-001.json"), JSON.stringify(test("quant-001", "triangles")));
    fs.writeFileSync(path.join(dir, "quant-002.json"), JSON.stringify(test("quant-002", "figures-not-to-scale")));
    const h = conceptHistory("quant", undefined, dir);
    expect(h.get("triangles")![0]).toBe(h.get("figures-not-to-scale")![0]);
    expect(h.get("triangles")![0].worn).toBe(true);
  });
  it("counts only tests numbered before the given one", () => {
    const items = [...conceptHistory("quant", "quant-005").values()].flat().flatMap((g) => g.items);
    expect(items.every((i) => Number(i.testId.slice(-3)) < 5)).toBe(true);
  });
});

describe("testVariants", () => {
  it("counts the variants the tests record", () => {
    const sd = testVariants("quant").get("std-dev-normal")!;
    expect(sd.get("the standard deviation of two lists combined, when their means differ")).toBeGreaterThanOrEqual(1);
  });
});

describe("sameSetups", () => {
  it("flags a later copy against the first use, not the reverse", () => {
    const copy = load("quant-004");
    copy.id = "quant-011"; // as if authored now: its s2q12 repeats quant-003 s2q11
    expect(sameSetups(copy).filter((m) => m.error).map((m) => m.message).join("\n")).toMatch(/s2q12: same setup as quant-003 s2q11/);
    // the rebuilt tests are clean, and tests before the cut-off are not checked
    for (const id of ["quant-007", "quant-008", "quant-009", "quant-010"]) expect(sameSetups(load(id)).filter((m) => m.error)).toEqual([]);
    expect(sameSetups(load("quant-005"))).toEqual([]);
  });
});

describe("setup and variant fields", () => {
  const raw = () => {
    const t = JSON.parse(fs.readFileSync("content/tests/quant-010.json", "utf8"));
    t.id = "quant-011";
    return t;
  };
  it("are required from quant-011 on", () => {
    const t = raw();
    delete t.questions[0].setup;
    delete t.questions[1].variant;
    const errors = validateTest(t, "quant-011").errors.join("\n");
    expect(errors).toMatch(/s1q1 \(qc\): needs "setup"/);
    expect(errors).toMatch(/s1q2 \(qc\): needs "variant"/);
  });
  it("reject a variant of another concept", () => {
    const t = raw();
    t.questions[0].variant = "a three-set Venn diagram";
    expect(validateTest(t, "quant-011").errors.join("\n")).toMatch(/variant "a three-set Venn diagram" is not one of/);
  });
  it("never reach the runner", () => {
    const q = publicTest(load("quant-010")).questions[0] as Record<string, unknown>;
    expect(q.setup).toBeUndefined();
    expect(q.variant).toBeUndefined();
  });
});

describe("noveltyCopy", () => {
  it("shows each item without its key, explanation or setup, beside earlier items of its concept", () => {
    const t = load("quant-010");
    const md = noveltyCopy(t);
    const q = t.questions.find((x) => x.id === "s1q4")!;
    expect(md).toContain("### quant-010 s1q4 (qc, std-dev-normal)");
    expect(md).toContain("- quant-009 s2q3:");
    expect(md).not.toContain(q.explanation.key);
    expect(md).not.toContain(`[setup: ${q.setup}]`);
  });
  it("limits the copy to --only items", () => {
    const md = noveltyCopy(load("quant-010"), "content/tests", new Set(["s2q2"]));
    expect(md).toContain("### quant-010 s2q2");
    expect(md).not.toContain("### quant-010 s1q1");
  });
  it("pairs verbal passages and completions with earlier ones", () => {
    const md = noveltyCopy(load("verbal-010"));
    expect(md).toMatch(/### verbal-010 a1 \(argument\)/);
    expect(md).toMatch(/- verbal-00\d a\d:/);
  });
});

describe("parseVerdicts", () => {
  it("reads lines with or without the test id, in markdown", () => {
    const v = parseVerdicts(
      "id | verdict | earlier | note\nquant-011 s1q3 | new | - |\n- **quant-011 s1q4 | SAME | quant-004 s2q2 | adds two values at mean ± 1 SD**\ns2q7 | similar | quant-005 s2q7 | ring area\nverbal-015 p2 | new | - |",
    );
    expect([...v.keys()]).toEqual(["s1q3", "s1q4", "s2q7", "p2"]);
    expect(v.get("s1q4")).toMatchObject({ verdict: "same", earlier: "quant-004 s2q2" });
  });
});
