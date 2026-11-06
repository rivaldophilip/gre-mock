import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { COOKIE, SESSION_DAYS, signSession } from "@/lib/auth";
import { registry, registryDb } from "@/lib/db";
import { dummyHash, verifyPassword } from "@/lib/password";

const Body = z.object({ email: z.string().trim().toLowerCase().max(200), password: z.string().max(200) });

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60_000;
const DENIED = "Wrong email or password";

/** Sign in against the accounts registry. There is deliberately no sign-up route. */
export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: DENIED }, { status: 400 });
  const { email, password } = body.data;
  const { users } = registry;
  const [u] = await registryDb().select().from(users).where(eq(users.email, email));

  if (u?.lockedUntil && u.lockedUntil.getTime() > Date.now()) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }
  // always run one scrypt verification, so an unknown email takes as long as a wrong password
  const ok = await verifyPassword(password, u?.passwordHash ?? (await dummyHash()));
  if (!u || !ok) {
    if (u) {
      const fails = u.failedLogins + 1;
      await registryDb()
        .update(users)
        .set(fails >= MAX_FAILS ? { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MS) } : { failedLogins: sql`${users.failedLogins} + 1` })
        .where(eq(users.id, u.id));
    }
    return NextResponse.json({ error: DENIED }, { status: 401 });
  }
  if (u.failedLogins || u.lockedUntil) {
    await registryDb().update(users).set({ failedLogins: 0, lockedUntil: null }).where(eq(users.id, u.id));
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await signSession({ userId: u.id, db: u.dbName }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
  return res;
}
