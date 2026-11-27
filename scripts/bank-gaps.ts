// What the question bank is short of, for one user (docs/BANK.md, Stock target): unseen, unheld stock against the
// next two mocks, a drill buffer, unit shapes, open shortfalls and revisit siblings. Marks shortfalls the stock now
// covers as resolved. Prints the ranked gaps and the batch to write next.
// usage: npm run -s bank:gaps [-- quant|verbal] [--json] [--user <email>]
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { and, eq, inArray, isNull } from "drizzle-orm";
import { schema } from "../lib/db";
import { buildCtx } from "../lib/assemble/context";
import { contextRows } from "../lib/assemble/rows";
import { oneTarget } from "./lib/accounts";
import { bankNow, inFlightBriefs } from "./lib/brief-parts";
import { afterPending, bankGaps, covered, DEFICIT_THRESHOLD, dryRuns, recommendBatch, type Gap } from "./lib/bank-gaps";

export async function gapsFor(measure: "verbal" | "quant") {
  const { db, account } = await oneTarget();
  const metas = await bankNow();
  const ctx = buildCtx(await contextRows(db, metas, measure, 1));
  const shortfalls = await db.select().from(schema.shortfalls).where(and(eq(schema.shortfalls.measure, measure), isNull(schema.shortfalls.resolvedAt)));
  const stock = ctx.items.filter((c) => c.status === "active" && !ctx.seen.has(c.ref) && !ctx.held.has(c.ref));
  const done = shortfalls.filter((f) => covered(ctx, stock, f)).map((f) => f.id);
  if (done.length) await db.update(schema.shortfalls).set({ resolvedAt: new Date() }).where(inArray(schema.shortfalls.id, done));
  const revisited = new Set(metas.items.flatMap((i) => (i.revisits && i.status !== "gone" ? [i.revisits] : [])));
  // briefs still being authored count as written, so a sibling brief takes the next gaps
  const runs = dryRuns(ctx);
  const gaps = afterPending(bankGaps(ctx, shortfalls.filter((f) => !done.includes(f.id)), revisited, runs), inFlightBriefs(metas, measure));
  // how many sampled plans of the next mocks the bank fills exactly: the stock target is all of them
  const coverage = { clean: runs.filter((r) => !r.length).length, runs: runs.length };
  return { account, db, metas, ctx, gaps, resolved: done.length, stock: stock.length, coverage, batch: recommendBatch(measure, gaps) };
}

const label = (g: Gap) => `${g.kind} ${g.id}${g.level ? ` L${g.level}` : ""}: have ${g.have}, need ${g.need} (${g.why})`;

async function main() {
  const args = process.argv.slice(2);
  const measures = (["quant", "verbal"] as const).filter((m) => !args.some((a) => a === "quant" || a === "verbal") || args.includes(m));
  const out: Record<string, unknown> = {};
  for (const m of measures) {
    const r = await gapsFor(m);
    out[m] = { stock: r.stock, coverage: r.coverage, gaps: r.gaps, batch: r.batch };
    if (args.includes("--json")) continue;
    console.log(`${m} (${r.account.email}): ${r.stock} unseen items in stock; ${r.gaps.length} gaps${r.resolved ? `; ${r.resolved} shortfall(s) now covered` : ""}`);
    console.log(`  dry runs: ${r.coverage.clean} of ${r.coverage.runs} sampled plans fill the next 2 mocks with no fallback`);
    for (const g of r.gaps.slice(0, 25)) console.log(`  ${label(g)}`);
    if (r.gaps.length > 25) console.log(`  … ${r.gaps.length - 25} more`);
    // write until every sampled plan fills exactly, and while the other gaps add up to a batch
    const go = r.batch.deficit >= DEFICIT_THRESHOLD || r.coverage.clean < r.coverage.runs;
    console.log(`  recommended: ${go ? `a ${r.batch.kind} batch (weighted deficit ${r.batch.deficit.toFixed(1)}): npm run -s bank:brief -- ${m}${r.batch.kind === "rc" ? " --kind rc" : ""}` : `nothing (weighted deficit ${r.batch.deficit.toFixed(1)} < ${DEFICIT_THRESHOLD})`}`);
  }
  if (args.includes("--json")) console.log(JSON.stringify(out, null, 1));
}
if (process.argv[1]?.endsWith("bank-gaps.ts")) main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
