import { SignJWT, jwtVerify } from "jose";

export const COOKIE = "gre_session";
export const SESSION_DAYS = 30;
const USER_DB_RE = /^gre_u_\d+$/;

export interface Session {
  userId: number;
  db: string; // the user's own database, gre_u_<id>
}

function secret(raw = process.env.AUTH_SECRET) {
  if (!raw || raw.length < 32) throw new Error("AUTH_SECRET is not set (needs >= 32 characters)");
  return new TextEncoder().encode(raw);
}

export async function signSession(s: Session, rawSecret?: string): Promise<string> {
  return new SignJWT({ db: s.db })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(s.userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret(rawSecret));
}

/** The session in a cookie value, or null if it is missing, expired, forged or malformed. */
export async function readSession(token: string | undefined, rawSecret?: string): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(rawSecret), { algorithms: ["HS256"] });
    const userId = Number(payload.sub);
    const db = payload.db;
    if (!Number.isInteger(userId) || userId <= 0 || typeof db !== "string" || !USER_DB_RE.test(db)) return null;
    return { userId, db };
  } catch {
    return null;
  }
}
