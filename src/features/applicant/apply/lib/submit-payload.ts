import type { ContactAddressForm, GradeRow, PersonalForm, SchoolForm } from "../types";

type BuildApplicationSubmitPayloadInput = {
  nationalId: string;
  personal: PersonalForm;
  contactAddress: ContactAddressForm;
  school: SchoolForm;
  gpaxInput: string;
  grades: GradeRow[];
};

function toNumber(value: number | string): number {
  if (typeof value === "number") return value;
  if (value === "") return 0;
  return parseFloat(String(value));
}

export function buildApplicationSubmitPayload({
  nationalId,
  personal,
  contactAddress,
  school,
  gpaxInput,
  grades,
}: BuildApplicationSubmitPayloadInput) {
  return {
    nationalId,
    title: personal.title,
    firstName: personal.firstName,
    lastName: personal.lastName,
    announcementOrder: parseInt(personal.announcementOrder, 10),
    email: contactAddress.email,
    phone: contactAddress.phone,
    guardianPhone: contactAddress.guardianPhone,
    addressNo: contactAddress.addressNo,
    addressMoo: contactAddress.addressMoo,
    addressSoi: contactAddress.addressSoi,
    addressRoad: contactAddress.addressRoad,
    addressSubdistrict: contactAddress.addressSubdistrict,
    addressDistrict: contactAddress.addressDistrict,
    addressProvince: contactAddress.addressProvince,
    addressZipcode: contactAddress.addressZipcode,
    schoolName: school.schoolName,
    schoolProvince: school.schoolProvince,
    gpax: parseFloat(gpaxInput),
    grades: grades.map((grade) => {
      const courseCode = (grade.courseCode || "").trim().toUpperCase();
      const firstChar = courseCode.charAt(0);

      let subjectGroup = "math";
      let courseName = `วิชาคณิตศาสตร์พื้นฐาน (${courseCode})`;
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
        subjectGroup,
        semester:
          typeof grade.semester === "string" ? parseInt(grade.semester, 10) : grade.semester,
        courseCode,
        courseName,
        credit: toNumber(grade.credit),
        grade: toNumber(grade.grade),
      };
    }),
  };
}
