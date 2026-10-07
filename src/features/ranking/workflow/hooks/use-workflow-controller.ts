"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  exportRankedExcelAction,
  getRankedApplicantsAction,
  resetWorkflowAction,
  runRankingAction,
  toggleRegistrationClosedAction,
} from "@/features/ranking/actions";
import type { SystemSettings } from "@/lib/system-settings";
import type { RankedApplicantRecord } from "@/features/ranking/workflow/types";

const EXCEL_MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function readErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function triggerExcelDownload(base64Data: string): void {
  const blobUrl = `data:${EXCEL_MIME_TYPE};base64,${base64Data}`;
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `DPST_Ranked_Report_2026_${new Date().toISOString().split("T")[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function filterRankedApplicants(applicants: RankedApplicantRecord[], query: string): RankedApplicantRecord[] {
  const search = query.trim().toLowerCase();
  if (!search) {
    return applicants;
  }

  return applicants.filter((applicant) => {
    const fullName = `${applicant.firstName} ${applicant.lastName}`.toLowerCase();
    const examId = applicant.examId.toLowerCase();
    const school = applicant.schoolName.toLowerCase();

    return fullName.includes(search) || examId.includes(search) || school.includes(search);
  });
}

export type WorkflowController = {
  isPending: boolean;
  settings: SystemSettings;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  rankedList: RankedApplicantRecord[];
  filteredApplicants: RankedApplicantRecord[];
  errorMessage: string | null;
  successMessage: string | null;
  handleToggleRegistration: () => void;
  handleRunRanking: () => void;
  handleExportExcel: () => void;
  handleResetWorkflow: () => void;
};

export function useWorkflowController(
  initialSettings: SystemSettings,
  initialRanked: RankedApplicantRecord[],
): WorkflowController {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [rankedList, setRankedList] = useState<RankedApplicantRecord[]>(initialRanked);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleToggleRegistration = () => {
    resetMessages();

    startTransition(async () => {
      try {
        const result = await toggleRegistrationClosedAction();
        if (!result.success || !result.settings) {
          setErrorMessage("เกิดข้อผิดพลาดในการปรับปรุงสถานะการรับสมัคร");
          return;
        }

        setSettings(result.settings);
        setSuccessMessage(
          result.settings.isRegistrationClosed
            ? "ปิดระบบรับสมัครออนไลน์เรียบร้อยแล้ว (ล็อกการยื่น/แก้ไขข้อมูลทั้งหมด)"
            : "เปิดระบบรับสมัครออนไลน์อีกครั้งเรียบร้อยแล้ว",
        );
        router.refresh();
      } catch (error: unknown) {
        setErrorMessage(readErrorMessage(error, "เกิดข้อผิดพลาดในการปรับปรุงสถานะการรับสมัคร"));
      }
    });
  };

  const handleRunRanking = () => {
    resetMessages();

    startTransition(async () => {
      try {
        const result = await runRankingAction();

        if (!result.success) {
          setErrorMessage(result.error || "เกิดข้อผิดพลาดในการประมวลผลจัดอันดับ");
          return;
        }

        if (result.settings) {
          setSettings(result.settings);
        }

        const updatedRanked = await getRankedApplicantsAction();
        setRankedList(updatedRanked);
        setSuccessMessage(
          `คำนวณและประมวลผลจัดอันดับเรียบร้อยแล้ว! คัดเลือกและจัดเรียงเรียบร้อย ${result.count} คน`,
        );
        router.refresh();
      } catch (error: unknown) {
        setErrorMessage(readErrorMessage(error, "เกิดข้อผิดพลาดทางเทคนิคในการจัดอันดับ"));
      }
    });
  };

  const handleExportExcel = () => {
    resetMessages();

    startTransition(async () => {
      try {
        const result = await exportRankedExcelAction();
        if (!result.success || !result.data) {
          setErrorMessage(result.error || "เกิดข้อผิดพลาดในการส่งออก Excel");
          return;
        }

        triggerExcelDownload(result.data);
        setSuccessMessage("ส่งออกไฟล์รายงาน พสวท. เรียบร้อยแล้ว กำลังเริ่มดาวน์โหลด...");
        router.refresh();
      } catch (error: unknown) {
        setErrorMessage(readErrorMessage(error, "เกิดข้อผิดพลาดในการส่งออกไฟล์ Excel"));
      }
    });
  };

  const handleResetWorkflow = () => {
    const confirmed = confirm(
      "คำเตือนความปลอดภัย:\n\nการกระทำนี้จะรีเซ็ตสถานะระบบกลับไปเริ่มต้นและเปลี่ยนผู้สมัครที่มีสถานะ (Ranked, Exported) กลับมาเป็น 'อนุมัติแล้ว' (Approved) เพื่อให้คุณแก้ไขรายละเอียดได้อีกครั้ง\n\nคุณแน่ใจว่าต้องการรีเซ็ตระบบใช่หรือไม่?",
    );

    if (!confirmed) {
      return;
    }

    resetMessages();

    startTransition(async () => {
      try {
        const result = await resetWorkflowAction();
        if (!result.success) {
          setErrorMessage(result.error || "เกิดข้อผิดพลาดในการรีเซ็ตระบบ");
          return;
        }

        if (result.settings) {
          setSettings(result.settings);
        }

        setRankedList([]);
        setSuccessMessage("ระบบรับสมัครและจัดอันดับถูกย้อนกลับสู่สถานะเปิดใบสมัครเสร็จสิ้น");
        router.refresh();
      } catch (error: unknown) {
        setErrorMessage(readErrorMessage(error, "เกิดข้อผิดพลาดในการรีเซ็ตระบบรับสมัคร"));
      }
    });
  };

  const filteredApplicants = useMemo(() => filterRankedApplicants(rankedList, searchQuery), [rankedList, searchQuery]);

  return {
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
  };
}
