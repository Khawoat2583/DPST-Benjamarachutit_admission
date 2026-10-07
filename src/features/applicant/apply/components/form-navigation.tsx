"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApplyForm } from "../apply-form-context";
import { formStyles } from "../form-ui";

export function FormNavigation() {
  const {
    step,
    loading,
    submitting,
    prevStep,
    nextStep,
  } = useApplyForm();

  return (
    <div className={formStyles.navBar}>
      {step > 1 ? (
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={loading || submitting}
          className="gap-1.5 py-3 px-6 h-auto text-xs sm:text-sm font-bold rounded-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>ขั้นตอนก่อนหน้า</span>
        </Button>
      ) : (
        <div />
      )}

      {step < 6 ? (
        <Button
          type="button"
          onClick={nextStep}
          disabled={loading || submitting}
          className="gap-1.5 py-3 px-6 h-auto text-xs sm:text-sm font-bold rounded-none"
        >
          <span>ขั้นตอนถัดไป</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
