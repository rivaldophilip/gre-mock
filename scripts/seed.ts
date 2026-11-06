// Upsert data/vocab.json and data/concepts.json into every user database (or one: --user <email>).
// usage: npm run seed [-- --user <email>]
import { config } from "dotenv";
config({ path: ".env.local" });
import { targets } from "./lib/accounts";
import { seedDb } from "./lib/sync";

async function main() {
  for (const { account, db } of await targets()) {
    const s = await seedDb(db);
    console.log(`${account.dbName} (${account.email}): seeded ${s.words} words, ${s.concepts} concepts${s.pruned ? `, pruned ${s.pruned}` : ""}`);
  }
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
