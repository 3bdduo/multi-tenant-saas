"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/lib/api/doctor";
import { SupportActivationModal } from "@/components/SupportActivationModal";
import type { Doctor } from "@/types/api";

export function DoctorActivationBanner() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getMe()
      .then((res) => setDoctor(res.data))
      .catch(() => setDoctor(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !doctor) return null;

  const isExpired = doctor.paidExpired ? new Date(doctor.paidExpired) < new Date() : false;
  const isActive = Boolean(doctor.isPaid && !isExpired);

  return (
    <>
      <div
        className={`mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-sm font-medium transition-all duration-300 animate-fade-in ${
          isActive
            ? "bg-success/10 border-success/30 text-success shadow-sm"
            : "bg-warning/10 border-warning/30 text-warning shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3 font-bold">
          <span
            className={`h-3.5 w-3.5 rounded-full animate-pulse-glow ${
              isActive ? "bg-success" : "bg-warning"
            }`}
          />
          <span>
            {isActive
              ? `حساب العيادة مفعل بالكامل ومتاح لاستقبال حجوزات المرضى${
                  doctor.paidExpired
                    ? ` (ينتهي في ${new Date(doctor.paidExpired).toLocaleDateString("ar-EG")})`
                    : ""
                }`
              : "حساب العيادة غير مفعل حالياً (لم يتم التفعيل بعد من إدارة المنصة)"}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {!isActive && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-warning text-surface px-3.5 py-1.5 text-xs font-extrabold shadow-sm hover:opacity-90 transition-opacity"
            >
              <span>تواصل مع الدعم للتفعيل</span>
            </button>
          )}

          <span
            className={`rounded-full px-3 py-1 text-xs font-extrabold shadow-sm ${
              isActive
                ? "bg-success/20 text-success border border-success/30"
                : "bg-warning/20 text-warning border border-warning/30"
            }`}
          >
            {isActive ? "مُفعل" : "لم يتم التفعيل"}
          </span>
        </div>
      </div>

      <SupportActivationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
