import React from "react";
import { FileSpreadsheet, CheckCircle, AlertTriangle } from "lucide-react";

interface PreflightSummaryProps {
  fileName: string;
  fileSize: number;
  resetSelectedFile: () => void;
  totalRows: number;
  matchedCount: number;
  mismatchCount: number;
}

export function PreflightSummary({
  fileName,
  fileSize,
  resetSelectedFile,
  totalRows,
  matchedCount,
  mismatchCount,
}: PreflightSummaryProps) {
  return (
    <div className="space-y-6">
      {/* File summary bar */}
      <div className="bg-slate-100 dark:bg-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0b52a7] text-white">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{fileName}</p>
            <p className="text-[10px] text-slate-500 font-semibold font-mono">
              ขนาดไฟล์: {Math.round(fileSize / 1024)} KB • วิเคราะห์ผ่านเกณฑ์เรียบร้อย
            </p>
          </div>
        </div>
        <button
          onClick={resetSelectedFile}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:hover:text-rose-400 bg-white dark:bg-zinc-950 px-4 py-2 transition-all cursor-pointer self-start sm:self-auto border border-slate-200 dark:border-zinc-800"
        >
          ยกเลิกและเลือกไฟล์ใหม่
        </button>
      </div>

      {/* Preflight statistics cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Row Parse */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-[#0b52a7] p-5 shadow-sm space-y-2">
          <p className="text-xs font-bold text-slate-400">จำนวนแถวที่ประมวลผลทั้งหมด</p>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {totalRows.toLocaleString()} <span className="text-xs font-semibold text-slate-400">รายการ</span>
          </h3>
          <p className="text-[10px] text-slate-500 font-medium">ไม่นับรวมแถวหัวตารางและแถวว่างเปล่า</p>
        </div>

        {/* Matched Applicant */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-emerald-500 p-5 shadow-sm space-y-2">
          <p className="text-xs font-bold text-emerald-500">จับคู่ตรงกับผู้สมัครในฐานข้อมูล</p>
          <h3 className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {matchedCount.toLocaleString()} <span className="text-xs font-semibold text-slate-400">รายการ</span>
          </h3>
          <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5" />
            มีใบสมัครสมบูรณ์ในฐานข้อมูล ค้นหาจับคู่ได้ถูกต้อง
          </p>
        </div>

        {/* Mismatched / Warning */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-amber-500 p-5 shadow-sm space-y-2">
          <p className="text-xs font-bold text-amber-500">ไม่พบเลขลำดับประกาศในฐานข้อมูล</p>
          <h3 className="text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400">
            {mismatchCount.toLocaleString()} <span className="text-xs font-semibold text-slate-400">รายการ</span>
          </h3>
          <p className="text-[10px] text-amber-600 font-semibold flex items-start gap-1">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>คำเตือน: คะแนนเหล่านี้จะถูกเซฟเก็บไว้ แต่จะไม่ผูกโยงชื่อสมัครสะสม</span>
          </p>
        </div>
      </div>
    </div>
  );
}
