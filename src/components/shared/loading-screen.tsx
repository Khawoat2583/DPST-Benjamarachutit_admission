"use client";

import React from "react";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "กำลังโหลดระบบ..." }: LoadingScreenProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-slate-50 dark:bg-zinc-950 font-prompt overflow-hidden">
      {/* Visual background elements */}
      <div className="pointer-events-none absolute inset-0 opacity-40 dpst-grid-pattern z-0" />
      <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-[#0b52a7]/5 blur-3xl dark:bg-blue-500/10 z-0" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Loading Animation Ring */}
        <div className="relative flex items-center justify-center h-48 w-48">
          {/* Glowing blur background */}
          <div className="absolute -inset-4 rounded-full bg-[#0b52a7]/8 dark:bg-blue-400/12 blur-xl animate-pulse" />

          {/* Outer elegant spinning ring */}
          <div className="absolute inset-0 rounded-full border-3 border-slate-200/50 dark:border-zinc-800/50" />
          <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-[#0b52a7] dark:border-t-blue-400 animate-spin" />

          {/* Inner counter-rotating ring for complexity */}
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-yellow-400/70 dark:border-b-yellow-400/60 animate-[spin_1.5s_linear_infinite_reverse]" />

          {/* Centered Brand Logo */}
          <div className="absolute inset-0 flex items-center justify-center p-3 select-none">
            <img
              src="/dpste.png"
              alt="DPST Logo"
              className="h-10 w-auto object-contain animate-pulse max-w-full"
            />
          </div>
        </div>

        {/* Status Message */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="text-sm font-black tracking-wide text-[#0b52a7]/80 dark:text-blue-400/80 animate-pulse">
            {message}
          </p>
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 tracking-widest uppercase">
            Please wait a moment
          </span>
        </div>
      </div>
    </div>
  );
}
