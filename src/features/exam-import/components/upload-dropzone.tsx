import React from "react";
import { Upload, Loader2 } from "lucide-react";

interface UploadDropzoneProps {
  isDragActive: boolean;
  isParsing: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadDropzone({
  isDragActive,
  isParsing,
  fileInputRef,
  handleDrag,
  handleDrop,
  handleFileInputChange,
}: UploadDropzoneProps) {
  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] ${
        isDragActive
          ? "border-[#0b52a7] bg-[#0b52a7]/5 dark:bg-blue-950/15"
          : "border-slate-300 dark:border-zinc-800 hover:border-[#0b52a7] dark:hover:border-blue-900 bg-white dark:bg-zinc-900 hover:bg-slate-50/50 dark:hover:bg-zinc-800/10"
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".xlsx"
        className="hidden"
      />

      {isParsing ? (
        <div className="space-y-4">
          <Loader2 className="h-12 w-12 text-[#0b52a7] animate-spin mx-auto" />
          <div>
            <p className="text-base font-bold text-slate-800 dark:text-zinc-200">
              กำลังประมวลผลวิเคราะห์ไฟล์ (Preflight Check)...
            </p>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              ระบบกำลังอ่านข้อมูลแถวคอลัมน์ และจับคู่รายชื่อผู้สมัครสะสมในระบบเพื่อประเมินความเข้ากันได้
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5 max-w-md">
          <div className="p-4 bg-[#0b52a7]/10 dark:bg-blue-950/40 text-[#0b52a7] dark:text-blue-400 w-fit mx-auto">
            <Upload className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <p className="text-base font-black text-slate-900 dark:text-white">
              ลากไฟล์ข้อมูล Excel มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500">
              รองรับรูปแบบเฉพาะนามสกุลไฟล์ <span className="font-bold text-[#0b52a7] font-mono">.xlsx</span> เท่านั้น
            </p>
          </div>
          <div className="text-[10px] bg-slate-100 dark:bg-zinc-800 p-3 text-slate-500 leading-relaxed font-semibold">
            <span className="font-bold block text-slate-600 dark:text-zinc-400 mb-1">
              💡 คำแนะนำคอลัมน์ Excel:
            </span>
            ไฟล์ Excel ควรมีหัวตารางระบุ เลขประจำตัวสอบ, ลำดับประกาศ, คะแนนคณิตศาสตร์, คะแนนวิทยาศาสตร์ หากหัวตารางไม่ตรง ระบบจะตรวจหาคอลัมน์เรียงตามลำดับข้อมูลให้อัตโนมัติ
          </div>
        </div>
      )}
    </div>
  );
}
