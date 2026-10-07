import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock environment variables
vi.mock("@/server/env", () => ({
  env: {
    DATABASE_URL: "postgres://mock:mock@localhost:5432/mock",
    UPLOAD_ROOT: "./uploads",
    SESSION_SECRET: "mock_session_secret_for_dev_only_987654321",
    NEXT_PUBLIC_APP_NAME: "DPST Admission Test",
  },
}));

// Mock getAdminSession
vi.mock("@/server/auth/admin-session", () => ({
  getAdminSession: vi.fn().mockResolvedValue({ username: "admin" }),
}));

// Mock system settings store
let mockSettings = {
  isRegistrationClosed: false,
  isRanked: false,
};

vi.mock("@/lib/system-settings", () => ({
  getSystemSettings: vi.fn().mockImplementation(() => mockSettings),
  saveSystemSettings: vi.fn().mockImplementation((s) => {
    mockSettings = s;
  }),
}));

type QueryRow = {
  id: number;
  firstName: string;
  lastName: string;
  announcementOrder: number;
  mathGpa: string;
  scienceGpa: string;
  englishGpa: string;
  gpax: string;
  examMathScore: string;
  examScienceScore: string;
};

vi.mock("@/db", () => {
  const queryResult = {
    data: [] as QueryRow[],
  };

  const chain = {
    leftJoin: vi.fn().mockImplementation(() => chain),
    where: vi.fn().mockImplementation(() => chain),
    then: vi.fn().mockImplementation((onfulfilled) => Promise.resolve(onfulfilled(queryResult.data))),
  };

  const mockDb = {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockImplementation(() => chain),
    })),
    transaction: vi.fn().mockImplementation(async (cb) => {
      const mockTx = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 1 }]),
      };
      return cb(mockTx);
    }),
  };
  return {
    db: mockDb,
    queryResult, // Export to allow test access
  };
});

// Mock next/cache revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  toggleRegistrationClosedAction,
  runRankingAction,
  resetWorkflowAction,
  exportRankedExcelAction,
} from "./actions";
import { escapeExcelFormula } from "./utils";
import * as dbModule from "@/db";
const queryResult = (dbModule as unknown as { queryResult: { data: QueryRow[] } }).queryResult;
import type { RankedApplicantRecord } from "./types";

describe("Ranking Administrative Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSettings = {
      isRegistrationClosed: false,
      isRanked: false,
    };
  });

  describe("toggleRegistrationClosedAction", () => {
    it("toggles the closed state successfully", async () => {
      expect(mockSettings.isRegistrationClosed).toBe(false);
      const res = await toggleRegistrationClosedAction();
      expect(res.success).toBe(true);
      expect(res.settings!.isRegistrationClosed).toBe(true);
      expect(mockSettings.isRegistrationClosed).toBe(true);
    });
  });

  describe("runRankingAction", () => {
    it("returns error if registration is not closed", async () => {
      const res = await runRankingAction();
      expect(res.success).toBe(false);
      expect(res.error).toContain("ปิดการรับสมัครก่อน");
    });

    it("runs the ranking process successfully if registration is closed", async () => {
      mockSettings.isRegistrationClosed = true;

      const mockEligibleApps = [
        {
          id: 1,
          firstName: "Somchai",
          lastName: "Deejai",
          announcementOrder: 1,
          mathGpa: "3.50",
          scienceGpa: "3.60",
          englishGpa: "3.70",
          gpax: "3.80",
          examMathScore: "45.00",
          examScienceScore: "48.00",
        },
        {
          id: 2,
          firstName: "Somsri",
          lastName: "Sukdee",
          announcementOrder: 2,
          mathGpa: "3.90",
          scienceGpa: "3.80",
          englishGpa: "3.85",
          gpax: "3.90",
          examMathScore: "48.00",
          examScienceScore: "50.00",
        },
      ];

      queryResult.data = mockEligibleApps;

      const res = await runRankingAction();
      expect(res.success).toBe(true);
      expect(res.count).toBe(2);
      expect(res.settings!.isRanked).toBe(true);
      expect(mockSettings.isRanked).toBe(true);
    });
  });

  describe("resetWorkflowAction", () => {
    it("resets settings and reverts statuses back to approved", async () => {
      mockSettings = {
        isRegistrationClosed: true,
        isRanked: true,
      };

      const res = await resetWorkflowAction();
      expect(res.success).toBe(true);
      expect(res.settings!.isRegistrationClosed).toBe(false);
      expect(res.settings!.isRanked).toBe(false);
    });
  });

  describe("escapeExcelFormula", () => {
    it("should prepend a single quote if string starts with = , + , - or @", () => {
      expect(escapeExcelFormula("=SUM(A1:A10)")).toBe("'=SUM(A1:A10)");
      expect(escapeExcelFormula("+123")).toBe("'+123");
      expect(escapeExcelFormula("-456")).toBe("'-456");
      expect(escapeExcelFormula("@Exploit")).toBe("'@Exploit");
    });

    it("should ignore trailing whitespaces and still detect formula triggers", () => {
      expect(escapeExcelFormula("  =CMD  ")).toBe("'  =CMD  ");
    });

    it("should return the original value if it does not start with any formula triggers", () => {
      expect(escapeExcelFormula("Somchai Deejai")).toBe("Somchai Deejai");
      expect(escapeExcelFormula("4.00")).toBe("4.00");
    });

    it("should return non-string values as-is", () => {
      expect(escapeExcelFormula(4.00)).toBe(4.00);
      expect(escapeExcelFormula(true)).toBe(true);
      expect(escapeExcelFormula(null)).toBe(null);
    });
  });

  describe("exportRankedExcelAction", () => {
    it("returns error if ranking is not processed yet", async () => {
      mockSettings.isRanked = false;
      const res = await exportRankedExcelAction();
      expect(res.success).toBe(false);
      expect(res.error).toContain("ประมวลผลจัดอันดับ (Run Ranking) ก่อน");
    });

    it("should successfully generate base64 excel if ranked", async () => {
      mockSettings.isRanked = true;
      queryResult.data = [
        {
          id: 1,
          firstName: "=CMD()",
          lastName: "Deejai",
          announcementOrder: 1,
          mathGpa: "3.50",
          scienceGpa: "3.60",
          englishGpa: "3.70",
          gpax: "3.80",
          examMathScore: "45.00",
          examScienceScore: "48.00",
        } as unknown as RankedApplicantRecord
      ];

      const res = await exportRankedExcelAction();
      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      expect(typeof res.data).toBe("string");
    });
  });
});
