"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApplyForm } from "../apply-form-context";

export function FormErrorBanner() {
  const { errorMsg } = useApplyForm();
  if (!errorMsg) return null;

  return (
    <Alert variant="destructive" className="mb-6 border-rose-100 dark:border-rose-950/50 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
    </Alert>
  );
}
