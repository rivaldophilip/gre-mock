import { describe, expect, it } from "vitest";
import { slotType, typeStats } from "@/lib/qtypes";

describe("slotType", () => {
  it("splits tc by blanks and pulls out arg and di", () => {
    expect(slotType({ type: "tc", blanks: [["a"], ["b"]] })).toBe("tc2");
    expect(slotType({ type: "rc", subtype: "arg" })).toBe("arg");
    expect(slotType({ type: "mc", setId: "s1" })).toBe("di");
    expect(slotType({ type: "qc", setId: "s1" })).toBe("qc");
    expect(slotType({ type: "rc_multi" })).toBe("rc_multi");
  });
});

describe("typeStats", () => {
  it("ranks a slow type above an equally accurate fast one", () => {
    const rows = [
      ...Array.from({ length: 4 }, () => ({ type: "se" as const, isCorrect: true, guessed: false, timeMs: 30_000 })),
      ...Array.from({ length: 4 }, () => ({ type: "tc1" as const, isCorrect: true, guessed: false, timeMs: 90_000 })),
    ];
    const [first, second] = typeStats(rows);
    expect(first.type).toBe("tc1");
    expect(first.slow).toBe(1);
    expect(second.slow).toBe(0);
    expect(first.missP).toBeCloseTo(1 / 6);
  });
  it("counts a guessed right answer as half a miss", () => {
    const [t] = typeStats([{ type: "qc", isCorrect: true, guessed: true, timeMs: 1 }]);
    expect(t.missP).toBeCloseTo(1.5 / 3);
  });
});
