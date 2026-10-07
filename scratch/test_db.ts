import { db } from "../src/db";
import { attachments } from "../src/db/schema";
import fs from "fs/promises";
import path from "path";

async function main() {
  const records = await db.select().from(attachments);
  console.log("=== Database Attachment Records ===");
  console.log(JSON.stringify(records, null, 2));

  const uploadsDir = path.join(process.cwd(), "uploads");
  const files = await fs.readdir(uploadsDir);
  console.log("\n=== Uploads Directory Files ===");
  console.log(files);
}

main().catch(console.error);
