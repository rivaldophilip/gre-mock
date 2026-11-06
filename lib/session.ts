import "server-only";
import { cookies } from "next/headers";
import { COOKIE, readSession, type Session } from "./auth";
import { dbFor } from "./db";

export async function getSession(): Promise<Session | null> {
  return readSession((await cookies()).get(COOKIE)?.value);
}

/** The signed-in user's own database. proxy.ts guarantees a valid session on every non-login route. */
export async function userDb() {
  const s = await getSession();
  if (!s) throw new Error("not signed in");
  return dbFor(s.db);
}
