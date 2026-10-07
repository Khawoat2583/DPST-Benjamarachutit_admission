import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({ href = "/", label = "กลับหน้าหลัก" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 mb-8 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-[#0b52a7] dark:hover:text-blue-400 transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}
