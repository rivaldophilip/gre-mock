// Apply schema migrations: the accounts registry, the question bank (once `npm run bank:init` has created it), then
// every user database (or one: --user <email>).
// After changing lib/db/schema.ts or lib/db/bank.ts: `npm run db:generate`, then `npm run db:migrate`.
import { config } from "dotenv";
config({ path: ".env.local" });
import { BANK_DB } from "../lib/db";
import { databaseExists, migrateBank, migrateRegistry, migrateUserDb, targets } from "./lib/accounts";

async function main() {
  await migrateRegistry();
  console.log("registry migrated");
  if (await databaseExists(BANK_DB)) {
    await migrateBank();
    console.log(`${BANK_DB} migrated`);
  } else console.log(`${BANK_DB} does not exist yet: npm run bank:init`);
  for (const { account } of await targets().catch(() => [])) {
    await migrateUserDb(account.dbName);
    console.log(`${account.dbName} (${account.email}) migrated`);
  }
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
