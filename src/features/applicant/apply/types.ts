export type PersonalForm = {
  title: string;
  firstName: string;
  lastName: string;
  announcementOrder: string;
};

export type ContactAddressForm = {
  email: string;
  phone: string;
  guardianPhone: string;
  addressNo: string;
  addressMoo: string;
  addressSoi: string;
  addressRoad: string;
  addressSubdistrict: string;
  addressDistrict: string;
  addressProvince: string;
  addressZipcode: string;
};

export type SchoolForm = {
  schoolName: string;
  schoolProvince: string;
};

export type GradeRow = {
  subjectGroup: string;
  semester: number;
  courseCode: string;
  courseName: string;
  credit: number | string;
  grade: number | string;
};

export type AttachmentRecord = {
  id: number;
  documentType: string;
  originalName?: string;
  storedName?: string;
  mimeType?: string;
};

export type AttachmentsList = {
  photo: AttachmentRecord | null;
  transcriptFront: AttachmentRecord | null;
  transcriptBack: AttachmentRecord | null;
  idCard: AttachmentRecord | null;
};

export type UploadSlotKey = keyof AttachmentsList;

export type PreviewModalState = {
  url: string;
  label: string;
  mimeType: string;
} | null;

export type AddressDbRow = [string, string, string, string];

export type ClientGpas = {
  mathGpa: number;
  scienceGpa: number;
  englishGpa: number;
  gpax: number;
  isEligible: boolean;
  errors: string[];
};
