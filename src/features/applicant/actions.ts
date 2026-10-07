"use server";

import { db } from "@/db";
import { applications, courseGrades } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  applicationFormSchema,
  calculateAndVerifyGpas,
  validateThaiNationalId,
} from "./validation";
import {
  getSession,
  setSession,
  refreshSession,
  destroySession,
} from "@/server/auth/session";
import { getSystemSettings } from "@/lib/system-settings";
import {
  getClientIp,
  checkRateLimit,
  incrementFailedAttempts,
  resetFailedAttempts,
  hashPassword,
  verifyPassword,
  generateNumericPin,
  needsPasswordRehash,
} from "@/server/auth/security";
import { sendResetPinEmail } from "@/server/utils/email";
import { checkInMemoryRateLimit } from "@/server/rate-limit";

function parseDatabaseError(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    const errMsg = error.message || "";
    
    // 1. Unique Constraints
    if (errMsg.includes("applications_announcement_order_unique") || errMsg.includes("announcement_order")) {
      return "ลำดับประกาศผลสอบรอบแรกนี้ถูกใช้งานในระบบแล้ว กรุณาตรวจสอบเลขลำดับที่ถูกต้องของคุณจากประกาศผลสอบรอบแรก";
    }
    if (errMsg.includes("applications_national_id_unique") || errMsg.includes("national_id")) {
      return "เลขประจำตัวประชาชนนี้มีอยู่ในระบบแล้ว หากคุณเคยลงทะเบียนแล้วกรุณาเข้าสู่ระบบด้วยเลขประจำตัวประชาชนเพื่อเข้าใช้งาน";
    }
    
    // 2. Value Too Long (String limit exceeded)
    if (errMsg.includes("value too long") || errMsg.includes("character varying")) {
      if (errMsg.includes("address_zipcode")) {
        return "รหัสไปรษณีย์ต้องมีความยาวไม่เกิน 5 หลัก กรุณาตรวจสอบอีกครั้ง";
      }
      if (errMsg.includes("phone") || errMsg.includes("guardian_phone")) {
        return "เบอร์โทรศัพท์ติดต่อมีความยาวเกินกำหนด (สูงสุด 20 อักขระ) กรุณาตรวจสอบและเว้นช่องว่างหรืออักขระพิเศษออก";
      }
      if (errMsg.includes("national_id")) {
        return "เลขประจำตัวประชาชนต้องมีความยาว 13 หลักพอดี กรุณาตรวจสอบอีกครั้ง";
      }
      return "มีข้อมูลบางช่องที่คุณกรอกมีความยาวเกินขอบเขตจำกัดของระบบ กรุณาตรวจสอบความยาวของข้อมูลที่กรอกอีกครั้ง";
    }

    // 3. Numeric Overflow / Value Out of Range
    if (errMsg.includes("numeric field overflow") || errMsg.includes("out of range")) {
      return "ตัวเลขคะแนน เกรดเฉลี่ย หรือหน่วยกิตรายวิชาที่คุณกรอกมีค่าเกินขอบเขตปกติ (เช่น เกรดเฉลี่ยสูงสุดคือ 4.00) กรุณาตรวจสอบอีกครั้ง";
    }

    // 4. Foreign Key Constraints (References invalid/deleted parent)
    if (errMsg.includes("violates foreign key constraint")) {
      return "ระบบตรวจไม่พบข้อมูลอ้างอิงใบสมัครที่ถูกต้องในฐานข้อมูล เซสชันของคุณอาจจะหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง";
    }

    // 5. Not-Null Constraints (Missing required fields)
    if (errMsg.includes("violates not-null constraint") || errMsg.includes("null value in column")) {
      return "กรุณากรอกข้อมูลในทุกช่องที่จำเป็นให้ครบถ้วนก่อนบันทึกข้อมูล";
    }

    // 6. DB Connection / Timeout Errors
    if (
      errMsg.includes("ECONNREFUSED") ||
      errMsg.includes("connection") ||
      errMsg.includes("timeout") ||
      errMsg.includes("deadlock")
    ) {
      return "การเชื่อมต่อฐานข้อมูลขัดข้องหรือหมดเวลาชั่วคราว กรุณาเว้นช่วงเวลาสักครู่แล้วลองกดส่งข้อมูลใหม่อีกครั้ง";
    }
    
    return errMsg;
  }
  return defaultMessage;
}

