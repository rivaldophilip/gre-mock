import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

const scrypt = (pw: string, salt: Buffer, len: number, opts: ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) => scryptCb(pw, salt, len, opts, (e, k) => (e ? reject(e) : resolve(k))));

const N = 2 ** 15;
const R = 8;
const P = 1;
const KEYLEN = 32;
const MAXMEM = 64 * 1024 * 1024; // N=2^15, r=8 needs 32 MiB; node's default cap is exactly 32 MiB

/** "scrypt$N$r$p$salt$hash" (base64url parts). */
export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(pw, salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return ["scrypt", N, R, P, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [n, r, p] = parts.slice(1, 4).map(Number);
  if (![n, r, p].every(Number.isInteger) || n > 2 ** 20) return false;
  const salt = Buffer.from(parts[4], "base64url");
  const want = Buffer.from(parts[5], "base64url");
  if (want.length !== KEYLEN) return false;
  const got = await scrypt(pw, salt, want.length, { N: n, r, p, maxmem: MAXMEM });
  return timingSafeEqual(got, want);
}

/** A valid hash of a random password, verified against when the email is unknown so timing reveals nothing. */
let dummy: Promise<string> | null = null;
export function dummyHash() {
  return (dummy ??= hashPassword(randomBytes(16).toString("hex")));
}
