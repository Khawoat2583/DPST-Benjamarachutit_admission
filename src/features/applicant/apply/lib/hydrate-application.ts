import { DEFAULT_COURSES } from "../constants";
import type {
  PersonalForm,
  ContactAddressForm,
  SchoolForm,
  GradeRow,
  AttachmentsList,
} from "../types";

export type ApplicationPayload = {
  status?: string;
  title?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  announcementOrder?: number | null;
  email?: string | null;
  phone?: string | null;
  guardianPhone?: string | null;
  addressNo?: string | null;
  addressMoo?: string | null;
  addressSoi?: string | null;
  addressRoad?: string | null;
  addressSubdistrict?: string | null;
  addressDistrict?: string | null;
  addressProvince?: string | null;
  addressZipcode?: string | null;
  schoolName?: string | null;
  schoolProvince?: string | null;
  gpax?: number | string | null;
  grades?: GradeRow[];
  attachments?: Array<{
    id: number;
    documentType: string;
    originalName?: string;
    storedName?: string;
    mimeType?: string;
  }>;
  updatedAt?: string | Date | null;
};

export type HydratedFormState = {
  personal: PersonalForm;
  contactAddress: ContactAddressForm;
  school: SchoolForm;
  gpaxInput: string;
  grades: GradeRow[];
  attachmentsList: AttachmentsList;
  previewUrls: Record<string, string>;
  serverUpdatedAt: string | null;
};

export function hydrateFromApplication(app: ApplicationPayload | null): HydratedFormState {
  if (!app) {
    return {
      personal: { title: "", firstName: "", lastName: "", announcementOrder: "" },
      contactAddress: {
        email: "",
        phone: "",
        guardianPhone: "",
        addressNo: "",
        addressMoo: "",
        addressSoi: "",
        addressRoad: "",
        addressSubdistrict: "",
        addressDistrict: "",
        addressProvince: "",
        addressZipcode: "",
      },
      school: { schoolName: "", schoolProvince: "" },
      gpaxInput: "",
      grades: DEFAULT_COURSES,
      attachmentsList: {
        photo: null,
        transcriptFront: null,
        transcriptBack: null,
        idCard: null,
      },
      previewUrls: {},
      serverUpdatedAt: null,
    };
  }

  const attachments = app.attachments ?? [];
  const photo = attachments.find((a) => a.documentType === "photo");
  const transcripts = attachments.filter((a) => a.documentType === "transcript");
  const transcriptFront = transcripts[0];
  const transcriptBack = transcripts[1];
  const idCard = attachments.find((a) => a.documentType === "id_card");

  const previewUrls: Record<string, string> = {};
  if (photo?.storedName) previewUrls.photo = `/api/upload/${photo.storedName}`;
  if (transcriptFront?.storedName)
    previewUrls.transcriptFront = `/api/upload/${transcriptFront.storedName}`;
  if (transcriptBack?.storedName)
    previewUrls.transcriptBack = `/api/upload/${transcriptBack.storedName}`;
  if (idCard?.storedName) previewUrls.idCard = `/api/upload/${idCard.storedName}`;

  return {
    personal: {
      title: app.title || "",
      firstName: app.firstName || "",
      lastName: app.lastName || "",
      announcementOrder: app.announcementOrder ? String(app.announcementOrder) : "",
    },
    contactAddress: {
      email: app.email || "",
      phone: app.phone || "",
      guardianPhone: app.guardianPhone || "",
      addressNo: app.addressNo || "",
      addressMoo: app.addressMoo || "",
      addressSoi: app.addressSoi || "",
      addressRoad: app.addressRoad || "",
      addressSubdistrict: app.addressSubdistrict || "",
      addressDistrict: app.addressDistrict || "",
      addressProvince: app.addressProvince || "",
      addressZipcode: app.addressZipcode || "",
    },
    school: {
      schoolName: app.schoolName || "",
      schoolProvince: app.schoolProvince || "",
    },
    gpaxInput: app.gpax ? parseFloat(String(app.gpax)).toFixed(2) : "",
    grades: app.grades && app.grades.length > 0 ? app.grades : DEFAULT_COURSES,
    attachmentsList: {
      photo: photo || null,
      transcriptFront: transcriptFront || null,
      transcriptBack: transcriptBack || null,
      idCard: idCard || null,
    },
    previewUrls,
    serverUpdatedAt: app.updatedAt
      ? new Date(app.updatedAt).toISOString()
      : null,
  };
}

export function mergeWithLocalDraft(
  server: HydratedFormState,
  local: {
    step: number;
    personal: PersonalForm;
    contactAddress: ContactAddressForm;
    school: SchoolForm;
    gpaxInput: string;
    grades: GradeRow[];
    consentChecked: boolean;
  } | null,
  preferLocal: boolean
): HydratedFormState & { step: number; consentChecked: boolean } {
  if (!local || !preferLocal) {
    return { ...server, step: 1, consentChecked: false };
  }
  return {
    ...server,
    personal: local.personal,
    contactAddress: local.contactAddress,
    school: local.school,
    gpaxInput: local.gpaxInput,
    grades: local.grades,
    step: Math.max(1, Math.min(6, local.step)),
    consentChecked: local.consentChecked,
  };
}
