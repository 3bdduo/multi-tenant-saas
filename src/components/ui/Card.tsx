import { HTMLAttributes } from "react";

export function Card({
  className = "",
  hover = false,
  glass = false,
  vibrant = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { hover?: boolean; glass?: boolean; vibrant?: boolean }) {
  return (
    <div
      className={`
        cine-rim rounded-2xl border border-border/80 bg-surface p-6 shadow-sm
        transition-all duration-280 ease-smooth
        ${glass ? "glass-alive" : ""}
        ${vibrant ? "hover:border-primary/60 hover:shadow-glow" : ""}
        ${hover ? "hover:shadow-card hover:border-primary/50 hover:-translate-y-1 cursor-pointer active:translate-y-0 active:scale-[0.995]" : ""}
        ${className}
      `}
      {...props}
    />
  );
}
