"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "ข่าวสาร", href: "/news", activeOn: ["/news"] },
    { label: "การรับสมัคร", href: "/admission", activeOn: ["/admission", "/apply", "/status"] },
    { label: "ติดต่อ", href: "/contact", activeOn: ["/contact"] },
  ];

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith("/#") && pathname === "/") {
      const id = href.replace("/#", "");
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isLinkActive = (item: typeof navLinks[number]) =>
    item.activeOn
      ? item.activeOn.some((path) => pathname.startsWith(path))
      : pathname === item.href;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">

          {/* Logo */}
          <Link
            href="/"
            onClick={() => handleLinkClick("/")}
            className="flex items-center gap-3 shrink-0"
          >
            <img
              src="/dpste_logo.png"
              alt="DPST Emblems"
              className="h-9 sm:h-11 w-auto object-contain"
            />
            <img
              src="/dpste.png"
              alt="DPST Logo Text"
              className="h-7 sm:h-9 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const active = isLinkActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleLinkClick(item.href)}
                  className={`relative px-4 py-2 text-sm font-semibold tracking-wide transition-colors ${
                    active
                      ? "text-[#0b52a7] dark:text-blue-400"
                      : "text-slate-600 dark:text-zinc-300 hover:text-[#0b52a7] dark:hover:text-blue-400"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#0b52a7] dark:bg-blue-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-zinc-300 hover:text-[#0b52a7] dark:hover:text-blue-400 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Panel */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col">
            {navLinks.map((item) => {
              const active = isLinkActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleLinkClick(item.href)}
                  className={`px-3 py-3 text-sm font-semibold border-l-2 transition-colors ${
                    active
                      ? "border-[#0b52a7] text-[#0b52a7] dark:text-blue-400 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/20"
                      : "border-transparent text-slate-600 dark:text-zinc-300 hover:text-[#0b52a7] dark:hover:text-blue-400"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
