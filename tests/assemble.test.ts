import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { assembleCustom, assembleMock } from "@/lib/assemble";
import { fillSlot, consumeLevel } from "@/lib/assemble/ladder";
import { newState, scorer } from "@/lib/assemble/score";
import { matchTargets, readingSplits } from "@/lib/assemble/plan";
import { spreadLength, spreadLevels } from "@/lib/assemble/custom";
import { repair, violation } from "@/lib/assemble/rules";
import type { Cand, Ctx, Picked, Slot, UnitCand } from "@/lib/assemble/types";
import { heldRefs, latestResults } from "@/lib/holds";
import { scoreAll } from "@/lib/priority/compute";
import { rng } from "@/lib/priority/allocate";
import { REVISIT_MAX } from "@/lib/priority/revisit";
import { openingBlockRules, typeCountRules, difficultyRules, type Blueprint } from "@/lib/blueprint-rules";
import type { SlotType } from "@/lib/qtypes";
import type { Layout } from "@/lib/virtual-test";

const blueprints = JSON.parse(fs.readFileSync("data/blueprints.json", "utf8")) as Record<string, Blueprint>;
const AREAS = ["arithmetic", "algebra", "geometry", "data"];

let n = 0;
const cand = (over: Partial<Cand> & { slotType: SlotType }): Cand => ({
  ref: `src-${String(Math.floor(n / 100)).padStart(3, "0")}:s1q${++n}`,
  sourceId: "src",
  measure: "quant",
  type: over.slotType === "di" ? "mc" : over.slotType.startsWith("tc") ? "tc" : over.slotType,
  position: n,
  difficulty: 4,
  solverRating: null,
  primary: null,
  variant: null,
  setupGroup: null,
  keyWords: [],
  revisits: null,
  unitId: null,
  status: "active",
  tags: [],
  ...over,
});

/** A quant bank: every concept has one item of every format at levels 3-5, plus DI sets. */
function quantCtx(over: Partial<Ctx> = {}, opts: { concepts?: number; di?: number } = {}): Ctx {
  const concepts = Array.from({ length: opts.concepts ?? 30 }, (_, i) => ({ id: `c${i}`, area: AREAS[i % 4] }));
  const items: Cand[] = [];
  for (const c of concepts) for (const t of ["qc", "mc", "mc_multi", "numeric"] as SlotType[]) for (const level of [3, 4, 5]) items.push(cand({ slotType: t, difficulty: level, primary: c.id }));
  const units: UnitCand[] = [];
  for (let u = 0; u < (opts.di ?? 3); u++) {
    const id = `src:d${u}`;
    const its = [3, 4, 5].map((level) => cand({ slotType: "di", difficulty: level, primary: "c3", unitId: id }));
    items.push(...its);
    units.push({ id, sourceId: "src", kind: "di", shape: "di3", n: 3, status: "active", paragraphs: 1, domain: null, items: its });
  }
  return baseCtx("quant", items, units, concepts, over);
}

function baseCtx(measure: "quant" | "verbal", items: Cand[], units: UnitCand[], concepts: { id: string; area: string }[], over: Partial<Ctx>): Ctx {
  const now = new Date("2026-11-26T00:00:00Z");
  return {
    measure,
    items,
    units,
    seen: new Set(),
    held: new Set(),
    results: new Map(),
    conceptScores: scoreAll(concepts.map((c) => ({ id: c.id, yield: 0.5 })), [], now).map((s, i) => ({ ...s, area: concepts[i].area })),
    wordScores: [],
    isSecondary: () => false,
    synonyms: () => [],
    conceptName: (id) => id,
    variants: {},
    variantUse: new Map(),
    seenGroups: new Set(),
    revisits: [],
    blueprint: blueprints[measure],
    random: rng(3),
    ...over,
  };
}

const flat = (l: Layout) => l.sections.flatMap((s) => s.items.map((i) => ({ ...i, section: s.n })));

