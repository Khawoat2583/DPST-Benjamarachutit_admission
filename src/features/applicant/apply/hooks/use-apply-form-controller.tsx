"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import {
  loginApplicant,
  registerApplicant,
  claimLegacyAccount,
  requestPasswordResetPin,
  resetPasswordWithPin,
  verifyResetPin,
  restoreApplicantSession,
  saveApplicationDraft,
  submitOrUpdateApplication,
  logoutApplicant,
} from "@/features/applicant/actions";
import {
  hydrateFromApplication,
  mergeWithLocalDraft,
  type ApplicationPayload,
} from "../lib/hydrate-application";
import {
  loadDraftFromStorage,
  saveDraftToStorage,
  clearDraftFromStorage,
  shouldPreferLocalDraft,
  loadEligibilityDraft,
  type ApplyDraftSnapshot,
} from "../lib/draft-storage";
import { buildApplicationSubmitPayload } from "../lib/submit-payload";
import { SCHOOL_LIST } from "@/features/applicant/schools";
import { isValidNationalId as validateNationalId } from "@/lib/national-id";
import { DEFAULT_COURSES } from "../constants";
import {
  buildFieldErrors,
  buildProgressPercent,
  buildStepValidities,
  computeClientGpas,
  createVisitedStepsUntil,
  getSemesterCompleteness as getSemesterCompletenessDerived,
  hasCourseCodeErrors as hasCourseCodeErrorsDerived,
  isGradesFormFilled as isGradesFormFilledDerived,
} from "../lib/form-derived";
import {
  getDistrictSuggestions,
  getSchoolSuggestions,
  getSubdistrictSuggestions,
  getUniqueContactProvinces,
  getUniqueSchoolProvinces,
  getZipcodeSuggestions,
} from "../lib/suggestions";
import type {
  PersonalForm,
  ContactAddressForm,
  SchoolForm,
  GradeRow,
  AttachmentsList,
  PreviewModalState,
  AddressDbRow,
  ClientGpas,
  UploadSlotKey,
} from "../types";
import { formStyles } from "../form-ui";

