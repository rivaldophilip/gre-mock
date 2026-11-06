import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import * as registry from "./registry";

type DB = ReturnType<typeof drizzleNeon<typeof schema>>;
type RegistryDB = ReturnType<typeof drizzleNeon<typeof registry>>;

/** Per-user database names; anything else is refused before it reaches a connection string. */
export const USER_DB_RE = /^gre_u_\d+$/;

export const isLocal = (url: string) => /@(localhost|127\.0\.0\.1)[:/]/.test(url);

/** DATABASE_URL with its database name swapped (same host and role, so no per-user credentials exist). */
export function dbUrl(dbName: string, base = process.env.DATABASE_URL): string {
  if (!base) throw new Error("DATABASE_URL is not set (run `vercel env pull .env.local`)");
  if (!USER_DB_RE.test(dbName)) throw new Error(`bad user database name: ${dbName}`);
  const u = new URL(base);
  u.pathname = `/${dbName}`;
  return u.toString();
}

function connect<S extends Record<string, unknown>>(url: string, s: S) {
  // Local development against a plain Postgres; production uses Neon over HTTP.
  if (isLocal(url)) return drizzlePg(new Pool({ connectionString: url }), { schema: s }) as unknown as ReturnType<typeof drizzleNeon<S>>;
  return drizzleNeon(neon(url), { schema: s });
}

const users = new Map<string, DB>();
let _registry: RegistryDB | null = null;

/** One user's database. */
export function dbFor(dbName: string): DB {
  let d = users.get(dbName);
  if (!d) users.set(dbName, (d = connect(dbUrl(dbName), schema)));
  return d;
}

/** The accounts database (DATABASE_URL as given). */
export function registryDb(): RegistryDB {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set (run `vercel env pull .env.local`)");
  return (_registry ??= connect(url, registry));
}

export type { DB };
export { schema, registry };
