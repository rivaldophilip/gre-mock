import fs from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { SignJWT } from "jose";
import { TestSchema, type Test } from "@/lib/types";
import { bankRows, unitShape, stableJson } from "@/scripts/lib/bank-rows";
import type { Gap } from "@/scripts/lib/bank-gaps";
import { quizTest, quizIdOf, sourceTest, type Layout } from "@/lib/virtual-test";
import { dbFor, dbUrl } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { logsItemEvents } from "@/lib/attempt-summary";
import { batchRules, validateTest, verbalFormatRules } from "@/scripts/validate-test";
import { verbalItemRules, verbalLayoutRules } from "@/lib/blueprint-rules";
import { quantPools, noveltyCopy } from "@/scripts/novelty-test";
import { pastItems } from "@/lib/setup-history";
import { isBankId, testPath } from "@/lib/test-path";
import { compareSources, sourceMeasure } from "@/lib/sources";
import { refOf, qAnchor, splitRef } from "@/lib/ref";
import { publicQuestion } from "@/lib/content";
import { recordRatings } from "@/scripts/blind-test";

const load = (file: string) => TestSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
const blueprint = JSON.parse(fs.readFileSync("data/blueprints.json", "utf8")).verbal;

/** Rows back to a Test, as bank:verify and the app's loader do it. */
const roundTrip = (t: Test) => {
  const r = bankRows(t, 0);
  const built = sourceTest(r.source, r.items.map((i) => ({ ...i, status: i.status!, position: i.position })), r.passages.map((p) => ({ ...p, status: p.status! })), r.figures.map((f) => ({ ...f, status: f.status! })));
  built.questions = built.questions.map(({ ref: _r, ...q }) => q);
  return built;
};

describe("bank rows", () => {
  for (const f of ["content/tests/quant-010.json", "content/tests/verbal-019.json", "content/drill/drill-003.json"])
    it(`round-trip ${f.split("/").pop()}`, () => {
      const t = load(f);
      expect(stableJson(roundTrip(t))).toBe(stableJson(t));
    });

  it("copy passage tags onto each question, and name units by their actual counts", () => {
    const t = load("content/tests/verbal-019.json");
    const r = bankRows(t, 0);
    const q = t.questions.find((x) => x.passageId === "p3")!;
    const ptag = t.passages.find((p) => p.id === "p3")!.tags[0];
    expect(r.tags.some((x) => x.ref === `verbal-019:${q.id}` && x.tagId === ptag.id && x.role === ptag.role)).toBe(true);
    expect(r.units.find((u) => u.id === "verbal-019:p3")?.shape).toBe("rc4-long");
    expect(r.units.find((u) => u.id === "verbal-019:a1")?.shape).toBe("arg1");
    expect(unitShape("di", 3)).toBe("di3");
    expect(r.items.every((i) => i.ref === `verbal-019:${i.qid}`)).toBe(true);
  });

  it("keep a retired item as a row with status retired", () => {
    const t = load("content/drill/drill-003.json");
    const q = { ...t.questions[0], retired: true };
    const r = bankRows({ ...t, questions: [q, ...t.questions.slice(1)] }, 0);
    expect(r.items[0].status).toBe("retired");
  });

  it("hash the same content the same way whatever the key order", () => {
    expect(stableJson({ b: 1, a: [2, { d: 3, c: 4 }] })).toBe(stableJson({ a: [2, { c: 4, d: 3 }], b: 1 }));
  });
});

