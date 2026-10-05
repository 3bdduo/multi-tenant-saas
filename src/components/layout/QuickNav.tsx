"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   QuickNav — small Home + Back buttons
   RTL-first: Back icon points inline-end (→ in RTL = "back" direction).
───────────────────────────────────────────────────────────────────────────── */
export function QuickNav({ className = "mb-5" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  // Never show on the root home page itself
  if (pathname === "/") return null;

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Home button */}
      <Link
        href="/"
        title="الرئيسية"
        aria-label="الرئيسية"
        className="group inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-surface-raised/80 px-3 py-1.5 text-xs font-semibold text-text-secondary backdrop-blur-md transition-all duration-150 hover:border-primary/40 hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-primary shadow-xs select-none"
      >
        <HomeNavIcon />
        <span>الرئيسية</span>
      </Link>

      {/* Back button */}
      <button
        type="button"
        onClick={handleBack}
        title="رجوع للصفحة السابقة"
        aria-label="رجوع للصفحة السابقة"
        className="group inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-surface-raised/80 px-3 py-1.5 text-xs font-semibold text-text-secondary backdrop-blur-md transition-all duration-150 hover:border-primary/40 hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-primary shadow-xs select-none cursor-pointer"
      >
        {/* In RTL: ChevronRight (→) = "go back". Points inline-end. */}
        <BackNavIcon />
        <span>رجوع</span>
      </button>
    </div>
  );
}

function HomeNavIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BackNavIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
