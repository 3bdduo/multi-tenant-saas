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
    <div className="fixed top-4 right-4 sm:top-5 sm:right-6 z-40 animate-fade-in pointer-events-auto">
      <button
        type="button"
        onClick={() => router.back()}
        className="group flex items-center gap-1.5 sm:gap-2 rounded-full border border-border/80 bg-surface/90 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-extrabold text-text-primary shadow-md backdrop-blur-xl transition-all duration-200 hover:border-primary/50 hover:bg-surface hover:text-primary hover:shadow-glow-cyan focus:outline-none"
        title="الرجوع للصفحة السابقة"
      >
        <svg
          width="15"
          height="15"
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
