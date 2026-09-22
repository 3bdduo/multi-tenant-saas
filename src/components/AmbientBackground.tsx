/**
 * Medical icon particles — drawn as inline SVG (no image assets needed).
 * Extremely low opacity, aria-hidden, and animate on transform/opacity only
 * so they're cheap to render and never affect click responsiveness.
 */
function HeartbeatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function CrossIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 4v16M4 12h16" />
    </svg>
  );
}

function DnaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className={className}>
      <path d="M6 3c0 5 12 5 12 9s-12 4-12 9" />
      <path d="M18 3c0 5-12 5-12 9s12 4 12 9" />
      <path d="M7.5 8h9M7.5 16h9" />
    </svg>
  );
}

function PillIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)" />
      <path d="M9 9l6 6" />
    </svg>
  );
}

function StethoscopeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 3v6a4 4 0 0 0 8 0V3" />
      <path d="M17 3v5a4 4 0 0 1-4 4" />
      <circle cx="19" cy="16" r="2.5" />
    </svg>
  );
}

const PARTICLES: {
  Icon: (p: { className?: string }) => JSX.Element;
  style: React.CSSProperties;
  size: number;
  cls: "particle-a" | "particle-b";
  delay: string;
}[] = [
    { Icon: HeartbeatIcon, style: { left: "8%", top: "70%" }, size: 30, cls: "particle-a", delay: "0s" },
    { Icon: CrossIcon, style: { left: "18%", top: "30%" }, size: 22, cls: "particle-b", delay: "-4s" },
    { Icon: DnaIcon, style: { right: "12%", top: "60%" }, size: 34, cls: "particle-a", delay: "-8s" },
    { Icon: PillIcon, style: { right: "22%", top: "20%" }, size: 24, cls: "particle-b", delay: "-2s" },
    { Icon: StethoscopeIcon, style: { left: "45%", top: "80%" }, size: 28, cls: "particle-a", delay: "-11s" },
    { Icon: HeartbeatIcon, style: { right: "6%", top: "38%" }, size: 20, cls: "particle-b", delay: "-6s" },
  ];

export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Teal key light — top-left, drifting */}
      <div className="cine-orb cine-orb-teal" />

      {/* Orange kicker light — bottom-right, drifting */}
      <div className="cine-orb cine-orb-orange" />

      {/* Vital-signs green + steel-blue accents, drifting independently */}
      <div className="cine-orb cine-orb-vital" />
      <div className="cine-orb cine-orb-steel" />

      {/* Soft breathing core behind the content — faster "pulse" now */}
      <div className="cine-orb cine-orb-core" />

      {/* Medical monitor scan sweep, passing top to bottom on a loop */}
      <div className="cine-monitor-sweep" />

      {/* Anamorphic lens streak (mostly a dark-mode effect via tokens) */}
      <div className="cine-streak" style={{ animationDelay: "-4s" }} />

      {/* Drifting medical icon particles — heartbeat, cross, DNA, pill, stethoscope */}
      {PARTICLES.map(({ Icon, style, size, cls, delay }, i) => (
        <div
          key={i}
          className={`cine-particle ${cls}`}
          style={{ ...style, width: size, height: size, animationDelay: delay }}
        >
          <Icon className="w-full h-full" />
        </div>
      ))}

      {/* Film look: edge vignette + fine grain, both very subtle */}
      <div className="cine-vignette" />
      <div className="cine-grain" />
    </div>
  );
}
