"use server";

import ExcelJS from "exceljs";
import { db } from "@/db";
import { examScores, applications } from "@/db/schema";

import { getAdminSession } from "@/server/auth/admin-session";
import { revalidatePath } from "next/cache";
import { recordAuditLog } from "@/server/auth/security";

export interface ParsedScoreRow {
  rowNum: number;
  examId: string;
  announcementOrder: number;
  mathScore: string;
  scienceScore: string;
  studentName: string | null; // matched applicant name
  status: "matched" | "mismatch";
}

export interface PreflightResult {
  success: boolean;
  isEncrypted?: boolean;
  totalRows: number;
  matchedCount: number;
  mismatchCount: number;
  rows: ParsedScoreRow[];
  error?: string;
}

export interface CommitScoreInput {
  examId: string;
  announcementOrder: number;
  mathScore: string;
  scienceScore: string;
}

/**
 * Parses score sheet Excel file (Base64 encoded string) and conducts Preflight matching check.
 * Protects against Password-Protected / Encrypted workbooks.
 */
export async function parseExcelScoresAction(fileDataB64: string): Promise<PreflightResult> {
  // 1. Authorize Admin
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized access.");
  }

  try {
    const buffer = Buffer.from(fileDataB64, "base64");
    const workbook = new ExcelJS.Workbook();

    // 2. Load Workbook with protection detection
    try {
      await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "";
      const msg = errorMsg.toLowerCase();
      if (
        msg.includes("encrypt") ||
        msg.includes("password") ||
        msg.includes("protect") ||
        msg.includes("signature") ||
        msg.includes("zip")
      ) {
        return {
          success: false,
          isEncrypted: true,
          totalRows: 0,
          matchedCount: 0,
          mismatchCount: 0,
          rows: [],
          error: "ไฟล์ Excel นี้ติดการเข้ารหัสป้องกัน (Password Protected) หรือรูปแบบไม่ถูกต้อง กรุณาปลดล็อคไฟล์ก่อนนำเข้า",
        };
      }
      throw e;
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return {
        success: false,
        totalRows: 0,
        matchedCount: 0,
        mismatchCount: 0,
        rows: [],
        error: "ไม่พบแผ่นงาน (Worksheet) ในไฟล์ Excel",
      };
    }

    // 3. Query all applications to match by announcementOrder
    const allApps = await db
      .select({
        firstName: applications.firstName,
        lastName: applications.lastName,
        announcementOrder: applications.announcementOrder,
      })
      .from(applications);

    // Create an announcement order map for fast lookups
    const appMap = new Map<number, string>();
    allApps.forEach((app) => {
      if (app.announcementOrder !== null) {
        appMap.set(app.announcementOrder, `${app.firstName} ${app.lastName}`);
      }
    });

    // 4. Map columns intelligently or fallback to standard col order
    let examIdCol = 1;
    let orderCol = 2;
    let mathCol = 3;
    let sciCol = 4;

    const firstRow = worksheet.getRow(1);
    firstRow.eachCell((cell, colNumber) => {
      const cellVal = cell.value?.toString().toLowerCase().trim() || "";
      if (cellVal.includes("เลขประจำตัวสอบ") || cellVal.includes("exam_id") || cellVal.includes("exam id")) {
        examIdCol = colNumber;
      } else if (cellVal.includes("ลำดับประกาศ") || cellVal.includes("ลำดับ") || cellVal.includes("announcement_order") || cellVal.includes("order")) {
        orderCol = colNumber;
      } else if (cellVal.includes("คณิต") || cellVal.includes("math")) {
        mathCol = colNumber;
      } else if (cellVal.includes("วิทย์") || cellVal.includes("วิทยาศาสตร์") || cellVal.includes("science") || cellVal.includes("sci")) {
        sciCol = colNumber;
      }
    });

    const parsedRows: ParsedScoreRow[] = [];
    let matchedCount = 0;
    let mismatchCount = 0;

    // 5. Read row by row (skip header at row 1)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip headers

      // Skip entirely blank rows
      const examIdRaw = row.getCell(examIdCol).value;
      const orderRaw = row.getCell(orderCol).value;
      if (examIdRaw === null || examIdRaw === undefined || orderRaw === null || orderRaw === undefined) {
        return;
      }

      const examId = examIdRaw.toString().trim();
      const announcementOrder = parseInt(orderRaw.toString().trim(), 10);
      const mathScore = parseFloat(row.getCell(mathCol).value?.toString().trim() || "0").toFixed(2);
      const scienceScore = parseFloat(row.getCell(sciCol).value?.toString().trim() || "0").toFixed(2);

      if (!examId || isNaN(announcementOrder)) return;

      const studentName = appMap.get(announcementOrder) || null;
      const status = studentName ? "matched" : "mismatch";

      if (status === "matched") {
        matchedCount++;
      } else {
        mismatchCount++;
      }

      parsedRows.push({
        rowNum: rowNumber,
        examId,
        announcementOrder,
        mathScore,
        scienceScore,
        studentName,
        status,
      });
    });

    return {
      success: true,
      totalRows: parsedRows.length,
      matchedCount,
      mismatchCount,
      rows: parsedRows,
    };
  } catch (error: unknown) {
    console.error("Excel Preflight Parser Error:", error);
    const errorMsg = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการวิเคราะห์ไฟล์ Excel";
    return {
      success: false,
      totalRows: 0,
      matchedCount: 0,
      mismatchCount: 0,
      rows: [],
      error: errorMsg,
    };
  }
}

/**
 * Commits multiple parsed scores into database inside a single SQL Transaction (atomic bulk insert/upsert).
 */
export async function commitExcelScoresAction(scores: CommitScoreInput[]) {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized access.");
  }

  if (scores.length === 0) {
    return { success: false, error: "ไม่มีชุดข้อมูลสำหรับบันทึก" };
  }

  try {
    await db.transaction(async (tx) => {
      for (const score of scores) {
        // Bulk upsert into exam_scores
        await tx
          .insert(examScores)
          .values({
            examId: score.examId,
            announcementOrder: score.announcementOrder,
            mathScore: score.mathScore,
            scienceScore: score.scienceScore,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: examScores.examId,
            set: {
              announcementOrder: score.announcementOrder,
              mathScore: score.mathScore,
              scienceScore: score.scienceScore,
              updatedAt: new Date(),
            },
          });
      }
    });

    await recordAuditLog(
      "IMPORT_SCORES",
      `นำเข้าคะแนนสอบรอบแรก พสวท. ผ่านไฟล์ Excel สำเร็จ จำนวน ${scores.length} รายการ`
    );

    revalidatePath("/admin");
    return { success: true, count: scores.length };
  } catch (error: unknown) {
    console.error("Database commit exam scores error:", error);
    const errorMsg = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูลเข้าสู่ฐานข้อมูล";
    return { success: false, error: errorMsg };
  }
}
