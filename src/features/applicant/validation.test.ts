import { describe, expect, it } from "vitest";
import {
  validateThaiNationalId,
  courseGradeInputSchema,
  applicationFormSchema,
  calculateAndVerifyGpas,
} from "./validation";

describe("validateThaiNationalId", () => {
  it("accepts a valid Thai National ID", () => {
    // 1200100412340:
    // (1*13 + 2*12 + 0*11 + 0*10 + 1*9 + 0*8 + 0*7 + 4*6 + 1*5 + 2*4 + 3*3 + 4*2) = 100
    // 100 % 11 = 1
    // (11 - 1) % 10 = 0 (Match!)
    expect(validateThaiNationalId("1200100412340")).toBe(true);
  });

  it("rejects an invalid Thai National ID checksum", () => {
    expect(validateThaiNationalId("1200100412349")).toBe(false);
  });

  it("rejects a Thai National ID with incorrect length", () => {
    expect(validateThaiNationalId("120010041234")).toBe(false);
    expect(validateThaiNationalId("12001004123400")).toBe(false);
  });

  it("rejects a non-numeric ID", () => {
    expect(validateThaiNationalId("120010041234a")).toBe(false);
  });
});

describe("courseGradeInputSchema", () => {
  it("accepts a valid core course grade", () => {
    const valid = {
      subjectGroup: "math",
      semester: 1,
      courseCode: "ค21101", // 3rd digit is 1
      courseName: "คณิตศาสตร์พื้นฐาน 1",
      credit: 1.5,
      grade: 4.0,
    };
    expect(courseGradeInputSchema.parse(valid)).toEqual(valid);
  });

  it("rejects an elective course code", () => {
    const invalid = {
      subjectGroup: "math",
      semester: 1,
      courseCode: "ค21201", // 3rd digit is 2, not 1
      courseName: "คณิตศาสตร์เพิ่มเติม 1",
      credit: 1.5,
      grade: 4.0,
    };
    expect(() => courseGradeInputSchema.parse(invalid)).toThrow(
      "รหัสวิชาต้องเป็นวิชาพื้นฐาน"
    );
  });

  it("rejects invalid credit or grade values", () => {
    const invalidCredit = {
      subjectGroup: "science",
      semester: 2,
      courseCode: "ว21102",
      courseName: "วิทยาศาสตร์พื้นฐาน 2",
      credit: 0,
      grade: 3.5,
    };
    expect(() => courseGradeInputSchema.parse(invalidCredit)).toThrow(
      "หน่วยกิตไม่ถูกต้อง"
    );

    const invalidGrade = {
      subjectGroup: "english",
      semester: 3,
      courseCode: "อ22101",
      courseName: "ภาษาอังกฤษพื้นฐาน 3",
      credit: 1.5,
      grade: 4.5,
    };
    expect(() => courseGradeInputSchema.parse(invalidGrade)).toThrow(
      "เกรดไม่ถูกต้อง"
    );
  });
});

type MockGrade = {
  subjectGroup: "math" | "science" | "english";
  semester: number;
  courseCode: string;
  courseName: string;
  credit: number;
  grade: number;
};

// Helper to generate a valid 15-grade array
function generateMockGrades(gradeVal: number = 4.0, creditVal: number = 1.5): MockGrade[] {
  const grades: MockGrade[] = [];
  const groups = ["math", "science", "english"] as const;
  const prefixes = { math: "ค", science: "ว", english: "อ" };

  for (const group of groups) {
    for (let sem = 1; sem <= 5; sem++) {
      grades.push({
        subjectGroup: group,
        semester: sem,
        courseCode: `${prefixes[group]}2${sem}101`, // 3rd digit is 1
        courseName: `${group} core semester ${sem}`,
        credit: creditVal,
        grade: gradeVal,
      });
    }
  }
  return grades;
}

