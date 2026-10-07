"use client";

import { useMemo, useRef, useState } from "react";
import {
  commitExcelScoresAction,
  parseExcelScoresAction,
  type PreflightResult,
} from "@/features/exam-import/actions";
import { arrayBufferToBase64 } from "@/features/exam-import/lib/file-base64";

type DragEvent = React.DragEvent;
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

function readErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function downloadTemplateCsv(): void {
  const headers = ["เลขประจำตัวสอบ", "ลำดับประกาศ", "คะแนนคณิตศาสตร์", "คะแนนวิทยาศาสตร์"];
  const rows = [
    ["EX69001", "1", "85.50", "78.00"],
    ["EX69002", "2", "74.00", "88.50"],
    ["EX69003", "3", "92.00", "91.00"],
  ];

  const csvContent = `\uFEFF${[headers.join(","), ...rows.map((row) => row.join(","))].join("\n")}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "dpst_exam_scores_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export type ExcelImportController = {
  file: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isDragActive: boolean;
  isParsing: boolean;
  isCommitting: boolean;
  parseResult: PreflightResult | null;
  errorMsg: string | null;
  successMsg: string | null;
  filterMismatchOnly: boolean;
  setFilterMismatchOnly: (value: boolean) => void;
  displayedRows: PreflightResult["rows"];
  handleDrag: (event: DragEvent) => void;
  handleDrop: (event: DragEvent) => void;
  handleFileInputChange: (event: InputChangeEvent) => void;
  handleCommitScores: () => Promise<void>;
  resetSelectedFile: () => void;
  downloadTemplate: () => void;
};

export function useExcelImportController(): ExcelImportController {
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [parseResult, setParseResult] = useState<PreflightResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [filterMismatchOnly, setFilterMismatchOnly] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (selectedFile: File): Promise<void> => {
    if (!selectedFile.name.endsWith(".xlsx")) {
      setErrorMsg("กรุณาเลือกไฟล์ Excel นามสกุล .xlsx เท่านั้น");
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setParseResult(null);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const base64 = arrayBufferToBase64(buffer);
      const result = await parseExcelScoresAction(base64);

      if (result.success) {
        setParseResult(result);
      } else {
        setErrorMsg(result.error || "เกิดข้อผิดพลาดในการวิเคราะห์ไฟล์");
        if (result.isEncrypted) {
          console.warn("Excel is password-protected.");
        }
      }
    } catch (error: unknown) {
      console.error(error);
      setErrorMsg(readErrorMessage(error, "เกิดข้อผิดพลาดในการประมวลผลไฟล์"));
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrag = (event: DragEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === "dragenter" || event.type === "dragover") {
      setIsDragActive(true);
      return;
    }

    if (event.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (event: DragEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);

    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      void processFile(droppedFile);
    }
  };

  const handleFileInputChange = (event: InputChangeEvent): void => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      void processFile(selectedFile);
    }
  };

  const handleCommitScores = async (): Promise<void> => {
    if (!parseResult || parseResult.rows.length === 0) {
      return;
    }

    setIsCommitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const scoresToCommit = parseResult.rows.map((row) => ({
        examId: row.examId,
        announcementOrder: row.announcementOrder,
        mathScore: row.mathScore,
        scienceScore: row.scienceScore,
      }));

      const result = await commitExcelScoresAction(scoresToCommit);
      if (!result.success) {
        setErrorMsg(result.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูลเข้าเซิร์ฟเวอร์");
        return;
      }

      setSuccessMsg(`นำเข้าข้อมูลคะแนนสอบรอบแรก พสวท. สำเร็จทั้งหมด ${result.count} รายการแล้ว!`);
      setParseResult(null);
      setFile(null);
      setFilterMismatchOnly(false);
    } finally {
      setIsCommitting(false);
    }
  };

  const resetSelectedFile = (): void => {
    setParseResult(null);
    setFile(null);
    setFilterMismatchOnly(false);
    setErrorMsg(null);
  };

  const displayedRows = useMemo(() => {
    if (!parseResult) {
      return [];
    }

    return parseResult.rows.filter((row) => !filterMismatchOnly || row.status === "mismatch");
  }, [filterMismatchOnly, parseResult]);

  return {
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
    downloadTemplate: downloadTemplateCsv,
  };
}
