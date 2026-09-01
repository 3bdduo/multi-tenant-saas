

export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {}
      <div className="gpu absolute -right-36 -top-36 h-[46rem] w-[46rem] rounded-full bg-gradient-to-br from-primary/15 via-primary/10 to-transparent blur-[130px] motion-safe:animate-drift dark:from-primary/20 dark:via-primary/15" />

      {}
      <div
        className="gpu absolute -bottom-40 -left-40 h-[44rem] w-[44rem] rounded-full bg-gradient-to-tr from-secondary/15 via-secondary/10 to-transparent blur-[130px] motion-safe:animate-drift dark:from-secondary/20 dark:via-secondary/15"
        style={{ animationDelay: "-9s" }}
      />

      {}
      <div
        className="gpu absolute left-1/3 top-1/4 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 blur-[120px] motion-safe:animate-pulse-slow dark:from-primary/15 dark:via-accent/15"
        style={{ animationDelay: "-4s" }}
      />
    </div>
  );
}