function mapApplicationForClient(app: {
  grades: { credit: string; grade: string; [key: string]: unknown }[];
  gpax: string | null;
  mathGpa: string | null;
  scienceGpa: string | null;
  englishGpa: string | null;
  [key: string]: unknown;
}) {
  return {
    ...app,
    gpax: app.gpax ? parseFloat(app.gpax) : null,
    mathGpa: app.mathGpa ? parseFloat(app.mathGpa) : null,
    scienceGpa: app.scienceGpa ? parseFloat(app.scienceGpa) : null,
    englishGpa: app.englishGpa ? parseFloat(app.englishGpa) : null,
    submittedAt: app.submittedAt instanceof Date ? app.submittedAt.toISOString() : app.submittedAt,
    reviewedAt: app.reviewedAt instanceof Date ? app.reviewedAt.toISOString() : app.reviewedAt,
    rankedAt: app.rankedAt instanceof Date ? app.rankedAt.toISOString() : app.rankedAt,
    exportedAt: app.exportedAt instanceof Date ? app.exportedAt.toISOString() : app.exportedAt,
    createdAt: app.createdAt instanceof Date ? app.createdAt.toISOString() : app.createdAt,
    updatedAt: app.updatedAt instanceof Date ? app.updatedAt.toISOString() : app.updatedAt,
    grades: app.grades.map((g) => ({
      ...g,
      credit: parseFloat(g.credit),
      grade: parseFloat(g.grade),
    })),
  };
}

