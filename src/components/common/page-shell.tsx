import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  withPattern?: boolean;
};

export function PageShell({
  children,
  className,
  contentClassName,
  withPattern = true,
}: PageShellProps) {
  return (
    <div className={cn("relative min-h-screen overflow-hidden dpst-page-bg", className)}>
      {withPattern && <div className="pointer-events-none absolute inset-0 opacity-45 dpst-grid-pattern" />}
      <div className="pointer-events-none absolute -top-28 -left-20 h-72 w-72 rounded-full bg-indigo-500/12 blur-3xl dark:bg-indigo-500/18" />
      <div className="pointer-events-none absolute -right-20 top-28 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/10" />

      <main className={cn("relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8", contentClassName)}>
        {children}
      </main>
    </div>
  );
}
