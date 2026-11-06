// Emit concept/skill events for finalized responses that predate their question's concept tags
// (e.g. after adding reading-skill tags to an existing test). Idempotent: a response that already has
// concept events is skipped. Events are dated when the response was given, so decay stays honest.
// usage: npm run backfill:concepts [-- --user <email>]
import { config } from "dotenv";
config({ path: ".env.local" });
import { and, eq, inArray } from "drizzle-orm";
import { schema } from "../lib/db";
import { eventsForResponse } from "../lib/events";
import { loadTestFile } from "./lib/sync";
import { targets } from "./lib/accounts";
import type { Answer, Test } from "../lib/types";

async function main() {
  for (const { account, db } of await targets()) {
    const attempts = await db.select().from(schema.attempts);
    const responses = await db.select().from(schema.responses).where(eq(schema.responses.finalized, true));
    const ids = responses.map((r) => r.id);
    const done = new Set(
      ids.length
        ? (
            await db
              .select({ responseId: schema.itemEvents.responseId })
              .from(schema.itemEvents)
              .where(and(eq(schema.itemEvents.kind, "concept"), inArray(schema.itemEvents.responseId, ids)))
          ).map((e) => e.responseId)
        : [],
    );
    const tests = new Map<string, Test | null>();
    const testOf = (id: string) => {
      if (!tests.has(id)) tests.set(id, loadTestFile(id));
      return tests.get(id)!;
    };
    const attemptOf = new Map(attempts.map((a) => [a.id, a]));
    const rows: (typeof schema.itemEvents.$inferInsert)[] = [];
    let touched = 0;
    for (const r of responses) {
      if (done.has(r.id)) continue;
      const a = attemptOf.get(r.attemptId);
      const test = a && testOf(a.testId);
      const q = test?.questions.find((x) => `${test.id}:${x.id}` === r.questionId);
      if (!test || !q || !q.tags.some((t) => t.kind === "concept")) continue;
      const evs = eventsForResponse(q, test.measure, (r.answer ?? undefined) as Answer | undefined, { guessed: r.guessed, timeMs: r.timeMs }).filter(
        (e) => e.kind === "concept",
      );
      for (const e of evs) rows.push({ ...e, responseId: r.id, attemptId: r.attemptId, createdAt: r.updatedAt });
      if (evs.length) touched++;
    }
    for (let i = 0; i < rows.length; i += 200) await db.insert(schema.itemEvents).values(rows.slice(i, i + 200));
    console.log(`${account.dbName} (${account.email}): ${rows.length} concept events for ${touched} responses`);
  }
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
