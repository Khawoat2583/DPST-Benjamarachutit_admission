import React from "react";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { TrendingUp } from "lucide-react";
import { StatsCards } from "@/features/admin-dashboard/components/stats-cards";
import { GradeAnalytics } from "@/features/admin-dashboard/components/grade-analytics";
import { WorkflowGuide } from "@/features/admin-dashboard/components/workflow-guide";
import { RecentSubmissionsTable } from "@/features/admin-dashboard/components/recent-submissions-table";
import DashboardWrapper from "./dashboard-wrapper";

export const revalidate = 0; // Disable static cache to keep stats completely real-time

export default async function AdminDashboardPage() {
  // 1. Fetch counts grouped by status
  const allApps = await db.select({ count: sql<number>`count(*)` }).from(applications);
  const draftApps = await db.select({ count: sql<number>`count(*)` }).from(applications).where(eq(applications.status, "draft"));
  const submittedApps = await db.select({ count: sql<number>`count(*)` }).from(applications).where(eq(applications.status, "submitted"));
  const approvedApps = await db.select({ count: sql<number>`count(*)` }).from(applications).where(eq(applications.status, "approved"));
  const rejectedApps = await db.select({ count: sql<number>`count(*)` }).from(applications).where(eq(applications.status, "rejected"));

  const stats = {
    total: Number(allApps[0]?.count || 0),
    draft: Number(draftApps[0]?.count || 0),
    submitted: Number(submittedApps[0]?.count || 0),
    approved: Number(approvedApps[0]?.count || 0),
    rejected: Number(rejectedApps[0]?.count || 0),
  };

  // 2. Fetch subject GPAX and grade averages (cast as numeric to calculate correctly)
  const averages = await db.select({
    avgGpax: sql<number>`COALESCE(ROUND(AVG(CAST(gpax AS numeric)), 2), 0)`,
    avgMath: sql<number>`COALESCE(ROUND(AVG(CAST(math_gpa AS numeric)), 2), 0)`,
    avgSci: sql<number>`COALESCE(ROUND(AVG(CAST(science_gpa AS numeric)), 2), 0)`,
    avgEng: sql<number>`COALESCE(ROUND(AVG(CAST(english_gpa AS numeric)), 2), 0)`,
  }).from(applications);

  const avgStats = averages[0] || { avgGpax: 0, avgMath: 0, avgSci: 0, avgEng: 0 };

  // 3. Fetch latest 5 submitted applications for quick access
  const latestSubmissions = await db
    .select({
      id: applications.id,
      firstName: applications.firstName,
      lastName: applications.lastName,
      nationalId: applications.nationalId,
      gpax: applications.gpax,
      status: applications.status,
      submittedAt: applications.submittedAt,
    })
    .from(applications)
    .where(eq(applications.status, "submitted"))
    .orderBy(desc(applications.submittedAt))
    .limit(5);

  return (
    <DashboardWrapper
      title="แดชบอร์ดภาพรวมระบบ"
      subtitle="สถิติ วิเคราะห์เกรดเฉลี่ย และรายการยื่นคำขอสมัครเรียนล่าสุดของโครงการ"
      icon={TrendingUp}
    >
      {/* Main Stats Counters Grid */}
      <StatsCards stats={stats} />

      {/* GPA averages distribution section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GradeAnalytics avgStats={avgStats} />
        </div>
        <WorkflowGuide />
      </div>

      {/* Recent Submissions Queue */}
      <RecentSubmissionsTable latestSubmissions={latestSubmissions} />
    </DashboardWrapper>
  );
}
