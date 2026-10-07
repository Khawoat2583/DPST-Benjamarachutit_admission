"use server";

import { env } from "@/server/env";
import { setAdminSession, destroyAdminSession, getAdminSession } from "@/server/auth/admin-session";
import { db } from "@/db";
import { applications, courseGrades } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  getClientIp,
  checkRateLimit,
  incrementFailedAttempts,
  resetFailedAttempts,
  recordAuditLog,
  safeStrEqual,
} from "@/server/auth/security";

/**
 * Validates admin credentials and sets encrypted admin session cookie.
 * Artificially delays failure response to mitigate automated brute force timing attacks.
 */
export async function adminLoginAction(prevState: unknown, formData: FormData) {
  const username = formData.get("username") as string | null;
  const password = formData.get("password") as string | null;

  if (!username || !password) {
    return { success: false, error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" };
  }

  const ipAddress = await getClientIp();

  try {
    // Check rate limit / brute force protection
    await checkRateLimit(ipAddress);
  } catch (rateLimitError: unknown) {
    const errorMsg = rateLimitError instanceof Error ? rateLimitError.message : "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์";
    return { success: false, error: errorMsg };
  }

  // Constant-time comparison against secure environment variables.
  // Both checks always run (no short-circuit) to avoid leaking which field was wrong.
  const validUsername = safeStrEqual(username, env.ADMIN_USERNAME);
  const validPassword = safeStrEqual(password, env.ADMIN_PASSWORD);
  if (!validUsername || !validPassword) {
    const { attempts, blockedUntil } = await incrementFailedAttempts(ipAddress);
    await recordAuditLog(
      "LOGIN_FAILED",
      `พยายามเข้าสู่ระบบไม่สำเร็จด้วยชื่อผู้ใช้: ${username} (ครั้งที่ ${attempts}${blockedUntil ? " - ถูกบล็อกชั่วคราว" : ""})`
    );

    // Artificially delay to slow down password spraying
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
  }

  await resetFailedAttempts(ipAddress);

  // Issue secure HTTP-Only admin session cookie
  await setAdminSession({ username, role: "admin" });

  await recordAuditLog("LOGIN_SUCCESS", `เจ้าหน้าที่เข้าสู่ระบบสำเร็จ (${username})`);

  return { success: true };
}

/**
 * Destroys current secure admin session cookie.
 */
export async function adminLogoutAction() {
  const session = await getAdminSession();
  if (session) {
    await recordAuditLog("LOGOUT", `เจ้าหน้าที่ออกจากระบบ (${session.username})`);
  }
  await destroyAdminSession();
  return { success: true };
}

/**
 * Interface for incoming course grade edits
 */
interface GradeEditInput {
  id: number;
  credit: string;
  grade: string;
  courseCode: string;
  courseName: string;
}

/**
 * Updates individual course grades and application computed grade summaries within a SQL Transaction.
 * Strictly checks for admin authorization first.
 */
export async function updateApplicationGradesAction(
  applicationId: number,
  gradeEdits: GradeEditInput[],
  calculatedGpas: {
    gpax: string;
    mathGpa: string;
    scienceGpa: string;
    englishGpa: string;
  }
) {
  // 1. Authorize Admin Session
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized access. Admin privileges required.");
  }

  try {
    // 2. Run inside transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // A. Update individual course grade items
      for (const edit of gradeEdits) {
        await tx
          .update(courseGrades)
          .set({
            credit: edit.credit,
            grade: edit.grade,
            courseCode: edit.courseCode,
            courseName: edit.courseName,
            updatedAt: new Date(),
          })
          .where(eq(courseGrades.id, edit.id));
      }

      // B. Update computed cumulative GPA averages in applications table
      await tx
        .update(applications)
        .set({
          gpax: calculatedGpas.gpax,
          mathGpa: calculatedGpas.mathGpa,
          scienceGpa: calculatedGpas.scienceGpa,
          englishGpa: calculatedGpas.englishGpa,
          updatedAt: new Date(),
        })
        .where(eq(applications.id, applicationId));
    });

    // 3. Record Audit Log for grade update
    await recordAuditLog(
      "UPDATE_GRADES",
      `แก้ไขคะแนน/ผลการเรียนของใบสมัคร ID: ${applicationId}. GPAX: ${calculatedGpas.gpax}, คณิต: ${calculatedGpas.mathGpa}, วิทย์: ${calculatedGpas.scienceGpa}, อังกฤษ: ${calculatedGpas.englishGpa}`
    );

    revalidatePath(`/admin/review/${applicationId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating application grades:", error);
    const errorMsg = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกคะแนน";
    return { success: false, error: errorMsg };
  }
}

/**
 * Approves applicant application.
 * Changes status to 'approved' and stamps reviewedAt.
 */
export async function approveApplicationAction(applicationId: number) {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized access.");
  }

  try {
    await db
      .update(applications)
      .set({
        status: "approved",
        rejectionReason: null, // Clear any previous rejection reason
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(applications.id, applicationId));

    // Record Audit Log
    await recordAuditLog(
      "APPROVE_APPLICATION",
      `อนุมัติใบสมัคร ID: ${applicationId} สำเร็จ`
    );

    revalidatePath(`/admin/review/${applicationId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error approving application:", error);
    const errorMsg = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอนุมัติใบสมัคร";
    return { success: false, error: errorMsg };
  }
}

/**
 * Rejects applicant application for correction.
 * Sets status to 'rejected', stamps reviewedAt, and attaches rejectionReason.
 */
export async function rejectApplicationAction(applicationId: number, reason: string) {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized access.");
  }

  if (!reason.trim()) {
    return { success: false, error: "กรุณาระบุเหตุผลการส่งกลับแก้ไข" };
  }

  try {
    await db
      .update(applications)
      .set({
        status: "rejected",
        rejectionReason: reason,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(applications.id, applicationId));

    // Record Audit Log
    await recordAuditLog(
      "REJECT_APPLICATION",
      `ส่งใบสมัคร ID: ${applicationId} กลับไปแก้ไขด้วยเหตุผล: ${reason}`
    );

    revalidatePath(`/admin/review/${applicationId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error rejecting application:", error);
    const errorMsg = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการปฏิเสธใบสมัคร";
    return { success: false, error: errorMsg };
  }
}
