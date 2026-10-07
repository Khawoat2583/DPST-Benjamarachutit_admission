"use server";

import ExcelJS from "exceljs";
import { db } from "@/db";
import { applications, examScores, courseGrades } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getSystemSettings, saveSystemSettings } from "@/lib/system-settings";
import { rankApplicants, ApplicantForRanking } from "@/features/ranking/ranking";
import type { RankedApplicantRecord } from "@/features/ranking/types";
import { getAdminSession } from "@/server/auth/admin-session";
import { revalidatePath } from "next/cache";
import { recordAuditLog } from "@/server/auth/security";
import { escapeExcelFormula } from "./utils";

/**
 * Toggles the registration closed status.
 */
export async function toggleRegistrationClosedAction() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized access.");
  }

  const settings = getSystemSettings();
  settings.isRegistrationClosed = !settings.isRegistrationClosed;
  saveSystemSettings(settings);

  await recordAuditLog(
    "TOGGLE_REGISTRATION",
    `เจ้าหน้าที่ทำการ${settings.isRegistrationClosed ? "ปิด" : "เปิด"}การรับสมัครระบบ`
  );

  revalidatePath("/admin/workflow");
  revalidatePath("/");
  revalidatePath("/apply");

  return { success: true, settings };
}

/**
 * Sets (or clears) the application deadline used by the /admission countdown.
 * `deadlineIso` should be a UTC ISO string, or null/"" to clear.
 */
export async function updateRegistrationDeadlineAction(deadlineIso: string | null) {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized access.");
  }

  let value: string | null = null;
  if (deadlineIso && deadlineIso.trim()) {
    const d = new Date(deadlineIso);
    if (Number.isNaN(d.getTime())) {
      return { success: false, error: "รูปแบบวันที่ไม่ถูกต้อง" };
    }
    value = d.toISOString();
  }

  const settings = getSystemSettings();
  settings.registrationCloseAt = value;
  saveSystemSettings(settings);

  await recordAuditLog(
    "UPDATE_DEADLINE",
    value ? `ตั้งวันปิดรับสมัครเป็น ${value}` : "ล้างวันปิดรับสมัคร"
  );

  revalidatePath("/admin/settings");
  revalidatePath("/admission");

  return { success: true, registrationCloseAt: value };
}

/**
 * Runs the ranking engine. Calculates rankings and updates status to "ranked".
 */