describe("applicationFormSchema", () => {
  it("accepts a perfectly valid full application form input", () => {
    const validForm = {
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

    expect(applicationFormSchema.parse(validForm)).toBeDefined();
  });

  it("rejects form if grade entries are missing or not exactly 15 items", () => {
    const invalidForm = {
      nationalId: "1200100412340",
      title: "เด็กชาย",
      firstName: "สมชาย",
      lastName: "ดีใจ",
      announcementOrder: 42,
      phone: "0812345678",
      guardianPhone: "0898765432",
      addressNo: "123/45",
      addressSubdistrict: "ในเมือง",
      addressDistrict: "เมือง",
      addressProvince: "นครศรีธรรมราช",
      addressZipcode: "80000",
      schoolName: "โรงเรียนอนุบาล",
      schoolProvince: "นครศรีธรรมราช",
      gpax: 3.85,
      // Only 14 grades instead of 15
      grades: generateMockGrades(4.0, 1.5).slice(0, 14),
    };

    expect(() => applicationFormSchema.parse(invalidForm)).toThrow(
      "ข้อมูลเกรดไม่ครบถ้วน"
    );
  });
});

describe("calculateAndVerifyGpas", () => {
  it("calculates GPA correctly and approves eligible student", () => {
    const grades = generateMockGrades(3.5, 1.5); // All 3.5
    const result = calculateAndVerifyGpas(3.20, grades);

    expect(result.mathGpa).toBe(3.50);
    expect(result.scienceGpa).toBe(3.50);
    expect(result.englishGpa).toBe(3.50);
    expect(result.gpax).toBe(3.20);
    expect(result.isEligible).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("calculates weighted average and rounds half-up to 2 decimals correctly", () => {
    // Create mix of grades to test rounding
    // Math:
    // sem 1: grade 3.5, credit 1.5 (weighted: 5.25)
    // sem 2: grade 4.0, credit 1.5 (weighted: 6.00)
    // sem 3: grade 3.0, credit 1.0 (weighted: 3.00)
    // sem 4: grade 3.5, credit 1.0 (weighted: 3.50)
    // sem 5: grade 4.0, credit 1.0 (weighted: 4.00)
    // total credits: 6.0
    // total weighted: 21.75
    // unrounded: 21.75 / 6.0 = 3.625
    // rounded half-up: 3.63
    const grades = generateMockGrades(4.0, 1.5);
    const mathGrades = grades.filter(g => g.subjectGroup === "math");
    mathGrades[0].grade = 3.5;
    mathGrades[0].credit = 1.5;
    mathGrades[1].grade = 4.0;
    mathGrades[1].credit = 1.5;
    mathGrades[2].grade = 3.0;
    mathGrades[2].credit = 1.0;
    mathGrades[3].grade = 3.5;
    mathGrades[3].credit = 1.0;
    mathGrades[4].grade = 4.0;
    mathGrades[4].credit = 1.0;

    const result = calculateAndVerifyGpas(3.50, grades);
    expect(result.mathGpa).toBe(3.63); // 3.625 rounded half up
  });

  it("rejects student failing minimum GPAs and lists correct errors", () => {
    const grades = generateMockGrades(4.0, 1.5);
    
    // Set science to 2.5 (below 3.00)
    grades.filter(g => g.subjectGroup === "science").forEach(g => g.grade = 2.5);
    
    // Set english to 2.5 (below 2.75)
    grades.filter(g => g.subjectGroup === "english").forEach(g => g.grade = 2.5);

    // Set gpax to 2.90 (below 3.00)
    const result = calculateAndVerifyGpas(2.90, grades);

    expect(result.isEligible).toBe(false);
    expect(result.errors).toContain("เกรดเฉลี่ยสะสมรวม (GPAX) ต้องไม่ต่ำกว่า 3.00 (ได้ 2.90)");
    expect(result.errors).toContain("เกรดเฉลี่ยสะสมวิชาวิทยาศาสตร์พื้นฐาน 5 เทอม ต้องไม่ต่ำกว่า 3.00 (ได้ 2.50)");
    expect(result.errors).toContain("เกรดเฉลี่ยสะสมวิชาภาษาอังกฤษพื้นฐาน 5 เทอม ต้องไม่ต่ำกว่า 2.75 (ได้ 2.50)");
    expect(result.errors).not.toContain("คณิตศาสตร์"); // Math Gpa remains 4.00 >= 3.00
  });
});
