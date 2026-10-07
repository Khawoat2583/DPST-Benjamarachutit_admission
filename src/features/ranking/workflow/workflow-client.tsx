"use client";

import { AlertTriangle, Award, Clock, Download, FileSpreadsheet, Loader2, Lock, RotateCcw, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkflowController } from "@/features/ranking/workflow/hooks/use-workflow-controller";
import { WorkflowAlertBanner } from "@/features/ranking/workflow/components/workflow-alert-banner";
import { WorkflowStepCard } from "@/features/ranking/workflow/components/workflow-step-card";
import { RankedApplicantsTable } from "@/features/ranking/workflow/components/ranked-applicants-table";
import type { RankedApplicantRecord } from "@/features/ranking/workflow/types";
import type { SystemSettings } from "@/lib/system-settings";

type WorkflowClientProps = {
  settings: SystemSettings;
  initialRanked: RankedApplicantRecord[];
};

export default function WorkflowClient({ settings: initialSettings, initialRanked }: WorkflowClientProps) {
  const {
    isPending,
    settings,
    searchQuery,
    setSearchQuery,
    rankedList,
    filteredApplicants,
    errorMessage,
    successMessage,
    handleToggleRegistration,
    handleRunRanking,
    handleExportExcel,
    handleResetWorkflow,
  } = useWorkflowController(initialSettings, initialRanked);

  return (
    <div className="space-y-8">
      {errorMessage ? <WorkflowAlertBanner kind="error" message={errorMessage} /> : null}
      {successMessage ? <WorkflowAlertBanner kind="success" message={successMessage} /> : null}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <WorkflowStepCard
          step="ขั้นตอนที่ 1"
          title="ล็อกฟอร์มสมัครเรียน"
          description="ปิดรับสมัครเพื่อล็อกการกรอกใบสมัคร รักษาสิทธิ์ และป้องกันการแก้ไขของนักเรียนขณะจัดประมวลผลอันดับ"
          icon={
            settings.isRegistrationClosed ? (
              <Lock className="h-4.5 w-4.5 text-emerald-500" />
            ) : (
              <Unlock className="h-4.5 w-4.5 text-slate-400" />
            )
          }
          complete={settings.isRegistrationClosed}
          pendingLabel="เปิดรับสมัคร"
          completedLabel="ล็อกระบบแล้ว"
        >
          <Button
            onClick={handleToggleRegistration}
            disabled={isPending}
            className={settings.isRegistrationClosed ? "h-10 rounded-none bg-slate-100 text-slate-700 hover:bg-slate-200" : "h-10 rounded-none bg-[#0b52a7] text-white hover:bg-[#08407f]"}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : settings.isRegistrationClosed ? (
              <>
                <Unlock className="h-3.5 w-3.5" />
                เปิดรับสมัครใหม่
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" />
                ปิดระบบรับสมัคร
              </>
            )}
          </Button>
        </WorkflowStepCard>

        <WorkflowStepCard
          step="ขั้นตอนที่ 2"
          title="ประมวลผลจัดอันดับ"
          description="รันระบบ Engine จัดเรียงตามกฎเกณฑ์วิทยาลับ 9 ขั้น (Tie-breaker) โดยนำเข้าและร่วมกับคะแนนสอบรอบแรก"
          icon={<Award className="h-4.5 w-4.5 text-slate-400" />}
          complete={settings.isRanked}
          pendingLabel="รอดำเนินการ"
          completedLabel="ประมวลผลแล้ว"
        >
          <Button
            onClick={handleRunRanking}
            disabled={isPending || !settings.isRegistrationClosed}
            className="h-10 rounded-none bg-[#0b52a7] text-white hover:bg-[#08407f] disabled:bg-slate-200 disabled:text-slate-500"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : settings.isRanked ? (
              <>
                <RotateCcw className="h-3.5 w-3.5" />
                ประมวลใหม่ (Rerun)
              </>
            ) : (
              <>
                <Award className="h-3.5 w-3.5" />
                ประมวลผล (Run Engine)
              </>
            )}
          </Button>
        </WorkflowStepCard>

        <WorkflowStepCard
          step="ขั้นตอนที่ 3"
          title="ดาวน์โหลดผลคัดเลือก"
          description="ส่งออกตารางใบสมัครทั้งหมดที่จัดเรียงเสร็จสมบูรณ์ลงไฟล์ Excel ตามโครงสร้างคอลัมน์ A ถึง N ตามระเบียบการ"
          icon={<Download className="h-4.5 w-4.5 text-slate-400" />}
          complete={false}
          pendingLabel="ปลายทาง"
          completedLabel="ปลายทาง"
        >
          <Button
            onClick={handleExportExcel}
            disabled={isPending || !settings.isRanked}
            className="h-10 rounded-none bg-amber-500 text-white hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-500"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <FileSpreadsheet className="h-3.5 w-3.5" />
                ดาวน์โหลด Excel (A-N)
              </>
            )}
          </Button>
        </WorkflowStepCard>
      </div>

      <div className="flex items-start gap-4 rounded-none border border-amber-500/10 bg-amber-500/5 p-5 dark:bg-amber-500/[0.02]">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-amber-800 dark:text-amber-500">หมายเหตุสำคัญสำหรับการประมวลผลจัดอันดับ:</h4>
          <ul className="list-disc space-y-1 pl-4 text-[11px] font-semibold text-amber-700/80 dark:text-zinc-400">
            <li>นักเรียนที่จะเข้าสู่ขั้นตอนประมวลผลจัดอันดับ (Run Ranking) จะต้องผ่านการ &quot;อนุมัติหลักฐาน&quot; (Approved) ในหน้าตรวจสอบคู่ขนานทั้งหมดแล้วเท่านั้น</li>
            <li>คะแนนสอบของวิชาคณิตศาสตร์และวิทยาศาสตร์จะต้องนำเข้าในเมนู &quot;นำเข้าคะแนนภายนอก&quot; ก่อนเริ่มรันประมวลผล หากไม่มีคะแนนจะคำนวณเป็น 0</li>
            <li>หากผลการเรียนเฉลี่ยและคะแนนเท่ากันทุกวิชา ระบบจะทำการเปรียบเทียบในระดับ Tie-breaker ลำดับที่ 9 (ลำดับรายชื่อตามประกาศ พสวท. รอบแรก โดยมีค่าที่เล็กกว่าได้รับสิทธิ์ก่อน)</li>
          </ul>
        </div>
      </div>

      {settings.isRanked ? (
        <RankedApplicantsTable
          applicants={filteredApplicants}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          totalCount={rankedList.length}
        />
      ) : null}

      <div className="flex items-center justify-between border-t border-slate-100 pt-6 dark:border-zinc-800">
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-slate-800 dark:text-zinc-300">ความยืดหยุ่นในกระบวนการทำงาน:</p>
          <p className="text-[10px] text-slate-500 dark:text-zinc-500">
            คุณสามารถย้อนสถานะระบบและใบสมัครทั้งหมดกลับมาเป็นสถานะปกติเพื่อทำการแก้ไขเกรดหรือรันการสอบรอบใหม่ได้
          </p>
        </div>
        <Button
          onClick={handleResetWorkflow}
          disabled={isPending}
          variant="outline"
          className="h-9 rounded-none text-xs font-extrabold"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          รีเซ็ตเฟสระบบ
        </Button>
      </div>

      {!settings.isRanked ? (
        <div className="flex items-center gap-2 rounded-none border border-slate-200/70 bg-white/70 px-4 py-3 text-xs font-semibold text-slate-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <Clock className="h-4 w-4 text-slate-400" />
          ผลการจัดอันดับจะแสดงในตารางทันทีหลังจากประมวลผลเสร็จสิ้น
        </div>
      ) : null}
    </div>
  );
}
