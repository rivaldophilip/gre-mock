// Account and per-user-database helpers for the CLI scripts (never imported by the app).
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { Client } from "pg";
import { asc, eq } from "drizzle-orm";
import { migrate as migrateNeon } from "drizzle-orm/neon-http/migrator";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { dbFor, dbUrl, isLocal, registry, registryDb, USER_DB_RE, type DB } from "../../lib/db";

export type Account = typeof registry.users.$inferSelect;

/** `--user <email>` from argv, if given. */
export function userArg(argv = process.argv): string | undefined {
  const i = argv.indexOf("--user");
  return i > 0 ? argv[i + 1]?.trim().toLowerCase() : undefined;
}

export async function listAccounts(): Promise<Account[]> {
  return registryDb().select().from(registry.users).orderBy(asc(registry.users.id));
}

export async function findAccount(email: string): Promise<Account | undefined> {
  const [u] = await registryDb().select().from(registry.users).where(eq(registry.users.email, email.trim().toLowerCase()));
  return u;
}

/** The databases a script should touch: one user with --user, otherwise every user. */
export async function targets(argv = process.argv): Promise<{ account: Account; db: DB }[]> {
  const email = userArg(argv);
  const accounts = email ? [await findAccount(email)].filter((a): a is Account => !!a) : await listAccounts();
  if (email && !accounts.length) throw new Error(`no account ${email}`);
  if (!accounts.length) throw new Error("no accounts yet: npm run user:add -- <email>");
  return accounts.map((account) => ({ account, db: dbFor(account.dbName) }));
}

/** Exactly one user: --user, or the only account. Briefs target a single user's stats. */
export async function oneTarget(argv = process.argv) {
  const all = await targets(argv);
  if (all.length > 1) throw new Error(`${all.length} accounts exist; pick one with --user <email>`);
  return all[0];
}

/** Run one statement on the registry connection (CREATE/DROP DATABASE cannot run inside a transaction). */
async function adminExec(statement: string) {
  const url = process.env.DATABASE_URL!;
  if (isLocal(url)) {
    const c = new Client({ connectionString: url });
    await c.connect();
    try {
      await c.query(statement);
    } finally {
      await c.end();
    }
  } else {
    await neon(url).query(statement);
  }
}

export async function createDatabase(name: string) {
  if (!USER_DB_RE.test(name)) throw new Error(`bad database name ${name}`);
  await adminExec(`CREATE DATABASE "${name}"`);
}

export async function dropDatabase(name: string) {
  if (!USER_DB_RE.test(name)) throw new Error(`bad database name ${name}`);
  await adminExec(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
}

/** Apply drizzle/ migrations to one user database. */
export async function migrateUserDb(name: string) {
  const migrationsFolder = path.resolve("drizzle");
  if (isLocal(process.env.DATABASE_URL!)) {
    const c = new Client({ connectionString: dbUrl(name) });
    await c.connect();
    try {
      const { drizzle } = await import("drizzle-orm/node-postgres");
      await migratePg(drizzle(c), { migrationsFolder });
    } finally {
      await c.end();
    }
  } else {
    await migrateNeon(dbFor(name), { migrationsFolder });
  }
}

/** Apply drizzle-registry/ migrations to the accounts database. */
export async function migrateRegistry() {
  const migrationsFolder = path.resolve("drizzle-registry");
  if (isLocal(process.env.DATABASE_URL!)) {
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    try {
      const { drizzle } = await import("drizzle-orm/node-postgres");
      await migratePg(drizzle(c), { migrationsFolder });
    } finally {
      await c.end();
    }
  } else {
    await migrateNeon(registryDb(), { migrationsFolder });
  }
}
