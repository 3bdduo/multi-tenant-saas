"use client";

import { useEffect, useState } from "react";
import { IMAGE_MANIFEST } from "@/lib/assetManifest";

// Was 1800ms fixed + a 400ms exit fade = ~2.2s of guaranteed waiting on every
// first visit, no matter how fast assets actually loaded. Now: wait for the
// real preload tasks OR this cap, whichever comes first — and the cap itself
// is much lower, since a splash this short barely needs a safety net.
const SPLASH_MAX_MS = 500;
const SPLASH_MIN_MS = 150; // just enough to avoid an ugly instant-flash on fast connections
const SPLASH_KEY = "clinic-preloaded-at";
const SPLASH_TTL_MS = 6 * 60 * 60 * 1000; // show the splash at most once every 6 hours

function hasSeenSplash(): boolean {
  try {
    const at = Number(localStorage.getItem(SPLASH_KEY) || 0);
    return at > 0 && Date.now() - at < SPLASH_TTL_MS;
  } catch {
    return false;
  }
}

function markSplashSeen() {
  try {
    localStorage.setItem(SPLASH_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

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
    const alreadyLoaded = hasSeenSplash();
    if (alreadyLoaded) {
      setSkip(true);
      setDone(true);
      return;
    }

    let cancelled = false;

    const startTime = Date.now();
    // Progress bar animates against the (short) max cap, purely as a visual
    // heartbeat — it no longer gates when the splash actually ends.
    const interval = setInterval(() => {
      if (cancelled) return;
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(96, (elapsed / SPLASH_MAX_MS) * 100);
      setProgress(newProgress);
    }, 50);

    // Real work only: preload the hero images. (Route prefetching already
    // happens for real, immediately, in <GlobalPreloader /> — this used to
    // also "prefetch" routes here via a bare setTimeout that did nothing at
    // all except burn time, so it's gone.)
    const tasks = IMAGE_MANIFEST.map((src) => preloadImage(src));
    const realWork = Promise.all(tasks).catch(() => { });
    const minWait = new Promise<void>((resolve) => setTimeout(resolve, SPLASH_MIN_MS));
    const cap = new Promise<void>((resolve) => setTimeout(resolve, SPLASH_MAX_MS));

    Promise.race([Promise.all([realWork, minWait]), cap]).then(() => {
      if (cancelled) return;
      clearInterval(interval);
      setProgress(100);
      markSplashSeen();
      // One quick frame so the bar visibly reaches 100% before the fade-out
      // animation (see .animate-fade-scale-out) takes over.
      requestAnimationFrame(() => {
        if (!cancelled) setDone(true);
      });
    });

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#05070D]" />;
  }

  return (
    <>
      {!skip && (
        <div
          aria-hidden={done}
          role="status"
          aria-live="polite"
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#05070D] text-white ${done ? "pointer-events-none animate-fade-scale-out" : ""
            }`}
        >
          {/* Cinematic stage: teal key light, orange kicker, lens streak, vignette */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -top-1/3 left-1/2 -ml-[40vmax] h-[80vmax] w-[80vmax] rounded-full bg-[radial-gradient(closest-side,rgba(46,196,182,0.22),transparent_70%)] animate-pulse-glow" />
            <div className="absolute -bottom-1/3 -right-1/4 h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(closest-side,rgba(255,139,69,0.16),transparent_70%)]" />
            <div
              className="cine-streak"
              style={
                {
                  top: "38%",
                  animation: "cine-streak 6s ease-in-out infinite",
                  "--cine-streak-max": 0.5,
                  "--cine-teal": "46, 196, 182",
                  "--cine-orange": "255, 139, 69",
                } as React.CSSProperties
              }
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_95%_at_50%_45%,transparent_50%,rgba(0,0,0,0.7)_100%)]" />
          </div>

          {/* Letterbox bars — slide away when the splash is done */}
          <div
            aria-hidden="true"
            className={`absolute left-0 right-0 top-0 h-[11vh] bg-black transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${done ? "-translate-y-full" : "translate-y-0"}`}
          />
          <div
            aria-hidden="true"
            className={`absolute bottom-0 left-0 right-0 h-[11vh] bg-black transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${done ? "translate-y-full" : "translate-y-0"}`}
          />

          {/* Logos Section */}
          <div className="relative flex items-center gap-6 sm:gap-12 md:gap-16 mb-12 animate-fade-in-slow">

            {/* Nabd Logo — teal glow */}
            <div className="flex flex-col items-center gap-4">
              <div
                className="relative flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-full overflow-hidden border border-white/15 bg-[#0A0E1A] shadow-[0_0_50px_rgba(46,196,182,0.35),0_0_110px_rgba(46,196,182,0.12)] animate-float-slow"
              >
                <img
                  src="/images/nabd-logo.jpeg"
                  alt="شعار نبض"
                  className="w-full h-full object-cover rounded-full select-none drop-shadow-[0_0_20px_rgba(46,196,182,0.45)]"
                />
                {/* Glow overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#2EC4B6]/15 via-transparent to-[#FF8B45]/10 pointer-events-none" />
              </div>
              <div className="text-center">
                <h2 className="font-display text-2xl font-black text-white">نبض</h2>
                <p className="text-xs font-bold tracking-[0.2em] text-[#5EE0D2] uppercase">Nabd SaaS</p>
              </div>
            </div>

            {/* Connecting heartbeat symbol */}
            <div className="flex items-center justify-center animate-pulse-glow">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8CEADF] drop-shadow-[0_0_10px_rgba(46,196,182,0.8)]">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>

            {/* ARC Logo — orange glow */}
            <div className="flex flex-col items-center gap-4">
              <div
                className="relative flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-full overflow-hidden border border-white/15 bg-[#0A0E1A] shadow-[0_0_50px_rgba(255,139,69,0.30),0_0_110px_rgba(255,139,69,0.10)] animate-float-slow"
                style={{ animationDelay: "1s" }}
              >
                <img
                  src="/logo/arc-logo.jpg"
                  alt="ARC"
                  className="w-full h-full object-cover rounded-full select-none drop-shadow-[0_0_20px_rgba(255,139,69,0.40)]"
                />
                {/* Glow overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF8B45]/15 via-transparent to-[#2EC4B6]/10 pointer-events-none" />
              </div>
              <div className="text-center">
                <h2 className="font-display text-xl font-bold text-[#FF9D62]">ARC</h2>
                <p className="text-xs font-semibold tracking-[0.1em] text-white/60 uppercase">Community</p>
              </div>
            </div>

          </div>

          {/* Text Section */}
          <div className="relative text-center animate-fade-in-slow mb-12" style={{ animationDelay: "0.5s" }}>
            <p className="text-base sm:text-lg font-medium text-white/65 mb-2">
              مجتمع <span className="text-[#FF9D62] font-bold">ARC</span> يُقدّم لكم
            </p>
            <h1 className="font-brush text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-relaxed">
              منصة <span className="gradient-text-alive font-brush">نبض</span> لإدارة العيادات الطبية
            </h1>
          </div>

          {/* Progress Bar */}
          <div className="relative w-64 sm:w-80 h-1.5 overflow-hidden rounded-full bg-white/10 animate-scale-in-slow" style={{ animationDelay: "1s" }}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2EC4B6] via-[#8CEADF] to-[#FF8B45] transition-all duration-75 ease-linear shadow-[0_0_12px_rgba(46,196,182,0.75)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <div className={done ? "animate-fade-in" : "invisible"}>{children}</div>
    </>
  );
}
