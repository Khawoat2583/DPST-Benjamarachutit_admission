import type { Metadata } from "next";

export { default } from "@/features/applicant/status/status-page";

export const metadata: Metadata = {
  title: "ตรวจสอบสถานะการสมัคร",
  description: "ตรวจสอบสถานะใบสมัครและผลการตรวจเอกสารเข้าโครงการ พสวท.",
  robots: { index: false, follow: false },
};