async function findOrCreateDraftApplication(nationalId: string) {
  let app = await db.query.applications.findFirst({
    where: eq(applications.nationalId, nationalId),
  });

  if (!app) {
    const [created] = await db
      .insert(applications)
      .values({
        nationalId,
        status: "draft",
        title: "",
        firstName: "",
        lastName: "",
        announcementOrder: null,
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

  return app;
}

/**
 * Validates and logs in an applicant using their 13-digit National ID and password.
 */
export async function loginApplicant(nationalId: string, password?: string) {
  if (!validateThaiNationalId(nationalId)) {
    return {
      success: false,
      error: "เลขประจำตัวประชาชนไม่ถูกต้องตามรูปแบบของกระทรวงมหาดไทย",
    };
  }

  // 1. Rate Limiting Check
  const ipAddress = await getClientIp();
  try {
    await checkRateLimit(ipAddress);
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "คุณถูกบล็อกการเข้าสู่ระบบชั่วคราว",
    };
  }

  // 2. Find the existing application
  const existingApp = await db.query.applications.findFirst({
    where: eq(applications.nationalId, nationalId),
    with: {
      grades: true,
      attachments: true,
    },
  });

  if (!existingApp) {
    return {
      success: false,
      error: "ไม่พบเลขประจำตัวประชาชนนี้ในระบบ กรุณาลงทะเบียนสมัครใหม่",
    };
  }

  // 3. Check for Legacy Account (no password set yet)
  if (!existingApp.passwordHash) {
    return {
      success: true,
      isLegacy: true,
      nationalId,
    };
  }

  // 4. Verify password
  if (!password) {
    return {
      success: false,
      error: "กรุณากรอกรหัสผ่าน",
    };
  }

  const isPasswordValid = verifyPassword(password, existingApp.passwordHash);
  if (!isPasswordValid) {
    const { blockedUntil } = await incrementFailedAttempts(ipAddress);
    if (blockedUntil) {
      return {
        success: false,
        error: "คุณกรอกรหัสผ่านผิดเกินกำหนด ระบบระงับการใช้งาน IP ของคุณชั่วคราวเป็นเวลา 15 นาที",
      };
    }
    return {
      success: false,
      error: "รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
    };
  }

  // Success: reset attempts and set session
  await resetFailedAttempts(ipAddress);
  await setSession({ nationalId });

  // Opportunistically upgrade legacy / low-iteration password hashes.
  if (existingApp.passwordHash && needsPasswordRehash(existingApp.passwordHash)) {
    try {
      await db
        .update(applications)
        .set({ passwordHash: hashPassword(password) })
        .where(eq(applications.id, existingApp.id));
    } catch {
      // Non-fatal: login still succeeds even if the rehash write fails.
    }
  }

  const isLocked = ["ranked", "exported"].includes(existingApp.status);
  return {
    success: true,
    isNew: false,
    isLocked,
    isLegacy: false,
    application: mapApplicationForClient(existingApp),
  };
}

/**
 * Registers a new candidate and pre-creates their draft application.
 */
export async function registerApplicant(input: {
  nationalId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  password?: string;
}) {
  if (!validateThaiNationalId(input.nationalId)) {
    return {
      success: false,
      error: "เลขประจำตัวประชาชนไม่ถูกต้องตามรูปแบบของกระทรวงมหาดไทย",
    };
  }

  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return {
      success: false,
      error: "กรุณากรอกอีเมลให้ถูกต้องตามรูปแบบ",
    };
  }

  if (!input.password || input.password.length < 8) {
    return {
      success: false,
      error: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร",
    };
  }

  // Check if nationalId already exists
  const existing = await db.query.applications.findFirst({
    where: eq(applications.nationalId, input.nationalId),
  });

  if (existing) {
    return {
      success: false,
      error: "เลขประจำตัวประชาชนนี้มีอยู่ในระบบแล้ว กรุณาเข้าสู่ระบบ",
    };
  }

  const hashedPassword = hashPassword(input.password);

  try {
    const [created] = await db
      .insert(applications)
      .values({
        nationalId: input.nationalId,
        email: input.email,
        firstName: (input.firstName || "").trim(),
        lastName: (input.lastName || "").trim(),
        passwordHash: hashedPassword,
        status: "draft",
        title: "",
        announcementOrder: null,
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

    await setSession({ nationalId: input.nationalId });

    const draftWithRelations = await db.query.applications.findFirst({
      where: eq(applications.id, created.id),
      with: { grades: true, attachments: true },
    });

    return {
      success: true,
      isNew: true,
      isLocked: false,
      application: draftWithRelations ? mapApplicationForClient(draftWithRelations) : null,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: parseDatabaseError(error, "ลงทะเบียนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"),
    };
  }
}

/**
 * Claims a legacy account by setting a password for the first time.
 */
export async function claimLegacyAccount(nationalId: string, password?: string) {
  if (!password || password.length < 8) {
    return {
      success: false,
      error: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร",
    };
  }

  const existingApp = await db.query.applications.findFirst({
    where: eq(applications.nationalId, nationalId),
  });

  if (!existingApp) {
    return {
      success: false,
      error: "ไม่พบข้อมูลผู้สมัครในระบบ",
    };
  }

  if (existingApp.passwordHash) {
    return {
      success: false,
      error: "บัญชีนี้มีการตั้งรหัสผ่านไว้แล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านหลัก",
    };
  }

  const hashedPassword = hashPassword(password);
  await db
    .update(applications)
    .set({ passwordHash: hashedPassword, updatedAt: new Date() })
    .where(eq(applications.nationalId, nationalId));

  await setSession({ nationalId });

  const appWithRelations = await db.query.applications.findFirst({
    where: eq(applications.id, existingApp.id),
    with: { grades: true, attachments: true },
  });

  const isLocked = ["ranked", "exported"].includes(existingApp.status);

  return {
    success: true,
    isNew: false,
    isLocked,
    application: appWithRelations ? mapApplicationForClient(appWithRelations) : null,
  };
}

/**
 * Requests a 6-digit reset PIN to be logged / sent to the candidate's email.
 */
export async function requestPasswordResetPin(nationalId: string, email: string) {
  if (!validateThaiNationalId(nationalId)) {
    return {
      success: false,
      error: "เลขประจำตัวประชาชนไม่ถูกต้องตามรูปแบบของกระทรวงมหาดไทย",
    };
  }

  // Throttle: an IP already blocked for abusive attempts cannot keep requesting PINs.
  const ipAddress = await getClientIp();
  try {
    await checkRateLimit(ipAddress);
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "คุณส่งคำขอบ่อยเกินไป กรุณาลองใหม่ภายหลัง",
    };
  }

  const app = await db.query.applications.findFirst({
    where: eq(applications.nationalId, nationalId),
  });

  if (!app) {
    return {
      success: false,
      error: "ไม่พบเลขประจำตัวประชาชนนี้ในระบบ",
    };
  }

  if (!app.email || app.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
    return {
      success: false,
      error: "อีเมลไม่ตรงกับข้อมูลในระบบ กรุณาตรวจสอบและกรอกใหม่อีกครั้ง",
    };
  }

  const pin = generateNumericPin();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

  await db
    .update(applications)
    .set({
      resetPin: hashPassword(pin), // store a hash; the plaintext PIN is only emailed
      resetPinExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, app.id));

  // Send email using Resend (falls back to console if API key is not configured)
  try {
    await sendResetPinEmail(email, pin);
  } catch (err) {
    console.error("Failed to send reset PIN email via Resend, console fallback is active:", err);
  }

  return {
    success: true,
    message: "ระบบได้ส่งรหัส PIN ไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบในกล่องจดหมาย",
  };
}

/**
 * Verifies if the reset PIN is valid and not expired.
 */
export async function verifyResetPin(input: {
  nationalId: string;
  pin: string;
}) {
  if (!input.pin || input.pin.length !== 6) {
    return {
      success: false,
      error: "รหัส PIN ต้องมีความยาว 6 หลัก",
    };
  }

  // Brute-force protection: block the IP after repeated wrong PIN attempts.
  const ipAddress = await getClientIp();
  try {
    await checkRateLimit(ipAddress);
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "พยายามกรอกรหัส PIN ผิดบ่อยเกินไป กรุณาลองใหม่ภายหลัง",
    };
  }

  const app = await db.query.applications.findFirst({
    where: eq(applications.nationalId, input.nationalId),
  });

  if (!app || !app.resetPin || !app.resetPinExpiresAt) {
    await incrementFailedAttempts(ipAddress);
    return {
      success: false,
      error: "รหัส PIN ไม่ถูกต้องหรือยังไม่ได้ทำการร้องขอรหัสใหม่",
    };
  }

  const now = new Date();
  if (now > new Date(app.resetPinExpiresAt)) {
    return {
      success: false,
      error: "รหัส PIN นี้หมดอายุแล้ว กรุณาทำการร้องขอรหัสใหม่อีกครั้ง",
    };
  }

  if (!verifyPassword(input.pin, app.resetPin)) {
    await incrementFailedAttempts(ipAddress);
    return {
      success: false,
      error: "รหัส PIN ไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง",
    };
  }

  await resetFailedAttempts(ipAddress);
  return {
    success: true,
  };
}

/**
 * Resets candidate password using the 6-digit OTP PIN.
 */
export async function resetPasswordWithPin(input: {
  nationalId: string;
  pin: string;
  password?: string;
}) {
  if (!input.pin || input.pin.length !== 6) {
    return {
      success: false,
      error: "รหัส PIN ต้องมีความยาว 6 หลัก",
    };
  }

  if (!input.password || input.password.length < 8) {
    return {
      success: false,
      error: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร",
    };
  }

  // Brute-force protection: block the IP after repeated wrong PIN attempts.
  const ipAddress = await getClientIp();
  try {
    await checkRateLimit(ipAddress);
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "พยายามกรอกรหัส PIN ผิดบ่อยเกินไป กรุณาลองใหม่ภายหลัง",
    };
  }

  const app = await db.query.applications.findFirst({
    where: eq(applications.nationalId, input.nationalId),
  });

  if (!app || !app.resetPin || !app.resetPinExpiresAt) {
    await incrementFailedAttempts(ipAddress);
    return {
      success: false,
      error: "รหัส PIN ไม่ถูกต้องหรือยังไม่ได้ทำการร้องขอรหัสใหม่",
    };
  }

  const now = new Date();
  if (now > new Date(app.resetPinExpiresAt)) {
    return {
      success: false,
      error: "รหัส PIN นี้หมดอายุแล้ว กรุณาทำการร้องขอรหัสใหม่อีกครั้ง",
    };
  }

  if (!verifyPassword(input.pin, app.resetPin)) {
    await incrementFailedAttempts(ipAddress);
    return {
      success: false,
      error: "รหัส PIN ไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง",
    };
  }

  await resetFailedAttempts(ipAddress);
  const hashedPassword = hashPassword(input.password);

  await db
    .update(applications)
    .set({
      passwordHash: hashedPassword,
      resetPin: null,
      resetPinExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, app.id));

  return {
    success: true,
    message: "เปลี่ยนรหัสผ่านสำเร็จแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่",
  };
}