describe("quiz tests", () => {
  const a = load("content/tests/verbal-019.json");
  const b = load("content/tests/verbal-018.json");
  const rows = (t: Test) => bankRows(t, 0);
  const ra = rows(a);
  const rb = rows(b);
  const items = new Map([...ra.items, ...rb.items].map((i) => [i.ref, { ...i, status: "active" }]));
  const passages = new Map([...ra.passages, ...rb.passages].map((p) => [p.ref, { ...p, status: "active" }]));
  const figures = new Map<string, never>();
  const p1 = (t: Test) => t.questions.filter((q) => q.passageId === "p1").map((q) => `${t.id}:${q.id}`);
  const layout: Layout = {
    sections: [{ n: 1, minutes: 20, items: [...p1(a), ...p1(b), `${a.id}:s1q1`].map((ref, i) => ({ ref, slotId: `x${i}`, slotType: "rc", level: 4, ...(i === 0 ? { reused: true } : {}) })) }],
  };
  const t = quizTest({ id: 7, measure: "verbal", title: "Q", layout }, items, passages, figures);

  it("number questions in layout order and keep each one's bank ref", () => {
    expect(t.id).toBe("quiz-7");
    expect(quizIdOf(t.id)).toBe(7);
    expect(t.questions.map((q) => q.id)).toEqual(layout.sections[0].items.map((_, i) => `s1q${i + 1}`));
    expect(t.questions.map(refOf)).toEqual(layout.sections[0].items.map((i) => i.ref));
    expect(t.questions[0].reused).toBe(true);
    expect(t.questions[1].reused).toBe(false);
    expect(t.sections).toEqual([{ n: 1, minutes: 20 }]);
  });

  it("give two sources' p1 passages different ids, and keep each question on its own passage", () => {
    expect(t.passages.map((p) => p.id)).toEqual(["p1", "p2"]);
    const pa = t.questions.find((q) => q.ref === p1(a)[0])!.passageId!;
    const pb = t.questions.find((q) => q.ref === p1(b)[0])!.passageId!;
    expect(pa).not.toBe(pb);
    expect(t.passages.find((p) => p.id === pa)!.paragraphs).toEqual(a.passages.find((p) => p.id === "p1")!.paragraphs);
  });

  it("strip the ref and the reused flag from what the runner sees", () => {
    const pq = publicQuestion(t.questions[0]) as Record<string, unknown>;
    expect(pq.ref).toBeUndefined();
    expect(pq.reused).toBeUndefined();
  });

  it("anchor a review by ref", () => {
    expect(qAnchor("quant-005:s2q14")).toBe("q-quant-005-s2q14");
    expect(splitRef("qbank-003:s1q7")).toEqual(["qbank-003", "s1q7"]);
  });
});

describe("the bank database is no session's", () => {
  it("dbFor refuses gre_bank; dbUrl builds it for the bank's own connection", () => {
    expect(() => dbFor("gre_bank")).toThrow();
    expect(dbUrl("gre_bank", "postgres://a@localhost/neondb")).toBe("postgres://a@localhost/gre_bank");
  });

  it("a session naming gre_bank is rejected", async () => {
    const secret = "x".repeat(40);
    const t = await new SignJWT({ db: "gre_bank" }).setProtectedHeader({ alg: "HS256" }).setSubject("1").setExpirationTime("1d").sign(new TextEncoder().encode(secret));
    expect(await readSession(t, secret)).toBeNull();
  });
});

describe("item events", () => {
  it("skip replays and reused items", () => {
    expect(logsItemEvents({ mode: "exam" }, {})).toBe(true);
    expect(logsItemEvents({ mode: "replay" }, {})).toBe(false);
    expect(logsItemEvents({ mode: "practice" }, { reused: true })).toBe(false);
  });
});

describe("bank batches", () => {
  const drill = load("content/drill/drill-003.json");
  const asBatch = { ...drill, id: "vbank-901" };
  const brief = { slots: asBatch.questions.map((q) => ({ type: q.type === "tc" ? `tc${q.blanks!.length}` : q.type, level: q.difficulty })) };

  it("live under content/bank and sort after every mock and drill batch", () => {
    expect(isBankId("qbank-001")).toBe(true);
    expect(testPath("vbank-002")).toBe("content/bank/verbal/vbank-002.json");
    expect(sourceMeasure("qbank-001")).toBe("quant");
    expect(compareSources("drill-015", "vbank-001")).toBeLessThan(0);
    expect(compareSources("verbal-019", "drill-001")).toBeLessThan(0);
  });

  it("match their brief's slots, and say what is missing", () => {
    expect(batchRules(asBatch, brief).filter((m) => m.startsWith("slots"))).toEqual([]);
    const short = batchRules(asBatch, { slots: [...brief.slots, { type: "tc3", level: 5 }] });
    expect(short.join("\n")).toMatch(/the brief wants tc3 L5/);
  });

  it("take a retag the blind check offered, and only one the solver's rating backs", () => {
    // two slots at one type, levels 4 and 5; the L5 item was retagged to 4 after the solver rated it 2 (+1.5 = 3.5)
    const qs = asBatch.questions.slice(0, 2).map((q) => ({ ...q, type: "se" as const, difficulty: 4 }));
    const two = { ...asBatch, questions: [{ ...qs[0] }, { ...qs[1], solverRating: 2 }] };
    const slots = { slots: [{ type: "se", level: 4 }, { type: "se", level: 5 }] };
    expect(batchRules(two, slots).filter((m) => m.startsWith("slots"))).toEqual([]);
    // the same retag without a rating, or below the rating's level, is refused
    expect(batchRules({ ...two, questions: qs }, slots).join("\n")).toMatch(/the brief wants se L5/);
    expect(batchRules({ ...two, questions: [qs[0], { ...qs[1], solverRating: 4 }] }, slots).join("\n")).toMatch(/the brief wants se L5/);
  });

  it("check unit sizes against their shapes", () => {
    const v = load("content/tests/verbal-019.json");
    const b = { ...v, id: "vbank-902", questions: v.questions.map((q) => ({ ...q, section: 1 as const })) };
    const m = batchRules(b, { slots: [], units: [{ id: "p3", shape: "rc4-long" }, { id: "p1", shape: "rc1" }] }).join("\n");
    expect(m).not.toMatch(/unit p3/);
    expect(m).toMatch(/unit p1 \(rc1\): 2 question/);
    expect(m).toMatch(/ids are s1q1/);
  });

  it("are refused without a brief", () => {
    expect(validateTest(asBatch, "vbank-901").errors.join("\n")).toMatch(/no content\/briefs\/vbank-901.json/);
  });

  it("record the solver's ratings", () => {
    const raw = { questions: [{ id: "s1q1" }, { id: "s1q2", solverRating: 3 }] };
    const n = recordRatings(raw, new Map([["s1q1", { id: "s1q1", answer: "A", confidence: "high", difficulty: 4, skill: null, problems: "", note: "" }], ["s1q2", { id: "s1q2", answer: "B", confidence: null, difficulty: 3, skill: null, problems: "", note: "" }]]));
    expect(n).toBe(1);
    expect(raw.questions[0]).toEqual({ id: "s1q1", solverRating: 4 });
  });
});

