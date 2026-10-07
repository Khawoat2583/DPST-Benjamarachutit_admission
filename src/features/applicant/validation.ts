import { z } from "zod";
import { isCoreSubjectCode } from "./course-code";
import { calculateWeightedAverage } from "../ranking/grades";

// 1. Thai National ID Checksum Validation
export function validateThaiNationalId(id: string): boolean {
  const cleanId = id.trim();
  if (!/^\d{13}$/.test(cleanId)) return false;

  // Check sum algorithm
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanId.charAt(i), 10) * (13 - i);
  }
  const checksum = (11 - (sum % 11)) % 10;
  return checksum === parseInt(cleanId.charAt(12), 10);
}

// 2. Individual Course Grade Zod Schema
export const courseGradeInputSchema = z.object({
  subjectGroup: z.enum(["math", "science", "english"]),
  semester: z.number().int().min(1).max(5),
  courseCode: z.string()
    .min(1, "กรุณากรอกรหัสวิชา")
    .refine((val) => isCoreSubjectCode(val), {
      message: "รหัสวิชาต้องเป็นวิชาพื้นฐาน (ยาว 6 หลัก, ขึ้นต้นด้วย ค/ว/อ, หลักที่ 3 เป็นเลข 1)",
    }),
  courseName: z.string().min(1, "กรุณากรอกชื่อวิชา"),
  credit: z.number()
    .refine((val) => [0.5, 1.0, 1.5, 2.0, 2.5, 3.0].includes(val), {
      message: "หน่วยกิตไม่ถูกต้อง",
    }),
  grade: z.number()
    .refine((val) => [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0].includes(val), {
      message: "เกรดไม่ถูกต้อง",
    }),
});

export type CourseGradeInput = z.infer<typeof courseGradeInputSchema>;

