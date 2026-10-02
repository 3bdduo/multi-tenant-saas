"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllConsultations } from "@/lib/api/consultation";
import { Card } from "@/components/ui/Card";
import type { Consultation } from "@/types/api";

function patientName(c: Consultation) {
  const p = typeof c.patientId === "object" ? c.patientId : null;
  return p ? `${p.firstName} ${p.lastName}` : "مريض";
}

function lastPreview(c: Consultation) {
  const last = c.messages[c.messages.length - 1];
  if (!last) return "";
  return last.text?.slice(0, 90) || (last.image ? "صورة مرفقة" : "");
}

function hasDoctorReply(c: Consultation) {
  return c.messages.some((m) => m.senderType === "Doctor");
}

export default function DoctorConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllConsultations()
      .then((res) => setConsultations(res.data.consultations ?? []))
      .catch((err) => console.error("Failed to load consultations:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl pb-16">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">
          الاستشارات الطبية العامة
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          كل الاستشارات اللي بعتها المرضى على المنصة — أي طبيب يقدر يضيف رأيه، حتى لو مش عنده مواعيد مع المريض.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-20 animate-pulse bg-surface-raised" />
          ))}
        </div>
      ) : consultations.length === 0 ? (
        <Card className="py-16 text-center text-text-secondary">
          <p className="text-base font-semibold">مفيش استشارات لسه</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {consultations.map((c) => (
            <Link key={c._id} href={`/doctor/consultations/${c._id}`}>
              <Card hover className="p-4 sm:p-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-text-primary">
                      {patientName(c)}
                    </span>
                    {!hasDoctorReply(c) && (
                      <span className="rounded-full bg-warning/15 text-warning border border-warning/30 px-2 py-0.5 text-[10px] font-bold">
                        بانتظار رد طبيب
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary truncate">{lastPreview(c)}</p>
                </div>
                <span className="text-xs text-text-secondary shrink-0">
                  {new Date(c.lastMessageAt).toLocaleDateString("ar-EG")}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
