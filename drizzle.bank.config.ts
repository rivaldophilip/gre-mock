import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

// The shared question bank (gre_bank, docs/BANK.md). Per-user databases use drizzle.config.ts, the registry
// drizzle.registry.config.ts.
export default defineConfig({
  schema: "./lib/db/bank.ts",
  out: "./drizzle-bank",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
