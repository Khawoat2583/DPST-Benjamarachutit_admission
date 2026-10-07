import React from "react";

interface ParsedRow {
  rowNum: number;
  examId: string;
  announcementOrder: number;
  studentName: string | null;
  mathScore: string;
  scienceScore: string;
  status: "matched" | "mismatch";
}

interface PreflightTableProps {
  displayedRows: ParsedRow[];
  mismatchCount: number;
  filterMismatchOnly: boolean;
  setFilterMismatchOnly: (checked: boolean) => void;
}

export function PreflightTable({
  displayedRows,
  mismatchCount,
  filterMismatchOnly,
  setFilterMismatchOnly,
}: PreflightTableProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-[#0b52a7] p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-850 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            ตารางจำแนกผลวิเคราะห์ความเข้ากันได้ (Preflight Summary Table)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            โปรดตรวจสอบความครบถ้วนก่อนยืนยันกดบันทึกเขียนทับคะแนน (Upsert Transaction) ลงฐานข้อมูล
          </p>
        </div>

        {/* Mismatch toggle checkbox filter */}
        {mismatchCount > 0 && (
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 border border-amber-100 dark:border-amber-900/30">
            <input
              type="checkbox"
              checked={filterMismatchOnly}
              onChange={(e) => setFilterMismatchOnly(e.target.checked)}
              className="h-3.5 w-3.5 cursor-pointer accent-amber-500"
            />
            <span>กรองแสดงเฉพาะคอลัมน์ที่ไม่พบคู่ตรง ({mismatchCount})</span>
          </label>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 font-bold uppercase">
              <th className="py-2.5 px-3 font-bold text-center">แถวที่</th>
              <th className="py-2.5 px-3 font-bold">เลขประจำตัวสอบรอบแรก</th>
              <th className="py-2.5 px-3 font-bold text-center">ลำดับประกาศสอบ</th>
              <th className="py-2.5 px-3 font-bold">ชื่อ-นามสกุลผู้สมัครที่จับคู่</th>
              <th className="py-2.5 px-3 font-bold text-center">คะแนนคณิต</th>
              <th className="py-2.5 px-3 font-bold text-center">คะแนนวิทย์</th>
              <th className="py-2.5 px-3 font-bold text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
            {displayedRows.map((row) => (
              <tr
                key={row.rowNum}
                className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors"
              >
                <td className="py-2.5 px-3 text-center text-slate-400 font-semibold font-mono">
                  {row.rowNum}
                </td>
                <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-zinc-300 font-mono">
                  {row.examId}
                </td>
                <td className="py-2.5 px-3 text-center font-bold text-slate-700 dark:text-zinc-400 font-mono">
                  {row.announcementOrder}
                </td>
                <td className="py-2.5 px-3 font-bold">
                  {row.studentName ? (
                    <span className="text-slate-900 dark:text-white">
                      {row.studentName}
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-zinc-650 italic font-semibold">
                      - ไม่มีใบสมัครสะสมในระบบ -
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-center font-extrabold text-slate-800 dark:text-zinc-300 font-mono">
                  {row.mathScore}
                </td>
                <td className="py-2.5 px-3 text-center font-extrabold text-slate-800 dark:text-zinc-300 font-mono">
                  {row.scienceScore}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {row.status === "matched" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold">
                      <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                      จับคู่สำเร็จ
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 font-bold">
                      <span className="w-1 h-1 bg-amber-500 rounded-full" />
                      พบคะแนนเดี่ยว
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
