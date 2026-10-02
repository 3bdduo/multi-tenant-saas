"use client";

import { RequireRole } from "@/components/RequireRole";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { IconDashboard, IconUsers, IconBell, IconSurgery } from "@/components/ui/icons";

const HospitalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" /><path d="M19 21v-4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4" />
    <path d="M5 15V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8" />
    <path d="M12 9v4" /><path d="M10 11h4" />
  </svg>
);

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" /><path d="M12 17h.01" />
  </svg>
);

const NAV_ITEMS = [
  { href: "/hospital", label: "لوحة التحكم", icon: <IconDashboard /> },
  { href: "/hospital/emergency", label: "تقارير الطوارئ", icon: <AlertIcon /> },
  { href: "/hospital/surgery-bookings", label: "طلبات حجز العمليات", icon: <IconSurgery /> },
  { href: "/hospital/profile", label: "بيانات المستشفى", icon: <HospitalIcon /> },
  { href: "/hospital/notifications", label: "الإشعارات", icon: <IconBell /> },
];

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="Hospital">
      <DashboardShell navItems={NAV_ITEMS} title="لوحة تحكم المستشفى">
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
