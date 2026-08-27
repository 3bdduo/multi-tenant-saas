"use client";

import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      role="switch"
      dir="ltr"
      aria-checked={isDark}
      aria-label={isDark ? "التبديل إلى الوضع النهاري" : "التبديل إلى الوضع الليلي"}
      className={`
        relative inline-flex h-[34px] w-[64px] shrink-0 cursor-pointer items-center rounded-full
        p-[3px] transition-colors duration-300 ease-in-out select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        ${isDark ? "bg-[#1E293B] border border-[#334155]" : "bg-[#BDE3FA] border border-[#A6D5F5]"}
      `}
    >
      {/* ── Background Icons inside track ── */}
      <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none">
        {/* Moon icon on the Left (visible in dark mode) */}
        <span
          className={`flex items-center justify-center transition-all duration-300 ${
            isDark ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="#E2E8F0"
            stroke="none"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        </span>

        {/* Sun icon on the Right (visible in light mode - matching reference image) */}
        <span
          className={`flex items-center justify-center transition-all duration-300 ${
            !isDark ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#78889B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Center filled circle */}
            <circle cx="12" cy="12" r="4.5" fill="#78889B" />
            {/* 8 rays around */}
            <line x1="12" y1="2" x2="12" y2="4.5" />
            <line x1="12" y1="19.5" x2="12" y2="22" />
            <line x1="2" y1="12" x2="4.5" y2="12" />
            <line x1="19.5" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="4.93" x2="6.7" y2="6.7" />
            <line x1="17.3" y1="17.3" x2="19.07" y2="19.07" />
            <line x1="4.93" y1="19.07" x2="6.7" y2="17.3" />
            <line x1="17.3" y1="6.7" x2="19.07" y2="4.93" />
          </svg>
        </span>
      </div>

      {/* ── Sliding Circular Knob ── */}
      <span
        className={`
          inline-block h-[26px] w-[26px] transform rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.2)]
          transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isDark ? "translate-x-[30px]" : "translate-x-0"}
        `}
      />
    </button>
  );
}
