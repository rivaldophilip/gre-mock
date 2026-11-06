// Accounts CLI. The app has no sign-up path: this is the only way to create a user.
//   npm run user:add -- <email>       create the account + its own database (gre_u_<id>), migrate, seed, register tests
//   npm run user:passwd -- <email>    change the password
//   npm run user:list
//   npm run user:remove -- <email>    delete the account AND drop its database (asks to confirm)
// Passwords are read from a hidden prompt (or from stdin when piped), never from argv.
import { config } from "dotenv";
config({ path: ".env.local" });
import readline from "node:readline";
import { eq, sql } from "drizzle-orm";
import { dbFor, registry, registryDb } from "../lib/db";
import { hashPassword } from "../lib/password";
import { createDatabase, dropDatabase, findAccount, listAccounts, migrateRegistry, migrateUserDb } from "./lib/accounts";
import { registerTest, seedDb, testIds } from "./lib/sync";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let piped: string[] | null = null;
async function ask(question: string, hidden = false): Promise<string> {
  if (!process.stdin.isTTY) {
    // piped input: one answer per line
    if (!piped) {
      let raw = "";
      for await (const chunk of process.stdin) raw += chunk;
      piped = raw.split(/\r?\n/);
    }
    return piped.shift() ?? "";
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) {
    const write = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput.bind(rl);
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s) => write(s.startsWith(question) ? s : "");
  }
  const answer = await new Promise<string>((resolve) => rl.question(question, resolve));
  rl.close();
  if (hidden) process.stdout.write("\n");
  return answer;
}

async function newPassword(): Promise<string> {
  const pw = await ask("Password: ", true);
  if (pw.length < 6) throw new Error("password must be at least 6 characters");
  if (process.stdin.isTTY && (await ask("Repeat password: ", true)) !== pw) throw new Error("passwords do not match");
  return pw;
}

async function add(email: string) {
  if (!EMAIL_RE.test(email)) throw new Error(`not an email: ${email}`);
  await migrateRegistry();
  if (await findAccount(email)) throw new Error(`${email} already exists`);
  const hash = await hashPassword(await newPassword());
  // the id decides the database name, so take it from the sequence up front
  const res = await registryDb().execute(sql`
    insert into users (id, email, password_hash, db_name)
    select n, ${email}, ${hash}, 'gre_u_' || n from (select nextval(pg_get_serial_sequence('users', 'id')) as n) s
    returning db_name`);
  const dbName = (res as unknown as { rows: { db_name: string }[] }).rows[0].db_name;
  try {
    await createDatabase(dbName);
    await migrateUserDb(dbName);
    const db = dbFor(dbName);
    const s = await seedDb(db);
    for (const id of testIds()) await registerTest(db, id);
    console.log(`created ${email} -> ${dbName}: ${s.words} words, ${s.concepts} concepts, tests ${testIds().join(", ")}`);
  } catch (e) {
    // no half-made accounts: undo the database and the registry row
    await dropDatabase(dbName).catch(() => {});
    await registryDb().delete(registry.users).where(eq(registry.users.email, email));
    throw e;
  }
}

async function passwd(email: string) {
  const u = await findAccount(email);
  if (!u) throw new Error(`no account ${email}`);
  const hash = await hashPassword(await newPassword());
  await registryDb().update(registry.users).set({ passwordHash: hash, failedLogins: 0, lockedUntil: null }).where(eq(registry.users.id, u.id));
  console.log(`password changed for ${email}`);
}

async function list() {
  for (const u of await listAccounts()) {
    const locked = u.lockedUntil && u.lockedUntil > new Date() ? " (locked)" : "";
    console.log(`${u.id}\t${u.email}\t${u.dbName}\t${u.createdAt.toISOString().slice(0, 10)}${locked}`);
  }
}

async function remove(email: string) {
  const u = await findAccount(email);
  if (!u) throw new Error(`no account ${email}`);
  const typed = await ask(`This deletes ${email} and drops ${u.dbName} with all its data. Type the email to confirm: `);
  if (typed.trim().toLowerCase() !== u.email) throw new Error("not confirmed");
  await dropDatabase(u.dbName);
  await registryDb().delete(registry.users).where(eq(registry.users.id, u.id));
  console.log(`removed ${email} and dropped ${u.dbName}`);
}

async function main() {
  const [cmd, emailRaw] = process.argv.slice(2);
  const email = emailRaw?.trim().toLowerCase() ?? "";
  if (cmd === "add") return add(email);
  if (cmd === "passwd") return passwd(email);
  if (cmd === "list") return list();
  if (cmd === "remove") return remove(email);
  throw new Error("usage: tsx scripts/users.ts add|passwd|list|remove <email>");
}
main().then(() => process.exit(0), (e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
