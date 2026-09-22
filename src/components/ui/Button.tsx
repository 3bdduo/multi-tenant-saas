import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "vibrant" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  // Cinematic palette: teal = primary, orange = vibrant, tinted-glass = secondary.
  // Hover NEVER changes background color, text color, or border color —
  // it only lifts the button and blooms a soft colored glow.

  primary:
    "bg-primary text-surface font-bold border border-primary/60 shadow-[0_6px_18px_-8px_rgba(var(--color-primary-rgb),0.55)] hover:shadow-[0_12px_28px_-8px_rgba(var(--color-primary-rgb),0.7)] hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[0.98]",

  secondary:
    "bg-primary/10 text-primary font-semibold border border-primary/40 hover:shadow-[0_10px_24px_-10px_rgba(var(--color-primary-rgb),0.55)] hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[0.98]",

  vibrant:
    "bg-accent text-surface font-extrabold border border-accent/60 shadow-[0_6px_18px_-8px_rgba(var(--color-accent-rgb),0.6)] hover:shadow-[0_12px_28px_-8px_rgba(var(--color-accent-rgb),0.75)] hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[0.98]",

  outline:
    "bg-transparent text-text-primary font-semibold border border-text-secondary/40 hover:shadow-[0_8px_22px_-10px_rgba(var(--color-primary-rgb),0.45)] hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[0.98]",

  ghost:
    "bg-transparent text-text-secondary font-medium hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[0.98]",

  danger:
    "bg-danger text-surface font-bold border border-danger/60 shadow-[0_6px_18px_-8px_rgba(var(--color-danger-rgb),0.55)] hover:shadow-[0_12px_28px_-8px_rgba(var(--color-danger-rgb),0.7)] hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[0.98]",
};



const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "min-h-[38px] sm:min-h-[40px] px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-bold gap-1.5 rounded-xl whitespace-nowrap shrink-0 text-center",
  md: "min-h-[42px] sm:min-h-[44px] px-4.5 sm:px-5 py-2 text-sm font-bold gap-2 rounded-xl whitespace-nowrap shrink-0 text-center",
  lg: "min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-2.5 text-sm sm:text-base font-extrabold gap-2.5 rounded-2xl shrink-0 text-center",
  icon: "min-h-[40px] min-w-[40px] h-10 w-10 sm:h-11 sm:w-11 p-2 rounded-xl shrink-0 flex items-center justify-center text-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`group relative inline-flex items-center justify-center text-center font-medium select-none cursor-pointer
          transition-[transform,box-shadow] duration-100 ease-out
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
        <span className={`inline-flex items-center justify-center gap-2 w-full text-center leading-normal transition-opacity duration-150 ${loading ? "opacity-0 invisible" : "opacity-100"}`}>
          {children}
        </span>
      </button>
    );
  }
);
Button.displayName = "Button";

