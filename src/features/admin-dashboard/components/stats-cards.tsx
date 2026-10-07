import React from "react";
import { Users, FileText, CheckCircle, AlertCircle, Calculator } from "lucide-react";

interface StatsCardsProps {
  stats: {
    total: number;
    draft: number;
    submitted: number;
    approved: number;
    rejected: number;
  };
}

const CARDS = [
  {
    key: "total",
    label: "ใบสมัครทั้งหมด",
    icon: Users,
    accent: "border-l-slate-400 dark:border-l-zinc-500",
    iconBox: "bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-400",
    value: "text-slate-950 dark:text-white",
  },
  {
    key: "draft",
    label: "บันทึกแบบร่าง",
    icon: FileText,
    accent: "border-l-[#0b52a7]",
    iconBox: "bg-[#0b52a7]/10 dark:bg-blue-950/30 text-[#0b52a7] dark:text-blue-400",
    value: "text-[#0b52a7] dark:text-blue-400",
  },
  {
    key: "submitted",
    label: "ส่งใบสมัครแล้ว",
    icon: Calculator,
    accent: "border-l-amber-500",
    iconBox: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
    value: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "approved",
    label: "อนุมัติผ่านเกณฑ์",
    icon: CheckCircle,
    accent: "border-l-emerald-500",
    iconBox: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "rejected",
    label: "ตีกลับแก้ไขเอกสาร",
    icon: AlertCircle,
    accent: "border-l-rose-500",
    iconBox: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400",
    value: "text-rose-600 dark:text-rose-400",
  },
] as const;

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className={`bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 ${card.accent} p-5 shadow-sm space-y-3`}
          >
            <div className={`p-2.5 ${card.iconBox} w-fit`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500">{card.label}</p>
              <h3 className={`text-2xl md:text-3xl font-black ${card.value} mt-1`}>
                {stats[card.key].toLocaleString()}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
