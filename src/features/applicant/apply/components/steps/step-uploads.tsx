"use client";

import { UploadCloud, Check, Eye, FileText } from "lucide-react";
import Image from "next/image";
import { UPLOAD_SLOTS } from "../../constants";
import { useApplyForm } from "../../apply-form-context";
import { formStyles } from "../../form-ui";

export function StepUploads() {
  const { attachmentsList, previewUrls, setPreviewModal, handleFileUpload } = useApplyForm();

  return (
    <div className={formStyles.stepSection}>
      <h2 className={formStyles.stepTitle}>อัปโหลดเอกสารระเบียนการเรียนและหลักฐานสำคัญ</h2>
      <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-2xl leading-normal">
        กรุณาถ่ายภาพหรือสแกนเอกสารให้ชัดเจนครบถ้วนเพื่อผลดีในการตรวจสอบ ไฟล์ต้องมีขนาดไม่เกิน 5MB ต่อใบ (รองรับ .png, .jpg, .jpeg, .pdf)
      </p>

      <div className="grid sm:grid-cols-2 gap-8 mt-6">
        {UPLOAD_SLOTS.map((slot) => {
          const existing = attachmentsList[slot.key];
          const openPreview = () =>
            setPreviewModal({
              url: previewUrls[slot.key],
              label: slot.label,
              mimeType:
                existing?.mimeType ||
                (existing?.originalName?.endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
            });

          return (
            <div key={slot.key} className={formStyles.uploadSlot}>
              {/* Header Title - Always visible at the top */}
              <div className="text-sm font-bold text-slate-855 dark:text-zinc-150 border-b border-slate-100 dark:border-zinc-800/80 pb-2.5 mb-4 flex items-center justify-between">
                <span>{slot.label}</span>
                {existing && (
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 font-bold">
                    อัปโหลดแล้ว
                  </span>
                )}
              </div>

              {existing && previewUrls[slot.key] ? (
                <button
                  type="button"
                  onClick={openPreview}
                  className="relative group w-full aspect-[4/3] overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 cursor-pointer transition-all hover:shadow-lg hover:border-[#0b52a7]/50 dark:hover:border-blue-700"
                >
                  {(existing.mimeType || "").startsWith("image") ||
                  /\.(png|jpe?g)$/i.test(existing.originalName || "") ? (
                    <Image
                      src={previewUrls[slot.key]}
                      alt={slot.label}
                      width={400}
                      height={300}
                      unoptimized
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-zinc-500">
                      <FileText className="h-10 w-10" />
                      <span className="text-[10px] font-bold">PDF</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-zinc-900/90 text-slate-800 dark:text-white text-[10px] font-bold py-1.5 px-3 flex items-center gap-1 shadow-lg backdrop-blur-sm">
                      <Eye className="h-3 w-3" />
                      ดูตัวอย่าง
                    </span>
                  </div>
                </button>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 py-8 bg-slate-50/50 dark:bg-zinc-950/20 border border-dashed border-slate-200 dark:border-zinc-800 aspect-[4/3] w-full">
                  <UploadCloud className="h-10 w-10 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">ยังไม่ได้เลือกไฟล์</span>
                </div>
              )}

              {existing ? (
                <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-950/30 w-full space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 shrink-0">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 truncate text-left font-mono">
                        {existing.originalName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {previewUrls[slot.key] && (
                        <button
                          type="button"
                          onClick={openPreview}
                          className="text-[10px] font-bold text-[#0b52a7] hover:text-[#08407f] dark:text-blue-400 underline cursor-pointer"
                        >
                          ดูไฟล์
                        </button>
                      )}
                      <label className="text-[10px] font-bold text-[#0b52a7] hover:text-[#08407f] dark:text-blue-400 underline cursor-pointer">
                        แก้ไข
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, application/pdf"
                          onChange={(e) => handleFileUpload(e, slot.type)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-center">
                  <label className="py-2 px-5 bg-[#0b52a7] hover:bg-[#08407f] hover:shadow-xs text-white text-xs font-bold transition-all cursor-pointer inline-block">
                    เลือกไฟล์รูป/PDF
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, application/pdf"
                      onChange={(e) => handleFileUpload(e, slot.type)}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
