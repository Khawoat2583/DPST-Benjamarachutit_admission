import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type WorkflowAlertBannerProps = {
  kind: "error" | "success";
  message: string;
};

export function WorkflowAlertBanner({ kind, message }: WorkflowAlertBannerProps) {
  const isSuccess = kind === "success";

  return (
    <Alert
      className={cn(
        "rounded-none border text-xs shadow-sm",
        isSuccess
          ? "border-emerald-200/70 bg-emerald-50/80 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/25 dark:text-emerald-300"
          : "border-rose-200/70 bg-rose-50/80 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/25 dark:text-rose-300",
      )}
    >
      {isSuccess ? <CheckCircle2 className="mt-0.5" /> : <AlertCircle className="mt-0.5" />}
      <AlertTitle className="text-xs font-semibold">{isSuccess ? "การดำเนินการสำเร็จ" : "การดำเนินการล้มเหลว"}</AlertTitle>
      <AlertDescription className="text-xs font-medium text-current/90">{message}</AlertDescription>
    </Alert>
  );
}
