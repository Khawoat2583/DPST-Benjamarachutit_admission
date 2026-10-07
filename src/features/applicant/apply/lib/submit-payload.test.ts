import { describe, expect, it } from "vitest";
import { buildApplicationSubmitPayload } from "./submit-payload";

describe("buildApplicationSubmitPayload", () => {
  it("maps course codes to subject groups and normalized payload", () => {
    const payload = buildApplicationSubmitPayload({
      nationalId: "1234567890123",
      personal: {
        title: "เด็กชาย",
        firstName: "สมชาย",
        lastName: "ใจดี",
        announcementOrder: "7",
      },
      contactAddress: {
        email: "student@example.com",
        phone: "0812345678",
        guardianPhone: "0899999999",
        addressNo: "12",
        addressMoo: "",
        addressSoi: "",
        addressRoad: "",
        addressSubdistrict: "สะเตง",
        addressDistrict: "เมือง",
        addressProvince: "ยะลา",
        addressZipcode: "95000",
      },
      school: {
        schoolName: "โรงเรียนตัวอย่าง",
        schoolProvince: "ยะลา",
      },
      gpaxInput: "3.25",
      grades: [
        { semester: 1, subjectGroup: "math", courseCode: "ค21101", courseName: "", credit: "1.5", grade: "4" },
        { semester: 1, subjectGroup: "math", courseCode: "ว21101", courseName: "", credit: 2, grade: 3.5 },
        { semester: "1" as unknown as number, subjectGroup: "math", courseCode: "อ21101", courseName: "", credit: 1, grade: 3 },
      ],
    });

    expect(payload.announcementOrder).toBe(7);
    expect(payload.gpax).toBe(3.25);
    expect(payload.grades).toEqual([
      {
        subjectGroup: "math",
        semester: 1,
        courseCode: "ค21101",
        courseName: "วิชาคณิตศาสตร์พื้นฐาน (ค21101)",
        credit: 1.5,
        grade: 4,
      },
      {
        subjectGroup: "science",
        semester: 1,
        courseCode: "ว21101",
        courseName: "วิชาวิทยาศาสตร์พื้นฐาน (ว21101)",
        credit: 2,
        grade: 3.5,
      },
      {
        subjectGroup: "english",
        semester: 1,
        courseCode: "อ21101",
        courseName: "วิชาภาษาอังกฤษพื้นฐาน (อ21101)",
        credit: 1,
        grade: 3,
      },
    ]);
  });
});
