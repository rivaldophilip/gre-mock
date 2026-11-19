// Set every stored event weight to the current one in lib/priority/config.ts. Scoring reads the weight saved on each
// row, so a changed weight reaches events already logged only through this. Dry run by default; pass --apply.
// usage: npm run reweight [-- --apply] [--user <email>]
import { config } from "dotenv";
config({ path: ".env.local" });
import { and, eq, ne } from "drizzle-orm";
import { schema } from "../lib/db";
import { CONCEPT_W, WORD_W } from "../lib/priority/config";
import { targets } from "./lib/accounts";

const apply = process.argv.includes("--apply");

const current: [kind: "word" | "concept", event: string, weight: number][] = [
  ...Object.entries(WORD_W).map(([ev, w]): ["word", string, number] => ["word", ev, w]),
  ...Object.entries(CONCEPT_W).map(([ev, w]): ["concept", string, number] => ["concept", `concept_${ev}`, w]),
];

async function main() {
  for (const { account, db } of await targets()) {
    let total = 0;
    for (const [kind, event, weight] of current) {
      const stale = and(eq(schema.itemEvents.kind, kind), eq(schema.itemEvents.event, event), ne(schema.itemEvents.weight, weight));
      const rows = await db.select({ id: schema.itemEvents.id }).from(schema.itemEvents).where(stale);
      if (!rows.length) continue;
      console.log(`  ${event}: ${rows.length} -> ${weight}`);
      if (apply) await db.update(schema.itemEvents).set({ weight }).where(stale);
      total += rows.length;
    }
    console.log(`${account.dbName} (${account.email}): ${total} events ${apply ? "reweighted" : "would be reweighted (dry run; pass --apply)"}`);
  }
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
