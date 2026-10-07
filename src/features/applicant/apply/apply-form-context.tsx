"use client";

import React, { createContext, useContext } from "react";
import { useApplyFormController } from "./hooks/use-apply-form-controller";

type ApplyFormContextValue = ReturnType<typeof useApplyFormController>;

const ApplyFormContext = createContext<ApplyFormContextValue | null>(null);

export function ApplyFormProvider({ children }: { children: React.ReactNode }) {
  const value = useApplyFormController();

  return (
    <ApplyFormContext.Provider value={value}>
      {children}
    </ApplyFormContext.Provider>
  );
}

export function useApplyForm() {
  const ctx = useContext(ApplyFormContext);
  if (!ctx) {
    throw new Error("useApplyForm must be used within ApplyFormProvider");
  }
  return ctx;
}
