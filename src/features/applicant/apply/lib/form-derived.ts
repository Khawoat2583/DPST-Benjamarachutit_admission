import { calculateWeightedAverage } from "@/features/ranking/grades";
import { isCoreSubjectCode } from "@/features/applicant/course-code";
import type {
  AttachmentsList,
  ClientGpas,
  ContactAddressForm,
  GradeRow,
  PersonalForm,
  SchoolForm,
} from "../types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COURSE_PREFIX = {
  math: "ค",
  science: "ว",
  english: "อ",
} as const;

const GROUP_LABELS = {
  math: "คณิตศาสตร์ (ค)",
  science: "วิทยาศาสตร์ (ว)",
  english: "ภาษาอังกฤษ (อ)",
} as const;

type GroupName = keyof typeof GROUP_LABELS;

function getGroupFromCode(courseCode: string): GroupName | null {
  const normalized = (courseCode || "").trim().toUpperCase();
  if (normalized.startsWith(COURSE_PREFIX.math)) return "math";
  if (normalized.startsWith(COURSE_PREFIX.science)) return "science";
  if (normalized.startsWith(COURSE_PREFIX.english)) return "english";
  return null;
}

export function getSemesterCompleteness(grades: GradeRow[], semNum: number) {
  const semGrades = grades.filter((grade) => grade.semester === semNum);
  const missing: string[] = [];

  const hasMath = semGrades.some((g) => getGroupFromCode(g.courseCode) === "math");
  const hasScience = semGrades.some((g) => getGroupFromCode(g.courseCode) === "science");
  const hasEnglish = semGrades.some((g) => getGroupFromCode(g.courseCode) === "english");

  if (!hasMath) missing.push(GROUP_LABELS.math);
  if (!hasScience) missing.push(GROUP_LABELS.science);
  if (!hasEnglish) missing.push(GROUP_LABELS.english);

  return {
    isComplete: missing.length === 0,
    missing,
  };
}

function parseNumericValue(value: number | string): number {
  if (typeof value === "number") return value;
  if (value === "") return Number.NaN;
  return parseFloat(String(value));
}

function getWeightedGpa(grades: GradeRow[], group: GroupName): number {
  const filtered = grades
    .filter((grade) => getGroupFromCode(grade.courseCode) === group)
    .map((grade) => ({
      grade: parseNumericValue(grade.grade),
      credit: parseNumericValue(grade.credit),
    }));

  if (filtered.length === 0 || filtered.some((item) => Number.isNaN(item.grade) || item.credit <= 0)) {
    return 0;
  }

  return calculateWeightedAverage(filtered);
}

export function computeClientGpas(grades: GradeRow[], gpaxInput: string): ClientGpas {
  try {
    const mathGpa = getWeightedGpa(grades, "math");
    const scienceGpa = getWeightedGpa(grades, "science");
    const englishGpa = getWeightedGpa(grades, "english");
    const gpax = gpaxInput !== "" ? parseFloat(gpaxInput) : 0;

    const errors: string[] = [];
    if (gpax > 0 && gpax < 3.0) errors.push("เกรดเฉลี่ยสะสมรวม (GPAX) ต่ำกว่า 3.00");
    if (mathGpa > 0 && mathGpa < 3.0) errors.push("เกรดเฉลี่ยวิชาคณิตศาสตร์ต่ำกว่า 3.00");
    if (scienceGpa > 0 && scienceGpa < 3.0)
      errors.push("เกรดเฉลี่ยวิชาวิทยาศาสตร์ต่ำกว่า 3.00");
    if (englishGpa > 0 && englishGpa < 2.75)
      errors.push("เกรดเฉลี่ยวิชาภาษาอังกฤษต่ำกว่า 2.75");

    return {
      mathGpa,
      scienceGpa,
      englishGpa,
      gpax,
      isEligible: errors.length === 0,
      errors,
    };
  } catch {
    return { mathGpa: 0, scienceGpa: 0, englishGpa: 0, gpax: 0, isEligible: false, errors: [] };
  }
}

export function isGradesFormFilled(grades: GradeRow[]): boolean {
  const allRowsFilled = grades.every(
    (grade) =>
      (grade.courseCode || "").trim() !== "" &&
      grade.credit !== "" &&
      grade.credit !== null &&
      grade.credit !== undefined &&
      grade.grade !== "" &&
      grade.grade !== null &&
      grade.grade !== undefined
  );

  if (!allRowsFilled) return false;

  const hasCodeErrors = grades.some((grade) => !isCoreSubjectCode(grade.courseCode));
  if (hasCodeErrors) return false;

  for (let sem = 1; sem <= 5; sem++) {
    const completeness = getSemesterCompleteness(grades, sem);
    if (!completeness.isComplete) return false;
  }

  return true;
}

export function hasCourseCodeErrors(grades: GradeRow[]): boolean {
  return grades.some((grade) => grade.courseCode && !isCoreSubjectCode(grade.courseCode));
}

