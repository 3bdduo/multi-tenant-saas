"use client";

import { RequireRole } from "@/components/RequireRole";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { IconDashboard, IconCalendar, IconUsers, IconClinic, IconBell, IconChat, IconSurgery } from "@/components/ui/icons";

const NAV_ITEMS = [
  { href: "/doctor", label: "لوحة التحكم", icon: <IconDashboard /> },
  { href: "/doctor/appointments", label: "إدارة الحجوزات", icon: <IconCalendar /> },
  { href: "/doctor/booking-settings", label: "إعدادات الحجز", icon: <IconCalendar /> },
  { href: "/doctor/clinic", label: "بيانات العيادة", icon: <IconClinic /> },
  { href: "/doctor/patients", label: "سجلات المرضى", icon: <IconUsers /> },
  { href: "/doctor/consultations", label: "الاستشارات الطبية", icon: <IconChat /> },
  { href: "/doctor/surgery-bookings", label: "طلبات حجز العمليات", icon: <IconSurgery /> },
  { href: "/doctor/notifications", label: "إشعارات المرضى", icon: <IconBell /> },
  { href: "/doctor/account-settings", label: "إعدادات الحساب", icon: <IconUsers /> },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="Doctor">
      <DashboardShell navItems={NAV_ITEMS} title="لوحة تحكم الطبيب">
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
