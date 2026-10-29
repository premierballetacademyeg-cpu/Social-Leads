import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Request } from "express";
import { createSessionToken, hashPassword, isCronAuthorized, loadStaffAccounts, verifyPassword, verifySessionToken } from "./_core/auth";

const fakeReq = (authorization?: string) => ({ headers: authorization ? { authorization } : {} }) as unknown as Request;

describe("staff passwords", () => {
  it("verifies the right password and rejects wrong ones", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
    expect(await verifyPassword("anything", "not-a-hash")).toBe(false);
  });
  it("loads staff accounts from ADMIN_EMAIL and STAFF_ACCOUNTS", () => {
    const accounts = loadStaffAccounts({ ADMIN_EMAIL: " Boss@PBA.com ", ADMIN_PASSWORD_HASH: "scrypt$a$b", STAFF_ACCOUNTS: JSON.stringify([{ email: "Maadi@pba.com", hash: "scrypt$c$d" }, { bad: true }]) } as NodeJS.ProcessEnv);
    expect(accounts).toEqual([{ email: "boss@pba.com", hash: "scrypt$a$b" }, { email: "maadi@pba.com", hash: "scrypt$c$d" }]);
    expect(loadStaffAccounts({} as NodeJS.ProcessEnv)).toEqual([]);
  });
});

describe("session tokens", () => {
  const original = process.env.JWT_SECRET;
  beforeEach(() => { process.env.JWT_SECRET = "x".repeat(40); });
  afterEach(() => { process.env.JWT_SECRET = original; });
  it("round-trips a signed session and rejects tampering", async () => {
    // ENV is read at import time, so exercise the helper through a fresh import
    const mod = await import("./_core/env");
    (mod.ENV as { cookieSecret: string }).cookieSecret = process.env.JWT_SECRET as string;
    const token = await createSessionToken("staff:boss@pba.com", "boss");
    expect(await verifySessionToken(token)).toEqual({ openId: "staff:boss@pba.com" });
    expect(await verifySessionToken(token + "x")).toBeNull();
    expect(await verifySessionToken(undefined)).toBeNull();
  });
});

describe("cron authorization", () => {
  const original = process.env.CRON_SECRET;
  afterEach(() => { process.env.CRON_SECRET = original; });
  it("accepts only the exact bearer secret", () => {
    process.env.CRON_SECRET = "s".repeat(24);
    expect(isCronAuthorized(fakeReq(`Bearer ${"s".repeat(24)}`))).toBe(true);
    expect(isCronAuthorized(fakeReq(`Bearer ${"t".repeat(24)}`))).toBe(false);
    expect(isCronAuthorized(fakeReq())).toBe(false);
  });
  it("rejects everything when no (or a weak) secret is configured", () => {
    delete process.env.CRON_SECRET;
    expect(isCronAuthorized(fakeReq("Bearer undefined"))).toBe(false);
    process.env.CRON_SECRET = "short";
    expect(isCronAuthorized(fakeReq("Bearer short"))).toBe(false);
  });
});
