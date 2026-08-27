import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "vibrant" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  // ── 1. Primary Button (Dark Gray in Light Mode, Light Gray in Dark Mode) ──
  // Tactile 3D: Top specular highlight, subtle satin vertical gradient, outer rim border, rich drop shadow, physical press
  primary:
    "bg-gradient-to-b from-[#3A4350] via-[#242A34] to-[#161B22] dark:from-[#FFFFFF] dark:via-[#ECEFF4] dark:to-[#D8E0EB] text-white dark:text-[#111827] font-bold border border-[#161B22] dark:border-white/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.30),inset_0_-1px_0_0_rgba(0,0,0,0.35),0_2px_4px_0_rgba(0,0,0,0.18),0_4px_14px_0_rgba(20,25,32,0.35)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,1),inset_0_-1px_0_0_rgba(0,0,0,0.08),0_2px_6px_0_rgba(0,0,0,0.5),0_4px_20px_0_rgba(255,255,255,0.22)] hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.40),0_6px_20px_0_rgba(20,25,32,0.45)] dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_6px_24px_0_rgba(255,255,255,0.32)] active:translate-y-[1px] active:scale-[0.98] active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.45),0_1px_2px_0_rgba(0,0,0,0.1)]",

  // ── 2. Secondary Button (Matching "+ Create" in Image) ──
  // Tactile Clean Surface: Crisp top specular highlight, subtle light-to-light-gray gradient, soft drop shadow
  secondary:
    "bg-gradient-to-b from-[#FFFFFF] to-[#FAF5EE] dark:from-[#374151] dark:to-[#242A33] text-[#2D231F] dark:text-[#F1F4F8] font-semibold border border-[#E5D6C8] dark:border-[#4B5563] shadow-[inset_0_1px_0_0_rgba(255,255,255,1),inset_0_-1px_0_0_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.06),0_2px_6px_0_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_0_0_rgba(241,244,248,0.15),inset_0_-1px_0_0_rgba(0,0,0,0.4),0_2px_6px_0_rgba(0,0,0,0.5)] hover:bg-gradient-to-b hover:from-[#FFFFFF] hover:to-[#F3EAE0] dark:hover:from-[#475569] dark:hover:to-[#2D3748] hover:border-[#CDB9A8] dark:hover:border-[#64748B] hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[0.98]",

  // ── 3. Vibrant: Rich Gradient with Warm Neutrals / Slate fusion & 3D bevel ──
  vibrant:
    "bg-gradient-to-b from-[#C48B71] via-[#B87D65] to-[#969A83] dark:from-[#E6396E] dark:via-[#BA2654] dark:to-[#475569] text-white font-bold border border-[#8C5540]/60 dark:border-[#E6396E]/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.40),inset_0_-1px_0_0_rgba(0,0,0,0.18),0_2px_4px_0_rgba(0,0,0,0.08),0_4px_14px_0_rgba(184,125,101,0.30)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_4px_16px_rgba(186,38,84,0.4)] hover:brightness-105 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.50),0_6px_18px_0_rgba(184,125,101,0.40)] active:translate-y-[1px] active:scale-[0.98] active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)]",

  // ── 4. Outline: Tactile Border with subtle fill ──
  outline:
    "bg-transparent text-text-primary dark:text-[#F1F4F8] font-semibold border border-border dark:border-[#3B4554] hover:border-primary dark:hover:border-[#64748B] hover:bg-primary-soft dark:hover:bg-[#333C48]/40 hover:text-primary hover:-translate-y-0.5 shadow-sm active:translate-y-[1px] active:scale-[0.98]",

  // ── 5. Ghost: Minimalist clean typography ──
  ghost:
    "bg-transparent text-text-secondary dark:text-[#A6B2C3] font-medium hover:text-primary dark:hover:text-[#F1F4F8] hover:bg-primary-soft dark:hover:bg-[#333C48]/30 hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[0.98]",

  // ── 6. Destructive / Danger: 3D Red tactile button ──
  danger:
    "bg-gradient-to-b from-[#DC4545] via-[#CC3D3D] to-[#A82E2E] dark:from-[#F25C68] dark:via-[#E63946] dark:to-[#C1121F] text-white dark:text-[#FFFFFF] font-bold border border-red-700/60 dark:border-red-500/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.38),inset_0_-1px_0_0_rgba(0,0,0,0.22),0_2px_4px_0_rgba(0,0,0,0.1),0_4px_12px_0_rgba(204,61,61,0.3)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_4px_16px_0_rgba(230,57,70,0.4)] hover:brightness-105 hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[0.98] active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)]",
};

// Sleek modern radius with generous padding for Arabic text readability
const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-5 text-sm gap-1.5 rounded-[8px]",
  md: "h-10 px-6 text-sm gap-2 rounded-[10px]",
  lg: "h-12 px-9 text-base gap-2.5 rounded-[11px]",
  icon: "h-9 w-9 p-0 rounded-[9px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`group relative inline-flex items-center justify-center font-medium select-none cursor-pointer
          transition-all duration-150 ease-out
          disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none disabled:transform-none disabled:shadow-none
          ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {/* Animated Loading Spinner with Zero Layout Shift */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-[inherit]">
            <svg
              className="h-4 w-4 animate-spin text-current opacity-90"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-25"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-90"
              />
            </svg>
          </span>
        )}
        <span className={`inline-flex items-center gap-2 transition-opacity duration-150 ${loading ? "opacity-0 invisible" : "opacity-100"}`}>
          {children}
        </span>
      </button>
    );
  }
);
Button.displayName = "Button";

