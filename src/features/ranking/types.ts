import type { RankedApplicant } from "@/features/ranking/ranking";

export type RankedApplicationStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "ranked"
  | "exported";

export interface RankedApplicantRecord extends RankedApplicant {
  title: string;
  schoolName: string;
  examId: string;
  status: RankedApplicationStatus;
}
