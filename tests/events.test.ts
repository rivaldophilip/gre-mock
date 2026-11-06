import { describe, expect, it } from "vitest";
import { eventsForResponse } from "@/lib/events";
import type { Question } from "@/lib/types";

const se: Question = {
  id: "q1",
  section: 1,
  type: "se",
  difficulty: 4,
  prompt: "x ___ y",
  choices: ["abate", "abase", "mitigate", "aggravate", "lessen", "inflame"],
  key: { sel: [0, 2] },
  explanation: { key: "k" },
  tags: [
    { kind: "word", id: "abate", role: "key", at: [0] },
    { kind: "word", id: "mitigate", role: "key", at: [2] },
    { kind: "word", id: "abase", role: "distractor", at: [1] },
    { kind: "word", id: "lessen", role: "distractor", at: [4] },
  ],
};
const ev = (es: ReturnType<typeof eventsForResponse>) => Object.fromEntries(es.map((e) => [e.itemId, e.event]));

describe("eventsForResponse", () => {
  it("correct answer", () => {
    const e = ev(eventsForResponse(se, "verbal", { sel: [0, 2] }, { guessed: false, timeMs: 1000 }));
    expect(e).toEqual({ abate: "key_correct", mitigate: "key_correct", abase: "distractor_rejected", lessen: "distractor_rejected" });
  });
  it("one key right, one distractor chosen", () => {
    const e = ev(eventsForResponse(se, "verbal", { sel: [0, 1] }, { guessed: false, timeMs: 1000 }));
    expect(e).toEqual({ abate: "key_partial", mitigate: "key_missed", abase: "distractor_chosen" });
  });
  it("guessed key", () => {
    const e = ev(eventsForResponse(se, "verbal", { sel: [0, 2] }, { guessed: true, timeMs: 1000 }));
    expect(e.abate).toBe("key_guessed");
  });
  it("tc uses blank positions", () => {
    const tc: Question = {
      ...se,
      type: "tc",
      blanks: [["a", "b", "c"], ["d", "e", "f"]],
      key: { sel: [1, 0] },
      tags: [
        { kind: "word", id: "b", role: "key", at: [0, 1] },
        { kind: "word", id: "d", role: "key", at: [1, 0] },
        { kind: "word", id: "f", role: "distractor", at: [1, 2] },
      ],
    };
    const e = ev(eventsForResponse(tc, "verbal", { sel: [1, 2] }, { guessed: false, timeMs: 1 }));
    expect(e).toEqual({ b: "key_partial", d: "key_missed", f: "distractor_chosen" });
  });
  it("concepts: wrong, right, slow", () => {
    const m: Question = {
      ...se, type: "mc", key: { sel: [0] },
      tags: [{ kind: "concept", id: "remainders", role: "primary" }, { kind: "concept", id: "primes", role: "secondary" }],
    };
    expect(eventsForResponse(m, "quant", { sel: [1] }, { guessed: false, timeMs: 1 }).map((e) => e.weight)).toEqual([0.8, 0.4]);
    expect(eventsForResponse(m, "quant", { sel: [0] }, { guessed: false, timeMs: 1 }).map((e) => e.weight)).toEqual([-0.6, -0.3]);
    const slow = eventsForResponse(m, "quant", { sel: [0] }, { guessed: false, timeMs: 200_000 }).map((e) => e.event);
    expect(slow).toContain("concept_slow");
  });
});

describe("reading skill events", () => {
  const rc: Question = {
    id: "q8",
    section: 1,
    type: "rc",
    difficulty: 4,
    prompt: "The author mentions X primarily in order to",
    passageId: "p1",
    choices: ["a", "b", "c", "d", "e"],
    key: { sel: [2] },
    explanation: { key: "k" },
    tags: [
      { kind: "concept", id: "rc-function", role: "primary" },
      { kind: "concept", id: "rc-inference", role: "secondary" },
    ],
  };
  const passage = [{ kind: "word" as const, id: "hegemony", role: "passage" as const }];

  it("a wrong RC answer counts against its skills; passage words are exposure only", () => {
    const e = eventsForResponse(rc, "verbal", { sel: [0] }, { guessed: false, timeMs: 30_000 }, passage);
    expect(Object.fromEntries(e.map((x) => [x.itemId, x.event]))).toEqual({
      "rc-function": "concept_wrong_primary",
      "rc-inference": "concept_wrong_secondary",
      hegemony: "exposure",
    });
  });

  it("a right but slow RC answer is mastery plus a slowness signal", () => {
    const e = eventsForResponse(rc, "verbal", { sel: [2] }, { guessed: false, timeMs: 120_000 });
    expect(e.filter((x) => x.itemId === "rc-function").map((x) => x.event)).toEqual(["concept_right_primary", "concept_slow"]);
  });
});
