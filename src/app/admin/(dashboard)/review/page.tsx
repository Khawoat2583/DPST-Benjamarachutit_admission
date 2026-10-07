import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { like, or, eq, and, desc } from "drizzle-orm";
import { Search, Filter, RefreshCw, FileSearch } from "lucide-react";
import DashboardWrapper from "../dashboard-wrapper";

export const revalidate = 0; // Ensure lists are always up-to-date

type SearchParams = Promise<{
  q?: string;
  status?: string;
}>;

interface PageProps {
  searchParams: SearchParams;
}

const validStatuses = ["draft", "submitted", "approved", "rejected", "ranked", "exported"] as const;
type ApplicationStatusFilter = (typeof validStatuses)[number];

function isApplicationStatusFilter(value: string): value is ApplicationStatusFilter {
  return validStatuses.includes(value as ApplicationStatusFilter);
}

export default async function AdminReviewListPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const selectedStatus = resolvedParams.status || "";

  const searchCondition = q
    ? or(
        like(applications.firstName, `%${q}%`),
        like(applications.lastName, `%${q}%`),
        like(applications.nationalId, `%${q}%`),
        like(applications.schoolName, `%${q}%`)
      )
    : undefined;
  const statusCondition =
    selectedStatus && isApplicationStatusFilter(selectedStatus)
      ? eq(applications.status, selectedStatus)
      : undefined;
  const whereCondition =
    searchCondition && statusCondition
      ? and(searchCondition, statusCondition)
      : searchCondition || statusCondition;

  // 2. Fetch applications with filters
  const filteredApps = await db
    .select({
      id: applications.id,
      firstName: applications.firstName,
      lastName: applications.lastName,
      nationalId: applications.nationalId,
      schoolName: applications.schoolName,
      gpax: applications.gpax,
      status: applications.status,
      updatedAt: applications.updatedAt,
      announcementOrder: applications.announcementOrder,
    })
    .from(applications)
    .where(whereCondition)
    .orderBy(desc(applications.updatedAt));

  // Helper status color mapper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 text-xs font-bold border border-slate-200 dark:border-zinc-700">
            แบบร่าง
          </span>
        );
      case "submitted":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 text-xs font-bold border border-amber-100 dark:border-amber-900/30">
            ส่งแล้ว (รอดำเนินการ)
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-900/30">
            อนุมัติเอกสารแล้ว
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-bold border border-rose-100 dark:border-rose-900/30">
            ตีกลับแก้ไข
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0b52a7]/10 text-[#0b52a7] dark:bg-blue-950/20 dark:text-blue-400 text-xs font-bold border border-[#0b52a7]/20 dark:border-blue-900/30">
            {status}
          </span>
        );
    }
  };

  return (
    <DashboardWrapper
      title="ตรวจสอบข้อมูลและเอกสารใบสมัคร"
      subtitle="ระบบตรวจสอบข้อมูลส่วนบุคคล เกรดเฉลี่ยรายวิชา และไฟล์เอกสารหลักฐานประกอบการสมัครของผู้สมัครสอบ"
      icon={FileSearch}
      actions={
        <Link
          href="/admin/review"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all shrink-0 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>รีเฟรชหน้าจอ</span>
        </Link>
      }
    >

      {/* Filter and Search Bar Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-[#0b52a7] p-5 md:p-6 shadow-sm">
        <form method="GET" className="grid sm:grid-cols-12 gap-4 items-center">
          {/* Search Inputs */}
          <div className="sm:col-span-6 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="ค้นหาชื่อ, นามสกุล, เลขประจำตัวประชาชน หรือโรงเรียนเดิม..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 rounded-none text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0b52a7]/40"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-4 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Filter className="h-4.5 w-4.5" />
            </span>
            <select
              name="status"
              defaultValue={selectedStatus}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 rounded-none text-sm text-slate-800 dark:text-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-[#0b52a7]/40 appearance-none cursor-pointer font-semibold"
            >
              <option value="">กรองทุกสถานะใบสมัคร</option>
              <option value="draft">บันทึกแบบร่าง (Draft)</option>
              <option value="submitted">ยื่นใบสมัครแล้ว (Submitted)</option>
              <option value="approved">อนุมัติเอกสารแล้ว (Approved)</option>
              <option value="rejected">ตีกลับแก้ไข (Rejected)</option>
            </select>
            {/* Custom arrow down */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* Action Button */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#0b52a7] hover:bg-[#08407f] text-white font-bold text-sm rounded-none transition-all shadow-sm cursor-pointer"
            >
              ค้นข้อมูล
            </button>
          </div>
        </form>
      </div>

      {/* Candidates List Container */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="overflow-x-auto">
          {filteredApps.length > 0 ? (
            <table className="w-full text-left text-sm border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 font-bold text-xs uppercase">
                  <th className="py-3.5 px-4 font-bold">ลำดับรอบแรก</th>
                  <th className="py-3.5 px-4 font-bold">ชื่อ-นามสกุล</th>
                  <th className="py-3.5 px-4 font-bold">เลขประจำตัวประชาชน</th>
                  <th className="py-3.5 px-4 font-bold">โรงเรียนเดิม</th>
                  <th className="py-3.5 px-4 font-bold text-center">GPAX (5 เทอม)</th>
                  <th className="py-3.5 px-4 font-bold text-center">สถานะ</th>
                  <th className="py-3.5 px-4 font-bold text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                {filteredApps.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-zinc-300 font-mono">
                      {app.announcementOrder}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {app.firstName} {app.lastName}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-zinc-400 font-mono">
                      {app.nationalId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 font-medium">
                      {app.schoolName || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center font-extrabold text-[#0b52a7] dark:text-blue-400">
                      {app.gpax ? Number(app.gpax).toFixed(2) : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/admin/review/${app.id}`}
                        className="inline-flex items-center justify-center px-3.5 py-2 bg-[#0b52a7]/10 hover:bg-[#0b52a7]/20 dark:bg-blue-950/30 dark:hover:bg-blue-950/55 text-[#0b52a7] dark:text-blue-400 text-xs font-bold transition-all duration-200"
                      >
                        ตรวจสอบ
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20">
              <p className="text-sm font-semibold text-slate-500 dark:text-zinc-500">
                ไม่พบข้อมูลใบสมัครที่ตรงตามเงื่อนไขการค้นหา
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardWrapper>
  );
}
