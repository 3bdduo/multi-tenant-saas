"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const STORAGE_KEY = "nabd-smart-assistant-pos";

interface AssistantAction {
  id: string;
  label: string;
  isDisabled: (pathname: string, searchType: string | null, role: string | null | undefined) => boolean;
  run: (router: ReturnType<typeof useRouter>) => void;
}

const ACTIONS: AssistantAction[] = [
  {
    id: "back",
    label: "رجوع خطوة",
    isDisabled: (pathname) => pathname === "/",
    run: (router) => {
      if (typeof window !== "undefined" && window.history.length > 1) window.history.back();
      else router.back();
    },
  },
  {
    id: "home",
    label: "الرئيسية",
    isDisabled: (pathname) => pathname === "/",
    run: (router) => router.push("/"),
  },
  {
    id: "booking",
    label: "حجز كشف",
    isDisabled: (pathname) => pathname === "/clinics",
    run: (router) => router.push("/clinics"),
  },
  {
    id: "emergency",
    label: "تقرير طوارئ",
    isDisabled: (pathname) => pathname === "/emergency-report",
    run: (router) => router.push("/emergency-report"),
  },
  {
    id: "doctor_login",
    label: "دخول عيادة",
    isDisabled: (pathname, searchType, role) =>
      pathname.startsWith("/doctor") ||
      (pathname === "/login" && searchType === "doctor") ||
      role === "doctor",
    run: (router) => router.push("/login?type=doctor"),
  },
  {
    id: "hospital_login",
    label: "دخول مستشفى",
    isDisabled: (pathname, searchType, role) =>
      pathname.startsWith("/hospital") ||
      (pathname === "/login" && searchType === "hospital") ||
      role === "hospital",
    run: (router) => router.push("/login?type=hospital"),
  },
  {
    id: "patient_login",
    label: "دخول مريض",
    isDisabled: (pathname, searchType, role) =>
      pathname.startsWith("/patient") ||
      (pathname === "/login" && (searchType === "patient" || !searchType)) ||
      role === "patient",
    run: (router) => router.push("/login?type=patient"),
  },
];

const BTN_SIZE = 52;
const RADIUS_DESKTOP = 148;
const RADIUS_MOBILE = 115;

