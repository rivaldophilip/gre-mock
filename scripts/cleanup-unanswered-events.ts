// Delete item events logged for questions that were left blank. Before blanks were ignored, a section that ended
// with unanswered questions logged key_missed / concept_wrong for each of them, inflating weak words and concepts.
// Dry run by default; pass --apply to delete.
// usage: npm run cleanup:unanswered [-- --apply] [--user <email>]
import { config } from "dotenv";
config({ path: ".env.local" });
import { inArray } from "drizzle-orm";
import { schema } from "../lib/db";
import { isAnswered } from "../lib/scoring";
import { loadTestFile } from "./lib/sync";
import { targets } from "./lib/accounts";
import type { Answer, Test } from "../lib/types";

const apply = process.argv.includes("--apply");

async function main() {
  for (const { account, db } of await targets()) {
    const attempts = await db.select().from(schema.attempts);
    const responses = await db.select().from(schema.responses);
    const tests = new Map<string, Test | null>();
    const testOf = (id: string) => {
      if (!tests.has(id)) tests.set(id, loadTestFile(id));
      return tests.get(id)!;
    };
    const attemptOf = new Map(attempts.map((a) => [a.id, a]));
    const blank: number[] = [];
    for (const r of responses) {
      const a = attemptOf.get(r.attemptId);
      const test = a && testOf(a.testId);
      const q = test?.questions.find((x) => `${test.id}:${x.id}` === r.questionId);
      if (q && !isAnswered(q, (r.answer ?? undefined) as Answer | undefined)) blank.push(r.id);
    }
    let n = 0;
    for (let i = 0; i < blank.length; i += 200) {
      const ids = blank.slice(i, i + 200);
      if (apply) n += (await db.delete(schema.itemEvents).where(inArray(schema.itemEvents.responseId, ids)).returning({ id: schema.itemEvents.id })).length;
      else n += (await db.select({ id: schema.itemEvents.id }).from(schema.itemEvents).where(inArray(schema.itemEvents.responseId, ids))).length;
    }
    console.log(`${account.dbName} (${account.email}): ${blank.length} blank responses, ${n} events ${apply ? "deleted" : "would be deleted (dry run; pass --apply)"}`);
  }
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
