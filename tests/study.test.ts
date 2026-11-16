import fs from "node:fs";
import { describe, expect, it } from "vitest";
import katex from "katex";
import concepts from "@/data/concepts.json";
import { applyMarks, cardId, markIds, orderSections, StudySchema, studyStats, type Mark, type Study } from "@/lib/study";
import type { Test } from "@/lib/types";

describe("content/study/quant.json", () => {
  const guide = StudySchema.parse(JSON.parse(fs.readFileSync("content/study/quant.json", "utf8")));
  /** every Rich string in the guide (formula tiles' tex is bare TeX, checked separately) */
  const lines = () => [
    guide.intro,
    ...guide.quickRef.flatMap((g) => g.items.flatMap((it) => [it.name, it.note ?? ""])),
    ...guide.formats.flatMap((f) => f.rules),
    ...guide.pacing,
    ...guide.sections.flatMap((s) => [s.idea, s.example.q, ...s.example.steps, ...s.facts, ...s.tricks, ...s.traps,
      ...(s.tips ?? []).flatMap((t) => [t.title, t.text, t.example ?? ""]),
      ...(s.patterns ?? []).flatMap((p) => [p.idea, ...p.cases.flatMap((c) => [c.name, c.q, c.spot, ...c.steps]), ...(p.notWhen ?? [])])]),
  ];

  it("puts every quant concept in exactly one section, and names no unknown one", () => {
    const known = new Set(concepts.map((c) => c.id));
    const seen = guide.sections.flatMap((s) => s.concepts);
    expect(seen.filter((c) => !known.has(c))).toEqual([]);
    expect(seen.filter((c, i) => seen.indexOf(c) !== i)).toEqual([]);
    expect([...known].filter((c) => !seen.includes(c))).toEqual([]);
  });

  it("has unique section ids and balanced $math$ in every line", () => {
    const ids = guide.sections.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(lines().filter((l) => (l.match(/\$/g) ?? []).length % 2 !== 0)).toEqual([]);
  });

  it("draws every tip figure as one clean, theme-colored SVG", () => {
    const svgs = guide.sections.flatMap((s) => (s.tips ?? []).flatMap((t) => (t.svg ? [t.svg] : [])));
    expect(svgs.length).toBeGreaterThan(0);
    const bad = svgs.filter((svg) => {
      const tags = svg.match(/<[a-z][^>]*>/g) ?? [];
      const dupAttr = tags.some((t) => {
        const names = [...t.matchAll(/\s([a-z-]+)=/g)].map((m) => m[1]);
        return new Set(names).size !== names.length;
      });
      // one root, an accessible label, colors only from currentColor / theme vars (so dark mode works), nothing executable
      return !/^<svg [^>]*viewBox="[^"]+"[^>]*aria-label="[^"]+"/.test(svg) || !svg.endsWith("</svg>") || svg.indexOf("<svg", 1) !== -1
        || dupAttr || /#[0-9a-f]{3,6}\b|rgb\(|<script|\son[a-z]+=/i.test(svg);
    });
    expect(bad).toEqual([]);
  });

  it("renders every formula and every $math$ span in KaTeX without an error", () => {
    const tex = [
      ...guide.quickRef.flatMap((g) => g.items.map((it) => it.tex)),
      ...lines().flatMap((l) => [...l.matchAll(/\$((?:\\.|[^$\\])+)\$/g)].map((m) => m[1])),
    ];
    expect(tex.length).toBeGreaterThan(200);
    const bad = tex.filter((t) => {
      try {
        katex.renderToString(t, { throwOnError: true });
        return false;
      } catch {
        return true;
      }
    });
    expect(bad).toEqual([]);
  });
});

const guide: Study = {
  measure: "quant",
  intro: "x",
  quickRef: [{ title: "x", items: [{ name: "x", tex: "x" }] }],
  formats: [],
  pacing: ["x"],
  sections: [
    { id: "geo", title: "Geometry", concepts: ["circles", "triangles"], idea: "x", example: { q: "x", steps: ["x"] }, facts: ["x"], tricks: ["x"], traps: ["x"] },
    { id: "count", title: "Counting", concepts: ["counting-permutations"], idea: "x", example: { q: "x", steps: ["x"] }, facts: ["x"], tricks: ["x"], traps: ["x"] },
    { id: "sets", title: "Sets", concepts: ["overlapping-sets"], idea: "x", example: { q: "x", steps: ["x"] }, facts: ["x"], tricks: ["x"], traps: ["x"] },
  ],
};

