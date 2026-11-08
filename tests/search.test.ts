import { describe, expect, it } from "vitest";
import { matchCount, words } from "@/lib/search";
import type { Question, Test } from "@/lib/types";

const names = new Map([
  ["circles", "Circles: arcs, sectors, chords, tangents"],
  ["counting-permutations", "Counting: permutations and combinations"],
]);
const q = (o: Partial<Question>): Question =>
  ({ id: "q", section: 1, type: "mc", difficulty: 4, prompt: "p", key: { sel: [0] }, explanation: { key: "k" }, tags: [], ...o }) as Question;
const test = (questions: Question[], o: Partial<Test> = {}): Test =>
  ({ id: "quant-009", measure: "quant", title: "Quant Hard Mock 9", sections: [], passages: [], figures: [], questions, ...o }) as Test;

describe("words", () => {
  it("drops KaTeX commands, braces and punctuation", () => {
    expect(words("Two $\\dfrac{1}{6}$-sided dice, rolled.")).toEqual(["two", "1", "6", "sided", "dice", "rolled"]);
  });
});

describe("matchCount", () => {
  it("finds a word by its tag, as a prefix", () => {
    const t = test([q({ type: "se", tags: [{ kind: "word", id: "abase", role: "key" }] })]);
    expect(matchCount(t, "abase", names)).toBe(1);
    expect(matchCount(t, "ABAS", names)).toBe(1);
    expect(matchCount(t, "base", names)).toBe(0);
  });
  it("finds a concept by its id or name", () => {
    const t = test([
      q({ id: "a", tags: [{ kind: "concept", id: "circles", role: "primary" }] }),
      q({ id: "b", tags: [{ kind: "concept", id: "counting-permutations", role: "primary" }] }),
    ]);
    expect(matchCount(t, "circle arc", names)).toBe(1);
    expect(matchCount(t, "combination", names)).toBe(1);
    expect(matchCount(t, "permutation", names)).toBe(1);
  });
  it("needs every term within one question", () => {
    const t = test([q({ id: "a", prompt: "Two dice are rolled." }), q({ id: "b", prompt: "A coin is tossed." })]);
    expect(matchCount(t, "dice rolled", names)).toBe(1);
    expect(matchCount(t, "dice coin", names)).toBe(0);
  });
  it("searches choices, blanks, passages and quantities", () => {
    const t = test([
      q({ id: "a", type: "tc", blanks: [["neophyte", "exemplar"]] }),
      q({ id: "b", type: "rc", passageId: "p1" }),
      q({ id: "c", type: "qc", qc: { a: "the arc length", b: "$\\pi$" } }),
    ], { passages: [{ id: "p1", paragraphs: ["Economic historians long assumed..."], tags: [] }] });
    expect(matchCount(t, "neophyte", names)).toBe(1);
    expect(matchCount(t, "historians", names)).toBe(1);
    expect(matchCount(t, "arc", names)).toBe(1);
  });
  it("matches plurals and irregular forms against the singular", () => {
    const t = test([q({ id: "a", prompt: "A fair six-sided die is rolled." }), q({ id: "b", prompt: "Two boxes hold one arc each." })]);
    expect(matchCount(t, "dice", names)).toBe(1);
    expect(matchCount(t, "arcs", names)).toBe(1);
    expect(matchCount(t, "boxes", names)).toBe(1);
    expect(matchCount(test([q({ prompt: "The party died out." })]), "dice", names)).toBe(0);
  });
  it("ignores explanations", () => {
    const t = test([q({ explanation: { key: "Like rolling dice." } })]);
    expect(matchCount(t, "dice", names)).toBe(0);
  });
  it("a title match counts every question; an empty query matches nothing", () => {
    const t = test([q({ id: "a" }), q({ id: "b" })]);
    expect(matchCount(t, "mock 9", names)).toBe(2);
    expect(matchCount(t, "  ", names)).toBe(0);
  });
});
