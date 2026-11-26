// Write source files into the question bank (gre_bank, docs/BANK.md): rows upserted by hash, so an unchanged
// source costs only its reads; an item no longer in its file becomes `gone`, never deleted, so every ref resolves.
import fs from "node:fs";
import { eq, getTableColumns, inArray, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { bank, type BankDB } from "../../lib/db";
import { conceptHistory } from "../../lib/setup-history";
import { listSources, readSource } from "../../lib/sources";
import { isBankId } from "../../lib/test-path";
import { bankRows, type BankRows } from "./bank-rows";

/** `set` for an upsert: every non-key column from the incoming row. */
function excluded(table: PgTable, keys: string[]) {
  return Object.fromEntries(
    Object.entries(getTableColumns(table))
      .filter(([k]) => !keys.includes(k))
      .map(([k, c]) => [k, sql.raw(`excluded."${c.name}"`)]),
  );
}

async function chunked<T>(rows: T[], size: number, run: (part: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += size) await run(rows.slice(i, i + size));
}

/** Every quant item's setup group, named by the ref of its earliest item (lib/setup-history.ts, conceptHistory). */
export function setupGroups(): Map<string, string> {
  const out = new Map<string, string>();
  for (const groups of conceptHistory("quant").values())
    for (const g of groups) {
      const rep = `${g.items[0].testId}:${g.items[0].qid}`;
      for (const it of g.items) out.set(`${it.testId}:${it.qid}`, rep);
    }
  return out;
}

export type SyncResult = { id: string; items: number; changed: number; gone: number };

/** Upsert the given sources; returns what changed per source and the bank version after the sync. */
export async function syncSources(db: BankDB, ids: string[], log: (s: string) => void = console.log): Promise<{ results: SyncResult[]; version: number }> {
  const order = new Map(listSources().map((s, i) => [s.id, i]));
  const needGroups = ids.some((id) => !id.startsWith("verbal-") && !id.startsWith("drill-") && !id.startsWith("vbank-"));
  const groups = needGroups ? setupGroups() : new Map<string, string>();
  const results: SyncResult[] = [];
  let changedAny = 0;

  for (const id of ids) {
    const test = readSource(id);
    if (!test) throw new Error(`${id}: no valid source file`);
    const rows: BankRows = bankRows(test, order.get(id) ?? 0, groups);
    const [oldItems, oldPassages, oldFigures, oldUnits, [oldSource]] = await Promise.all([
      db.select({ ref: bank.items.ref, hash: bank.items.hash, status: bank.items.status, setupGroup: bank.items.setupGroup }).from(bank.items).where(eq(bank.items.sourceId, id)),
      db.select({ ref: bank.passages.ref, hash: bank.passages.hash, status: bank.passages.status }).from(bank.passages).where(eq(bank.passages.sourceId, id)),
      db.select({ ref: bank.figures.ref, hash: bank.figures.hash, status: bank.figures.status }).from(bank.figures).where(eq(bank.figures.sourceId, id)),
      db.select().from(bank.units).where(eq(bank.units.sourceId, id)),
      db.select().from(bank.sources).where(eq(bank.sources.id, id)),
    ]);
    const was = new Map(oldItems.map((r) => [r.ref, r]));
    const items = rows.items.filter((r) => {
      const o = was.get(r.ref);
      return !o || o.hash !== r.hash || o.status !== r.status || (o.setupGroup ?? null) !== (r.setupGroup ?? null);
    });
    const changedPart = <R extends { ref: string; hash: string }>(next: R[], old: { ref: string; hash: string }[]) => {
      const h = new Map(old.map((o) => [o.ref, o.hash]));
      return next.filter((r) => h.get(r.ref) !== r.hash);
    };
    const passages = changedPart(rows.passages, oldPassages);
    const figures = changedPart(rows.figures, oldFigures);
    const unitKey = (u: (typeof rows.units)[number]) => JSON.stringify([u.shape, u.n, u.minLevel, u.maxLevel, u.section, u.status]);
    const oldUnit = new Map(oldUnits.map((u) => [u.id, unitKey(u)]));
    const units = rows.units.filter((u) => oldUnit.get(u.id) !== unitKey(u));
    const live = new Set(rows.items.map((r) => r.ref));
    const gone = oldItems.filter((r) => !live.has(r.ref) && r.status !== "gone").map((r) => r.ref);
    const goneParts = (old: { ref: string; status: string }[], next: { ref: string }[]) => {
      const keep = new Set(next.map((r) => r.ref));
      return old.filter((r) => !keep.has(r.ref) && r.status !== "gone").map((r) => r.ref);
    };
    const goneUnits = oldUnits.filter((u) => !rows.units.some((r) => r.id === u.id) && u.status !== "gone").map((u) => u.id);

    if (!oldSource || oldSource.hash !== rows.source.hash)
      await db.insert(bank.sources).values({ ...rows.source, syncedAt: new Date() }).onConflictDoUpdate({ target: bank.sources.id, set: excluded(bank.sources, ["id"]) });
    await chunked(items, 100, (part) =>
      db.insert(bank.items).values(part.map((r) => ({ ...r, updatedAt: new Date() }))).onConflictDoUpdate({ target: bank.items.ref, set: excluded(bank.items, ["ref"]) }),
    );
    await chunked(passages, 100, (part) => db.insert(bank.passages).values(part).onConflictDoUpdate({ target: bank.passages.ref, set: excluded(bank.passages, ["ref"]) }));
    await chunked(figures, 100, (part) => db.insert(bank.figures).values(part).onConflictDoUpdate({ target: bank.figures.ref, set: excluded(bank.figures, ["ref"]) }));
    await chunked(units, 200, (part) => db.insert(bank.units).values(part).onConflictDoUpdate({ target: bank.units.id, set: excluded(bank.units, ["id"]) }));
    // tags of every changed item are rewritten whole (a passage tag change changes each of its questions' tag rows)
    const retag = new Set([...items.map((r) => r.ref), ...rows.items.filter((r) => passages.some((p) => p.ref === r.passageId)).map((r) => r.ref)]);
    if (retag.size) {
      await chunked([...retag], 500, (part) => db.delete(bank.itemTags).where(inArray(bank.itemTags.ref, part)));
      await chunked(rows.tags.filter((t) => retag.has(t.ref)), 1000, (part) => db.insert(bank.itemTags).values(part).onConflictDoNothing());
    }
    if (gone.length) await db.update(bank.items).set({ status: "gone", updatedAt: new Date() }).where(inArray(bank.items.ref, gone));
    const gp = goneParts(oldPassages, rows.passages);
    if (gp.length) await db.update(bank.passages).set({ status: "gone" }).where(inArray(bank.passages.ref, gp));
    const gf = goneParts(oldFigures, rows.figures);
    if (gf.length) await db.update(bank.figures).set({ status: "gone" }).where(inArray(bank.figures.ref, gf));
    if (goneUnits.length) await db.update(bank.units).set({ status: "gone" }).where(inArray(bank.units.id, goneUnits));

    if (isBankId(id)) {
      const file = `content/briefs/${id}.json`;
      const brief = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
      const row = { id, measure: test.measure, kind: brief?.kind ?? (test.measure === "quant" ? "quant" : "tcse"), brief, targets: brief?.targets ?? null, status: "synced", syncedAt: new Date() };
      await db.insert(bank.batches).values(row).onConflictDoUpdate({ target: bank.batches.id, set: excluded(bank.batches, ["id"]) });
    }
    const changed = items.length + passages.length + figures.length + units.length + gone.length + gp.length + gf.length + goneUnits.length + (!oldSource || oldSource.hash !== rows.source.hash ? 1 : 0);
    changedAny += changed;
    results.push({ id, items: rows.items.length, changed: items.length, gone: gone.length });
    log(`${id}: ${rows.items.length} items${items.length ? `, ${items.length} written` : ""}${gone.length ? `, ${gone.length} gone` : ""}${changed ? "" : " (unchanged)"}`);
  }

  // a new quant item can merge setup groups that other sources' items belong to
  if (needGroups) {
    const synced = new Set(ids);
    const rows = await db.select({ ref: bank.items.ref, sourceId: bank.items.sourceId, setupGroup: bank.items.setupGroup }).from(bank.items).where(eq(bank.items.measure, "quant"));
    const moved = rows.filter((r) => !synced.has(r.sourceId) && groups.has(r.ref) && groups.get(r.ref) !== r.setupGroup);
    for (const r of moved) await db.update(bank.items).set({ setupGroup: groups.get(r.ref)! }).where(eq(bank.items.ref, r.ref));
    if (moved.length) log(`setup groups: ${moved.length} item(s) of other sources regrouped`);
    changedAny += moved.length;
  }

  const [v] = await db.select().from(bank.meta).where(eq(bank.meta.key, "version"));
  let version = Number(v?.value ?? 0);
  if (changedAny || !v) {
    version++;
    await db.insert(bank.meta).values({ key: "version", value: String(version) }).onConflictDoUpdate({ target: bank.meta.key, set: { value: String(version) } });
  }
  return { results, version };
}
