"use client";

import { useStatusSearch } from "../status-search-context";
import { StatusBanner } from "./status-banner";
import { StatusTimeline } from "./status-timeline";
import { RejectionAction } from "./rejection-action";
import { ApplicantDetails } from "./applicant-details";

export function StatusResults() {
  const { searched, loading, application } = useStatusSearch();

  if (!searched || loading || !application) return null;

  const status = String(application.status);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <StatusBanner status={status} />
      <StatusTimeline status={status} application={application} />
      {status === "rejected" && (
        <RejectionAction rejectionReason={application.rejectionReason as string | null} />
      )}
      <ApplicantDetails application={application} />
    </div>
  );
}
