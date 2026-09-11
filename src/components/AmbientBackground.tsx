

export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Top-Right: Ocean Cyan & Sky Blue Glow (light) / Warm Charcoal hint (dark) */}
      <div className="gpu absolute -right-36 -top-36 h-[48rem] w-[48rem] rounded-full bg-gradient-to-br from-cyan-400/18 via-sky-400/12 to-transparent blur-[140px] motion-safe:animate-drift dark:from-stone-700/25 dark:via-stone-800/15" />

      {/* Bottom-Left: Soft Emerald & Teal Glow (light) / Warm Brown hint (dark) */}
      <div
        className="gpu absolute -bottom-40 -left-40 h-[46rem] w-[46rem] rounded-full bg-gradient-to-tr from-emerald-400/16 via-teal-400/12 to-transparent blur-[140px] motion-safe:animate-drift dark:from-amber-900/22 dark:via-yellow-900/15"
        style={{ animationDelay: "-9s" }}
      />

      {/* Center Ambient: Cyan to Green (light) / Gray-brown warmth (dark) */}
      <div
        className="gpu absolute left-1/2 top-1/3 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-300/14 via-sky-300/10 to-emerald-300/10 blur-[130px] motion-safe:animate-pulse-slow dark:from-stone-600/18 dark:via-amber-900/14 dark:to-stone-700/12"
        style={{ animationDelay: "-4s" }}
      />
    </div>
  );
}
