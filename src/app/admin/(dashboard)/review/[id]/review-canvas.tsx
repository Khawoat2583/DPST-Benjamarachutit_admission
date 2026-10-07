"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  updateApplicationGradesAction,
  approveApplicationAction,
  rejectApplicationAction
} from "@/features/admin-review/actions";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  AlertTriangle,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Image as ImageIcon,
  FileText,
  BadgeAlert,
  Loader2,
  Check,
  X
} from "lucide-react";

interface Grade {
  id: number;
  subjectGroup: "math" | "science" | "english";
  semester: number;
  courseCode: string;
  courseName: string;
  credit: string;
  grade: string;
}

interface Attachment {
  id: number;
  documentType: "photo" | "transcript" | "id_card";
  originalName: string;
  storedName: string;
  mimeType: string;
  fileSize: number;
}

interface Application {
  id: number;
  status: string;
  nationalId: string;
  title: string | null;
  firstName: string;
  lastName: string;
  announcementOrder: number;
  email: string | null;
  phone: string | null;
  guardianPhone: string | null;
  addressNo: string | null;
  addressMoo: string | null;
  addressSoi: string | null;
  addressRoad: string | null;
  addressSubdistrict: string | null;
  addressDistrict: string | null;
  addressProvince: string | null;
  addressZipcode: string | null;
  schoolName: string | null;
  schoolProvince: string | null;
  gpax: string | null;
  mathGpa: string | null;
  scienceGpa: string | null;
  englishGpa: string | null;
  rejectionReason: string | null;
  grades: Grade[];
  attachments: Attachment[];
}

interface ReviewCanvasProps {
  application: Application;
}

