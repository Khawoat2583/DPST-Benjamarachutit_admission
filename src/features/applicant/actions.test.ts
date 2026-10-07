import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock environment variables to prevent Zod validation errors on require
vi.mock("@/server/env", () => ({
  env: {
    DATABASE_URL: "postgres://mock:mock@localhost:5432/mock",
    UPLOAD_ROOT: "./uploads",
    SESSION_SECRET: "mock_session_secret_for_dev_only_987654321",
    NEXT_PUBLIC_APP_NAME: "DPST Admission Test",
  },
}));

// Mock system settings
vi.mock("@/lib/system-settings", () => ({
  getSystemSettings: vi.fn().mockReturnValue({
    isRegistrationClosed: false,
    isRanked: false,
  }),
  saveSystemSettings: vi.fn(),
}));

import {
  loginApplicant,
  registerApplicant,
  submitOrUpdateApplication,
  getApplicationStatus,
  verifyResetPin,
  resetPasswordWithPin,
} from "./actions";
import { hashPassword } from "@/server/auth/security";
import { db } from "@/db";

// Mock next/headers cookies and headers
vi.mock("next/headers", () => {
  const store = new Map();
  return {
    cookies: () => ({
      get: (name: string) => ({ value: store.get(name) }),
      set: (name: string, value: string) => store.set(name, value),
      delete: (name: string) => store.delete(name),
    }),
    headers: () => ({
      get: () => "127.0.0.1",
    }),
  };
});

// Mock database client with chainable query builder
vi.mock("@/db", () => {
  const chain = {
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 1 }]),
  };
  const mockDb = {
    query: {
      applications: {
        findFirst: vi.fn(),
      },
      loginAttempts: {
        findFirst: vi.fn().mockResolvedValue(undefined),
      },
    },
    transaction: vi.fn(),
    update: vi.fn().mockReturnValue(chain),
    delete: vi.fn().mockReturnValue(chain),
    insert: vi.fn().mockReturnValue(chain),
  };
  return {
    db: mockDb,
  };
});

type MockGrade = {
  subjectGroup: "math" | "science" | "english";
  semester: number;
  courseCode: string;
  courseName: string;
  credit: number;
  grade: number;
};

// Helper mock grades generator
function generateMockGrades(gradeVal: number = 4.0, creditVal: number = 1.5): MockGrade[] {
  const grades: MockGrade[] = [];
  const groups = ["math", "science", "english"] as const;
  const prefixes = { math: "ค", science: "ว", english: "อ" };

  for (const group of groups) {
    for (let sem = 1; sem <= 5; sem++) {
      grades.push({
        subjectGroup: group,
        semester: sem,
        courseCode: `${prefixes[group]}2${sem}101`,
        courseName: `${group} core semester ${sem}`,
        credit: creditVal,
        grade: gradeVal,
      });
    }
  }
  return grades;
}

