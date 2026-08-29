"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

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
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden w-64 shrink-0 flex-col border-l px-4 py-6 md:flex"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-header-border)",
        }}
      >
        <div className="px-2">
          <Logo size="sm" />
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-250 ease-spring ${
                  active
                    ? "bg-primary-soft text-primary shadow-sm"
                    : "text-text-secondary hover:bg-primary-soft/50 hover:text-text-primary"
                }`}
              >
                <span className={`transition-transform duration-250 ease-spring ${active ? "scale-110" : "group-hover:scale-105"}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="justify-start text-text-secondary hover:text-danger"
        >
          <LogoutIcon />
          تسجيل الخروج
        </Button>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <header
          className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 backdrop-blur-sm sticky top-0 z-20"
          style={{
            background: "var(--color-header-bg)",
            borderBottom: "1px solid var(--color-header-border)",
          }}
        >
          {/* Mobile: hamburger + title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              className="flex md:hidden items-center justify-center h-9 w-9 shrink-0 rounded-xl text-text-secondary hover:bg-primary-soft/50 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <h1 className="font-display text-sm sm:text-base md:text-lg font-bold text-text-primary truncate">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile logout */}
            <button
              className="flex md:hidden items-center justify-center h-9 w-9 shrink-0 rounded-xl text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors"
              onClick={logout}
              aria-label="تسجيل الخروج"
            >
              <LogoutIcon />
            </button>
            <div className="shrink-0 scale-90 sm:scale-100 origin-left">
              <ThemeToggle />
            </div>
          </div>
        </header>

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
              <div className="flex items-center justify-between mb-2">
                <Logo size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-9 w-9 flex items-center justify-center rounded-xl text-text-secondary hover:bg-primary-soft/50 shrink-0"
                >
                  <CloseIcon />
                </button>
              </div>

              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-primary-soft text-primary shadow-sm"
                          : "text-text-secondary hover:bg-primary-soft/50 hover:text-text-primary"
                      }`}
                    >
                      <span className={active ? "scale-110" : ""}>{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="justify-start text-text-secondary hover:text-danger w-full"
              >
                <LogoutIcon />
                تسجيل الخروج
              </Button>
            </div>
          </>
        )}

        {/* Page Content */}
        <main className="flex-1 px-3.5 py-4 sm:px-4 sm:py-4 md:px-6 md:py-6 pb-28 md:pb-6">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav
        className="fixed bottom-0 inset-x-0 z-30 flex md:hidden backdrop-blur-xl border-t shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
        style={{
          background: "var(--color-header-bg)",
          borderTopColor: "var(--color-header-border)",
        }}
      >
        {navItems.slice(0, 4).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-colors ${
                active
                  ? "text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <span className={`transition-transform duration-200 ${active ? "scale-110" : ""}`}>
                {item.icon}
              </span>
              <span className="truncate max-w-[70px] text-center">{item.label}</span>
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
