"use client";

import { Trash2 } from "lucide-react";
import { getCourseCodeValidationError, isCoreSubjectCode } from "@/features/applicant/course-code";
import type { GradeRow } from "@/features/applicant/apply/types";
import { cn } from "@/lib/utils";

type GradeRowEditorProps = {
  grade: GradeRow;
  showRemove: boolean;
  onCourseCodeChange: (value: string) => void;
  onCreditChange: (value: string) => void;
  onGradeChange: (value: string) => void;
  onRemove: () => void;
};

export function GradeRowEditor({
  grade,
  showRemove,
  onCourseCodeChange,
  onCreditChange,
  onGradeChange,
  onRemove,
}: GradeRowEditorProps) {
  const isCodeErr = grade.courseCode && !isCoreSubjectCode(grade.courseCode);
  const isCreditMissing =
    grade.courseCode.trim() !== "" &&
    (grade.credit === "" || grade.credit === null || grade.credit === undefined);
  const isGradeMissing =
    grade.courseCode.trim() !== "" &&
    (grade.grade === "" || grade.grade === null || grade.grade === undefined);

  return (
    <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center">
      <div className="col-span-4 relative">
        <input
          type="text"
          placeholder="รหัสวิชา"
          value={grade.courseCode}
          onChange={(event) => onCourseCodeChange(event.target.value.toUpperCase())}
          className={cn(
            "w-full text-center py-2 px-2 text-xs bg-white dark:bg-zinc-800 border rounded-none focus:outline-none focus:ring-1 focus:ring-[#0b52a7] font-mono font-bold",
            isCodeErr
              ? "border-rose-500/80 dark:border-rose-900 bg-rose-50/10 dark:bg-rose-950/10 text-rose-600 focus:ring-rose-500"
              : "border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200"
          )}
        />
        {isCodeErr ? (
          <span className="text-[8px] text-rose-500 block text-center leading-none mt-1">
            {getCourseCodeValidationError(grade.courseCode)}
          </span>
        ) : null}
      </div>

      <div className="col-span-3">
        <select
          value={grade.credit}
          onChange={(event) => onCreditChange(event.target.value)}
          className={cn(
            "w-full text-center py-2 px-2 text-xs bg-white dark:bg-zinc-800 border rounded-none focus:outline-none focus:ring-1 focus:ring-[#0b52a7] font-mono",
            isCreditMissing
              ? "border-rose-500/80 dark:border-rose-900 bg-rose-50/10 dark:bg-rose-950/10 text-rose-600 focus:ring-rose-500"
              : "border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200"
          )}
        >
          <option value="">หน่วยกิต</option>
          {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((credit) => (
            <option key={credit} value={credit}>
              {credit.toFixed(1)}
            </option>
          ))}
        </select>
        {isCreditMissing ? (
          <span className="text-[8px] text-rose-500 block text-center leading-none mt-1 animate-pulse font-semibold">
            ⚠️ เลือกหน่วยกิต
          </span>
        ) : null}
      </div>

      <div className="col-span-3">
        <select
          value={grade.grade}
          onChange={(event) => onGradeChange(event.target.value)}
          className={cn(
            "w-full text-center py-2 px-2 text-xs bg-white dark:bg-zinc-800 border rounded-none focus:outline-none focus:ring-1 focus:ring-[#0b52a7] font-mono font-bold",
            isGradeMissing
              ? "border-rose-500/80 dark:border-rose-900 bg-rose-50/10 dark:bg-rose-950/10 text-rose-600 focus:ring-rose-500"
              : "border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200"
          )}
        >
          <option value="">เกรด</option>
          {[0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0].map((gradeValue) => (
            <option key={gradeValue} value={gradeValue}>
              {gradeValue.toFixed(1)}
            </option>
          ))}
        </select>
        {isGradeMissing ? (
          <span className="text-[8px] text-rose-500 block text-center leading-none mt-1 animate-pulse font-semibold">
            ⚠️ เลือกเกรด
          </span>
        ) : null}
      </div>

      <div className="col-span-2 text-center">
        {showRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-none transition-colors inline-flex justify-center items-center"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
