"use client";

import { useState } from "react";
import { IconPhone, IconWhatsApp } from "@/components/ui/icons";

interface SupportNumber {
  raw: string;
  formatted: string;
  waNumber: string;
}

const SUPPORT_NUMBERS: SupportNumber[] = [
  {
    raw: "01285949859",
    formatted: "01285949859",
    waNumber: "201285949859",
  },
  {
    raw: "+201228174637",
    formatted: "01228174637",
    waNumber: "01228174637",
  },
];

const DEFAULT_WA_TEXT = encodeURIComponent(
  "السلام عليكم، أريد تفعيل حساب العيادة الخاص بي على المنصة."
);

export function SupportContactBox() {
  return (
    <div className="rounded-2xl border border-warning/30 bg-warning/5 p-5 text-right animate-fade-in shadow-lg">
      <div className="flex items-center gap-3 border-b border-warning/20 pb-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/20 text-warning text-lg">
          
        </div>
        <div>
          <h4 className="font-display text-base font-extrabold text-text-primary">
            تواصل مع فريق الدعم الفني للتفعيل
          </h4>
          <p className="text-xs text-text-secondary mt-0.5">
            اختر أحد الأرقام التالية للتواصل المباشر عبر واتساب أو الاتصال
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SUPPORT_NUMBERS.map((num, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-surface p-3.5 shadow-sm hover:border-primary/40 transition-all duration-200"
          >
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-text-secondary">
                دعم الفني {idx + 1}
              </span>
              <span className="font-mono text-sm font-extrabold text-text-primary dir-ltr" dir="ltr">
                {num.formatted}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/${num.waNumber}?text=${DEFAULT_WA_TEXT}`}
                target="_blank"
                rel="noopener noreferrer"
                title="تواصل عبر واتساب"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/15 text-success hover:bg-success hover:text-surface transition-all duration-200 shadow-sm"
              >
                <IconWhatsApp className="h-4.5 w-4.5" />
              </a>

              {/* Call Button */}
              <a
                href={`tel:${num.raw}`}
                title="اتصال تلفوني"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary hover:bg-primary hover:text-surface transition-all duration-200 shadow-sm"
              >
                <IconPhone className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SupportActivationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl animate-scale-up">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised text-text-secondary hover:text-text-primary transition-colors"
        >
          
        </button>

        <div className="flex items-center gap-3 border-b border-border pb-4 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/20 text-warning text-xl font-bold">
            
          </div>
          <div>
            <h3 className="font-display text-lg font-extrabold text-text-primary">
              تفعيل حساب العيادة
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              تواصل مع فريق المبيعات والدعم الفني لتفعيل حساب عيادتك مباشرة
            </p>
          </div>
        </div>

        <SupportContactBox />

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-surface-raised px-5 py-2.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