/**
 * Restores applicant session from httpOnly cookie (survives page refresh).
 */
export async function restoreApplicantSession() {
  const session = await getSession();
  if (!session) {
    return { success: false as const, loggedIn: false as const };
  }

  await refreshSession({ nationalId: session.nationalId });

  const existingApp = await db.query.applications.findFirst({
    where: eq(applications.nationalId, session.nationalId),
    with: { grades: true, attachments: true },
  });

  if (!existingApp) {
    return {
      success: true as const,
      loggedIn: true as const,
      nationalId: session.nationalId,
      isLocked: false,
      application: null,
    };
  }

  const isLocked = ["ranked", "exported"].includes(existingApp.status);

  return {
    success: true as const,
    loggedIn: true as const,
    nationalId: session.nationalId,
    isLocked,
    application: mapApplicationForClient(existingApp),
  };
}

export type SaveDraftInput = {
  step?: number;
  personal?: {
    title?: string;
    firstName?: string;
    lastName?: string;
    announcementOrder?: string | number;
  };
  contactAddress?: Record<string, string | undefined>;
  school?: { schoolName?: string; schoolProvince?: string };
  gpaxInput?: string;
  grades?: Array<{
    semester: number;
    courseCode?: string;
    credit?: number | string;
    grade?: number | string;
    subjectGroup?: string;
    courseName?: string;
  }>;
};

