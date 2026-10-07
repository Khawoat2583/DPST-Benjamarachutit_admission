"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminLogoutAction } from "@/features/admin-review/actions";
import {
  LayoutDashboard,
  FileCheck,
  Upload,
  Settings2,
  CalendarClock,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ChevronRight,
  Newspaper
} from "lucide-react";

interface AdminSidebarProps {
  username: string;
}

export default function AdminSidebar({ username }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "แผงควบคุมหลัก",
      href: "/admin",
      icon: LayoutDashboard,
      desc: "วิเคราะห์ภาพรวมระบบรับสมัคร",
      exact: true,
    },
    {
      name: "ตรวจสอบหลักฐาน",
      href: "/admin/review",
      icon: FileCheck,
      desc: "รีวิวภาพ ปพ.1 & บัตรประชาชน",
      exact: false,
    },
    {
      name: "จัดการข่าวสาร",
      href: "/admin/news",
      icon: Newspaper,
      desc: "โพสต์ประกาศพร้อมรูปภาพประกอบ",
      exact: false,
    },
    {
      name: "นำเข้าคะแนนภายนอก",
      href: "/admin/import",
      icon: Upload,
      desc: "นำเข้าคะแนนรอบแรกผ่าน Excel",
      exact: false,
    },
    {
      name: "ประมวลผลจัดอันดับ",
      href: "/admin/workflow",
      icon: Settings2,
      desc: "ปิดรับสมัคร & ประมวลผล",
      exact: false,
    },
    {
      name: "ตั้งค่าการรับสมัคร",
      href: "/admin/settings",
      icon: CalendarClock,
      desc: "กำหนดวันปิดรับสมัคร",
      exact: false,
    },
  ];


  const handleLogout = async () => {
    if (confirm("คุณต้องการออกจากระบบรับสมัครใช่หรือไม่?")) {
      await adminLogoutAction();
      router.push("/admin/login");
      router.refresh();
    }
  };

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden w-full bg-[#08315f] text-white p-4 flex justify-between items-center border-b border-white/10 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#0b52a7]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-bold text-sm tracking-wide">DPST Admin Portal</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 bg-white/10 hover:bg-white/20 focus:outline-hidden transition-colors"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-30 animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-[280px] bg-[#08315f] text-white flex flex-col justify-between border-r border-white/10 z-40 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col">
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3 select-none">
            <img
              src="/dpste_logo.png"
              alt="Royal & School Emblems"
              className="h-10 w-auto object-contain"
            />
            <img
              src="/dpste.png"
              alt="DPST Logo Text"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 flex-1">
            {menuItems.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group relative flex items-center justify-between p-3 pl-4 transition-all duration-200 ${
                    active
                      ? "bg-[#0b52a7] text-white font-semibold shadow-md shadow-slate-950/40"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {/* Vertical active indicator bar (gold) */}
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 animate-in fade-in duration-300" />
                  )}
                  <div className="flex items-center gap-3.5">
                    <item.icon
                      className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                        active ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p
                        className={`text-[10px] mt-0.5 ${
                          active ? "text-blue-100" : "text-slate-500 group-hover:text-slate-400"
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 transition-all duration-200 ${
                      active
                        ? "opacity-100 text-white translate-x-0.5"
                        : "opacity-0 group-hover:opacity-100 text-slate-500 hover:translate-x-0.5"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile & Logout */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-slate-950/40">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-[#0b52a7] flex items-center justify-center font-bold text-sm ring-1 ring-white/20 text-white uppercase">
              {username[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-300 truncate">{username}</p>
              <p className="text-[10px] text-slate-500 font-medium">ระดับสิทธิ์: Admin</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-2.5 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 hover:text-rose-200 transition-all duration-200 text-xs font-bold ring-1 ring-rose-500/10 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </>
  );
}
