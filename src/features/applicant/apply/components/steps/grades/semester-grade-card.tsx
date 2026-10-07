"use client";

import { Button } from "@/components/ui/button";
import type { GradeRow } from "@/features/applicant/apply/types";
import { formStyles } from "../../../form-ui";
import { GradeRowEditor } from "./grade-row-editor";

type SemesterGradeCardProps = {
  semNum: number;
  semTitle: string;
  grades: GradeRow[];
  addGradeRow: (semesterNum: number) => void;
  removeGradeRow: (globalIdx: number) => void;
  setGrades: React.Dispatch<React.SetStateAction<GradeRow[]>>;
  getSemesterCompleteness: (semNum: number) => { isComplete: boolean; missing: string[] };
};

function deriveSubjectGroup(courseCode: string): GradeRow["subjectGroup"] {
  if (courseCode.startsWith("ค")) return "math";
  if (courseCode.startsWith("ว")) return "science";
  if (courseCode.startsWith("อ")) return "english";
  return "math";
}

export function SemesterGradeCard({
  semNum,
  semTitle,
  grades,
  addGradeRow,
  removeGradeRow,
  setGrades,
  getSemesterCompleteness,
}: SemesterGradeCardProps) {
  const semGrades = grades
    .map((grade, index) => ({ grade, index }))
    .filter(({ grade }) => grade.semester === semNum);

  const completeness = getSemesterCompleteness(semNum);

  const updateGrade = (index: number, patch: Partial<GradeRow>) => {
    setGrades((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...patch };
      return updated;
    });
  };

  return (
    <div className={formStyles.semesterCard}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 gap-2">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-900 dark:text-zinc-200">
          {semTitle}
        </h3>
        {!completeness.isComplete ? (
          <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/35 px-2.5 py-0.5 shrink-0 border border-amber-200 dark:border-amber-900/45">
            ⚠️ ขาดวิชา: {completeness.missing.join(", ")}
          </span>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-2 sm:gap-4 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-center">
          <div className="col-span-4">รหัสวิชา</div>
          <div className="col-span-3">หน่วยกิต</div>
          <div className="col-span-3">เกรด</div>
          <div className="col-span-2" />
        </div>

        {semGrades.map(({ grade, index }) => (
          <GradeRowEditor
            key={`${semNum}-${index}`}
            grade={grade}
            showRemove={semGrades.length > 1}
            onCourseCodeChange={(value) => {
              updateGrade(index, {
                courseCode: value,
                subjectGroup: deriveSubjectGroup(value),
              });
            }}
            onCreditChange={(value) => {
              updateGrade(index, {
                credit: value !== "" ? parseFloat(value) : "",
              });
            }}
            onGradeChange={(value) => {
              updateGrade(index, {
                grade: value !== "" ? parseFloat(value) : "",
              });
            }}
            onRemove={() => removeGradeRow(index)}
          />
        ))}
      </div>

      <div className="pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => addGradeRow(semNum)}
          className="gap-1.5 text-[10px] sm:text-xs font-semibold text-[#0b52a7] hover:text-[#08407f] dark:text-blue-400 h-auto px-3 py-1.5 rounded-none uppercase tracking-wider bg-[#0b52a7]/8 hover:bg-[#0b52a7]/15 dark:bg-zinc-800/60"
        >
          <span>+ เพิ่มรายวิชาบังคับพื้นฐาน</span>
        </Button>
      </div>
    </div>
  );
}
