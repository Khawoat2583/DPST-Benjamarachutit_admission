"use client";

import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  GraduationCap,
  User,
} from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { ContactFab } from "@/components/shared/contact-fab";
import { Footer } from "@/components/shared/footer";
import { PageBanner } from "@/components/shared/page-banner";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 font-prompt">
      <Navbar />

      <PageBanner
        title="ติดต่อสอบถามข้อมูล"
        subtitle="ติดต่อสอบถามข้อมูลโครงการ พสวท. โรงเรียนเบญจมราชูทิศ"
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-12 gap-8 items-start">

          {/* Left: Map + Coordinator */}
          <div className="md:col-span-7 space-y-6">

            {/* Map Card */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 border-l-4 border-l-[#0b52a7] shadow-sm">
              <div className="p-6 flex gap-4">
                <MapPin className="h-5 w-5 text-[#0b52a7] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">สถานที่ติดต่อ / ที่อยู่</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">ศูนย์โครงการ พสวท. โรงเรียนเบญจมราชูทิศ</p>
                  <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed pt-1">
                    159 หมู่ที่ 3 ถนนนาพรุ-ท่าแพ ตำบลโพธิ์เสด็จ<br />
                    อำเภอเมือง จังหวัดนครศรีธรรมราช 80000
                  </p>
                </div>
              </div>
              <div className="mx-6 mb-6 overflow-hidden border border-slate-100 dark:border-zinc-800 h-60 relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.714578144299!2d99.92074391151604!3d8.43817449156686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x305300b64389fb45%3A0x167feecface97cdc!2sBenjamarachutit%20Nakhon%20Sri%20Thammarat%20School!5e0!3m2!1sen!2sth!4v1716712345678!5m2!1sen!2sth"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  href="https://www.google.com/maps/place/Benjamarachutit+Nakhon+Sri+Thammarat+School/@8.4381745,99.9233242,17z"
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-3 right-3 bg-white dark:bg-zinc-900 text-[#0b52a7] text-xs font-bold px-3 py-1.5 border border-slate-200 dark:border-zinc-700 shadow-sm flex items-center gap-1 hover:bg-slate-50 transition-colors"
                >
                  ดูแผนที่ขนาดใหญ่
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Coordinator Card */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 border-l-4 border-l-[#0b52a7] p-6 shadow-sm flex gap-4">
              <User className="h-5 w-5 text-[#0b52a7] shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">ผู้ประสานงานโครงการ พสวท.</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">ข้อมูลติดต่อโดยตรงของอาจารย์ผู้ประสานงาน</p>
                <div className="pt-1 space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">ครูซัลวาณีย์ เจ๊ะมะหมัด</p>
                  <p className="text-xs font-semibold text-[#0b52a7] dark:text-blue-400">ผู้ประสานงานโครงการฯ</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 pt-2 text-sm">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                      <Phone className="h-4 w-4 text-slate-400" />
                      084-859-3989
                    </span>
                    <span className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                      <Mail className="h-4 w-4 text-slate-400" />
                      Salwanee@benjama.ac.th
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Hours + Links */}
          <div className="md:col-span-5 space-y-6">

            {/* Working Hours */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 border-l-4 border-l-yellow-400 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#0b52a7]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">วันและเวลาราชการ</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-zinc-400">วันจันทร์ – วันศุกร์</span>
                  <span className="font-bold text-slate-900 dark:text-white">08:30 – 16:30 น.</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-zinc-800 pt-3">
                  <span className="text-slate-500 dark:text-zinc-500">วันเสาร์ – วันอาทิตย์</span>
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-2.5 py-1">
                    ปิดทำการ
                  </span>
                </div>
              </div>
            </div>

            {/* Identity */}
            <div className="bg-[#0b52a7] p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <img src="/dpste_logo.png" alt="DPST Logo" className="h-12 w-auto object-contain" />
                <img src="/dpste.png" alt="DPST Text" className="h-9 w-auto object-contain brightness-0 invert" />
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                โครงการพัฒนาและส่งเสริมผู้มีความสามารถพิเศษทางวิทยาศาสตร์และเทคโนโลยี
                ศูนย์โรงเรียนเบญจมราชูทิศ นครศรีธรรมราช
              </p>
            </div>

            {/* External Links */}
            <div className="space-y-2">
              <a
                href="https://www.benjama.ac.th"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:border-[#0b52a7] text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:text-[#0b52a7] dark:hover:text-blue-400 transition-colors group"
              >
                <span className="flex items-center gap-2.5">
                  <GraduationCap className="h-4 w-4" />
                  เว็บไซต์โรงเรียนเบญจมราชูทิศ
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#0b52a7] transition-colors" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61570098151261"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:border-[#0b52a7] text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:text-[#0b52a7] dark:hover:text-blue-400 transition-colors group"
              >
                <span className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z" />
                  </svg>
                  เพจ Facebook โครงการ
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#0b52a7] transition-colors" />
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer />
      <ContactFab />
    </div>
  );
}
