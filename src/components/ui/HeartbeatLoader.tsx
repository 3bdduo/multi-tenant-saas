"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function LoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isBlocking, setIsBlocking] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const startTimeRef = useRef<number>(0);
  const minTimerRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    setProgress(100);
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, 300 - elapsed);

    minTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, remaining);

    return () => {
      if (minTimerRef.current) clearTimeout(minTimerRef.current);
    };
  }, [pathname, searchParams]);


  useEffect(() => {
    function handleGlobalLoading(e: Event) {
      const customEv = e as CustomEvent<{ isLoading: boolean; blocking?: boolean }>;
      const shouldLoad = customEv.detail?.isLoading;
      setIsBlocking(Boolean(customEv.detail?.blocking));

      if (shouldLoad) {
        if (minTimerRef.current) clearTimeout(minTimerRef.current);
        startTimeRef.current = Date.now();
        setProgress(30);
        setIsLoading(true);
      } else {
        setProgress(100);
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, 300 - elapsed);
        minTimerRef.current = setTimeout(() => {
          setIsLoading(false);
          setProgress(0);
        }, remaining);
      }
    }

    window.addEventListener("global-loading", handleGlobalLoading);
    return () => {
      window.removeEventListener("global-loading", handleGlobalLoading);
    };
  }, []);



  // Full-screen overlay: only for writes (POST/PUT/DELETE) that last longer than 400ms
  useEffect(() => {
    if (!(isLoading && isBlocking)) {
      setShowOverlay(false);
      return;
    }
    const t = setTimeout(() => setShowOverlay(true), 400);
    return () => clearTimeout(t);
  }, [isLoading, isBlocking]);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading && progress === 0) return null;

  return (
    <>
      { }
      <div className="fixed top-0 left-0 right-0 z-[10000] pointer-events-none">
        <div
          className="h-1 bg-gradient-to-r from-primary via-primary-light to-accent shadow-[0_0_14px_rgba(var(--color-primary-rgb),0.75)] transition-all duration-150 ease-out"
          style={{ width: `${progress}%`, opacity: progress > 0 ? 1 : 0 }}
        />
      </div>

      {/* Instant ECG Pulse Modal Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/55 backdrop-blur-md transition-all duration-200 animate-fade-in">
          <div className="relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-surface/95 border border-primary/30 shadow-2xl backdrop-blur-xl max-w-xs sm:max-w-sm w-full mx-4 animate-scale-up">

            {/* ECG Heartbeat SVG */}
            <div className="w-full h-20 relative flex items-center justify-center overflow-hidden">
              <svg
                className="w-full h-full text-primary"
                viewBox="0 0 500 150"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 0 75 L 500 75"
                  stroke="currentColor"
                  strokeOpacity="0.15"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                />
                <path
                  d="M 0 75 H 120 L 140 75 L 155 30 L 175 120 L 195 10 L 215 95 L 230 75 H 500"
                  stroke="url(#ecg-gradient-instant)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  className="animate-ecg-pulse"
                />
                <defs>
                  <linearGradient id="ecg-gradient-instant" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--color-primary, #2EC4B6)" stopOpacity="0.35" />
                    <stop offset="50%" stopColor="var(--color-primary-light, #8CEADF)" stopOpacity="1" />
                    <stop offset="100%" stopColor="var(--color-accent, #FF8B45)" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-ecg-scan pointer-events-none" />
            </div>

            {/* Loading text */}
            <div className="mt-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary animate-ping" />
              <p className="font-display text-sm font-extrabold text-text-primary tracking-wide">
                جاري التحميل...
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function HeartbeatLoader() {
  return (
    <Suspense fallback={null}>
      <LoaderInner />
    </Suspense>
  );
}