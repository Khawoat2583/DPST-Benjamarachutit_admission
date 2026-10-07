import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Application, Grade } from "../types";
import {
  updateApplicationGradesAction,
  approveApplicationAction,
  rejectApplicationAction,
} from "../actions";

export function useReviewCanvasController(application: Application) {
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

  return {
    isReadOnly,
    grades,
    isChanged,
    isRejectModalOpen,
    setIsRejectModalOpen,
    rejectReason,
    setRejectReason,
    isSaving,
    isApproving,
    isRejecting,
    actionError,
    actionSuccess,
    setActionError,
    setActionSuccess,
    liveAverages,
    semesterGrades,
    handleGradeChange,
    handleSaveGrades,
    handleApprove,
    handleReject,
  };
}
