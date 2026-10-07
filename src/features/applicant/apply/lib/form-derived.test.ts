import { describe, expect, it } from "vitest";
import type { AttachmentsList, ContactAddressForm, GradeRow, PersonalForm, SchoolForm } from "../types";
import {
  buildFieldErrors,
  buildProgressPercent,
  buildStepValidities,
  computeClientGpas,
  getSemesterCompleteness,
  hasCourseCodeErrors,
  isGradesFormFilled,
} from "./form-derived";

function makeGrade(semester: number, subjectGroup: "math" | "science" | "english", courseCode: string, grade: number): GradeRow {
  return {
    semester,
    subjectGroup,
    courseCode,
    courseName: `วิชาพื้นฐาน ${courseCode}`,
    credit: 1.0,
    grade,
  };
}

function createCompleteGrades(): GradeRow[] {
  const grades: GradeRow[] = [];
  for (let sem = 1; sem <= 5; sem++) {
    grades.push(makeGrade(sem, "math", `ค2${sem}101`, 3.5));
    grades.push(makeGrade(sem, "science", `ว2${sem}101`, 3.25));
    grades.push(makeGrade(sem, "english", `อ2${sem}101`, 3.0));
  }
  return grades;
}

describe("form-derived", () => {
  it("computes semester completeness and missing groups", () => {
    const grades = [
      makeGrade(1, "math", "ค21101", 3.5),
      makeGrade(1, "science", "ว21101", 3.0),
    ];

    expect(getSemesterCompleteness(grades, 1)).toEqual({
      isComplete: false,
      missing: ["ภาษาอังกฤษ (อ)"],
    });
  });

  it("computes client GPA and threshold errors", () => {
    const result = computeClientGpas(createCompleteGrades(), "2.90");

    expect(result.mathGpa).toBe(3.5);
    expect(result.scienceGpa).toBe(3.25);
    expect(result.englishGpa).toBe(3);
    expect(result.isEligible).toBe(false);
    expect(result.errors).toContain("เกรดเฉลี่ยสะสมรวม (GPAX) ต่ำกว่า 3.00");
  });

  it("validates grade form completeness and course code constraints", () => {
    const complete = createCompleteGrades();
    expect(isGradesFormFilled(complete)).toBe(true);
    expect(hasCourseCodeErrors(complete)).toBe(false);

    const invalid = [...complete];
    invalid[0] = { ...invalid[0], courseCode: "ค21201" };
    expect(isGradesFormFilled(invalid)).toBe(false);
    expect(hasCourseCodeErrors(invalid)).toBe(true);
  });

  it("builds field errors and step validities", () => {
    const personal: PersonalForm = {
      title: "เด็กชาย",
      firstName: "สมชาย",
      lastName: "ใจดี",
      announcementOrder: "12",
    };
    const contactAddress: ContactAddressForm = {
      email: "student@example.com",
      phone: "0812345678",
      guardianPhone: "0891112222",
      addressNo: "12/4",
      addressMoo: "",
      addressSoi: "",
      addressRoad: "",
      addressSubdistrict: "สะเตง",
      addressDistrict: "เมือง",
      addressProvince: "ยะลา",
      addressZipcode: "95000",
    };
    const school: SchoolForm = {
      schoolName: "โรงเรียนตัวอย่าง",
      schoolProvince: "ยะลา",
    };
    const attachments: AttachmentsList = {
      photo: { id: 1, documentType: "photo" },
      transcriptFront: { id: 2, documentType: "transcript" },
      transcriptBack: { id: 3, documentType: "transcript" },
      idCard: { id: 4, documentType: "id_card" },
    };

    expect(buildFieldErrors(personal, contactAddress, school, "3.20")).toEqual({});

    const stepValidities = buildStepValidities({
      personal,
      contactAddress,
      school,
      gpaxInput: "3.20",
      isGradesFormFilled: true,
      hasCourseCodeErrors: false,
      isEligible: true,
      attachments,
    });

    expect(stepValidities).toEqual({
      1: true,
      2: true,
      3: true,
      4: true,
      5: true,
      6: true,
    });
  });

  it("calculates progress from visited and valid steps", () => {
    const percent = buildProgressPercent(
      { 1: true, 2: true, 3: true },
      { 1: true, 2: false, 3: true, 4: false, 5: false, 6: false }
    );

    expect(percent).toBe(33);
  });
});
