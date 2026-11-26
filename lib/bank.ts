import "server-only";
// The app's read side of the question bank (gre_bank, docs/BANK.md). Item metadata (everything but the bodies) is
// loaded whole and memoised per bank version; bodies, passages and figures are fetched by ref and cached the same
// way. The version is re-read at most every few seconds, so a sync shows up without a redeploy.
import { eq, inArray } from "drizzle-orm";
import { bank, bankDb } from "./db";
import type { Figure, Passage, Question } from "./types";
import { loadMetas, type BankMetas } from "./bank-metas";
import type { ItemBody, PartBody, SourceHead } from "./virtual-test";

export type { ItemMeta, UnitMeta, PassageMeta, SourceMeta, BankMetas } from "./bank-metas";

const VERSION_TTL_MS = 5_000;
let checked = 0;
let version = -1;
let metas: Promise<BankMetas> | null = null;
let metasVersion = -1;
const bodies = new Map<string, ItemBody>();
const parts = new Map<string, PartBody>();

/** The bank version, re-read at most every VERSION_TTL_MS. A version change drops every cache. */
export async function bankVersion(): Promise<number> {
  if (Date.now() - checked < VERSION_TTL_MS && version >= 0) return version;
  const [row] = await bankDb().select().from(bank.meta).where(eq(bank.meta.key, "version"));
  checked = Date.now();
  const v = Number(row?.value ?? 0);
  if (v !== version) {
    version = v;
    bodies.clear();
    parts.clear();
  }
  return version;
}

/** Every item's metadata and tags, every unit, passage and source head, for the current bank version. */
export async function bankMetas(): Promise<BankMetas> {
  const v = await bankVersion();
  if (!metas || metasVersion !== v) {
    metasVersion = v;
    metas = loadMetas(bankDb(), v).catch((e) => {
      metas = null;
      throw e;
    });
  }
  return metas;
}

/** Item rows with bodies, by ref (cached per version). Unknown refs are left out. */
export async function bankItems(refs: Iterable<string>): Promise<Map<string, ItemBody & { body: Question }>> {
  await bankVersion();
  const want = [...new Set(refs)];
  const missing = want.filter((r) => !bodies.has(r));
  for (let i = 0; i < missing.length; i += 500) {
    const rows = await bankDb()
      .select({ ref: bank.items.ref, sourceId: bank.items.sourceId, position: bank.items.position, status: bank.items.status, body: bank.items.body })
      .from(bank.items)
      .where(inArray(bank.items.ref, missing.slice(i, i + 500)));
    for (const r of rows) bodies.set(r.ref, r);
  }
  return new Map(want.flatMap((r) => (bodies.has(r) ? [[r, bodies.get(r)! as ItemBody & { body: Question }]] : [])));
}

/** Passage and figure rows with bodies, by ref (cached per version). */
export async function bankParts(passageRefs: Iterable<string>, figureRefs: Iterable<string>) {
  await bankVersion();
  const load = async (table: typeof bank.passages | typeof bank.figures, refs: string[]) => {
    const missing = [...new Set(refs)].filter((r) => !parts.has(`${table === bank.passages ? "p" : "f"}|${r}`));
    if (missing.length) {
      const rows = await bankDb().select({ ref: table.ref, sourceId: table.sourceId, position: table.position, status: table.status, body: table.body }).from(table).where(inArray(table.ref, missing));
      for (const r of rows) parts.set(`${table === bank.passages ? "p" : "f"}|${r.ref}`, r);
    }
    return new Map([...new Set(refs)].flatMap((r) => {
      const row = parts.get(`${table === bank.passages ? "p" : "f"}|${r}`);
      return row ? [[r, row]] : [];
    }));
  };
  const [passages, figures] = await Promise.all([load(bank.passages, [...passageRefs]), load(bank.figures, [...figureRefs])]);
  return { passages: passages as Map<string, PartBody & { body: Passage }>, figures: figures as Map<string, PartBody & { body: Figure }> };
}

/** A source's head (title, measure, sections), or null when no such source was synced. */
export async function sourceHead(id: string): Promise<SourceHead | null> {
  return (await bankMetas()).sources.get(id) ?? null;
}

/** The questions behind a set of refs, each carrying its ref (bodies as in their files). */
export async function bankQuestions(refs: Iterable<string>): Promise<Map<string, Question>> {
  const rows = await bankItems(refs);
  return new Map([...rows].map(([ref, r]) => [ref, { ...r.body, ref }]));
}
