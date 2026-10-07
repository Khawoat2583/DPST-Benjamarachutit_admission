import React from "react";
import { Save, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

interface ReviewActionPanelProps {
  status: string;
  isChanged: boolean;
  isSaving: boolean;
  isApproving: boolean;
  isRejecting: boolean;
  handleSaveGrades: () => Promise<void>;
  handleApprove: () => Promise<void>;
  openRejectModal: () => void;
}

export function ReviewActionPanel({
  status,
  isChanged,
  isSaving,
  isApproving,
  isRejecting,
  handleSaveGrades,
  handleApprove,
  openRejectModal,
}: ReviewActionPanelProps) {
  if (status === "draft") {
    return null;
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-[#0b52a7] p-5 md:p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-300">
        แผงควบคุมสถานะและส่งข้อมูล (Verification Actions)
      </h3>
      <p className="text-xs text-slate-500">
        กรุณากด &quot;บันทึกคะแนนเกรด&quot; หากมีการแก้ไขข้อมูล ก่อนอนุมัติใบสมัครเข้าสู่ระบบคัดเลือก
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Save changes */}
        <button
          onClick={handleSaveGrades}
          disabled={!isChanged || isSaving || isApproving || isRejecting}
          className={`flex-1 py-3 px-4 font-bold text-xs sm:text-sm rounded-none transition-all flex items-center justify-center gap-2 ${
            !isChanged
              ? "bg-slate-100/50 dark:bg-zinc-800/40 text-slate-400 dark:text-zinc-500 cursor-not-allowed opacity-50"
              : "bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 cursor-pointer"
          }`}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4 text-slate-500" />
          )}
          <span>บันทึกคะแนนเกรด</span>
        </button>

        {/* Approve applicant */}
        {status !== "approved" && (
          <button
            onClick={handleApprove}
            disabled={isSaving || isApproving || isRejecting}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20"
          >
            {isApproving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <span>อนุมัติใบสมัคร</span>
          </button>
        )}

        {/* Reject button */}
        {status !== "rejected" && (
          <button
            onClick={openRejectModal}
            disabled={isSaving || isApproving || isRejecting}
            className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-rose-950/20"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>ตีกลับเพื่อให้แก้ไข</span>
          </button>
        )}
      </div>
    </div>
  );
}