export function useApplyFormController() {
  const router = useRouter();

  const [sessionRestoring, setSessionRestoring] = useState(true);
  const [draftSaving, setDraftSaving] = useState(false);
  const [step, setStepState] = useState<number>(0);
  const [nationalIdInput, setNationalIdInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  // New authentication form states
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot" | "verify_pin" | "set_new_password" | "legacy">("login");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>("");
  const [emailInput, setEmailInput] = useState<string>("");
  const [firstNameInput, setFirstNameInput] = useState<string>("");
  const [lastNameInput, setLastNameInput] = useState<string>("");
  const [pinInput, setPinInput] = useState<string>("");

  const isSubmitted = useMemo(() => {
    return !!(applicationStatus && applicationStatus !== "draft");
  }, [applicationStatus]);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = useCallback(
    (field: string) => setTouched((prev) => ({ ...prev, [field]: true })),
    []
  );

  const [visitedSteps, setVisitedSteps] = useState<Record<number, boolean>>({ 1: true });
  const setStep: React.Dispatch<React.SetStateAction<number>> = useCallback((nextStep) => {
    setStepState((prevStep) => {
      const resolvedStep = typeof nextStep === "function" ? nextStep(prevStep) : nextStep;
      if (resolvedStep >= 1 && resolvedStep <= 6) {
        setVisitedSteps((prevVisited) => {
          if (prevVisited[resolvedStep]) return prevVisited;
          return { ...prevVisited, [resolvedStep]: true };
        });
      }
      return resolvedStep;
    });
  }, []);

  const [personal, setPersonal] = useState<PersonalForm>({
    title: "",
    firstName: "",
    lastName: "",
    announcementOrder: "",
  });

  const [contactAddress, setContactAddress] = useState<ContactAddressForm>({
    email: "",
    phone: "",
    guardianPhone: "",
    addressNo: "",
    addressMoo: "",
    addressSoi: "",
    addressRoad: "",
    addressSubdistrict: "",
    addressDistrict: "",
    addressProvince: "",
    addressZipcode: "",
  });

  const [school, setSchool] = useState<SchoolForm>({
    schoolName: "",
    schoolProvince: "",
  });

  const [gpaxInput, setGpaxInput] = useState<string>("");
  const [grades, setGrades] = useState<GradeRow[]>(DEFAULT_COURSES);

  const addGradeRow = useCallback((semesterNum: number) => {
    setGrades((prev) => [
      ...prev,
      {
        semester: semesterNum,
        courseCode: "",
        credit: "",
        grade: "",
        subjectGroup: "math",
        courseName: "",
      },
    ]);
  }, []);

  const removeGradeRow = useCallback((globalIdx: number) => {
    setGrades((prev) => prev.filter((_, idx) => idx !== globalIdx));
  }, []);

  const getSemesterCompletenessForStep = useCallback(
    (semNum: number) => getSemesterCompletenessDerived(grades, semNum),
    [grades]
  );

  const [attachmentsList, setAttachmentsList] = useState<AttachmentsList>({
    photo: null,
    transcriptFront: null,
    transcriptBack: null,
    idCard: null,
  });

  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [previewModal, setPreviewModal] = useState<PreviewModalState>(null);
  const [consentChecked, setConsentChecked] = useState<boolean>(false);

  const applyHydratedState = useCallback(
    (
      nationalId: string,
      app: ApplicationPayload | null,
      options?: { step?: number; consentChecked?: boolean }
    ) => {
      const server = hydrateFromApplication(app);
      const local = loadDraftFromStorage(nationalId);
      const preferLocal = shouldPreferLocalDraft(local, server.serverUpdatedAt);
      const merged = mergeWithLocalDraft(server, local, preferLocal);

      // Seed grades/GPAX from the public eligibility pre-check if the applicant
      // hasn't entered any grades yet, so they don't have to re-type them.
      let seededGrades = merged.grades;
      let seededGpax = merged.gpaxInput;
      if (!isGradesFormFilledDerived(merged.grades) && !merged.gpaxInput) {
        const elig = loadEligibilityDraft();
        if (elig) {
          if (Array.isArray(elig.grades) && isGradesFormFilledDerived(elig.grades)) {
            seededGrades = elig.grades;
          }
          if (elig.gpaxInput) seededGpax = elig.gpaxInput;
        }
      }

      setNationalIdInput(nationalId);
      setApplicationStatus(app?.status || null);
      setPersonal(merged.personal);
      setContactAddress(merged.contactAddress);
      setSchool(merged.school);
      setGpaxInput(seededGpax);
      setGrades(seededGrades);
      setAttachmentsList(merged.attachmentsList);
      setPreviewUrls(merged.previewUrls);
      setConsentChecked(options?.consentChecked ?? merged.consentChecked);
      const nextStep = options?.step ?? merged.step;
      setStep(nextStep);

      const isAppSubmitted = app?.status && app.status !== "draft";
      const maxVisited = isAppSubmitted ? 6 : nextStep;
      setVisitedSteps(createVisitedStepsUntil(maxVisited));

      saveDraftToStorage(nationalId, {
        step: nextStep,
        personal: merged.personal,
        contactAddress: merged.contactAddress,
        school: merged.school,
        gpaxInput: seededGpax,
        grades: seededGrades,
        consentChecked: options?.consentChecked ?? merged.consentChecked,
        savedAt: new Date().toISOString(),
      });
    },
    [setStep]
  );

  const buildDraftSnapshot = useCallback((): ApplyDraftSnapshot => {
    return {
      step,
      personal,
      contactAddress,
      school,
      gpaxInput,
      grades,
      consentChecked,
      savedAt: new Date().toISOString(),
    };
  }, [step, personal, contactAddress, school, gpaxInput, grades, consentChecked]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await restoreApplicantSession();
        if (cancelled) return;

        if (!res.success || !res.loggedIn) {
          setSessionRestoring(false);
          return;
        }

        if (res.isLocked) {
          router.replace(`/status?nationalId=${res.nationalId}`);
          return;
        }

        applyHydratedState(
          res.nationalId,
          (res.application as unknown as ApplicationPayload | null) ?? null
        );
      } catch {
        if (!cancelled) setErrorMsg("ไม่สามารถกู้คืนเซสชันได้ กรุณาเข้าสู่ระบบใหม่");
      } finally {
        if (!cancelled) setSessionRestoring(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, applyHydratedState]);

  useEffect(() => {
    if (sessionRestoring || step < 1 || !nationalIdInput) return;

    const snapshot = buildDraftSnapshot();
    saveDraftToStorage(nationalIdInput, snapshot);

    const timer = setTimeout(async () => {
      setDraftSaving(true);
      try {
        await saveApplicationDraft({
          step,
          personal,
          contactAddress,
          school,
          gpaxInput,
          grades,
        });
      } catch {
        // localStorage already has backup
      } finally {
        setDraftSaving(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    sessionRestoring,
    step,
    nationalIdInput,
    personal,
    contactAddress,
    school,
    gpaxInput,
    grades,
    consentChecked,
    buildDraftSnapshot,
  ]);

  const [addressDb, setAddressDb] = useState<AddressDbRow[]>([]);
  useEffect(() => {
    if (step === 2 && addressDb.length === 0) {
      fetch("/data/addresses.json")
        .then((res) => res.json())
        .then((data) => setAddressDb(data))
        .catch((err) => console.error("Error loading address database", err));
    }
  }, [step, addressDb]);

  const clientGpas = useMemo<ClientGpas>(
    () => computeClientGpas(grades, gpaxInput),
    [grades, gpaxInput]
  );

  const isGradesFormFilled = useMemo(
    () => isGradesFormFilledDerived(grades),
    [grades]
  );

  const hasCourseCodeErrors = useMemo(
    () => hasCourseCodeErrorsDerived(grades),
    [grades]
  );

  const isValidNationalId = useMemo(() => {
    return validateNationalId(nationalIdInput);
  }, [nationalIdInput]);

  const schoolSuggestions = useMemo(() => {
    return getSchoolSuggestions(SCHOOL_LIST, school.schoolName);
  }, [school.schoolName]);

  const uniqueProvinces = useMemo(() => {
    return getUniqueSchoolProvinces(SCHOOL_LIST);
  }, []);

  const subdistrictSuggestions = useMemo(() => {
    return getSubdistrictSuggestions(addressDb, contactAddress.addressSubdistrict);
  }, [contactAddress.addressSubdistrict, addressDb]);

  const districtSuggestions = useMemo(() => {
    return getDistrictSuggestions(addressDb, contactAddress.addressDistrict);
  }, [contactAddress.addressDistrict, addressDb]);

  const zipcodeSuggestions = useMemo(() => {
    return getZipcodeSuggestions(addressDb, contactAddress.addressZipcode);
  }, [contactAddress.addressZipcode, addressDb]);

  const uniqueContactProvinces = useMemo(() => {
    return getUniqueContactProvinces(addressDb);
  }, [addressDb]);

  const fieldErrors = useMemo(
    () => buildFieldErrors(personal, contactAddress, school, gpaxInput),
    [personal, contactAddress, school, gpaxInput]
  );

  const FieldError = useCallback(
    ({ name }: { name: string }) => {
      if (!touched[name] || !fieldErrors[name]) return null;
      return <p className={formStyles.fieldError}>{fieldErrors[name]}</p>;
    },
    [touched, fieldErrors]
  );

  const fieldBorder = useCallback(
    (name: string) =>
      touched[name] && fieldErrors[name] ? formStyles.fieldInputError : "",
    [touched, fieldErrors]
  );

  const stepValidities = useMemo(
    () =>
      buildStepValidities({
        personal,
        contactAddress,
        school,
        gpaxInput,
        isGradesFormFilled,
        hasCourseCodeErrors,
        isEligible: clientGpas.isEligible,
        attachments: attachmentsList,
      }),
    [
      personal,
      contactAddress,
      school,
      gpaxInput,
      isGradesFormFilled,
      hasCourseCodeErrors,
      clientGpas.isEligible,
      attachmentsList,
    ]
  );

  const progressPercent = useMemo(
    () => buildProgressPercent(visitedSteps, stepValidities),
    [visitedSteps, stepValidities]
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNationalId) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await loginApplicant(nationalIdInput, passwordInput);
      if (!res.success) {
        setErrorMsg(res.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        setLoading(false);
        return;
      }

      if (res.isLegacy) {
        setAuthMode("legacy");
        setLoading(false);
        return;
      }

      if (res.isLocked) {
        router.push(`/status?nationalId=${nationalIdInput}`);
        return;
      }

      applyHydratedState(
        nationalIdInput,
        (res.application as unknown as ApplicationPayload | null) ?? null,
        { step: 1, consentChecked: false }
      );
    } catch {
      setErrorMsg("ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNationalId) return;
    if (passwordInput.length < 8) {
      setErrorMsg("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setErrorMsg("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await registerApplicant({
        nationalId: nationalIdInput,
        email: emailInput,
        firstName: firstNameInput,
        lastName: lastNameInput,
        password: passwordInput,
      });

      if (!res.success) {
        setErrorMsg(res.error || "ลงทะเบียนไม่สำเร็จ");
        setLoading(false);
        return;
      }

      applyHydratedState(
        nationalIdInput,
        (res.application as unknown as ApplicationPayload | null) ?? null,
        { step: 1, consentChecked: false }
      );
    } catch {
      setErrorMsg("เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNationalId) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await requestPasswordResetPin(nationalIdInput, emailInput);
      if (!res.success) {
        setErrorMsg(res.error || "ส่งคำขอ PIN ไม่สำเร็จ");
        setLoading(false);
        return;
      }

      setSuccessMsg(res.message || "ส่งรหัส PIN ไปยังอีเมลของท่านแล้ว");
      setAuthMode("verify_pin");
    } catch {
      setErrorMsg("เกิดข้อผิดพลาดในการส่งรหัส PIN กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput || pinInput.length !== 6) {
      setErrorMsg("รหัส PIN ต้องมีความยาว 6 หลัก");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await verifyResetPin({
        nationalId: nationalIdInput,
        pin: pinInput,
      });

      if (!res.success) {
        setErrorMsg(res.error || "รหัส PIN ไม่ถูกต้อง");
        setLoading(false);
        return;
      }

      setAuthMode("set_new_password");
    } catch {
      setErrorMsg("เกิดข้อผิดพลาดในการยืนยันรหัส PIN กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.length < 8) {
      setErrorMsg("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setErrorMsg("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await resetPasswordWithPin({
        nationalId: nationalIdInput,
        pin: pinInput,
        password: passwordInput,
      });

      if (!res.success) {
        setErrorMsg(res.error || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
        setLoading(false);
        return;
      }

      setSuccessMsg("เปลี่ยนรหัสผ่านสำเร็จแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่");
      setPasswordInput("");
      setConfirmPasswordInput("");
      setPinInput("");
      setAuthMode("login");
    } catch {
      setErrorMsg("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimLegacy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.length < 8) {
      setErrorMsg("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setErrorMsg("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await claimLegacyAccount(nationalIdInput, passwordInput);
      if (!res.success) {
        setErrorMsg(res.error || "ตั้งรหัสผ่านไม่สำเร็จ");
        setLoading(false);
        return;
      }

      applyHydratedState(
        nationalIdInput,
        (res.application as unknown as ApplicationPayload | null) ?? null,
        { step: 1, consentChecked: false }
      );
    } catch {
      setErrorMsg("เกิดข้อผิดพลาดในการตั้งรหัสผ่าน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: UploadSlotKey
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    const docMap = {
      photo: "photo",
      transcriptFront: "transcript",
      transcriptBack: "transcript",
      idCard: "id_card",
    };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", docMap[type]);

    const oldAttach = attachmentsList[type];
    if (oldAttach) {
      formData.append("replaceId", oldAttach.id.toString());
    }

    setLoading(true);
    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await uploadRes.json();
      if (!uploadRes.ok) {
        alert(data.error || "เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
        return;
      }

      setAttachmentsList((prev) => ({
        ...prev,
        [type]: data.attachment,
      }));

      const previewUrl = URL.createObjectURL(file);
      setPreviewUrls((prev) => {
        if (prev[type] && prev[type].startsWith("blob:")) {
          URL.revokeObjectURL(prev[type]);
        }
        return { ...prev, [type]: previewUrl };
      });
    } catch {
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์อัปโหลดไฟล์ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!consentChecked) {
      alert("กรุณากดยอมรับและรับรองข้อมูลข้อตกลงก่อนส่งใบสมัคร");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload = buildApplicationSubmitPayload({
      nationalId: nationalIdInput,
      personal,
      contactAddress,
      school,
      gpaxInput,
      grades,
    });

    try {
      const res = await submitOrUpdateApplication(payload);
      if (!res.success) {
        setErrorMsg(res.error || "เกิดข้อผิดพลาดในการบันทึกใบสมัคร");
        setSubmitting(false);
        return;
      }

      clearDraftFromStorage(nationalIdInput);
      await logoutApplicant();
      router.push(`/status?nationalId=${nationalIdInput}`);
    } catch {
      setErrorMsg("ไม่สามารถส่งข้อมูลได้เนื่องจากเครือข่ายขัดข้อง กรุณาลองใหม่อีกครั้ง");
      setSubmitting(false);
    }
  };

  const goToStep = useCallback(
    (targetStep: number) => {
      if (targetStep < 1 || targetStep > 6) return;

      // Mark current step fields as touched when navigating away
      setTouched((prev) => {
        const nextTouched = { ...prev };
        if (step === 1) {
          nextTouched.title = true;
          nextTouched.firstName = true;
          nextTouched.lastName = true;
          nextTouched.announcementOrder = true;
        } else if (step === 2) {
          nextTouched.phone = true;
          nextTouched.guardianPhone = true;
          nextTouched.email = true;
          nextTouched.addressNo = true;
          nextTouched.addressSubdistrict = true;
          nextTouched.addressDistrict = true;
          nextTouched.addressProvince = true;
          nextTouched.addressZipcode = true;
        } else if (step === 3) {
          nextTouched.schoolName = true;
          nextTouched.schoolProvince = true;
          nextTouched.gpax = true;
        }
        return nextTouched;
      });

      setStep(targetStep);
    },
    [step, setStep]
  );

  const nextStep = useCallback(() => {
    goToStep(step + 1);
  }, [goToStep, step]);

  const prevStep = useCallback(() => {
    goToStep(step - 1);
  }, [goToStep, step]);

  const handleLogout = async () => {
    const id = nationalIdInput;
    clearDraftFromStorage(id);
    await logoutApplicant();
    setStep(0);
    setNationalIdInput("");
    setApplicationStatus(null);
    setPersonal({ title: "", firstName: "", lastName: "", announcementOrder: "" });
    setContactAddress({
      email: "",
      phone: "",
      guardianPhone: "",
      addressNo: "",
      addressMoo: "",
      addressSoi: "",
      addressRoad: "",
      addressSubdistrict: "",
      addressDistrict: "",
      addressProvince: "",
      addressZipcode: "",
    });
    setSchool({ schoolName: "", schoolProvince: "" });
    setGpaxInput("");
    setGrades(DEFAULT_COURSES);
    setAttachmentsList({ photo: null, transcriptFront: null, transcriptBack: null, idCard: null });
    Object.values(previewUrls).forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });
    setPreviewUrls({});
    setPreviewModal(null);
    setConsentChecked(false);
    setVisitedSteps({ 1: true });
    setTouched({});
    setAuthMode("login");
    setPasswordInput("");
    setConfirmPasswordInput("");
    setEmailInput("");
    setFirstNameInput("");
    setLastNameInput("");
    setPinInput("");
    setSuccessMsg(null);
  };

  return {
    sessionRestoring,
    draftSaving,
    step,
    setStep,
    nationalIdInput,
    setNationalIdInput,
    loading,
    submitting,
    errorMsg,
    setErrorMsg,
    successMsg,
    setSuccessMsg,
    touched,
    markTouched,
    personal,
    setPersonal,
    contactAddress,
    setContactAddress,
    school,
    setSchool,
    gpaxInput,
    setGpaxInput,
    grades,
    setGrades,
    addGradeRow,
    removeGradeRow,
    getSemesterCompleteness: getSemesterCompletenessForStep,
    attachmentsList,
    setAttachmentsList,
    previewUrls,
    setPreviewUrls,
    previewModal,
    setPreviewModal,
    consentChecked,
    setConsentChecked,
    addressDb,
    clientGpas,
    isGradesFormFilled,
    hasCourseCodeErrors,
    isValidNationalId,
    schoolSuggestions,
    uniqueProvinces,
    subdistrictSuggestions,
    districtSuggestions,
    zipcodeSuggestions,
    uniqueContactProvinces,
    fieldErrors,
    FieldError,
    fieldBorder,
    handleLogin,
    handleRegister,
    handleRequestResetPin,
    handleVerifyPin,
    handleResetPassword,
    handleClaimLegacy,
    handleFileUpload,
    handleFinalSubmit,
    nextStep,
    prevStep,
    handleLogout,
    visitedSteps,
    stepValidities,
    goToStep,
    applicationStatus,
    isSubmitted,
    progressPercent,
    authMode,
    setAuthMode,
    passwordInput,
    setPasswordInput,
    confirmPasswordInput,
    setConfirmPasswordInput,
    emailInput,
    setEmailInput,
    firstNameInput,
    setFirstNameInput,
    lastNameInput,
    setLastNameInput,
    pinInput,
    setPinInput,
  };
}