const q = (id: string, type: "mc" | "qc", primary: string, secondary?: string, trap?: string) => ({
  id,
  section: 1,
  type,
  difficulty: 4,
  prompt: "p",
  key: { sel: [0] },
  explanation: { key: "k", steps: [], ...(trap ? { trap } : {}) },
  tags: [{ kind: "concept", id: primary, role: "primary" }, ...(secondary ? [{ kind: "concept", id: secondary, role: "secondary" }] : [])],
});
const tests = new Map<string, Test>([
  ["quant-001", { id: "quant-001", measure: "quant", questions: [q("s1q1", "mc", "circles", "counting-permutations", "used the radius"), q("s1q2", "qc", "triangles"), q("s1q3", "mc", "counting-permutations")] } as unknown as Test],
  ["verbal-001", { id: "verbal-001", measure: "verbal", questions: [q("s1q1", "mc", "circles")] } as unknown as Test],
]);
const day = new Date("2026-11-08T10:00:00Z");
const attempt = (id: number, testId: string, finished = true, abandoned = false) => ({ id, testId, startedAt: day, finishedAt: finished ? day : null, abandonedAt: abandoned ? day : null, sectionState: {} });
const resp = (attemptId: number, questionId: string, isCorrect: boolean, timeMs = 60_000, guessed = false) => ({ attemptId, questionId, isCorrect, timeMs, guessed });

describe("studyStats", () => {
  const attempts = [attempt(1, "quant-001"), attempt(2, "quant-001", false, true), attempt(3, "quant-001", false), attempt(4, "verbal-001")];
  const responses = [
    resp(1, "quant-001:s1q1", false, 200_000, true),
    resp(1, "quant-001:s1q2", true, 40_000),
    resp(1, "quant-001:s1q3", true, 90_000),
    resp(2, "quant-001:s1q1", true), // abandoned
    resp(3, "quant-001:s1q1", true), // unfinished
    resp(4, "verbal-001:s1q1", true), // other measure
  ];
  const s = studyStats(guide, attempts, responses, tests);

  it("counts only finished, listed attempts of the guide's measure", () => {
    expect(s.overall).toMatchObject({ n: 3, correct: 2, tests: 1 });
  });

  it("files a question under every section its primary or secondary tags reach", () => {
    expect(s.sections.get("geo")).toMatchObject({ n: 2, correct: 1 });
    expect(s.sections.get("count")).toMatchObject({ n: 2, correct: 1 });
    expect(s.sections.get("sets")).toMatchObject({ n: 0, correct: 0, misses: [] });
  });

  it("builds the miss with what the review link and trap line need", () => {
    expect(s.sections.get("geo")!.misses).toEqual([{ testId: "quant-001", attemptId: 1, qid: "s1q1", type: "mc", difficulty: 4, timeMs: 200_000, guessed: true, trap: "used the radius", finishedAt: day }]);
  });

  it("splits by format and summarizes pacing", () => {
    expect(s.formats.get("mc")).toMatchObject({ n: 2, correct: 1 });
    expect(s.formats.get("qc")).toMatchObject({ n: 1, correct: 1 });
    expect(s.pacing).toEqual({ hitMs: 65_000, missMs: 200_000, long: 1, longRight: 0, guessed: 1, guessedRight: 0 });
  });
});

describe("orderSections", () => {
  const t = (n: number, correct: number) => ({ n, correct, avgMs: 0 });
  const ids = (stats: Map<string, ReturnType<typeof t>>) => orderSections(guide.sections, stats).map((s) => s.id);

  it("puts the lowest accuracy first and untested sections last", () => {
    expect(ids(new Map([["geo", t(4, 3)], ["count", t(4, 1)], ["sets", t(0, 0)]]))).toEqual(["count", "geo", "sets"]);
  });

  it("breaks accuracy ties by more misses, then guide order", () => {
    expect(ids(new Map([["geo", t(2, 1)], ["count", t(6, 3)], ["sets", t(2, 1)]]))).toEqual(["count", "geo", "sets"]);
  });
});

describe("applyMarks", () => {
  const items = ["a", "b", "c", "d"];
  const at = (iso: string) => new Date(iso);
  const marks = new Map<string, Mark>([
    ["b", { state: "archived", updatedAt: at("2026-01-10") }],
    ["c", { state: "deleted", updatedAt: at("2026-01-10") }],
    ["d", { state: "archived", updatedAt: at("2026-01-10") }],
  ]);
  const lastMiss: Record<string, Date> = { b: at("2026-01-05"), c: at("2026-02-01"), d: at("2026-02-01") };
  const missedSince = (t: string, since: Date) => (lastMiss[t] ?? at("2000-01-01")) > since;

  it("keeps unmarked items shown and splits the rest by state, in order", () => {
    const r = applyMarks(items, (t) => t, marks);
    expect(r).toEqual({ shown: ["a"], archived: ["b", "d"], deleted: ["c"], back: new Set() });
  });

  it("brings an archived item back on a miss after archiving, never a deleted one", () => {
    const r = applyMarks(items, (t) => t, marks, missedSince);
    expect(r.shown).toEqual(["a", "d"]);
    expect(r.archived).toEqual(["b"]);
    expect(r.deleted).toEqual(["c"]);
    expect([...r.back]).toEqual(["d"]);
  });
});

describe("markIds", () => {
  const guide = StudySchema.parse(JSON.parse(fs.readFileSync("content/study/quant.json", "utf8")));
  it("gives every formula card a unique id", () => {
    const n = guide.quickRef.reduce((t, g) => t + g.items.length, 0);
    expect(markIds(guide).card.size).toBe(n);
    expect(markIds(guide).card.has(cardId(guide.quickRef[0].title, guide.quickRef[0].items[0].name))).toBe(true);
  });
});
