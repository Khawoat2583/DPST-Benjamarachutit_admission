"use client";

import { Check, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APPLY_STEPS } from "../../constants";
import { useApplyForm } from "../../apply-form-context";
import { layoutStyles } from "../../form-ui";
import { cn } from "@/lib/utils";

export function DesktopSidebar() {
  const {
    step,
    nationalIdInput,
    draftSaving,
    handleLogout,
    visitedSteps,
    stepValidities,
    goToStep,
    progressPercent,
  } = useApplyForm();

  return (
    <aside className={layoutStyles.sidebar}>
      <div className={layoutStyles.sidebarHeader}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <img src="/dpste_logo.png" alt="DPSTE Seal" className="h-12 w-auto object-contain shrink-0" />
            <img src="/dpste.png" alt="DPSTE Logo" className="h-9 w-auto object-contain shrink-0" />
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-slate-900 dark:text-white text-s leading-tight">
              ระบบรับสมัครโครงการ พสวท.
            </h2>
            <span className="text-[12px] text-slate-500 dark:text-zinc-400 font-mono block truncate mt-1">
              ผู้สมัคร: {nationalIdInput}
            </span>
          </div>
        </div>
      </div>

      <nav className={layoutStyles.sidebarNav}>
        <div className="relative flex flex-col gap-1">
          <div className={layoutStyles.stepConnector} />
          <div
            className={layoutStyles.stepConnectorActive}
            style={{ height: `${((step - 1) / 5) * (100 - 100 / 6)}%` }}
          />

          {APPLY_STEPS.map((s) => {
            const Icon = s.icon;
            const isCurrent = step === s.id;
            const isVisited = visitedSteps[s.id];
            const isValid = stepValidities[s.id];

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goToStep(s.id)}
                className={cn(
                  "w-full text-left relative flex items-center gap-3 py-3 px-2 transition-all duration-200 focus:outline-none",
                  isCurrent
                    ? "bg-[#0b52a7]/8 dark:bg-blue-950/20 border-l-2 border-[#0b52a7]"
                    : "hover:bg-slate-50 dark:hover:bg-zinc-800/30 border-l-2 border-transparent"
                )}
              >
                <div
                  className={cn(
                    "relative z-10 h-11 w-11 flex items-center justify-center border-2 transition-all duration-300 shrink-0",
                    isCurrent
                      ? "bg-[#0b52a7] border-[#0b52a7] text-white"
                      : isVisited
                        ? isValid
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400"
                        : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500"
                  )}
                >
                  {isVisited && isValid && !isCurrent ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    ขั้นตอนที่ {s.id}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold transition-colors",
                      isCurrent
                        ? "text-[#0b52a7] dark:text-blue-400"
                        : isVisited
                          ? isValid
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                          : "text-slate-400 dark:text-zinc-500"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      <div className={layoutStyles.sidebarFooter}>
        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-semibold mb-2">
          <span>ความคืบหน้า</span>
          <span>{progressPercent}%</span>
        </div>
        <div className={layoutStyles.progressBar}>
          <div
            className={layoutStyles.progressFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {draftSaving && (
          <p className="text-[9px] text-slate-400 dark:text-zinc-500 mt-2 text-center">
            กำลังบันทึกแบบร่าง...
          </p>
        )}
      </div>

      <div className={layoutStyles.sidebarFooter}>
        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          className="w-full gap-1.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-100 dark:border-rose-950/30"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>ออกจากระบบ</span>
        </Button>
      </div>
    </aside>
  );
}
