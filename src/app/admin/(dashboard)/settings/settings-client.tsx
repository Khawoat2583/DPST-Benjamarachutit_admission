"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { CalendarClock, Save, Loader2, CheckCircle, AlertCircle, Lock, Unlock, Trash2 } from "lucide-react";
import { updateRegistrationDeadlineAction } from "@/features/ranking/actions";

/** Convert a stored UTC ISO string to a value for <input type="datetime-local"> (local time). */
function toInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

interface SettingsClientProps {
  registrationCloseAt: string | null;
  isRegistrationClosed: boolean;
}

export default function SettingsClient({ registrationCloseAt, isRegistrationClosed }: SettingsClientProps) {
  const [value, setValue] = useState(toInputValue(registrationCloseAt));
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = (clear: boolean) => {
    setMsg(null);
    const iso = clear || !value ? null : new Date(value).toISOString();
    startTransition(async () => {
      const res = await updateRegistrationDeadlineAction(iso);
      if (res.success) {
        if (clear) setValue("");
        setMsg({ ok: true, text: clear ? "ล้างวันปิดรับสมัครเรียบร้อยแล้ว" : "บันทึกวันปิดรับสมัครเรียบร้อยแล้ว" });
      } else {
        setMsg({ ok: false, text: res.error || "ไม่สามารถบันทึกได้" });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Current open/closed status */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-slate-300 dark:border-l-zinc-600 p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isRegistrationClosed ? (
            <Lock className="h-5 w-5 text-rose-500 shrink-0" />
          ) : (
            <Unlock className="h-5 w-5 text-emerald-500 shrink-0" />
          )}
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              สถานะระบบรับสมัคร: {isRegistrationClosed ? "ปิดรับสมัคร" : "เปิดรับสมัคร"}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              การเปิด/ปิดด้วยตนเอง จัดการได้ที่เมนู{" "}
              <Link href="/admin/workflow" className="font-bold text-[#0b52a7] dark:text-blue-400 hover:underline">
                ประมวลผลจัดอันดับ
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Deadline editor */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-[#0b52a7] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-[#0b52a7] dark:text-blue-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">กำหนดวันปิดรับสมัคร</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
          วันและเวลานี้จะใช้แสดงนาฬิกานับถอยหลังในหน้ารับสมัคร (/admission) เมื่อถึงกำหนด ระบบจะแสดงสถานะ
          &quot;ปิดรับสมัครแล้ว&quot; โดยอัตโนมัติ หากเว้นว่างไว้ นาฬิกานับถอยหลังจะไม่แสดง
        </p>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
            วันและเวลาปิดรับสมัคร
          </label>
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isPending}
            className="w-full sm:w-auto py-2.5 px-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-none text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0b52a7]/30"
          />
        </div>

        {msg && (
          <div
            className={`flex items-center gap-2 p-3 text-xs font-semibold border ${
              msg.ok
                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300"
            }`}
          >
            {msg.ok ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            {msg.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            onClick={() => submit(false)}
            disabled={isPending || !value}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0b52a7] hover:bg-[#08407f] disabled:bg-slate-300 dark:disabled:bg-zinc-800 text-white font-bold text-sm shadow-sm cursor-pointer disabled:cursor-not-allowed transition-all"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            บันทึกวันปิดรับสมัคร
          </button>
          <button
            onClick={() => submit(true)}
            disabled={isPending || (!value && !registrationCloseAt)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Trash2 className="h-4 w-4" />
            ล้างวันที่
          </button>
        </div>
      </div>
    </div>
  );
}
