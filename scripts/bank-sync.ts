// Write validated source files into the shared question bank (gre_bank, docs/BANK.md). `npm run register` is an alias.
// usage: npm run -s bank:sync -- <id> [<id> …] | --all
// Refuses an invalid source before touching the database. A bank batch also needs its blind and novelty checks on
// record (npm run -s blind / novelty -- <id> --check); a mock or drill batch without them only warns.
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import fs from "node:fs";
import { bankDb } from "../lib/db";
import { listSources } from "../lib/sources";
import { isBankId } from "../lib/test-path";
import { syncSources } from "./lib/bank-sync";
import { die, readTestFile } from "./lib/test-file";
import { validateTest } from "./validate-test";
import { checkRecord } from "./blind-test";
import { noveltyRecord } from "./novelty-test";

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--user"));
  const usage = "npm run -s bank:sync -- <id> [<id> …] | --all";
  const ids = args.includes("--all") ? listSources().map((s) => s.id) : args.filter((a) => !a.startsWith("-"));
  if (!ids.length) die(`usage: ${usage}`);
  for (const id of ids) {
    const { errors } = validateTest(readTestFile(id, usage), id);
    if (errors.length) die(`not synced: ${id} is invalid (${errors.length} problem(s)):\n${errors.map((e) => "  - " + e).join("\n")}\nnext: npm run -s check -- ${id}`);
    const missing = [!fs.existsSync(checkRecord(id)) && `blind check (npm run -s blind -- ${id} --check)`, !fs.existsSync(noveltyRecord(id)) && `novelty check (npm run -s novelty -- ${id} --check)`].filter(Boolean);
    if (missing.length && isBankId(id)) die(`not synced: ${id} has no ${missing.join(" or ")} on record`);
    if (missing.length && !args.includes("--all")) console.warn(`warn: ${id} has no ${missing.join(" or ")} on record; syncing anyway`);
  }
  const { results, version } = await syncSources(bankDb(), ids, args.includes("--all") ? () => {} : console.log);
  const changed = results.filter((r) => r.changed || r.gone);
  if (args.includes("--all")) console.log(`${results.length} sources, ${results.reduce((t, r) => t + r.items, 0)} items; ${changed.length} source(s) changed`);
  console.log(`bank version ${version}`);
  console.log(`next: ${ids.some(isBankId) ? "commit and push the batch (content/bank, its brief), then npm run -s bank:gaps" : "commit and push"}`);
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
