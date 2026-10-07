import React from "react";
import Link from "next/link";
import { GraduationCap, ArrowUpRight } from "lucide-react";

interface GradeAnalyticsProps {
  avgStats: {
    avgGpax: number;
    avgMath: number;
    avgSci: number;
    avgEng: number;
  };
}

export function GradeAnalytics({ avgStats }: GradeAnalyticsProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-[#0b52a7] p-6 md:p-8 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-[#0b52a7] dark:text-blue-400" />
          วิเคราะห์ผลการเรียนเฉลี่ยของผู้สมัคร พสวท.
        </h2>
        <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 mt-1">
          คำนวณถ่วงน้ำหนักโดยเฉลี่ยสะสม 5 ภาคเรียนจากใบสมัครทั้งหมดในระบบ
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* GPAX Box */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 text-center space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500">GPAX รวม 5 เทอม</p>
          <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {Number(avgStats.avgGpax).toFixed(2)}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold">เกณฑ์ขั้นต่ำ &ge; 3.00</p>
        </div>

        {/* Math GPA Box */}
        <div className="p-4 bg-[#0b52a7]/5 dark:bg-blue-950/20 border border-[#0b52a7]/20 dark:border-blue-900/40 text-center space-y-1">
          <p className="text-xs font-semibold text-[#0b52a7] dark:text-blue-400">เฉลี่ยคณิตศาสตร์</p>
          <p className="text-2xl md:text-3xl font-black text-[#0b52a7] dark:text-blue-400">
            {Number(avgStats.avgMath).toFixed(2)}
          </p>
          <p className="text-[10px] text-[#0b52a7]/60 dark:text-blue-500 font-semibold">วิชาหลักคัดเลือก</p>
        </div>

        {/* Science GPA Box */}
        <div className="p-4 bg-[#0b52a7]/5 dark:bg-blue-950/20 border border-[#0b52a7]/20 dark:border-blue-900/40 text-center space-y-1">
          <p className="text-xs font-semibold text-[#0b52a7] dark:text-blue-400">เฉลี่ยวิทยาศาสตร์</p>
          <p className="text-2xl md:text-3xl font-black text-[#0b52a7] dark:text-blue-400">
            {Number(avgStats.avgSci).toFixed(2)}
          </p>
          <p className="text-[10px] text-[#0b52a7]/60 dark:text-blue-500 font-semibold">วิชาหลักคัดเลือก</p>
        </div>

        {/* English GPA Box */}
        <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-center space-y-1">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">เฉลี่ยภาษาอังกฤษ</p>
          <p className="text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400">
            {Number(avgStats.avgEng).toFixed(2)}
          </p>
          <p className="text-[10px] text-amber-500 dark:text-amber-600 font-semibold">วิชาสมทบตรวจสอบ</p>
        </div>
      </div>

      <div className="h-px bg-slate-100 dark:bg-zinc-800" />

      {/* Quick System Navigation Indicators */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/admin/review"
          className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 hover:border-[#0b52a7]/40 transition-all duration-200 group text-slate-800 dark:text-zinc-200"
        >
          <div>
            <p className="text-sm font-bold">เริ่มตรวจสอบเอกสารคู่ขนาน</p>
            <p className="text-[10px] text-slate-500 mt-0.5">ตรวจเช็คเกณฑ์และรูป ปพ.1 รายคน</p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-[#0b52a7] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>

        <Link
          href="/admin/workflow"
          className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 hover:border-[#0b52a7]/40 transition-all duration-200 group text-slate-800 dark:text-zinc-200"
        >
          <div>
            <p className="text-sm font-bold">ควบคุมกระบวนการและจัดอันดับ</p>
            <p className="text-[10px] text-slate-500 mt-0.5">ประมวลผลสอบปิดระบบและส่งออกข้อมูล</p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-[#0b52a7] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>
      </div>
    </div>
  );
}
