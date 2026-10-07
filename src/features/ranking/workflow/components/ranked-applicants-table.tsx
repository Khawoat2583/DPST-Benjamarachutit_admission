import { Award, Search } from "lucide-react";
import { GlassCard } from "@/components/common/glass-card";
import { Input } from "@/components/ui/input";
import type { RankedApplicantRecord } from "@/features/ranking/workflow/types";

type RankedApplicantsTableProps = {
  applicants: RankedApplicantRecord[];
  query: string;
  onQueryChange: (value: string) => void;
  totalCount: number;
};

export function RankedApplicantsTable({
  applicants,
  query,
  onQueryChange,
  totalCount,
}: RankedApplicantsTableProps) {
  return (
    <GlassCard className="space-y-6 border border-slate-200 border-l-4 border-l-[#0b52a7] bg-white p-6 md:p-8 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <Award className="h-5 w-5 text-[#0b52a7]" />
            สรุปอันดับผลการประเมินคัดเลือกอย่างเป็นทางการ ({totalCount} คน)
          </h2>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            การจัดอันดับได้รับการประมวลผลเรียบร้อยแล้ว แสดงผลตามเกณฑ์คะแนนเฉลี่ยถ่วงน้ำหนักและผลสอบ พสวท.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={query}
            placeholder="ค้นชื่อ, โรงเรียน หรือเลขที่สอบ..."
            onChange={(event) => onQueryChange(event.target.value)}
            className="h-10 rounded-none bg-white pl-10 text-xs font-semibold dark:bg-zinc-900"
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-100 dark:border-zinc-800/80">
        {applicants.length > 0 ? (
          <table className="min-w-[1000px] w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 font-bold uppercase text-slate-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                <th className="w-16 px-4 py-3.5 text-center font-bold">อันดับ</th>
                <th className="w-28 px-4 py-3.5 text-center font-bold">เลขประจำตัวสอบ</th>
                <th className="px-4 py-3.5 font-bold">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3.5 font-bold">โรงเรียนเดิม</th>
                <th className="px-4 py-3.5 text-center font-bold">คะแนนสอบรวม</th>
                <th className="px-4 py-3.5 text-center font-bold">คณิตสอบ</th>
                <th className="px-4 py-3.5 text-center font-bold">วิทย์สอบ</th>
                <th className="px-4 py-3.5 text-center font-bold">ลำดับประกาศ</th>
                <th className="px-4 py-3.5 text-center font-bold">GPA คณิต</th>
                <th className="px-4 py-3.5 text-center font-bold">GPA วิทย์</th>
                <th className="px-4 py-3.5 text-center font-bold">GPA คณิต+วิทย์</th>
                <th className="px-4 py-3.5 text-center font-bold">GPA อังกฤษ</th>
                <th className="px-4 py-3.5 text-center font-bold">GPAX รวม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
              {applicants.map((applicant) => {
                const isTopThree = applicant.rank <= 3;
                const badgeStyles =
                  applicant.rank === 1
                    ? "border border-amber-200 bg-amber-100 font-black text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/30 dark:text-amber-300"
                    : applicant.rank === 2
                      ? "border border-slate-300 bg-slate-200 font-bold text-slate-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      : applicant.rank === 3
                        ? "border border-amber-500/20 bg-amber-500/10 font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                        : "bg-slate-100 text-slate-600 dark:bg-zinc-800/50 dark:text-zinc-400";

                return (
                  <tr
                    key={applicant.id}
                    className={`transition-colors hover:bg-slate-50/40 dark:hover:bg-zinc-800/20 ${isTopThree ? "bg-[#0b52a7]/[0.02]" : ""}`}
                  >
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex h-6 w-6 items-center justify-center text-[10px] ${badgeStyles}`}>
                        {applicant.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-700 dark:text-zinc-300">
                      {applicant.examId}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      {applicant.title} {applicant.firstName} {applicant.lastName}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-600 dark:text-zinc-400">{applicant.schoolName}</td>
                    <td className="px-4 py-3.5 text-center font-black text-[#0b52a7] dark:text-blue-400">
                      {Number(applicant.totalExamScore).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-center font-semibold text-slate-700 dark:text-zinc-300">
                      {Number(applicant.examMathScore).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-center font-semibold text-slate-700 dark:text-zinc-300">
                      {Number(applicant.examScienceScore).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-500 dark:text-zinc-500">
                      {applicant.announcementOrder}
                    </td>
                    <td className="px-4 py-3.5 text-center font-semibold text-[#0b52a7]/80 dark:text-blue-400/80">
                      {Number(applicant.mathGpa).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-center font-semibold text-slate-600 dark:text-zinc-400">
                      {Number(applicant.scienceGpa).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-black text-slate-700 dark:text-zinc-300">
                      {Number(applicant.mathSciGpa).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-center font-semibold text-emerald-600/80 dark:text-emerald-400/80">
                      {Number(applicant.englishGpa).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-center font-black text-slate-950 dark:text-white">
                      {Number(applicant.gpax).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="bg-slate-50/50 py-12 text-center dark:bg-zinc-950/10">
            <p className="text-sm font-semibold text-slate-500 dark:text-zinc-500">ไม่พบผู้สมัครที่ตรงกับคำค้นหาของคุณ</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
