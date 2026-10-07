import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PortalAction = {
  href: string;
  label: string;
  tone?: "primary" | "secondary";
};

type PortalCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: "indigo" | "emerald";
  actions: PortalAction[];
};

const ACCENT_STYLES = {
  indigo: {
    iconWrap: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400",
    button:
      "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-900/25 dark:shadow-none",
    frameGlow: "from-indigo-500/14 to-sky-500/8 dark:from-indigo-500/25 dark:to-sky-500/15",
  },
  emerald: {
    iconWrap: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
    button:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-900/25 dark:shadow-none",
    frameGlow: "from-emerald-500/14 to-amber-500/8 dark:from-emerald-500/25 dark:to-amber-500/15",
  },
} as const;

export function PortalCard({ title, description, icon: Icon, accent, actions }: PortalCardProps) {
  const styles = ACCENT_STYLES[accent];

  return (
    <section className="group relative overflow-hidden rounded-[1.75rem] p-8 dpst-glass">
      <div className={cn("pointer-events-none absolute inset-0 bg-linear-to-br opacity-70", styles.frameGlow)} />
      <div className="relative z-10 flex h-full flex-col justify-between gap-8">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <span className={cn("rounded-xl p-3", styles.iconWrap)}>
              <Icon className="h-6 w-6" />
            </span>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
          </div>

          <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-300">{description}</p>
        </div>

        <div className="space-y-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                action.tone === "primary"
                  ? styles.button
                  : "bg-white/82 text-slate-700 hover:bg-white dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-800"
              )}
            >
              <span>{action.label}</span>
              {action.tone === "primary" ? <ArrowUpRight className="h-4 w-4" /> : null}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
