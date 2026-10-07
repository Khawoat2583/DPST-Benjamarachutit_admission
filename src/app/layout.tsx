import type { Metadata } from "next";
import { Inter, Sarabun, Prompt } from "next/font/google";
import { DynamicFontProvider } from "@/components/shared/dynamic-font-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
  display: "swap",
});

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "DPST Admission — โครงการ พสวท. โรงเรียนเบญจมราชูทิศ";
const SITE_DESC =
  "ระบบรับสมัครนักเรียนเข้าโครงการ พสวท. (พัฒนาและส่งเสริมผู้มีความสามารถพิเศษทางวิทยาศาสตร์และเทคโนโลยี) ระดับมัธยมศึกษาตอนปลาย ศูนย์โรงเรียนเบญจมราชูทิศ นครศรีธรรมราช";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: "%s · DPST Admission",
  },
  description: SITE_DESC,
  applicationName: "DPST Admission",
  keywords: ["พสวท", "DPST", "รับสมัคร", "เบญจมราชูทิศ", "วิทยาศาสตร์", "ทุนการศึกษา"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/dpst.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: "DPST Admission",
    title: SITE_NAME,
    description: SITE_DESC,
    url: SITE_URL,
    images: [
      {
        url: "/dpst-OG.png",
        width: 1200,
        height: 630,
        alt: "DPST Admission — ระบบรับสมัครโครงการ พสวท.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESC,
    images: ["/dpst-OG.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${inter.variable} ${sarabun.variable} ${prompt.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <DynamicFontProvider>{children}</DynamicFontProvider>
      </body>
    </html>
  );
}