export default function ReviewCanvas({ application }: ReviewCanvasProps) {
  const router = useRouter();

  // Check if application is read-only (status is ranked or exported)
  const isReadOnly = application.status === "ranked" || application.status === "exported";

  // 1. Dynamic state for course grades
  const [grades, setGrades] = useState<Grade[]>(application.grades);

  // Check if there are any edits made to grades compared to original application
  const isChanged = useMemo(() => {
    return grades.some((g) => {
      const orig = application.grades.find((o) => o.id === g.id);
      if (!orig) return false;
      return (
        g.courseCode !== orig.courseCode ||
        g.courseName !== orig.courseName ||
        g.credit !== orig.credit ||
        g.grade !== orig.grade
      );
    });
  }, [grades, application.grades]);

  // 2. State for Reject workflow
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState(application.rejectionReason || "");

  // 3. UI states for Actions
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // 4. Image Viewer state
  const [activeDocType, setActiveDocType] = useState<"transcript" | "photo" | "id_card">("transcript");
  const [zoom, setZoom] = useState(1);
  const [rotations, setRotations] = useState<Record<number, number>>({}); // rotation degrees by attachment ID

  // Compute live averages on the client side whenever grades change
  const liveAverages = useMemo(() => {
    let mathSum = 0;
    let mathCredits = 0;
    let sciSum = 0;
    let sciCredits = 0;
    let engSum = 0;
    let engCredits = 0;
    let totalSum = 0;
    let totalCredits = 0;

    grades.forEach((g) => {
      const crVal = parseFloat(g.credit);
      const grVal = parseFloat(g.grade);

      if (!isNaN(crVal) && !isNaN(grVal)) {
        if (g.subjectGroup === "math") {
          mathSum += grVal * crVal;
          mathCredits += crVal;
        } else if (g.subjectGroup === "science") {
          sciSum += grVal * crVal;
          sciCredits += crVal;
        } else if (g.subjectGroup === "english") {
          engSum += grVal * crVal;
          engCredits += crVal;
        }
        totalSum += grVal * crVal;
        totalCredits += crVal;
      }
    });

    return {
      gpax: totalCredits > 0 ? (totalSum / totalCredits).toFixed(2) : "0.00",
      mathGpa: mathCredits > 0 ? (mathSum / mathCredits).toFixed(2) : "0.00",
      scienceGpa: sciCredits > 0 ? (sciSum / sciCredits).toFixed(2) : "0.00",
      englishGpa: engCredits > 0 ? (engSum / engCredits).toFixed(2) : "0.00",
    };
  }, [grades]);

  // Handle live inputs edit
  const handleGradeChange = (id: number, field: keyof Grade, value: string) => {
    setGrades((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          return { ...g, [field]: value };
        }
        return g;
      })
    );
  };

  // Group grades by Semester for beautiful listing
  const semesterGrades = useMemo(() => {
    const semesters: Record<number, Grade[]> = {};
    grades.forEach((g) => {
      if (!semesters[g.semester]) {
        semesters[g.semester] = [];
      }
      semesters[g.semester].push(g);
    });
    // Sort courses in each semester by ID or subject
    Object.keys(semesters).forEach((sem) => {
      semesters[Number(sem)].sort((a, b) => a.id - b.id);
    });
    return semesters;
  }, [grades]);

  // Save modified grades action
  const handleSaveGrades = async () => {
    setIsSaving(true);
    setActionError(null);
    setActionSuccess(null);

    const edits = grades.map((g) => ({
      id: g.id,
      credit: g.credit,
      grade: g.grade,
      courseCode: g.courseCode,
      courseName: g.courseName,
    }));

    const result = await updateApplicationGradesAction(application.id, edits, liveAverages);

    setIsSaving(false);
    if (result.success) {
      setActionSuccess("บันทึกข้อมูลผลการเรียนที่แก้ไขเรียบร้อยแล้ว!");
      router.refresh();
    } else {
      setActionError(result.error || "ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  // Approve action
  const handleApprove = async () => {
    if (!confirm("คุณยืนยันที่จะอนุมัติเอกสารและผลการเรียนของผู้สมัครรายนี้ใช่หรือไม่?")) {
      return;
    }

    setIsApproving(true);
    setActionError(null);
    setActionSuccess(null);

    const result = await approveApplicationAction(application.id);

    setIsApproving(false);
    if (result.success) {
      setActionSuccess("อนุมัติใบสมัครนี้ผ่านเกณฑ์สำเร็จ!");
      router.refresh();
    } else {
      setActionError(result.error || "เกิดข้อผิดพลาดในการอนุมัติ");
    }
  };

  // Reject action
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("กรุณากรอกเหตุผลระบุข้อผิดพลาดเพื่อให้ผู้สมัครแก้ไข");
      return;
    }

    setIsRejecting(true);
    setActionError(null);
    setActionSuccess(null);

    const result = await rejectApplicationAction(application.id, rejectReason);

    setIsRejecting(false);
    setIsRejectModalOpen(false);
    if (result.success) {
      setActionSuccess("ส่งกลับใบสมัครเพื่อให้แก้ไขข้อมูลเรียบร้อยแล้ว");
      router.refresh();
    } else {
      setActionError(result.error || "เกิดข้อผิดพลาดในการส่งกลับ");
    }
  };

  // Document attachments filtered by selected doc tab
  const filteredAttachments = useMemo(() => {
    return application.attachments.filter((a) => a.documentType === activeDocType);
  }, [application.attachments, activeDocType]);

  // Rotate handler
  const handleRotate = (id: number) => {
    setRotations((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 90,
    }));
  };

  // Subject group localized names & styles
  const getSubjectStyle = (group: string) => {
    switch (group) {
      case "math":
        return "bg-indigo-50/70 border-indigo-200/50 dark:bg-indigo-950/20 dark:border-indigo-900/30 text-indigo-900 dark:text-indigo-200";
      case "science":
        return "bg-purple-50/70 border-purple-200/50 dark:bg-purple-950/20 dark:border-purple-900/30 text-purple-900 dark:text-purple-200";
      case "english":
        return "bg-sky-50/70 border-sky-200/50 dark:bg-sky-950/20 dark:border-sky-900/30 text-sky-900 dark:text-sky-200";
      default:
        return "bg-slate-50 border-slate-200 dark:bg-zinc-800 dark:border-zinc-700 text-slate-800 dark:text-zinc-200";
    }
  };

  const getSubjectText = (group: string) => {
    switch (group) {
      case "math":
        return "คณิตศาสตร์";
      case "science":
        return "วิทยาศาสตร์";
      case "english":
        return "ภาษาอังกฤษ";
      default:
        return group;
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-slate-50 dark:bg-zinc-950">
      {/* Upper floating toolbar */}
      {/* Upper floating toolbar */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 z-20 shrink-0">
        {/* Left Side: Back button & Applicant metadata */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/review")}
            className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-xl transition-all"
            title="กลับไปหน้ารายชื่อ"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-md sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              {application.firstName} {application.lastName}
              <span className="text-xs font-bold text-slate-400 font-mono">
                (ลำดับประกาศ: {application.announcementOrder})
              </span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 font-mono">
              เลขบัตรประชาชน: {application.nationalId} • โรงเรียนเดิม: {application.schoolName} ({application.schoolProvince})
            </p>
          </div>
        </div>

        {/* Center: Document selector tabs (Segmented Control style) */}
        <div className="flex gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200/50 dark:border-zinc-700/50">
          <button
            onClick={() => {
              setActiveDocType("transcript");
              setZoom(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none ${
              activeDocType === "transcript"
                ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-black/5"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>ปพ.1 (Transcript)</span>
          </button>

          <button
            onClick={() => {
              setActiveDocType("photo");
              setZoom(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none ${
              activeDocType === "photo"
                ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-black/5"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>รูปถ่ายนักเรียน</span>
          </button>

          <button
            onClick={() => {
              setActiveDocType("id_card");
              setZoom(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none ${
              activeDocType === "id_card"
                ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-black/5"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>บัตรประชาชน</span>
          </button>
        </div>

        {/* Right Side: Global Zoom, Status bubble, & Notification Banner */}
        <div className="flex items-center gap-3.5 flex-wrap">
          {/* Global zoom toolbar */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 border border-slate-200/50 dark:border-zinc-700/50 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
              title="ซูมออก"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold px-2 w-10 text-center font-mono">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
              title="ซูมเข้า"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer border-l border-slate-200/50 dark:border-zinc-700/50 pl-2 ml-1"
              title="รีเซ็ตค่าซูม"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Global Notification Banner */}
          {(actionSuccess || actionError) && (
            <div
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300 ${
                actionSuccess
                  ? "bg-emerald-50 border border-emerald-500/20 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300"
                  : "bg-rose-50 border border-rose-500/20 text-rose-700 dark:bg-rose-950/20 dark:text-rose-300"
              }`}
            >
              {actionSuccess ? <CheckCircle className="h-4 w-4" /> : <BadgeAlert className="h-4 w-4" />}
              <span>{actionSuccess || actionError}</span>
            </div>
          )}

          {/* Status bubble */}
          <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
            <span className="text-slate-400">สถานะขณะนี้:</span>
            {application.status === "submitted" && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 rounded-lg border border-amber-100 dark:border-amber-900/30">
                รอดำเนินการ (Submitted)
              </span>
            )}
            {application.status === "approved" && (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                อนุมัติแล้ว (Approved)
              </span>
            )}
            {application.status === "rejected" && (
              <span className="px-2.5 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 rounded-lg border border-rose-100 dark:border-rose-900/30">
                ส่งกลับแก้ไข (Rejected)
              </span>
            )}
            {application.status === "draft" && (
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 rounded-lg border border-slate-200 dark:border-zinc-700">
                แบบร่าง (Draft)
              </span>
            )}
            {application.status === "ranked" && (
              <span className="px-2.5 py-1 bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 rounded-lg border border-purple-100 dark:border-purple-900/30 font-bold animate-pulse">
                จัดอันดับแล้ว (Ranked)
              </span>
            )}
            {application.status === "exported" && (
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-900/30 font-bold">
                ส่งออกแล้ว (Exported)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main split canvas */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full">
        {/* Left Side: scrollable forms and edit grades */}
        <div className="w-full md:w-1/2 overflow-y-auto p-6 space-y-6 border-r border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20">
          {/* Top Live computed preview average banner */}
          <div className="bg-linear-to-tr from-indigo-600 to-indigo-700 dark:bg-indigo-950/40 border border-indigo-500/20 rounded-3xl p-5 text-white dark:text-indigo-200 shadow-md">
            <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-3">
              ผลการเรียนคำนวณสดแบบเรียลไทม์ (Live Previews)
            </h3>
            <div className="grid grid-cols-4 gap-2.5 text-center">
              <div className="bg-white/10 dark:bg-zinc-900/40 p-2.5 rounded-2xl">
                <p className="text-[10px] text-indigo-200">GPAX 5 เทอม</p>
                <p className="text-lg font-black text-white">{liveAverages.gpax}</p>
              </div>
              <div className="bg-white/10 dark:bg-zinc-900/40 p-2.5 rounded-2xl">
                <p className="text-[10px] text-indigo-200">เฉลี่ยคณิต</p>
                <p className="text-lg font-black text-white">{liveAverages.mathGpa}</p>
              </div>
              <div className="bg-white/10 dark:bg-zinc-900/40 p-2.5 rounded-2xl">
                <p className="text-[10px] text-indigo-200">เฉลี่ยวิทย์</p>
                <p className="text-lg font-black text-white">{liveAverages.scienceGpa}</p>
              </div>
              <div className="bg-white/10 dark:bg-zinc-900/40 p-2.5 rounded-2xl">
                <p className="text-[10px] text-indigo-200">เฉลี่ยอังกฤษ</p>
                <p className="text-lg font-black text-white">{liveAverages.englishGpa}</p>
              </div>
            </div>
            {application.rejectionReason && (
              <div className="mt-4 p-3 bg-rose-950/50 border border-rose-500/25 rounded-2xl flex items-start gap-2 text-xs text-rose-200">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">เหตุผลการตีกลับเดิม:</span> {application.rejectionReason}
                </div>
              </div>
            )}
          </div>

          {/* Grades Editor by Semesters */}
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-300 uppercase tracking-wider pl-1">
              ตารางป้อนตรวจสอบรายวิชาหลัก (Course Grades Editor)
            </h2>

            {Object.keys(semesterGrades).map((semStr) => {
              const sem = Number(semStr);
              return (
                <div
                  key={sem}
                  className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4"
                >
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800 pb-2">
                    ภาคการศึกษา ม.{Math.ceil(sem / 2)} เทอม {sem % 2 === 0 ? 2 : 1} (Semester {sem})
                  </h3>

                  <div className="space-y-3.5">
                    {semesterGrades[sem].map((course) => (
                      <div
                        key={course.id}
                        className={`p-3 border rounded-2xl grid sm:grid-cols-12 gap-3.5 items-center ${getSubjectStyle(
                          course.subjectGroup
                        )}`}
                      >
                        {/* Subject type badge */}
                        <div className="sm:col-span-2 text-[10px] font-bold uppercase pl-1 shrink-0">
                          {getSubjectText(course.subjectGroup)}
                        </div>

                        {/* Code */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] text-slate-400 font-semibold block sm:hidden">
                            รหัสวิชา
                          </label>
                          <input
                            type="text"
                            value={course.courseCode}
                            disabled={isReadOnly}
                            onChange={(e) => handleGradeChange(course.id, "courseCode", e.target.value)}
                            className="w-full px-2 py-1 bg-white/70 dark:bg-zinc-950/30 border border-white/20 dark:border-zinc-800 rounded-lg text-xs font-bold font-mono focus:outline-hidden disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100/50 dark:disabled:bg-zinc-800/20"
                          />
                        </div>

                        {/* Name */}
                        <div className="sm:col-span-4 space-y-1">
                          <label className="text-[10px] text-slate-400 font-semibold block sm:hidden">
                            ชื่อวิชา
                          </label>
                          <input
                            type="text"
                            value={course.courseName}
                            disabled={isReadOnly}
                            onChange={(e) => handleGradeChange(course.id, "courseName", e.target.value)}
                            className="w-full px-2 py-1 bg-white/70 dark:bg-zinc-950/30 border border-white/20 dark:border-zinc-800 rounded-lg text-xs font-medium focus:outline-hidden disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100/50 dark:disabled:bg-zinc-800/20"
                          />
                        </div>

                        {/* Credit */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] text-slate-400 font-semibold block sm:hidden">
                            หน่วยกิต
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="5.0"
                            value={course.credit}
                            disabled={isReadOnly}
                            onChange={(e) => handleGradeChange(course.id, "credit", e.target.value)}
                            className="w-full px-2 py-1 bg-white/75 dark:bg-zinc-950/40 border border-white/20 dark:border-zinc-800 rounded-lg text-xs font-black text-center font-mono focus:outline-hidden disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100/50 dark:disabled:bg-zinc-800/20"
                          />
                        </div>

                        {/* Grade */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] text-slate-400 font-semibold block sm:hidden">
                            เกรด
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.00"
                            max="4.00"
                            value={course.grade}
                            disabled={isReadOnly}
                            onChange={(e) => handleGradeChange(course.id, "grade", e.target.value)}
                            className="w-full px-2 py-1 bg-white/75 dark:bg-zinc-950/40 border border-white/20 dark:border-zinc-800 rounded-lg text-xs font-black text-center font-mono focus:outline-hidden text-indigo-600 dark:text-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100/50 dark:disabled:bg-zinc-800/20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Control Drawer Panel */}
          {!isReadOnly && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-300">
                แผงควบคุมสถานะและส่งข้อมูล (Verification Actions)
              </h3>
              <p className="text-xs text-slate-500">
                กรุณากด &quot;บันทึกคะแนนเกรด&quot; หากมีการแก้ไขข้อมูล ก่อนอนุมัติใบสมัครเข้าสู่ระบบคัดเลือก
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Save changes */}
                <button
                  onClick={handleSaveGrades}
                  disabled={!isChanged || isSaving || isApproving || isRejecting}
                  className={`flex-1 py-3 px-4 font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 ${
                    !isChanged
                      ? "bg-slate-100/50 dark:bg-zinc-800/40 text-slate-400 dark:text-zinc-500 cursor-not-allowed opacity-50"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 cursor-pointer"
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 text-slate-500" />
                  )}
                  <span>บันทึกคะแนนเกรด</span>
                </button>

                {/* Approve applicant */}
                {application.status !== "approved" && (
                  <button
                    onClick={handleApprove}
                    disabled={isSaving || isApproving || isRejecting}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20"
                  >
                    {isApproving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span>อนุมัติใบสมัคร</span>
                  </button>
                )}

                {/* Reject button */}
                {application.status !== "rejected" && (
                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={isSaving || isApproving || isRejecting}
                    className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-rose-950/20"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>ตีกลับเพื่อให้แก้ไข</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: scrollable transcript viewer and image controls */}
        <div className="w-full md:w-1/2 flex flex-col overflow-hidden bg-slate-900 border-l border-slate-950">
          {/* Secure Document Canvas Image container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 flex flex-col justify-start items-center bg-slate-950/40 relative">
            {filteredAttachments.length > 0 ? (
              filteredAttachments.map((attachment, idx) => {
                const rotation = rotations[attachment.id] || 0;
                return (
                  <div
                    key={attachment.id}
                    className="w-full max-w-lg bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative group"
                  >
                    {/* Document metadata label & actions */}
                    <div className="bg-slate-950 px-4 py-2 border-b border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                      <span className="truncate max-w-[200px]" title={attachment.originalName}>
                        {attachment.originalName} ({Math.round(attachment.fileSize / 1024)} KB)
                      </span>
                      <div className="flex items-center gap-3">
                        <span>หน้า {idx + 1}</span>
                        <button
                          onClick={() => handleRotate(attachment.id)}
                          className="flex items-center gap-1.5 p-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer font-bold"
                        >
                          <RotateCw className="h-3 w-3" />
                          <span>หมุน 90°</span>
                        </button>
                      </div>
                    </div>

                    {/* Image rendering with CSS hardware-accelerated transform */}
                    <div className="flex items-center justify-center p-4 bg-slate-950/20 overflow-hidden">
                      <img
                        src={`/api/upload/${attachment.storedName}`}
                        alt={attachment.originalName}
                        style={{
                          transform: `scale(${zoom}) rotate(${rotation}deg)`,
                          transformOrigin: "center center",
                        }}
                        className="max-w-full h-auto object-contain transition-transform duration-200 select-none pointer-events-none rounded-xl"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 py-16">
                <ImageIcon className="h-10 w-10 text-slate-700 mb-3" />
                <p className="text-sm font-semibold">ไม่มีภาพหลักฐานประเภทนี้อัปโหลดในระบบ</p>
                <p className="text-xs text-slate-600 mt-1">ผู้สมัครไม่ได้ยื่นเอกสารส่วนนี้แนบเข้ามา</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Reason input dialog modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-40 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-800 dark:text-zinc-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                ตีกลับเพื่อให้ผู้สมัครแก้ไขข้อมูล
              </h3>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">
                รายละเอียดเหตุผลข้อผิดพลาด (Rejection Reason)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="ระบุข้อผิดพลาด เช่น 'เกรดม.1 เทอม 1 วิทยาศาสตร์กรอกผิด ในใบสมัครกรอก 3.50 แต่ในใบปพ.1 แสดง 3.00 กรุณาแก้ไข', 'รูปถ่ายปพ.1 ด้านหลังไม่ชัดเจน'"
                rows={5}
                required
                className="w-full p-3 bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 placeholder-slate-400 resize-none font-semibold leading-relaxed"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isRejecting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                <span>ยืนยันตีกลับเพื่อแก้ไข</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
