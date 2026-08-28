"use client";

import { useEffect, useState } from "react";
import { IMAGE_MANIFEST } from "@/lib/assetManifest";
import { NabdLogoIcon } from "@/components/ui/Logo";

const ROUTES_TO_PREFETCH = [
  "/",
  "/login",
  "/register",
  "/doctor",
  "/admin",
  "/patient",
];

const SPLASH_MS = 5000;

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); 
    img.src = src;
  });
}

export function Preloader({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    setMounted(true);
    const alreadyLoaded = sessionStorage.getItem("clinic-preloaded") === "1";
    if (alreadyLoaded) {
      setSkip(true);
      setDone(true);
      return;
    }

    let cancelled = false;
    
    // Start progress bar animation (0 to 100 over 5 seconds)
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (cancelled) return;
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / SPLASH_MS) * 100);
      setProgress(newProgress);
    }, 50);

    // Preload assets in the background
    const tasks = [...IMAGE_MANIFEST.map((src) => preloadImage(src))];
    const routeTasks = ROUTES_TO_PREFETCH.map(
      () => new Promise<void>((resolve) => setTimeout(resolve, 40))
    );
    Promise.all([...tasks, ...routeTasks]).catch(() => {});

    // Force 5 seconds duration
    setTimeout(() => {
      if (cancelled) return;
      clearInterval(interval);
      setProgress(100);
      sessionStorage.setItem("clinic-preloaded", "1");
      setTimeout(() => {
        if (!cancelled) setDone(true);
      }, 400); // Wait for progress bar to hit 100% smoothly
    }, SPLASH_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#090D12]" />;
  }

  return (
    <>
      {!skip && (
        <div
          aria-hidden={done}
          role="status"
          aria-live="polite"
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#090D12] text-white ${
            done ? "pointer-events-none animate-fade-scale-out" : ""
          }`}
        >
          {/* Logos Section */}
          <div className="flex items-center gap-6 sm:gap-12 md:gap-16 mb-12 animate-fade-in-slow">
            
            {/* Nabd Logo */}
            <div className="flex flex-col items-center gap-4">
              <NabdLogoIcon size="xl" className="motion-safe:animate-float-slow shadow-[0_0_40px_rgba(225,29,72,0.3)]" />
              <div className="text-center">
                <h2 className="font-display text-2xl font-black text-white">نبض</h2>
                <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Nabd SaaS</p>
              </div>
            </div>

            {/* Connecting Excited Symbol */}
            <div className="flex items-center justify-center motion-safe:animate-pulse-glow">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-light drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>

            {/* ARC Logo */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-full border border-primary/20 bg-surface/5 shadow-[0_0_40px_rgba(0,229,255,0.15)] motion-safe:animate-float-slow" style={{ animationDelay: "1s" }}>
                <img
                  src="/logo/arc-logo.jpg"
                  alt="ARC"
                  className="w-20 sm:w-28 h-auto rounded-full object-cover mix-blend-screen drop-shadow-[0_0_15px_rgba(0,229,255,0.6)]"
                />
              </div>
              <div className="text-center">
                <h2 className="font-display text-xl font-bold text-primary">ARC</h2>
                <p className="text-xs font-semibold tracking-[0.1em] text-text-secondary uppercase">Community</p>
              </div>
            </div>

          </div>

          {/* Text Section */}
          <div className="text-center animate-fade-in-slow mb-12" style={{ animationDelay: "0.5s" }}>
            <p className="text-base sm:text-lg font-medium text-text-secondary mb-2">
              مجتمع <span className="text-primary font-bold">ARC</span> يُقدّم لكم
            </p>
            <h1 className="font-brush text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-relaxed">
              منصة <span className="gradient-text-alive font-brush">نبض</span> لإدارة العيادات الطبية
            </h1>
          </div>

          {/* Progress Bar */}
          <div className="w-64 sm:w-80 h-1.5 overflow-hidden rounded-full bg-white/10 animate-scale-in-slow" style={{ animationDelay: "1s" }}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(0,229,255,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <div className={done ? "animate-fade-in" : "invisible"}>{children}</div>
    </>
  );
}
