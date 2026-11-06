// The registry database (DATABASE_URL, i.e. `neondb`) holds only accounts. Each user's data lives in
// its own database, `gre_u_<id>`, with the schema in ./schema.ts. Accounts are created by
// `npm run user:add`; there is no sign-up path in the app.
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(), // lowercased
  passwordHash: text("password_hash").notNull(),
  dbName: text("db_name").notNull().unique(),
  failedLogins: integer("failed_logins").notNull().default(0),
  lockedUntil: timestamp("locked_until"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
