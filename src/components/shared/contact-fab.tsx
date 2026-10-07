"use client";

import { useState } from "react";
import { MessagesSquare, X } from "lucide-react";

export function ContactFab() {
  const [isOpen, setIsOpen] = useState(false);

  const contactItems = [
    {
      name: "Messenger",
      href: "https://m.me/61570098151261",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-white">
          <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.914 1.448 5.518 3.7 7.205V22l3.39-1.859A12.072 12.072 0 0 0 12 20.516c5.523 0 10-4.146 10-9.258S17.523 2 12 2zm1.096 12.385-2.802-2.988-5.465 2.988 6.012-6.386 2.862 2.988 5.405-2.988-6.012 6.386z" />
        </svg>
      ),
      bgColor: "bg-gradient-to-tr from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600",
      label: "Messenger",
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61570098151261",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-white">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z" />
        </svg>
      ),
      bgColor: "bg-blue-600 hover:bg-blue-700",
      label: "Facebook",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3.5">
      {/* Expanded Actions Stack */}
      {isOpen && (
        <div className="flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-5 duration-250">
          {contactItems.map((item) => (
            <div key={item.name} className="flex items-center gap-3.5 group">
              {/* Popover label (left of button) */}
              <span className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-md border border-slate-200/50 dark:border-zinc-800/50 text-[11px] font-black text-slate-700 dark:text-zinc-300 transition-all duration-200 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 select-none">
                {item.label}
              </span>
              {/* Rounded action button */}
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`h-16 w-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95 ${item.bgColor}`}
                aria-label={`ติดต่อเราผ่าน ${item.name}`}
              >
                {item.icon}
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <div className="flex items-center gap-3.5 group">
        {/* Contact Label (Idle state only) */}
        {!isOpen && (
          <span className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-md border border-slate-200/50 dark:border-zinc-800/50 text-xs font-black text-slate-700 dark:text-zinc-300 transition-all duration-200 hover:shadow-lg select-none">
            ติดต่อโครงการ
          </span>
        )}

        {/* Floating circular trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-16 w-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 transform hover:scale-108 active:scale-95 ${isOpen
              ? "bg-slate-500 hover:bg-slate-600 dark:bg-zinc-700 dark:hover:bg-zinc-600"
              : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 animate-bounce-subtle"
            }`}
          aria-label="ติดต่อเรา"
        >
          {isOpen ? (
            <X className="h-7 w-7 text-white" />
          ) : (
            <MessagesSquare className="h-7 w-7 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
