// Set every stored event weight to the current one in lib/priority/config.ts. Scoring reads the weight saved on each
// row, so a changed weight reaches events already logged only through this. The concept_wrong_* events of a response
// marked "silly mistake" get the weight times SILLY_FACTOR. Dry run by default; pass --apply.
// usage: npm run reweight [-- --apply] [--user <email>]
import { config } from "dotenv";
config({ path: ".env.local" });
import { and, eq, inArray, isNull, ne, notInArray, or, type SQL } from "drizzle-orm";
import { schema } from "../lib/db";
import { CONCEPT_W, SILLY_FACTOR, WORD_W } from "../lib/priority/config";
import { targets } from "./lib/accounts";

const apply = process.argv.includes("--apply");

type Target = [kind: "word" | "concept", event: string, weight: number, label: string, scope?: SQL];

async function main() {
  for (const { account, db } of await targets()) {
    const sillyIds = db.select({ id: schema.responses.id }).from(schema.responses).where(eq(schema.responses.silly, true));
    const notSilly = or(isNull(schema.itemEvents.responseId), notInArray(schema.itemEvents.responseId, sillyIds));
    const current: Target[] = [
      ...Object.entries(WORD_W).map(([ev, w]): Target => ["word", ev, w, ev]),
      ...Object.entries(CONCEPT_W).flatMap(([ev, w]): Target[] =>
        ev.startsWith("wrong_")
          ? [
              ["concept", `concept_${ev}`, w, `concept_${ev}`, notSilly],
              ["concept", `concept_${ev}`, w * SILLY_FACTOR, `concept_${ev} (silly)`, inArray(schema.itemEvents.responseId, sillyIds)],
            ]
          : [["concept", `concept_${ev}`, w, `concept_${ev}`]],
      ),
    ];
    let total = 0;
    for (const [kind, event, weight, label, scope] of current) {
      const stale = and(eq(schema.itemEvents.kind, kind), eq(schema.itemEvents.event, event), ne(schema.itemEvents.weight, weight), scope);
      const rows = await db.select({ id: schema.itemEvents.id }).from(schema.itemEvents).where(stale);
      if (!rows.length) continue;
      console.log(`  ${label}: ${rows.length} -> ${weight}`);
      if (apply) await db.update(schema.itemEvents).set({ weight }).where(stale);
      total += rows.length;
    }
    console.log(`${account.dbName} (${account.email}): ${total} events ${apply ? "reweighted" : "would be reweighted (dry run; pass --apply)"}`);
  }
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
