"use client";

interface ArcLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function ArcLogo({ className = "", size = "md", showText = true }: ArcLogoProps) {
  const iconSizes = {
    sm: "h-9 w-9",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* ARC Emblem styled to match Nabd medical cyan/mint gradient */}
      <div
        className={`relative flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary-light to-accent p-2.5 shadow-glow-cyan transition-transform duration-300 hover:scale-105 ${iconSizes[size]}`}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          className="h-full w-full drop-shadow-md text-slate-950 dark:text-slate-950"
        >
          {/* Futuristic Arc Curved Ring */}
          <path
            d="M8 28C6 24 6 16 11 11C16 6 24 6 29 11C34 16 34 24 32 28"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Internal A-shaped Arc Peak */}
          <path
            d="M13 28L20 12L27 28"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Horizon bar with heartbeat pulse dot */}
          <path
            d="M16 22H24"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="20" cy="22" r="2" fill="var(--color-surface, #FFFFFF)" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1.5">
            <span className={`font-display font-extrabold tracking-tight gradient-text-alive ${textSizes[size]}`}>
              ARC
            </span>
            <span className="font-display font-bold text-xs px-1.5 py-0.5 rounded-md bg-accent/10 text-accent border border-accent/20">
              Community
            </span>
          </div>
          <span className="text-[10px] font-semibold text-text-secondary tracking-wide">
            مجتمع ARC التكنولوجي
          </span>
        </div>
      )}
    </div>
  );
}