describe("mock assembly", () => {
  it("fills a fresh bank exactly: the blueprint's types and levels, no fallback", () => {
    const ctx = quantCtx();
    const out = assembleMock(ctx);
    expect(out.failures).toEqual([]);
    expect(out.fallbacks).toEqual([]);
    const items = flat(out.layout);
    expect(out.layout.sections.map((s) => s.items.length)).toEqual([12, 15]);
    expect(new Set(items.map((i) => i.ref)).size).toBe(27);
    const qs = items.map((i) => ({ section: i.section as 1 | 2, difficulty: i.level, type: ctx.items.find((c) => c.ref === i.ref)!.type as never, setId: i.slotType === "di" ? "d" : undefined }));
    expect(typeCountRules(qs, ctx.blueprint)).toEqual([]);
    expect(difficultyRules(qs).every((r) => r.ok)).toBe(true);
    expect(openingBlockRules(qs, "quant")).toEqual([]);
    // the DI set stays together, at the end of section 1
    expect(out.layout.sections[0].items.slice(-3).every((i) => i.slotType === "di")).toBe(true);
  });

  it("never uses a seen or held item while fresh ones remain, and marks nothing reused", () => {
    const base = quantCtx();
    const seen = new Set(base.items.filter((c) => c.primary === "c0").map((c) => c.ref));
    const held = new Set(base.items.filter((c) => c.primary === "c1").map((c) => c.ref));
    const out = assembleMock({ ...base, seen, held });
    for (const i of flat(out.layout)) {
      expect(seen.has(i.ref) || held.has(i.ref)).toBe(false);
      expect(i.reused).toBeUndefined();
    }
  });

  it("places at most REVISIT_MAX revisit siblings", () => {
    const base = quantCtx();
    const misses = base.items.filter((c) => c.slotType === "qc" && c.difficulty === 4).slice(0, 6);
    const siblings = misses.map((m) => cand({ slotType: "mc", difficulty: 4, primary: m.primary, revisits: m.ref }));
    const conceptScores = base.conceptScores.map((s) => (misses.some((m) => m.primary === s.itemId) ? { ...s, P: 0.99, weakEvidence: 1, tested: true } : s));
    const ctx = { ...base, items: [...base.items, ...siblings], conceptScores, seen: new Set(misses.map((m) => m.ref)), revisits: misses.map((m, i) => ({ ref: m.ref, at: i, result: "missed" as const })) };
    const out = assembleMock(ctx);
    const placed = flat(out.layout).filter((i) => i.revisitOf);
    expect(placed.length).toBeGreaterThan(0);
    expect(placed.length).toBeLessThanOrEqual(REVISIT_MAX);
    for (const p of placed) expect(siblings.find((s) => s.ref === p.ref)?.revisits).toBe(p.revisitOf);
  });

  it("keeps a setup group and a key word to one item per quiz", () => {
    const base = quantCtx();
    const grouped = base.items.map((c) => (c.slotType === "qc" ? { ...c, setupGroup: "g1" } : c));
    const out = assembleMock({ ...base, items: grouped });
    const groups = flat(out.layout).map((i) => grouped.find((c) => c.ref === i.ref)!.setupGroup).filter(Boolean);
    expect(groups).toEqual(["g1"]);
  });

  it("fails, naming the slot, when not even a reuse is left", () => {
    const ctx = quantCtx({}, { di: 0 });
    const out = assembleMock(ctx);
    expect(out.failures.map((f) => f.slotId)).toEqual(["s1-di"]);
    expect(out.failures[0].step).toBe(8);
  });
});

