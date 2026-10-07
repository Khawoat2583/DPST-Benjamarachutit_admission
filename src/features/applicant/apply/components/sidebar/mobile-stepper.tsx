"use client";

import React from "react";
import { Check } from "lucide-react";
import { APPLY_STEPS } from "../../constants";
import { useApplyForm } from "../../apply-form-context";
import { layoutStyles } from "../../form-ui";
import { cn } from "@/lib/utils";

export function MobileStepper() {
  const {
    step,
    visitedSteps,
    stepValidities,
    goToStep,
  } = useApplyForm();

  return (
    <div className={layoutStyles.mobileStepper}>
      <div className="flex items-center justify-between gap-1">
        {APPLY_STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isCurrent = step === s.id;
          const isVisited = visitedSteps[s.id];
          const isValid = stepValidities[s.id];

          return (
            <React.Fragment key={s.id}>
              <button
                type="button"
                onClick={() => goToStep(s.id)}
                className="flex flex-col items-center focus:outline-none"
              >
                <div
                  className={cn(
                    "h-9 w-9 flex items-center justify-center border-2 transition-all duration-300",
                    isCurrent
                      ? "bg-[#0b52a7] border-[#0b52a7] text-white scale-110 shadow-md shadow-[#0b52a7]/25"
                      : isVisited
                        ? isValid
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 shadow-sm"
                        : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500"
                  )}
                >
                  {isVisited && isValid && !isCurrent ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "mt-1 text-[8px] font-bold transition-colors text-center leading-tight",
                    isCurrent
                      ? "text-[#0b52a7] dark:text-blue-400 font-extrabold"
                      : isVisited
                        ? isValid
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                        : "text-slate-400 dark:text-zinc-600"
                  )}
                >
                  {s.label}
                </span>
              </button>
              {idx < 5 && (
                <div
                  className={cn(
                    "flex-1 h-[2px] mt-[-14px] transition-colors",
                    step > s.id ? "bg-[#0b52a7]" : "bg-slate-200 dark:bg-zinc-800"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
