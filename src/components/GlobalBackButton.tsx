"use client";

import { usePathname, useRouter } from "next/navigation";

export function GlobalBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  // Exclude root and all dashboard sections since they have dedicated navigation and in-flow headers
  if (
    pathname === "/" ||
    pathname.startsWith("/doctor") ||
    pathname.startsWith("/patient") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/hospital") ||
    pathname.startsWith("/emergency-report") ||
    pathname.startsWith("/emergency-track")
  ) {
    return null;
  }

  return (
    <div className="fixed top-3 left-4 sm:top-4 sm:left-6 z-40 animate-fade-in pointer-events-auto">
      <button
        type="button"
        onClick={() => router.back()}
        className="group flex min-h-[40px] items-center gap-2 rounded-full border border-border/80 bg-surface/95 px-4 py-2 text-xs sm:text-sm font-extrabold text-text-primary shadow-lg backdrop-blur-xl transition-all duration-200 hover:border-primary/50 hover:bg-surface hover:text-primary hover:shadow-glow-cyan active:scale-95 focus:outline-none"
        title="الرجوع للصفحة السابقة"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span>رجوع</span>
      </button>
    </div>
  );
}
