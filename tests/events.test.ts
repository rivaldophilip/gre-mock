import { describe, expect, it } from "vitest";
import { eventsForResponse, readingAllowanceMs } from "@/lib/events";
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
/** The answer's own events, by item; seen_known is checked on its own below. */
const ev = (es: ReturnType<typeof eventsForResponse>) => Object.fromEntries(es.filter((e) => e.event !== "seen_known").map((e) => [e.itemId, e.event]));
const seen = (es: ReturnType<typeof eventsForResponse>) => es.filter((e) => e.event === "seen_known").map((e) => e.itemId);

describe("eventsForResponse", () => {
  it("correct answer", () => {
    const e = ev(eventsForResponse(se, "verbal", { sel: [0, 2] }, { guessed: false, timeMs: 1000 }));
    expect(e).toEqual({ abate: "key_correct", mitigate: "key_correct", abase: "distractor_rejected", lessen: "distractor_rejected" });
  });
  it("one key right, one distractor chosen", () => {
    const e = ev(eventsForResponse(se, "verbal", { sel: [0, 1] }, { guessed: false, timeMs: 1000 }));
    expect(e).toEqual({ abate: "key_correct", mitigate: "key_missed", abase: "distractor_chosen" });
  });
  it("seen_known only for words the answer did not judge", () => {
    // right question: every word is judged
    expect(seen(eventsForResponse(se, "verbal", { sel: [0, 2] }, { guessed: false, timeMs: 1000 }))).toEqual([]);
    // wrong question: the unpicked distractor says nothing about the answer, so it is shown-and-known unless tagged
    const es = eventsForResponse(se, "verbal", { sel: [0, 1] }, { guessed: false, timeMs: 1000 });
    expect(seen(es)).toEqual(["lessen"]);
    expect(es.find((e) => e.event === "seen_known")!.weight).toBe(-0.3);
    // stem words are exposure plus seen_known; a blank question logs nothing
    const stem: Question = { ...se, tags: [...se.tags, { kind: "word", id: "obdurate", role: "stem" }] };
    const es2 = eventsForResponse(stem, "verbal", { sel: [0, 2] }, { guessed: false, timeMs: 1000 });
    expect(es2.filter((e) => e.itemId === "obdurate").map((e) => e.event)).toEqual(["exposure", "seen_known"]);
    expect(eventsForResponse(stem, "verbal", undefined, { guessed: false, timeMs: 1000 })).toEqual([]);
  });
  it("guessed key", () => {
    const e = ev(eventsForResponse(se, "verbal", { sel: [0, 2] }, { guessed: true, timeMs: 1000 }));
    expect(e.abate).toBe("key_guessed");
  });
  it("slow correct key adds key_slow", () => {
    const es = eventsForResponse(se, "verbal", { sel: [0, 2] }, { guessed: false, timeMs: 120_000 });
    expect(es.filter((e) => e.event === "key_slow").map((e) => e.itemId)).toEqual(["abate", "mitigate"]);
    // guessed and slow stack, as they do for concepts
    expect(eventsForResponse(se, "verbal", { sel: [0, 2] }, { guessed: true, timeMs: 120_000 }).filter((e) => e.event === "key_slow").map((e) => e.itemId)).toEqual(["abate", "mitigate"]);
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
    expect(e).toEqual({ b: "key_correct", d: "key_missed", f: "distractor_chosen" });
    // the right blank's distractors were rejected; the wrong blank's unpicked ones say nothing
    const tc3: Question = { ...tc, tags: [...tc.tags, { kind: "word", id: "c", role: "distractor", at: [0, 2] }, { kind: "word", id: "e", role: "distractor", at: [1, 1] }] };
    const e3 = ev(eventsForResponse(tc3, "verbal", { sel: [1, 2] }, { guessed: true, timeMs: 1 }));
    expect(e3).toEqual({ b: "key_guessed", d: "key_missed", f: "distractor_chosen", c: "distractor_rejected" });
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

  it("a wrong RC answer counts against its skills; passage words are exposure plus seen_known", () => {
    const e = eventsForResponse(rc, "verbal", { sel: [0] }, { guessed: false, timeMs: 30_000 }, passage);
    expect(seen(e)).toEqual(["hegemony"]);
    expect(ev(e)).toEqual({
      "rc-function": "concept_wrong_primary",
      "rc-inference": "concept_wrong_secondary",
      hegemony: "exposure",
    });
  });

  it("a right but slow RC answer is mastery plus a slowness signal", () => {
    const e = eventsForResponse(rc, "verbal", { sel: [2] }, { guessed: false, timeMs: 120_000 });
    expect(e.filter((x) => x.itemId === "rc-function").map((x) => x.event)).toEqual(["concept_right_primary", "concept_slow"]);
  });

  it("the first question opened on a shared passage gets the passage's reading time before it counts as slow", () => {
    const paragraphs = [Array(250).fill("word").join(" ")];
    const q = { ...rc, passageId: "p1" };
    const two = { questions: [q, { ...q, id: "q2" }], passages: [{ id: "p1", paragraphs, tags: [] }] };
    expect(readingAllowanceMs(two, q, true)).toBe(60_000); // 250 words at 250 wpm
    expect(readingAllowanceMs(two, q, false)).toBe(0);
    expect(readingAllowanceMs({ ...two, questions: [q] }, q, true)).toBe(0); // one question: no shared read
    const slow = (readingMs: number) => eventsForResponse(q, "verbal", { sel: [2] }, { guessed: false, timeMs: 120_000, readingMs }).some((x) => x.event === "concept_slow");
    expect(slow(0)).toBe(true);
    expect(slow(60_000)).toBe(false);
  });
});

describe("unanswered questions", () => {
  it("record nothing when left blank", () => {
    expect(eventsForResponse(se, "verbal", undefined, { guessed: false, timeMs: 1000 })).toEqual([]);
    expect(eventsForResponse(se, "verbal", { sel: [] }, { guessed: false, timeMs: 1000 })).toEqual([]);
  });
});

describe("silly mistakes", () => {
  const mc: Question = {
    id: "q9",
    section: 1,
    type: "mc",
    difficulty: 4,
    prompt: "x",
    choices: ["1", "2", "3", "4", "5"],
    key: { sel: [1] },
    explanation: { key: "k" },
    tags: [
      { kind: "concept", id: "ratios", role: "primary" },
      { kind: "concept", id: "percents", role: "secondary" },
    ],
  };
  const w = (silly: boolean, measure: "quant" | "verbal" = "quant", sel = [0]) =>
    Object.fromEntries(eventsForResponse(mc, measure, { sel }, { guessed: false, timeMs: 1000, silly }).map((e) => [e.itemId, e.weight]));
  it("halve a wrong quant answer's concept weights", () => {
    expect(w(false)).toEqual({ ratios: 0.8, percents: 0.4 });
    expect(w(true)).toEqual({ ratios: 0.4, percents: 0.2 });
  });
  it("leave right answers and verbal alone", () => {
    expect(w(true, "quant", [1])).toEqual(w(false, "quant", [1]));
    expect(w(true, "verbal")).toEqual({ ratios: 0.8, percents: 0.4 });
  });
});