describe("Applicant Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loginApplicant and registerApplicant", () => {
    it("returns validation error for invalid national ID format in login", async () => {
      const res = await loginApplicant("invalid-id", "password");
      expect(res.success).toBe(false);
      expect(res.error).toContain("เลขประจำตัวประชาชนไม่ถูกต้อง");
    });

    it("returns error if account is not found in login", async () => {
      vi.mocked(db.query.applications.findFirst).mockResolvedValueOnce(undefined as never);
      const res = await loginApplicant("1200100412340", "password");
      expect(res.success).toBe(false);
      expect(res.error).toContain("ไม่พบเลขประจำตัวประชาชนนี้ในระบบ");
    });

    it("returns isLegacy: true if no passwordHash exists", async () => {
      const mockApp = {
        id: 42,
        nationalId: "1200100412340",
        passwordHash: null,
      };
      vi.mocked(db.query.applications.findFirst).mockResolvedValueOnce(mockApp as never);
      const res = await loginApplicant("1200100412340");
      expect(res.success).toBe(true);
      expect(res.isLegacy).toBe(true);
    });

    it("returns error for incorrect password", async () => {
      const correctHash = hashPassword("correct-password");
      const mockApp = {
        id: 42,
        nationalId: "1200100412340",
        passwordHash: correctHash,
      };
      vi.mocked(db.query.applications.findFirst).mockResolvedValueOnce(mockApp as never);
      const res = await loginApplicant("1200100412340", "wrong-password");
      expect(res.success).toBe(false);
      expect(res.error).toContain("รหัสผ่านไม่ถูกต้อง");
    });

    it("logs in successfully if password is correct", async () => {
      const correctHash = hashPassword("correct-password");
      const mockApp = {
        id: 42,
        status: "submitted",
        nationalId: "1200100412340",
        title: "นาย",
        firstName: "ทดสอบ",
        lastName: "ระบบ",
        passwordHash: correctHash,
        gpax: "3.90",
        mathGpa: "4.00",
        scienceGpa: "3.80",
        englishGpa: "3.75",
        grades: [],
        attachments: [],
      };
      vi.mocked(db.query.applications.findFirst).mockResolvedValueOnce(mockApp as never);
      const res = await loginApplicant("1200100412340", "correct-password");
      expect(res.success).toBe(true);
      expect(res.isLegacy).toBe(false);
      expect(res.isLocked).toBe(false);
    });

    it("registers new candidate successfully", async () => {
      const mockApp = {
        id: 1,
        status: "draft",
        nationalId: "1200100412340",
        email: "test@example.com",
        firstName: "สมชาย",
        lastName: "ใจดี",
        grades: [],
        attachments: [],
      };
      
      vi.mocked(db.query.applications.findFirst)
        .mockResolvedValueOnce(undefined as never)
        .mockResolvedValueOnce(mockApp as never);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 1, nationalId: "1200100412340", status: "draft" }]),
        }),
      } as never);

      const res = await registerApplicant({
        nationalId: "1200100412340",
        email: "test@example.com",
        firstName: "สมชาย",
        lastName: "ใจดี",
        password: "secure-password",
      });

      expect(res.success).toBe(true);
      expect(res.isNew).toBe(true);
      expect(res.application).toBeDefined();
    });
  });

  describe("submitOrUpdateApplication", () => {
    const validFormInput = {
      nationalId: "1200100412340",
      title: "เด็กชาย",
      firstName: "สมชาย",
      lastName: "ดีใจ",
      announcementOrder: 42,
      email: "somchai@gmail.com",
      phone: "0812345678",
      guardianPhone: "0898765432",
      addressNo: "123/45",
      addressMoo: "2",
      addressSubdistrict: "ในเมือง",
      addressDistrict: "เมือง",
      addressProvince: "นครศรีธรรมราช",
      addressZipcode: "80000",
      schoolName: "โรงเรียนอนุบาล",
      schoolProvince: "นครศรีธรรมราช",
      gpax: 3.85,
      grades: generateMockGrades(3.5, 1.5),
    };

    it("saves new application successfully inside a transaction", async () => {
      // Mock session matches the candidate ID
      const { setSession } = await import("@/server/auth/session");
      await setSession({ nationalId: "1200100412340" });

      // Mock db.transaction callback
      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        const mockTx = {
          query: {
            applications: {
              findFirst: vi.fn().mockResolvedValue(undefined), // new application
            },
          },
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockReturnValue([{ id: 99 }]),
            }),
          }),
        };
        return (callback as unknown as (tx: typeof mockTx) => unknown)(mockTx);
      });

      const res = await submitOrUpdateApplication(validFormInput);
      expect(res.success).toBe(true);
      expect(res.applicationId).toBe(99);
    });

    it("reverts status to submitted if an approved application is updated", async () => {
      // Mock session matches the candidate ID
      const { setSession } = await import("@/server/auth/session");
      await setSession({ nationalId: "1200100412340" });

      const mockTx = {
        query: {
          applications: {
            findFirst: vi.fn().mockResolvedValue({ id: 42, status: "approved" }), // existing approved application
          },
        },
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(true),
          }),
        }),
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(true),
        }),
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue(true),
        }),
      };

      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        return (callback as unknown as (tx: typeof mockTx) => unknown)(mockTx);
      });

      const res = await submitOrUpdateApplication(validFormInput);
      expect(res.success).toBe(true);
      expect(mockTx.update).toHaveBeenCalled();
    });

    it("prevents updates if session is invalid or mismatches", async () => {
      const { destroySession } = await import("@/server/auth/session");
      await destroySession(); // destroy session

      const res = await submitOrUpdateApplication(validFormInput);
      expect(res.success).toBe(false);
      expect(res.error).toContain("เซสชันหมดอายุ");
    });
  });

  describe("getApplicationStatus", () => {
    it("returns application details including rejectionReason and timestamps", async () => {
      const mockApp = {
        id: 99,
        status: "rejected",
        nationalId: "1200100412340",
        firstName: "สมชาย",
        lastName: "ดีใจ",
        title: "เด็กชาย",
        announcementOrder: 42,
        schoolName: "โรงเรียนอนุบาล",
        schoolProvince: "นครศรีธรรมราช",
        rejectionReason: "ภาพถ่าย ปพ.1 ไม่ชัดเจน กรุณาอัปโหลดใหม่",
        gpax: "3.85",
        mathGpa: "3.80",
        scienceGpa: "3.80",
        englishGpa: "3.80",
        submittedAt: new Date("2026-05-20T10:00:00Z"),
        createdAt: new Date("2026-05-20T09:00:00Z"),
        attachments: [
          { id: 1, documentType: "photo", originalName: "photo.jpg" },
        ],
      };

      vi.mocked(db.query.applications.findFirst).mockResolvedValueOnce(mockApp as never);

      const res = await getApplicationStatus("1200100412340");
      expect(res.success).toBe(true);
      expect(res.status).toBe("rejected");
      expect(res.rejectionReason).toBe("ภาพถ่าย ปพ.1 ไม่ชัดเจน กรุณาอัปโหลดใหม่");
      expect(res.submittedAt).toBeDefined();
    });
  });

  describe("verifyResetPin", () => {
    it("returns error if pin is not 6 digits", async () => {
      const res = await verifyResetPin({ nationalId: "1200100412340", pin: "123" });
      expect(res.success).toBe(false);
      expect(res.error).toBe("รหัส PIN ต้องมีความยาว 6 หลัก");
    });

    it("returns error if application or pin requests not found", async () => {
      vi.mocked(db.query.applications.findFirst).mockResolvedValueOnce(undefined as never);
      const res = await verifyResetPin({ nationalId: "1200100412340", pin: "123456" });
      expect(res.success).toBe(false);
      expect(res.error).toBe("รหัส PIN ไม่ถูกต้องหรือยังไม่ได้ทำการร้องขอรหัสใหม่");
    });

    it("returns error if PIN is expired", async () => {
      const expiredApp = {
        id: 1,
        nationalId: "1200100412340",
        resetPin: "123456",
        resetPinExpiresAt: new Date(Date.now() - 5000), // expired 5s ago
      };
      vi.mocked(db.query.applications.findFirst).mockResolvedValueOnce(expiredApp as never);
      const res = await verifyResetPin({ nationalId: "1200100412340", pin: "123456" });
      expect(res.success).toBe(false);
      expect(res.error).toBe("รหัส PIN นี้หมดอายุแล้ว กรุณาทำการร้องขอรหัสใหม่อีกครั้ง");
    });

    it("returns error if PIN does not match", async () => {
      const mockApp = {
        id: 1,
        nationalId: "1200100412340",
        resetPin: "123456",
        resetPinExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      };
      vi.mocked(db.query.applications.findFirst).mockResolvedValueOnce(mockApp as never);
      const res = await verifyResetPin({ nationalId: "1200100412340", pin: "654321" });
      expect(res.success).toBe(false);
      expect(res.error).toBe("รหัส PIN ไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง");
    });

    it("returns success if PIN is valid and not expired", async () => {
      const mockApp = {
        id: 1,
        nationalId: "1200100412340",
        resetPin: hashPassword("123456"), // PINs are stored hashed
        resetPinExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      };
      vi.mocked(db.query.applications.findFirst).mockResolvedValueOnce(mockApp as never);
      const res = await verifyResetPin({ nationalId: "1200100412340", pin: "123456" });
      expect(res.success).toBe(true);
    });
  });

  describe("resetPasswordWithPin", () => {
    it("returns error if pin is not 6 digits", async () => {
      const res = await resetPasswordWithPin({ nationalId: "1200100412340", pin: "123", password: "new-password" });
      expect(res.success).toBe(false);
      expect(res.error).toBe("รหัส PIN ต้องมีความยาว 6 หลัก");
    });

    it("returns error if password is less than 8 chars", async () => {
      const res = await resetPasswordWithPin({ nationalId: "1200100412340", pin: "123456", password: "short" });
      expect(res.success).toBe(false);
      expect(res.error).toBe("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
    });

    it("resets password successfully when PIN is valid", async () => {
      const mockApp = {
        id: 1,
        nationalId: "1200100412340",
        resetPin: hashPassword("123456"), // PINs are stored hashed
        resetPinExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      };
      vi.mocked(db.query.applications.findFirst).mockResolvedValueOnce(mockApp as never);
      const res = await resetPasswordWithPin({ nationalId: "1200100412340", pin: "123456", password: "new-secure-password" });
      expect(res.success).toBe(true);
      expect(res.message).toContain("เปลี่ยนรหัสผ่านสำเร็จแล้ว");
    });
  });
});