describe("fallback ladder", () => {
  const slot: Slot = { id: "s1-qc-1", section: 1, kind: "item", slotType: "qc", level: 4, target: { kind: "concept", ids: ["t"], label: "t" } };
  const run = (items: Cand[], over: Partial<Ctx> = {}) => {
    const ctx = baseCtx("quant", items, [], [{ id: "t", area: "algebra" }, { id: "o", area: "algebra" }], over);
    const st = newState();
    st.pools.set("1|qc", [4]);
    return fillSlot(slot, ctx, st, scorer(ctx));
  };
  const t4 = () => cand({ slotType: "qc", difficulty: 4, primary: "t" });
  const t5 = () => cand({ slotType: "qc", difficulty: 5, primary: "t" });
  const t2 = () => cand({ slotType: "qc", difficulty: 2, primary: "t" });
  const o4 = () => cand({ slotType: "qc", difficulty: 4, primary: "o" });
  const o1 = () => cand({ slotType: "qc", difficulty: 1, primary: "o" });

  it("walks steps 1-7 in order and stops at 8", () => {
    expect(run([t4(), t5(), o4()])?.step).toBe(1);
    expect(run([t5(), o4()])?.step).toBe(2);
    expect(run([o4()])?.step).toBe(3);
    const a = t4();
    expect(run([a, o1()], { seen: new Set([a.ref]), results: new Map([[a.ref, { missed: true }]]) })?.step).toBe(4);
    const b = t2();
    expect(run([b, o1()], { seen: new Set([b.ref]), results: new Map([[b.ref, { missed: true }]]) })?.step).toBe(5);
    const c = o4();
    expect(run([c], { seen: new Set([c.ref]), results: new Map([[c.ref, { missed: true }]]) })?.step).toBe(6);
    expect(run([o1()])?.step).toBe(7);
    expect(run([])).toBeNull();
  });

  it("never reuses an item answered right, nor one a quiz holds", () => {
    const a = t4();
    expect(run([a], { seen: new Set([a.ref]), results: new Map([[a.ref, { missed: false }]]) })).toBeNull();
    const b = t4();
    expect(run([b], { held: new Set([b.ref]) })).toBeNull();
  });

  it("takes the nearest open level out of a pool", () => {
    const pool = [3, 4, 4, 5];
    consumeLevel(pool, 4);
    expect(pool).toEqual([3, 4, 5]);
    consumeLevel(pool, 6);
    expect(pool).toEqual([3, 4]);
  });
});

describe("plan helpers", () => {
  it("matches targets to slots by stock, priority first", () => {
    // slot 0 can only take target 1; slot 1 takes either: both get one
    const m = matchTargets(2, 2, (s, t) => (s === 0 ? t === 1 : true));
    expect(m.get(0)).toBe(1);
    expect(m.get(1)).toBe(0);
  });

  it("splits reading questions the blueprint's way first", () => {
    expect(readingSplits(7, [4, 2, 1])[0]).toEqual([4, 2, 1]);
    expect(readingSplits(4, [2, 2])[0]).toEqual([2, 2]);
    expect(readingSplits(7, [4, 2, 1]).every((p) => p.reduce((a, b) => a + b, 0) === 7)).toBe(true);
  });
});

describe("reading units", () => {
  it("fills a section's reading from other passage sizes when the blueprint's are gone", () => {
    const skills = [{ id: "rc-detail", area: "reading" }, { id: "arg-weaken", area: "argument" }];
    const items: Cand[] = [];
    const units: UnitCand[] = [];
    const unit = (kind: "reading" | "argument", size: number) => {
      const id = `src:p${units.length}`;
      const its = Array.from({ length: size }, (_, i) => cand({ slotType: kind === "argument" ? "arg" : "rc", measure: "verbal", type: "rc", difficulty: 4 + (i % 2), primary: kind === "argument" ? "arg-weaken" : "rc-detail", unitId: id }));
      items.push(...its);
      units.push({ id, sourceId: "src", kind, shape: kind === "argument" ? "arg1" : `rc${size}`, n: size, status: "active", paragraphs: 1, domain: null, items: its });
    };
    for (let i = 0; i < 4; i++) unit("reading", 3);
    unit("reading", 1);
    unit("reading", 1);
    for (let i = 0; i < 3; i++) unit("argument", 1);
    for (const t of ["tc1", "tc2", "tc3", "se"] as SlotType[]) for (let i = 0; i < 8; i++) items.push(cand({ slotType: t, measure: "verbal", difficulty: 3 + (i % 3), keyWords: [`w${t}${i}`] }));
    const ctx = baseCtx("verbal", items, units, skills, { wordScores: scoreAll(items.flatMap((c) => c.keyWords).map((id) => ({ id, yield: 0.5 })), []) });
    const out = assembleMock(ctx);
    expect(out.failures).toEqual([]);
    const reading = (s: number) => out.layout.sections[s].items.filter((i) => i.slotType === "rc").length;
    expect([reading(0), reading(1)]).toEqual([4, 7]);
    // no reading slot fell back: another split of the same total is no fallback
    expect(out.fallbacks.filter((f) => f.slotId.includes("rc"))).toEqual([]);
  });
});

