"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Save } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ContactFab } from "@/components/shared/contact-fab";
import { PageBanner } from "@/components/shared/page-banner";
import { DEFAULT_COURSES, SEMESTER_NAMES } from "@/features/applicant/apply/constants";
import {
  computeClientGpas,
  getSemesterCompleteness as getSemesterCompletenessDerived,
  hasCourseCodeErrors as hasCourseCodeErrorsDerived,
  isGradesFormFilled as isGradesFormFilledDerived,
} from "@/features/applicant/apply/lib/form-derived";
import {
  saveEligibilityDraft,
  loadEligibilityDraft,
} from "@/features/applicant/apply/lib/draft-storage";
import type { GradeRow } from "@/features/applicant/apply/types";
import { SemesterGradeCard } from "@/features/applicant/apply/components/steps/grades/semester-grade-card";
import { GpaSummaryPanel } from "@/features/applicant/apply/components/steps/grades/gpa-summary-panel";

export default function EligibilityPage() {
  const [grades, setGrades] = useState<GradeRow[]>(DEFAULT_COURSES);
  const [gpaxInput, setGpaxInput] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // Restore any previous pre-check draft on mount
  useEffect(() => {
    const draft = loadEligibilityDraft();
    if (draft) {
      if (Array.isArray(draft.grades) && draft.grades.length > 0) setGrades(draft.grades);
      if (typeof draft.gpaxInput === "string") setGpaxInput(draft.gpaxInput);
    }
    setHydrated(true);
  }, []);

  // Persist on change so the data can be reused in the real application
  useEffect(() => {
    if (!hydrated) return;
    saveEligibilityDraft({ grades, gpaxInput });
  }, [grades, gpaxInput, hydrated]);

  const addGradeRow = (semesterNum: number) =>
    setGrades((prev) => [
      ...prev,
      { semester: semesterNum, courseCode: "", credit: "", grade: "", subjectGroup: "math", courseName: "" },
    ]);
  const removeGradeRow = (globalIdx: number) =>
    setGrades((prev) => prev.filter((_, idx) => idx !== globalIdx));
  const getSemesterCompleteness = (semNum: number) => getSemesterCompletenessDerived(grades, semNum);

  const clientGpas = useMemo(() => computeClientGpas(grades, gpaxInput), [grades, gpaxInput]);
  const isGradesFormFilled = useMemo(() => isGradesFormFilledDerived(grades), [grades]);
  const hasCourseCodeErrors = useMemo(() => hasCourseCodeErrorsDerived(grades), [grades]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 font-prompt">
      <Navbar />

      <PageBanner
        title="ตรวจสอบคุณสมบัติเบื้องต้น"
        subtitle="กรอกผลการเรียนเพื่อประเมินว่าผ่านเกณฑ์ขั้นต่ำหรือไม่ ก่อนเริ่มกรอกใบสมัครจริง"
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Link
          href="/admission"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-zinc-400 hover:text-[#0b52a7] dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าการรับสมัคร
        </Link>

        {/* GPAX input */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-[#0b52a7] p-6 shadow-sm">
          <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-[0.14em] mb-2">
            เกรดเฉลี่ยสะสมรวม 5 เทอม ตาม ปพ.1 (GPAX)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="4"
            placeholder="เช่น 3.85"
            value={gpaxInput}
            onChange={(e) => setGpaxInput(e.target.value)}
            className="w-2/3 sm:w-1/3 py-3 px-4 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-none font-mono text-lg text-center focus:outline-none focus:ring-2 focus:ring-[#0b52a7]/30 focus:border-[#0b52a7]/60 transition-all"
          />
          <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-1.5">
            * อ้างอิงจากตัวเลขบนใบ ปพ.1 สำหรับตรวจคุณสมบัติขั้นต่ำ (ต้องไม่ต่ำกว่า 3.00)
          </p>
        </div>

        {/* Grades table + live summary (เหมือนตอนกรอกใบสมัครจริง) */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                ผลการเรียนรายวิชาบังคับพื้นฐาน 5 ภาคเรียน
              </h2>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1">
                * กรุณากรอกรหัสวิชาตาม ปพ.1 เฉพาะรายวิชาพื้นฐานเท่านั้น (ห้ามใช้วิชาเพิ่มเติม รหัสตัวที่ 3 ต้องเป็นเลข 1)
              </p>
            </div>

            {Array.from({ length: 5 }).map((_, index) => {
              const semNum = index + 1;
              return (
                <SemesterGradeCard
                  key={semNum}
                  semNum={semNum}
                  semTitle={SEMESTER_NAMES[semNum]}
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

        {/* CTA */}
        <div className="bg-[#0b52a7]/[0.03] dark:bg-blue-950/10 border border-[#0b52a7]/20 dark:border-blue-800/30 border-l-4 border-l-yellow-400 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <Save className="h-4 w-4 text-[#0b52a7] dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              เริ่มกรอกใบสมัครจริง
              (หากยังไม่ได้กรอกประวัติ)
            </p>
          </div>
          <Link
            href="/apply"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0b52a7] hover:bg-[#08407f] text-white font-bold text-sm shadow-sm transition-colors shrink-0"
          >
            ไปกรอกใบสมัครจริง
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <Footer />
      <ContactFab />
    </div>
  );
}
