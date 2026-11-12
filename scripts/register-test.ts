// Upsert a validated test (tests, questions, question_items) into every user database (or one: --user <email>).
// usage: npm run -s register -- verbal-001 [--user <email>]
// Refuses an invalid test before touching any database; warns when the test has never been blind- or novelty-checked.
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import fs from "node:fs";
import { targets } from "./lib/accounts";
import { registerTest } from "./lib/sync";
import { die, readTestFile } from "./lib/test-file";
import { validateTest } from "./validate-test";
import { checkRecord } from "./blind-test";
import { noveltyRecord } from "./novelty-test";

async function main() {
  const id = process.argv[2];
  const { errors } = validateTest(readTestFile(id, "npm run -s register -- <test-id> [--user <email>]"), id);
  if (errors.length) die(`not registered: ${id} is invalid (${errors.length} problem(s)):\n${errors.map((e) => "  - " + e).join("\n")}\nnext: npm run -s check -- ${id}`);
  if (!fs.existsSync(checkRecord(id))) console.warn(`warn: ${id} has no blind check on record (npm run -s blind -- ${id} --check); registering anyway`);
  if (!fs.existsSync(noveltyRecord(id))) console.warn(`warn: ${id} has no novelty check on record (npm run -s novelty -- ${id} --check); registering anyway`);
  for (const { account, db } of await targets()) {
    const r = await registerTest(db, id);
    console.log(`${account.dbName} (${account.email}): registered ${id}: ${r.questions} questions, ${r.tags} item tags`);
  }
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
