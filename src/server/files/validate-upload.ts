/**
 * Content-sniffing helpers for uploads. The `Content-Type` sent by the browser
 * is attacker-controlled, so we additionally verify a file's real type from its
 * magic bytes before persisting it.
 */

/** Detects the true MIME type from a file's leading bytes. Returns null if unknown. */
export function sniffMimeType(buf: Buffer): string | null {
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return "image/png";
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  // "%PDF-"
  if (
    buf.length >= 5 &&
    buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46 && buf[4] === 0x2d
  ) {
    return "application/pdf";
  }
  if (buf.length >= 6) {
    const sig = buf.toString("latin1", 0, 6);
    if (sig === "GIF87a" || sig === "GIF89a") return "image/gif";
  }
  if (
    buf.length >= 12 &&
    buf.toString("latin1", 0, 4) === "RIFF" &&
    buf.toString("latin1", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

/** True only if the buffer's actual content matches one of the allowed MIME types. */
export function isAllowedFileContent(buf: Buffer, allowed: readonly string[]): boolean {
  const sniffed = sniffMimeType(buf);
  return sniffed !== null && allowed.includes(sniffed);
}
