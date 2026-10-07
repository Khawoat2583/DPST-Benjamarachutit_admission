"use client";

import { useExcelImportController } from "@/features/exam-import/hooks/use-excel-import-controller";
import { FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import DashboardWrapper from "@/app/admin/(dashboard)/dashboard-wrapper";
import { UploadDropzone } from "./upload-dropzone";
import { TemplateGuide } from "./template-guide";
import { PreflightSummary } from "./preflight-summary";
import { PreflightTable } from "./preflight-table";
import { CommitFooter } from "./commit-footer";

export default function ExcelImportClient() {
  const {
    file,
    fileInputRef,
    isDragActive,
    isParsing,
    isCommitting,
    parseResult,
    errorMsg,
    successMsg,
    filterMismatchOnly,
    setFilterMismatchOnly,
    displayedRows,
    handleDrag,
    handleDrop,
    handleFileInputChange,
    handleCommitScores,
    resetSelectedFile,
    downloadTemplate,
  } = useExcelImportController();

  return (
    <DashboardWrapper
      title="นำเข้าคะแนนสอบรอบแรก พสวท."
      subtitle="อัปโหลดไฟล์สเปรดชีต Excel ผลคะแนนสอบคัดเลือกรอบแรก เพื่อบันทึกเข้าระบบสำหรับนำมาใช้จัดอันดับประมวลผล"
      icon={FileSpreadsheet}
    >

      {/* Global Toast Banners */}
      {errorMsg && (
        <div className="flex items-start gap-3 bg-rose-50 border border-l-4 border-rose-200 border-l-rose-500 dark:bg-rose-950/20 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 p-4 animate-in shake duration-300">
          <AlertCircle className="h-5.5 w-5.5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold">เกิดข้อขัดข้องในการตรวจสอบ</p>
            <p className="text-xs font-semibold mt-1 leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-3 bg-emerald-50 border border-l-4 border-emerald-200 border-l-emerald-500 dark:bg-emerald-950/20 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-4 animate-in fade-in duration-300">
          <CheckCircle className="h-5.5 w-5.5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold">ดำเนินการนำเข้าข้อมูลเสร็จสิ้น</p>
            <p className="text-xs font-semibold mt-1 leading-relaxed">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Drag & Drop Zone Card */}
      {!parseResult && (
        <>
          <UploadDropzone
            isDragActive={isDragActive}
            isParsing={isParsing}
            fileInputRef={fileInputRef}
            handleDrag={handleDrag}
            handleDrop={handleDrop}
            handleFileInputChange={handleFileInputChange}
          />
          <TemplateGuide downloadTemplate={downloadTemplate} />
        </>
      )}

      {/* Preflight Summary Table Canvas */}
      {parseResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <PreflightSummary
            fileName={file?.name || ""}
            fileSize={file?.size || 0}
            resetSelectedFile={resetSelectedFile}
            totalRows={parseResult.totalRows}
            matchedCount={parseResult.matchedCount}
            mismatchCount={parseResult.mismatchCount}
          />

          <PreflightTable
            displayedRows={displayedRows}
            mismatchCount={parseResult.mismatchCount}
            filterMismatchOnly={filterMismatchOnly}
            setFilterMismatchOnly={setFilterMismatchOnly}
          />

          <CommitFooter
            isCommitting={isCommitting}
            handleCommitScores={handleCommitScores}
          />
        </div>
      )}
    </DashboardWrapper>
  );
}