type LooseGradeInput = {
  semester?: string | number;
  courseCode?: string;
  credit?: string | number;
  grade?: string | number;
};

/**
 * Persists in-progress form data as draft (no full validation). Survives refresh.
 */
export async function saveApplicationDraft(input: SaveDraftInput) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง" };
  }

  const settings = getSystemSettings();
  if (settings.isRegistrationClosed) {
    return { success: false, error: "ระบบรับสมัครปิดทำการแล้ว ไม่สามารถบันทึกข้อมูลแบบร่างได้" };
  }

  try {
    const app = await findOrCreateDraftApplication(session.nationalId);

    if (["ranked", "exported"].includes(app.status)) {
      return { success: false, error: "ใบสมัครถูกล็อกแล้ว ไม่สามารถบันทึกแบบร่างได้" };
    }

    const patch: Record<string, unknown> = {
      status: app.status === "submitted" || app.status === "approved" || app.status === "rejected"
        ? app.status
        : "draft",
      updatedAt: new Date(),
    };

    if (input.personal) {
      if (input.personal.title !== undefined) patch.title = input.personal.title;
      if (input.personal.firstName) patch.firstName = input.personal.firstName;
      if (input.personal.lastName) patch.lastName = input.personal.lastName;
      if (input.personal.announcementOrder) {
        const order =
          typeof input.personal.announcementOrder === "string"
            ? parseInt(input.personal.announcementOrder, 10)
            : input.personal.announcementOrder;
        if (!isNaN(order) && order > 0) patch.announcementOrder = order;
      }
    }

    if (input.contactAddress) {
      const c = input.contactAddress;
      if (c.email !== undefined) patch.email = c.email || null;
      if (c.phone) patch.phone = c.phone;
      if (c.guardianPhone) patch.guardianPhone = c.guardianPhone;
      if (c.addressNo) patch.addressNo = c.addressNo;
      if (c.addressMoo !== undefined) patch.addressMoo = c.addressMoo || null;
      if (c.addressSoi !== undefined) patch.addressSoi = c.addressSoi || null;
      if (c.addressRoad !== undefined) patch.addressRoad = c.addressRoad || null;
      if (c.addressSubdistrict) patch.addressSubdistrict = c.addressSubdistrict;
      if (c.addressDistrict) patch.addressDistrict = c.addressDistrict;
      if (c.addressProvince) patch.addressProvince = c.addressProvince;
      if (c.addressZipcode) patch.addressZipcode = c.addressZipcode;
    }

    if (input.school) {
      if (input.school.schoolName) patch.schoolName = input.school.schoolName;
      if (input.school.schoolProvince) patch.schoolProvince = input.school.schoolProvince;
    }

    if (input.gpaxInput && input.gpaxInput !== "" && !isNaN(parseFloat(input.gpaxInput))) {
      patch.gpax = parseFloat(input.gpaxInput).toFixed(2);
    }

    await db
      .update(applications)
      .set(patch as typeof applications.$inferInsert)
      .where(eq(applications.id, app.id));

    if (input.grades && input.grades.length > 0) {
      const gradeValues = input.grades
        .filter((g) => (g.courseCode || "").trim() !== "")
        .map((g) => {
          const courseCode = (g.courseCode || "").trim().toUpperCase();
          const firstChar = courseCode.charAt(0);
          let subjectGroup = g.subjectGroup || "math";
          let courseName = g.courseName || `วิชาพื้นฐาน (${courseCode})`;
          if (firstChar === "ค") {
            subjectGroup = "math";
            courseName = `วิชาคณิตศาสตร์พื้นฐาน (${courseCode})`;
          } else if (firstChar === "ว") {
            subjectGroup = "science";
            courseName = `วิชาวิทยาศาสตร์พื้นฐาน (${courseCode})`;
          } else if (firstChar === "อ") {
            subjectGroup = "english";
            courseName = `วิชาภาษาอังกฤษพื้นฐาน (${courseCode})`;
          }

          return {
            applicationId: app.id,
            subjectGroup: subjectGroup as "math" | "science" | "english",
            semester: typeof g.semester === "string" ? parseInt(g.semester, 10) : g.semester,
            courseCode,
            courseName,
            credit: String(g.credit !== "" && g.credit != null ? g.credit : 0),
            grade: String(g.grade !== "" && g.grade != null ? g.grade : 0),
          };
        });

      if (gradeValues.length > 0) {
        await db.delete(courseGrades).where(eq(courseGrades.applicationId, app.id));
        await db.insert(courseGrades).values(gradeValues);
      }
    }

    await refreshSession({ nationalId: session.nationalId });

    return { success: true, savedAt: new Date().toISOString() };
  } catch (error: unknown) {
    const message = parseDatabaseError(error, "บันทึกแบบร่างไม่สำเร็จ");
    return { success: false, error: message };
  }
}

