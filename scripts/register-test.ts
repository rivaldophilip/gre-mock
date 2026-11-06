// Upsert a validated test (tests, questions, question_items) into the DB.  usage: npm run register -- verbal-001
import { config } from "dotenv";
config({ path: ".env.local" });
import fs from "node:fs";
import { eq } from "drizzle-orm";
import { db, schema } from "../lib/db";
import { TestSchema } from "../lib/types";

async function main() {
  const id = process.argv[2];
  if (!id) throw new Error("usage: npm run register -- <test-id>");
  const test = TestSchema.parse(JSON.parse(fs.readFileSync(`content/tests/${id}.json`, "utf8")));
  const briefFile = `content/briefs/${id}.json`;
  const brief = fs.existsSync(briefFile) ? JSON.parse(fs.readFileSync(briefFile, "utf8")) : null;

  await db().insert(schema.tests).values({ id: test.id, measure: test.measure, title: test.title, brief })
    .onConflictDoUpdate({ target: schema.tests.id, set: { title: test.title, brief } });

  const qrows = test.questions.map((q, i) => ({ id: `${test.id}:${q.id}`, testId: test.id, section: q.section, position: i, type: q.type, difficulty: q.difficulty }));
  const prior = await db().select({ id: schema.questions.id }).from(schema.questions).where(eq(schema.questions.testId, test.id));
  for (const p of prior) await db().delete(schema.questionItems).where(eq(schema.questionItems.questionId, p.id));
  await db().delete(schema.questions).where(eq(schema.questions.testId, test.id));
  await db().insert(schema.questions).values(qrows);

  const items = new Map<string, typeof schema.questionItems.$inferInsert>();
  for (const q of test.questions) {
    const passageTags = q.passageId ? (test.passages.find((p) => p.id === q.passageId)?.tags ?? []) : [];
    for (const t of [...q.tags, ...passageTags]) {
      const row = { questionId: `${test.id}:${q.id}`, kind: t.kind, itemId: t.id, role: t.role };
      items.set(`${row.questionId}|${row.kind}|${row.itemId}|${row.role}`, row);
    }
  }
  if (items.size) await db().insert(schema.questionItems).values([...items.values()]);
  console.log(`registered ${test.id}: ${qrows.length} questions, ${items.size} item tags`);
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
