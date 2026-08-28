"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublicClinics } from "@/lib/api/public";
import { Clinic } from "@/types/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function PublicClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");

  useEffect(() => {
    async function fetchClinics() {
      try {
        const res = await getPublicClinics();
        if (res.success) {
          setClinics(res.data.clinics);
        }
      } catch (err) {
        console.error("Failed to fetch public clinics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClinics();
  }, []);

  const specialties = Array.from(new Set(clinics.map((c) => c.specialization)));
  const filteredClinics = selectedSpecialty === "all" ? clinics : clinics.filter((c) => c.specialization === selectedSpecialty);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:px-12 animate-fade-in">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-text-primary">
            تصفح العيادات المتاحة
          </h1>
          <p className="mt-2 text-text-secondary">
            اختر التخصص والعيادة المناسبة لحجز موعدك فوراً
          </p>
        </div>
        
        {/* Specialty Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            size="sm"
            variant={selectedSpecialty === "all" ? "vibrant" : "secondary"}
            onClick={() => setSelectedSpecialty("all")}
          >
            الكل
          </Button>
          {specialties.map((spec) => (
            <Button
              key={spec}
              size="sm"
              variant={selectedSpecialty === spec ? "vibrant" : "secondary"}
              onClick={() => setSelectedSpecialty(spec)}
            >
              {spec}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-48 animate-pulse bg-surface-raised" />
          ))}
        </div>
      ) : filteredClinics.length === 0 ? (
        <div className="py-20 text-center text-text-secondary">
          <p>لا توجد عيادات متاحة في هذا التخصص حالياً.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClinics.map((clinic) => (
            <Card key={clinic._id} hover className="flex flex-col gap-4">
              <div>
                <h3 className="font-display text-xl font-bold text-text-primary">
                  {clinic.name}
                </h3>
                <span className="inline-block mt-2 rounded bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {clinic.specialization}
                </span>
              </div>
              <p className="text-sm text-text-secondary line-clamp-2">
                {clinic.description || "لا يوجد وصف."}
              </p>
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex flex-col text-xs font-semibold text-text-primary">
                  <span>كشف: <strong className="text-accent">{clinic.consultationPrice} ج.م</strong></span>
                  <span className="text-text-secondary text-[11px]">إعادة: <strong className="text-primary">{clinic.followUpPrice != null ? clinic.followUpPrice : clinic.consultationPrice} ج.م</strong></span>
                </div>
                <Link href={`/clinics/${clinic._id}`}>
                  <Button size="sm" variant="vibrant" className="shadow-glow-cyan font-bold">
                    التفاصيل والحجز
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
