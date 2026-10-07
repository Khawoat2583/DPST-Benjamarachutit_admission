import React from "react";
import { AlertTriangle, X, Loader2, Check } from "lucide-react";

interface RejectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  handleReject: () => Promise<void>;
  isRejecting: boolean;
}

export function RejectDialog({
  isOpen,
  onClose,
  rejectReason,
  setRejectReason,
  handleReject,
  isRejecting,
}: RejectDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 z-40 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-t-4 border-t-rose-500 p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-800 dark:text-zinc-100">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
            ตีกลับเพื่อให้ผู้สมัครแก้ไขข้อมูล
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400">
            รายละเอียดเหตุผลข้อผิดพลาด (Rejection Reason)
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="ระบุข้อผิดพลาด เช่น 'เกรดม.1 เทอม 1 วิทยาศาสตร์กรอกผิด ในใบสมัครกรอก 3.50 แต่ในใบปพ.1 แสดง 3.00 กรุณาแก้ไข', 'รูปถ่ายปพ.1 ด้านหลังไม่ชัดเจน'"
            rows={5}
            required
            className="w-full p-3 bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 rounded-none text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 placeholder-slate-400 resize-none font-semibold leading-relaxed"
          />
        </div>

        <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleReject}
            disabled={isRejecting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {isRejecting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            <span>ยืนยันตีกลับเพื่อแก้ไข</span>
          </button>
        </div>
      </div>
    </div>
  );
}