/**
 * Logs out the applicant and clears their session cookie
 */
export async function logoutApplicant() {
  await destroySession();
  return { success: true };
}

/**
 * Handles the creation or update of an application.
 * Runs complete Zod validation, calculates and asserts minimum GPA criteria,
 * and executes database operations inside a single secure SQL Transaction.
 */
export async function submitOrUpdateApplication(input: unknown) {
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบด้วยเลขบัตรประชาชนใหม่อีกครั้ง",
    };
  }

  const settings = getSystemSettings();
  if (settings.isRegistrationClosed) {
    return {
      success: false,
      error: "ระบบรับสมัครปิดทำการแล้ว ไม่สามารถยื่นหรือแก้ไขใบสมัครได้",
    };
  }

  // 1. Process and Map Dynamic Form Input
  const rawInput =
    typeof input === "object" && input !== null
      ? (input as Record<string, unknown>)
      : {};
  const rawGrades = Array.isArray(rawInput.grades) ? rawInput.grades : [];
  const mappedGrades = rawGrades.map((row): LooseGradeInput => {
    if (typeof row === "object" && row !== null) {
      return row as LooseGradeInput;
    }
    return {};
  }).map((g) => {
    const courseCode = (g.courseCode || "").trim().toUpperCase();
    const firstChar = courseCode.charAt(0);
    
    // Auto-map subjectGroup and courseName
    let subjectGroup = "";
    let courseName = "";
    if (firstChar === "ค") {
      subjectGroup = "math";
      courseName = `วิชาคณิตศาสตร์พื้นฐาน (${courseCode})`;
    } else if (firstChar === "ว") {
      subjectGroup = "science";
      courseName = `วิชาวิทยาศาสตร์พื้นฐาน (${courseCode})`;
    } else if (firstChar === "อ") {
      subjectGroup = "english";
      courseName = `วิชาภาษาอังกฤษพื้นฐาน (${courseCode})`;
    } else {
      // Fallback values for invalid code to let Zod handle validation messages properly
      subjectGroup = "math";
      courseName = `วิชาพื้นฐาน (${courseCode})`;
    }

    return {
      semester: typeof g.semester === "string" ? parseInt(g.semester, 10) : g.semester,
      courseCode,
      credit: typeof g.credit === "string" ? parseFloat(g.credit) : g.credit,
      grade: typeof g.grade === "string" ? parseFloat(g.grade) : g.grade,
      subjectGroup,
      courseName,
    };
  });

  const processedInput = {
    ...rawInput,
    gpax: typeof rawInput.gpax === "string" ? parseFloat(rawInput.gpax) : rawInput.gpax,
    announcementOrder:
      typeof rawInput.announcementOrder === "string"
        ? parseInt(rawInput.announcementOrder, 10)
        : rawInput.announcementOrder,
    grades: mappedGrades,
  };

  // 1. Validate Form Input with Zod
  const result = applicationFormSchema.safeParse(processedInput);
  if (!result.success) {
    const errorMsgs = result.error.issues.map((e) => e.message);
    return {
      success: false,
      error: "ข้อมูลไม่สมบูรณ์หรือรูปแบบผิดพลาด: " + errorMsgs.join(", "),
    };
  }

  const data = result.data;

  // Security check: Check session matches input national ID
  if (session.nationalId !== data.nationalId) {
    return {
      success: false,
      error: "ข้อมูลประจำตัวไม่ถูกต้อง เซสชันไม่ตรงกับเลขบัตรประชาชนที่ส่งมา",
    };
  }

  // 2. Perform GPA and Minimum Requirements Verification
  const gpaResult = calculateAndVerifyGpas(data.gpax, data.grades);
  if (!gpaResult.isEligible) {
    return {
      success: false,
      error: "คุณสมบัติไม่ผ่านเกณฑ์ขั้นต่ำ: " + gpaResult.errors.join(" | "),
      errors: gpaResult.errors,
    };
  }

  try {
    // 3. DB Transaction execution
    const updatedApplication = await db.transaction(async (tx) => {
      // Find if record already exists
      const existing = await tx.query.applications.findFirst({
        where: eq(applications.nationalId, data.nationalId),
      });

      let appId: number;

      if (existing) {
        // Prevent editing if the application is locked
        if (["ranked", "exported"].includes(existing.status)) {
          throw new Error("ใบสมัครถูกล็อกชั่วคราวแล้ว ไม่สามารถบันทึกแก้ไขข้อมูลได้");
        }

        appId = existing.id;

        // Determine next status: draft/rejected/approved -> submitted on save
        const nextStatus = (existing.status === "rejected" || existing.status === "draft" || existing.status === "approved") ? "submitted" : existing.status;

        // Update main application record
        await tx
          .update(applications)
          .set({
            status: nextStatus,
            title: data.title,
            firstName: data.firstName,
            lastName: data.lastName,
            announcementOrder: data.announcementOrder,
            email: data.email || null,
            phone: data.phone,
            guardianPhone: data.guardianPhone,
            addressNo: data.addressNo,
            addressMoo: data.addressMoo || null,
            addressSoi: data.addressSoi || null,
            addressRoad: data.addressRoad || null,
            addressSubdistrict: data.addressSubdistrict,
            addressDistrict: data.addressDistrict,
            addressProvince: data.addressProvince,
            addressZipcode: data.addressZipcode,
            schoolName: data.schoolName,
            schoolProvince: data.schoolProvince,
            gpax: gpaResult.gpax.toString(),
            mathGpa: gpaResult.mathGpa.toString(),
            scienceGpa: gpaResult.scienceGpa.toString(),
            englishGpa: gpaResult.englishGpa.toString(),
            submittedAt: (existing.status === "draft" || existing.status === "rejected" || existing.status === "approved") ? new Date() : undefined,
            rejectionReason: existing.status === "rejected" ? null : undefined,
            updatedAt: new Date(),
          })
          .where(eq(applications.id, appId));

        // Delete old grades
        await tx.delete(courseGrades).where(eq(courseGrades.applicationId, appId));
      } else {
        // Insert new application
        const [inserted] = await tx
          .insert(applications)
          .values({
            status: "submitted",
            nationalId: data.nationalId,
            title: data.title,
            firstName: data.firstName,
            lastName: data.lastName,
            announcementOrder: data.announcementOrder,
            email: data.email || null,
            phone: data.phone,
            guardianPhone: data.guardianPhone,
            addressNo: data.addressNo,
            addressMoo: data.addressMoo || null,
            addressSoi: data.addressSoi || null,
            addressRoad: data.addressRoad || null,
            addressSubdistrict: data.addressSubdistrict,
            addressDistrict: data.addressDistrict,
            addressProvince: data.addressProvince,
            addressZipcode: data.addressZipcode,
            schoolName: data.schoolName,
            schoolProvince: data.schoolProvince,
            gpax: gpaResult.gpax.toString(),
            mathGpa: gpaResult.mathGpa.toString(),
            scienceGpa: gpaResult.scienceGpa.toString(),
            englishGpa: gpaResult.englishGpa.toString(),
          })
          .returning();
        
        appId = inserted.id;
      }

      // Insert 15 course grades
      const gradeValues = data.grades.map((g) => ({
        applicationId: appId,
        subjectGroup: g.subjectGroup,
        semester: g.semester,
        courseCode: g.courseCode,
        courseName: g.courseName,
        credit: g.credit.toString(),
        grade: g.grade.toString(),
      }));

      await tx.insert(courseGrades).values(gradeValues);

      return appId;
    });

    return {
      success: true,
      applicationId: updatedApplication,
      message: "บันทึกและส่งข้อมูลใบสมัครเรียบร้อยแล้ว",
    };
  } catch (error: unknown) {
    const message = parseDatabaseError(error, "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Retrieves the status detail of an application by National ID.
 * Doesn't require active session to search, but logs out full details only if authorized.
 */
export async function getApplicationStatus(nationalId: string) {
  if (!validateThaiNationalId(nationalId)) {
    return {
      success: false,
      error: "เลขประจำตัวประชาชนไม่ถูกต้องตามรูปแบบของกระทรวงมหาดไทย",
    };
  }

  // Public, unauthenticated lookup returns PII — throttle per IP to deter
  // bulk scraping of the applicant database (lenient enough for real users).
  const ipAddress = await getClientIp();
  if (!checkInMemoryRateLimit(`status:${ipAddress}`, 30, 5 * 60 * 1000)) {
    return {
      success: false,
      error: "มีการตรวจสอบสถานะบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง",
    };
  }

  const app = await db.query.applications.findFirst({
    where: eq(applications.nationalId, nationalId),
    with: {
      attachments: true,
    },
  });

  if (!app) {
    return {
      success: false,
      error: "ไม่พบข้อมูลการสมัครของเลขประจำตัวประชาชนนี้ในระบบ",
    };
  }

  return {
    success: true,
    status: app.status,
    firstName: app.firstName,
    lastName: app.lastName,
    title: app.title,
    announcementOrder: app.announcementOrder,
    schoolName: app.schoolName,
    schoolProvince: app.schoolProvince,
    rejectionReason: app.rejectionReason || null,
    gpax: app.gpax ? parseFloat(app.gpax) : null,
    mathGpa: app.mathGpa ? parseFloat(app.mathGpa) : null,
    scienceGpa: app.scienceGpa ? parseFloat(app.scienceGpa) : null,
    englishGpa: app.englishGpa ? parseFloat(app.englishGpa) : null,
    submittedAt: app.submittedAt?.toISOString() || app.createdAt.toISOString(),
    reviewedAt: app.reviewedAt?.toISOString() || null,
    rankedAt: app.rankedAt?.toISOString() || null,
    attachments: app.attachments.map((a) => ({
      id: a.id,
      documentType: a.documentType,
      originalName: a.originalName,
    })),
  };
}