export async function runRankingAction() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized access.");
  }

  const settings = getSystemSettings();
  if (!settings.isRegistrationClosed) {
    return { success: false, error: "กรุณาปิดการรับสมัครก่อนดำเนินการจัดอันดับ" };
  }

  try {
    // 1. Fetch all approved (or already ranked, if rerunning) applications
    const eligibleApps = await db
      .select({
        id: applications.id,
        firstName: applications.firstName,
        lastName: applications.lastName,
        announcementOrder: applications.announcementOrder,
        mathGpa: applications.mathGpa,
        scienceGpa: applications.scienceGpa,
        englishGpa: applications.englishGpa,
        gpax: applications.gpax,
        examMathScore: examScores.mathScore,
        examScienceScore: examScores.scienceScore,
      })
      .from(applications)
      .leftJoin(examScores, eq(applications.announcementOrder, examScores.announcementOrder))
      .where(
        inArray(applications.status, ["approved", "ranked"])
      );

    if (eligibleApps.length === 0) {
      return { success: false, error: "ไม่พบใบสมัครที่สามารถจัดอันดับได้ (ต้องผ่านการอนุมัติหลักฐานก่อน)" };
    }

    // Fetch all course grades for these applicants to compute the correct weighted math+science GPA
    const ids = eligibleApps.map((app) => app.id);
    const allGrades = ids.length > 0
      ? await db
          .select({
            applicationId: courseGrades.applicationId,
            subjectGroup: courseGrades.subjectGroup,
            credit: courseGrades.credit,
            grade: courseGrades.grade,
          })
          .from(courseGrades)
          .where(inArray(courseGrades.applicationId, ids))
      : [];

    const gradesByApp = new Map<number, typeof allGrades>();
    allGrades.forEach((g) => {
      const list = gradesByApp.get(g.applicationId) || [];
      list.push(g);
      gradesByApp.set(g.applicationId, list);
    });

    const mathSciGpaMap = new Map<number, number>();
    ids.forEach((appId) => {
      const appGrades = gradesByApp.get(appId) || [];
      const mathSciEntries = appGrades.filter(
        (g) => g.subjectGroup === "math" || g.subjectGroup === "science"
      );
      let weightedSum = 0;
      let totalCredits = 0;
      mathSciEntries.forEach((g) => {
        const crVal = parseFloat(g.credit?.toString() || "0");
        const grVal = parseFloat(g.grade?.toString() || "0");
        weightedSum += crVal * grVal;
        totalCredits += crVal;
      });
      const mathSciGpa = totalCredits > 0
        ? Math.round((weightedSum / totalCredits + Number.EPSILON) * 100) / 100
        : 0;
      mathSciGpaMap.set(appId, mathSciGpa);
    });

    // 2. Map to format required by the ranking engine
    const candidates: ApplicantForRanking[] = eligibleApps.map((app) => ({
      id: app.id,
      firstName: app.firstName,
      lastName: app.lastName,
      announcementOrder: app.announcementOrder ?? 0,
      mathGpa: parseFloat(app.mathGpa?.toString() || "0"),
      scienceGpa: parseFloat(app.scienceGpa?.toString() || "0"),
      englishGpa: parseFloat(app.englishGpa?.toString() || "0"),
      gpax: parseFloat(app.gpax?.toString() || "0"),
      examMathScore: parseFloat(app.examMathScore?.toString() || "0"),
      examScienceScore: parseFloat(app.examScienceScore?.toString() || "0"),
      mathSciGpa: mathSciGpaMap.get(app.id) || 0,
    }));

    // 3. Run Ranking Engine
    const ranked = rankApplicants(candidates);

    // 4. Batch update status to "ranked"
    await db.transaction(async (tx) => {
      const ids = eligibleApps.map((app) => app.id);
      await tx
        .update(applications)
        .set({
          status: "ranked",
          rankedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(inArray(applications.id, ids));

      settings.isRanked = true;
      saveSystemSettings(settings);
    });

    await recordAuditLog(
      "RUN_RANKING",
      `ประมวลผลจัดอันดับผู้สมัคร พสวท. ประจำปีการศึกษา 2569 สำเร็จ จำนวน ${ranked.length} คน`
    );

    revalidatePath("/admin/workflow");
    revalidatePath("/admin");
    return { success: true, count: ranked.length, settings };
  } catch (error: unknown) {
    console.error("Run ranking error:", error);
    const errorMsg = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการประมวลผลจัดอันดับ";
    return { success: false, error: errorMsg };
  }
}

/**
 * Gets currently approved, ranked, or exported applications with their details and exam scores.
 */
export async function getRankedApplicantsAction(): Promise<RankedApplicantRecord[]> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized access.");
  }

  try {
    const apps = await db
      .select({
        id: applications.id,
        title: applications.title,
        firstName: applications.firstName,
        lastName: applications.lastName,
        schoolName: applications.schoolName,
        announcementOrder: applications.announcementOrder,
        mathGpa: applications.mathGpa,
        scienceGpa: applications.scienceGpa,
        englishGpa: applications.englishGpa,
        gpax: applications.gpax,
        status: applications.status,
        examId: examScores.examId,
        examMathScore: examScores.mathScore,
        examScienceScore: examScores.scienceScore,
      })
      .from(applications)
      .leftJoin(examScores, eq(applications.announcementOrder, examScores.announcementOrder))
      .where(inArray(applications.status, ["approved", "ranked", "exported"]));

    const ids = apps.map((app) => app.id);
    const allGrades = ids.length > 0
      ? await db
          .select({
            applicationId: courseGrades.applicationId,
            subjectGroup: courseGrades.subjectGroup,
            credit: courseGrades.credit,
            grade: courseGrades.grade,
          })
          .from(courseGrades)
          .where(inArray(courseGrades.applicationId, ids))
      : [];

    const gradesByApp = new Map<number, typeof allGrades>();
    allGrades.forEach((g) => {
      const list = gradesByApp.get(g.applicationId) || [];
      list.push(g);
      gradesByApp.set(g.applicationId, list);
    });

    const mathSciGpaMap = new Map<number, number>();
    ids.forEach((appId) => {
      const appGrades = gradesByApp.get(appId) || [];
      const mathSciEntries = appGrades.filter(
        (g) => g.subjectGroup === "math" || g.subjectGroup === "science"
      );
      let weightedSum = 0;
      let totalCredits = 0;
      mathSciEntries.forEach((g) => {
        const crVal = parseFloat(g.credit?.toString() || "0");
        const grVal = parseFloat(g.grade?.toString() || "0");
        weightedSum += crVal * grVal;
        totalCredits += crVal;
      });
      const mathSciGpa = totalCredits > 0
        ? Math.round((weightedSum / totalCredits + Number.EPSILON) * 100) / 100
        : 0;
      mathSciGpaMap.set(appId, mathSciGpa);
    });

    const candidates: ApplicantForRanking[] = apps.map((app) => ({
      id: app.id,
      firstName: app.firstName,
      lastName: app.lastName,
      announcementOrder: app.announcementOrder ?? 0,
      mathGpa: parseFloat(app.mathGpa?.toString() || "0"),
      scienceGpa: parseFloat(app.scienceGpa?.toString() || "0"),
      englishGpa: parseFloat(app.englishGpa?.toString() || "0"),
      gpax: parseFloat(app.gpax?.toString() || "0"),
      examMathScore: parseFloat(app.examMathScore?.toString() || "0"),
      examScienceScore: parseFloat(app.examScienceScore?.toString() || "0"),
      mathSciGpa: mathSciGpaMap.get(app.id) || 0,
    }));

    const ranked = rankApplicants(candidates);

    // Map back to include metadata
    const appMap = new Map(apps.map((a) => [a.id, a]));
    return ranked.map((r): RankedApplicantRecord => {
      const dbApp = appMap.get(r.id)!;
      return {
        ...r,
        title: dbApp.title || "",
        schoolName: dbApp.schoolName || "",
        examId: dbApp.examId || "ไม่มีข้อมูลคะแนนสอบ",
        status: dbApp.status,
      };
    });
  } catch (error) {
    console.error("Get ranked applicants error:", error);
    return [];
  }
}

