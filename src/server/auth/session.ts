import { cookies } from "next/headers";
import crypto from "crypto";
import { env } from "@/server/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

/** 24 hours — enough time to complete the multi-step form */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

const COOKIE_NAME = "dpst_session";

function getKey(): Buffer {
  return crypto.createHash("sha256").update(env.SESSION_SECRET).digest();
}

export function encrypt(text: string): string {
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

export function decrypt(encryptedJson: string): string {
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
    throw new Error("Invalid session token");
  }
}

function sessionCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    priority: "high" as const,
  };
}

export async function setSession(payload: { nationalId: string }) {
  const token = encrypt(JSON.stringify(payload));
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, sessionCookieOptions());
}

/** Extends session lifetime after activity (login, draft save, etc.) */
export async function refreshSession(payload: { nationalId: string }) {
  await setSession(payload);
}

export async function getSession(): Promise<{ nationalId: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const decrypted = decrypt(token);
    const parsed = JSON.parse(decrypted) as { nationalId?: string };
    if (!parsed.nationalId || typeof parsed.nationalId !== "string") return null;
    return { nationalId: parsed.nationalId };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isApplicantLoggedIn(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}
