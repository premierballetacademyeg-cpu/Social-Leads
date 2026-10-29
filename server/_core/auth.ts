import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import { jwtVerify, SignJWT } from "jose";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME, SESSION_MAX_AGE_MS } from "../../shared/const";
import * as db from "../db";
import { ENV } from "./env";
import { getSessionCookieOptions } from "./cookies";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

/** Password hash format: scrypt$<saltHex>$<hashHex> */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  if (expected.length === 0) return false;
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export type StaffAccount = { email: string; hash: string };

/**
 * Staff accounts come from the environment:
 *  - ADMIN_EMAIL + ADMIN_PASSWORD_HASH (one account), and/or
 *  - STAFF_ACCOUNTS = JSON array of {"email": "...", "hash": "..."}.
 */
export function loadStaffAccounts(env: NodeJS.ProcessEnv = process.env): StaffAccount[] {
  const accounts: StaffAccount[] = [];
  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD_HASH) {
    accounts.push({ email: env.ADMIN_EMAIL.trim().toLowerCase(), hash: env.ADMIN_PASSWORD_HASH.trim() });
  }
  if (env.STAFF_ACCOUNTS) {
    try {
      const parsed = JSON.parse(env.STAFF_ACCOUNTS);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && typeof item.email === "string" && typeof item.hash === "string") {
            accounts.push({ email: item.email.trim().toLowerCase(), hash: item.hash.trim() });
          }
        }
      }
    } catch {
      console.warn("[Auth] STAFF_ACCOUNTS is not valid JSON and was ignored");
    }
  }
  return accounts;
}

function sessionKey() {
  if (ENV.cookieSecret.length < 32) {
    throw new Error("JWT_SECRET must be set to at least 32 characters");
  }
  return new TextEncoder().encode(ENV.cookieSecret);
}

export async function createSessionToken(openId: string, name: string) {
  return new SignJWT({ openId, name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(Math.floor((Date.now() + SESSION_MAX_AGE_MS) / 1000))
    .sign(sessionKey());
}

export async function verifySessionToken(token: string | undefined | null) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ["HS256"] });
    return typeof payload.openId === "string" && payload.openId ? { openId: payload.openId } : null;
  } catch {
    return null;
  }
}

/** Returns the signed-in staff user, or null. Never throws. */
export async function authenticateRequest(req: Request): Promise<User | null> {
  const token = parseCookieHeader(req.headers.cookie ?? "")[COOKIE_NAME];
  const session = await verifySessionToken(token);
  if (!session) return null;
  return (await db.getUserByOpenId(session.openId)) ?? null;
}

/** Vercel Cron (and GitHub Actions) send: Authorization: Bearer <CRON_SECRET>. */
export function isCronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;
  const header = req.headers.authorization ?? "";
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Simple in-memory brake on password guessing (per server instance).
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
export function resetLoginAttempts() {
  attempts.clear();
}
function tooManyAttempts(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) return false;
  return entry.count >= MAX_ATTEMPTS;
}
function recordFailure(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  else entry.count += 1;
}

const DUMMY_HASH = "scrypt$00000000000000000000000000000000$" + "00".repeat(64);

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const ip = String(req.headers["x-forwarded-for"] ?? req.socket.remoteAddress ?? "unknown").split(",")[0].trim();
    if (tooManyAttempts(ip)) {
      return res.status(429).json({ error: "Too many attempts. Please try again later." });
    }
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

    const account = loadStaffAccounts().find(item => item.email === email);
    // Always run one scrypt comparison so timing does not reveal whether the email exists.
    const valid = await verifyPassword(password, account?.hash ?? DUMMY_HASH);
    if (!account || !valid) {
      recordFailure(ip);
      return res.status(401).json({ error: "Incorrect email or password." });
    }
    try {
      const openId = `staff:${email}`;
      await db.upsertUser({ openId, name: email.split("@")[0], email, loginMethod: "password", role: "admin", lastSignedIn: new Date() });
      const token = await createSessionToken(openId, email.split("@")[0]);
      res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: SESSION_MAX_AGE_MS });
      return res.json({ ok: true });
    } catch (error) {
      console.error("[Auth] Login failed", error instanceof Error ? error.message : error);
      return res.status(500).json({ error: "Sign-in is temporarily unavailable." });
    }
  });
}
