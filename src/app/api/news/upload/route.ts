import { NextResponse } from "next/server";
import { getAdminSession } from "@/server/auth/admin-session";
import fs from "fs/promises";
import path from "path";
import { env } from "@/server/env";
import { randomUUID } from "crypto";
import { isAllowedFileContent } from "@/server/files/validate-upload";

export async function POST(request: Request) {
  // 1. Authenticate the admin session
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { error: "ไม่ได้รับอนุญาต เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถอัปโหลดได้" },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "ไม่พบข้อมูลไฟล์ที่อัปโหลด" }, { status: 400 });
    }

    // Validate size limit (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "ขนาดไฟล์ต้องไม่เกิน 5MB" }, { status: 400 });
    }

    // Validate MIME types (images only)
    const allowedMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
    ];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "รองรับเฉพาะไฟล์รูปภาพ (PNG, JPG, JPEG, GIF, WEBP) เท่านั้น" },
        { status: 400 }
      );
    }

    // Ensure uploads directory and public-news subdirectory exist on VPS
    const baseUploadDir = path.resolve(env.UPLOAD_ROOT);
    const newsUploadDir = path.join(baseUploadDir, "public-news");
    await fs.mkdir(newsUploadDir, { recursive: true });

    // Derive the extension from the validated MIME type — never trust the
    // client-supplied filename (prevents .svg / double-extension smuggling).
    const MIME_TO_EXT: Record<string, string> = {
      "image/png": ".png",
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/gif": ".gif",
      "image/webp": ".webp",
    };
    const ext = MIME_TO_EXT[file.type] ?? ".jpg";
    const storedName = `${randomUUID()}${ext}`;
    const filePath = path.join(newsUploadDir, storedName);

    // Stream and write buffer to local file system
    const buffer = Buffer.from(await file.arrayBuffer());

    // Verify real content type from magic bytes (Content-Type is spoofable).
    if (!isAllowedFileContent(buffer, ["image/png", "image/jpeg", "image/gif", "image/webp"])) {
      return NextResponse.json(
        { error: "เนื้อหาไฟล์ไม่ตรงกับชนิดรูปภาพที่อนุญาต (PNG, JPG, GIF, WEBP)" },
        { status: 400 }
      );
    }

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      image: {
        originalName: file.name,
        storedName: storedName,
        mimeType: file.type,
        fileSize: file.size,
      },
    });
  } catch (error) {
    console.error("Error uploading news image:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ในการอัปโหลดรูปภาพข่าว" },
      { status: 500 }
    );
  }
}
