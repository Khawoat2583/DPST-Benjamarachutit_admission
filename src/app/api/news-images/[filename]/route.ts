export const dynamic = "force-dynamic";

import fs from "fs/promises";
import path from "path";
import { env } from "@/server/env";

// Stored names are server-generated UUIDs + a raster extension. Reject anything
// else to prevent path traversal. SVG is intentionally excluded (XSS vector).
const SAFE_FILENAME = /^[A-Za-z0-9][A-Za-z0-9._-]*\.(png|jpe?g|gif|webp)$/i;

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg"; // default fallback (.jpg/.jpeg)
}

/**
 * Serves an uploaded news image publicly, with long-term caching.
 * Bypasses database check to support instant draft previews during composer uploads.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Reject path-traversal / unexpected names before touching the filesystem.
  if (!SAFE_FILENAME.test(filename) || filename.includes("..")) {
    return new Response(JSON.stringify({ error: "ชื่อไฟล์ไม่ถูกต้อง" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. Read the file securely from disk
  const baseUploadDir = path.isAbsolute(env.UPLOAD_ROOT)
    ? env.UPLOAD_ROOT
    : path.join(process.cwd(), env.UPLOAD_ROOT);
  const newsDir = path.resolve(baseUploadDir, "public-news");
  const filePath = path.resolve(newsDir, filename);

  // Defense-in-depth: ensure the resolved path stays inside the news directory.
  if (filePath !== newsDir && !filePath.startsWith(newsDir + path.sep)) {
    return new Response(JSON.stringify({ error: "ชื่อไฟล์ไม่ถูกต้อง" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const fileBuffer = await fs.readFile(filePath);
    const mimeType = getMimeType(filename);

    // 2. Serve the file with strong public caching headers
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
        // Strong client side cache (1 year) since news images are immutable
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error reading news image file:", error);
    return new Response(
      JSON.stringify({ error: "ไม่พบรูปภาพข่าวสารประชาสัมพันธ์" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
