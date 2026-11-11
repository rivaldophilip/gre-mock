import { describe, expect, it } from "vitest";
import { decay, intervalFor, scoreItem, wordYield, type LoggedEvent } from "@/lib/priority/compute";
import { allocateWords, assignVariants, rng } from "@/lib/priority/allocate";
import { markPending, scoreAll } from "@/lib/priority/compute";

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

describe("pending tests", () => {
  // weak words a and b, plenty of untested words
  const events: LoggedEvent[] = ["a", "b"].map((id) => ({ itemId: id, event: "key_missed", weight: 0.8, createdAt: daysAgo(10) }));
  const items = ["a", "b", ...Array.from({ length: 20 }, (_, i) => `n${i}`)].map((id) => ({ id, yield: 0.5 }));
  const base = scoreAll(items, events, now);

  it("damps a pending item and names the test holding it", () => {
    const [a, b] = markPending(base, new Map([["a", ["verbal-002"]]]));
    expect(a.P).toBeCloseTo(base[0].P * 0.3);
    expect(a.pending).toEqual(["verbal-002"]);
    expect(a.reason).toMatch(/untaken verbal-002/);
    expect(b.pending).toBeUndefined();
  });

  it("uses pending items only when nothing else is left", () => {
    const all = markPending(base, new Map(items.slice(0, 20).map((it) => [it.id, ["verbal-002"]])));
    const picks = allocateWords(all, 4, rng(3)).map((p) => p.itemId);
    expect(picks).toHaveLength(4);
    expect(picks.filter((id) => !all.find((s) => s.itemId === id)!.pending)).toHaveLength(2);
  });

  it("a second brief before the first test is taken picks different words", () => {
    const first = allocateWords(base, 6, rng(1)).map((p) => p.itemId);
    const pending = new Map(first.map((id) => [id, ["verbal-002"]]));
    const second = allocateWords(markPending(base, pending), 6, rng(2)).map((p) => p.itemId);
    expect(first).toEqual(expect.arrayContaining(["a", "b"]));
    expect(second.filter((id) => first.includes(id))).toEqual([]);
  });
  it("damps once per untaken test that holds the item", () => {
    const [a] = markPending(base, new Map([["a", ["verbal-002", "verbal-003"]]]));
    expect(a.P).toBeCloseTo(base[0].P * 0.3 * 0.3);
    expect(a.reason).toMatch(/untaken verbal-002, verbal-003$/);
  });

  it("once every item is held, picks the least-held first", () => {
    const all = markPending(base, new Map(items.map((it, i) => [it.id, i < 6 ? ["verbal-002"] : ["verbal-002", "verbal-003"]])));
    const picks = allocateWords(all, 6, rng(4)).map((p) => p.itemId);
    expect(picks.sort()).toEqual(items.slice(0, 6).map((it) => it.id).sort());
  });
});

describe("concepts across mocks made before any is taken", () => {
  const areas = ["arithmetic", "algebra", "geometry", "data"];
  const items = Array.from({ length: 50 }, (_, i) => ({ id: `c${i}`, yield: 0.3 + (i % 7) / 10 }));
  const base = scoreAll(items, [], now).map((s, i) => ({ ...s, area: areas[i % 4] }));

  it("rotates through every concept instead of repeating the same 27", () => {
    const held = new Map<string, string[]>();
    const briefs: string[][] = [];
    for (let t = 0; t < 6; t++) {
      const scores = markPending(base, held).map((s, i) => ({ ...s, area: areas[i % 4] }));
      const picks = allocateConcepts(scores, 27, areas, rng(t + 1)).map((p) => p.itemId);
      briefs.push(picks);
      for (const id of picks) held.set(id, [...(held.get(id) ?? []), `quant-${t}`]);
    }
    // 6 × 27 = 162 picks over 50 concepts: each is held 3 or 4 times, none left out
    const n = items.map((it) => held.get(it.id)?.length ?? 0);
    expect(Math.min(...n)).toBeGreaterThanOrEqual(3);
    expect(Math.max(...n)).toBeLessThanOrEqual(4);
    for (let t = 1; t < briefs.length; t++) expect(briefs[t]).not.toEqual(briefs[t - 1]);
  });
});

describe("concept variants", () => {
  const variants = { a: ["a1", "a2", "a3"], b: ["b1"] };

  it("picks the least-used variant; none for a concept without variants", () => {
    const used = new Map([["a", new Map([["a1", 2], ["a2", 1]])]]);
    expect(assignVariants(["a", "b", "z"], variants, used, rng(1))).toEqual(["a3", "b1", undefined]);
  });

  it("gives a concept that repeats in one brief a different variant each time", () => {
    for (let seed = 1; seed <= 20; seed++) expect(new Set(assignVariants(["a", "a", "a"], variants, new Map(), rng(seed))).size).toBe(3);
  });

  it("does not change the history it is given", () => {
    const used = new Map([["a", new Map([["a1", 1]])]]);
    assignVariants(["a"], variants, used, rng(1));
    expect(used.get("a")).toEqual(new Map([["a1", 1]]));
  });
});

import { drawMultiKeys } from "@/lib/priority/allocate";
describe("select-all key counts", () => {
  it("never gives every rc_multi slot two keys", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const ks = drawMultiKeys(2, rng(seed));
      expect(ks.every((k) => k >= 1 && k <= 3)).toBe(true);
      expect(ks.every((k) => k === 2)).toBe(false);
    }
  });
  it("draws three keys in a fair share of tests", () => {
    let three = 0;
    for (let seed = 1; seed <= 500; seed++) if (drawMultiKeys(2, rng(seed)).includes(3)) three++;
    expect(three / 500).toBeGreaterThan(0.3);
  });
});
