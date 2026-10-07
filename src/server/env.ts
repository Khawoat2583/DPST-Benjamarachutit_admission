import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  UPLOAD_ROOT: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_NAME: z.string().default("DPST Admission"),
  // No defaults: the app must fail to boot if admin credentials are unset,
  // rather than silently running with well-known default credentials.
  ADMIN_USERNAME: z.string().min(4),
  ADMIN_PASSWORD: z.string().min(8),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  UPLOAD_ROOT: process.env.UPLOAD_ROOT,
  SESSION_SECRET: process.env.SESSION_SECRET,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
});
