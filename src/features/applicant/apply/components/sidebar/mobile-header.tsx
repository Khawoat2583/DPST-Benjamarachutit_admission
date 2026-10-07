"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApplyForm } from "../../apply-form-context";
import { layoutStyles } from "../../form-ui";

export function MobileHeader() {
  const { nationalIdInput, handleLogout } = useApplyForm();

  return (
    <header className={layoutStyles.mobileHeader}>
      <div className="px-4 flex justify-between items-center w-full">
        <div className="flex items-center gap-2 min-w-0">
          <img src="/dpste_logo.png" alt="DPSTE Seal" className="h-6.5 w-auto object-contain shrink-0" />
          <div className="min-w-0">
            <h2 className="font-extrabold text-slate-900 dark:text-white text-[11px] leading-tight truncate">
              ระบบรับสมัคร พสวท.
            </h2>
            <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-mono truncate block">
              {nationalIdInput}
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={handleLogout}
          className="gap-1 py-1.5 px-2.5 h-auto text-[10px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 shrink-0"
        >
          <LogOut className="h-3 w-3" />
          <span>ออก</span>
        </Button>
      </div>
    </header>
  );
}
