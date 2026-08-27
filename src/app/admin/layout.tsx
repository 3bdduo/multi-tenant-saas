"use client";

import { RequireRole } from "@/components/RequireRole";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { IconDashboard, IconUsers, IconBuilding } from "@/components/ui/icons";

const NAV_ITEMS = [
  { href: "/admin", label: "لوحة التحكم", icon: <IconDashboard /> },
  { href: "/admin/doctors", label: "الأطباء", icon: <IconUsers /> },
  { href: "/admin/patients", label: "المرضى", icon: <IconUsers /> },
  { href: "/admin/clinics", label: "العيادات", icon: <IconBuilding /> },
  { href: "/admin/hospitals", label: "المستشفيات", icon: <IconBuilding /> },
  { href: "/admin/profile", label: "البروفايل الشخصي", icon: <IconUsers /> },
];


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="Admin">
      <DashboardShell navItems={NAV_ITEMS} title="لوحة تحكم المشرف">
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
