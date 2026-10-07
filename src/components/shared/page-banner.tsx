import React from "react";

type PageBannerProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  maxWidth?: "max-w-3xl" | "max-w-4xl" | "max-w-6xl";
  children?: React.ReactNode;
};

export function PageBanner({
  title,
  subtitle,
  icon,
  maxWidth = "max-w-6xl",
  children,
}: PageBannerProps) {
  return (
    <div className="bg-[#0b52a7] pt-16 sm:pt-18">
      <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-10`}>
        <div className={`flex flex-col items-center text-center${icon ? " gap-3" : ""}`}>
          {icon && (
            <div className="text-yellow-400 shrink-0">{icon}</div>
          )}
          <div>
            <h1 className="text-2xl font-black text-white leading-tight">{title}</h1>
            {subtitle && (
              <p className="text-white/70 text-sm mt-1">{subtitle}</p>
            )}
            {children}
          </div>
        </div>
      </div>
      <div className="h-1 bg-yellow-400" />
    </div>
  );
}
