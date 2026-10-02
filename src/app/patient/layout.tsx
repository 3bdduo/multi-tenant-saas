"use client";

import { RequireRole } from "@/components/RequireRole";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { IconDashboard, IconCalendar, IconRecord, IconBell, IconUsers, IconChat, IconSurgery } from "@/components/ui/icons";

const NAV_ITEMS = [
  { href: "/patient", label: "الرئيسية", icon: <IconDashboard /> },
  { href: "/patient/appointments", label: "مواعيدي", icon: <IconCalendar /> },
  { href: "/patient/records", label: "سجلاتي الطبية", icon: <IconRecord /> },
  { href: "/patient/consultations", label: "الاستشارات الطبية", icon: <IconChat /> },
  { href: "/patient/surgery-bookings", label: "حجز العمليات", icon: <IconSurgery /> },
  { href: "/patient/notifications", label: "الإشعارات", icon: <IconBell /> },
  { href: "/patient/profile", label: "ملفي الشخصي", icon: <IconUsers /> },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="Patient">
      <DashboardShell navItems={NAV_ITEMS} title="بوابة المريض">
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
