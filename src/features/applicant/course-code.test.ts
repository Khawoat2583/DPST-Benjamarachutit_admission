import { describe, expect, it } from "vitest";

import { isCoreSubjectCode } from "./course-code";

describe("isCoreSubjectCode", () => {
  it("accepts a basic subject code when the third digit is 1", () => {
    expect(isCoreSubjectCode("ว21101")).toBe(true);
  });

  it("rejects an additional subject code when the third digit is not 1", () => {
    expect(isCoreSubjectCode("ว21201")).toBe(false);
  });
});