describe("blueprint repair", () => {
  it("swaps items up until the section rules pass", () => {
    const ctx = quantCtx();
    const slot = (i: number): Slot => ({ id: `s2-mc-${i}`, section: 2, kind: "item", slotType: "mc", target: { kind: "concept", ids: [`c${i}`], label: "" } });
    const low = (i: number): Picked => ({ slot: slot(i), cands: [ctx.items.find((c) => c.primary === `c${i}` && c.slotType === "mc" && c.difficulty === 3)!], step: 1, reused: [false] });
    const picks = Array.from({ length: 6 }, (_, i) => low(i));
    expect(violation(picks, "quant").score).toBeGreaterThan(0);
    const fixed = repair(picks, ctx, scorer(ctx));
    expect(violation(fixed, "quant").score).toBe(0);
    expect(fixed.map((p) => p.slot.id)).toEqual(picks.map((p) => p.slot.id));
  });
});

describe("custom quizzes", () => {
  it("spreads length and levels", () => {
    expect(spreadLevels(5, 3, 5)).toEqual([3, 4, 4, 5, 5]);
    expect(spreadLevels(1, 3, 5)).toEqual([4]);
    expect(Object.fromEntries(spreadLength(10, ["qc", "mc", "di"]))).toEqual({ qc: 4, mc: 3, di: 3 });
    expect(Object.fromEntries(spreadLength(9, ["di"]))).toEqual({ di: 9 });
  });

  it("is one section of the asked length, aimed at the chosen concept, timed at pace", () => {
    const ctx = quantCtx();
    const out = assembleCustom(ctx, { kind: "custom", measure: "quant", length: 10, types: ["qc", "mc"], targets: ["c5"], levels: [4, 5], timer: true });
    expect(out.layout.sections).toHaveLength(1);
    const items = flat(out.layout);
    expect(items).toHaveLength(10);
    expect(items.filter((i) => ctx.items.find((c) => c.ref === i.ref)!.primary === "c5").length).toBeGreaterThan(0);
    expect(items.every((i) => i.level >= 4 && i.level <= 5 || out.fallbacks.length > 0)).toBe(true);
    // 5 QC at 75 s and 5 MC at 100 s
    expect(out.layout.sections[0].minutes).toBe(Math.ceil((5 * 75 + 5 * 100) / 60));
  });
});

describe("holds", () => {
  const layout = (refs: string[]) => ({ sections: [{ n: 1, minutes: 1, items: refs.map((ref) => ({ ref })) }] });
  const quizzes = [
    { id: 1, status: "ready", layout: layout(["a:1"]) },
    { id: 2, status: "started", layout: layout(["a:2"]) },
    { id: 3, status: "done", layout: layout(["a:3"]) },
    { id: 4, status: "cancelled", layout: layout(["a:4"]) },
    { id: 5, status: "draft", layout: layout(["a:5"]) },
  ];
  const att = (testId: string, mode: string, closed = false) => ({ testId, mode, finishedAt: closed ? new Date() : null, abandonedAt: null });
  const refs = (sid: string) => [`${sid}:x`, `${sid}:y`];

  it("holds a ready or started quiz's items and an open mock's, never a drill's", () => {
    const h = heldRefs(quizzes, [att("verbal-001", "exam"), att("verbal-002", "exam", true), att("drill-001", "drill"), att("quiz-2", "exam")], refs);
    expect([...h].sort()).toEqual(["a:1", "a:2", "verbal-001:x", "verbal-001:y"]);
    expect(heldRefs(quizzes, [], refs, 1).has("a:1")).toBe(false);
  });

  it("reads the latest locked answer per ref", () => {
    const r = latestResults([
      { questionId: "a:1", isCorrect: false, guessed: false, updatedAt: new Date(1), id: 1 },
      { questionId: "a:1", isCorrect: true, guessed: false, updatedAt: new Date(2), id: 2 },
      { questionId: "a:2", isCorrect: true, guessed: true, updatedAt: new Date(1), id: 3 },
    ]);
    expect(r.get("a:1")?.missed).toBe(false);
    expect(r.get("a:2")?.missed).toBe(true);
  });
});

