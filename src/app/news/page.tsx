import type { Metadata } from "next";

export { default } from "@/features/news-feed/news-feed-page";

export const metadata: Metadata = {
  title: "ข่าวสารและประชาสัมพันธ์",
  description:
    "ข่าวสารอัปเดต ประกาศ และกิจกรรมจากศูนย์โครงการ พสวท. โรงเรียนเบญจมราชูทิศ นครศรีธรรมราช",
  openGraph: {
    title: "ข่าวสารและประชาสัมพันธ์ · โครงการ พสวท.",
    description: "ข่าวสาร ประกาศ และกิจกรรมจากศูนย์โครงการ พสวท.",
  },
};
