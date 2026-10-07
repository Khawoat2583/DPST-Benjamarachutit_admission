import { User, MapPin, FileText } from "lucide-react";
import { ATTACHMENT_LABELS } from "../constants";

type ApplicantDetailsProps = {
  application: Record<string, unknown>;
};

export function ApplicantDetails({ application }: ApplicantDetailsProps) {
  const attachments = (application.attachments as Array<Record<string, unknown>>) || [];

  const gpaItems = [
    { label: "GPAX รวม", val: application.gpax as number | null },
    { label: "คณิตฯ", val: application.mathGpa as number | null },
    { label: "วิทย์ฯ", val: application.scienceGpa as number | null },
    { label: "อังกฤษ", val: application.englishGpa as number | null },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-[#0b52a7] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-4">
        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
          รายละเอียดข้อมูลผู้สมัคร
        </h3>
        <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500">
          ประกาศลำดับที่ #{String(application.announcementOrder)}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-xs">
        <div className="flex items-center gap-2.5">
          <User className="h-4 w-4 text-slate-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[9px] font-bold uppercase">ชื่อ-นามสกุล</span>
            <span className="font-bold text-slate-800 dark:text-white">
              {String(application.title)} {String(application.firstName)}{" "}
              {String(application.lastName)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[9px] font-bold uppercase">โรงเรียนเดิม</span>
            <span className="font-bold text-slate-800 dark:text-white">
              {String(application.schoolName)} ({String(application.schoolProvince)})
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-zinc-800 pt-6">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">
          สรุปเกรดเฉลี่ยรายวิชาพื้นฐานสะสม 5 เทอม
        </span>
        <div className="grid grid-cols-4 gap-3 text-center">
          {gpaItems.map((g) => (
            <div
              key={g.label}
              className="bg-slate-50 dark:bg-zinc-800/45 border border-slate-200 dark:border-zinc-700 p-3.5"
            >
              <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 block mb-1">
                {g.label}
              </span>
              <span className="text-sm font-black font-mono text-slate-800 dark:text-white">
                {g.val !== null && g.val !== undefined ? Number(g.val).toFixed(2) : "-"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-zinc-800 pt-6">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
          เอกสารประกอบการสมัคร
        </span>
        <div className="space-y-2">
          {attachments.map((attach) => (
            <div
              key={String(attach.id)}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 text-xs"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#0b52a7] dark:text-blue-400 shrink-0" />
                <span className="font-bold text-slate-700 dark:text-zinc-300">
                  {ATTACHMENT_LABELS[String(attach.documentType)] ||
                    String(attach.documentType)}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 max-w-[180px] sm:max-w-xs truncate font-bold">
                {String(attach.originalName)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
