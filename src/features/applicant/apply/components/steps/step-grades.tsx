"use client";

import { SEMESTER_NAMES } from "../../constants";
import { useApplyForm } from "../../apply-form-context";
import { formStyles } from "../../form-ui";
import { SemesterGradeCard } from "./grades/semester-grade-card";
import { GpaSummaryPanel } from "./grades/gpa-summary-panel";

export function StepGrades() {
  const {
    grades,
    setGrades,
    addGradeRow,
    removeGradeRow,
    getSemesterCompleteness,
    clientGpas,
    isGradesFormFilled,
    hasCourseCodeErrors,
  } = useApplyForm();

  return (
    <div className={formStyles.stepSection}>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
          <div>
            <h2 className={formStyles.stepTitle}>ผลการเรียนรายวิชาบังคับพื้นฐาน 5 ภาคเรียน</h2>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1">
              * กรุณากรอกรหัสวิชาตาม ปพ.1 เฉพาะรายวิชาพื้นฐานเท่านั้น (ห้ามใช้วิชาเพิ่มเติม รหัสตัวที่ 3 ต้องเป็นเลข 1)
            </p>
          </div>

          {Array.from({ length: 5 }).map((_, index) => {
            const semNum = index + 1;
            const semTitle = SEMESTER_NAMES[semNum];

            return (
              <SemesterGradeCard
                key={semNum}
                semNum={semNum}
                semTitle={semTitle}
                grades={grades}
                setGrades={setGrades}
                addGradeRow={addGradeRow}
                removeGradeRow={removeGradeRow}
                getSemesterCompleteness={getSemesterCompleteness}
              />
            );
          })}
        </div>

        <GpaSummaryPanel
          clientGpas={clientGpas}
          isGradesFormFilled={isGradesFormFilled}
          hasCourseCodeErrors={hasCourseCodeErrors}
        />
      </div>
    </div>
  );
}
