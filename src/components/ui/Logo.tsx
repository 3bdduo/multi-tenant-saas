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
      className={`relative shrink-0 flex items-center justify-center rounded-2xl overflow-hidden shadow-md border border-white/20 bg-[#0c1017] transition-all duration-300 group-hover:shadow-[0_6px_24px_rgba(13,148,136,0.35)] group-hover:scale-105 ${dimensions[size]} ${className}`}
    >
      <img
        src="/images/nabd-logo.jpeg"
        alt="شعار نبض - Nabd"
        className="w-full h-full object-cover select-none"
      />
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-white/10 pointer-events-none" />
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
              className="relative w-full max-w-lg my-auto rounded-3xl bg-surface border border-primary/30 p-6 sm:p-8 shadow-2xl shadow-primary/25 animate-scale-in flex flex-col items-center text-center gap-6"
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
              <div className="relative w-full rounded-2xl overflow-hidden border border-border/60 shadow-xl bg-slate-950">
                <img
                  src="/images/nabd-logo.jpeg"
                  alt="شعار نبض Nabd Healthcare SaaS"
                  className="w-full h-auto object-contain max-h-72 select-none"
                />
              </div>

              {/* Logo Info */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-2xl text-text-primary">نبض</span>
                  <span className="text-sm font-extrabold uppercase tracking-[0.2em] text-primary">NABD</span>
                </div>
                <p className="text-sm font-bold text-primary">
                  رعاية طبية متكاملة — Healthcare SaaS
                </p>
                <p className="text-xs text-text-secondary max-w-xs mt-1 leading-relaxed">
                  منظومة ذكية ومتطورة لإدارة العيادات الطبية، المرضى، المواعيد، والسجلات الصحية.
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
