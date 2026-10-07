"use client";

import { Search, CheckCircle2, ShieldAlert, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStatusSearch } from "../status-search-context";

export function StatusSearchForm() {
  const {
    nationalId,
    setNationalId,
    loading,
    errorMsg,
    isValidId,
    onSubmit,
  } = useStatusSearch();

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-[#0b52a7] shadow-sm p-6 sm:p-8">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="search-national-id" className="uppercase tracking-wider text-xs font-bold text-slate-600 dark:text-zinc-400">
            เลขประจำตัวประชาชน (13 หลัก)
          </Label>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <div className="relative flex-1">
              <Input
                id="search-national-id"
                type="text"
                maxLength={13}
                placeholder="กรอกเลขประจำตัวประชาชน"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value.replace(/[^0-9]/g, ""))}
                className="py-3.5 h-auto rounded-none font-mono text-center tracking-widest text-lg"
                required
              />
              {nationalId.length === 13 && (
                <div className="absolute right-3.5 top-3.5">
                  {isValidId ? (
                    <span className="flex h-6 w-6 items-center justify-center bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                  ) : (
                    <span
                      className="flex h-6 w-6 items-center justify-center bg-rose-100 dark:bg-rose-950/50 text-rose-600"
                      title="Checksum ไม่ถูกต้อง"
                    >
                      <ShieldAlert className="h-4 w-4" />
                    </span>
                  )}
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading || !isValidId}
              className="py-3.5 h-auto rounded-none font-bold whitespace-nowrap bg-[#0b52a7] hover:bg-[#08407f]"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>ตรวจสอบสถานะ</span>
                </>
              )}
            </Button>
          </div>
          {nationalId.length === 13 && !isValidId && (
            <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
              เลขประจำตัวประชาชนไม่ถูกต้องตามหลักการคำนวณ กรุณากรอกเลขให้ถูกต้อง
            </p>
          )}
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="rounded-none">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}
