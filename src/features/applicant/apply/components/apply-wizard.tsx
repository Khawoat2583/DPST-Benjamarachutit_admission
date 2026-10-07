"use client";

import { useApplyForm } from "../apply-form-context";
import { DesktopSidebar } from "./sidebar/desktop-sidebar";
import { MobileHeader } from "./sidebar/mobile-header";
import { MobileStepper } from "./sidebar/mobile-stepper";
import { FormErrorBanner } from "./form-error-banner";
import { FormNavigation } from "./form-navigation";
import { PreviewModal } from "./preview-modal";
import { StepPersonal } from "./steps/step-personal";
import { StepAddress } from "./steps/step-address";
import { StepEducation } from "./steps/step-education";
import { StepGrades } from "./steps/step-grades";
import { StepUploads } from "./steps/step-uploads";
import { StepReview } from "./steps/step-review";
import { formStyles, layoutStyles } from "../form-ui";

export function ApplyWizard() {
  const { step } = useApplyForm();

  return (
    <div className={layoutStyles.wizardPage}>
      <DesktopSidebar />

      <div className={layoutStyles.mainArea}>
        <MobileHeader />
        <MobileStepper />

        <main className={layoutStyles.mainContent}>
          <div className={formStyles.formCard}>
            <FormErrorBanner />

            {step === 1 && <StepPersonal />}
            {step === 2 && <StepAddress />}
            {step === 3 && <StepEducation />}
            {step === 4 && <StepGrades />}
            {step === 5 && <StepUploads />}
            {step === 6 && <StepReview />}

            <FormNavigation />
          </div>
        </main>
      </div>

      <PreviewModal />
    </div>
  );
}
