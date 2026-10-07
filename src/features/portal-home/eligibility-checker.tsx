"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ClipboardCheck, ArrowRight, Info } from "lucide-react";
import { verifyGpaThresholds } from "@/features/applicant/validation";

type Field = "gpax" | "math" | "science" | "english";

const FIELDS: { key: Field; label: string; min: number }[] = [
  { key: "gpax", label: "GPAX รวม 5 เทอม", min: 3.0 },
  { key: "math", label: "เฉลี่ยคณิตศาสตร์", min: 3.0 },
  { key: "science", label: "เฉลี่ยวิทยาศาสตร์", min: 3.0 },
  { key: "english", label: "เฉลี่ยภาษาอังกฤษ", min: 2.75 },
];

export function EligibilityChecker() {
  const [vals, setVals] = useState<Record<Field, string>>({ gpax: "", math: "", science: "", english: "" });

  const setVal = (k: Field, v: string) => {
    const clean = v.replace(/[^0-9.]/g, "");
    setVals((p) => ({ ...p, [k]: clean }));
  };

  const allFilled = FIELDS.every((f) => vals[f.key].trim() !== "" && !Number.isNaN(Number(vals[f.key])));
  const result = allFilled
    ? verifyGpaThresholds({
        gpax: Number(vals.gpax),
        mathGpa: Number(vals.math),
        scienceGpa: Number(vals.science),
        englishGpa: Number(vals.english),
      })
    : null;
  const passByKey = new Map(result?.items.map((i) => [i.key, i.pass]));

  return (
    <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-yellow-400 shadow-sm">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 bg-[#0b52a7] flex items-center justify-center text-white shrink-0">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">ตรวจสอบคุณสมบัติเบื้องต้น</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              กรอกเกรดเฉลี่ยเพื่อประเมินเบื้องต้นว่าผ่านเกณฑ์ขั้นต่ำหรือไม่ ก่อนเริ่มกรอกใบสมัครจริง
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FIELDS.map((f) => {
            const filled = vals[f.key].trim() !== "" && !Number.isNaN(Number(vals[f.key]));
            const pass = passByKey.get(f.key);
            return (
              <div key={f.key}>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
                  {f.label}
                  <span className="ml-1 font-mono text-slate-400">≥ {f.min.toFixed(2)}</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    max="4"
                    value={vals[f.key]}
                    onChange={(e) => setVal(f.key, e.target.value)}
                    placeholder="0.00"
                    className={`w-full py-2.5 px-3 pr-9 bg-slate-50 dark:bg-zinc-800/60 border rounded-none font-mono text-center text-lg focus:outline-none focus:ring-2 focus:ring-[#0b52a7]/30 transition-all ${
                      filled
                        ? pass
                          ? "border-emerald-400 dark:border-emerald-700"
                          : "border-rose-400 dark:border-rose-700"
                        : "border-slate-200 dark:border-zinc-700"
                    }`}
                  />
                  {filled && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      {pass ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-500" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Verdict */}
        {result && (
          result.isEligible ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50 dark:bg-emerald-950/20 border border-l-4 border-emerald-200 border-l-emerald-500 dark:border-emerald-900/50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-black text-emerald-700 dark:text-emerald-300">ผ่านเกณฑ์คุณสมบัติเบื้องต้น</p>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">เกรดของคุณผ่านเกณฑ์ขั้นต่ำทุกข้อ สามารถเริ่มกรอกใบสมัครได้</p>
                </div>
              </div>
              <Link
                href="/apply"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0b52a7] hover:bg-[#08407f] text-white font-bold text-sm shadow-sm transition-colors shrink-0"
              >
                เริ่มกรอกใบสมัคร
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-l-4 border-rose-200 border-l-rose-500 dark:border-rose-900/50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-sm">
                <XCircle className="h-5 w-5 shrink-0" />
                ยังไม่ผ่านเกณฑ์ขั้นต่ำในบางวิชา
              </div>
              <ul className="list-disc pl-5 text-xs text-rose-700/90 dark:text-rose-300/90 space-y-1 font-semibold">
                {result.items.filter((i) => !i.pass).map((i) => (
                  <li key={i.key}>
                    {i.label}: ได้ {i.value.toFixed(2)} (ต้องไม่ต่ำกว่า {i.min.toFixed(2)})
                  </li>
                ))}
              </ul>
            </div>
          )
        )}

        <p className="flex items-start gap-1.5 text-[11px] text-slate-400 dark:text-zinc-500 leading-relaxed">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          เป็นการประเมินเบื้องต้นเท่านั้น เกรดเฉลี่ยจริงจะคำนวณจากรายวิชาพื้นฐานที่กรอกในใบสมัคร และต้องผ่านการตรวจสอบโดยเจ้าหน้าที่
        </p>
      </div>
    </section>
  );
}
