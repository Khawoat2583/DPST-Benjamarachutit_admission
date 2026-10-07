"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Lock } from "lucide-react";

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff % 86_400_000) / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1000),
  };
}

export function RegistrationCountdown({
  deadline,
  closed,
}: {
  deadline: string | null;
  closed: boolean;
}) {
  const parsed = deadline ? new Date(deadline).getTime() : NaN;
  const target = Number.isNaN(parsed) ? null : parsed;

  // `now` stays null until mounted to avoid SSR/CSR hydration mismatch.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (closed || target === null) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [closed, target]);

  const isOver = target !== null && now !== null && now >= target;

  // Manually closed or the deadline has passed
  if (closed || isOver) {
    return (
      <div className="flex items-center gap-3 border border-rose-200 dark:border-rose-900/50 border-l-4 border-l-rose-500 bg-rose-50/70 dark:bg-rose-950/20 p-4">
        <Lock className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
        <div>
          <p className="text-sm font-black text-rose-700 dark:text-rose-300">ปิดรับสมัครแล้ว</p>
          <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
            ระบบปิดรับใบสมัครสำหรับรอบนี้แล้ว ขอบคุณที่ให้ความสนใจ
          </p>
        </div>
      </div>
    );
  }

  // No deadline configured → render nothing
  if (target === null) return null;

  const r = now !== null ? getRemaining(target) : null;
  const units: { label: string; value: number | undefined }[] = [
    { label: "วัน", value: r?.d },
    { label: "ชั่วโมง", value: r?.h },
    { label: "นาที", value: r?.m },
    { label: "วินาที", value: r?.s },
  ];
  const deadlineLabel = new Date(target).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="border border-l-4 border-[#0b52a7] border-l-yellow-400 bg-[#0b52a7] text-white shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <CalendarClock className="h-6 w-6 text-yellow-400 shrink-0" />
          <div>
            <p className="text-[10px] font-black tracking-[0.15em] text-yellow-400 uppercase">
              เหลือเวลารับสมัครอีก
            </p>
            <p className="text-xs text-white/70">ปิดรับ {deadlineLabel} น.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {units.map((u) => (
            <div
              key={u.label}
              className="min-w-[58px] bg-white/10 border border-white/15 px-2 py-1.5 text-center"
            >
              <p className="text-xl sm:text-2xl font-black tabular-nums leading-none">
                {u.value === undefined ? "--" : String(u.value).padStart(2, "0")}
              </p>
              <p className="text-[9px] font-bold text-white/60 uppercase tracking-wide mt-1">
                {u.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
