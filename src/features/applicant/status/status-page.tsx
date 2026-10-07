"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ContactFab } from "@/components/shared/contact-fab";
import { PageBanner } from "@/components/shared/page-banner";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { StatusSearchProvider } from "./status-search-context";
import { StatusSearchForm } from "./components/status-search-form";
import { StatusResults } from "./components/status-results";

function StatusLoading() {
  return <LoadingScreen message="กำลังโหลดระบบติดตามสถานะ..." />;
}

function StatusContent() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 font-prompt">
      <Navbar />

      <PageBanner
        title="ตรวจสอบสถานะการสมัครเรียน"
        subtitle="ป้อนเลขประจำตัวประชาชน 13 หลัก เพื่อดึงข้อมูลขั้นตอนการคัดเลือกและผลการตรวจเอกสารของนักเรียน"
      />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <StatusSearchForm />
        <StatusResults />
      </main>

      <Footer />
      <ContactFab />
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<StatusLoading />}>
      <StatusSearchProvider>
        <StatusContent />
      </StatusSearchProvider>
    </Suspense>
  );
}