/**
 * Exports ranked applicants to a base64 encoded Excel file.
 * Automatically marks the status as "exported".
 */
export async function exportRankedExcelAction(): Promise<{ success: boolean; data?: string; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized access.");
  }

  const settings = getSystemSettings();
  if (!settings.isRanked) {
    return { success: false, error: "กรุณาประมวลผลจัดอันดับ (Run Ranking) ก่อนทำการส่งออก Excel" };
  }

  try {
    const list = await getRankedApplicantsAction();
    if (list.length === 0) {
      return { success: false, error: "ไม่มีชุดข้อมูลผู้สมัครที่จัดอันดับแล้วสำหรับส่งออก" };
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("รายชื่อผู้จัดอันดับ พสวท.");

    // Define columns A to N
    sheet.columns = [
      { header: "ลำดับที่ (Rank)", key: "rank", width: 12 },
      { header: "เลขประจำตัวสอบ (Exam ID)", key: "examId", width: 22 },
      { header: "คำนำหน้า (Title)", key: "title", width: 12 },
      { header: "ชื่อสกุล (Full Name)", key: "fullName", width: 25 },
      { header: "โรงเรียนเดิม (School)", key: "school", width: 30 },
      { header: "คะแนนรวม (Total Score)", key: "totalScore", width: 15 },
      { header: "คะแนนคณิต (Math Score)", key: "mathScore", width: 15 },
      { header: "คะแนนวิทย์ (Sci Score)", key: "sciScore", width: 15 },
      { header: "ลำดับประกาศ พสวท. (Announcement Order)", key: "announcementOrder", width: 22 },
      { header: "GPA คณิตศาสตร์ (Math GPA)", key: "mathGpa", width: 15 },
      { header: "GPA วิทยาศาสตร์ (Sci GPA)", key: "scienceGpa", width: 15 },
      { header: "GPA คณิต + วิทย์ (Math + Sci GPA)", key: "mathSciGpa", width: 18 },
      { header: "GPA ภาษาอังกฤษ (Eng GPA)", key: "englishGpa", width: 15 },
      { header: "GPAX สะสมรวม (GPAX)", key: "gpax", width: 15 },
    ];

    // Format headers with a premium style (indigo color, bold white text)
    const headerRow = sheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F46E5" }, // Indigo-600
      };
      cell.font = {
        name: "Sarabun",
        bold: true,
        color: { argb: "FFFFFFFF" },
        size: 11,
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFC7D2FE" } },
        bottom: { style: "medium", color: { argb: "FF312E81" } },
        left: { style: "thin", color: { argb: "FFC7D2FE" } },
        right: { style: "thin", color: { argb: "FFC7D2FE" } },
      };
    });

    // Populate data
    list.forEach((item) => {
      const row = sheet.addRow({
        rank: item.rank,
        examId: escapeExcelFormula(item.examId),
        title: escapeExcelFormula(item.title),
        fullName: escapeExcelFormula(`${item.firstName} ${item.lastName}`),
        school: escapeExcelFormula(item.schoolName),
        totalScore: item.totalExamScore,
        mathScore: item.examMathScore,
        sciScore: item.examScienceScore,
        announcementOrder: item.announcementOrder,
        mathGpa: item.mathGpa,
        scienceGpa: item.scienceGpa,
        mathSciGpa: item.mathSciGpa,
        englishGpa: item.englishGpa,
        gpax: item.gpax,
      });

      row.height = 22;

      // Center text and set fonts
      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Sarabun", size: 10 };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };

        // Alignments: Numbers right, texts left, identifiers/order center
        if ([1, 2, 3, 9].includes(colNumber)) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else if ([4, 5].includes(colNumber)) {
          cell.alignment = { vertical: "middle", horizontal: "left" };
        } else {
          cell.alignment = { vertical: "middle", horizontal: "right" };
          // Format scores and GPAs to 2 decimal places
          cell.numFmt = "0.00";
        }
      });
    });

    // Write to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    // Update applicant statuses to "exported"
    await db.transaction(async (tx) => {
      const ids = list.map((item) => item.id);
      await tx
        .update(applications)
        .set({
          status: "exported",
          exportedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(inArray(applications.id, ids));
    });

    await recordAuditLog(
      "EXPORT_RANKING",
      `ส่งออกไฟล์ Excel รายงานผลการจัดอันดับสำเร็จ จำนวน ${list.length} คน`
    );

    revalidatePath("/admin/workflow");
    revalidatePath("/admin");

    return {
      success: true,
      data: base64,
    };
  } catch (error: unknown) {
    console.error("Export Excel error:", error);
    const errorMsg = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการส่งออกไฟล์ Excel";
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Resets the entire system workflow status to let admins redo the review and ranking
 * for testing or corrections.
 */
export async function resetWorkflowAction() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized access.");
  }

  try {
    await db.transaction(async (tx) => {
      // Revert applications with ranked/exported status back to approved
      await tx
        .update(applications)
        .set({
          status: "approved",
          rankedAt: null,
          exportedAt: null,
          updatedAt: new Date(),
        })
        .where(inArray(applications.status, ["ranked", "exported"]));

      const settings = {
        isRegistrationClosed: false,
        isRanked: false,
      };
      saveSystemSettings(settings);
    });

    await recordAuditLog(
      "RESET_WORKFLOW",
      "รีเซ็ตขั้นตอนการทำงานของระบบ (Reset Workflow) เพื่อเปิดระบบรับสมัครหรือจัดอันดับใหม่"
    );

    revalidatePath("/admin/workflow");
    revalidatePath("/admin");
    revalidatePath("/apply");

    return { success: true, settings: getSystemSettings() };
  } catch (error: unknown) {
    console.error("Reset workflow error:", error);
    const errorMsg = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการรีเซ็ตสถานะระบบ";
    return { success: false, error: errorMsg };
  }
}
