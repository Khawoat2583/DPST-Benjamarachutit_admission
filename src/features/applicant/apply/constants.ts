import {
  User,
  MapPin,
  GraduationCap,
  BookOpen,
  UploadCloud,
  FileCheck,
  type LucideIcon,
} from "lucide-react";
import type { UploadSlotKey } from "./types";

export const DEFAULT_COURSES = [
  { subjectGroup: "math", semester: 1, courseCode: "ค21101", courseName: "คณิตศาสตร์พื้นฐาน 1", credit: 1.5, grade: "" },
  { subjectGroup: "math", semester: 2, courseCode: "ค21102", courseName: "คณิตศาสตร์พื้นฐาน 2", credit: 1.5, grade: "" },
  { subjectGroup: "math", semester: 3, courseCode: "ค22101", courseName: "คณิตศาสตร์พื้นฐาน 3", credit: 1.5, grade: "" },
  { subjectGroup: "math", semester: 4, courseCode: "ค22102", courseName: "คณิตศาสตร์พื้นฐาน 4", credit: 1.5, grade: "" },
  { subjectGroup: "math", semester: 5, courseCode: "ค23101", courseName: "คณิตศาสตร์พื้นฐาน 5", credit: 1.5, grade: "" },
  { subjectGroup: "science", semester: 1, courseCode: "ว21101", courseName: "วิทยาศาสตร์พื้นฐาน 1", credit: 2, grade: "" },
  { subjectGroup: "science", semester: 2, courseCode: "ว21102", courseName: "วิทยาศาสตร์พื้นฐาน 2", credit: 2, grade: "" },
  { subjectGroup: "science", semester: 3, courseCode: "ว22101", courseName: "วิทยาศาสตร์พื้นฐาน 3", credit: 2, grade: "" },
  { subjectGroup: "science", semester: 4, courseCode: "ว22102", courseName: "วิทยาศาสตร์พื้นฐาน 4", credit: 2, grade: "" },
  { subjectGroup: "science", semester: 5, courseCode: "ว23101", courseName: "วิทยาศาสตร์พื้นฐาน 5", credit: 2, grade: "" },
  { subjectGroup: "english", semester: 1, courseCode: "อ21101", courseName: "ภาษาอังกฤษพื้นฐาน 1", credit: 1.5, grade: "" },
  { subjectGroup: "english", semester: 2, courseCode: "อ21102", courseName: "ภาษาอังกฤษพื้นฐาน 2", credit: 1.5, grade: "" },
  { subjectGroup: "english", semester: 3, courseCode: "อ22101", courseName: "ภาษาอังกฤษพื้นฐาน 3", credit: 1.5, grade: "" },
  { subjectGroup: "english", semester: 4, courseCode: "อ22102", courseName: "ภาษาอังกฤษพื้นฐาน 4", credit: 1.5, grade: "" },
  { subjectGroup: "english", semester: 5, courseCode: "อ23101", courseName: "ภาษาอังกฤษพื้นฐาน 5", credit: 1.5, grade: "" },
];

export const SEMESTER_NAMES: Record<number, string> = {
  1: "มัธยมศึกษาปีที่ 1 ภาคเรียนที่ 1",
  2: "มัธยมศึกษาปีที่ 1 ภาคเรียนที่ 2",
  3: "มัธยมศึกษาปีที่ 2 ภาคเรียนที่ 1",
  4: "มัธยมศึกษาปีที่ 2 ภาคเรียนที่ 2",
  5: "มัธยมศึกษาปีที่ 3 ภาคเรียนที่ 1",
};

export type ApplyStepConfig = {
  id: number;
  label: string;
  icon: LucideIcon;
};

export const APPLY_STEPS: ApplyStepConfig[] = [
  { id: 1, label: "ข้อมูลทั่วไป", icon: User },
  { id: 2, label: "ที่อยู่ติดต่อ", icon: MapPin },
  { id: 3, label: "ประวัติการศึกษา", icon: GraduationCap },
  { id: 4, label: "เกรดเฉลี่ย", icon: BookOpen },
  { id: 5, label: "แนบหลักฐาน", icon: UploadCloud },
  { id: 6, label: "กดยืนยัน", icon: FileCheck },
];

export const UPLOAD_SLOTS: {
  key: UploadSlotKey;
  label: string;
  type: UploadSlotKey;
}[] = [
  { key: "photo", label: "รูปถ่ายนักเรียน", type: "photo" },
  { key: "transcriptFront", label: "สำเนาปพ.1 ด้านหน้า", type: "transcriptFront" },
  { key: "transcriptBack", label: "สำเนาปพ.1 ด้านหลัง", type: "transcriptBack" },
  { key: "idCard", label: "สำเนาบัตรประจำตัวประชาชน", type: "idCard" },
];
