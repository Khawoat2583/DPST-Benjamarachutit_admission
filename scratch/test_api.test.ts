import { describe, it, expect, vi } from "vitest";
import { GET } from "../src/app/api/upload/[filename]/route";

vi.mock("../src/server/auth/admin-session", () => ({
  getAdminSession: vi.fn().mockResolvedValue({ username: "admin", role: "admin" }),
}));

vi.mock("../src/server/auth/session", () => ({
  getSession: vi.fn().mockResolvedValue(null),
}));

describe("API GET Upload Route", () => {
  it("should successfully serve the file when logged in as admin", async () => {
    const req = new Request("http://localhost:3000/api/upload/2f9faf52-af31-41df-8ae2-d29eac2d9bcb.png");
    const params = Promise.resolve({ filename: "2f9faf52-af31-41df-8ae2-d29eac2d9bcb.png" });

    const res = await GET(req, { params });
    console.log("TEST RESPONSE STATUS:", res.status);
    console.log("TEST RESPONSE HEADERS:", Object.fromEntries(res.headers.entries()));
    
    expect(res.status).toBe(200);
    const contentType = res.headers.get("Content-Type");
    expect(contentType).toBe("image/png");
  });
});
