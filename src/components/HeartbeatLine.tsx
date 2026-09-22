/**
 * Decorative heartbeat trace — a soft teal→orange pulse that travels along an
 * ECG line, with a glowing blip riding it like a vitals monitor. Purely
 * visual (aria-hidden); respects prefers-reduced-motion.
 */
export function HeartbeatLine({ className = "" }: { className?: string }) {
  const TRACE = "M0 30 H140 L156 30 L168 12 L184 52 L200 4 L214 38 L222 30 H400";

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 60"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="hb-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
          <stop offset="50%" stopColor="var(--color-primary-light)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* faint base trace */}
      <path
        d={TRACE}
        stroke="var(--color-primary)"
        strokeOpacity="0.16"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* travelling pulse */}
      <path
        d={TRACE}
        pathLength={1}
        stroke="url(#hb-line-gradient)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="hb-pulse"
        style={{ filter: "drop-shadow(0 0 5px rgba(var(--color-primary-rgb), 0.75))" }}
      />

      {/* glowing blip riding the same path, like a monitor's live marker */}
      <circle r="4.5" fill="var(--color-primary-light)" className="hb-blip">
        <animateMotion dur="2.1s" repeatCount="indefinite" path={TRACE} />
      </circle>
    </svg>
  );
}
