import { describe, expect, it } from "vitest";
import { attemptNumbers, mockNumbers, summarizePoints } from "../lib/attempt-summary";

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

  it("numbers tests per measure by first finish, so retakes share their test's number", () => {
    const n = mockNumbers([...list, att(7, "verbal-001", 7, 8)], measureOf);
    expect([...n.entries()]).toEqual([["verbal-001", 1], ["quant-001", 1], ["verbal-002", 2]]);
  });
});

describe("summarizePoints", () => {
  const pt = (measure: string, attemptNo: number, mid: number, min: number) => ({ measure, attemptNo, timeMs: min * 60_000, score: { mid } });

  it("counts retakes and their time, but scores first attempts only", () => {
    const s = summarizePoints([pt("verbal", 1, 150, 40), pt("verbal", 2, 165, 30), pt("verbal", 1, 154, 50), pt("quant", 1, 160, 60)]);
    expect([s.n, s.verbal, s.quant, s.retakes]).toEqual([4, 3, 1, 1]);
    expect(s.avgTimeMs).toBe(45 * 60_000);
    expect(s.vScore).toEqual({ n: 2, avg: 152, best: 154 });
    expect(s.qScore).toEqual({ n: 1, avg: 160, best: 160 });
  });

  it("has no scores when nothing is in view", () => {
    expect(summarizePoints([])).toMatchObject({ n: 0, avgTimeMs: null, vScore: { n: 0, avg: null, best: null } });
  });
});
