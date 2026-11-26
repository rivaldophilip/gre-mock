// Every source file the bank is built from (docs/BANK.md): mocks (content/tests), drill batches (content/drill) and
// bank batches (content/bank/<measure>). Scripts only; the app reads the bank database instead.
// Order within a measure is mocks, then drill batches, then bank batches, each by number: "earlier" in the setup
// history, the novelty judge and the validator always means earlier in this order.
import fs from "node:fs";
import path from "node:path";
import { TestSchema, type Test } from "./types";
import { BANK_DIR, DRILL_DIR, TESTS_DIR, bankMeasure, isBankId, isDrillId, testPath } from "./test-path";

export type SourceKind = "mock" | "drill" | "batch";
export type SourceEntry = { id: string; kind: SourceKind; measure: "verbal" | "quant"; file: string };

export const sourceKind = (id: string): SourceKind => (isDrillId(id) ? "drill" : isBankId(id) ? "batch" : "mock");
export const sourceNo = (id: string) => Number(/-(\d+)$/.exec(id)?.[1] ?? 0);
const KIND_RANK: Record<SourceKind, number> = { mock: 0, drill: 1, batch: 2 };

/** The measure a source id belongs to: drill batches are verbal. */
export function sourceMeasure(id: string): "verbal" | "quant" {
  if (isDrillId(id)) return "verbal";
  if (isBankId(id)) return bankMeasure(id);
  return id.startsWith("quant-") ? "quant" : "verbal";
}

/** Negative when `a` comes before `b` (same measure assumed). */
export const compareSources = (a: string, b: string) => KIND_RANK[sourceKind(a)] - KIND_RANK[sourceKind(b)] || sourceNo(a) - sourceNo(b);
export const isEarlier = (a: string, b: string) => compareSources(a, b) < 0;

const ids = (dir: string, re: RegExp) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => re.test(f)).map((f) => f.slice(0, -5)) : []);

/** Every source on disk: quant then verbal, each in source order. */
export function listSources(): SourceEntry[] {
  const all = [
    ...ids(TESTS_DIR, /^(verbal|quant)-\d{3}\.json$/),
    ...ids(DRILL_DIR, /^drill-\d{3}\.json$/),
    ...ids(path.join(BANK_DIR, "quant"), /^qbank-\d{3}\.json$/),
    ...ids(path.join(BANK_DIR, "verbal"), /^vbank-\d{3}\.json$/),
  ];
  return all
    .map((id) => ({ id, kind: sourceKind(id), measure: sourceMeasure(id), file: testPath(id) }))
    .sort((a, b) => (a.measure === b.measure ? compareSources(a.id, b.id) : a.measure === "quant" ? -1 : 1));
}

/** A source file, parsed; null when missing or invalid. */
export function readSource(id: string): Test | null {
  const file = testPath(id);
  if (!fs.existsSync(file)) return null;
  const r = TestSchema.safeParse(JSON.parse(fs.readFileSync(file, "utf8")));
  return r.success ? r.data : null;
}

/**
 * Every source of a measure, in source order: the mocks in `dir`, then (verbal) the drill batches, then the bank
 * batches. A `dir` other than content/tests (a test fixture) holds mocks only.
 */
export function measureSources(measure: string, dir = TESTS_DIR): Test[] {
  const mocks = ids(dir, new RegExp(`^${measure}-\\d+\\.json$`)).map((id) => path.join(dir, `${id}.json`));
  const real = path.resolve(dir) === path.resolve(TESTS_DIR);
  const rest = real ? listSources().filter((s) => s.measure === measure && s.kind !== "mock").map((s) => s.file) : [];
  return [...mocks, ...rest]
    .map((f) => TestSchema.safeParse(JSON.parse(fs.readFileSync(f, "utf8"))))
    .flatMap((r) => (r.success ? [r.data] : []))
    .sort((a, b) => compareSources(a.id, b.id));
}
