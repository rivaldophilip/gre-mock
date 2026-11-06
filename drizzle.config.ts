import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

// Per-user database schema (gre_u_<id>). `npm run db:generate` writes migrations to drizzle/;
// `npm run db:migrate` applies them to every user database. The registry has drizzle.registry.config.ts.
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