describe("format rules split", () => {
  it("layout and item rules add up to the mock's format rules", () => {
    const t = { ...load("content/tests/verbal-015.json"), id: "verbal-018" };
    const both = verbalFormatRules(t, blueprint);
    const parts = [...verbalLayoutRules(t, blueprint), ...verbalItemRules(t, { argBold: true, noLabels: true })];
    expect(both).toEqual(parts);
  });
});

describe("novelty pools", () => {
  // a batch's shape: few concepts, several items each (four copies of three of quant-010's items)
  const src = load("content/tests/quant-010.json");
  const three = src.questions.filter((q) => !q.setId).slice(0, 3);
  const questions = three.flatMap((q, i) => [0, 1, 2, 3].map((k) => ({ ...q, id: `s1q${i * 4 + k + 1}`, section: 1 as const })));
  const batch = { ...src, figures: [], questions };

  it("list each concept's earlier items once for a quant batch", () => {
    const lines = quantPools({ ...batch, id: "qbank-901" }, pastItems("quant", "qbank-901"));
    const heads = lines.filter((l) => l.startsWith("## Concept "));
    expect(heads.length).toBe(new Set(heads).size);
    expect(heads.length).toBe(new Set(three.map((q) => q.tags.find((t) => t.role === "primary")!.id)).size);
    // the same items laid out the mock way repeat each pool under every item
    expect(noveltyCopy({ ...batch, id: "qbank-901" }).length).toBeLessThan(noveltyCopy({ ...batch, id: "quant-901" }).length / 2);
  });
});

describe("sibling briefs", () => {
  it("count a brief still being authored as written, so the next brief takes other gaps", async () => {
    const { afterPending } = await import("@/scripts/lib/bank-gaps");
    const gaps: Gap[] = [
      { kind: "revisit", id: "quant-005:s2q1", need: 1, have: 0, deficit: 1, weight: 2.5, why: "" },
      { kind: "revisit", id: "quant-006:s1q3", need: 1, have: 0, deficit: 1, weight: 2.5, why: "" },
      { kind: "concept", id: "percent", level: 4, need: 1, have: 0, deficit: 1, weight: 1, why: "" },
      { kind: "concept", id: "percent", level: 5, need: 1, have: 0, deficit: 1, weight: 1, why: "" },
      { kind: "concept", id: "percent", need: 4, have: 1, deficit: 3, weight: 1, why: "" },
      { kind: "type", id: "qc", need: 10, have: 2, deficit: 8, weight: 1.5, why: "" },
    ];
    const left = afterPending(gaps, [{ slots: [{ type: "qc", level: 4, concept: "percent" }, { type: "qc", level: 4, concept: "integers-properties", revisit: { ref: "quant-005:s2q1" } }] }]);
    expect(left.map((g) => `${g.kind} ${g.id}${g.level ? ` L${g.level}` : ""}`)).toEqual(["type qc", "revisit quant-006:s1q3", "concept percent", "concept percent L5"]);
    expect(left.find((g) => g.kind === "concept" && !g.level)).toMatchObject({ have: 2, deficit: 2 });
    expect(left.find((g) => g.kind === "type")).toMatchObject({ have: 4, deficit: 6 });
  });
});
