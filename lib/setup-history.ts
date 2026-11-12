// What earlier tests already asked, per concept: the brief lists it so a new item uses a different setup, and the
// novelty check pairs each new item with it. Reads content/tests only (scripts, never the app).
import fs from "node:fs";
import path from "node:path";
import { TestSchema, type Question, type Test } from "./types";
import { containment, MIN_SKELETON, SETUP_TH, skeletonShingles } from "./ngram";

/** `text` is the stem plus QC quantities (for comparison); `shown` adds labels and choices (for a reader). */
export type PastItem = { testId: string; qid: string; concept: string; variant?: string; setup: string; text: string; shown: string };
/** One setup and every earlier item that used it; `worn` once two or more tests used it. */
export type SetupGroup = { setup: string; variant?: string; items: { testId: string; qid: string }[]; worn: boolean };

const testNo = (id: string) => Number(/-(\d+)$/.exec(id)?.[1] ?? 0);
export const primaryOf = (q: Question) => q.tags.find((t) => t.kind === "concept" && t.role === "primary")?.id;
/** A question's own text for setup comparison: the stem plus both QC quantities. */
export const setupText = (q: Question) => [q.prompt, q.qc ? `${q.qc.a} ${q.qc.b} ${q.qc.info ?? ""}` : ""].join(" ");

/** An item as a reader sees it, on one line: no key, explanation, tags, setup or difficulty. */
export function itemText(q: Question): string {
  const parts = [q.prompt];
  if (q.qc) parts.push(`Quantity A: ${q.qc.a} | Quantity B: ${q.qc.b}`);
  if (q.blanks) parts.push(q.blanks.map((b, i) => `blank ${i + 1}: ${b.join(" / ")}`).join("; "));
  if (q.choices) parts.push(`choices: ${q.choices.join(" / ")}`);
  return parts.join(" · ").replace(/\s+/g, " ").trim();
}

/** Every test of a measure in content/tests, in number order. */
export function measureTests(measure: string, dir = "content/tests"): Test[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => new RegExp(`^${measure}-\\d+\\.json$`).test(f))
    .map((f) => TestSchema.safeParse(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))))
    .flatMap((r) => (r.success ? [r.data] : []))
    .sort((a, b) => testNo(a.id) - testNo(b.id));
}

/** Items of tests numbered below `before` (all tests when omitted), with their primary concept. */
export function pastItems(measure: string, before?: string, dir = "content/tests"): PastItem[] {
  const out: PastItem[] = [];
  for (const t of measureTests(measure, dir)) {
    if (before && testNo(t.id) >= testNo(before)) continue;
    for (const q of t.questions) {
      const concept = primaryOf(q);
      if (!concept) continue;
      const text = setupText(q).replace(/\s+/g, " ").trim();
      out.push({ testId: t.id, qid: q.id, concept, variant: q.variant, setup: q.setup ?? clip(text, 160), text, shown: itemText(q) });
    }
  }
  return out;
}

function clip(s: string, n: number) {
  if (s.length <= n) return s;
  const i = s.lastIndexOf(" ", n);
  return s.slice(0, i > 0 ? i : n) + "…";
}

/** True when two items share a setup: the same setup line, or stems that match once numbers and names are masked. */
const normSetup = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function sameSetup(a: Pick<PastItem, "setup" | "text">, b: Pick<PastItem, "setup" | "text">): boolean {
  if (normSetup(a.setup) === normSetup(b.setup)) return true;
  return setupOverlap(a.text, b.text) >= SETUP_TH;
}

/** Skeleton overlap of two stems (0 when either is too generic to judge). */
export function setupOverlap(a: string, b: string): number {
  const x = skeletonShingles(a);
  const y = skeletonShingles(b);
  if (x.size < MIN_SKELETON || y.size < MIN_SKELETON) return 0;
  return Math.max(containment(x, y), containment(y, x));
}

/**
 * Earlier items grouped by setup across all concepts (a repeat can carry a different primary tag), then listed under
 * every concept that one of a group's items has as its primary. Most-used groups first; a group's label is its most
 * common setup line.
 */
export function conceptHistory(measure: string, before?: string, dir = "content/tests"): Map<string, SetupGroup[]> {
  const items = pastItems(measure, before, dir);
  const parent = items.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  // the same setup line links across concepts; masked stems only within one concept (generic wording chains otherwise)
  for (let i = 0; i < items.length; i++)
    for (let j = i + 1; j < items.length; j++)
      if (items[i].concept === items[j].concept ? sameSetup(items[i], items[j]) : normSetup(items[i].setup) === normSetup(items[j].setup)) parent[find(j)] = find(i);
  const members = new Map<number, PastItem[]>();
  items.forEach((it, i) => members.set(find(i), [...(members.get(find(i)) ?? []), it]));
  const out = new Map<string, SetupGroup[]>();
  for (const ms of members.values()) {
    const lines = new Map<string, number>();
    for (const m of ms) lines.set(m.setup, (lines.get(m.setup) ?? 0) + 1);
    const setup = [...lines].sort((x, y) => y[1] - x[1])[0][0];
    const group: SetupGroup = {
      setup,
      variant: ms.find((m) => m.variant)?.variant,
      items: ms.map((m) => ({ testId: m.testId, qid: m.qid })),
      worn: new Set(ms.map((m) => m.testId)).size >= 2,
    };
    for (const c of new Set(ms.map((m) => m.concept))) out.set(c, [...(out.get(c) ?? []), group]);
  }
  for (const gs of out.values()) gs.sort((x, y) => y.items.length - x.items.length);
  return out;
}

/** Variants the tests themselves record (concept -> variant -> times). */
export function testVariants(measure: string, dir = "content/tests"): Map<string, Map<string, number>> {
  const used = new Map<string, Map<string, number>>();
  for (const it of pastItems(measure, undefined, dir)) {
    if (!it.variant) continue;
    const m = used.get(it.concept) ?? new Map<string, number>();
    used.set(it.concept, m.set(it.variant, (m.get(it.variant) ?? 0) + 1));
  }
  return used;
}
