import { describe, expect, it } from "vitest";
import { choiceWords, wordIdFor } from "@/lib/choice-words";
import type { Question } from "@/lib/types";

const q = (over: Partial<Question>) => ({ tags: [], ...over }) as Question;

describe("choiceWords / wordIdFor", () => {
  it("lists every TC blank's choices and resolves them through the tag on that choice", () => {
    const tc = q({ type: "tc", blanks: [["abated", "waxed"], ["terse", "prolix"]], tags: [{ kind: "word", id: "abate", at: [0, 0] }, { kind: "word", id: "prolix", at: [1, 1] }] as never });
    expect(choiceWords(tc)).toEqual(["abated", "waxed", "terse", "prolix"]);
    expect(wordIdFor(tc, "abated")).toBe("abate");
    expect(wordIdFor(tc, "prolix")).toBe("prolix");
    expect(wordIdFor(tc, "waxed")).toBeUndefined();
  });

  it("lists SE choices, and nothing for other types", () => {
    const se = q({ type: "se", choices: ["laconic", "terse", "garrulous"], tags: [{ kind: "word", id: "terse", at: [1] }] as never });
    expect(choiceWords(se)).toEqual(["laconic", "terse", "garrulous"]);
    expect(wordIdFor(se, "terse")).toBe("terse");
    expect(choiceWords(q({ type: "rc", choices: ["a long answer"] }))).toEqual([]);
  });
});
