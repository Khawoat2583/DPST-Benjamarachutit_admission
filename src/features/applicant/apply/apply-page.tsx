"use client";

import { ApplyFormProvider, useApplyForm } from "./apply-form-context";
import { LoginView } from "./components/login-view";
import { ApplyWizard } from "./components/apply-wizard";
import { LoadingScreen } from "@/components/shared/loading-screen";

function ApplyPageContent() {
  const { step, sessionRestoring } = useApplyForm();

  if (sessionRestoring) {
    return <LoadingScreen message="กำลังกู้คืนข้อมูลที่สมัครไว้..." />;
  }

  if (step === 0) {
    return <LoginView />;
  }

  return <ApplyWizard />;
}

export default function ApplyPage() {
  return (
    <ApplyFormProvider>
      <ApplyPageContent />
    </ApplyFormProvider>
  );
}