// 3. Main Application Form Zod Schema
export const applicationFormSchema = z.object({
  nationalId: z.string()
    .length(13, "เลขบัตรประชาชนต้องมี 13 หลัก")
    .refine((val) => validateThaiNationalId(val), {
      message: "เลขบัตรประชาชนไม่ถูกต้องตามรูปแบบของกระทรวงมหาดไทย",
    }),
  title: z.string().min(1, "กรุณากรอกคำนำหน้านาม"),
  firstName: z.string().min(1, "กรุณากรอกชื่อจริง"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  announcementOrder: z.number().int().positive("ลำดับประกาศรอบแรกต้องมากกว่าศูนย์"),
  
  email: z.string().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  phone: z.string().min(9, "เบอร์โทรศัพท์ผู้สมัครไม่ถูกต้อง").max(10, "เบอร์โทรศัพท์ผู้สมัครยาวเกินไป (ไม่เกิน 10 หลัก)"),
  guardianPhone: z.string().min(9, "เบอร์โทรศัพท์ผู้ปกครองไม่ถูกต้อง").max(10, "เบอร์โทรศัพท์ผู้ปกครองยาวเกินไป (ไม่เกิน 10 หลัก)"),
  
  addressNo: z.string().min(1, "กรุณากรอกบ้านเลขที่"),
  addressMoo: z.string().optional().default(""),
  addressSoi: z.string().optional().default(""),
  addressRoad: z.string().optional().default(""),
  addressSubdistrict: z.string().min(1, "กรุณากรอกตำบล/แขวง"),
  addressDistrict: z.string().min(1, "กรุณากรอกอำเภอ/เขต"),
  addressProvince: z.string().min(1, "กรุณากรอกจังหวัด"),
  addressZipcode: z.string().length(5, "รหัสไปรษณีย์ต้องมี 5 หลัก"),
  
  schoolName: z.string().min(1, "กรุณากรอกชื่อโรงเรียน"),
  schoolProvince: z.string().min(1, "กรุณากรอกจังหวัดของโรงเรียน"),
  
  gpax: z.number().min(0).max(4, "GPAX สูงสุดคือ 4.00"),
  grades: z.array(courseGradeInputSchema)
    .refine((grades) => {
      // Validate that each semester (1 to 5) has at least one math, one science, and one english course
      const expectedGroups = ["math", "science", "english"] as const;
      
      for (let sem = 1; sem <= 5; sem++) {
        const semGrades = grades.filter((g) => g.semester === sem);
        
        for (const group of expectedGroups) {
          const hasGroup = semGrades.some((g) => g.subjectGroup === group);
          if (!hasGroup) return false;
        }
      }
      return true;
    }, {
      message: "ข้อมูลเกรดไม่ครบถ้วน: ต้องกรอกรายวิชาคณิตศาสตร์ (ค), วิทยาศาสตร์ (ว), และภาษาอังกฤษ (อ) พื้นฐาน อย่างน้อยอย่างละ 1 วิชา ในแต่ละภาคเรียน (ม.1 เทอม 1 ถึง ม.3 เทอม 1)",
    }),
});

export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;

// 4. GPA Calculation & Minimum Requirement Verification
export interface CalculatedGpas {
  mathGpa: number;
  scienceGpa: number;
  englishGpa: number;
  gpax: number;
  isEligible: boolean;
  errors: string[];
}

/** Minimum GPA requirements — single source of truth for the apply flow and the pre-check. */
export const GPA_THRESHOLDS = {
  gpax: 3.0,
  math: 3.0,
  science: 3.0,
  english: 2.75,
} as const;

export type GpaCheckItem = {
  key: "gpax" | "math" | "science" | "english";
  label: string;
  value: number;
  min: number;
  pass: boolean;
};

/** Checks a set of GPAs against the minimum requirements (used by the eligibility pre-check). */
export function verifyGpaThresholds(gpas: {
  gpax: number;
  mathGpa: number;
  scienceGpa: number;
  englishGpa: number;
}): { items: GpaCheckItem[]; isEligible: boolean } {
  const items: GpaCheckItem[] = [
    { key: "gpax", label: "เกรดเฉลี่ยสะสมรวม (GPAX)", value: gpas.gpax, min: GPA_THRESHOLDS.gpax, pass: gpas.gpax >= GPA_THRESHOLDS.gpax },
    { key: "math", label: "เฉลี่ยวิชาคณิตศาสตร์พื้นฐาน", value: gpas.mathGpa, min: GPA_THRESHOLDS.math, pass: gpas.mathGpa >= GPA_THRESHOLDS.math },
    { key: "science", label: "เฉลี่ยวิชาวิทยาศาสตร์พื้นฐาน", value: gpas.scienceGpa, min: GPA_THRESHOLDS.science, pass: gpas.scienceGpa >= GPA_THRESHOLDS.science },
    { key: "english", label: "เฉลี่ยวิชาภาษาอังกฤษพื้นฐาน", value: gpas.englishGpa, min: GPA_THRESHOLDS.english, pass: gpas.englishGpa >= GPA_THRESHOLDS.english },
  ];
  return { items, isEligible: items.every((i) => i.pass) };
}

export function calculateAndVerifyGpas(
  gpaxInput: number,
  grades: CourseGradeInput[]
): CalculatedGpas {
  const mathGrades = grades.filter((g) => g.subjectGroup === "math");
  const scienceGrades = grades.filter((g) => g.subjectGroup === "science");
  const englishGrades = grades.filter((g) => g.subjectGroup === "english");

  const mathGpa = calculateWeightedAverage(mathGrades);
  const scienceGpa = calculateWeightedAverage(scienceGrades);
  const englishGpa = calculateWeightedAverage(englishGrades);

  const errors: string[] = [];

  // Minimum GPA requirement checks
  if (gpaxInput < GPA_THRESHOLDS.gpax) {
    errors.push(`เกรดเฉลี่ยสะสมรวม (GPAX) ต้องไม่ต่ำกว่า 3.00 (ได้ ${gpaxInput.toFixed(2)})`);
  }
  if (mathGpa < GPA_THRESHOLDS.math) {
    errors.push(`เกรดเฉลี่ยสะสมวิชาคณิตศาสตร์พื้นฐาน 5 เทอม ต้องไม่ต่ำกว่า 3.00 (ได้ ${mathGpa.toFixed(2)})`);
  }
  if (scienceGpa < GPA_THRESHOLDS.science) {
    errors.push(`เกรดเฉลี่ยสะสมวิชาวิทยาศาสตร์พื้นฐาน 5 เทอม ต้องไม่ต่ำกว่า 3.00 (ได้ ${scienceGpa.toFixed(2)})`);
  }
  if (englishGpa < GPA_THRESHOLDS.english) {
    errors.push(`เกรดเฉลี่ยสะสมวิชาภาษาอังกฤษพื้นฐาน 5 เทอม ต้องไม่ต่ำกว่า 2.75 (ได้ ${englishGpa.toFixed(2)})`);
  }

  return {
    mathGpa,
    scienceGpa,
    englishGpa,
    gpax: gpaxInput,
    isEligible: errors.length === 0,
    errors,
  };
}
