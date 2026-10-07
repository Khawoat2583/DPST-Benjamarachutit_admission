import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#08315f] dark:bg-zinc-950 text-white font-prompt">
      {/* Top accent bar */}
      <div className="h-1 bg-yellow-400" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">

          {/* Column 1: Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/dpste_logo.png" alt="DPST Logo" className="h-14 w-auto object-contain" />
              <img src="/dpste.png" alt="DPST" className="h-10 w-auto object-contain brightness-0 invert" />
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              ศูนย์โครงการพัฒนาและส่งเสริมผู้มีความสามารถพิเศษ<br />
              ทางวิทยาศาสตร์และเทคโนโลยี (พสวท.)<br />
              โรงเรียนเบญจมราชูทิศ
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-widest uppercase text-yellow-400 border-b border-white/10 pb-3">
              ลิงก์ด่วน
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "หน้าแรก" },
                { href: "/news", label: "ข่าวสารและประชาสัมพันธ์" },
                { href: "/admission", label: "สมัครเข้าร่วมโครงการ" },
                { href: "/status", label: "ตรวจสอบสถานะการสมัคร" },
                { href: "/contact", label: "ข้อมูลติดต่อ" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white hover:underline transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-widest uppercase text-yellow-400 border-b border-white/10 pb-3">
              ติดต่อเรา
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/70">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-yellow-400/80" />
                <span>159 หมู่ที่ 3 ถนนนาพรุ-ท่าแพ ตำบลโพธิ์เสด็จ อำเภอเมือง จังหวัดนครศรีธรรมราช 80000</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <Phone className="h-4 w-4 shrink-0 text-yellow-400/80" />
                <span>084-859-3989</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <Mail className="h-4 w-4 shrink-0 text-yellow-400/80" />
                <span>dpstebm@benjama.ac.th</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-[#062848] dark:bg-black/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-white/40">
          <span>© {new Date().getFullYear()} ศูนย์โครงการ พสวท. โรงเรียนเบญจมราชูทิศ. สงวนลิขสิทธิ์ทุกประการ</span>
          <span>DEVELOPED BY KITTITOUCH T.</span>
        </div>
      </div>
    </footer>
  );
}
