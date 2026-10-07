import { describe, it, expect, vi } from "vitest";

// Mock env
vi.mock("@/server/env", () => ({
  env: {
    DATABASE_URL: "postgres://mock:mock@localhost:5432/mock",
    UPLOAD_ROOT: "./uploads",
    SESSION_SECRET: "mock_session_secret_for_dev_only_987654321",
    NEXT_PUBLIC_APP_NAME: "DPST Admission Test",
  },
}));

// Mock db
vi.mock("@/db", () => ({
  db: {
    query: {
      attachments: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          applicationId: 42,
          documentType: "photo",
          originalName: "photo.png",
          storedName: "2f9faf52-af31-41df-8ae2-d29eac2d9bcb.png",
          mimeType: "image/png",
          createdAt: new Date(),
        }),
      },
      applications: {
        findFirst: vi.fn().mockResolvedValue({
          id: 42,
          nationalId: "1200100412340",
          status: "approved",
        }),
      },
    },
  },
}));

// Mock fs/promises
vi.mock("fs/promises", () => ({
  default: {
    readFile: vi.fn().mockResolvedValue(Buffer.from("mock image data")),
  },
}));

vi.mock("@/server/auth/admin-session", () => ({
  getAdminSession: vi.fn().mockResolvedValue({ username: "admin", role: "admin" }),
}));

vi.mock("@/server/auth/session", () => ({
  getSession: vi.fn().mockResolvedValue(null),
}));

import { GET } from "./route";
import { db } from "@/db";

describe("API GET Upload Route", () => {
  it("should successfully serve PNG file with inline Content-Disposition and security headers", async () => {
    vi.mocked(db.query.attachments.findFirst).mockResolvedValueOnce({
      id: 1,
      applicationId: 42,
      documentType: "photo",
      originalName: "photo.png",
      storedName: "2f9faf52-af31-41df-8ae2-d29eac2d9bcb.png",
      mimeType: "image/png",
      fileSize: 100,
      createdAt: new Date(),
    });

    const req = new Request("http://localhost:3000/api/upload/2f9faf52-af31-41df-8ae2-d29eac2d9bcb.png");
    const params = Promise.resolve({ filename: "2f9faf52-af31-41df-8ae2-d29eac2d9bcb.png" });

    const res = await GET(req, { params });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/png");
    expect(res.headers.get("Content-Disposition")).toBe("inline; filename=\"photo.png\"");
    expect(res.headers.get("Content-Security-Policy")).toBe("default-src 'none'; sandbox;");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("should successfully serve PDF file with attachment Content-Disposition and security headers", async () => {
    vi.mocked(db.query.attachments.findFirst).mockResolvedValueOnce({
      id: 2,
      applicationId: 42,
      documentType: "transcript",
      originalName: "report.pdf",
      storedName: "2f9faf52-af31-41df-8ae2-d29eac2d9bcb.pdf",
      mimeType: "application/pdf",
      fileSize: 200,
      createdAt: new Date(),
    });

    const req = new Request("http://localhost:3000/api/upload/2f9faf52-af31-41df-8ae2-d29eac2d9bcb.pdf");
    const params = Promise.resolve({ filename: "2f9faf52-af31-41df-8ae2-d29eac2d9bcb.pdf" });

    const res = await GET(req, { params });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toBe("attachment; filename=\"report.pdf\"");
    expect(res.headers.get("Content-Security-Policy")).toBe("default-src 'none'; sandbox;");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });
});
