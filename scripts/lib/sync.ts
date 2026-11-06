// Content sync shared by the seed/register scripts and `user:add`: one user database at a time.
import fs from "node:fs";
import { and, eq, ne, notInArray, sql } from "drizzle-orm";
import { schema, type DB } from "../../lib/db";
import { TestSchema } from "../../lib/types";

/** Upsert data/vocab.json, data/concepts.json and data/rc_skills.json; prune words dropped from the bank (never user_added). */
export async function seedDb(db: DB) {
  const vocab = JSON.parse(fs.readFileSync("data/vocab.json", "utf8")) as (typeof schema.vocab.$inferInsert)[];
  // quant concepts and reading/argument skills share the concepts table (skills use areas "reading" | "argument")
  const concepts = [
    ...JSON.parse(fs.readFileSync("data/concepts.json", "utf8")),
    ...JSON.parse(fs.readFileSync("data/rc_skills.json", "utf8")),
  ] as (typeof schema.concepts.$inferInsert)[];

  for (let i = 0; i < vocab.length; i += 200) {
    await db
      .insert(schema.vocab)
      .values(vocab.slice(i, i + 200))
      .onConflictDoUpdate({
        target: schema.vocab.id,
        // never clobber user_added rows or hand-written definitions with nulls
        set: {
          lemma: sql`excluded.lemma`,
          variants: sql`excluded.variants`,
          pos: sql`coalesce(excluded.pos, vocab.pos)`,
          senses: sql`coalesce(excluded.senses, vocab.senses)`,
          isSecondary: sql`excluded.is_secondary`,
          meaningGroup: sql`excluded.meaning_group`,
          sources: sql`excluded.sources`,
          sourceCount: sql`excluded.source_count`,
          pink: sql`excluded.pink`,
          tier: sql`excluded.tier`,
          yield: sql`excluded.yield`,
        },
      });
  }
  // words dropped from the bank (e.g. noise from the official-items mining) leave the DB too;
  // words the test-taker added by tapping them are never pruned
  const pruned = await db
    .delete(schema.vocab)
    .where(and(ne(schema.vocab.tier, "user_added"), notInArray(schema.vocab.id, vocab.map((v) => v.id))))
    .returning({ id: schema.vocab.id });
  await db
    .insert(schema.concepts)
    .values(concepts)
    .onConflictDoUpdate({
      target: schema.concepts.id,
      set: { name: sql`excluded.name`, area: sql`excluded.area`, etsSection: sql`excluded.ets_section`, yield: sql`excluded.yield` },
    });
  return { words: vocab.length, concepts: concepts.length, pruned: pruned.length };
}

export function testIds(): string[] {
  return fs.readdirSync("content/tests").filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")).sort();
}

/** A test file, or null if it is missing or invalid. */
export function loadTestFile(id: string) {
  const file = `content/tests/${id}.json`;
  if (!fs.existsSync(file)) return null;
  const parsed = TestSchema.safeParse(JSON.parse(fs.readFileSync(file, "utf8")));
  return parsed.success ? parsed.data : null;
}

/** Upsert one test (tests, questions, question_items). */
export async function registerTest(db: DB, id: string) {
  const test = TestSchema.parse(JSON.parse(fs.readFileSync(`content/tests/${id}.json`, "utf8")));
  const briefFile = `content/briefs/${id}.json`;
  const brief = fs.existsSync(briefFile) ? JSON.parse(fs.readFileSync(briefFile, "utf8")) : null;

  await db.insert(schema.tests).values({ id: test.id, measure: test.measure, title: test.title, brief })
    .onConflictDoUpdate({ target: schema.tests.id, set: { title: test.title, brief } });

  const qrows = test.questions.map((q, i) => ({ id: `${test.id}:${q.id}`, testId: test.id, section: q.section, position: i, type: q.type, difficulty: q.difficulty }));
  const prior = await db.select({ id: schema.questions.id }).from(schema.questions).where(eq(schema.questions.testId, test.id));
  for (const p of prior) await db.delete(schema.questionItems).where(eq(schema.questionItems.questionId, p.id));
  await db.delete(schema.questions).where(eq(schema.questions.testId, test.id));
  await db.insert(schema.questions).values(qrows);

  const items = new Map<string, typeof schema.questionItems.$inferInsert>();
  for (const q of test.questions) {
    const passageTags = q.passageId ? (test.passages.find((p) => p.id === q.passageId)?.tags ?? []) : [];
    for (const t of [...q.tags, ...passageTags]) {
      const row = { questionId: `${test.id}:${q.id}`, kind: t.kind, itemId: t.id, role: t.role };
      items.set(`${row.questionId}|${row.kind}|${row.itemId}|${row.role}`, row);
    }
  }
  if (items.size) await db.insert(schema.questionItems).values([...items.values()]);
  return { questions: qrows.length, tags: items.size };
}
