import { describe, expect, it } from "vitest";
import { decay, intervalFor, scoreItem, wordYield, type LoggedEvent } from "@/lib/priority/compute";
import { allocateWords, rng } from "@/lib/priority/allocate";
import { scoreAll } from "@/lib/priority/compute";

const now = new Date("2026-11-06T00:00:00Z");
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000);
const e = (event: string, weight: number, d: number): LoggedEvent => ({ itemId: "w", event, weight, createdAt: daysAgo(d) });

describe("priority math", () => {
  it("decay halves every 21 days", () => {
    expect(decay(0)).toBe(1);
    expect(decay(21)).toBeCloseTo(0.5);
    expect(decay(42)).toBeCloseTo(0.25);
  });
  it("untested item: S=1/3, N=1, D=0", () => {
    const s = scoreItem("w", [], 0.5, now);
    expect(s.S).toBeCloseTo(0.5 / 1.5);
    expect(s.N).toBe(1);
    expect(s.D).toBe(0);
    expect(s.P).toBeCloseTo(0.4 / 3 + 0.3 + 0 + 0.15 * 0.5);
  });
  it("missed word outranks mastered word", () => {
    const missed = scoreItem("w", [e("key_missed", 0.8, 10)], 0.5, now);
    const mastered = scoreItem("w", [e("key_correct", -0.6, 10)], 0.5, now);
    expect(missed.S).toBeGreaterThan(mastered.S);
    expect(missed.P).toBeGreaterThan(mastered.P);
    expect(missed.reason).toBe("missed as the answer");
  });
  it("recent test is damped x0.3", () => {
    const old = scoreItem("w", [e("key_missed", 0.8, 10)], 0.5, now);
    const recent = scoreItem("w", [e("key_missed", 0.8, 1)], 0.5, now);
    expect(recent.P).toBeLessThan(old.P * 0.5);
  });
  it("intervals follow the streak", () => {
    expect([0, 1, 2, 3, 4, 9].map(intervalFor)).toEqual([1, 3, 7, 14, 30, 30]);
    const s = scoreItem("w", [e("key_correct", -0.6, 6), e("key_correct", -0.6, 12)], 0.5, now);
    expect(s.D).toBeCloseTo(6 / 7);
  });
  it("yield", () => {
    expect(wordYield(10, false)).toBe(1);
    expect(wordYield(2, true)).toBeCloseTo(0.6);
  });
  it("allocation puts weak words in review and fills with new", () => {
    const items = Array.from({ length: 40 }, (_, i) => ({ id: `w${i}`, yield: 0.8 }));
    const events: LoggedEvent[] = [
      { itemId: "w3", event: "dont_know", weight: 1, createdAt: daysAgo(5) },
      { itemId: "w7", event: "key_missed", weight: 0.8, createdAt: daysAgo(5) },
    ];
    const picks = allocateWords(scoreAll(items, events, now), 10, rng(1));
    expect(picks).toHaveLength(10);
    expect(new Set(picks.map((p) => p.itemId)).size).toBe(10);
    expect(picks.filter((p) => p.bucket === "review").map((p) => p.itemId)).toEqual(expect.arrayContaining(["w3", "w7"]));
  });
});

import { allocateConcepts } from "@/lib/priority/allocate";
describe("concept allocation", () => {
  it("uses distinct concepts, prefers weak ones, balances areas", () => {
    const areas = ["arithmetic", "algebra", "geometry", "data"];
    const items = Array.from({ length: 40 }, (_, i) => ({ id: `c${i}`, yield: 0.5 + (i % 5) / 10 }));
    const events: LoggedEvent[] = [{ itemId: "c9", event: "concept_wrong_primary", weight: 0.8, createdAt: daysAgo(5) }];
    const scored = scoreAll(items, events, now).map((s, i) => ({ ...s, area: areas[i % 4] }));
    const picks = allocateConcepts(scored, 27, areas, rng(3));
    expect(picks).toHaveLength(27);
    expect(new Set(picks.map((p) => p.itemId)).size).toBe(27);
    expect(picks.some((p) => p.itemId === "c9" && p.bucket === "review")).toBe(true);
  });
});

import { allocateVerbalKeys, selectionOdds } from "@/lib/priority/allocate";
describe("selection odds", () => {
  it("weak words are near-certain, untested ones share the rest", () => {
    const items = Array.from({ length: 40 }, (_, i) => ({ id: `w${i}`, yield: 0.5 }));
    const events: LoggedEvent[] = [{ itemId: "w3", event: "key_missed", weight: 0.8, createdAt: daysAgo(5) }];
    const scores = scoreAll(items, events, now);
    const odds = selectionOdds((r) => allocateVerbalKeys(scores, () => false, 10, r), 100);
    expect(odds.get("w3")).toBe(1);
    const others = [...odds].filter(([id]) => id !== "w3").map(([, p]) => p);
    // 9 other slots spread over 39 equal words
    expect(others.reduce((a, b) => a + b, 0)).toBeCloseTo(9, 5);
    expect(Math.max(...others)).toBeLessThan(1);
  });
});
