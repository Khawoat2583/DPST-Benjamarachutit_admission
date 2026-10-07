export interface Grade {
  id: number;
  subjectGroup: "math" | "science" | "english";
  semester: number;
  courseCode: string;
  courseName: string;
  credit: string;
  grade: string;
}

export interface Attachment {
  id: number;
  documentType: "photo" | "transcript" | "id_card";
  originalName: string;
  storedName: string;
  mimeType: string;
  fileSize: number;
}

export interface Application {
  id: number;
  status: string;
  nationalId: string;
  title: string | null;
  firstName: string;
  lastName: string;
  announcementOrder: number | null;
  email: string | null;
  phone: string | null;
  guardianPhone: string | null;
  addressNo: string | null;
  addressMoo: string | null;
  addressSoi: string | null;
  addressRoad: string | null;
  addressSubdistrict: string | null;
  addressDistrict: string | null;
  addressProvince: string | null;
  addressZipcode: string | null;
  schoolName: string | null;
  schoolProvince: string | null;
  gpax: string | null;
  mathGpa: string | null;
  scienceGpa: string | null;
  englishGpa: string | null;
  rejectionReason: string | null;
  grades: Grade[];
  attachments: Attachment[];
}
