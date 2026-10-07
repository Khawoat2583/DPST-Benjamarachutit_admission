import type { Metadata } from "next";

export { default } from "@/features/portal-home/home-page";

export const metadata: Metadata = {
  title: "ระบบรับสมัครโครงการ พสวท.",
  description:
    "เริ่มสมัครออนไลน์ ตรวจสอบสถานะ และดูขั้นตอนการรับสมัครเข้าโครงการ พสวท. ระดับมัธยมศึกษาตอนปลาย ศูนย์โรงเรียนเบญจมราชูทิศ",
  openGraph: {
    title: "ระบบรับสมัครโครงการ พสวท.",
    description: "เริ่มสมัครออนไลน์และตรวจสอบสถานะการสมัครเข้าโครงการ พสวท.",
  },
};
