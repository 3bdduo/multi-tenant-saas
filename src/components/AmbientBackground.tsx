export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Teal key light — top-left, slowly drifting */}
      <div className="cine-orb cine-orb-teal" />

      {/* Orange kicker light — bottom-right, drifting the other way */}
      <div className="cine-orb cine-orb-orange" />

      {/* Soft breathing core behind the content */}
      <div className="cine-orb cine-orb-core" />

      {/* Anamorphic lens streak (dark mode only — hidden in light via tokens) */}
      <div className="cine-streak" style={{ animationDelay: "-4s" }} />

      {/* Film look: edge vignette + fine grain, both very subtle */}
      <div className="cine-vignette" />
      <div className="cine-grain" />
    </div>
  );
}
