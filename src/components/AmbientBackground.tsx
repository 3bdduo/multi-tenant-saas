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

      {/* Film look: edge vignette + fine grain, both very subtle */}
      <div className="cine-vignette" />
      <div className="cine-grain" />
    </div>
  );
}
