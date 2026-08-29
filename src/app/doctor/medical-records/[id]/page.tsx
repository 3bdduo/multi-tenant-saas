"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMedicalRecordById } from "@/lib/api/medicalRecord";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import type { MedicalRecord } from "@/types/api";

export default function MedicalRecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getMedicalRecordById(id)
      .then((res) => setRecord(res.data.medicalRecord))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) {
          setError("ليس لديك صلاحية لعرض هذا السجل — السجل خاص أو لا توجد علاقة موعد مع هذا المريض");
        } else {
          setError(err instanceof ApiError ? err.message : "تعذّر جلب السجل الطبي");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-fade-in max-w-2xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-border/50" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-lg text-center p-8 border-danger/30 animate-fade-in">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 text-2xl">
          
        </div>
        <p className="font-bold text-danger">{error}</p>
        <Button className="mt-4" variant="secondary" onClick={() => router.back()}>العودة</Button>
      </Card>
    );
  }

  if (!record) return null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-2xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors w-fit"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        العودة
      </button>

      {/* Header Card */}
      <Card glass vibrant className="border-primary/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-text-primary">
              سجل طبي
            </h1>
            <p className="mt-1 text-xs text-text-secondary">
              تاريخ الإنشاء: {new Date(record.createdAt).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <span
            className={`rounded-full px-4 py-1.5 text-xs font-bold ${
              record.visibility === "shared"
                ? "bg-success/15 text-success border border-success/30"
                : "bg-surface-raised text-text-secondary border border-border/60"
            }`}
          >
            {record.visibility === "shared" ? "مشارك" : "خاص"}
          </span>
        </div>
      </Card>

      {/* Prescription Image */}
      {record.prescriptionImageUrl && (
        <Card>
          <h2 className="font-display text-sm font-bold text-text-primary mb-3">صورة الروشتة</h2>
          <img
            src={record.prescriptionImageUrl}
            alt="prescription"
            className="rounded-xl max-h-72 object-contain border border-border/40"
          />
        </Card>
      )}

      {/* Diagnosis */}
      <Card>
        <h2 className="font-display text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">
          التشخيص
        </h2>
        <p className="text-text-primary font-medium leading-relaxed">{record.diagnosis}</p>
      </Card>

      {/* Medications */}
      {record.medications.length > 0 && (
        <Card>
          <h2 className="font-display text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">
            الأدوية الموصوفة ({record.medications.length})
          </h2>
          <div className="flex flex-col gap-3">
            {record.medications.map((m, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border/60 bg-surface-raised p-4 flex flex-col gap-1.5"
              >
                <p className="font-display font-bold text-text-primary">{m.name}</p>
                <div className="flex flex-wrap gap-4 text-xs text-text-secondary mt-1">
                  {m.dosage && (
                    <span className="flex items-center gap-1">
                      <span className="text-accent font-bold">الجرعة:</span> {m.dosage}
                    </span>
                  )}
                  {m.frequency && (
                    <span className="flex items-center gap-1">
                      <span className="text-accent font-bold">التكرار:</span> {m.frequency}
                    </span>
                  )}
                  {m.duration && (
                    <span className="flex items-center gap-1">
                      <span className="text-accent font-bold">المدة:</span> {m.duration}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Notes */}
      {record.notes && (
        <Card>
          <h2 className="font-display text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">
            ملاحظات
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">{record.notes}</p>
        </Card>
      )}

      {/* Visibility Note */}
      <div className="rounded-xl bg-surface-raised border border-border/50 px-4 py-3 text-xs text-text-secondary">
        {record.visibility === "shared"
          ? " هذا السجل مشارك — يمكن للمريض ودكاترة آخرين لهم مواعيد معه رؤيته"
          : " هذا السجل خاص — لا يمكن لأحد سواك رؤيته"}
      </div>
    </div>
  );
}
