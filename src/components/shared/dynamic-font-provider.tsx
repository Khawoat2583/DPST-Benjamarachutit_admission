"use client";

import { usePathname } from "next/navigation";
import React from "react";

export function DynamicFontProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Use the original font if the path starts with /apply or /admin
  const isOriginalFont = pathname.startsWith("/apply") || pathname.startsWith("/admin");

  return (
    <div className={isOriginalFont ? "min-h-full flex flex-col" : "font-prompt min-h-full flex flex-col"}>
      {children}
    </div>
  );
}
