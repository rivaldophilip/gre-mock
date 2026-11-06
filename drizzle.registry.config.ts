import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

// The accounts registry (DATABASE_URL itself). Per-user databases use drizzle.config.ts.
export default defineConfig({
  schema: "./lib/db/registry.ts",
  out: "./drizzle-registry",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
