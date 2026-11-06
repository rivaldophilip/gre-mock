// Apply schema migrations: the accounts registry, then every user database (or one: --user <email>).
// After changing lib/db/schema.ts: `npm run db:generate`, then `npm run db:migrate`.
import { config } from "dotenv";
config({ path: ".env.local" });
import { migrateRegistry, migrateUserDb, targets } from "./lib/accounts";

async function main() {
  await migrateRegistry();
  console.log("registry migrated");
  for (const { account } of await targets().catch(() => [])) {
    await migrateUserDb(account.dbName);
    console.log(`${account.dbName} (${account.email}) migrated`);
  }
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
