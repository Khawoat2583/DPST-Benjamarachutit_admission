import { cookies } from "next/headers";
import crypto from "crypto";
import { env } from "@/server/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

/** Admin session lifespan: 2 hours (PDPA compliant secure timeout) */
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 2;

const COOKIE_NAME = "dpst_admin_session";

function getKey(): Buffer {
  return crypto.createHash("sha256").update(env.SESSION_SECRET).digest();
}

export function encryptAdmin(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  return JSON.stringify({
    i: iv.toString("hex"),
    t: tag.toString("hex"),
    e: encrypted,
  });
}

export function decryptAdmin(encryptedJson: string): string {
  try {
    const { i, t, e } = JSON.parse(encryptedJson);
    const iv = Buffer.from(i, "hex");
    const tag = Buffer.from(t, "hex");
    const key = getKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(e, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    throw new Error("Invalid admin session token");
  }
}

function adminSessionCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict" as const,
    path: "/", // Strictly tied to root path for general upload gateway visibility & __Host- production compliance
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    priority: "high" as const,
  };
}

export async function setAdminSession(payload: { username: string; role: "admin" }) {
  const token = encryptAdmin(
    JSON.stringify({
      ...payload,
      lastActiveAt: Date.now(),
    })
  );
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, adminSessionCookieOptions());
}

export async function getAdminSession(): Promise<{ username: string; role: "admin" } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const decrypted = decryptAdmin(token);
    const parsed = JSON.parse(decrypted) as { username?: string; role?: string; lastActiveAt?: number };
    if (parsed.role !== "admin" || !parsed.username || typeof parsed.username !== "string" || !parsed.lastActiveAt) {
      return null;
    }

    const now = Date.now();
    const inactiveTime = now - parsed.lastActiveAt;
    const ONE_HOUR = 60 * 60 * 1000;
    if (inactiveTime > ONE_HOUR) {
      // Inactivity limit of 1 hour exceeded! Clear session.
      try {
        cookieStore.delete(COOKIE_NAME);
      } catch {
        // Ignore error when called in Server Components rendering phase
      }
      return null;
    }

    // Slide the session window
    const updatedPayload = {
      username: parsed.username,
      role: "admin" as const,
      lastActiveAt: now,
    };
    const newToken = encryptAdmin(JSON.stringify(updatedPayload));
    try {
      cookieStore.set(COOKIE_NAME, newToken, adminSessionCookieOptions());
    } catch {
      // Ignore error when called in Server Components rendering phase
    }

    return { username: parsed.username, role: "admin" };
  } catch {
    return null;
  }
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminLoggedIn(): Promise<boolean> {
  const session = await getAdminSession();
  return session !== null;
}
