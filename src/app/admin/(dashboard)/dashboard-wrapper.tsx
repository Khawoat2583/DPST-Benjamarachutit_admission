import React from "react";
import { LucideIcon } from "lucide-react";

interface DashboardWrapperProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function DashboardWrapper({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
}: DashboardWrapperProps) {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full h-full overflow-y-auto space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300 font-prompt">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div className="flex items-start gap-3.5">
          {Icon && (
            <div className="p-2.5 bg-[#0b52a7] text-white shadow-sm shrink-0 mt-0.5">
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-2xl md:text-[30px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            {actions}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="space-y-8 pb-12">
        {children}
      </div>
    </div>
  );
}
