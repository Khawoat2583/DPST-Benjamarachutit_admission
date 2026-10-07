import type { ReactNode } from "react";
import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/common/glass-card";

type WorkflowStepCardProps = {
  step: string;
  title: string;
  description: string;
  icon: ReactNode;
  complete: boolean;
  pendingLabel: string;
  completedLabel: string;
  children: ReactNode;
};

export function WorkflowStepCard({
  step,
  title,
  description,
  icon,
  complete,
  pendingLabel,
  completedLabel,
  children,
}: WorkflowStepCardProps) {
  return (
    <GlassCard
      className={cn(
        "flex flex-col justify-between gap-6 border-l-4 p-6",
        complete
          ? "border-l-emerald-500"
          : "border-l-[#0b52a7]",
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <span className="bg-slate-100 px-2 py-1 font-mono text-[10px] font-extrabold uppercase text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
            {step}
          </span>
          {complete ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
              <Check className="h-3 w-3" /> {completedLabel}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-400">
              <Clock className="h-3 w-3" /> {pendingLabel}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
            {icon}
            {title}
          </h3>
          <p className="text-xs font-semibold leading-relaxed text-slate-500 dark:text-zinc-400">
            {description}
          </p>
        </div>
      </div>

      {children}
    </GlassCard>
  );
}