export function buildFieldErrors(
  personal: PersonalForm,
  contactAddress: ContactAddressForm,
  school: SchoolForm,
  gpaxInput: string
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!personal.title) errors.title = "กรุณาเลือกคำนำหน้านาม";
  if (!personal.firstName) errors.firstName = "กรุณากรอกชื่อจริง";
  if (!personal.lastName) errors.lastName = "กรุณากรอกนามสกุล";
  if (!personal.announcementOrder) errors.announcementOrder = "กรุณากรอกลำดับประกาศ";
  else if (parseInt(personal.announcementOrder, 10) <= 0)
    errors.announcementOrder = "ลำดับประกาศต้องมากกว่า 0";

  if (!contactAddress.phone) errors.phone = "กรุณากรอกเบอร์โทรศัพท์ผู้สมัคร";
  else if (contactAddress.phone.length < 9) errors.phone = "เบอร์โทรศัพท์ผู้สมัครไม่ถูกต้อง";
  else if (contactAddress.phone.length > 10)
    errors.phone = "เบอร์โทรศัพท์ผู้สมัครยาวเกินไป (ไม่เกิน 10 หลัก)";

  if (!contactAddress.guardianPhone) errors.guardianPhone = "กรุณากรอกเบอร์โทรศัพท์ผู้ปกครอง";
  else if (contactAddress.guardianPhone.length < 9)
    errors.guardianPhone = "เบอร์โทรศัพท์ผู้ปกครองไม่ถูกต้อง";
  else if (contactAddress.guardianPhone.length > 10)
    errors.guardianPhone = "เบอร์โทรศัพท์ผู้ปกครองยาวเกินไป (ไม่เกิน 10 หลัก)";

  if (contactAddress.email && !EMAIL_REGEX.test(contactAddress.email)) {
    errors.email = "อีเมลไม่ถูกต้อง";
  }

  if (!contactAddress.addressNo) errors.addressNo = "กรุณากรอกบ้านเลขที่";
  if (!contactAddress.addressSubdistrict) errors.addressSubdistrict = "กรุณากรอกตำบล/แขวง";
  if (!contactAddress.addressDistrict) errors.addressDistrict = "กรุณากรอกอำเภอ/เขต";
  if (!contactAddress.addressProvince) errors.addressProvince = "กรุณากรอกจังหวัด";

  if (!contactAddress.addressZipcode) errors.addressZipcode = "กรุณากรอกรหัสไปรษณีย์";
  else if (contactAddress.addressZipcode.length !== 5)
    errors.addressZipcode = "รหัสไปรษณีย์ต้องมี 5 หลัก";

  if (!school.schoolName) errors.schoolName = "กรุณากรอกชื่อโรงเรียน";
  if (!school.schoolProvince) errors.schoolProvince = "กรุณากรอกจังหวัดของโรงเรียน";

  if (!gpaxInput) errors.gpax = "กรุณากรอก GPAX";
  else if (Number.isNaN(parseFloat(gpaxInput))) errors.gpax = "GPAX ไม่ถูกต้อง";
  else if (parseFloat(gpaxInput) < 3.0)
    errors.gpax = "เกรดเฉลี่ยสะสมรวม (GPAX) ต้องไม่ต่ำกว่า 3.00";
  else if (parseFloat(gpaxInput) > 4.0) errors.gpax = "GPAX สูงสุดคือ 4.00";

  return errors;
}

type StepValidityInput = {
  personal: PersonalForm;
  contactAddress: ContactAddressForm;
  school: SchoolForm;
  gpaxInput: string;
  isGradesFormFilled: boolean;
  hasCourseCodeErrors: boolean;
  isEligible: boolean;
  attachments: AttachmentsList;
};

export function buildStepValidities(input: StepValidityInput): Record<number, boolean> {
  return {
    1: !!(
      input.personal.title &&
      input.personal.firstName &&
      input.personal.lastName &&
      input.personal.announcementOrder &&
      parseInt(input.personal.announcementOrder, 10) > 0
    ),
    2: !!(
      input.contactAddress.phone &&
      input.contactAddress.phone.length >= 9 &&
      input.contactAddress.phone.length <= 10 &&
      input.contactAddress.guardianPhone &&
      input.contactAddress.guardianPhone.length >= 9 &&
      input.contactAddress.guardianPhone.length <= 10 &&
      input.contactAddress.addressNo &&
      input.contactAddress.addressSubdistrict &&
      input.contactAddress.addressDistrict &&
      input.contactAddress.addressProvince &&
      input.contactAddress.addressZipcode &&
      input.contactAddress.addressZipcode.length === 5 &&
      (!input.contactAddress.email || EMAIL_REGEX.test(input.contactAddress.email))
    ),
    3: !!(
      input.school.schoolName &&
      input.school.schoolProvince &&
      input.gpaxInput &&
      !Number.isNaN(parseFloat(input.gpaxInput)) &&
      parseFloat(input.gpaxInput) >= 3.0 &&
      parseFloat(input.gpaxInput) <= 4.0
    ),
    4: !!(input.isGradesFormFilled && !input.hasCourseCodeErrors && input.isEligible),
    5: !!(
      input.attachments.photo &&
      input.attachments.transcriptFront &&
      input.attachments.transcriptBack &&
      input.attachments.idCard
    ),
    6: true,
  };
}

export function buildProgressPercent(
  visitedSteps: Record<number, boolean>,
  stepValidities: Record<number, boolean>
): number {
  let completedCount = 0;
  for (let step = 1; step <= 6; step++) {
    if (visitedSteps[step] && stepValidities[step]) completedCount++;
  }
  return Math.round((completedCount / 6) * 100);
}

export function createVisitedStepsUntil(maxStep: number): Record<number, boolean> {
  const visited: Record<number, boolean> = {};
  const normalizedMax = Math.max(1, Math.min(6, maxStep));
  for (let step = 1; step <= normalizedMax; step++) {
    visited[step] = true;
  }
  return visited;
}
