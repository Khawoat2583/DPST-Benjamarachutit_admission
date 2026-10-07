"use client";

import { AlertTriangle, Check } from "lucide-react";
import type { ClientGpas } from "@/features/applicant/apply/types";
import { formStyles } from "../../../form-ui";
import { cn } from "@/lib/utils";

type GpaSummaryPanelProps = {
  clientGpas: ClientGpas;
  isGradesFormFilled: boolean;
  hasCourseCodeErrors: boolean;
};

export function GpaSummaryPanel({
  clientGpas,
  isGradesFormFilled,
  hasCourseCodeErrors,
}: GpaSummaryPanelProps) {
  return (
    <div className={formStyles.gpaDashboard}>
      <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-800 dark:text-white border-b pb-2.5">
        แผงสรุปคำนวณเกรดสด
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-600 dark:text-zinc-400">GPAX รวม:</span>
          <span
            className={cn(
              "font-mono font-semibold py-1 px-2.5 rounded-none",
              clientGpas.gpax >= 3.0
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
            )}
          >
            {clientGpas.gpax > 0 ? clientGpas.gpax.toFixed(2) : "-"}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-600 dark:text-zinc-400">เฉลี่ยคณิตฯ:</span>
          <span
            className={cn(
              "font-mono font-semibold py-1 px-2.5 rounded-none",
              clientGpas.mathGpa >= 3.0
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
            )}
          >
            {clientGpas.mathGpa > 0 ? clientGpas.mathGpa.toFixed(2) : "-"}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-600 dark:text-zinc-400">เฉลี่ยวิทย์ฯ:</span>
          <span
            className={cn(
              "font-mono font-semibold py-1 px-2.5 rounded-none",
              clientGpas.scienceGpa >= 3.0
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
            )}
          >
            {clientGpas.scienceGpa > 0 ? clientGpas.scienceGpa.toFixed(2) : "-"}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-600 dark:text-zinc-400">เฉลี่ยอังกฤษ:</span>
          <span
            className={cn(
              "font-mono font-semibold py-1 px-2.5 rounded-none",
              clientGpas.englishGpa >= 2.75
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
            )}
          >
            {clientGpas.englishGpa > 0 ? clientGpas.englishGpa.toFixed(2) : "-"}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-zinc-800 my-4" />

      {clientGpas.errors.length > 0 ? (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-950/50 rounded-none p-4 text-[10px] sm:text-xs text-rose-700 dark:text-rose-400 space-y-2">
          <span className="font-semibold flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            คุณสมบัติไม่ผ่านเกณฑ์สมัคร
          </span>
          <ul className="list-disc pl-4 space-y-1 font-semibold leading-relaxed">
            {clientGpas.errors.map((errorMessage) => (
              <li key={errorMessage}>{errorMessage}</li>
            ))}
          </ul>
        </div>
      ) : isGradesFormFilled &&
        !hasCourseCodeErrors &&
        clientGpas.isEligible &&
        clientGpas.mathGpa > 0 &&
        clientGpas.scienceGpa > 0 &&
        clientGpas.englishGpa > 0 ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-950/50 rounded-none p-4 text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 flex gap-2">
          <Check className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">คุณสมบัติผ่านเกณฑ์ขั้นต่ำ</span>
            เกรดเฉลี่ยรายสาระวิชาพื้นฐานถูกต้องและเหมาะสมในการสมัคร
          </div>
        </div>
      ) : null}
    </div>
  );
}
