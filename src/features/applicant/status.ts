export const APPLICATION_STATUSES = [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "ranked",
  "exported",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const EDITABLE_APPLICANT_STATUSES = ["draft", "rejected"] as const;

export function canApplicantEdit(status: ApplicationStatus): boolean {
  return EDITABLE_APPLICANT_STATUSES.includes(
    status as (typeof EDITABLE_APPLICANT_STATUSES)[number],
  );
}
