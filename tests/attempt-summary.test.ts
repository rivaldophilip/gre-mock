import { describe, expect, it } from "vitest";
import { attemptNumbers, finishedOrdinals } from "../lib/attempt-summary";

const T0 = Date.parse("2026-11-01T10:00:00Z");
const day = (d: number) => new Date(T0 + d * 86_400_000);
const att = (id: number, testId: string, started: number, finished: number | null, abandoned = false) => ({
  id,
  testId,
  startedAt: day(started),
  finishedAt: finished === null ? null : day(finished),
  abandonedAt: abandoned ? day(started) : null,
  sectionState: {},
});
const measureOf = (a: { testId: string }) => a.testId.split("-")[0];

describe("attempt numbering", () => {
  const list = [
    att(1, "verbal-001", 0, 0),
    att(2, "quant-001", 1, 1),
    att(3, "verbal-002", 2, null, true), // abandoned
    att(4, "verbal-001", 3, 5), // retake, finished after attempt 5
    att(5, "verbal-002", 4, 4),
    att(6, "quant-002", 6, null), // in progress
  ];

  it("numbers attempts per test, skipping abandoned ones", () => {
    const n = attemptNumbers(list);
    expect(n.get(4)).toBe(2);
    expect(n.get(5)).toBe(1);
    expect(n.has(3)).toBe(false);
  });

  it("numbers finished attempts per measure by finish time, across tests and retakes", () => {
    const n = finishedOrdinals(list, measureOf);
    expect([...n.entries()]).toEqual([[1, 1], [2, 1], [5, 2], [4, 3]]);
  });
});
