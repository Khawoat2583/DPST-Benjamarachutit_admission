export const dynamic = "force-dynamic";

import { getSession } from "@/server/auth/session";
import { getAdminSession } from "@/server/auth/admin-session";
import { db } from "@/db";
import { attachments, applications } from "@/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import { env } from "@/server/env";

/**
 * Serves an uploaded file for preview, authenticated by session.
 * Only the owner (matching nationalId) or an authorized Admin can view files.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const applicantSession = await getSession();
  const adminSession = await getAdminSession();

  if (!applicantSession && !adminSession) {
    return new Response(
      JSON.stringify({ error: "ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบ" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { filename } = await params;

  // Find the attachment record by storedName
  const attachment = await db.query.attachments.findFirst({
    where: eq(attachments.storedName, filename),
  });

  if (!attachment) {
    return new Response(
      JSON.stringify({ error: "ไม่พบไฟล์" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Find the application record for this attachment
  const app = await db.query.applications.findFirst({
    where: eq(applications.id, attachment.applicationId),
  });

  if (!app) {
    return new Response(
      JSON.stringify({ error: "ไม่พบข้อมูลใบสมัครสำหรับไฟล์นี้" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Verify access: must be the applicant owner OR an authenticated admin
  const isOwner = applicantSession && app.nationalId === applicantSession.nationalId;
  const isAdmin = adminSession && adminSession.role === "admin";

  if (!isOwner && !isAdmin) {
    return new Response(
      JSON.stringify({ error: "ไม่ได้รับอนุญาตดูไฟล์นี้" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Read the file securely from disk
  const uploadDir = path.resolve(
    path.isAbsolute(env.UPLOAD_ROOT)
      ? env.UPLOAD_ROOT
      : path.join(/*turbopackIgnore: true*/ process.cwd(), env.UPLOAD_ROOT)
  );
  const filePath = path.resolve(uploadDir, filename);

  // Defense-in-depth: ensure the resolved path stays inside the upload directory
  // (the DB lookup above already constrains `filename` to a known storedName).
  if (filePath !== uploadDir && !filePath.startsWith(uploadDir + path.sep)) {
    return new Response(
      JSON.stringify({ error: "ชื่อไฟล์ไม่ถูกต้อง" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const fileBuffer = await fs.readFile(filePath);
    
    const isPdf = attachment.mimeType.toLowerCase() === "application/pdf";
    const contentDisposition = isPdf
      ? `attachment; filename="${encodeURIComponent(attachment.originalName)}"`
      : `inline; filename="${encodeURIComponent(attachment.originalName)}"`;

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Disposition": contentDisposition,
        "Cache-Control": "private, no-store, must-revalidate",
        "Content-Security-Policy": "default-src 'none'; sandbox;",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "ไม่สามารถอ่านไฟล์ได้" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
