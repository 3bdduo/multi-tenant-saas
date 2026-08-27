"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  allowModal?: boolean;
  href?: string | null;
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

  const iconSizes = {
    sm: "h-9 w-auto",
    md: "h-11 w-auto",
    lg: "h-16 w-auto",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const modalContent = isModalOpen && mounted ? (
    createPortal(
      <div
        className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in overflow-y-auto"
        onClick={() => setIsModalOpen(false)}
      >
        {/* Modal Inner Card */}
        <div
          className="relative w-full max-w-md my-auto rounded-3xl bg-surface border border-primary/30 p-6 sm:p-8 shadow-2xl shadow-primary/25 animate-scale-in flex flex-col items-center text-center gap-5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-border/60 text-text-secondary hover:bg-danger/20 hover:text-danger transition-colors z-10"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>

          {/* Glowing Logo Frame */}
          <div className="relative w-full mt-2 p-5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-primary/20 shadow-inner flex items-center justify-center">
            <img
              src="/logo/nabd-logo-light.png"
              alt="Nabd Logo Light"
              className="max-h-48 w-auto object-contain dark:hidden"
            />
            <img
              src="/logo/nabd-logo-dark.png"
              alt="Nabd Logo Dark"
              className="max-h-48 w-auto object-contain hidden dark:block drop-shadow-[0_0_20px_rgba(0,229,255,0.7)]"
            />
          </div>

          {/* Logo Info */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-2xl font-extrabold text-text-primary">
                 نبض
              </h3>
              <span className="font-display font-bold text-xs px-2 py-0.5 rounded-md bg-primary-soft text-primary border border-primary/20">
                Nabd SaaS
              </span>
            </div>
            <p className="text-sm font-semibold text-primary">
              رعاية طبية متكاملة — Integrated Medical Care
            </p>
            <p className="text-xs text-text-secondary max-w-xs mt-1 leading-relaxed">
              منظومة SaaS متطورة لإدارة العيادات الطبية، المرضى، المواعيد، والسجلات الصحية الذكية.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full pt-2 border-t border-border/60">
            <button
              onClick={() => {
                setIsModalOpen(false);
                window.location.href = "/";
              }}
              className="flex-1 rounded-[1rem] bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow-glow hover:brightness-105 transition-all"
            >
              الصفحة الرئيسية 
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-elevated transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <>
      <div
        onClick={() => allowModal && setIsModalOpen(true)}
        className={`inline-flex items-center gap-3 cursor-pointer group transition-transform duration-300 hover:scale-105 active:scale-95 ${className}`}
        title="انقر لمشاهدة الشعار بالتفصيل"
      >
        {/* ── EKG Visual Mark (pure icon, no text inside) ── */}
        <div
          className={`relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#0F5357] dark:from-primary dark:to-[#22A599] shadow-[0_2px_12px_rgba(20,107,112,0.35)] dark:shadow-[0_2px_16px_rgba(46,196,182,0.40)] group-hover:shadow-[0_4px_18px_rgba(20,107,112,0.50)] transition-shadow duration-300 ${
            size === "sm" ? "h-9 w-9" : size === "lg" ? "h-14 w-14" : "h-11 w-11"
          }`}
        >
          {/* EKG / Heartbeat pulse line */}
          <svg
            viewBox="0 0 40 20"
            fill="none"
            stroke="rgba(255,255,255,0.92)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={size === "sm" ? "w-5" : size === "lg" ? "w-8" : "w-6"}
            aria-hidden="true"
          >
            <polyline points="0,10 6,10 9,4 12,17 16,2 19,14 22,10 40,10" />
          </svg>
          {/* Subtle inner glow dot */}
          <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-white/50 animate-pulse" />
        </div>

        {showText && (
          <div className="flex flex-col text-right">
            {/* Single brand name — no duplication */}
            <span
              className={`font-brush font-bold tracking-normal gradient-text-alive leading-none ${textSizes[size]}`}
            >
              نبض
            </span>
            {/* Single concise tagline */}
            <span className="text-[10px] font-semibold text-text-muted tracking-wider mt-0.5 font-body">
              Nabd · رعاية متكاملة
            </span>
          </div>
        )}
      </div>

      {modalContent}
    </>
  );
}
