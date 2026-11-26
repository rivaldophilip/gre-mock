// Create the shared question bank database (gre_bank, docs/BANK.md) if it is missing, and apply its migrations.
// usage: npm run bank:init   (then npm run bank:sync -- --all)
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { BANK_DB } from "../lib/db";
import { createDatabase, databaseExists, migrateBank } from "./lib/accounts";

async function main() {
  if (await databaseExists(BANK_DB)) console.log(`${BANK_DB} exists`);
  else {
    await createDatabase(BANK_DB);
    console.log(`created ${BANK_DB}`);
  }
  await migrateBank();
  console.log(`${BANK_DB} migrated\nnext: npm run bank:sync -- --all`);
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
