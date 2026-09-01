"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  allowModal?: boolean;
  href?: string | null;
}


export function NabdLogoIcon({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const dimensions = {
    sm: "h-9 w-9",
    md: "h-11 w-11",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center rounded-[24%] overflow-hidden shadow-[0_4px_20px_rgba(225,29,72,0.2),0_4px_20px_rgba(13,148,136,0.25)] border border-white/20 transition-all duration-300 group-hover:shadow-[0_6px_28px_rgba(225,29,72,0.35),0_6px_28px_rgba(13,148,136,0.4)] group-hover:scale-105 ${dimensions[size]} ${className}`}
      style={{
        background:
          "linear-gradient(135deg, #D92662 0%, #B81D52 28%, #362947 56%, #115E59 80%, #0D9488 100%)",
      }}
    >
      {/* Glossy top overlay highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20 pointer-events-none" />

      {/* SVG Icon: EKG Pulse Waveform + Stethoscope Accent */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
        aria-hidden="true"
      >
        {/* Heartbeat EKG line in pure crisp white */}
        <path
          d="M 23 50 L 32 50 L 37 40 L 43 62 L 49 35 L 54 56 L 58 50 L 77 50"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Stethoscope sensor dot on bottom-right corner */}
        <circle cx="74" cy="74" r="6" fill="#80DFD6" fillOpacity="0.5" />
        <circle cx="74" cy="74" r="3.5" fill="#FFFFFF" fillOpacity="0.7" />
        <line
          x1="74"
          y1="74"
          x2="74"
          y2="100"
          stroke="#80DFD6"
          strokeOpacity="0.4"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function Logo({
  size = "md",
  showText = true,
  className = "",
  allowModal = true,
}: LogoProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    }
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  const modalContent =
    isModalOpen && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in overflow-y-auto"
            onClick={() => setIsModalOpen(false)}
          >
            {/* Modal Inner Card */}
            <div
              className="relative w-full max-w-md my-auto rounded-3xl bg-surface border border-primary/30 p-6 sm:p-8 shadow-2xl shadow-primary/25 animate-scale-in flex flex-col items-center text-center gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-border/60 text-text-secondary hover:bg-danger/20 hover:text-danger transition-colors z-10"
                title="إغلاق"
                aria-label="إغلاق"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <line x1="1" y1="1" x2="13" y2="13" />
                  <line x1="13" y1="1" x2="1" y2="13" />
                </svg>
              </button>

              {/* Large Logo Visual Display */}
              <div className="relative mt-2 p-8 rounded-3xl bg-surface-raised border border-border/50 shadow-inner flex flex-col items-center justify-center gap-4">
                <NabdLogoIcon size="xl" />
                <div className="flex flex-col items-center">
                  <span className="font-display font-black text-3xl text-text-primary tracking-wide">
                    نبض
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-primary mt-0.5">
                    Nabd SaaS
                  </span>
                </div>
              </div>

              {/* Logo Info */}
              <div className="flex flex-col items-center gap-1.5">
                <p className="text-sm font-bold text-primary">
                  رعاية طبية متكاملة — Integrated Healthcare SaaS
                </p>
                <p className="text-xs text-text-secondary max-w-xs mt-1 leading-relaxed">
                  منظومة  ذكية ومتطورة لإدارة العيادات الطبية، المرضى، المواعيد، والسجلات الصحية.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full pt-2 border-t border-border/60">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    window.location.href = "/";
                  }}
                  className="flex-1 rounded-2xl bg-primary py-2.5 text-sm font-bold text-surface shadow-glow-cyan hover:brightness-105 transition-all"
                >
                  الصفحة الرئيسية
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-border px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-raised transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div
        onClick={() => allowModal && setIsModalOpen(true)}
        className={`inline-flex items-center gap-3 cursor-pointer group transition-transform duration-200 select-none ${className}`}
        title="شعار منصة نبض | انقر للعرض"
      >
        {/* The New Pulse App Icon */}
        <NabdLogoIcon size={size} />

        {showText && (
          <div className="flex flex-col text-right leading-none">
            <div className="flex items-center gap-1.5">
              <span
                className={`font-display font-extrabold tracking-tight text-text-primary ${textSizes[size]}`}
              >
                نبض
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary opacity-90">
                Nabd
              </span>
            </div>
            <span className="text-[11px] font-semibold text-text-secondary tracking-normal mt-1">
              رعاية متكاملة
            </span>
          </div>
        )}
      </div>

      {modalContent}
    </>
  );
}
