import { describe, expect, it } from "vitest";
import { decay, intervalFor, scoreItem, wordYield, type LoggedEvent } from "@/lib/priority/compute";
import { allocateWords, assignVariants, rng } from "@/lib/priority/allocate";
import { markPending, scoreAll } from "@/lib/priority/compute";
import { NEW_KEY_SHARE, WORD_W } from "@/lib/priority/config";

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
  it("a 'didn't know' tag and a wrong answer in one attempt count once, at the larger weight", () => {
    const at = (x: LoggedEvent, attemptId: number) => ({ ...x, attemptId });
    const both = scoreItem("w", [at(e("distractor_chosen", 0.6, 5), 1), at(e("dont_know", 1.0, 5), 1)], 0.5, now);
    const tagOnly = scoreItem("w", [at(e("dont_know", 1.0, 5), 1)], 0.5, now);
    expect(both.weakEvidence).toBeCloseTo(tagOnly.weakEvidence);
    expect(both.S).toBeCloseTo(tagOnly.S);
    expect(both.evidence.map((x) => x.event)).toEqual(["dont_know"]);
    // in different attempts they are separate evidence
    const apart = scoreItem("w", [at(e("key_missed", 0.8, 5), 1), at(e("dont_know", 1.0, 5), 2)], 0.5, now);
    expect(apart.weakEvidence).toBeCloseTo(1.8 * decay(5));
  });
  it("a missed key outweighs a 'didn't know' tag, and tagging it too adds nothing", () => {
    const at = (x: LoggedEvent, attemptId: number) => ({ ...x, attemptId });
    expect(WORD_W.key_missed).toBeGreaterThan(WORD_W.dont_know);
    const missed = scoreItem("w", [at(e("key_missed", WORD_W.key_missed, 5), 1)], 0.5, now);
    const tagged = scoreItem("w", [at(e("dont_know", WORD_W.dont_know, 5), 1)], 0.5, now);
    const both = scoreItem("w", [at(e("key_missed", WORD_W.key_missed, 5), 1), at(e("dont_know", WORD_W.dont_know, 5), 1)], 0.5, now);
    expect(missed.S).toBeGreaterThan(tagged.S);
    expect(both.S).toBeCloseTo(missed.S);
  });
  it("passage exposure counts once per attempt for coverage", () => {
    const at = (x: LoggedEvent, attemptId: number) => ({ ...x, attemptId });
    const one = scoreItem("w", [1, 1, 1, 1].map((a) => at(e("exposure", 0, 5), a)), 0.5, now);
    expect(one.C).toBeCloseTo(0.15);
    const two = scoreItem("w", [1, 1, 2].map((a) => at(e("exposure", 0, 5), a)), 0.5, now);
    expect(two.C).toBeCloseTo(0.3);
  });
  it("one showing covers an exposure-only word, and a didn't-know tap keeps its weakness", () => {
    const at = (x: LoggedEvent, attemptId: number) => ({ ...x, attemptId });
    const read = scoreItem("w", [at(e("exposure", 0, 5), 1), at(e("seen_known", -0.3, 5), 1)], 0.5, now, true);
    expect(read.C).toBe(1);
    expect(read.tested).toBe(false);
    expect(read.exposureOnly).toBe(true);
    const missed = scoreItem("w", [at(e("exposure", 0, 5), 1), at(e("dont_know", WORD_W.dont_know, 5), 1)], 0.5, now, true);
    expect(missed.C).toBe(1);
    expect(missed.S).toBeGreaterThan(1 / 3);
    expect(scoreItem("w", [at(e("exposure", 0, 5), 1)], 0.5, now).C).toBeCloseTo(0.15);
    expect(scoreAll([{ id: "w", yield: 0.5, exposureOnly: true }], [at(e("exposure", 0, 5), 1)], now)[0].C).toBe(1);
  });
  it("seen_known counts once per attempt, and not where the word was tagged or judged", () => {
    const at = (x: LoggedEvent, attemptId: number) => ({ ...x, attemptId });
    const seen = (a: number) => at(e("seen_known", -0.3, 0), a);
    const tag = at(e("dont_know", 1.0, 0), 1);
    // shown on three questions of one test: one credit
    const once = scoreItem("w", [tag, seen(2), seen(2), seen(2)], 0.5, now);
    expect(once.mastery).toBeCloseTo(0.3);
    expect(once.S).toBeCloseTo(1.5 / 2.8);
    expect(scoreItem("w", [tag], 0.5, now).S).toBeCloseTo(1.5 / 2.5);
    // two tests: two credits
    expect(scoreItem("w", [tag, seen(2), seen(3)], 0.5, now).mastery).toBeCloseTo(0.6);
    // tagged "didn't know" in that test: no credit
    expect(scoreItem("w", [tag, seen(1)], 0.5, now).mastery).toBe(0);
    // judged by an answer in that test: the answer's own event stands alone
    expect(scoreItem("w", [at(e("key_correct", -0.6, 0), 2), seen(2)], 0.5, now).mastery).toBeCloseTo(0.6);
    expect(scoreItem("w", [at(e("key_missed", 0.8, 0), 2), seen(2)], 0.5, now).mastery).toBe(0);
    // no coverage, no streak
    const plain = scoreItem("w", [seen(2)], 0.5, now);
    expect(plain.C).toBe(0);
    expect(plain.streak).toBe(0);
    expect(plain.tested).toBe(false);
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

  it("pins a revisit slot to its earlier item's variant, counted before the other slots pick", () => {
    const used = new Map([["a", new Map([["a1", 3]])]]);
    for (let seed = 1; seed <= 20; seed++) {
      const out = assignVariants(["a", "a", "a"], variants, used, rng(seed), new Map([[2, "a1"]]));
      expect(out[2]).toBe("a1");
      expect(new Set(out.slice(0, 2))).toEqual(new Set(["a2", "a3"]));
    }
  });

  it("ignores a pin that is not among the concept's variants", () => {
    const used = new Map([["a", new Map([["a1", 2], ["a2", 1]])]]);
    expect(assignVariants(["a"], variants, used, rng(1), new Map([[0, "retired form"]]))).toEqual(["a3"]);
  });

  it("keeps a slot to the variants it allows, and to all when it allows none", () => {
    const allow = (i: number, v: string) => (i === 0 ? v === "a2" : v === "none");
    for (let seed = 1; seed <= 20; seed++) {
      const out = assignVariants(["a", "a"], variants, new Map(), rng(seed), new Map(), allow);
      expect(out[0]).toBe("a2");
      expect(["a1", "a3"]).toContain(out[1]);
    }
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

import fs from "node:fs";
describe("variant lists", () => {
  const variants = JSON.parse(fs.readFileSync("data/concept_variants.json", "utf8")) as Record<string, string[]>;
  const ids = ["data/concepts.json", "data/rc_skills.json"].flatMap((f) => (JSON.parse(fs.readFileSync(f, "utf8")) as { id: string }[]).map((c) => c.id));
  it("cover every quant concept and reading skill, and nothing else", () => {
    expect(Object.keys(variants).sort()).toEqual([...ids].sort());
  });
  it("give each at least two distinct forms", () => {
    for (const id of ids) expect(new Set(variants[id]).size, id).toBeGreaterThanOrEqual(2);
  });
});

describe("new first while untested items remain", () => {
  // 4 weak words, 4 words seen only in passages, 12 never seen
  const weak = ["a", "b", "c", "d"];
  const seen = ["s0", "s1", "s2", "s3"];
  const events: LoggedEvent[] = [
    ...weak.map((id) => ({ itemId: id, event: "key_missed", weight: 0.8, createdAt: daysAgo(10) })),
    ...seen.map((id, i) => ({ itemId: id, event: "exposure", weight: 0, createdAt: daysAgo(10), attemptId: i })),
  ];
  const items = [...weak, ...seen, ...Array.from({ length: 12 }, (_, i) => `n${i}`)].map((id) => ({ id, yield: 0.5 }));
  const base = scoreAll(items, events, now);

  it("gives NEW_KEY_SHARE of the slots to unexposed words, the rest to tested ones by P", () => {
    const nNew = Math.round(8 * NEW_KEY_SHARE);
    const picks = allocateWords(base, 8, rng(1));
    expect(picks.slice(0, nNew).every((p) => p.bucket === "new" && p.itemId.startsWith("n"))).toBe(true);
    expect(picks.slice(nNew).every((p) => weak.includes(p.itemId))).toBe(true);
  });

  it("takes exposed-but-untested words once the unexposed run out, and fills with new when tested ones run dry", () => {
    const picks = allocateWords(base, 20, rng(2)).map((p) => p.itemId);
    expect(new Set(picks).size).toBe(20);
    expect(picks).toEqual(expect.arrayContaining([...weak, ...seen]));
  });

  it("keeps the usual rule once every item is tested", () => {
    const tested = scoreAll(items.slice(0, 4), events, now);
    expect(allocateWords(tested, 4, rng(3)).every((p) => p.bucket === "review")).toBe(true);
  });

  it("puts an untested concept first and spreads new ones over areas", () => {
    const areas = ["arithmetic", "algebra", "geometry", "data"];
    const cs = Array.from({ length: 12 }, (_, i) => ({ id: `c${i}`, yield: 0.5 }));
    // c0..c7 tested; c8..c11 untested, one per area
    const ev: LoggedEvent[] = cs.slice(0, 8).map((c) => ({ itemId: c.id, event: "concept_right_primary", weight: -0.6, createdAt: daysAgo(10) }));
    const scored = scoreAll(cs, ev, now).map((s, i) => ({ ...s, area: areas[i % 4] }));
    const picks = allocateConcepts(scored, 8, areas, rng(4));
    expect(picks.slice(0, 4).map((p) => p.itemId).sort()).toEqual(["c10", "c11", "c8", "c9"]);
    expect(picks.slice(4).every((p) => p.bucket === "review")).toBe(true);
  });
});

import { pairSeKeys, type Pick } from "@/lib/priority/allocate";
describe("SE pairs among key words", () => {
  const ids = ["a", "b", "c", "d", "e", "f", "s1", "s2", "x"];
  const scores = scoreAll(ids.map((id) => ({ id, yield: 0.5 })), [], now).map((s) => ({ ...s, P: { a: 0.9, b: 0.8, c: 0.7, d: 0.2, e: 0.1, f: 0.6, s1: 0.5, s2: 0.4, x: 0.3 }[s.itemId]! }));
  const syn: Record<string, string[]> = { a: ["s1"], s1: ["a"], b: ["s2", "c"], s2: ["b"], c: ["b"], f: ["x"], x: ["f"] };
  const picks = (list: string[], bucket: Pick["bucket"] = "new"): Pick[] => list.map((itemId) => ({ itemId, bucket, reason: "" }));

  it("pairs synonyms already picked, then swaps a partner in for the lowest-priority pick", () => {
    const { keys, pairs } = pairSeKeys(picks(["a", "b", "c", "d", "e"]), scores, (id) => syn[id] ?? [], { pairs: 2 });
    expect(pairs).toEqual([["b", "c"], ["a", "s1"]]);
    expect(keys.map((k) => k.itemId).sort()).toEqual(["a", "b", "c", "d", "s1"]); // e (lowest P) made way
    expect(keys.find((k) => k.itemId === "s1")!.reason).toMatch(/^SE partner for a/);
  });

  it("keeps review picks and protected ones, and skips a pair an earlier SE item keyed", () => {
    const list = [...picks(["a", "f"]), ...picks(["d"], "review"), ...picks(["e"])];
    const { keys, pairs } = pairSeKeys(list, scores, (id) => syn[id] ?? [], { pairs: 2, keep: (id) => id === "e", usedPair: (p, q) => [p, q].sort().join() === "a,s1" });
    // a's only partner was keyed before; f's partner x would have to replace a (d is review, e kept), which ranks higher
    expect(pairs).toEqual([]);
    expect(keys.map((k) => k.itemId)).toEqual(["a", "f", "d", "e"]);
  });
});

describe("dismissed words", () => {
  const dismiss = (d: number) => e("dismissed", WORD_W.dismissed, d);
  it("a dismissal leaves S, coverage and recency alone", () => {
    const before = scoreItem("w", [e("distractor_chosen", 0.6, 10)], 0.5, now);
    const after = scoreItem("w", [e("distractor_chosen", 0.6, 10), dismiss(0)], 0.5, now);
    expect(after.dismissed).toBe(true);
    expect(after.reason).toBe("dismissed");
    expect(after.S).toBeCloseTo(before.S);
    expect(after.C).toBe(before.C);
    expect(after.P).toBeCloseTo(before.P);
  });
  it("a later miss brings it back; a later right answer or showing does not", () => {
    expect(scoreItem("w", [e("distractor_chosen", 0.6, 10), dismiss(5), e("key_missed", 0.8, 1)], 0.5, now).dismissed).toBeUndefined();
    expect(scoreItem("w", [e("distractor_chosen", 0.6, 10), dismiss(5), e("dont_know", WORD_W.dont_know, 1)], 0.5, now).dismissed).toBeUndefined();
    expect(scoreItem("w", [e("distractor_chosen", 0.6, 10), dismiss(5), e("key_correct", -0.6, 1), e("seen_known", -0.3, 1)], 0.5, now).dismissed).toBe(true);
  });
});
