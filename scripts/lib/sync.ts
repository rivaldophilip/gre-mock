// Seed data shared by `npm run seed` and `user:add`: one user database at a time. Questions live in the shared bank
// (gre_bank), written by `npm run bank:sync` (scripts/lib/bank-sync.ts).
import fs from "node:fs";
import { and, ne, notInArray, sql } from "drizzle-orm";
import { schema, type DB } from "../../lib/db";

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
          exposureOnly: sql`excluded.exposure_only`,
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
