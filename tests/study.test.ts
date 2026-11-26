import fs from "node:fs";
import { describe, expect, it } from "vitest";
import katex from "katex";
import concepts from "@/data/concepts.json";
import { applyMarks, cardId, isTile, markIds, orderSections, pieceId, StudySchema, studyStats, topicCards, type Mark, type Miss, type Study, type StudyCard, type StudySection } from "@/lib/study";
import rcSkills from "@/data/rc_skills.json";
import type { Test } from "@/lib/types";

const loadGuide = (measure: string) => StudySchema.parse(JSON.parse(fs.readFileSync(`content/study/${measure}.json`, "utf8")));

/** every Rich string in a guide (formula tiles' tex is bare TeX, checked separately) */
const richLines = (guide: Study) => [
  guide.intro,
  ...guide.quickRef.flatMap((g) => g.items.flatMap((it) => [it.name, it.text ?? "", it.note ?? ""])),
  ...guide.formats.flatMap((f) => f.rules),
  ...guide.pacing,
  ...guide.sections.flatMap((s) => [...(s.patterns ?? []).flatMap((p) => [p.title, p.idea]), ...s.cards.flatMap(cardLines)]),
];
const cardLines = (c: StudyCard): string[] => {
  switch (c.kind) {
    case "example": return [c.q, ...c.steps];
    case "contrast": return [c.q, c.label, c.answer, ...c.wrong.flatMap((w) => [w.text, w.why])];
    case "case": return [c.name, c.q, c.spot, ...c.steps];
    case "idea": return [c.text];
    default: return [c.name, c.text ?? "", c.note ?? "", c.example ?? ""];
  }
};

/** Each guide's sections cover its concept ids exactly once, and name no unknown one. */
const KNOWN: Record<string, string[]> = {
  quant: concepts.map((c) => c.id),
  verbal: rcSkills.filter((c) => c.area === "argument").map((c) => c.id),
};

