import React from "react";
import { FileSpreadsheet, Download, HelpCircle } from "lucide-react";

interface TemplateGuideProps {
  downloadTemplate: () => void;
}

export function TemplateGuide({ downloadTemplate }: TemplateGuideProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 rounded-none p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#0b52a7]/10 dark:bg-blue-950/40 text-[#0b52a7] dark:text-blue-400">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              รูปแบบโครงสร้างไฟล์ Excel ที่ระบบแนะนำ
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              ไฟล์นำเข้าควรระบุหัวตารางในแถวแรก (Row 1) และเรียงลำดับคอลัมน์ที่ต้องการดังนี้
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            downloadTemplate();
          }}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0b52a7] hover:bg-[#08407f] text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
        >
          <Download className="h-4 w-4" />
          <span>ดาวน์โหลดเทมเพลตตัวอย่าง (.csv)</span>
        </button>
      </div>

      {/* Mock Spreadsheet Grid */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-zinc-500 select-none">
          <HelpCircle className="h-4 w-4" />
          <span>ตัวอย่างการกรอกข้อมูลและโครงสร้างหัวตาราง (Excel Sheet View):</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-none shadow-xs">
          <table className="w-full text-left text-xs border-collapse min-w-[650px] bg-slate-50/30 dark:bg-zinc-950/10">
            <thead>
              <tr className="bg-slate-100 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-zinc-550 font-bold select-none text-[10px]">
                <th className="py-1 px-3 border-r border-slate-200 dark:border-zinc-700 text-center w-12 bg-slate-200/50 dark:bg-zinc-850"></th>
                <th className="py-1 px-3 border-r border-slate-200 dark:border-zinc-700 text-center uppercase">A</th>
                <th className="py-1 px-3 border-r border-slate-200 dark:border-zinc-700 text-center uppercase">B</th>
                <th className="py-1 px-3 border-r border-slate-200 dark:border-zinc-700 text-center uppercase">C</th>
                <th className="py-1 px-3 text-center uppercase">D</th>
              </tr>
              <tr className="bg-[#0b52a7]/5 dark:bg-blue-950/10 border-b border-slate-200 dark:border-zinc-700 text-[#0b52a7] dark:text-blue-400 font-extrabold text-[11px]">
                <td className="py-2.5 px-3 border-r border-slate-200 dark:border-zinc-700 text-center font-bold bg-slate-100 dark:bg-zinc-800 text-slate-400 select-none w-12">1</td>
                <td className="py-2.5 px-3 border-r border-slate-200 dark:border-zinc-700 font-bold">
                  เลขประจำตัวสอบ
                  <span className="text-[9px] font-semibold text-slate-450 dark:text-zinc-500 block font-mono mt-0.5">exam_id</span>
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200 dark:border-zinc-700 font-bold">
                  ลำดับประกาศ
                  <span className="text-[9px] font-semibold text-slate-450 dark:text-zinc-500 block font-mono mt-0.5">announcement_order</span>
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200 dark:border-zinc-700 font-bold">
                  คะแนนคณิตศาสตร์
                  <span className="text-[9px] font-semibold text-slate-450 dark:text-zinc-500 block font-mono mt-0.5">math_score</span>
                </td>
                <td className="py-2.5 px-3 font-bold">
                  คะแนนวิทยาศาสตร์
                  <span className="text-[9px] font-semibold text-slate-450 dark:text-zinc-500 block font-mono mt-0.5">science_score</span>
                </td>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 font-mono text-[11px] text-slate-700 dark:text-zinc-350">
              <tr className="hover:bg-slate-100/30 dark:hover:bg-zinc-800/10">
                <td className="py-2.5 px-3 border-r border-slate-200 dark:border-zinc-700 text-center font-bold bg-slate-100 dark:bg-zinc-800 text-slate-400 select-none w-12">2</td>
                <td className="py-2.5 px-3 border-r border-slate-200 dark:border-zinc-700 font-bold text-slate-900 dark:text-white">EX69001</td>
                <td className="py-2.5 px-3 border-r border-slate-200 dark:border-zinc-700 font-extrabold text-[#0b52a7] dark:text-blue-400 text-center">1</td>
                <td className="py-2.5 px-3 border-r border-slate-200 dark:border-zinc-700 text-center">85.50</td>
                <td className="py-2.5 px-3 text-center">78.00</td>
              </tr>
              <tr className="hover:bg-slate-100/30 dark:hover:bg-zinc-800/10">
                <td className="py-2.5 px-3 border-r border-slate-200 dark:border-zinc-700 text-center font-bold bg-slate-100 dark:bg-zinc-800 text-slate-400 select-none w-12">3</td>
                <td className="py-2.5 px-3 border-r border-slate-200 dark:border-zinc-700 font-bold text-slate-900 dark:text-white">EX69002</td>
                <td className="py-2.5 px-3 border-r border-slate-200 dark:border-zinc-700 font-extrabold text-[#0b52a7] dark:text-blue-400 text-center">2</td>
                <td className="py-2.5 px-3 border-r border-slate-200 dark:border-zinc-700 text-center">74.00</td>
                <td className="py-2.5 px-3 text-center">88.50</td>
              </tr>
              <tr className="hover:bg-slate-100/30 dark:hover:bg-zinc-800/10">
                <td className="py-2.5 px-3 border-r border-slate-200 dark:border-zinc-700 text-center font-bold bg-slate-100 dark:bg-zinc-800 text-slate-400 select-none w-12">4</td>
                <td className="py-2.5 px-3 border-r border-slate-200 dark:border-zinc-700 font-bold text-slate-900 dark:text-white">EX69003</td>
                <td className="py-2.5 px-3 border-r border-slate-200 dark:border-zinc-700 font-extrabold text-[#0b52a7] dark:text-blue-400 text-center">3</td>
                <td className="py-2.5 px-3 border-r border-slate-200 dark:border-zinc-700 text-center">92.00</td>
                <td className="py-2.5 px-3 text-center">91.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Field guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="bg-slate-50 dark:bg-zinc-950/20 p-4 rounded-none border border-slate-100 dark:border-zinc-850 space-y-2">
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-yellow-400" />
            รายละเอียดคอลัมน์สำคัญ
          </h4>
          <ul className="text-xs text-slate-650 dark:text-zinc-400 space-y-2 font-semibold pl-2">
            <li>
              <span className="font-bold text-slate-800 dark:text-zinc-300">1. เลขประจำตัวสอบ (Column A):</span> รหัสระบุตัวตนของการสอบรอบแรกของผู้สมัคร (เช่น <code className="bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 font-mono font-bold text-[#0b52a7]">EX69001</code>)
            </li>
            <li>
              <span className="font-bold text-slate-800 dark:text-zinc-300">2. ลำดับประกาศ (Column B):</span> เลขลำดับในประกาศผลสอบรอบแรก ซึ่งเป็นคีย์สำหรับ **เชื่อมโยงจับคู่** กับข้อมูลใบสมัครสะสมในระบบพอร์ทัล
            </li>
          </ul>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-950/20 p-4 rounded-none border border-slate-100 dark:border-zinc-850 space-y-2">
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-yellow-400" />
            กฎระเบียบการกรอกคะแนน
          </h4>
          <ul className="text-xs text-slate-650 dark:text-zinc-400 space-y-2 font-semibold pl-2">
            <li>
              <span className="font-bold text-slate-800 dark:text-zinc-300">3. คะแนนคณิตศาสตร์ (Column C):</span> คะแนนเต็มปกติ รองรับทศนิยมสูงสุด 2 ตำแหน่ง
            </li>
            <li>
              <span className="font-bold text-slate-800 dark:text-zinc-300">4. คะแนนวิทยาศาสตร์ (Column D):</span> คะแนนเต็มปกติ รองรับทศนิยมสูงสุด 2 ตำแหน่ง
            </li>
          </ul>
        </div>
      </div>

      <div className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold bg-slate-100/50 dark:bg-zinc-950/10 p-3 rounded-none leading-relaxed">
        💡 **คำแนะนำการจับคู่ (Automatic Mapping):** ระบบวิเคราะห์หัวตารางอัจฉริยะ (Smart Header Resolver) ของพอร์ทัลจะทำการจับคู่คอลัมน์โดยไม่จำกัดตัวพิมพ์เล็ก-ใหญ่ และพิจารณาจากคำที่มี เช่น &quot;เลขประจำตัวสอบ&quot;, &quot;ลำดับประกาศ&quot;, &quot;คณิต&quot;, &quot;วิทย์&quot; เพื่อให้สามารถใช้ไฟล์ Excel จากคณะกรรมการกลางนำเข้าได้อย่างยืดหยุ่นที่สุด
      </div>
    </div>
  );
}
