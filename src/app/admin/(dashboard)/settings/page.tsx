import React from "react";
import { CalendarClock } from "lucide-react";
import { getSystemSettings } from "@/lib/system-settings";
import DashboardWrapper from "../dashboard-wrapper";
import SettingsClient from "./settings-client";

export const revalidate = 0; // Always read the latest settings

export default function AdminSettingsPage() {
  const settings = getSystemSettings();

  return (
    <DashboardWrapper
      title="ตั้งค่าการรับสมัคร"
      subtitle="กำหนดวันปิดรับสมัครที่ใช้แสดงนาฬิกานับถอยหลังในหน้ารับสมัคร"
      icon={CalendarClock}
    >
      <SettingsClient
        registrationCloseAt={settings.registrationCloseAt ?? null}
        isRegistrationClosed={settings.isRegistrationClosed}
      />
    </DashboardWrapper>
  );
}
