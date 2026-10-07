export const ATTACHMENT_LABELS: Record<string, string> = {
  photo: "รูปถ่ายนักเรียน",
  transcript: "สำเนาใบระเบียนการศึกษา (ปพ.1)",
  id_card: "สำเนาบัตรประชาชน",
};

export const TIMELINE_STEPS = [
  {
    title: "ยื่นใบสมัครแล้ว",
    desc: "สมัครและอัปโหลดสมบูรณ์",
    statusKey: "submitted",
    timeField: "submittedAt" as const,
  },
  {
    title: "เอกสารผ่านการอนุมัติ",
    desc: "ผ่านเกณฑ์เบื้องต้นแล้ว",
    statusKey: "approved",
    timeField: "reviewedAt" as const,
  },
] as const;
