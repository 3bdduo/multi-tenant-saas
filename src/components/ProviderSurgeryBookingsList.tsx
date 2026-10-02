"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllSurgeryBookingsForProviders } from "@/lib/api/surgeryBooking";
import { Card } from "@/components/ui/Card";
import type { SurgeryBooking } from "@/types/api";

function patientInfo(b: SurgeryBooking) {
  const p = typeof b.patientId === "object" ? b.patientId : null;
  return p ? `${p.firstName} ${p.lastName}` : "مريض";
}

export function ProviderSurgeryBookingsList({ basePath }: { basePath: string }) {
  const [bookings, setBookings] = useState<SurgeryBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllSurgeryBookingsForProviders()
      .then((res) => setBookings(res.data.bookings ?? []))
      .catch((err) => console.error("Failed to load surgery bookings:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl pb-16">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">
          طلبات حجز العمليات
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          كل طلبات حجز العمليات المتاحة من المرضى — اقبل أي طلب وتواصل مع المريض.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-20 animate-pulse bg-surface-raised" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card className="py-16 text-center text-text-secondary">
          <p className="text-base font-semibold">مفيش طلبات متاحة دلوقتي</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => (
            <Link key={b._id} href={`${basePath}/${b._id}`}>
              <Card hover className="p-4 sm:p-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">{b.title}</p>
                  <p className="text-xs text-text-secondary mt-1">{patientInfo(b)}</p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold shrink-0 ${
                    b.status === "Accepted"
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "bg-warning/15 text-warning border-warning/30"
                  }`}
                >
                  {b.status === "Accepted" ? "مقبول" : "بانتظار رد"}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
