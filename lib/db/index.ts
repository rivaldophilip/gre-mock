import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type DB = ReturnType<typeof drizzleNeon<typeof schema>>;
let _db: DB | null = null;

function make(): DB {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set (run `vercel env pull .env.local`)");
  // Local development against a plain Postgres; production uses Neon over HTTP.
  if (/@(localhost|127\.0\.0\.1)[:/]/.test(url)) {
    return drizzlePg(new Pool({ connectionString: url }), { schema }) as unknown as DB;
  }
  return drizzleNeon(neon(url), { schema });
}

export function db() {
  return (_db ??= make());
}
export { schema };
