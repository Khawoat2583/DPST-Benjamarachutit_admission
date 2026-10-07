import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/server/auth/admin-session";
import AdminSidebar from "./admin-sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Proactive auth check in server component before rendering layout
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 flex flex-col md:flex-row font-prompt overflow-hidden">
      {/* Interactive premium sidebar and header */}
      <AdminSidebar username={session.username} />

      {/* Main Content Area */}
      <main className="flex-1 h-full w-full overflow-y-auto transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
