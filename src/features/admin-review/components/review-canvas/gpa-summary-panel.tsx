import React from "react";
import { AlertTriangle } from "lucide-react";

interface GpaSummaryPanelProps {
  liveAverages: {
    gpax: string;
    mathGpa: string;
    scienceGpa: string;
    englishGpa: string;
  };
  rejectionReason: string | null;
}

export function GpaSummaryPanel({ liveAverages, rejectionReason }: GpaSummaryPanelProps) {
  return (
    <div className="bg-[#0b52a7] dark:bg-blue-950/40 border-l-4 border-l-yellow-400 p-5 text-white dark:text-blue-200 shadow-md">
      <h3 className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-3">
        ผลการเรียนคำนวณสดแบบเรียลไทม์ (Live Previews)
      </h3>
      <div className="grid grid-cols-4 gap-2.5 text-center">
        <div className="bg-white/10 dark:bg-zinc-900/40 p-2.5 rounded-none">
          <p className="text-[10px] text-blue-200">GPAX 5 เทอม</p>
          <p className="text-lg font-black text-white">{liveAverages.gpax}</p>
        </div>
        <div className="bg-white/10 dark:bg-zinc-900/40 p-2.5 rounded-none">
          <p className="text-[10px] text-blue-200">เฉลี่ยคณิต</p>
          <p className="text-lg font-black text-white">{liveAverages.mathGpa}</p>
        </div>
        <div className="bg-white/10 dark:bg-zinc-900/40 p-2.5 rounded-none">
          <p className="text-[10px] text-blue-200">เฉลี่ยวิทย์</p>
          <p className="text-lg font-black text-white">{liveAverages.scienceGpa}</p>
        </div>
        <div className="bg-white/10 dark:bg-zinc-900/40 p-2.5 rounded-none">
          <p className="text-[10px] text-blue-200">เฉลี่ยอังกฤษ</p>
          <p className="text-lg font-black text-white">{liveAverages.englishGpa}</p>
        </div>
      </div>
      {rejectionReason && (
        <div className="mt-4 p-3 bg-rose-950/50 border border-rose-500/25 rounded-none flex items-start gap-2 text-xs text-rose-200">
          <AlertTriangle className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">เหตุผลการตีกลับเดิม:</span> {rejectionReason}
          </div>
        </div>
      )}
    </div>
  );
}
