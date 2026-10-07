import React from "react";
import { getSystemSettings } from "@/lib/system-settings";
import { getRankedApplicantsAction } from "@/features/ranking/actions";
import { GitBranch } from "lucide-react";
import WorkflowClient from "./workflow-client";
import DashboardWrapper from "../dashboard-wrapper";

export const revalidate = 0; // Keep dynamic and fresh

export default async function AdminWorkflowPage() {
  const settings = getSystemSettings();
  const rankedApplicants = await getRankedApplicantsAction();

  return (
    <DashboardWrapper
      title="แผงควบคุมสถานะและระบบจัดอันดับคัดเลือก"
      subtitle="จัดการรอบขั้นตอนการรับสมัคร ประมวลผลคะแนนผู้สมัคร และจัดอันดับคัดเลือกผู้ผ่านเข้ารอบสุดท้าย"
      icon={GitBranch}
    >
      <WorkflowClient settings={settings} initialRanked={rankedApplicants} />
    </DashboardWrapper>
  );
}
