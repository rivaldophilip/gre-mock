// Drop the "slow" events that the passage-reading allowance now excuses. The first question opened on a shared
// passage carried the passage's first read in its time, so it logged concept_slow / key_slow on reading alone.
// The allowance only raises the limit, so this removes events and never adds any. Dry run by default; pass --apply.
// usage: npm run rebuild:slow [-- --apply] [--user <email>]
import { config } from "dotenv";
config({ path: ".env.local" });
import { and, eq, inArray } from "drizzle-orm";
import { schema } from "../lib/db";
import { readingAllowanceMs } from "../lib/events";
import { SLOW_MS } from "../lib/priority/config";
import { loadTestFile } from "./lib/sync";
import { targets } from "./lib/accounts";
import type { Test } from "../lib/types";

const apply = process.argv.includes("--apply");

async function main() {
  for (const { account, db } of await targets()) {
    const attempts = new Map((await db.select().from(schema.attempts)).map((a) => [a.id, a]));
    const responses = await db.select().from(schema.responses);
    const tests = new Map<string, Test | null>();
    const testOf = (id: string) => {
      if (!tests.has(id)) tests.set(id, loadTestFile(id));
      return tests.get(id)!;
    };
    // lowest response id per (attempt, passage): the question opened first on it
    const firstId = new Map<string, number>();
    for (const r of responses) {
      const test = testOf(attempts.get(r.attemptId)?.testId ?? "");
      const q = test?.questions.find((x) => `${test.id}:${x.id}` === r.questionId);
      if (!q?.passageId) continue;
      const k = `${r.attemptId}:${q.passageId}`;
      if (!firstId.has(k) || r.id < firstId.get(k)!) firstId.set(k, r.id);
    }
    const drop: number[] = [];
    for (const r of responses) {
      if (!r.finalized) continue;
      const test = testOf(attempts.get(r.attemptId)?.testId ?? "");
      const q = test?.questions.find((x) => `${test.id}:${x.id}` === r.questionId);
      if (!test || !q?.passageId) continue;
      const readingMs = readingAllowanceMs(test, q, firstId.get(`${r.attemptId}:${q.passageId}`) === r.id);
      if (!readingMs || r.timeMs > SLOW_MS[test.measure] + readingMs) continue;
      const slow = await db
        .select({ id: schema.itemEvents.id, itemId: schema.itemEvents.itemId, event: schema.itemEvents.event })
        .from(schema.itemEvents)
        .where(and(eq(schema.itemEvents.responseId, r.id), inArray(schema.itemEvents.event, ["concept_slow", "key_slow"])));
      if (!slow.length) continue;
      console.log(`  ${r.questionId} (attempt ${r.attemptId}): ${Math.round(r.timeMs / 1000)}s, limit ${Math.round((SLOW_MS[test.measure] + readingMs) / 1000)}s; drop ${slow.map((e) => `${e.itemId}:${e.event}`).join(" ")}`);
      drop.push(...slow.map((e) => e.id));
    }
    if (apply && drop.length) await db.delete(schema.itemEvents).where(inArray(schema.itemEvents.id, drop));
    console.log(`${account.dbName} (${account.email}): ${drop.length} slow events ${apply ? "removed" : "would be removed (dry run; pass --apply)"}`);
  }
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
