import React from "react";
import { Grade } from "../../types";

interface GradeEditorTableProps {
  semesterGrades: Record<number, Grade[]>;
  isReadOnly: boolean;
  handleGradeChange: (id: number, field: keyof Grade, value: string) => void;
}

export function GradeEditorTable({
  semesterGrades,
  isReadOnly,
  handleGradeChange,
}: GradeEditorTableProps) {
  // Subject group localized names & styles
  const getSubjectStyle = (group: string) => {
    switch (group) {
      case "math":
        return "bg-[#0b52a7]/5 border-[#0b52a7]/20 dark:bg-blue-950/20 dark:border-blue-900/30 text-[#0b52a7] dark:text-blue-200";
      case "science":
        return "bg-slate-50 border-slate-200 dark:bg-zinc-800/40 dark:border-zinc-700 text-slate-800 dark:text-zinc-200";
      case "english":
        return "bg-amber-50/70 border-amber-200/50 dark:bg-amber-950/20 dark:border-amber-900/30 text-amber-900 dark:text-amber-200";
      default:
        return "bg-slate-50 border-slate-200 dark:bg-zinc-800 dark:border-zinc-700 text-slate-800 dark:text-zinc-200";
    }
  };

  const getSubjectText = (group: string) => {
    switch (group) {
      case "math":
        return "คณิตศาสตร์";
      case "science":
        return "วิทยาศาสตร์";
      case "english":
        return "ภาษาอังกฤษ";
      default:
        return group;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-300 uppercase tracking-wider pl-1">
        ตารางป้อนตรวจสอบรายวิชาหลัก (Course Grades Editor)
      </h2>

      {Object.keys(semesterGrades).map((semStr) => {
        const sem = Number(semStr);
        return (
          <div
            key={sem}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-4"
          >
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800 pb-2">
              ภาคการศึกษา ม.{Math.ceil(sem / 2)} เทอม {sem % 2 === 0 ? 2 : 1} (Semester {sem})
            </h3>

            <div className="space-y-3.5">
              {semesterGrades[sem].map((course) => (
                <div
                  key={course.id}
                  className={`p-3 border grid sm:grid-cols-12 gap-3.5 items-center ${getSubjectStyle(
                    course.subjectGroup
                  )}`}
                >
                  {/* Subject type badge */}
                  <div className="sm:col-span-2 text-[10px] font-bold uppercase pl-1 shrink-0">
                    {getSubjectText(course.subjectGroup)}
                  </div>

                  {/* Code */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] text-slate-400 font-semibold block sm:hidden">
                      รหัสวิชา
                    </label>
                    <input
                      type="text"
                      value={course.courseCode}
                      disabled={isReadOnly}
                      onChange={(e) => handleGradeChange(course.id, "courseCode", e.target.value)}
                      className="w-full px-2 py-1 bg-white/70 dark:bg-zinc-950/30 border border-white/20 dark:border-zinc-800 rounded-none text-xs font-bold font-mono focus:outline-hidden disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100/50 dark:disabled:bg-zinc-800/20"
                    />
                  </div>

                  {/* Name */}
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-[10px] text-slate-400 font-semibold block sm:hidden">
                      ชื่อวิชา
                    </label>
                    <input
                      type="text"
                      value={course.courseName}
                      disabled={isReadOnly}
                      onChange={(e) => handleGradeChange(course.id, "courseName", e.target.value)}
                      className="w-full px-2 py-1 bg-white/70 dark:bg-zinc-950/30 border border-white/20 dark:border-zinc-800 rounded-none text-xs font-medium focus:outline-hidden disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100/50 dark:disabled:bg-zinc-800/20"
                    />
                  </div>

                  {/* Credit */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] text-slate-400 font-semibold block sm:hidden">
                      หน่วยกิต
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="5.0"
                      value={course.credit}
                      disabled={isReadOnly}
                      onChange={(e) => handleGradeChange(course.id, "credit", e.target.value)}
                      className="w-full px-2 py-1 bg-white/75 dark:bg-zinc-950/40 border border-white/20 dark:border-zinc-800 rounded-none text-xs font-black text-center font-mono focus:outline-hidden disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100/50 dark:disabled:bg-zinc-800/20"
                    />
                  </div>

                  {/* Grade */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] text-slate-400 font-semibold block sm:hidden">
                      เกรด
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.00"
                      max="4.00"
                      value={course.grade}
                      disabled={isReadOnly}
                      onChange={(e) => handleGradeChange(course.id, "grade", e.target.value)}
                      className="w-full px-2 py-1 bg-white/75 dark:bg-zinc-950/40 border border-white/20 dark:border-zinc-800 rounded-none text-xs font-black text-center font-mono focus:outline-hidden text-[#0b52a7] dark:text-blue-400 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100/50 dark:disabled:bg-zinc-800/20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
