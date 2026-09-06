"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Logo, NabdLogoIcon } from "@/components/ui/Logo";
import { getMyProfile } from "@/lib/api/patient";
import { getMe as getDoctorMe } from "@/lib/api/doctor";
import { getMyHospital } from "@/lib/api/hospital";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function DashboardShell({
  navItems,
  title,
  children,
}: {
  navItems: NavItem[];
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Load and persist sidebar collapsed preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("clinic_sidebar_collapsed");
      if (saved === "true") {
        setIsCollapsed(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("clinic_sidebar_collapsed", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // User Profile State
  const [profileData, setProfileData] = useState<{
    name: string;
    avatar: string;
    roleLabel: string;
    profileHref: string;
  }>({
    name: "المستخدم",
    avatar: "/avatars/patient.jpg",
    roleLabel: "بوابة المريض",
    profileHref: "/patient/profile",
  });

  useEffect(() => {
    // Determine role by context
    let currentRole = role;
    if (!currentRole) {
      if (pathname.startsWith("/doctor")) currentRole = "Doctor";
      else if (pathname.startsWith("/hospital")) currentRole = "Hospital";
      else if (pathname.startsWith("/admin")) currentRole = "Admin";
      else currentRole = "Patient";
    }

    let defaultAvatar = "/avatars/patient.jpg";
    let defaultLabel = "بوابة المريض";
    let defaultHref = "/patient/profile";

    if (currentRole === "Doctor") {
      defaultAvatar = "/avatars/doctor.jpg";
      defaultLabel = "بوابة الطبيب";
      defaultHref = "/doctor/account-settings";
    } else if (currentRole === "Hospital") {
      defaultAvatar = "/avatars/hospital.jpg";
      defaultLabel = "بوابة المستشفى";
      defaultHref = "/hospital/profile";
    } else if (currentRole === "Admin") {
      defaultAvatar = "/avatars/admin.jpg";
      defaultLabel = "بوابة الإدارة";
      defaultHref = "/admin/profile";
    }

    // Try reading cached name from sessionStorage for instant display
    const cachedName =
      typeof window !== "undefined"
        ? sessionStorage.getItem(`nabd_name_${currentRole}`)
        : null;

    setProfileData({
      name:
        cachedName ||
        (currentRole === "Doctor"
          ? "د. طبيب نبض"
          : currentRole === "Hospital"
          ? "مستشفى نبض"
          : currentRole === "Admin"
          ? "المشرف العام"
          : "المريض"),
      avatar: defaultAvatar,
      roleLabel: defaultLabel,
      profileHref: defaultHref,
    });

    // Fetch live name
    let cancelled = false;
    async function fetchName() {
      try {
        if (currentRole === "Patient") {
          const res = await getMyProfile();
          const p = res.data.patient;
          const fullName = [p.firstName, p.lastName].filter(Boolean).join(" ");
          if (!cancelled && fullName) {
            sessionStorage.setItem(`nabd_name_${currentRole}`, fullName);
            setProfileData((prev) => ({ ...prev, name: fullName }));
          }
        } else if (currentRole === "Doctor") {
          const res = await getDoctorMe();
          const d = res.data;
          const fullName =
            [d.firstName, d.lastName].filter(Boolean).join(" ") || d.userName;
          const formatted = fullName
            ? fullName.startsWith("د.")
              ? fullName
              : `د. ${fullName}`
            : "طبيب معالج";
          if (!cancelled && formatted) {
            sessionStorage.setItem(`nabd_name_${currentRole}`, formatted);
            setProfileData((prev) => ({ ...prev, name: formatted }));
          }
        } else if (currentRole === "Hospital") {
          const res = await getMyHospital();
          const h = res.data.hospital;
          const hName = h?.hospitalName || "مستشفى نبض";
          if (!cancelled && hName) {
            sessionStorage.setItem(`nabd_name_${currentRole}`, hName);
            setProfileData((prev) => ({ ...prev, name: hName }));
          }
        }
      } catch {
        // Fallbacks are already in place
      }
    }

    fetchName();
    return () => {
      cancelled = true;
    };
  }, [role, pathname]);

  return (
    <div className="flex min-h-screen">
      {/* ── Desktop Collapsible Sidebar ── */}
      <aside
        className={`hidden shrink-0 flex-col border-l py-4 transition-all duration-300 ease-in-out md:flex select-none sticky top-0 h-screen overflow-hidden ${
          isCollapsed ? "w-20 px-2.5 items-center" : "w-64 px-4"
        }`}
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-header-border)",
        }}
      >
        {/* Header: Logo + Smooth Collapse Toggle Button */}
        <div
          className={`flex items-center gap-2 mb-3 ${
            isCollapsed ? "flex-col justify-center" : "justify-between px-1"
          }`}
        >
          {!isCollapsed ? (
            <div className="min-w-0 overflow-hidden">
              <Logo size="sm" />
            </div>
          ) : (
            <div className="flex justify-center">
              <NabdLogoIcon size="sm" />
            </div>
          )}

          <button
            type="button"
            onClick={toggleCollapse}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-primary-soft hover:text-primary transition-colors focus:outline-none"
            title={isCollapsed ? "توسيع القائمة الجانبية" : "طي القائمة الجانبية"}
            aria-label={isCollapsed ? "توسيع القائمة الجانبية" : "طي القائمة الجانبية"}
          >
            <PanelToggleIcon isCollapsed={isCollapsed} />
          </button>
        </div>

        {/* ── Profile Section (Under Logo) ── */}
        <div className="mb-3 w-full">
          {!isCollapsed ? (
            <Link
              href={profileData.profileHref}
              prefetch
              className="group relative flex items-center gap-3 rounded-2xl p-2.5 transition-all duration-200 border border-border/40 bg-surface-raised/40 hover:bg-primary-soft/40 hover:border-primary/30 cursor-pointer shadow-xs"
              title={`${profileData.name} - ${profileData.roleLabel} (انقر لفتح الإعدادات)`}
            >
              {/* Avatar with Role Badge & Online Indicator */}
              <div className="relative shrink-0">
                <div className="h-11 w-11 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-md bg-slate-900 group-hover:border-primary transition-all">
                  <img
                    src={profileData.avatar}
                    alt={profileData.name}
                    className="h-full w-full object-cover select-none group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="absolute -bottom-0.5 -left-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-surface shadow-xs" />
              </div>

              {/* Name & Role Portal Badge (Clear, fits perfectly without truncation) */}
              <div className="flex flex-1 flex-col min-w-0 justify-center">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-sm text-text-primary truncate group-hover:text-primary transition-colors">
                    {profileData.name}
                  </span>
                  <span className="text-text-secondary group-hover:text-primary group-hover:rotate-45 transition-all duration-300 shrink-0">
                    <SettingsIcon />
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center text-[11px] font-semibold text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 shrink-0 whitespace-nowrap leading-tight">
                    {profileData.roleLabel}
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex justify-center w-full">
              <Link
                href={profileData.profileHref}
                prefetch
                className="group relative flex items-center justify-center p-1 rounded-2xl hover:bg-primary-soft/50 transition-colors"
                title={`${profileData.name} (${profileData.roleLabel}) - انقر للإعدادات`}
              >
                <div className="relative">
                  <div className="h-11 w-11 rounded-2xl overflow-hidden border-2 border-primary/40 shadow-md bg-slate-900 group-hover:border-primary transition-all group-hover:scale-105">
                    <img
                      src={profileData.avatar}
                      alt={profileData.name}
                      className="h-full w-full object-cover select-none"
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -left-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-surface" />
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* ── Navigation Links ── */}
        <nav className="flex flex-col gap-0.5 overflow-x-hidden w-full">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                title={isCollapsed ? item.label : undefined}
                className={`group relative flex items-center rounded-xl py-2.5 font-medium transition-all duration-200 ${
                  isCollapsed
                    ? "justify-center px-2 text-base"
                    : "justify-start px-3.5 gap-3 text-sm"
                } ${
                  active
                    ? "bg-primary-soft text-primary shadow-xs font-semibold"
                    : "text-text-secondary hover:bg-primary-soft/50 hover:text-text-primary"
                }`}
              >
                <span
                  className={`shrink-0 transition-transform duration-200 ${
                    active ? "scale-110 text-primary" : "group-hover:scale-105"
                  }`}
                >
                  {item.icon}
                </span>

                {!isCollapsed && (
                  <span className="truncate whitespace-nowrap">
                    {item.label}
                  </span>
                )}

                {/* Subtle active indicator marker */}
                {active && (
                  <span
                    className={`absolute rounded-full bg-primary ${
                      isCollapsed
                        ? "right-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-l-full"
                        : "right-1 top-1/2 -translate-y-1/2 h-5 w-1 rounded-l-full"
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom Section: Theme Toggle & Logout ── */}
        <div
          className={`mt-3 pt-3 border-t border-border/50 flex flex-col gap-1.5 w-full ${
            isCollapsed ? "items-center" : ""
          }`}
        >
          {/* Mode switch inside sidebar */}
          {!isCollapsed ? (
            <div className="flex items-center justify-between rounded-xl px-3 py-2 bg-surface-raised/60 border border-border/40 text-xs font-semibold text-text-secondary">
              <div className="flex items-center gap-2">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
                <span>المظهر</span>
              </div>
              <ThemeToggle />
            </div>
          ) : (
            <div className="flex justify-center w-full" title="تبديل الوضع الليلي / النهاري">
              <ThemeToggle compact />
            </div>
          )}

          {/* Logout Button */}
          {!isCollapsed ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="justify-start text-text-secondary hover:text-danger hover:bg-danger/10 w-full rounded-xl py-2.5"
            >
              <LogoutIcon />
              <span>تسجيل الخروج</span>
            </Button>
          ) : (
            <button
              onClick={logout}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors"
              title="تسجيل الخروج"
              aria-label="تسجيل الخروج"
            >
              <LogoutIcon />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main Content Area (Topbar header removed for full spacious desktop view) ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile-only Top Bar (Clean & minimalist, without the removed elements) */}
        <div
          className="flex items-center justify-between px-4 py-3 md:hidden border-b shrink-0"
          style={{
            background: "var(--color-header-bg)",
            borderBottomColor: "var(--color-header-border)",
          }}
        >
          <button
            className="flex items-center justify-center h-9 w-9 shrink-0 rounded-xl text-text-secondary hover:bg-primary-soft/50 hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="فتح القائمة"
          >
            <MenuIcon />
          </button>
          <Logo size="sm" />
          <div className="w-9" />
        </div>

        {/* Mobile Drawer Overlay */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-bg/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <div
              className="fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] px-4 py-6 flex flex-col gap-4 md:hidden animate-slide-in-right shadow-2xl"
              style={{
                background: "var(--color-surface)",
                borderLeft: "1px solid var(--color-header-border)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <Logo size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-9 w-9 flex items-center justify-center rounded-xl text-text-secondary hover:bg-primary-soft/50 shrink-0"
                  aria-label="إغلاق"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Mobile Profile Card */}
              <Link
                href={profileData.profileHref}
                prefetch
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl p-2.5 border border-border/50 bg-surface-raised/50"
              >
                <div className="relative shrink-0">
                  <div className="h-11 w-11 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-md bg-slate-900">
                    <img
                      src={profileData.avatar}
                      alt={profileData.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -left-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-surface" />
                </div>
                <div className="flex flex-1 flex-col min-w-0 text-right leading-tight">
                  <span className="font-bold text-sm text-text-primary truncate">
                    {profileData.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-primary/10 text-primary border border-primary/20 truncate">
                      {profileData.roleLabel}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Mobile Navigation */}
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto mt-2">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-primary-soft text-primary shadow-xs font-semibold"
                          : "text-text-secondary hover:bg-primary-soft/50 hover:text-text-primary"
                      }`}
                    >
                      <span className={active ? "scale-110 text-primary" : ""}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Drawer Bottom */}
              <div className="pt-3 border-t border-border/50 flex flex-col gap-2">
                <div className="flex items-center justify-between rounded-xl px-3 py-2 bg-surface-raised/60 border border-border/40 text-xs font-semibold text-text-secondary">
                  <span>المظهر</span>
                  <ThemeToggle />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="justify-start text-text-secondary hover:text-danger hover:bg-danger/10 w-full rounded-xl py-2.5"
                >
                  <LogoutIcon />
                  <span>تسجيل الخروج</span>
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Page Content */}
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 pb-24 md:pb-8 min-w-0">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav
        className="fixed bottom-0 inset-x-0 z-30 flex md:hidden backdrop-blur-xl border-t shadow-[0_-4px_16px_rgba(0,0,0,0.06)] safe-area-pb"
        style={{
          background: "var(--color-header-bg)",
          borderTopColor: "var(--color-header-border)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {navItems.slice(0, 5).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[9px] sm:text-[10px] font-semibold transition-colors ${
                active
                  ? "text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <span
                className={`transition-transform duration-200 ${
                  active ? "scale-110" : ""
                }`}
              >
                {item.icon}
              </span>
              <span className="truncate max-w-[60px] text-center leading-tight">
                {item.label}
              </span>
              {active && (
                <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/* ── Icon helpers ── */
function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PanelToggleIcon({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 ${
        isCollapsed ? "rotate-180" : ""
      }`}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      <path d="m14 9-3 3 3 3" />
    </svg>
  );
}
