import type { Metadata } from "next";

export { default } from "@/features/eligibility/eligibility-page";

export const metadata: Metadata = {
  title: "ตรวจสอบคุณสมบัติเบื้องต้น",
  description:
    "กรอกผลการเรียนรายวิชาพื้นฐาน 5 ภาคเรียน เพื่อประเมินคุณสมบัติขั้นต่ำก่อนสมัครเข้าโครงการ พสวท.",
  robots: { index: false, follow: false },
};
