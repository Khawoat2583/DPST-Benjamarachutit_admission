import { getStatusDetails } from "../utils/status-details";
import { cn } from "@/lib/utils";

export function StatusBanner({ status }: { status: string }) {
  const details = getStatusDetails(status);
  const StatusIcon = details.icon;

  return (
    <div
      className={cn(
        "border border-l-4 p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-4 sm:gap-6 shadow-sm",
        details.colorClass
      )}
    >
      <div className="p-4 bg-white dark:bg-zinc-900 border border-inherit shadow-sm shrink-0">
        <StatusIcon className="h-8 w-8" />
      </div>
      <div className="space-y-2 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
          สถานะใบสมัครปัจจุบัน
        </span>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">{details.title}</h2>
        <p className="text-xs sm:text-sm font-semibold opacity-85 leading-relaxed">
          {details.description}
        </p>
      </div>
    </div>
  );
}
