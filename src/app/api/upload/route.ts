import { NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";
import { db } from "@/db";
import { attachments, applications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import { env } from "@/server/env";
import { randomUUID } from "crypto";
import { isAllowedFileContent } from "@/server/files/validate-upload";

const validDocumentTypes = ["photo", "transcript", "id_card"] as const;
type DocumentType = (typeof validDocumentTypes)[number];

function isDocumentType(value: string): value is DocumentType {
  return validDocumentTypes.includes(value as DocumentType);
}

export async function POST(request: Request) {
  // 1. Authenticate the student session
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบด้วยเลขบัตรประชาชน" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("documentType") as string | null;
    const replaceIdStr = formData.get("replaceId") as string | null;

    if (!file || !documentType) {
      return NextResponse.json({ error: "ข้อมูลไฟล์หรือประเภทเอกสารไม่ครบถ้วน" }, { status: 400 });
    }

    // Validate document type enum
    if (!isDocumentType(documentType)) {
      return NextResponse.json({ error: "ประเภทเอกสารไม่ถูกต้อง" }, { status: 400 });
    }

    // Validate size limit (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "ขนาดไฟล์ต้องไม่เกิน 5MB" }, { status: 400 });
    }

    // Validate MIME types
    const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "รองรับเฉพาะไฟล์รูปภาพ (PNG, JPG, JPEG) และ PDF เท่านั้น" }, { status: 400 });
    }

    // Verify the real content type from magic bytes (Content-Type is spoofable).
    // Done before any DB mutation so a bad file can't delete an existing attachment.
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!isAllowedFileContent(buffer, ["image/png", "image/jpeg", "application/pdf"])) {
      return NextResponse.json({ error: "เนื้อหาไฟล์ไม่ตรงกับชนิดที่อนุญาต (PNG, JPG, PDF)" }, { status: 400 });
    }

    // Fetch the applicant record matching session, or create a draft if new
    let app = await db.query.applications.findFirst({
      where: eq(applications.nationalId, session.nationalId),
    });

    if (!app) {
      // Auto-create a minimal draft record so attachments have a valid applicationId
      const [created] = await db
        .insert(applications)
        .values({
          nationalId: session.nationalId,
          status: "draft",
          title: "",
          firstName: "",
          lastName: "",
          announcementOrder: 0,
          phone: "",
          guardianPhone: "",
          addressNo: "",
          addressSubdistrict: "",
          addressDistrict: "",
          addressProvince: "",
          addressZipcode: "",
          schoolName: "",
          schoolProvince: "",
        })
        .returning();
      app = created;
    }

    // Ensure application is not locked
    if (["ranked", "exported"].includes(app.status)) {
      return NextResponse.json({ error: "ใบสมัครถูกล็อกแล้ว ไม่สามารถปรับเปลี่ยนไฟล์แนบได้" }, { status: 403 });
    }

    // Ensure uploads directory exists on VPS
    const uploadDir = path.resolve(env.UPLOAD_ROOT);
    await fs.mkdir(uploadDir, { recursive: true });

    // Handle replacement logic
    let replaceId = replaceIdStr ? parseInt(replaceIdStr, 10) : null;
    
    // For single-instance files (photo, id_card), we auto-replace any existing one
    if (!replaceId && (documentType === "photo" || documentType === "id_card")) {
      const existing = await db.query.attachments.findFirst({
        where: and(
          eq(attachments.applicationId, app.id),
          eq(attachments.documentType, documentType)
        ),
      });
      if (existing) {
        replaceId = existing.id;
      }
    }

    // Delete old attachment if replacement is requested/triggered
    if (replaceId) {
      const oldAttachment = await db.query.attachments.findFirst({
        where: and(
          eq(attachments.id, replaceId),
          eq(attachments.applicationId, app.id)
        ),
      });

      if (oldAttachment) {
        const oldFilePath = path.join(uploadDir, oldAttachment.storedName);
        try {
          await fs.unlink(oldFilePath);
        } catch {
          // File might already be missing from disk, ignore
        }
        await db.delete(attachments).where(eq(attachments.id, oldAttachment.id));
      }
    }

    // Generate secure random UUID name (PDPA). Extension is derived from the
    // validated MIME type, never from the client-supplied filename.
    const MIME_TO_EXT: Record<string, string> = {
      "image/png": ".png",
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "application/pdf": ".pdf",
    };
    const originalExt = MIME_TO_EXT[file.type] ?? ".bin";
    const storedName = `${randomUUID()}${originalExt}`;
    const filePath = path.join(uploadDir, storedName);

    // Stream and write buffer to local file system
    await fs.writeFile(filePath, buffer);

    // Save metadata record into database
    const [inserted] = await db
      .insert(attachments)
      .values({
        applicationId: app.id,
        documentType,
        originalName: file.name,
        storedName: storedName,
        mimeType: file.type,
        fileSize: file.size,
      })
      .returning();

    return NextResponse.json({
      success: true,
      attachment: {
        id: inserted.id,
        documentType: inserted.documentType,
        originalName: inserted.originalName,
        storedName: inserted.storedName,
        mimeType: inserted.mimeType,
      },
    });

  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ในการอัปโหลดไฟล์" }, { status: 500 });
  }
}
