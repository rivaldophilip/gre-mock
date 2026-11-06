import { SignJWT, jwtVerify } from "jose";

export const COOKIE = "gre_session";

function secret() {
  const s = process.env.AUTH_SECRET ?? process.env.APP_PASSCODE;
  if (!s) throw new Error("APP_PASSCODE is not set");
  return new TextEncoder().encode(`gre-mock:${s}`);
}

export async function signSession(): Promise<string> {
  return new SignJWT({ ok: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}
