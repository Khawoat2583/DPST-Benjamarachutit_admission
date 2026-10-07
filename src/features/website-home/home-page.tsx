"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Award,
  Calendar,
  ArrowRight,
  ChevronRight,
  Loader2,
  FileText,
  ClipboardList,
  Newspaper,
} from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { ContactFab } from "@/components/shared/contact-fab";
import { Footer } from "@/components/shared/footer";
import { getNewsPosts, type NewsPost } from "@/features/news/actions";

const DNA_HELIX_POINTS = Array.from({ length: 25 }).map((_, i) => {
  const t = i / 24;
  const y = -60 + t * 120;
  const angle = t * Math.PI * 3; // 1.5 full cycles
  const amp = 20;
  const x1 = amp * Math.sin(angle);
  const x2 = -amp * Math.sin(angle);
  return { y, x1, x2 };
});

const DNA_PATH_1 = DNA_HELIX_POINTS.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x1.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
const DNA_PATH_2 = DNA_HELIX_POINTS.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x2.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

export default function WebsiteHomePage() {
  const [dbPosts, setDbPosts] = useState<NewsPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await getNewsPosts();
        if (res.success && res.posts && res.posts.length > 0) {
          setDbPosts(res.posts);
        }
      } catch (err) {
        console.error("Failed to fetch news posts:", err);
      } finally {
        setLoadingPosts(false);
      }
    }
    loadNews();
  }, []);

  const newsItems = [
    {
      date: "15 พ.ค. 2026",
      title: "ประกาศเกณฑ์การรับสมัครนักเรียนเข้าโครงการ พสวท. ปีการศึกษา 2569",
      category: "ประกาศรับสมัคร",
    },
    {
      date: "12 พ.ค. 2026",
      title: "ปฏิทินกิจกรรมการสมัครสอบคัดเลือกและการจัดอันดับประจำปี",
      category: "กำหนดการ",
    },
    {
      date: "08 พ.ค. 2026",
      title: "คำแนะนำการอัปโหลดไฟล์เอกสารหลักฐานประกอบการสมัคร",
      category: "คู่มือผู้สมัคร",
    },
  ];

  const pinnedPost = dbPosts.find((p) => p.isPinned);
  const regularPosts = dbPosts.filter((p) => !p.isPinned);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 font-prompt">
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-[#0b52a7] overflow-hidden">
        {/* Soft gradient wash over the flat blue */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(115% 90% at 16% -10%, rgba(255,255,255,0.14), rgba(255,255,255,0) 55%), linear-gradient(160deg, #0e5cc0 0%, #0b52a7 52%, #083c79 100%)" }} />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,.15) 40px, rgba(255,255,255,.15) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,.15) 40px, rgba(255,255,255,.15) 41px)" }} />

        {/* Faint STEM blueprint layer (same layer as the grid, behind content) */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.07]"
          viewBox="0 0 1200 520"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <defs>
            <style>{`
              @keyframes rotate-clockwise {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes rotate-counter-clockwise {
                from { transform: rotate(360deg); }
                to { transform: rotate(0deg); }
              }
              @keyframes float-slow {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-6px) rotate(2deg); }
              }
              @keyframes pulse-slow {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
              }
              .animate-spin-slow {
                animation: rotate-clockwise 40s linear infinite;
                transform-origin: 0px 0px;
              }
              .animate-spin-slow-reverse {
                animation: rotate-counter-clockwise 35s linear infinite;
                transform-origin: 0px 0px;
              }
              .animate-float {
                animation: float-slow 8s ease-in-out infinite;
                transform-origin: center;
              }
              .animate-pulse-slow {
                animation: pulse-slow 4s ease-in-out infinite;
              }
            `}</style>
          </defs>

          {/* atom — physics */}
          <g transform="translate(150 200) rotate(-10)">
            <g className="animate-spin-slow">
              <circle r="6" fill="currentColor" stroke="none" />
              <ellipse rx="46" ry="18" />
              <ellipse rx="46" ry="18" transform="rotate(60)" />
              <ellipse rx="46" ry="18" transform="rotate(120)" />
            </g>
          </g>

          {/* benzene ring — chemistry */}
          <g transform="translate(1050 275) rotate(15)">
            <polygon points="0,-34 30,-17 30,17 0,34 -30,17 -30,-17" />
            <circle r="18" />
          </g>

          {/* network graph — computer science */}
          <g transform="translate(400 280)">
            <line x1="0" y1="0" x2="35" y2="-25" />
            <line x1="0" y1="0" x2="25" y2="30" />
            <line x1="35" y1="-25" x2="65" y2="5" />
            <line x1="25" y1="30" x2="65" y2="5" />
            <line x1="0" y1="0" x2="-25" y2="10" />
            <circle cx="0" cy="0" r="4" fill="currentColor" stroke="none" />
            <circle cx="35" cy="-25" r="4" fill="currentColor" stroke="none" />
            <circle cx="25" cy="30" r="4" fill="currentColor" stroke="none" />
            <circle cx="65" cy="5" r="4" fill="currentColor" stroke="none" />
            <circle cx="-25" cy="10" r="4" fill="currentColor" stroke="none" />
          </g>

          {/* gear — engineering */}
          <g transform="translate(180 465) rotate(-15)">
            <g className="animate-spin-slow-reverse">
              <circle r="26" />
              <circle r="11" />
              {Array.from({ length: 8 }).map((_, i) => (
                <rect
                  key={i}
                  x="-4"
                  y="-38"
                  width="8"
                  height="12"
                  transform={`rotate(${i * 45})`}
                  fill="currentColor"
                  stroke="none"
                />
              ))}
            </g>
          </g>

          {/* beaker — chemistry */}
          <g transform="translate(1030 420) rotate(-5)">
            <path d="M -20 -32 L -20 28 Q -20 38 -10 38 L 10 38 Q 20 38 20 28 L 20 -32" />
            <path d="M -25 -32 L 20 -32 L 27 -38" />
            <line x1="-15" y1="8" x2="15" y2="8" />
            <line x1="8" y1="-14" x2="18" y2="-14" />
            <line x1="8" y1="-2" x2="18" y2="-2" />
          </g>

          {/* Erlenmeyer flask — chemistry */}
          <g transform="translate(610 415) rotate(8)">
            <path d="M -5 -36 L -5 -12 L -25 30 Q -29 40 -16 40 L 16 40 Q 29 40 25 30 L 5 -12 L 5 -36" />
            <line x1="-9" y1="-36" x2="9" y2="-36" />
            <line x1="-18" y1="16" x2="18" y2="16" />
          </g>

          {/* Saturn planet — astronomy */}
          <g transform="translate(320 80) rotate(-12)">
            <ellipse rx="30" ry="8" />
            <circle r="14" />
          </g>

          {/* light bulb — innovation */}
          <g transform="translate(490 465) rotate(-10)">
            <g className="animate-pulse-slow" style={{ transformOrigin: "0 0" }}>
              <path d="M -12 -12 C -12 -22, 12 -22, 12 -12 C 12 -5, 7 -2, 7 5 L -7 5 C -7 -2, -12 -5, -12 -12 Z" />
              <path d="M -4 5 L -4 -4 L -1 -7 L 1 -7 L 4 -4 L 4 5" />
              <line x1="-5" y1="8" x2="5" y2="8" />
              <line x1="-4" y1="11" x2="4" y2="11" />
              <line x1="-2" y1="14" x2="2" y2="14" />
              <line x1="-18" y1="-12" x2="-24" y2="-12" />
              <line x1="18" y1="-12" x2="24" y2="-12" />
              <line x1="-12" y1="-24" x2="-16" y2="-30" />
              <line x1="12" y1="-24" x2="16" y2="-30" />
              <line x1="0" y1="-22" x2="0" y2="-28" />
            </g>
          </g>

          {/* DNA helix — biology */}
          <g transform="translate(650 190) rotate(5)" strokeWidth={2.2}>
            <g className="animate-float" style={{ transformOrigin: "0 0" }}>
              <path d={DNA_PATH_1} />
              <path d={DNA_PATH_2} />
              {DNA_HELIX_POINTS.map((pt, idx) => {
                if (idx % 2 !== 0) return null;
                return (
                  <g key={idx}>
                    <line
                      x1={pt.x1}
                      y1={pt.y}
                      x2={pt.x2}
                      y2={pt.y}
                      strokeWidth={1.5}
                      opacity={0.6}
                    />
                    <circle cx={pt.x1} cy={pt.y} r={3.2} fill="currentColor" stroke="none" />
                    <circle cx={pt.x2} cy={pt.y} r={3.2} fill="currentColor" stroke="none" />
                  </g>
                );
              })}
            </g>
          </g>

          {/* right triangle — Pythagoras */}
          <g transform="translate(770 110) rotate(-5)">
            <polygon points="0,0 72,0 72,-42" />
            <rect x="61" y="-11" width="11" height="11" />
          </g>

          {/* drawing compass — geometry / engineering */}
          <g transform="translate(890 420) rotate(12)">
            <line x1="0" y1="0" x2="-12" y2="38" />
            <line x1="0" y1="0" x2="12" y2="38" />
            <circle cx="0" cy="0" r="3.5" fill="currentColor" stroke="none" />
            <path d="M -8 24 Q 0 26 8 24" />
          </g>

          {/* formulas */}
          <g fill="currentColor" stroke="none" fontFamily="ui-serif, Georgia, serif" fontStyle="italic">
            <text x="110" y="105" fontSize="26" transform="rotate(-5 200 105)">E = mc²</text>
            <text x="460" y="100" fontSize="22" transform="rotate(-2 460 60)">x = (−b ± √(b² − 4ac)) / 2a</text>
            <text x="930" y="100" fontSize="22" transform="rotate(3 830 65)">∇ × E = −∂B/∂t</text>
            <text x="300" y="485" fontSize="22" transform="rotate(-3 380 485)">iℏ ∂ψ/∂t = Ĥψ</text>
            <text x="680" y="470" fontSize="24" transform="rotate(4 980 495)">a² + b² = c²</text>
            <text x="1000" y="210" fontSize="22" transform="rotate(-4 660 130)">∫ f(x) dx</text>
            <text x="95" y="420" fontSize="22" transform="rotate(5 760 490)">PV = nRT</text>
            {/* <text x="300" y="475" fontSize="28" transform="rotate(-10 300 475)">∑</text> */}
          </g>
        </svg>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 sm:pt-36 sm:pb-28">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-white/90 uppercase">
                ศูนย์โครงการ พสวท. &nbsp;·&nbsp; โรงเรียนเบญจมราชูทิศ
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                โครงการพัฒนาและส่งเสริม<br />
                ผู้มีความสามารถพิเศษ<br />
                <span className="text-yellow-300">ทางวิทยาศาสตร์และเทคโนโลยี</span>
              </h1>

              <p className="text-white/80 text-base sm:text-lg max-w-xl leading-relaxed">
                โครงการ พสวท. ระดับมัธยมศึกษาตอนปลาย โรงเรียนเบญจมราชูทิศ
                บ่มเพาะนักวิจัยและนวัตกรแห่งอนาคต ด้วยหลักสูตรวิทยาศาสตร์เข้มข้น
                และทุนการศึกษาต่อเนื่องถึงระดับปริญญาเอก
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/admission"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-[#0b3a7a] font-bold text-sm sm:text-base transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  สมัครเข้าร่วมโครงการ
                </Link>
                <a
                  href="#about"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/40 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base transition-colors"
                >
                  รายละเอียดโครงการ
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-zinc-900 border-l-4 border-yellow-400 shadow-xl">
                <div className="bg-[#08407f] px-6 py-4">
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase">กำหนดการสมัครปีการศึกษา 2569</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  <div className="flex gap-4 px-6 py-4">
                    <Calendar className="h-5 w-5 text-[#0b52a7] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">รับสมัครออนไลน์</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">เปิดรับตามประกาศอย่างเป็นทางการ</p>
                    </div>
                  </div>
                  <div className="flex gap-4 px-6 py-4">
                    <BookOpen className="h-5 w-5 text-[#0b52a7] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">ประกาศรายชื่อผู้สอบผ่านรอบแรก</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">ติดตามประกาศผ่านระบบข่าวสาร</p>
                    </div>
                  </div>
                  <div className="flex gap-4 px-6 py-4">
                    <Award className="h-5 w-5 text-[#0b52a7] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">ประกาศผลการจัดอันดับ</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">จัดลำดับตามเกณฑ์ Tie-break ของโครงการ</p>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-800/50">
                    <Link
                      href="/status"
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0b52a7] dark:text-blue-400 hover:underline"
                    >
                      <ClipboardList className="h-4 w-4" />
                      ตรวจสอบสถานะการสมัคร
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative h-10 bg-slate-50 dark:bg-zinc-950" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }} />
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-zinc-900/40">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px flex-1 bg-[#0b52a7]/20 dark:bg-blue-800/40 max-w-20" />
              <span className="text-xs font-bold tracking-widest text-[#0b52a7] dark:text-blue-400 uppercase">เกี่ยวกับโครงการ</span>
              <div className="h-px flex-1 bg-[#0b52a7]/20 dark:bg-blue-800/40 max-w-20" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">โครงการ พสวท.</h2>
            <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed">
              โครงการพัฒนาและส่งเสริมผู้มีความสามารถพิเศษทางวิทยาศาสตร์และเทคโนโลยี (พสวท.)
              บ่มเพาะเยาวชนเพื่อสร้างผลงานวิจัย ค้นพบองค์ความรู้ใหม่ และขับเคลื่อนประเทศด้วยวิทยาศาสตร์เข้มข้น
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <BookOpen className="h-6 w-6" />,
                title: "หลักสูตรพิเศษเข้มข้น",
                desc: "เรียนรู้วิทยาศาสตร์ คณิตศาสตร์ และเทคโนโลยีเกินหลักสูตรปกติ มุ่งเน้นการปฏิบัติจริงในห้องแล็บมาตรฐานสูง",
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "อาจารย์ที่ปรึกษาวิจัย",
                desc: "นักเรียนทำโครงงานวิทยาศาสตร์ร่วมกับอาจารย์มหาวิทยาลัยและนักวิจัยชั้นนำ ฝึกกระบวนการคิดวิเคราะห์ระดับสูง",
              },
              {
                icon: <Award className="h-6 w-6" />,
                title: "ทุนการศึกษาต่อเนื่อง",
                desc: "รับทุนสนับสนุนตั้งแต่ระดับมัธยมถึงปริญญาเอก พร้อมโอกาสทัศนศึกษาและแลกเปลี่ยนความรู้ระดับนานาชาติ",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 border-l-4 border-l-[#0b52a7] p-6 space-y-3 shadow-sm"
              >
                <div className="text-[#0b52a7] dark:text-blue-400">{item.icon}</div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEWS SECTION ===== */}
      <section id="news" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-5 border-b-2 border-[#0b52a7] dark:border-blue-700">
            <div>
              <span className="text-xs font-bold tracking-widest text-[#0b52a7] dark:text-blue-400 uppercase">ข่าวสารล่าสุด</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">ข่าวสารและประชาสัมพันธ์</h2>
            </div>
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0b52a7] dark:text-blue-400 hover:underline shrink-0"
            >
              ดูข่าวสารทั้งหมด
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loadingPosts ? (
            <div className="flex flex-col items-center justify-center py-20 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-400">
              <Loader2 className="h-7 w-7 animate-spin text-[#0b52a7]" />
              <p className="text-xs font-semibold mt-3 text-slate-500 dark:text-zinc-500">กำลังโหลดข่าวสาร...</p>
            </div>
          ) : dbPosts.length > 0 ? (
            <div className="space-y-6">
              {/* Pinned post — large card */}
              {pinnedPost && (
                <Link href={`/news/${pinnedPost.id}`} className="block">
                  <HomeNewsCard post={pinnedPost} large />
                </Link>
              )}

              {/* Regular posts — grid */}
              {regularPosts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.slice(0, 3).map((post) => (
                    <Link key={post.id} href={`/news/${post.id}`} className="block">
                      <HomeNewsCard post={post} />
                    </Link>
                  ))}
                </div>
              )}

              <div className="text-center pt-2">
                <Link
                  href="/news"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 border-2 border-[#0b52a7] text-[#0b52a7] dark:text-blue-400 dark:border-blue-600 font-bold text-sm hover:bg-[#0b52a7] hover:text-white transition-colors"
                >
                  ดูข่าวสารทั้งหมด
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* Static fallback */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsItems.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 dark:border-zinc-700 border-l-4 border-l-[#0b52a7] bg-white dark:bg-zinc-900 flex h-40 shadow-sm"
                >
                  <div className="w-40 shrink-0 bg-[#0b52a7] flex items-center justify-center">
                    <Newspaper className="h-10 w-10 text-white/40" />
                  </div>
                  <div className="p-4 flex flex-col justify-center gap-2 min-w-0">
                    <span className="inline-block bg-[#0b52a7] text-white text-[10px] font-bold px-2 py-0.5 w-fit uppercase tracking-wide">
                      {item.category}
                    </span>
                    <p className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">{item.title}</p>
                    <p className="text-sm text-slate-400 dark:text-zinc-500">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <ContactFab />
    </div>
  );
}

function HomeNewsCard({ post, large = false }: { post: NewsPost; large?: boolean }) {
  const firstImage = post.images?.[0];
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (large) {
    return (
      <div className="border border-slate-200 dark:border-zinc-700 border-l-4 border-l-yellow-400 overflow-hidden bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow flex h-[220px]">
        <div className="w-64 sm:w-80 shrink-0 bg-[#0b52a7] flex items-center justify-center">
          {firstImage ? (
            <img src={`/api/news-images/${firstImage.storedName}`} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <Newspaper className="h-14 w-14 text-white/40" />
          )}
        </div>
        <div className="p-7 flex flex-col justify-center gap-3">
          <span className="inline-block bg-[#0b52a7] text-white text-xs font-bold px-3 py-1 w-fit uppercase tracking-wide">
            {post.newsType}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">{post.title}</h2>
          <p className="text-sm text-slate-400 dark:text-zinc-500">{formattedDate}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 dark:border-zinc-700 border-l-4 border-l-[#0b52a7] overflow-hidden bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow flex h-40">
      <div className="w-40 shrink-0 bg-[#0b52a7] flex items-center justify-center">
        {firstImage ? (
          <img src={`/api/news-images/${firstImage.storedName}`} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <Newspaper className="h-10 w-10 text-white/40" />
        )}
      </div>
      <div className="p-4 flex flex-col justify-center gap-2 min-w-0">
        <span className="inline-block bg-[#0b52a7] text-white text-[10px] font-bold px-2 py-0.5 w-fit uppercase tracking-wide">
          {post.newsType}
        </span>
        <p className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">{post.title}</p>
        <p className="text-sm text-slate-400 dark:text-zinc-500">{formattedDate}</p>
      </div>
    </div>
  );
}