function SmartAssistantInner() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const searchType = searchParams ? searchParams.get("type") : null;
  const auth = useAuth();
  const role = auth?.role;

  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showIntroBadge, setShowIntroBadge] = useState(true);
  const [radius, setRadius] = useState(RADIUS_DESKTOP);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startPointer = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const didMove = useRef(false);

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  
  useEffect(() => {
    // Responsive radius
    const updateRadius = () =>
      setRadius(window.innerWidth < 640 ? RADIUS_MOBILE : RADIUS_DESKTOP);
    updateRadius();
    window.addEventListener("resize", updateRadius);

    
    const timer = setTimeout(() => setShowIntroBadge(false), 3000);

    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        setPos({
          x: clamp(p.x, 16, window.innerWidth - BTN_SIZE - 16),
          y: clamp(p.y, 16, window.innerHeight - BTN_SIZE - 16),
        });
        return () => { clearTimeout(timer); window.removeEventListener("resize", updateRadius); };
      }
    } catch (_) {}

    setPos({ x: 24, y: Math.round(window.innerHeight * 0.75) });
    return () => { clearTimeout(timer); window.removeEventListener("resize", updateRadius); };
  }, []);

  const savePos = useCallback((p: { x: number; y: number }) => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (_) {}
  }, []);

  
  useEffect(() => { setIsOpen(false); }, [pathname]);
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    dragging.current = true;
    didMove.current = false;
    setIsDragging(true);
    startPointer.current = { x: e.clientX, y: e.clientY };
    const rect = containerRef.current.getBoundingClientRect();
    startPos.current = { x: rect.left, y: rect.top };
    containerRef.current.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const dx = e.clientX - startPointer.current.x;
    const dy = e.clientY - startPointer.current.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) didMove.current = true;
    const newX = clamp(startPos.current.x + dx, 16, window.innerWidth - BTN_SIZE - 16);
    const newY = clamp(startPos.current.y + dy, 16, window.innerHeight - BTN_SIZE - 16);
    setPos({ x: newX, y: newY });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    if (!didMove.current) {
      setShowIntroBadge(false);
      setIsOpen((prev) => !prev);
      return;
    }
    if (pos) savePos(pos);
  }, [pos, savePos]);

  const handleAction = (action: AssistantAction, disabled: boolean) => {
    if (disabled) return;
    setIsOpen(false);
    action.run(router);
  };

  if (!pos) return null;

  
  const cx = pos.x + BTN_SIZE / 2;
  const cy = pos.y + BTN_SIZE / 2;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[99990] bg-black/50 backdrop-blur-[2px] animate-fade-in"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {}
      {isOpen && (
        <div
          className="fixed inset-0 z-[99996] pointer-events-none"
        >
          {ACTIONS.map((item, i) => {
            const disabled = item.isDisabled(pathname, searchType, role);
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / ACTIONS.length;
            const ox = Math.round(Math.cos(angle) * radius);
            const oy = Math.round(Math.sin(angle) * radius);

            // Rough half-size of the pill (Arabic label + padding), so the
            // clamp below keeps the WHOLE button on screen, not just its
            // center point. This is what was missing before: buttons near
            // a screen edge (very common on mobile, where the orb itself
            // sits close to the edge) could render partly or fully outside
            // the viewport, or stack on top of each other.
            const halfW = Math.max(46, item.label.length * 6 + 24);
            const halfH = 20;
            const edgePad = 8;

            const rawX = cx + ox;
            const rawY = cy + oy;
            const clampedX = Math.min(
              Math.max(rawX, halfW + edgePad),
              (typeof window !== "undefined" ? window.innerWidth : rawX) - halfW - edgePad
            );
            const clampedY = Math.min(
              Math.max(rawY, halfH + edgePad),
              (typeof window !== "undefined" ? window.innerHeight : rawY) - halfH - edgePad
            );

            return (



              <div
                key={item.id}
                className="absolute pointer-events-none"
                style={{
                  left: clampedX,
                  top: clampedY,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  className="pointer-events-auto"
                  style={{
                    animation: `smartAssistantBloom 0.3s cubic-bezier(0.34,1.4,0.64,1) ${i * 0.028}s backwards`,
                  }}
                >
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleAction(item, disabled)}
                  className={[
                    "inline-flex items-center justify-center whitespace-nowrap",
                    "rounded-full px-3.5 py-1.5 text-[12px] sm:text-[13px] font-extrabold",
                    "select-none transition-all duration-150 ease-out",
                    disabled
                      ? /* disabled */
                        "opacity-30 cursor-not-allowed pointer-events-none " +
                        "bg-surface-raised/70 " +
                        "text-text-muted " +
                        "border border-dashed border-border shadow-none"
                      : /* active */
                        "cursor-pointer active:scale-95 hover:scale-[1.08] " +
                        "bg-gradient-to-b from-white via-[#F3F9F9] to-[#E3EFEF] " +
                        "text-[#0A1D22] border border-[#B7CBCF] " +
                        "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_14px_rgba(6,50,52,0.16)] " +
                        "hover:border-[#086B67] hover:shadow-[0_6px_20px_rgba(8,107,103,0.28)] " +
                        "dark:bg-gradient-to-b dark:from-[#16252D] dark:via-[#111D24] dark:to-[#0B141A] " +
                        "dark:text-[#EAF2F3] dark:border-[#24404A] " +
                        "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_16px_rgba(0,0,0,0.6)] " +
                        "dark:hover:border-[#2EC4B6] dark:hover:text-white dark:hover:shadow-[0_0_18px_rgba(46,196,182,0.35)]",
                  ].join(" ")}
                >
                  {item.label}
                </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Draggable Orb ── */}
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          width: BTN_SIZE,
          height: BTN_SIZE,
          zIndex: 99999,
          touchAction: "none",
          userSelect: "none",
          cursor: isDragging ? "grabbing" : "grab",
          transition: isDragging ? "none" : "left 0.25s cubic-bezier(0.34,1.2,0.64,1), top 0.25s cubic-bezier(0.34,1.2,0.64,1)",
        }}
        className="select-none pointer-events-auto"
      >
        {/* Intro badge "مساعد ذكي" — 3 seconds then fades */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: BTN_SIZE + 8,
            left: "50%",
            transform: "translateX(-50%)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
            opacity: showIntroBadge && !isOpen ? 1 : 0,
            transformOrigin: "bottom center",
          }}
        >
          <div className="relative whitespace-nowrap rounded-lg px-3 py-1 text-[11px] font-black shadow-lg
            bg-[#0A1D22] text-white border border-[#1B4A50]
            dark:bg-[#EAF2F3] dark:text-[#04191A] dark:border-[#8CEADF]">
            مساعد ذكي
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 block w-2 h-2 rotate-45 bg-[#0A1D22] dark:bg-[#EAF2F3] border-r border-b border-[#1B4A50] dark:border-[#8CEADF]" />
          </div>
        </div>

        <button
          type="button"
          aria-label="المساعد الذكي"
          className={[
            "relative flex h-full w-full items-center justify-center rounded-full",
            "select-none cursor-pointer outline-none transition-all duration-300 ease-out",
            /* Light mode: DEEP TEAL orb — stands out on light backgrounds */
            "bg-gradient-to-b from-[#12363B] via-[#0E2B30] to-[#071A1E]",
            "text-white border-[2.5px] border-[#1F5A60]",
            "shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-2px_3px_rgba(0,0,0,0.5),0_6px_22px_rgba(8,107,103,0.4)]",
            "hover:border-[#2EC4B6] hover:scale-[1.08]",
            /* Dark mode: GLOWING TEAL orb — stands out on dark backgrounds */
            "dark:bg-gradient-to-b dark:from-[#9AF0E6] dark:via-[#4FD8CB] dark:to-[#22A99D]",
            "dark:text-[#04191A] dark:border-[#8CEADF]",
            "dark:shadow-[inset_0_2px_2px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.15),0_8px_28px_rgba(46,196,182,0.45)]",
            "dark:hover:border-[#D4FBF6] dark:hover:scale-[1.08]",
            isOpen ? "scale-[1.04] ring-4 ring-primary/25" : "",
            isDragging ? "scale-[1.12] shadow-2xl" : "",
          ].join(" ")}
          style={{ pointerEvents: "none" }}
        >
          {/* 2-pulse animation on first mount */}
          {!isOpen && (
            <span
              className="absolute inset-0 rounded-full bg-primary pointer-events-none"
              style={{ animation: "pulseTwice 2.4s ease-out 1 forwards" }}
            />
          )}

          {/* Icon — smooth morph from assistant face to X */}
          <span
            className="flex items-center justify-center transition-all duration-300"
            style={{
              transform: isOpen ? "rotate(90deg) scale(0.9)" : "rotate(0deg) scale(1)",
            }}
          >
            {isOpen ? (
              /* Bold X when open */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              /* Smart assistant face icon */
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                {/* Rounded head */}
                <rect x="3" y="6" width="18" height="13" rx="6" />
                {/* Antenna */}
                <line x1="12" y1="2.5" x2="12" y2="6" />
                <circle cx="12" cy="2" r="1" fill="currentColor" stroke="none" />
                {/* Eyes */}
                <circle cx="8.5" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="15.5" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
                {/* Smile */}
                <path d="M9.5 15.5q2.5 1.5 5 0" strokeWidth="2" />
              </svg>
            )}
          </span>
        </button>
      </div>
    </>
  );
}

export function SmartAssistant() {
  return (
    <Suspense fallback={null}>
      <SmartAssistantInner />
    </Suspense>
  );
}
