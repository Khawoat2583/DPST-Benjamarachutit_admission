import React from "react";
import Link from "next/link";

interface Submission {
  id: number;
  firstName: string;
  lastName: string;
  nationalId: string;
  gpax: string | null;
  status: string;
  submittedAt: Date | null;
}

interface RecentSubmissionsTableProps {
  latestSubmissions: Submission[];
}

export function RecentSubmissionsTable({ latestSubmissions }: RecentSubmissionsTableProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-[#0b52a7] p-6 md:p-8 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            คิวใบสมัครส่งใหม่รอดำเนินการล่าสุด (Submitted Queue)
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 mt-0.5">
            แสดงใบสมัครที่ส่งเข้ามารอการคัดกรองเอกสารระเบียน ปพ.1 ลำดับ 5 คนแรกสุด
          </p>
        </div>
        <Link
          href="/admin/review"
          className="text-xs font-extrabold text-[#0b52a7] hover:text-[#08407f] dark:text-blue-400 dark:hover:text-blue-300 transition-colors shrink-0"
        >
          ดูคิวผู้สมัครทั้งหมด &rarr;
        </Link>
      </div>

      <div className="overflow-x-auto">
        {latestSubmissions.length > 0 ? (
          <table className="w-full text-left text-sm border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 font-bold text-xs uppercase">
                <th className="py-3 px-4 font-bold">ชื่อ-นามสกุล</th>
                <th className="py-3 px-4 font-bold">เลขประจำตัวประชาชน</th>
                <th className="py-3 px-4 font-bold text-center">GPAX 5 เทอม</th>
                <th className="py-3 px-4 font-bold text-center">สถานะ</th>
                <th className="py-3 px-4 font-bold text-center">วันที่ยื่นคำขอ</th>
                <th className="py-3 px-4 font-bold text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
              {latestSubmissions.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {app.firstName} {app.lastName}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-zinc-400 font-mono">
                    {app.nationalId}
                  </td>
                  <td className="py-3.5 px-4 text-center font-black text-[#0b52a7] dark:text-blue-400">
                    {app.gpax ? Number(app.gpax).toFixed(2) : "-"}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-100 dark:border-amber-900/30">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                      รอดำเนินการ
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-500 dark:text-zinc-500">
                    {app.submittedAt
                      ? new Date(app.submittedAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) + " น."
                      : "-"}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Link
                      href={`/admin/review/${app.id}`}
                      className="inline-flex items-center justify-center px-3 py-1.5 bg-[#0b52a7]/10 hover:bg-[#0b52a7]/20 dark:bg-blue-950/30 dark:hover:bg-blue-950/55 text-[#0b52a7] dark:text-blue-400 text-xs font-bold transition-all duration-200"
                    >
                      เปิด Canvas ตรวจทาน
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10 border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20">
            <p className="text-sm font-semibold text-slate-500 dark:text-zinc-500">
              ไม่มีใบสมัครที่ส่งเข้ามาใหม่ในขณะนี้
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
