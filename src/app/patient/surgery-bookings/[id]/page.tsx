"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSurgeryBookingById, cancelSurgeryBooking } from "@/lib/api/surgeryBooking";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { SurgeryBooking } from "@/types/api";

export default function PatientSurgeryBookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [booking, setBooking] = useState<SurgeryBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    load();
  }, [params.id]);

  async function load() {
    try {
      const res = await getSurgeryBookingById(params.id);
      setBooking(res.data.booking);
    } catch {
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) return;
    setCancelling(true);
    try {
      await cancelSurgeryBooking(params.id);
      await load();
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-4 pb-16">
        <Card className="h-40 animate-pulse bg-surface-raised" />
      </div>
    );
  }

  if (!booking) {
    return (
      <Card className="max-w-2xl mx-auto py-16 text-center text-text-secondary">
        <p className="text-base font-semibold">تعذّر العثور على هذا الطلب</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => router.push("/patient/surgery-bookings")}>
          الرجوع لكل الطلبات
        </Button>
      </Card>
    );
  }

  const acceptedProvider = typeof booking.acceptedById === "object" ? booking.acceptedById : null;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-16 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary">
          {booking.title}
        </h1>
        <Button variant="secondary" size="sm" onClick={() => router.push("/patient/surgery-bookings")}>
          كل الطلبات
        </Button>
      </div>

      <Card glass vibrant className="border-primary/30 p-5 text-center">
        <p className="text-sm font-bold text-text-primary">{booking.statusMessage}</p>
        {acceptedProvider && (
          <div className="mt-3 text-xs text-text-secondary space-y-1">
            {"hospitalName" in acceptedProvider && acceptedProvider.hospitalName && (
              <p className="font-bold text-text-primary">{acceptedProvider.hospitalName}</p>
            )}
            {"firstName" in acceptedProvider && acceptedProvider.firstName && (
              <p className="font-bold text-text-primary">
                د. {acceptedProvider.firstName} {acceptedProvider.lastName}
              </p>
            )}
          </div>
        )}
      </Card>

      {booking.description && (
        <Card className="p-4">
          <p className="text-xs font-bold text-text-secondary mb-1">تفاصيل إضافية</p>
          <p className="text-sm text-text-primary whitespace-pre-wrap">{booking.description}</p>
        </Card>
      )}

      {booking.reports.length > 0 && (
        <Card className="p-4">
          <p className="text-xs font-bold text-text-secondary mb-3">التقارير المرفقة</p>
          <div className="grid grid-cols-3 gap-2">
            {booking.reports.map((r, i) => (
              <a key={i} href={r.secure_url} target="_blank" rel="noopener noreferrer">
                <img src={r.secure_url} alt={`تقرير ${i + 1}`} className="rounded-lg aspect-square object-cover border border-border/40" />
              </a>
            ))}
          </div>
        </Card>
      )}

      <p className="text-xs text-text-secondary text-center">كود الطلب: {booking.bookingCode}</p>

      {booking.status === "Pending" && (
        <Button variant="outline" disabled={cancelling} loading={cancelling} onClick={handleCancel} className="text-danger border-danger/30 hover:bg-danger/10">
          إلغاء الطلب
        </Button>
      )}
    </div>
  );
}
