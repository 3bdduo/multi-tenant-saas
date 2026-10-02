"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import Link from "next/link";
import { createSurgeryBooking, getMySurgeryBookings } from "@/lib/api/surgeryBooking";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { SurgeryBooking } from "@/types/api";
import { ApiError } from "@/lib/http";

const STATUS_LABEL: Record<string, string> = {
  Pending: "قيد المراجعة",
  Accepted: "تم القبول",
  Completed: "مكتمل",
  Cancelled: "ملغي",
};
const STATUS_COLOR: Record<string, string> = {
  Pending: "bg-warning/15 text-warning border-warning/30",
  Accepted: "bg-primary/15 text-primary border-primary/30",
  Completed: "bg-success/15 text-success border-success/30",
  Cancelled: "bg-danger/15 text-danger border-danger/30",
};

export default function PatientSurgeryBookingsPage() {
  const [bookings, setBookings] = useState<SurgeryBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getMySurgeryBookings();
      setBookings(res.data.bookings ?? []);
    } catch (err) {
      console.error("Failed to load surgery bookings:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("يرجى كتابة اسم أو نوع العملية المطلوبة");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await createSurgeryBooking(files, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setTitle("");
      setDescription("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (res?.data?.booking) {
        setBookings((prev) => [res.data.booking, ...prev]);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر إرسال الطلب");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-4xl pb-16">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">
          حجز العمليات
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          قدّم طلب حجز عملية مع كل التقارير اللازمة، وأي طبيب أو مستشفى يقدر يقبله ويتواصل معك.
        </p>
      </div>

      <Card glass vibrant className="border-primary/30 p-5 sm:p-7 shadow-lg">
        <h2 className="font-display text-lg font-bold text-text-primary mb-4">طلب جديد</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-primary">اسم أو نوع العملية *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: عملية استئصال الزائدة الدودية"
              className="rounded-xl border border-border/80 bg-surface px-3 py-2.5 text-sm outline-none min-h-[44px]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-primary">تفاصيل إضافية (اختياري)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl border border-border/80 bg-surface px-3 py-2 text-sm outline-none resize-none h-20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-primary">
              التقارير والأشعة (حتى 5 ملفات)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 5))}
              className="rounded-xl border border-border/80 bg-surface px-4 py-2.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            {files.length > 0 && (
              <p className="text-xs text-text-secondary">{files.length} ملف مختار</p>
            )}
          </div>
          {error && (
            <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-xs sm:text-sm text-danger font-bold">
              {error}
            </div>
          )}
          <Button
            type="submit"
            variant="vibrant"
            disabled={submitting}
            loading={submitting}
            className="w-full shadow-glow-cyan font-bold min-h-[44px]"
          >
            {submitting ? "جارٍ الإرسال..." : "إرسال طلب الحجز"}
          </Button>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-base sm:text-lg text-text-primary">طلباتي</h2>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <Card key={i} className="h-20 animate-pulse bg-surface-raised" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card className="py-16 text-center text-text-secondary">
            <p className="text-base font-semibold">لسه ما قدّمتش أي طلب حجز عملية</p>
          </Card>
        ) : (
          bookings.map((b) => (
            <Link key={b._id} href={`/patient/surgery-bookings/${b._id}`}>
              <Card hover className="p-4 sm:p-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">{b.title}</p>
                  <p className="text-xs text-text-secondary mt-1">
                    كود الطلب: {b.bookingCode}
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold shrink-0 ${STATUS_COLOR[b.status]}`}>
                  {STATUS_LABEL[b.status]}
                </span>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
