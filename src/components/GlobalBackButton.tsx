"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/Button";

export function GlobalBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide on the home page
  if (pathname === "/") return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-scale-in-slow hover:animate-float-slow group">
      <Button
        variant="secondary"
        size="md"
        onClick={() => router.back()}
        className="rounded-full shadow-lg border-primary/20 backdrop-blur-md bg-surface/80 pl-4 pr-5 gap-2 text-text-secondary hover:text-primary transition-all duration-300"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-300 group-hover:-translate-x-1"
        >
          <polyline points="10 18 16 12 10 6" />
        </svg>
        <span className="font-bold text-sm">رجوع</span>
      </Button>
    </div>
  );
}