describe("verbal assembly", () => {
  it("never keys a word or an SE pair twice", () => {
    const items: Cand[] = [];
    for (const t of ["tc1", "tc2", "tc3", "se"] as SlotType[])
      for (let i = 0; i < 10; i++) items.push(cand({ slotType: t, measure: "verbal", difficulty: 3 + (i % 3), keyWords: t === "se" ? ["same", `w${i}`] : [`${t}w${i}`] }));
    const ctx = baseCtx("verbal", items, [], [], { wordScores: scoreAll([...new Set(items.flatMap((c) => c.keyWords))].map((id) => ({ id, yield: 0.5 })), []), blueprint: { sections: [{ n: 1, minutes: 18, slots: [{ type: "se", level: 4 }, { type: "se", level: 4 }, { type: "tc1", level: 4 }] }] } });
    const out = assembleMock(ctx);
    const keys = flat(out.layout).flatMap((i) => items.find((c) => c.ref === i.ref)!.keyWords);
    expect(keys.filter((k) => k === "same")).toHaveLength(1);
    // the second SE slot has no item left that keys a fresh pair
    expect(out.failures.map((f) => f.slotType)).toEqual(["se"]);
  });
});

describe("bank gaps dry run", () => {
  it("asks for nothing when the bank can fill the next mocks exactly", async () => {
    const { dryRunFallbacks } = await import("@/scripts/lib/bank-gaps");
    // (every fixture DI set is on one concept, so the second mock's DI slot, aimed elsewhere, falls back)
    expect(dryRunFallbacks(quantCtx()).filter((f) => f.slotType !== "di")).toEqual([]);
  });

  it("turns the L3 slots a mock would fall back on into concept gaps at L3, with the slot's type", async () => {
    const { bankGaps, dryRunFallbacks } = await import("@/scripts/lib/bank-gaps");
    const base = quantCtx();
    const ctx = { ...base, items: base.items.filter((c) => c.difficulty !== 3 || c.unitId) };
    const missed = dryRunFallbacks(ctx, 2, 1).filter((f) => f.wantedLevel === 3);
    expect(missed.length).toBeGreaterThan(0);
    const gaps = bankGaps(ctx, [], new Set()).filter((g) => g.kind === "concept" && g.level === 3);
    // every L3 slot one plan leaves short is a gap (the other seeds' plans add theirs), with the slot's type
    for (const f of missed.filter((f) => f.wantedKind === "concept")) expect(gaps.some((g) => g.id === f.wantedId && g.types?.[0] === f.slotType)).toBe(true);
    expect(gaps.every((g) => g.why.includes("dry runs") && g.weight > 0)).toBe(true);
  });
});

describe("bank gaps shortfalls", () => {
  it("count a slot that several cancelled drafts logged once", async () => {
    const { bankGaps } = await import("@/scripts/lib/bank-gaps");
    const ctx = quantCtx();
    const row = (id: number) => ({ id, slotType: "mc", wantedKind: "concept", wantedId: "c1", wantedLevel: 6, step: 2, resolvedAt: null });
    const gaps = bankGaps(ctx, [row(1), row(2), row(3)], new Set(), []).filter((g) => g.id === "c1" && g.level === 6);
    expect(gaps).toHaveLength(1);
    expect(gaps[0]).toMatchObject({ kind: "concept", types: ["mc"], need: 1 });
  });
});
