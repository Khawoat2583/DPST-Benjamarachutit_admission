"use client";

import { useRouter } from "next/navigation";
import { XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RejectionAction({
  rejectionReason,
}: {
  rejectionReason?: string | null;
}) {
  const router = useRouter();

  return (
    <div className="bg-rose-50/65 dark:bg-rose-950/20 border border-l-4 border-rose-200 border-l-rose-500 dark:border-rose-900/65 p-6 sm:p-8 space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-rose-100 dark:bg-rose-950 text-rose-600 shrink-0">
          <XCircle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-black text-rose-800 dark:text-rose-400 uppercase tracking-wider">
            แจ้งเตือนเหตุผลในการให้แก้ไขข้อมูล
          </h3>
          <p className="text-xs text-rose-600 dark:text-rose-500 mt-1 font-semibold">
            กรุณาปรับปรุงตามที่ระบุเพื่อประโยชน์สูงสุดในการจัดสรรทุน พสวท.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-rose-100 dark:border-rose-950/40 p-5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
          รายละเอียดการแก้ไขจากเจ้าหน้าที่
        </span>
        <p className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed">
          {rejectionReason ||
            "กรุณาตรวจสอบรูปภาพ ปพ.1 หรือเกรดเฉลี่ยรายวิชาใหม่อีกครั้งให้ครบถ้วน"}
        </p>
      </div>

      <Button
        onClick={() => router.push("/apply")}
        className="w-full py-4 h-auto rounded-none font-extrabold bg-rose-600 hover:bg-rose-700"
      >
        <ArrowRight className="h-4 w-4" />
        <span>เข้าสู่หน้าแก้ไขใบสมัครของคุณทันที</span>
      </Button>
    </div>
  );
}
