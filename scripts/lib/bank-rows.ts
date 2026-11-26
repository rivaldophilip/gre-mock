// The rows one source file becomes in the question bank (lib/db/bank.ts). Pure, so the round trip (rows back to the
// file, lib/virtual-test.ts) is tested without a database.
import crypto from "node:crypto";
import type { bank } from "../../lib/db";
import { slotType } from "../../lib/qtypes";
import { makeRef } from "../../lib/ref";
import { sourceKind } from "../../lib/sources";
import type { Test } from "../../lib/types";

type Row<T extends { $inferInsert: unknown }> = T["$inferInsert"];
export type BankRows = {
  source: Row<typeof bank.sources>;
  items: Row<typeof bank.items>[];
  passages: Row<typeof bank.passages>[];
  figures: Row<typeof bank.figures>[];
  units: Row<typeof bank.units>[];
  tags: Row<typeof bank.itemTags>[];
};

/** Key order never changes a hash. */
export function stableJson(x: unknown): string {
  if (Array.isArray(x)) return `[${x.map(stableJson).join(",")}]`;
  if (x && typeof x === "object")
    return `{${Object.keys(x)
      .filter((k) => (x as Record<string, unknown>)[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableJson((x as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  return JSON.stringify(x);
}
export const hashOf = (x: unknown) => crypto.createHash("sha1").update(stableJson(x)).digest("hex").slice(0, 16);

/** A unit's shape from its actual counts: rc4-long (4+ questions), rc3, rc2, rc1, arg1, di3. */
export function unitShape(kind: "reading" | "argument" | "di", n: number): string {
  if (kind === "argument") return `arg${n}`;
  if (kind === "di") return `di${n}`;
  return n >= 4 ? `rc${n}-long` : `rc${n}`;
}

/**
 * Rows for one source. `position` is its place in source order; `setupGroup` maps an item's ref to the ref naming its
 * setup group (quant). Retired items keep rows with status `retired`; the sync marks rows whose item left the file `gone`.
 */
export function bankRows(test: Test, position: number, setupGroup: Map<string, string> = new Map()): BankRows {
  const sid = test.id;
  const ns = (id: string | undefined) => (id ? makeRef(sid, id) : null);
  const status = (retired?: boolean) => (retired ? "retired" : "active");
  const isArg = (pid: string) => test.questions.some((q) => q.passageId === pid && q.subtype === "arg");

  const items = test.questions.map((q, i) => {
    const ref = makeRef(sid, q.id);
    const primary = q.tags.find((t) => t.kind === "concept" && t.role === "primary")?.id ?? null;
    const unit = q.setId ? ns(q.setId) : q.passageId ? ns(q.passageId) : null;
    const row = {
      ref,
      sourceId: sid,
      qid: q.id,
      measure: test.measure,
      type: q.type,
      slotType: slotType(q),
      section: q.section,
      position: i,
      difficulty: q.difficulty,
      solverRating: q.solverRating ?? null,
      primary,
      variant: q.variant ?? null,
      setup: q.setup ?? null,
      setupGroup: setupGroup.get(ref) ?? null,
      keyWords: [...new Set(q.tags.filter((t) => t.kind === "word" && t.role === "key").map((t) => t.id))],
      revisits: q.revisits ?? null,
      unitId: unit,
      passageId: ns(q.passageId),
      figureId: ns(q.figureId),
      status: status(q.retired),
      body: q,
    };
    return { ...row, hash: hashOf({ ...row, setupGroup: null }) };
  });

  const passages = test.passages.map((p, i) => {
    const row = {
      ref: makeRef(sid, p.id),
      sourceId: sid,
      pid: p.id,
      position: i,
      kind: isArg(p.id) ? "argument" : "reading",
      paragraphs: p.paragraphs.length,
      domain: p.domain ?? null,
      status: test.questions.some((q) => q.passageId === p.id && !q.retired) ? "active" : "retired",
      body: p,
    };
    return { ...row, hash: hashOf(row) };
  });

  const figures = test.figures.map((f, i) => {
    const row = { ref: makeRef(sid, f.id), sourceId: sid, fid: f.id, position: i, status: "active", body: f };
    return { ...row, hash: hashOf(row) };
  });

  // units: each passage with its questions, each DI set
  const groups = new Map<string, { kind: "reading" | "argument" | "di"; qs: Test["questions"] }>();
  for (const q of test.questions) {
    const key = q.setId ?? q.passageId;
    if (!key) continue;
    const kind = q.setId ? "di" : isArg(q.passageId!) ? "argument" : "reading";
    const g = groups.get(key) ?? { kind, qs: [] };
    g.qs.push(q);
    groups.set(key, g);
  }
  const units = [...groups].map(([key, g]) => {
    const live = g.qs.filter((q) => !q.retired);
    const levels = g.qs.map((q) => q.difficulty);
    return {
      id: makeRef(sid, key),
      sourceId: sid,
      measure: test.measure,
      shape: unitShape(g.kind, g.qs.length),
      n: g.qs.length,
      minLevel: Math.min(...levels),
      maxLevel: Math.max(...levels),
      section: g.qs[0].section,
      status: live.length === g.qs.length ? "active" : "retired",
    };
  });

  // tags, with the passage's own tags copied onto each of its questions (so a word lookup finds the question)
  const tags = new Map<string, Row<typeof bank.itemTags>>();
  for (const q of test.questions) {
    const passageTags = q.passageId ? (test.passages.find((p) => p.id === q.passageId)?.tags ?? []) : [];
    for (const t of [...q.tags, ...passageTags]) {
      const row = { ref: makeRef(sid, q.id), kind: t.kind, tagId: t.id, role: t.role };
      tags.set(`${row.ref}|${row.kind}|${row.tagId}|${row.role}`, row);
    }
  }

  const sourceRow = { id: sid, kind: sourceKind(sid), measure: test.measure, title: test.title, sections: test.sections, position };
  return {
    source: { ...sourceRow, hash: hashOf({ ...sourceRow, items: items.map((x) => x.hash), passages: passages.map((x) => x.hash), figures: figures.map((x) => x.hash) }) },
    items,
    passages,
    figures,
    units,
    tags: [...tags.values()],
  };
}
