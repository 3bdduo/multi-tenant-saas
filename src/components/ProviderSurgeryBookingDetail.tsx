"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSurgeryBookingById,
  acceptSurgeryBooking,
  completeSurgeryBooking,
} from "@/lib/api/surgeryBooking";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { SurgeryBooking } from "@/types/api";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/http";

export function ProviderSurgeryBookingDetail({
  id,
  basePath,
}: {
  id: string;
  basePath: string;
}) {
  const router = useRouter();
  const { role } = useAuth();
  const [booking, setBooking] = useState<SurgeryBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      const res = await getSurgeryBookingById(id);
      setBooking(res.data.booking);
    } catch {
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    setActionLoading(true);
    setError(null);
    try {
      await acceptSurgeryBooking(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر قبول الطلب");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleComplete() {
    setActionLoading(true);
    setError(null);
    try {
      await completeSurgeryBooking(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر إغلاق الطلب");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto pb-16">
        <Card className="h-40 animate-pulse bg-surface-raised" />
      </div>
    );
  }

  if (!booking) {
    return (
      <Card className="max-w-2xl mx-auto py-16 text-center text-text-secondary">
        <p className="text-base font-semibold">تعذّر العثور على هذا الطلب</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => router.push(basePath)}>
          الرجوع لكل الطلبات
        </Button>
      </Card>
    );
  }

  const patient = typeof booking.patientId === "object" ? booking.patientId : null;
  const acceptedByMe =
    booking.status === "Accepted" &&
    booking.acceptedByRole === role &&
    typeof booking.acceptedById === "object";

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-16 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary">
          {booking.title}
        </h1>
        <Button variant="secondary" size="sm" onClick={() => router.push(basePath)}>
          كل الطلبات
        </Button>
      </div>

      {patient && (
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary">المريض</p>
            <p className="text-sm font-bold text-text-primary">
              {patient.firstName} {patient.lastName}
            </p>
          </div>
          {patient.phoneNumber && (
            <a href={`tel:${patient.phoneNumber}`} className="text-sm font-bold text-primary">
              {patient.phoneNumber}
            </a>
          )}
        </Card>
      )}

      {booking.description && (
        <Card className="p-4">
          <p className="text-xs font-bold text-text-secondary mb-1">تفاصيل الطلب</p>
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

      {error && (
        <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-xs text-danger font-bold">
          {error}
        </div>
      )}

      {booking.status === "Pending" && (
        <Button variant="vibrant" disabled={actionLoading} loading={actionLoading} onClick={handleAccept} className="shadow-glow-cyan font-bold">
          قبول الطلب والتواصل مع المريض
        </Button>
      )}
      {acceptedByMe && (
        <Button variant="secondary" disabled={actionLoading} loading={actionLoading} onClick={handleComplete}>
          إغلاق الطلب كمكتمل
        </Button>
      )}
      {booking.status === "Accepted" && !acceptedByMe && (
        <Card className="p-4 text-center text-xs text-text-secondary bg-surface-raised/60">
          تم قبول هذا الطلب بالفعل من جهة أخرى
        </Card>
      )}
    </div>
  );
}
