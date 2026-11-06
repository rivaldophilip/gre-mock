import { describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import { hashPassword, verifyPassword } from "../lib/password";
import { readSession, signSession } from "../lib/auth";
import { dbUrl } from "../lib/db";

const SECRET = "x".repeat(40);

describe("password hashing", () => {
  it("verifies the right password and rejects a wrong one", async () => {
    const h = await hashPassword("correct horse");
    expect(h.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct horse", h)).toBe(true);
    expect(await verifyPassword("correct hors", h)).toBe(false);
  });

  it("salts: the same password hashes differently", async () => {
    expect(await hashPassword("pw-123456")).not.toBe(await hashPassword("pw-123456"));
  });

  it("rejects tampered or malformed hashes", async () => {
    const h = await hashPassword("secret-pw");
    const parts = h.split("$");
    parts[5] = Buffer.alloc(32, 1).toString("base64url");
    expect(await verifyPassword("secret-pw", parts.join("$"))).toBe(false);
    expect(await verifyPassword("secret-pw", "plain")).toBe(false);
    expect(await verifyPassword("secret-pw", "scrypt$9999999$8$1$a$b")).toBe(false);
  });
});

describe("session tokens", () => {
  it("round-trips user id and database", async () => {
    const t = await signSession({ userId: 7, db: "gre_u_7" }, SECRET);
    expect(await readSession(t, SECRET)).toEqual({ userId: 7, db: "gre_u_7" });
  });

  it("rejects a token signed with another secret", async () => {
    const t = await signSession({ userId: 1, db: "gre_u_1" }, "y".repeat(40));
    expect(await readSession(t, SECRET)).toBeNull();
  });

  it("rejects a signed token whose db claim is not a user database", async () => {
    const t = await new SignJWT({ db: "neondb" }).setProtectedHeader({ alg: "HS256" }).setSubject("1").setExpirationTime("1d").sign(new TextEncoder().encode(SECRET));
    expect(await readSession(t, SECRET)).toBeNull();
  });

  it("refuses to sign without a long enough secret", async () => {
    await expect(signSession({ userId: 1, db: "gre_u_1" }, "short")).rejects.toThrow();
  });
});

describe("per-user database URLs", () => {
  it("swaps the database name on a Neon URL, keeping credentials and params", () => {
    const u = dbUrl("gre_u_3", "postgresql://owner:pw@ep-x.neon.tech/neondb?sslmode=require&channel_binding=require");
    expect(u).toBe("postgresql://owner:pw@ep-x.neon.tech/gre_u_3?sslmode=require&channel_binding=require");
  });

  it("works for a localhost URL", () => {
    expect(dbUrl("gre_u_1", "postgres://postgres@localhost:54329/gre")).toBe("postgres://postgres@localhost:54329/gre_u_1");
  });

  it("refuses names that are not user databases", () => {
    expect(() => dbUrl("neondb", "postgres://a@localhost/x")).toThrow();
    expect(() => dbUrl("gre_u_1; drop", "postgres://a@localhost/x")).toThrow();
  });
});
