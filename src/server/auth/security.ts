import { db } from "@/db";
import { auditLogs, loginAttempts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getAdminSession } from "./admin-session";
import { pbkdf2Sync, randomBytes, timingSafeEqual, createHash } from "crypto";

const PBKDF2_ITERATIONS = 210000; // OWASP-recommended minimum for PBKDF2-HMAC-SHA512
const PBKDF2_KEYLEN = 64;
const LEGACY_ITERATIONS = 10000; // backward-compat for pre-existing "salt:hash" records

/**
 * Gets the client IP address from the request headers.
 */
export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    return headerList.get("x-real-ip") || "127.0.0.1";
  } catch (error) {
    console.error("Error getting client IP:", error);
    return "127.0.0.1";
  }
}

/**
 * Records an audit log for admin operations.
 */
export async function recordAuditLog(
  action: string,
  details: string
): Promise<void> {
  try {
    const session = await getAdminSession();
    const adminUsername = session?.username || "system/anonymous";
    const ipAddress = await getClientIp();

    await db.insert(auditLogs).values({
      adminUsername,
      action,
      details,
      ipAddress,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
  }
}

/**
 * Checks if the IP address is currently blocked due to excessive failed login attempts.
 * If blocked, throws an Error with a user-friendly message.
 */
export async function checkRateLimit(ipAddress: string): Promise<void> {
  const record = await db.query.loginAttempts.findFirst({
    where: eq(loginAttempts.ipAddress, ipAddress),
  });

  if (record && record.blockedUntil) {
    const blockedUntil = new Date(record.blockedUntil);
    const now = new Date();
    
    if (blockedUntil > now) {
      const waitMinutes = Math.ceil((blockedUntil.getTime() - now.getTime()) / (60 * 1000));
      throw new Error(`คุณถูกระงับการเข้าสู่ระบบชั่วคราว กรุณาลองอีกครั้งในอีก ${waitMinutes} นาที`);
    } else {
      // Block period has expired, reset attempts in DB
      await db
        .update(loginAttempts)
        .set({
          attempts: 0,
          blockedUntil: null,
          lastAttemptAt: new Date(),
        })
        .where(eq(loginAttempts.ipAddress, ipAddress));
    }
  }
}

/**
 * Increments failed attempts for an IP address.
 * Blocks the IP for 15 minutes after 5 consecutive failures.
 */
export async function incrementFailedAttempts(ipAddress: string): Promise<{ attempts: number; blockedUntil: Date | null }> {
  const record = await db.query.loginAttempts.findFirst({
    where: eq(loginAttempts.ipAddress, ipAddress),
  });

  const now = new Date();
  let attempts = 1;
  let blockedUntil: Date | null = null;

  if (record) {
    attempts = record.attempts + 1;
    if (attempts >= 5) {
      blockedUntil = new Date(now.getTime() + 15 * 60 * 1000); // Block for 15 minutes
    }
    
    await db
      .update(loginAttempts)
      .set({
        attempts,
        blockedUntil,
        lastAttemptAt: now,
      })
      .where(eq(loginAttempts.ipAddress, ipAddress));
  } else {
    await db.insert(loginAttempts).values({
      ipAddress,
      attempts: 1,
      lastAttemptAt: now,
      blockedUntil: null,
    });
  }

  return { attempts, blockedUntil };
}

/**
 * Resets failed login attempts for an IP address upon successful login.
 */
export async function resetFailedAttempts(ipAddress: string): Promise<void> {
  await db
    .update(loginAttempts)
    .set({
      attempts: 0,
      blockedUntil: null,
      lastAttemptAt: new Date(),
    })
    .where(eq(loginAttempts.ipAddress, ipAddress));
}

/**
 * Hashes a password using PBKDF2-HMAC-SHA512 with a random salt.
 * Format: `pbkdf2$<iterations>$<saltHex>$<hashHex>`
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, "sha512").toString("hex");
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${hash}`;
}

/**
 * Verifies a password against a stored hash using a constant-time comparison.
 * Supports the current `pbkdf2$iter$salt$hash` format and the legacy `salt:hash`
 * format (10k iterations) so pre-existing accounts keep working.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  let iterations: number;
  let salt: string;
  let hash: string;

  if (storedHash.startsWith("pbkdf2$")) {
    const [, iterStr, s, h] = storedHash.split("$");
    iterations = Number.parseInt(iterStr, 10);
    salt = s;
    hash = h;
  } else {
    // Legacy format: "saltHex:hashHex" produced with 10k iterations
    const [s, h] = storedHash.split(":");
    iterations = LEGACY_ITERATIONS;
    salt = s;
    hash = h;
  }

  if (!salt || !hash || !Number.isFinite(iterations) || iterations <= 0) return false;

  const computed = pbkdf2Sync(password, salt, iterations, PBKDF2_KEYLEN, "sha512");
  let stored: Buffer;
  try {
    stored = Buffer.from(hash, "hex");
  } catch {
    return false;
  }
  if (stored.length !== computed.length) return false;
  return timingSafeEqual(stored, computed);
}

/**
 * Returns true if a stored hash uses an outdated format or a lower iteration
 * count than the current policy, and should be re-hashed on next login.
 */
export function needsPasswordRehash(storedHash: string): boolean {
  if (!storedHash.startsWith("pbkdf2$")) return true; // legacy "salt:hash" (10k)
  const iterations = Number.parseInt(storedHash.split("$")[1], 10);
  return !Number.isFinite(iterations) || iterations < PBKDF2_ITERATIONS;
}

/**
 * Constant-time string equality. Hashes both inputs to fixed-length digests so
 * the comparison time does not leak length or content (use for secrets/PINs).
 */
export function safeStrEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(String(a), "utf8").digest();
  const hb = createHash("sha256").update(String(b), "utf8").digest();
  return timingSafeEqual(ha, hb);
}

/**
 * Generates a cryptographically secure 6-digit numeric PIN.
 */
export function generateNumericPin(): string {
  const val = randomBytes(4).readUInt32BE(0);
  const pin = (val % 900000) + 100000;
  return pin.toString();
}
