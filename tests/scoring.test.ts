import { describe, expect, it } from "vitest";
import { parseNumber, scoreAnswer } from "@/lib/scoring";
import type { Question } from "@/lib/types";

const base = { section: 1 as const, difficulty: 4, prompt: "p", explanation: { key: "k" }, tags: [] };
const q = (o: Partial<Question>): Question => ({ ...base, id: "q", type: "mc", key: { sel: [0] }, ...o }) as Question;

describe("scoreAnswer", () => {
  it("tc requires every blank right", () => {
    const t = q({ type: "tc", blanks: [["a", "b", "c"], ["d", "e", "f"]], key: { sel: [1, 2] } });
    expect(scoreAnswer(t, { sel: [1, 2] })).toBe(true);
    expect(scoreAnswer(t, { sel: [1, 0] })).toBe(false);
    expect(scoreAnswer(t, { sel: [1] })).toBe(false);
  });
  it("se is all-or-nothing, order-free", () => {
    const t = q({ type: "se", choices: ["a", "b", "c", "d", "e", "f"], key: { sel: [1, 4] } });
    expect(scoreAnswer(t, { sel: [4, 1] })).toBe(true);
    expect(scoreAnswer(t, { sel: [1, 3] })).toBe(false);
    expect(scoreAnswer(t, { sel: [1] })).toBe(false);
  });
  it("multi-answer needs the exact set", () => {
    const t = q({ type: "mc_multi", key: { sel: [0, 2] } });
    expect(scoreAnswer(t, { sel: [2, 0] })).toBe(true);
    expect(scoreAnswer(t, { sel: [0, 1, 2] })).toBe(false);
    expect(scoreAnswer(t, { sel: [0] })).toBe(false);
  });
  it("single choice", () => {
    expect(scoreAnswer(q({ type: "qc", key: { sel: [2] } }), { sel: [2] })).toBe(true);
    expect(scoreAnswer(q({ type: "qc", key: { sel: [2] } }), { sel: [1] })).toBe(false);
    expect(scoreAnswer(q({ type: "mc" }), undefined)).toBe(false);
  });
  it("numeric accepts equivalent forms", () => {
    const t = q({ type: "numeric", key: { value: "3/8" } });
    expect(scoreAnswer(t, { text: "0.375" })).toBe(true);
    expect(scoreAnswer(t, { text: ".375" })).toBe(true);
    expect(scoreAnswer(t, { frac: ["6", "16"] })).toBe(true);
    expect(scoreAnswer(t, { frac: ["3", "0"] })).toBe(false);
    expect(scoreAnswer(t, { text: "0.38" })).toBe(false);
    expect(scoreAnswer(t, { text: "" })).toBe(false);
    expect(scoreAnswer(q({ type: "numeric", key: { value: "1200" } }), { text: "1,200" })).toBe(true);
  });
  it("parseNumber rejects junk", () => {
    expect(parseNumber("abc")).toBeNaN();
    expect(parseNumber("1/0")).toBeNaN();
    expect(parseNumber("-2")).toBe(-2);
  });
});
