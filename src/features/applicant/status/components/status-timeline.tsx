import { CheckCircle2 } from "lucide-react";
import { TIMELINE_STEPS } from "../constants";
import { getCurrentStatusIndex } from "../utils/status-details";
import { cn } from "@/lib/utils";

type TimelineProps = {
  status: string;
  application: Record<string, unknown>;
};

export function StatusTimeline({ status, application }: TimelineProps) {
  if (status === "draft") return null;

  const currentStatusIndex = getCurrentStatusIndex(status);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-yellow-400 p-6 sm:p-8 shadow-sm">
      <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-8 text-center sm:text-left">
        เส้นทางการพิจารณาและคัดเลือก
      </h3>

      <div className="relative">
        <div
          className="absolute top-6 h-[2px] bg-slate-200 dark:bg-zinc-800 -z-10 hidden sm:block"
          style={{ left: "25%", right: "25%" }}
        />
        <div
          className="absolute top-6 h-[2px] bg-[#0b52a7] -z-10 hidden sm:block transition-all duration-500"
          style={{
            left: "25%",
            right: "25%",
          }}
        />

        <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-4">
          {TIMELINE_STEPS.map((step, idx) => {
            const isDone = idx === 0 || currentStatusIndex >= idx;
            const isCurrent = currentStatusIndex === 0 && idx === 1;
            const time = application[step.timeField] as string | undefined;

            return (
              <div
                key={step.statusKey}
                className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2 flex-1"
              >
                <div
                  className={cn(
                    "h-12 w-12 flex items-center justify-center border font-bold text-base transition-all duration-300 ring-4 shrink-0",
                    isCurrent
                      ? "bg-[#0b52a7] border-[#0b52a7] text-white ring-blue-100 dark:ring-blue-950/30 scale-105"
                      : isDone
                        ? "bg-[#0b52a7]/10 dark:bg-blue-950/30 border-[#0b52a7]/30 dark:border-blue-800 text-[#0b52a7] dark:text-blue-400 ring-transparent"
                        : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 ring-transparent"
                  )}
                >
                  {isDone && !isCurrent ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div className="flex flex-col sm:items-center">
                  <span
                    className={cn(
                      "text-xs font-bold",
                      isDone ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-zinc-500"
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 max-w-[150px] leading-tight">
                    {step.desc}
                  </span>
                  {time && isDone && (
                    <span className="text-[9px] font-mono text-[#0b52a7] dark:text-blue-400 mt-1 font-bold">
                      {new Date(time).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
