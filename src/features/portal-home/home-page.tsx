import React from "react";
import Link from "next/link";
import { FileText, Search, CheckCircle, ClipboardCheck, Megaphone, ArrowRight, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { ContactFab } from "@/components/shared/contact-fab";
import { Footer } from "@/components/shared/footer";
import { PageBanner } from "@/components/shared/page-banner";
import { getSystemSettings } from "@/lib/system-settings";
import { RegistrationCountdown } from "./registration-countdown";

export default function PortalHomePage() {
  const settings = getSystemSettings();
  const deadline = settings.registrationCloseAt ?? process.env.REGISTRATION_DEADLINE ?? null;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-prompt text-slate-800 dark:text-zinc-200">
      <Navbar />

      <PageBanner
        title="ระบบรับสมัครโครงการ พสวท."
        subtitle="ระบบรับสมัครโครงการ พสวท. ระดับมัธยมศึกษาตอนปลาย"
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        <RegistrationCountdown deadline={deadline} closed={settings.isRegistrationClosed} />

        {/* Welcome notice */}
        <div className="flex gap-4 items-start border border-[#0b52a7]/20 dark:border-blue-800/30 border-l-4 border-l-[#0b52a7] bg-[#0b52a7]/[0.03] dark:bg-blue-950/10 p-5">
          <div className="shrink-0 h-9 w-9 bg-[#0b52a7] flex items-center justify-center text-white mt-0.5">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-black tracking-[0.15em] text-[#0b52a7] dark:text-blue-400 uppercase mb-1">
              ประกาศ / ยินดีต้อนรับ
            </p>
            <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
              ยินดีต้อนรับผู้สมัครเข้าสู่ระบบรับสมัครนักเรียนออนไลน์
              โครงการพัฒนาและส่งเสริมผู้มีความสามารถพิเศษทางวิทยาศาสตร์และเทคโนโลยี (พสวท.)
              กรุณาเลือกดำเนินการตามขั้นตอนด้านล่าง
            </p>
          </div>
        </div>

        {/* Two-column content */}
        <div className="grid lg:grid-cols-5 gap-10 items-start">

          {/* Left: Action Cards */}
          <div className="lg:col-span-3 space-y-5">
            <SectionHeading label="เลือกดำเนินการ" leadLine />

            <ActionCard
              href="/apply"
              step="ขั้นตอนที่ 1"
              title="กรอกใบสมัครออนไลน์"
              description="กรอกประวัติการเรียน อัปโหลดไฟล์หลักฐาน ปพ.1 และส่งใบสมัคร"
              icon={<FileText className="h-7 w-7 text-white" />}
              primary
            />

            <ActionCard
              href="/status"
              step="ตรวจสอบสถานะ"
              title="ตรวจสอบสถานะการสมัคร"
              description="ติดตามความคืบหน้าการตรวจเอกสารและผลการสมัครสอบ"
              icon={<Search className="h-7 w-7 text-slate-500 dark:text-zinc-400" />}
            />

            <div className="pt-1 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 dark:text-zinc-500 hover:text-[#0b52a7] dark:hover:text-blue-400 transition-colors"
              >
                มีข้อสงสัย? ติดต่อสอบถามศูนย์โครงการ พสวท.
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right: Process Timeline */}
          <div className="lg:col-span-2 space-y-5">
            <SectionHeading label="ขั้นตอนการสมัคร" />

            <div className="relative pl-1">
              {/* Connecting line */}
              <div
                className="absolute left-[18px] top-5 bottom-5 w-px bg-slate-200 dark:bg-zinc-700"
                aria-hidden="true"
              />

              {[
                {
                  num: 1,
                  icon: <FileText className="h-3.5 w-3.5" />,
                  title: "สมัครออนไลน์",
                  desc: "กรอกประวัติ แนบไฟล์ ปพ.1 และยืนยันการสมัคร",
                },
                {
                  num: 2,
                  icon: <ClipboardCheck className="h-3.5 w-3.5" />,
                  title: "ตรวจสอบหลักฐาน",
                  desc: "เจ้าหน้าที่ตรวจสอบเอกสารและยืนยันสิทธิ์การสอบ",
                },
                {
                  num: 3,
                  icon: <Megaphone className="h-3.5 w-3.5" />,
                  title: "ประกาศผลการสอบ",
                  desc: "ประกาศผลสอบคัดเลือกและจัดอันดับสิทธิ์เข้าศึกษา",
                },
                {
                  num: 4,
                  icon: <CheckCircle className="h-3.5 w-3.5" />,
                  title: "ยืนยันสิทธิ์",
                  desc: "ยืนยันสิทธิ์เข้าศึกษาต่อในโครงการ พสวท.",
                },
              ].map((step, idx, arr) => (
                <div key={step.num} className="relative flex gap-4 mb-5 last:mb-0">
                  <div className="relative z-10 shrink-0 h-9 w-9 bg-[#0b52a7] flex items-center justify-center text-white text-xs font-black">
                    {step.num}
                  </div>
                  <div className={`flex-1 pt-1 pb-5 ${idx < arr.length - 1 ? "border-b border-dashed border-slate-200 dark:border-zinc-800" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#0b52a7] dark:text-blue-400">{step.icon}</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Eligibility pre-check CTA */}
        <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-yellow-400 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 bg-[#0b52a7] flex items-center justify-center text-white shrink-0">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">ตรวจสอบคุณสมบัติเบื้องต้น</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 max-w-xl leading-relaxed">
                กรอกผลการเรียนรายวิชาพื้นฐาน 5 ภาคเรียน เพื่อประเมินว่าผ่านเกณฑ์ขั้นต่ำหรือไม่ ก่อนเริ่มกรอกใบสมัครจริง
                — ระบบจะบันทึกข้อมูลไว้ให้นำไปใช้ต่อในใบสมัครได้เลย
              </p>
            </div>
          </div>
          <Link
            href="/eligibility"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#0b52a7] text-[#0b52a7] dark:text-blue-400 dark:border-blue-600 font-bold text-sm hover:bg-[#0b52a7] hover:text-white transition-colors shrink-0"
          >
            ตรวจสอบคุณสมบัติ
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <Footer />
      <ContactFab />
    </div>
  );
}

function SectionHeading({ label, leadLine }: { label: string; leadLine?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {leadLine && <span className="h-px flex-1 bg-slate-200 dark:bg-zinc-700" />}
      <h2 className="text-[10px] font-black tracking-[0.18em] text-slate-400 dark:text-zinc-500 uppercase shrink-0">
        {label}
      </h2>
      <span className="h-px flex-1 bg-slate-200 dark:bg-zinc-700" />
    </div>
  );
}

function ActionCard({
  href,
  step,
  title,
  description,
  icon,
  primary = false,
}: {
  href: string;
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link href={href} className="group block">
      <div
        className={`relative flex overflow-hidden border shadow-sm group-hover:shadow-md transition-all duration-200 ${
          primary
            ? "border-[#0b52a7]/30 dark:border-blue-800/40 border-l-4 border-l-[#0b52a7]"
            : "border-slate-200 dark:border-zinc-700 border-l-4 border-l-slate-300 dark:border-l-zinc-600"
        } bg-white dark:bg-zinc-900`}
      >
        {/* Icon panel */}
        <div
          className={`shrink-0 w-20 flex items-center justify-center self-stretch min-h-[108px] ${
            primary ? "bg-[#0b52a7]" : "bg-slate-100 dark:bg-zinc-800"
          }`}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-5 flex flex-col justify-center">
          <span
            className={`inline-block text-[9px] font-black tracking-[0.15em] uppercase px-2 py-0.5 mb-2 w-fit ${
              primary
                ? "bg-[#0b52a7]/10 text-[#0b52a7] dark:text-blue-400"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"
            }`}
          >
            {step}
          </span>
          <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug mb-1.5">
            {title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Arrow */}
        <div className="shrink-0 flex items-center pr-5">
          <div
            className={`h-8 w-8 border flex items-center justify-center transition-all duration-200 ${
              primary
                ? "border-[#0b52a7]/30 text-[#0b52a7] group-hover:bg-[#0b52a7] group-hover:border-[#0b52a7] group-hover:text-white"
                : "border-slate-200 dark:border-zinc-700 text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-zinc-700"
            }`}
          >
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
