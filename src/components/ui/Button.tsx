import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "vibrant" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-gradient-to-r from-primary via-primary-light to-accent text-slate-950 font-bold shadow-md hover:shadow-glow hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
  vibrant:
    "bg-gradient-to-r from-cyan-400 via-primary to-emerald-400 text-slate-950 font-extrabold shadow-glow-cyan hover:shadow-glow-emerald hover:brightness-115 hover:-translate-y-0.5 active:scale-[0.98]",
  secondary: 
    "bg-surface/90 text-text-primary border border-border/80 hover:border-primary/50 hover:bg-primary-soft hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",
  outline:
    "bg-transparent text-text-primary border border-border/80 hover:border-primary/50 hover:bg-primary-soft hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",
  ghost:
    "bg-transparent text-text-secondary hover:text-primary hover:bg-primary-soft hover:-translate-y-0.5 active:scale-[0.98]",
  danger:
    "bg-gradient-to-r from-danger to-rose-600 text-white shadow-md hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.98]",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-4 text-xs gap-1.5 rounded-xl",
  md: "h-11 px-6 text-sm gap-2 rounded-xl",
  lg: "h-12 px-8 text-base gap-2.5 rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`group relative inline-flex items-center justify-center font-medium transition-all duration-450 ease-silky disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin text-current"
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
              className="opacity-80"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
