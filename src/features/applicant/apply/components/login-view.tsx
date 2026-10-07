"use client";

import Link from "next/link";
import {
  Check,
  AlertTriangle,
  ArrowRight,
  Loader2,
  AlertCircle,
  Lock,
  Mail,
  KeyRound,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApplyForm } from "../apply-form-context";
import { formStyles, layoutStyles } from "../form-ui";
import { cn } from "@/lib/utils";

export function LoginView() {
  const {
    nationalIdInput,
    setNationalIdInput,
    isValidNationalId,
    errorMsg,
    setErrorMsg,
    successMsg,
    setSuccessMsg,
    loading,
    authMode,
    setAuthMode,
    passwordInput,
    setPasswordInput,
    confirmPasswordInput,
    setConfirmPasswordInput,
    emailInput,
    setEmailInput,
    pinInput,
    setPinInput,
    handleLogin,
    handleRegister,
    handleRequestResetPin,
    handleVerifyPin,
    handleResetPassword,
    handleClaimLegacy,
  } = useApplyForm();

  // Clear messages on transition
  const switchMode = (mode: typeof authMode) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setPasswordInput("");
    setConfirmPasswordInput("");
    setPinInput("");
    setAuthMode(mode);
  };

  const getFormTitle = () => {
    switch (authMode) {
      case "register":
        return "ลงทะเบียนสมัครใหม่";
      case "forgot":
        return "ลืมรหัสผ่าน";
      case "verify_pin":
        return "ยืนยันรหัส PIN";
      case "set_new_password":
        return "ตั้งรหัสผ่านใหม่";
      case "legacy":
        return "ตั้งรหัสผ่านเพื่อเปิดใช้งานบัญชี";
      case "login":
      default:
        return "สมัครออนไลน์โครงการ พสวท.";
    }
  };

  const getFormDescription = () => {
    switch (authMode) {
      case "register":
        return "กรอกข้อมูลของท่านเพื่อลงทะเบียนสมัครและสร้างใบสมัครฉบับร่าง";
      case "forgot":
        return "ระบุเลขบัตรประชาชนและอีเมลเพื่อขอรับรหัส PIN 6 หลักในการตั้งรหัสผ่านใหม่";
      case "verify_pin":
        return "กรุณากรอกรหัส PIN 6 หลักที่ได้รับทางอีเมล";
      case "set_new_password":
        return "กรุณาตั้งรหัสผ่านใหม่สำหรับเข้าใช้งานระบบ";
      case "legacy":
        return "พบข้อมูลประวัติสมัครของท่านแล้ว กรุณาตั้งรหัสผ่านสำหรับการล็อกอินเข้าถึงข้อมูลในครั้งถัดไป";
      case "login":
      default:
        return "ระบุเลขประจำตัวประชาชน 13 หลัก ร่วมกับรหัสผ่านเพื่อเข้าสู่หน้าใบสมัครของท่าน";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    switch (authMode) {
      case "register":
        return handleRegister(e);
      case "forgot":
        return handleRequestResetPin(e);
      case "verify_pin":
        return handleVerifyPin(e);
      case "set_new_password":
        return handleResetPassword(e);
      case "legacy":
        return handleClaimLegacy(e);
      case "login":
      default:
        return handleLogin(e);
    }
  };

  return (
    <div className={layoutStyles.loginPage}>
      <Card className={cn(formStyles.loginCard, "gap-0 py-8 relative overflow-hidden max-w-lg w-full mx-4 shadow-xl border-slate-200 dark:border-zinc-700 rounded-none")}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400 pointer-events-none" />

        <CardContent className="flex flex-col items-center mb-6 text-center space-y-3 pt-0">
          <div className="flex items-center gap-3.5 p-3.5">
            <img src="/dpste_logo.png" alt="DPSTE Seal" className="h-13 w-auto object-contain shrink-0" />
            <img src="/dpste.png" alt="DPSTE Logo" className="h-11 w-auto object-contain shrink-0" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {getFormTitle()}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm px-4">
            {getFormDescription()}
          </p>
        </CardContent>

        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* National ID Input (Shown in login, register, forgot, legacy; hidden in verify_pin/set_new_password) */}
            {!["verify_pin", "set_new_password"].includes(authMode) && (
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  เลขประจำตัวประชาชน (13 หลัก)
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    maxLength={13}
                    placeholder="กรอกเลขประจำตัวประชาชน"
                    value={nationalIdInput}
                    disabled={authMode === "legacy"}
                    onChange={(e) =>
                      setNationalIdInput(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="py-3 px-4 text-center tracking-widest text-lg font-mono h-auto bg-slate-50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                    required
                  />
                  {nationalIdInput.length === 13 && (
                    <div className="absolute right-3.5 top-3">
                      {isValidNationalId ? (
                        <span className="flex h-6 w-6 items-center justify-center bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span
                          className="flex h-6 w-6 items-center justify-center bg-rose-100 dark:bg-rose-950/50 text-rose-600"
                          title="Checksum ไม่ถูกต้อง"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {nationalIdInput.length === 13 && !isValidNationalId && (
                  <p className={formStyles.fieldError}>
                    กรุณากรอกเลขประจำตัวประชาชนให้ถูกต้อง
                  </p>
                )}
              </div>
            )}

            {/* Register Mode Specific Fields (Email Only) */}
            {authMode === "register" && (
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  อีเมลติดต่อ
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="pl-9 py-3 h-auto bg-slate-50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            {/* Forgot Mode Specific Fields (Email Only) */}
            {authMode === "forgot" && (
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  อีเมลที่ลงทะเบียนไว้
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="กรอกอีเมลสำหรับส่ง PIN"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="pl-9 py-3 h-auto bg-slate-50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            {/* Verify PIN OTP Input */}
            {authMode === "verify_pin" && (
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  รหัส PIN 6 หลัก (OTP)
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="กรอกรหัส PIN 6 หลัก"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ""))}
                    className="pl-9 py-3 text-lg h-auto bg-slate-50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password Field (Login, Register, Reset, and Legacy setups) */}
            {["login", "register", "set_new_password", "legacy"].includes(authMode) && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                    {authMode === "login" ? "รหัสผ่าน" : "รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"}
                  </Label>
                  {authMode === "login" && (
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-[11px] font-semibold text-[#0b52a7] hover:text-[#08407f] dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder={authMode === "login" ? "กรอกรหัสผ่านของท่าน" : "ตั้งรหัสผ่านใหม่"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="pl-9 py-3 h-auto bg-slate-50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                    required
                  />
                </div>
                {authMode !== "login" && passwordInput.length > 0 && passwordInput.length < 8 && (
                  <p className="text-xs text-rose-500 font-medium mt-1">
                    รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร
                  </p>
                )}
              </div>
            )}

            {/* Confirm Password Field (Register, Reset, and Legacy setups) */}
            {["register", "set_new_password", "legacy"].includes(authMode) && (
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  ยืนยันรหัสผ่านใหม่อีกครั้ง
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="pl-9 py-3 h-auto bg-slate-50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
                    required
                  />
                </div>
                {passwordInput && confirmPasswordInput && passwordInput !== confirmPasswordInput && (
                  <p className={formStyles.fieldError}>รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง</p>
                )}
              </div>
            )}

            {/* Messages Display */}
            {errorMsg && (
              <Alert variant="destructive" className="border-rose-100 dark:border-rose-950/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 py-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
              </Alert>
            )}

            {successMsg && (
              <Alert className="border-emerald-100 dark:border-emerald-950/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 py-3">
                <Check className="h-4 w-4 shrink-0" />
                <AlertDescription className="text-xs">{successMsg}</AlertDescription>
              </Alert>
            )}

            {/* Action Submit Button */}
            <Button
              type="submit"
              disabled={
                loading ||
                (!["verify_pin", "set_new_password"].includes(authMode) && !isValidNationalId) ||
                (["register", "set_new_password", "legacy"].includes(authMode) && passwordInput !== confirmPasswordInput)
              }
              className="w-full py-3.5 h-auto font-bold rounded-none gap-2 mt-4 transition-all bg-[#0b52a7] hover:bg-[#08407f]"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>
                    {authMode === "login" && "เข้าสู่หน้าใบสมัคร"}
                    {authMode === "register" && "ยืนยันการลงทะเบียน"}
                    {authMode === "forgot" && "ขอรับรหัส PIN"}
                    {authMode === "verify_pin" && "ยืนยันรหัส PIN"}
                    {authMode === "set_new_password" && "ตั้งรหัสผ่านใหม่"}
                    {authMode === "legacy" && "ตั้งรหัสผ่านเข้าใช้งาน"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Mode Switch Actions Footer */}
          <div className="mt-6 flex flex-col items-center gap-3">
            {authMode === "login" ? (
              <div className="text-xs text-slate-500 dark:text-zinc-400">
                ยังไม่มีบัญชีใบสมัคร?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="font-bold text-[#0b52a7] hover:text-[#08407f] dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  ลงทะเบียนผู้สมัครใหม่ที่นี่
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-xs flex items-center gap-1.5 font-semibold text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>กลับสู่หน้าเข้าสู่ระบบหลัก</span>
              </button>
            )}

            <div className="mt-2 text-center">
              <Link
                href="/"
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
              >
                กลับไปยังหน้าหลักระบบ
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
