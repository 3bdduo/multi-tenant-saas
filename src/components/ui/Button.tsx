import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "vibrant" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  // All variants: gray-700 + white text (light) / gray-200 + dark text (dark)
  // Hover NEVER changes background color, text color, or border color

  primary:
    "bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-900 font-bold border border-gray-600 dark:border-gray-300 shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[0.98]",

  secondary:
    "bg-gray-600 text-white dark:bg-gray-300 dark:text-gray-900 font-semibold border border-gray-500 dark:border-gray-400 shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[0.98]",

  vibrant:
    "bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-900 font-extrabold border border-gray-600 dark:border-gray-300 shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[0.98]",

  outline:
    "bg-transparent text-gray-800 dark:text-gray-200 font-semibold border border-gray-500 dark:border-gray-500 hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[0.98]",

  ghost:
    "bg-transparent text-gray-700 dark:text-gray-300 font-medium hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[0.98]",

  danger:
    "bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-900 font-bold border border-gray-600 dark:border-gray-300 shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[0.98]",
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
        <span className={`inline-flex items-center justify-center gap-2 w-full text-center leading-normal transition-opacity duration-150 ${loading ? "opacity-0 invisible" : "opacity-100"}`}>
          {children}
        </span>
      </button>
    );
  }
);
Button.displayName = "Button";

