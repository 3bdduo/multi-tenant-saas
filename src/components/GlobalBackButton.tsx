"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

const STORAGE_KEY = "nabd-back-btn-pos";

export function GlobalBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  const btnRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startPointer = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const didMove = useRef(false);

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load saved position or set default (bottom-right area for RTL)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPos(parsed);
        return;
      }
    } catch (_) {}
    // Default position: left side, vertically centered
    setPos({ x: 16, y: Math.round(window.innerHeight * 0.45) });
  }, []);

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

  const savePos = useCallback((p: { x: number; y: number }) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch (_) {}
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!btnRef.current) return;
    dragging.current = true;
    didMove.current = false;
    setIsDragging(true);
    startPointer.current = { x: e.clientX, y: e.clientY };
    const rect = btnRef.current.getBoundingClientRect();
    startPos.current = { x: rect.left, y: rect.top };
    btnRef.current.setPointerCapture(e.pointerId);
    e.preventDefault();
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging.current || !btnRef.current) return;
      const dx = e.clientX - startPointer.current.x;
      const dy = e.clientY - startPointer.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didMove.current = true;

      const btnW = btnRef.current.offsetWidth;
      const btnH = btnRef.current.offsetHeight;
      const newX = clamp(startPos.current.x + dx, 8, window.innerWidth - btnW - 8);
      const newY = clamp(startPos.current.y + dy, 8, window.innerHeight - btnH - 8);
      setPos({ x: newX, y: newY });
    },
    []
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      dragging.current = false;
      setIsDragging(false);

      if (!didMove.current) {
        // It was a tap/click — navigate back
        router.back();
        return;
      }

      // Snap to nearest horizontal edge (left or right)
      if (!btnRef.current) return;
      const btnW = btnRef.current.offsetWidth;
      const btnH = btnRef.current.offsetHeight;
      const cx = (pos?.x ?? 0) + btnW / 2;
      let finalX: number;

      if (cx < window.innerWidth / 2) {
        finalX = 16;
      } else {
        finalX = window.innerWidth - btnW - 16;
      }

      const finalY = clamp(pos?.y ?? 0, 8, window.innerHeight - btnH - 8);
      const finalPos = { x: finalX, y: finalY };
      setPos(finalPos);
      savePos(finalPos);
    },
    [pos, router, savePos]
  );

  // Exclude root and dashboard pages
  if (
    pathname === "/" ||
    pathname.startsWith("/doctor") ||
    pathname.startsWith("/patient") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/hospital") ||
    pathname.startsWith("/emergency-report") ||
    pathname.startsWith("/emergency-track")
  ) {
    return null;
  }

  if (!pos) return null;

  return (
    <div
      ref={btnRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        zIndex: 9999,
        touchAction: "none",
        userSelect: "none",
        cursor: isDragging ? "grabbing" : "grab",
        transition: isDragging
          ? "none"
          : "left 0.35s cubic-bezier(0.34,1.56,0.64,1), top 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease",
      }}
      className="animate-fade-in pointer-events-auto"
    >
      <button
        type="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && router.back()}
        className={`
          group flex min-h-[40px] items-center gap-2 rounded-full
          border border-border/80 bg-surface/95
          px-3 sm:px-4 py-2
          text-xs sm:text-sm font-extrabold text-text-primary
          shadow-lg backdrop-blur-xl
          hover:border-primary/50 hover:bg-surface hover:text-primary hover:shadow-glow-cyan
          active:scale-95 focus:outline-none
          ${isDragging ? "scale-[1.06] shadow-2xl border-primary/60" : ""}
        `}
        style={{
          pointerEvents: "none", // parent div handles all pointer events
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
        title="الرجوع للصفحة السابقة"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-200 group-hover:translate-x-0.5 shrink-0"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="whitespace-nowrap">رجوع</span>
      </button>
    </div>
  );
}
