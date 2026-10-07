import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export type StatusDetails = {
  title: string;
  description: string;
  colorClass: string;
  icon: LucideIcon;
};

export function getStatusDetails(status: string): StatusDetails {
  const displayStatus = (status === "ranked" || status === "exported") ? "approved" : status;

  switch (displayStatus) {
    case "draft":
      return {
        title: "อยู่ระหว่างกรอกข้อมูล (แบบร่าง)",
        description: "ใบสมัครของคุณยังกรอกไม่เสร็จสมบูรณ์หรืออยู่ในสถานะแบบร่าง",
        colorClass:
          "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50",
        icon: Clock,
      };
    case "submitted":
      return {
        title: "ยื่นใบสมัครแล้ว (Submitted)",
        description:
          "ระบบได้รับใบสมัครและเอกสารแนบเรียบร้อยแล้ว อยู่ระหว่างเจ้าหน้าที่ตรวจสอบคุณสมบัติ",
        colorClass:
          "text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50",
        icon: Clock,
      };
    case "approved":
      return {
        title: "ผ่านการตรวจสอบเอกสารแล้ว (Approved)",
        description:
          "เอกสารและเกรดของคุณถูกต้องตรงตามเงื่อนไข รอการประมวลผลจัดอันดับ (Ranking)",
        colorClass:
          "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50",
        icon: CheckCircle2,
      };
    case "rejected":
      return {
        title: "ต้องแก้ไขข้อมูล/เอกสาร (Rejected)",
        description:
          "เจ้าหน้าที่พบข้อมูลหรือเอกสารที่ไม่ถูกต้อง โปรดคลิกเพื่อทำการแก้ไขข้อมูลโดยด่วน",
        colorClass:
          "text-rose-600 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50",
        icon: XCircle,
      };
    default:
      return {
        title: "ไม่ทราบสถานะ",
        description: "สถานะใบสมัครไม่ชัดเจน กรุณาติดต่อผู้ดูแลระบบ",
        colorClass: "text-slate-500 bg-slate-50 dark:bg-zinc-900",
        icon: AlertCircle,
      };
  }
}

export function getCurrentStatusIndex(status: string): number {
  const statusList = ["submitted", "approved"] as const;
  const normalized =
    status === "rejected"
      ? "submitted"
      : (status === "ranked" || status === "exported")
        ? "approved"
        : status;
  return statusList.indexOf(normalized as (typeof statusList)[number]);
}
