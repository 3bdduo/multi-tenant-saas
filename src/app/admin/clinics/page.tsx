"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getClinics } from "@/lib/api/admin";
import { Card } from "@/components/ui/Card";
import type { Clinic } from "@/types/api";

export default function AdminClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClinics()
      .then((res) => setClinics(res.data.clinics ?? []))
      .catch((err) => {
        console.error("Failed to load clinics:", err);
        setClinics([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      {clinics.map((c) => (
        <Link key={c._id} href={`/admin/clinics/${c._id}`}>
          <Card hover className="h-full flex flex-col transition-all duration-300">
            <p className="font-display font-bold text-text-primary text-lg">{c.name}</p>
            <p className="mt-1 text-xs font-bold text-primary bg-primary/10 self-start px-2 py-0.5 rounded-full">{c.specialization}</p>
            
            <div className="mt-4 flex-1">
              <p className="text-sm text-text-secondary flex items-center gap-1.5 mb-2">
                <span className="font-semibold text-text-primary">الموقع:</span>
                <span>{c.city}، {c.governorate}</span>
              </p>
              <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                <span className="font-semibold">سعر الكشف:</span>
                <span>{c.consultationPrice} ج.م</span>
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-border/50 text-xs font-bold text-accent flex justify-end items-center gap-1 group">
              عرض التفاصيل
              <span className="group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1">→</span>
            </div>
          </Card>
        </Link>
      ))}
      {!loading && clinics.length === 0 && (
        <p className="col-span-full py-10 text-center text-sm text-text-secondary">
          لا توجد عيادات
        </p>
      )}
    </div>
  );
}
