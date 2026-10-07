import type {
  PersonalForm,
  ContactAddressForm,
  SchoolForm,
  GradeRow,
} from "../types";

const STORAGE_PREFIX = "dpst_apply_draft_";

export type ApplyDraftSnapshot = {
  step: number;
  personal: PersonalForm;
  contactAddress: ContactAddressForm;
  school: SchoolForm;
  gpaxInput: string;
  grades: GradeRow[];
  consentChecked: boolean;
  savedAt: string;
};

export function draftStorageKey(nationalId: string): string {
  return `${STORAGE_PREFIX}${nationalId}`;
}

export function loadDraftFromStorage(nationalId: string): ApplyDraftSnapshot | null {
  if (typeof window === "undefined" || !nationalId) return null;
  try {
    const raw = localStorage.getItem(draftStorageKey(nationalId));
    if (!raw) return null;
    return JSON.parse(raw) as ApplyDraftSnapshot;
  } catch {
    return null;
  }
}

export function saveDraftToStorage(nationalId: string, snapshot: ApplyDraftSnapshot): void {
  if (typeof window === "undefined" || !nationalId) return;
  try {
    localStorage.setItem(draftStorageKey(nationalId), JSON.stringify(snapshot));
  } catch {
    // Quota exceeded or private mode — ignore
  }
}

export function clearDraftFromStorage(nationalId: string): void {
  if (typeof window === "undefined" || !nationalId) return;
  try {
    localStorage.removeItem(draftStorageKey(nationalId));
  } catch {
    // ignore
  }
}

// ===== Public eligibility pre-check draft (not tied to a national ID) =====

const ELIGIBILITY_KEY = "dpst_eligibility_draft";

export type EligibilityDraft = {
  gpaxInput: string;
  grades: GradeRow[];
  savedAt: string;
};

export function saveEligibilityDraft(draft: { gpaxInput: string; grades: GradeRow[] }): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      ELIGIBILITY_KEY,
      JSON.stringify({ ...draft, savedAt: new Date().toISOString() })
    );
  } catch {
    // ignore
  }
}

export function loadEligibilityDraft(): EligibilityDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ELIGIBILITY_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EligibilityDraft;
  } catch {
    return null;
  }
}

export function clearEligibilityDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ELIGIBILITY_KEY);
  } catch {
    // ignore
  }
}

/** Prefer local draft when it is newer than server updatedAt */
export function shouldPreferLocalDraft(
  localDraft: ApplyDraftSnapshot | null,
  serverUpdatedAt?: string | Date | null
): boolean {
  if (!localDraft) return false;
  if (!serverUpdatedAt) return true;
  const serverTime = new Date(serverUpdatedAt).getTime();
  const localTime = new Date(localDraft.savedAt).getTime();
  return localTime > serverTime;
}
