// Bank metadata (every item's fields and tags, units, passages, sources; no bodies) as one load. Shared by the app
// (lib/bank.ts, which memoises it per version) and the scripts (bank:gaps, bank:brief, brief).
import { bank, type BankDB } from "./db";
import type { Tag } from "./types";

export type ItemMeta = Omit<typeof bank.items.$inferSelect, "body" | "hash" | "updatedAt"> & { tags: Pick<Tag, "kind" | "id" | "role">[] };
export type UnitMeta = typeof bank.units.$inferSelect;
export type PassageMeta = Omit<typeof bank.passages.$inferSelect, "body" | "hash">;
export type SourceMeta = Omit<typeof bank.sources.$inferSelect, "hash" | "syncedAt">;

export type BankMetas = {
  version: number;
  items: ItemMeta[];
  byRef: Map<string, ItemMeta>;
  bySource: Map<string, ItemMeta[]>;
  units: UnitMeta[];
  unitById: Map<string, UnitMeta>;
  passages: Map<string, PassageMeta>;
  sources: Map<string, SourceMeta>;
};

/** Load the whole bank's metadata at version `v`. */
export async function loadMetas(db: BankDB, v: number): Promise<BankMetas> {
  const [items, tags, units, passages, sources] = await Promise.all([
    db
      .select({
        ref: bank.items.ref, sourceId: bank.items.sourceId, qid: bank.items.qid, measure: bank.items.measure, type: bank.items.type, slotType: bank.items.slotType,
        section: bank.items.section, position: bank.items.position, difficulty: bank.items.difficulty, solverRating: bank.items.solverRating, primary: bank.items.primary,
        variant: bank.items.variant, setup: bank.items.setup, setupGroup: bank.items.setupGroup, keyWords: bank.items.keyWords, revisits: bank.items.revisits,
        unitId: bank.items.unitId, passageId: bank.items.passageId, figureId: bank.items.figureId, status: bank.items.status,
      })
      .from(bank.items),
    db.select().from(bank.itemTags),
    db.select().from(bank.units),
    db.select({ ref: bank.passages.ref, sourceId: bank.passages.sourceId, pid: bank.passages.pid, position: bank.passages.position, kind: bank.passages.kind, paragraphs: bank.passages.paragraphs, domain: bank.passages.domain, status: bank.passages.status }).from(bank.passages),
    db.select({ id: bank.sources.id, kind: bank.sources.kind, measure: bank.sources.measure, title: bank.sources.title, sections: bank.sources.sections, position: bank.sources.position }).from(bank.sources),
  ]);
  const tagsOf = new Map<string, ItemMeta["tags"]>();
  for (const t of tags) (tagsOf.get(t.ref) ?? tagsOf.set(t.ref, []).get(t.ref)!).push({ kind: t.kind as Tag["kind"], id: t.tagId, role: t.role as Tag["role"] });
  const all: ItemMeta[] = items.map((i) => ({ ...i, tags: tagsOf.get(i.ref) ?? [] }));
  const bySource = new Map<string, ItemMeta[]>();
  for (const i of all) (bySource.get(i.sourceId) ?? bySource.set(i.sourceId, []).get(i.sourceId)!).push(i);
  for (const list of bySource.values()) list.sort((a, b) => a.position - b.position);
  return {
    version: v,
    items: all,
    byRef: new Map(all.map((i) => [i.ref, i])),
    bySource,
    units,
    unitById: new Map(units.map((u) => [u.id, u])),
    passages: new Map(passages.map((p) => [p.ref, p])),
    sources: new Map(sources.map((s) => [s.id, s])),
  };
}

