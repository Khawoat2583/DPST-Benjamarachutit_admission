"use client";

import { FileCheck, Check, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApplyForm } from "../../apply-form-context";
import type { UploadSlotKey } from "../../types";
import { formStyles } from "../../form-ui";
import { cn } from "@/lib/utils";

const REVIEW_ATTACHMENTS: { label: string; key: UploadSlotKey }[] = [
  { label: "รูปถ่าย", key: "photo" },
  { label: "ปพ.1 ด้านหน้า", key: "transcriptFront" },
  { label: "ปพ.1 ด้านหลัง", key: "transcriptBack" },
  { label: "สำเนาบัตร ปชช.", key: "idCard" },
];

export function StepReview() {
  const {
    nationalIdInput,
    personal,
    contactAddress,
    school,
    clientGpas,
    attachmentsList,
    consentChecked,
    setConsentChecked,
    submitting,
    handleFinalSubmit,
    isSubmitted,
    stepValidities,
  } = useApplyForm();

  const isFormValid =
    stepValidities[1] &&
    stepValidities[2] &&
    stepValidities[3] &&
    stepValidities[4] &&
    stepValidities[5];

  return (
    <div className="space-y-8">
      <div>
        <h2 className={formStyles.stepTitle}>ตรวจสอบและกดยืนยันใบสมัครของคุณ</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          กรุณาตรวจสอบข้อมูลส่วนตัว ที่อยู่ เกรด และเอกสารแนบทุกชิ้นให้ถี่ถ้วนก่อนทำการกดยืนยันขั้นสุดท้าย
        </p>
      </div>

      <div className={formStyles.reviewCard}>
        <div className="grid sm:grid-cols-2 gap-4 text-xs leading-relaxed">
          <div>
            <span className="font-bold text-slate-400">เลขประจำตัวประชาชน:</span>
            <span className="ml-2 font-bold font-mono text-slate-800 dark:text-white">
              {nationalIdInput}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-400">ชื่อผู้สมัคร:</span>
            <span className="ml-2 font-bold text-slate-800 dark:text-white">
              {personal.title} {personal.firstName} {personal.lastName}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-400">ลำดับประกาศ พสวท:</span>
            <span className="ml-2 font-bold font-mono text-[#0b52a7] dark:text-blue-400">
              #{personal.announcementOrder}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-400">โรงเรียนเดิม:</span>
            <span className="ml-2 font-bold text-slate-800 dark:text-white">
              {school.schoolName} ({school.schoolProvince})
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-400">เบอร์โทรศัพท์:</span>
            <span className="ml-2 font-bold text-slate-800 dark:text-white">
              {contactAddress.phone} (ผู้สมัคร) / {contactAddress.guardianPhone} (ผู้ปกครอง)
            </span>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-zinc-700 my-4" />

        <div className="space-y-2">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
            เกรดเฉลี่ยที่ได้คำนวณ:
          </span>
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { label: "GPAX", val: clientGpas.gpax },
              { label: "คณิตฯ", val: clientGpas.mathGpa },
              { label: "วิทย์ฯ", val: clientGpas.scienceGpa },
              { label: "อังกฤษ", val: clientGpas.englishGpa },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 p-3"
              >
                <span className="text-[10px] font-bold text-slate-400 block mb-1">{item.label}</span>
                <span className="text-sm font-black font-mono text-slate-800 dark:text-white">
                  {item.val.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
            เอกสารหลักฐานแนบ:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {REVIEW_ATTACHMENTS.map((slot) => {
              const fileExist = attachmentsList[slot.key];
              return (
                <div
                  key={slot.key}
                  className={cn(
                    "p-3 border flex flex-col items-center justify-center gap-1.5",
                    fileExist
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-600"
                      : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-600"
                  )}
                >
                  <span className="text-[9px] font-bold block">{slot.label}</span>
                  <span className="text-[10px] font-bold flex items-center gap-1">
                    {fileExist ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>แนบแล้ว</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
                        <span>ยังไม่แนบ</span>
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {!isFormValid && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-l-4 border-rose-200 border-l-rose-500 dark:border-rose-900 p-5 sm:p-6 space-y-3.5 animate-in fade-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm sm:text-base">
              <AlertTriangle className="h-5 w-5 shrink-0 animate-pulse" />
              <span>ใบสมัครของคุณยังไม่สมบูรณ์ (กรุณาแก้ไขข้อมูลให้ถูกต้องก่อนส่ง)</span>
            </div>
            <ul className="list-disc pl-5 text-xs text-rose-700 dark:text-rose-300 space-y-1.5 leading-relaxed font-semibold">
              {!stepValidities[1] && (
                <li>ข้อมูลส่วนตัว (ขั้นตอนที่ 1): กรุณากรอกคำนำหน้า ชื่อ นามสกุล และลำดับประกาศสอบรอบแรกให้ครบถ้วน</li>
              )}
              {!stepValidities[2] && (
                <li>ข้อมูลติดต่อและที่อยู่ (ขั้นตอนที่ 2): กรุณากรอกเบอร์โทรศัพท์ (9-10 หลัก), ที่อยู่ และรหัสไปรษณีย์ (5 หลัก) ให้ถูกต้อง</li>
              )}
              {!stepValidities[3] && (
                <li>โรงเรียนและผลการเรียน (ขั้นตอนที่ 3): กรุณากรอกชื่อโรงเรียน จังหวัด และเกรดเฉลี่ยสะสม GPAX (3.00 - 4.00) ให้ถูกต้อง</li>
              )}
              {!stepValidities[4] && (
                <li>ผลการเรียน 5 เทอม (ขั้นตอนที่ 4): กรุณากรอกเกรดและหน่วยกิตรายวิชาพื้นฐานให้ครบถ้วน และมีเกรดเฉลี่ยวิชาผ่านเกณฑ์ขั้นต่ำ</li>
              )}
              {!stepValidities[5] && (
                <li>เอกสารหลักฐาน (ขั้นตอนที่ 5): กรุณาอัปโหลดเอกสารหลักฐานให้ครบถ้วนทั้ง 4 ไฟล์</li>
              )}
            </ul>
          </div>
        )}

        <div className={formStyles.consentBox}>
          <p className="mb-4 text-justify">
            &quot;ข้าพเจ้ามีความประสงค์ยื่นใบสมัครเพื่อคัดเลือกเข้าเรียนในโครงการห้องเรียน พสวท. (สู่ความเป็นเลิศ) ปีการศึกษา 2569 ศูนย์โรงเรียนเบญจมราชูทิศ และข้าพเจ้าขอรับรองว่าข้อมูลที่ข้าพเจ้ากรอกลงในใบสมัครนี้เป็นความจริงทุกประการ ทั้งนี้หากตรวจสอบพบว่าข้าพเจ้ากรอกข้อมูลที่ไม่ถูกต้องตามความเป็นจริง และ/หรือ เป็นผู้มีคุณสมบัติไม่เป็นไปตามประกาศรับสมัคร ให้ถือว่าการสมัครคัดเลือกครั้งนี้เป็นโมฆะ และให้ถือว่าข้าพเจ้าเป็นผู้ที่ไม่มีสิทธิ์เข้ารับการคัดเลือกครั้งนี้&quot;
          </p>

          <label className="flex items-center gap-3 font-bold text-slate-900 dark:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="h-5 w-5 accent-[#0b52a7] shrink-0 cursor-pointer"
            />
            <span>ข้าพเจ้ายินยอม ยอมรับและรับรองเงื่อนไขข้อตกลงข้างต้น</span>
          </label>
        </div>

        <Button
          type="button"
          onClick={handleFinalSubmit}
          disabled={
            submitting ||
            !consentChecked ||
            !isFormValid
          }
          className="w-full py-4.5 h-auto font-black tracking-wider uppercase text-sm sm:text-base rounded-none gap-2 bg-[#0b52a7] hover:bg-[#08407f]"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>กำลังประมวลผลเซฟประวัติใบสมัคร...</span>
            </>
          ) : (
            <>
              <FileCheck className="h-5 w-5" />
              <span>{isSubmitted ? "ส่งบันทึกการแก้ไขใบสมัคร" : "ส่งใบสมัครออนไลน์อย่างเป็นทางการ"}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
