"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminLoginAction } from "@/features/admin-review/actions";
import { ShieldAlert, Eye, EyeOff, Lock, User, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username || !password) {
      setErrorMsg("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const result = await adminLoginAction(null, formData);

      if (result && !result.success) {
        setErrorMsg(result.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      } else if (result && result.success) {
        // Redirect to admin panel on success
        router.push("/admin");
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col justify-center items-center relative overflow-hidden px-4 font-prompt select-none">
      {/* Subtle institutional grid background */}
      <div className="pointer-events-none absolute inset-0 opacity-40 dpst-grid-pattern z-0" />

      {/* Decorative Top Accent Line (gold) */}
      <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400" />

      <div className="w-full max-w-md z-10 space-y-7 animate-in fade-in zoom-in-95 duration-500">
        {/* Centered Brand Logos Stacked Vertically */}
        <div className="flex flex-col items-center gap-4 select-none">
          <img src="/dpste_logo.png" alt="Royal & School Emblems" className="h-14 sm:h-16 w-auto object-contain" />
          <img src="/dpste.png" alt="DPST Logo Text" className="h-12 sm:h-14 w-auto object-contain" />
        </div>

        {/* Formal Login Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-t-4 border-t-[#0b52a7] p-8 sm:p-10 shadow-sm space-y-6">

          {errorMsg && (
            <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 text-xs sm:text-sm animate-in shake duration-300 dark:bg-rose-950/20 dark:border-rose-500/30 dark:text-rose-200">
              <ShieldAlert className="h-5 w-5 text-rose-500 dark:text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block pl-1">
                ชื่อผู้ใช้งาน
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-zinc-500">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isPending}
                  required
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-zinc-950/30 border border-slate-200 dark:border-zinc-800 rounded-none text-slate-900 dark:text-zinc-100 text-sm placeholder-slate-400 dark:placeholder-zinc-650 focus:outline-hidden focus:ring-2 focus:ring-[#0b52a7]/25 focus:border-[#0b52a7] transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block pl-1">
                รหัสผ่าน
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-zinc-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-white/50 dark:bg-zinc-950/30 border border-slate-200 dark:border-zinc-800 rounded-none text-slate-900 dark:text-zinc-100 text-sm placeholder-slate-400 dark:placeholder-zinc-650 focus:outline-hidden focus:ring-2 focus:ring-[#0b52a7]/25 focus:border-[#0b52a7] transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-350 focus:outline-hidden transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-3.5 px-4 bg-[#0b52a7] hover:bg-[#08407f] text-white font-bold text-sm transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>กำลังตรวจสอบข้อมูล...</span>
                </>
              ) : (
                <span>เข้าสู่ระบบ</span>
              )}
            </button>
          </form>
        </div>

        {/* Back Link to Landing */}
        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            ← กลับสู่หน้าหลักระบบรับสมัคร
          </button>
        </div>
      </div>
    </div>
  );
}
