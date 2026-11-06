// Upsert a validated test (tests, questions, question_items) into every user database (or one: --user <email>).
// usage: npm run register -- verbal-001 [--user <email>]
import { config } from "dotenv";
config({ path: ".env.local" });
import { targets } from "./lib/accounts";
import { registerTest } from "./lib/sync";

async function main() {
  const id = process.argv[2];
  if (!id || id.startsWith("--")) throw new Error("usage: npm run register -- <test-id> [--user <email>]");
  for (const { account, db } of await targets()) {
    const r = await registerTest(db, id);
    console.log(`${account.dbName} (${account.email}): registered ${id}: ${r.questions} questions, ${r.tags} item tags`);
  }
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
