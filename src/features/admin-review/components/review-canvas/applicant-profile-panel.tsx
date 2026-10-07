import React from "react";
import { Application } from "../../types";

interface ApplicantProfilePanelProps {
  application: Application;
}

export function ApplicantProfilePanel({ application }: ApplicantProfilePanelProps) {
  const isDraft = application.status === "draft";

  const displayName = isDraft 
    ? ((application.firstName || "").trim() || (application.lastName || "").trim()
        ? `${application.firstName || ""} ${application.lastName || ""}`.trim()
        : "ยังไม่กรอกชื่อ-นามสกุล")
    : `${application.firstName} ${application.lastName}`;

  const displayAnnouncementOrder = (isDraft && (application.announcementOrder === null || application.announcementOrder === undefined || application.announcementOrder === 0))
    ? "ยังไม่กรอก"
    : application.announcementOrder;

  const displaySchool = isDraft
    ? (application.schoolName && application.schoolProvince
        ? `${application.schoolName} (${application.schoolProvince})`
        : (application.schoolName || application.schoolProvince
            ? `${application.schoolName || "ยังไม่กรอก"} (${application.schoolProvince || "ยังไม่กรอก"})`
            : "ยังไม่กรอก"))
    : `${application.schoolName} (${application.schoolProvince})`;

  return (
    <div>
      <h1 className="text-md sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
        {displayName}
        <span className="text-xs font-bold text-slate-400 font-mono">
          (ลำดับประกาศ: {displayAnnouncementOrder})
        </span>
      </h1>
      <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 font-mono">
        เลขบัตรประชาชน: {application.nationalId} • โรงเรียนเดิม: {displaySchool}
      </p>
    </div>
  );
}
