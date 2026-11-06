// Upsert data/vocab.json and data/concepts.json into the database.  usage: npm run seed
import { config } from "dotenv";
config({ path: ".env.local" });
import fs from "node:fs";
import { and, ne, notInArray, sql } from "drizzle-orm";
import { db, schema } from "../lib/db";

async function main() {
  const vocab = JSON.parse(fs.readFileSync("data/vocab.json", "utf8")) as (typeof schema.vocab.$inferInsert)[];
  const concepts = JSON.parse(fs.readFileSync("data/concepts.json", "utf8")) as (typeof schema.concepts.$inferInsert)[];

  for (let i = 0; i < vocab.length; i += 200) {
    await db()
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
  const pruned = await db()
    .delete(schema.vocab)
    .where(and(ne(schema.vocab.tier, "user_added"), notInArray(schema.vocab.id, vocab.map((v) => v.id))))
    .returning({ id: schema.vocab.id });
  if (pruned.length) console.log(`pruned ${pruned.length} words no longer in the bank`);
  await db()
    .insert(schema.concepts)
    .values(concepts)
    .onConflictDoUpdate({
      target: schema.concepts.id,
      set: { name: sql`excluded.name`, area: sql`excluded.area`, etsSection: sql`excluded.ets_section`, yield: sql`excluded.yield` },
    });
  console.log(`seeded ${vocab.length} words, ${concepts.length} concepts`);
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
