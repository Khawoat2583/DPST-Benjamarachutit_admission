"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, BadgeAlert } from "lucide-react";
import { Application } from "../../types";
import { useReviewCanvasController } from "../../hooks/use-review-canvas-controller";
import { ApplicantProfilePanel } from "./applicant-profile-panel";
import { GpaSummaryPanel } from "./gpa-summary-panel";
import { GradeEditorTable } from "./grade-editor-table";
import { AttachmentViewer } from "./attachment-viewer";
import { ReviewActionPanel } from "./review-action-panel";
import { RejectDialog } from "./reject-dialog";

interface ReviewCanvasProps {
  application: Application;
}

export default function ReviewCanvas({ application }: ReviewCanvasProps) {
  const router = useRouter();
  const {
    isReadOnly,
    isChanged,
    isRejectModalOpen,
    setIsRejectModalOpen,
    rejectReason,
    setRejectReason,
    isSaving,
    isApproving,
    isRejecting,
    actionError,
    actionSuccess,
    liveAverages,
    semesterGrades,
    handleGradeChange,
    handleSaveGrades,
    handleApprove,
    handleReject,
  } = useReviewCanvasController(application);

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-slate-50 dark:bg-zinc-950">
      {/* Upper floating toolbar */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 z-20 shrink-0">
        {/* Left Side: Back button & Applicant metadata */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/review")}
            className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-none transition-all cursor-pointer"
            title="กลับไปหน้ารายชื่อ"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <ApplicantProfilePanel application={application} />
        </div>

        {/* Right Side: Status & Notification */}
        <div className="flex items-center gap-3.5 flex-wrap">
          {/* Global Notification Banner */}
          {(actionSuccess || actionError) && (
            <div
              className={`px-4 py-2 rounded-none text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300 ${
                actionSuccess
                  ? "bg-emerald-50 border border-emerald-500/20 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300"
                  : "bg-rose-50 border border-rose-500/20 text-rose-700 dark:bg-rose-950/20 dark:text-rose-300"
              }`}
            >
              {actionSuccess ? <CheckCircle className="h-4 w-4" /> : <BadgeAlert className="h-4 w-4" />}
              <span>{actionSuccess || actionError}</span>
            </div>
          )}

          {/* Status bubble */}
          <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
            <span className="text-slate-400">สถานะขณะนี้:</span>
            {application.status === "submitted" && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 rounded-none border border-amber-100 dark:border-amber-900/30">
                รอดำเนินการ (Submitted)
              </span>
            )}
            {application.status === "approved" && (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-none border border-emerald-100 dark:border-emerald-900/30">
                อนุมัติแล้ว (Approved)
              </span>
            )}
            {application.status === "rejected" && (
              <span className="px-2.5 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 rounded-none border border-rose-100 dark:border-rose-900/30">
                ส่งกลับแก้ไข (Rejected)
              </span>
            )}
            {application.status === "draft" && (
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 rounded-none border border-slate-200 dark:border-zinc-700">
                แบบร่าง (Draft)
              </span>
            )}
            {application.status === "ranked" && (
              <span className="px-2.5 py-1 bg-yellow-400/15 text-yellow-700 dark:bg-yellow-400/10 dark:text-yellow-500 rounded-none border border-yellow-400/40 dark:border-yellow-600/30 font-bold">
                จัดอันดับแล้ว (Ranked)
              </span>
            )}
            {application.status === "exported" && (
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 rounded-none border border-blue-100 dark:border-blue-900/30 font-bold">
                ส่งออกแล้ว (Exported)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main split canvas */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full">
        {/* Left Side: scrollable forms and edit grades */}
        <div className="w-full md:w-1/2 overflow-y-auto p-6 space-y-6 border-r border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20">
          <GpaSummaryPanel
            liveAverages={liveAverages}
            rejectionReason={application.rejectionReason}
          />

          <GradeEditorTable
            semesterGrades={semesterGrades}
            isReadOnly={isReadOnly}
            handleGradeChange={handleGradeChange}
          />

          {!isReadOnly && (
            <ReviewActionPanel
              status={application.status}
              isChanged={isChanged}
              isSaving={isSaving}
              isApproving={isApproving}
              isRejecting={isRejecting}
              handleSaveGrades={handleSaveGrades}
              handleApprove={handleApprove}
              openRejectModal={() => setIsRejectModalOpen(true)}
            />
          )}
        </div>

        {/* Right Side: scrollable transcript viewer and image controls */}
        <div className="w-full md:w-1/2 flex flex-col overflow-hidden bg-slate-900 border-l border-slate-950">
          <AttachmentViewer attachments={application.attachments} />
        </div>
      </div>

      <RejectDialog
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        handleReject={handleReject}
        isRejecting={isRejecting}
      />
    </div>
  );
}
