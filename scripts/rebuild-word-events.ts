// Re-derive the word events of answered text-completion and SE questions. Before each blank (and each SE pick) was
// judged on its own, a right blank on a wrong question logged only key_partial, and its rejected distractors nothing.
// Events keep the time they were first logged, so their decay is unchanged. Dry run by default; pass --apply to rewrite.
// usage: npm run rebuild:words [-- --apply] [--user <email>]
import { config } from "dotenv";
config({ path: ".env.local" });
import { and, eq, inArray, ne } from "drizzle-orm";
import { schema } from "../lib/db";
import { eventsForResponse } from "../lib/events";
import { loadTestFile } from "./lib/sync";
import { targets } from "./lib/accounts";
import type { Answer, Test } from "../lib/types";

const apply = process.argv.includes("--apply");
const sig = (es: { itemId: string; event: string; weight: number }[]) => es.map((e) => `${e.itemId}:${e.event}:${e.weight}`).sort().join(" ");

async function main() {
  for (const { account, db } of await targets()) {
    const attempts = new Map((await db.select().from(schema.attempts)).map((a) => [a.id, a]));
    const responses = await db.select().from(schema.responses).where(eq(schema.responses.finalized, true));
    const tests = new Map<string, Test | null>();
    const testOf = (id: string) => {
      if (!tests.has(id)) tests.set(id, loadTestFile(id));
      return tests.get(id)!;
    };
    let changed = 0;
    for (const r of responses) {
      const a = attempts.get(r.attemptId);
      const test = a && testOf(a.testId);
      const q = test?.questions.find((x) => `${test.id}:${x.id}` === r.questionId);
      if (!a || !test || !q || (q.type !== "tc" && q.type !== "se")) continue;
      const old = await db
        .select()
        .from(schema.itemEvents)
        .where(and(eq(schema.itemEvents.responseId, r.id), eq(schema.itemEvents.kind, "word"), ne(schema.itemEvents.event, "dont_know")));
      if (!old.length) continue;
      const passageTags = q.passageId ? (test.passages.find((p) => p.id === q.passageId)?.tags ?? []) : [];
      const next = eventsForResponse(q, test.measure, (r.answer ?? undefined) as Answer | undefined, { guessed: r.guessed, timeMs: r.timeMs }, passageTags).filter((e) => e.kind === "word");
      if (sig(old) === sig(next)) continue;
      changed++;
      console.log(`  ${r.questionId} (attempt ${a.id})\n    was ${sig(old)}\n    now ${sig(next)}`);
      if (!apply) continue;
      const createdAt = old.reduce((t, e) => (e.createdAt < t ? e.createdAt : t), old[0].createdAt);
      await db.delete(schema.itemEvents).where(inArray(schema.itemEvents.id, old.map((e) => e.id)));
      if (next.length) {
        await db.insert(schema.itemEvents).values(next.map((e) => ({ kind: e.kind, itemId: e.itemId, event: e.event, weight: e.weight, responseId: r.id, attemptId: a.id, createdAt })));
      }
    }
    console.log(`${account.dbName} (${account.email}): ${changed} responses ${apply ? "rewritten" : "would be rewritten (dry run; pass --apply)"}`);
  }
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
