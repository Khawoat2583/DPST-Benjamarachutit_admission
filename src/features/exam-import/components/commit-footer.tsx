import React from "react";
import { CheckCircle, Loader2 } from "lucide-react";

interface CommitFooterProps {
  isCommitting: boolean;
  handleCommitScores: () => Promise<void>;
}

export function CommitFooter({ isCommitting, handleCommitScores }: CommitFooterProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-[#0b52a7] p-5 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4 md:p-6">
      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold max-w-xl text-center md:text-left">
        ⚠️ <span className="font-bold text-slate-650 dark:text-zinc-400">การยืนยันการนำเข้า:</span> ข้อมูลจะถูกเขียนบันทึกด้วยระบบ Upsert หากมีคะแนนประจำตัวสอบนี้อยู่ในระบบแล้ว จะปรับปรุงคะแนนใหม่ทันที (SQL transaction atomic protection)
      </p>

      <button
        onClick={handleCommitScores}
        disabled={isCommitting}
        className="w-full md:w-auto py-3 px-6 bg-[#0b52a7] hover:bg-[#08407f] text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 shrink-0"
      >
        {isCommitting ? (
          <>
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
            <span>กำลังบันทึกคะแนนลงเซิร์ฟเวอร์...</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-4.5 w-4.5" />
            <span>ยืนยันนำเข้าคะแนนเข้าสู่ฐานข้อมูล</span>
          </>
        )}
      </button>
    </div>
  );
}
