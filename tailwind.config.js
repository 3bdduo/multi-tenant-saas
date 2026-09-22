/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: {
          DEFAULT: "var(--color-surface)",
          raised: "var(--color-surface-raised)",
        },
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-card-foreground)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          light: "var(--color-primary-light)",
          soft: "var(--color-primary-soft)",
          foreground: "var(--color-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover: "var(--color-secondary-hover)",
          soft: "var(--color-secondary-soft)",
          foreground: "var(--color-secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          soft: "var(--color-accent-soft)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-foreground)",
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
          hover: "var(--color-destructive-hover)",
          foreground: "var(--color-destructive-foreground)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          subtle: "var(--border-subtle)",
          hover: "var(--color-border-hover)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        mint: "var(--color-mint)",
        header: "var(--color-header-bg)",
      },
      borderRadius: {
        "3xl": "1.5rem",
        "2xl": "1.25rem",
        card: "1.5rem",
        btn: "10px",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        brush: ["var(--font-brush)", "var(--font-display)", "sans-serif"],
      },
      boxShadow: {
        DEFAULT: "var(--shadow-sm)",
        xs: "var(--shadow-sm)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        card: "var(--card-shadow)",
        glow: "var(--shadow-glow)",
        "glow-cyan": "var(--shadow-glow-cyan)",
        "glow-emerald": "var(--shadow-glow-emerald)",
        "glow-amber": "var(--shadow-glow-amber)",
      },
      transitionTimingFunction: {
        silky: "cubic-bezier(0.16, 1, 0.3, 1)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        spring: "cubic-bezier(0.34, 1.4, 0.64, 1)",
        calm: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        180: "180ms",
        280: "280ms",
        350: "350ms",
        450: "450ms",
        600: "600ms",
        800: "800ms",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translate(0px, 0px) scale(1) rotate(0deg)" },
          "33%": { transform: "translate(30px, -20px) scale(1.08) rotate(3deg)" },
          "66%": { transform: "translate(-20px, 15px) scale(0.95) rotate(-3deg)" },
          "100%": { transform: "translate(0px, 0px) scale(1) rotate(0deg)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "0.75", transform: "scale(1.1)" },
        },
        "fade-in-slow": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in-slow": {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-scale-out": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(1.05)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.7" },
          "50%": { transform: "scale(1.12)", opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.88)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.8", transform: "scale(0.95)", filter: "drop-shadow(0 0 10px rgba(var(--color-primary-rgb), 0.5))" },
          "50%": { opacity: "1", transform: "scale(1.15)", filter: "drop-shadow(0 0 25px rgba(var(--color-primary-rgb), 0.9))" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "ecg-pulse": {
          "0%": { strokeDasharray: "0 500", strokeDashoffset: "0" },
          "50%": { strokeDasharray: "250 500", strokeDashoffset: "-100" },
          "100%": { strokeDasharray: "500 500", strokeDashoffset: "-500" },
        },
        "ecg-scan": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        drift: "drift 20s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "pulse-slow": "pulse-slow 7s ease-in-out infinite",
        "fade-in-slow": "fade-in-slow 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in-slow": "scale-in-slow 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.5s ease both",
        "fade-scale-out": "fade-scale-out 0.5s cubic-bezier(0.4,0,0.2,1) forwards",
        breathe: "breathe 3s ease-in-out infinite",
        "scale-in": "scale-in 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float-slow": "float-slow 4s ease-in-out infinite",
        "ecg-pulse": "ecg-pulse 1.2s ease-in-out infinite",
        "ecg-scan": "ecg-scan 1.5s linear infinite",
        "slide-down": "slide-down 0.25s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};
