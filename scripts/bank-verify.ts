// Rebuild every source from the question bank and compare it with its JSON file: what the app serves must be what was
// authored. usage: npm run -s bank:verify [-- <id> …]
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { inArray } from "drizzle-orm";
import { bank, bankDb } from "../lib/db";
import { listSources, readSource } from "../lib/sources";
import { sourceTest } from "../lib/virtual-test";
import { stableJson } from "./lib/bank-rows";

/** The first path where two values differ, or null. */
export function firstDiff(a: unknown, b: unknown, at = ""): string | null {
  if (stableJson(a) === stableJson(b)) return null;
  if (a && b && typeof a === "object" && typeof b === "object") {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const d = firstDiff((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${at}.${k}`);
      if (d) return d;
    }
  }
  return at || "(root)";
}

async function main() {
  const want = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const ids = want.length ? want : listSources().map((s) => s.id);
  const db = bankDb();
  const [srcs, items, passages, figures] = await Promise.all([
    db.select().from(bank.sources).where(inArray(bank.sources.id, ids)),
    db.select().from(bank.items).where(inArray(bank.items.sourceId, ids)),
    db.select().from(bank.passages).where(inArray(bank.passages.sourceId, ids)),
    db.select().from(bank.figures).where(inArray(bank.figures.sourceId, ids)),
  ]);
  let bad = 0;
  for (const id of ids) {
    const file = readSource(id);
    const src = srcs.find((s) => s.id === id);
    if (!file || !src) {
      bad++;
      console.log(`${id}: ${!file ? "no valid file" : "not in the bank (npm run -s bank:sync -- " + id + ")"}`);
      continue;
    }
    // the loader adds each question's ref; the file has none
    const built = sourceTest(src, items, passages, figures);
    built.questions = built.questions.map(({ ref: _r, ...q }) => q);
    const d = firstDiff(built, file);
    if (d) {
      bad++;
      console.log(`${id}: differs at ${d}`);
    }
  }
  console.log(`${ids.length - bad}/${ids.length} sources identical`);
  if (bad) process.exit(1);
}
if (process.argv[1]?.endsWith("bank-verify.ts")) main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