describe.each(["quant", "verbal"])("content/study/%s.json", (measure) => {
  const guide = loadGuide(measure);
  const lines = () => richLines(guide);

  it("is the guide for its measure", () => {
    expect(guide.measure).toBe(measure);
  });

  it(`puts every ${measure} concept in exactly one section, and names no unknown one`, () => {
    const known = new Set(KNOWN[measure]);
    const seen = guide.sections.flatMap((s) => s.concepts);
    expect(seen.filter((c) => !known.has(c))).toEqual([]);
    expect(seen.filter((c, i) => seen.indexOf(c) !== i)).toEqual([]);
    expect([...known].filter((c) => !seen.includes(c))).toEqual([]);
  });

  it("has unique section ids, unique card names per group and balanced $math$ in every line", () => {
    const ids = guide.sections.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(markIds(guide).card.size).toBe(guide.quickRef.reduce((t, g) => t + g.items.length, 0));
    expect(markIds(guide).piece.size).toBe(guide.sections.reduce((t, s) => t + s.cards.length, 0));
    expect(lines().filter((l) => (l.match(/\$/g) ?? []).length % 2 !== 0)).toEqual([]);
  });

  it("opens every topic with its big idea and a worked example", () => {
    expect(guide.sections.filter((s) => !s.cards.some((c) => c.kind === "idea") || !s.cards.some((c) => c.kind === "example")).map((s) => s.id)).toEqual([]);
  });

  it("draws every card figure as one clean, theme-colored SVG", () => {
    const svgs = guide.sections.flatMap((s) => s.cards.flatMap((c) => ("svg" in c && c.svg ? [c.svg] : [])));
    if (measure === "quant") expect(svgs.length).toBeGreaterThan(0);
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
      ...guide.quickRef.flatMap((g) => g.items.flatMap((it) => (it.tex ? [it.tex] : []))),
      ...guide.sections.flatMap((s) => s.cards.flatMap((c) => (isTile(c) && c.tex ? [c.tex] : []))),
      ...lines().flatMap((l) => [...l.matchAll(/\$((?:\\.|[^$\\])+)\$/g)].map((m) => m[1])),
    ];
    if (measure === "quant") expect(tex.length).toBeGreaterThan(200);
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

describe("StudySchema quick-reference tiles", () => {
  const base = { measure: "verbal", intro: "x", formats: [], pacing: ["x"], sections: [{ id: "x", title: "x", concepts: ["x"], cards: [{ id: "idea", kind: "idea", text: "x" }] }] };
  const tiles = (item: object) => ({ ...base, quickRef: [{ title: "x", items: [{ name: "x", ...item }] }] });
  it("takes a formula or a text rule, but not both or neither", () => {
    expect(StudySchema.safeParse(tiles({ tex: "x" })).success).toBe(true);
    expect(StudySchema.safeParse(tiles({ text: "x" })).success).toBe(true);
    expect(StudySchema.safeParse(tiles({ tex: "x", text: "x" })).success).toBe(false);
    expect(StudySchema.safeParse(tiles({})).success).toBe(false);
  });
});

describe("StudySchema topic cards", () => {
  const parse = (section: object) => StudySchema.safeParse({ measure: "quant", intro: "x", formats: [], pacing: ["x"], sections: [{ id: "t", title: "t", concepts: ["primes-factors"], ...section }] });
  const idea = { id: "idea", kind: "idea", text: "x" };
  const cs = { id: "c1", kind: "case", pattern: "p", name: "x", q: "x", spot: "x", steps: ["x"] };
  it("takes cards with unique ids, known patterns and the topic's own variants", () => {
    expect(parse({ cards: [idea, { id: "r", kind: "rule", name: "x", text: "x", variant: "GCD / LCM from two products or a word problem", added: "2026-11-25" }] }).success).toBe(true);
    expect(parse({ patterns: [{ id: "p", title: "x", idea: "x" }], cards: [idea, cs, { id: "l", kind: "limit", pattern: "p", name: "x", tex: "x" }] }).success).toBe(true);
  });
  it("refuses a duplicate id, a dangling or empty pattern, a foreign variant and a bad id or date", () => {
    expect(parse({ cards: [idea, { ...idea, text: "y" }] }).success).toBe(false);
    expect(parse({ cards: [idea, cs] }).success).toBe(false);
    expect(parse({ patterns: [{ id: "p", title: "x", idea: "x" }], cards: [idea] }).success).toBe(false);
    expect(parse({ cards: [idea, { id: "r", kind: "rule", name: "x", text: "x", variant: "not a sub-form" }] }).success).toBe(false);
    expect(parse({ cards: [{ ...idea, id: "Big Idea" }] }).success).toBe(false);
    expect(parse({ cards: [{ ...idea, added: "25/11/2026" }] }).success).toBe(false);
    expect(parse({ cards: [idea, { id: "r", kind: "rule", name: "x" }] }).success).toBe(false);
    expect(parse({ cards: [idea, { id: "r", kind: "rule", name: "x", text: "x", tex: "x" }] }).success).toBe(false);
  });
});

const guide: Study = {
  measure: "quant",
  intro: "x",
  quickRef: [{ title: "x", items: [{ name: "x", tex: "x" }] }],
  formats: [],
  pacing: ["x"],
  sections: [
    { id: "geo", title: "Geometry", concepts: ["circles", "triangles"], cards: [{ id: "idea", kind: "idea", text: "x" }] },
    { id: "count", title: "Counting", concepts: ["counting-permutations"], cards: [{ id: "idea", kind: "idea", text: "x" }] },
    { id: "sets", title: "Sets", concepts: ["overlapping-sets"], cards: [{ id: "idea", kind: "idea", text: "x" }] },
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
    expect(s.sections.get("geo")!.misses).toEqual([{ testId: "quant-001", attemptId: 1, ref: "quant-001:s1q1", qid: "s1q1", type: "mc", difficulty: 4, timeMs: 200_000, guessed: true, trap: "used the radius", finishedAt: day }]);
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

describe("topicCards", () => {
  const at = (iso: string) => new Date(iso);
  const s: StudySection = {
    id: "nt",
    title: "Number theory",
    concepts: ["primes-factors"],
    cards: [
      { id: "idea", kind: "idea", text: "x" },
      { id: "gcd", kind: "rule", name: "x", text: "x", variant: "gcd" },
      { id: "plain", kind: "trap", name: "x", text: "x" },
      { id: "late", kind: "shortcut", name: "x", text: "x", added: "2026-03-01" },
      { id: "old", kind: "shortcut", name: "x", text: "x", added: "2026-01-01" },
    ],
  };
  const archived = (iso: string): Mark => ({ state: "archived", updatedAt: at(iso) });
  const marks = new Map([[pieceId("nt", "gcd"), archived("2026-02-01")], [pieceId("nt", "plain"), archived("2026-02-01")]]);
  const miss = (variant: string | undefined, iso: string) => ({ variant, finishedAt: at(iso) }) as Miss;

  it("brings back only the archived card whose variant a later mock missed", () => {
    const r = topicCards(s, marks, [miss("gcd", "2026-02-10"), miss(undefined, "2026-02-10")]);
    expect(r.shown.map((c) => c.id)).toEqual(["idea", "gcd", "late", "old"]);
    expect(r.archived.map((c) => c.id)).toEqual(["plain"]);
    expect([...r.back]).toEqual(["gcd"]);
    expect(r.missedSince).toBe(true);
  });

  it("keeps cards archived on an earlier or other-variant miss", () => {
    const r = topicCards(s, marks, [miss("gcd", "2026-01-10"), miss("lcm", "2026-02-10")]);
    expect(r.archived.map((c) => c.id)).toEqual(["gcd", "plain"]);
    expect(r.back.size).toBe(0);
  });

  it("flags as new only shown cards added since the topic's latest archive", () => {
    expect([...topicCards(s, marks, []).fresh]).toEqual(["late"]);
    expect(topicCards(s, new Map(), []).fresh.size).toBe(0);
  });
});
