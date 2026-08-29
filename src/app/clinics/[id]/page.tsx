"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getPublicClinicById, getPublicClinicSlots } from "@/lib/api/public";
import { createAppointmentByPatient, getMyAppointments } from "@/lib/api/appointment";
import { getMyProfile } from "@/lib/api/patient";
import { useAuth } from "@/hooks/useAuth";
import type { Clinic, Patient } from "@/types/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";

/* ─── helpers ─────────────────────────────────────────────── */
function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

const DAY_MAP: Record<string, string> = {
  Sunday: "الأحد",
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
  Saturday: "السبت",
};

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso.slice(0, 5);
    return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return iso;
  }
}

/* ─── Page ─────────────────────────────────────────────────── */
export default function ClinicDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [patientProfile, setPatientProfile] = useState<Patient | null>(null);

  // Booking form state
  const [date, setDate] = useState(tomorrow());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [visitingType, setVisitingType] = useState<"NEW" | "FOLLOW_UP">("NEW");
  const [hasPreviousVisit, setHasPreviousVisit] = useState(false);

  // Booking confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [contactPhone, setContactPhone] = useState("");

  // Slots state (only for time clinics)
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Booking feedback state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
    queueNumber?: number;
    startTime?: string;
  } | null>(null);

  /* ── Load clinic ──────────────────────────────────────── */
  useEffect(() => {
    async function load() {
      try {
        const res = await getPublicClinicById(params.id);
        if (res.success) {
          const loadedClinic = res.data.clinic;
          setClinic(loadedClinic);

          if (isAuthenticated && role === "Patient") {
            // Load patient profile for modal pre-fill
            try {
              const profileRes = await getMyProfile();
              setPatientProfile(profileRes.data.patient);
            } catch { /* ignore */ }

            // Check previous visits
            try {
              const apptsRes = await getMyAppointments();
              const myAppts = apptsRes.data.appointments ?? [];
              const docId = typeof loadedClinic.doctorId === "string"
                ? loadedClinic.doctorId
                : loadedClinic.doctorId?._id;
              const prev = myAppts.some((a) => {
                const aDocId = typeof a.doctorId === "object" ? a.doctorId?._id : a.doctorId;
                const aClinicId = typeof a.clinicId === "object" ? a.clinicId?._id : a.clinicId;
                return (
                  (aDocId === docId || aClinicId === params.id) &&
                  (a.status === "completed" || a.status === "confirmed" || a.status === "pending")
                );
              });
              if (prev) {
                setHasPreviousVisit(true);
                setVisitingType("FOLLOW_UP");
              }
            } catch { /* ignore */ }
          }
        }
      } catch {
        /* not found */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, isAuthenticated, role]);

  /* ── Fetch slots ──────────────────────────────────────── */
  const fetchSlots = useCallback(
    async (selectedDate: string) => {
      if (!clinic || clinic.bookingType !== "time" || !selectedDate) return;
      setSlotsLoading(true);
      setSlotsError(null);
      setSelectedSlot("");
      try {
        const res = await getPublicClinicSlots(params.id, selectedDate);
        setSlots(res.data.availableSlots ?? []);
      } catch (err: any) {
        setSlotsError(err?.message || "تعذّر تحميل المواعيد المتاحة");
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    },
    [clinic, params.id]
  );

  useEffect(() => {
    if (clinic?.bookingType === "time" && date) fetchSlots(date);
  }, [date, fetchSlots, clinic?.bookingType]);

  /* ── Open confirmation modal ──────────────────────────── */
  function handleOpenConfirmModal(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/clinics/${params.id}`);
      return;
    }
    if (role !== "Patient") {
      setMessage({ type: "error", text: "فقط المرضى يمكنهم الحجز. يرجى تسجيل الدخول كـ مريض." });
      return;
    }
    setShowConfirmModal(true);
  }

  /* ── Confirm booking ──────────────────────────────────── */
  async function handleConfirmBook() {
    if (!date || !clinic) return;

    const doctorId =
      typeof clinic.doctorId === "string" ? clinic.doctorId : clinic.doctorId?._id;
    if (!doctorId) {
      setMessage({ type: "error", text: "لا يمكن تحديد الطبيب المعالج لهذه العيادة." });
      setShowConfirmModal(false);
      return;
    }

    setBookingLoading(true);
    setMessage(null);
    setShowConfirmModal(false);

    try {
      const payload: {
        doctorId: string;
        date: string;
        startTime?: string;
        visitingType?: "NEW" | "FOLLOW_UP";
        contactPhone?: string;
      } = {
        doctorId,
        date,
        visitingType,
        contactPhone: contactPhone || undefined,
      };

      if (clinic.bookingType === "time") {
        payload.startTime = selectedSlot;
      }

      const res = await createAppointmentByPatient(payload);
      const appt = res.data.createdAppointment;

      if (appt.status === "waitlisted") {
        setMessage({
          type: "warning",
          text: "تم تسجيل طلبك، لكنك في قائمة الانتظار حالياً. سيتم تأكيد موعدك عند توفر مكان.",
        });
      } else {
        const visitLabel = visitingType === "FOLLOW_UP" ? "إعادة كشف" : "كشف جديد";
        setMessage({
          type: "success",
          text:
            clinic.bookingType === "queue"
              ? `تم حجز موعد (${visitLabel}) بنجاح! رقمك في الدور: ${appt.queueNumber ?? "—"}`
              : `تم حجز موعد (${visitLabel}) بنجاح! موعدك الساعة ${appt.startTime ? appt.startTime.slice(11, 16) : selectedSlot}`,
          queueNumber: appt.queueNumber,
          startTime: appt.startTime,
        });
      }

      setDate(tomorrow());
      setSelectedSlot("");
      setContactPhone("");
      if (clinic.bookingType === "time") fetchSlots(tomorrow());
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 409) {
        setMessage({
          type: "error",
          text: "هذا الموعد تم حجزه للتو من شخص آخر. يرجى اختيار وقت آخر.",
        });
        fetchSlots(date);
      } else {
        setMessage({ type: "error", text: err.message || "حدث خطأ أثناء الحجز، يرجى المحاولة لاحقاً." });
      }
    } finally {
      setBookingLoading(false);
    }
  }

  /* ── Guards ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12 md:px-12">
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="h-64 animate-pulse bg-surface-raised" />
          <Card className="h-64 animate-pulse bg-surface-raised" />
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center md:px-12">
        <h1 className="text-2xl font-bold text-text-primary">العيادة غير موجودة</h1>
        <Button className="mt-4" onClick={() => router.push("/clinics")}>
          العودة للعيادات
        </Button>
      </div>
    );
  }

  const isQueue = clinic.bookingType !== "time";
  const isInactive = clinic.isActive === false;
  const followUpPrice = clinic.followUpPrice != null ? clinic.followUpPrice : clinic.consultationPrice;
  const canSubmit =
    !isInactive && date && (isQueue || (selectedSlot !== "" && !slotsLoading));

  const currentPrice = visitingType === "FOLLOW_UP" ? followUpPrice : clinic.consultationPrice;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-12 md:px-12 animate-fade-in">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.push("/clinics")} className="mb-3 sm:mb-4 font-bold">
          العودة لقائمة العيادات
        </Button>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">{clinic.name}</h1>
          <span
            className={`rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-extrabold border shrink-0 ${
              isInactive
                ? "bg-danger/10 text-danger border-danger/30"
                : "bg-success/10 text-success border-success/30"
            }`}
          >
            {isInactive ? "مغلقة حالياً" : "تقبل حجوزات"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
          <span className="rounded bg-primary/10 px-2.5 py-0.5 text-xs sm:text-sm font-semibold text-primary">
            {clinic.specialization}
          </span>
          <span className="text-xs sm:text-sm text-text-secondary">
            {clinic.governorate} - {clinic.city}
          </span>
          <span
            className={`rounded px-2 py-0.5 text-[11px] sm:text-xs font-bold ${
              isQueue
                ? "bg-accent/10 text-accent border border-accent/30"
                : "bg-primary/10 text-primary border border-primary/30"
            }`}
          >
            {isQueue ? "حجز بالدور" : "حجز بمواعيد محددة"}
          </span>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* ── Clinic Info Card ─────────────────────────────── */}
        <Card>
          <h2 className="font-display text-xl font-bold text-text-primary mb-4">تفاصيل العيادة</h2>
          <p className="text-text-secondary mb-6 leading-relaxed">
            {clinic.description || "لا يوجد وصف."}
          </p>

          <div className="space-y-0 divide-y divide-border/40 text-sm">
            <InfoRow label="سعر الكشف (جديد)" value={clinic.consultationPrice != null ? `${clinic.consultationPrice} ج.م` : "غير محدد"} accent />
            <InfoRow label="سعر إعادة الكشف / متابعة" value={followUpPrice != null ? `${followUpPrice} ج.م` : "غير محدد"} accent />
            <InfoRow label="العنوان" value={clinic.street || "غير محدد"} />
            <InfoRow label="رقم الهاتف" value={clinic.phoneNumber || "غير متوفر"} dir="ltr" />
          </div>

          {/* Working days */}
          {clinic.workingDays?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-text-primary mb-3">أيام العمل</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                {clinic.workingDays.map((wd, i) => (
                  <li key={i} className="flex justify-between rounded-xl bg-surface-raised px-3 py-2">
                    <span className="font-semibold text-text-primary">
                      {DAY_MAP[wd.day] ?? wd.day}
                    </span>
                    <span dir="ltr">
                      {formatTime(wd.from)} – {formatTime(wd.to)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* ── Booking Card ─────────────────────────────────── */}
        <Card glass vibrant className="flex flex-col">
          <h2 className="font-display text-xl font-bold text-text-primary mb-2">
            {isInactive ? "العيادة مغلقة حالياً" : "احجز موعدك"}
          </h2>

          {isInactive ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
              <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
                هذه العيادة غير متاحة للحجز حالياً. يرجى التواصل مع العيادة أو المحاولة في وقت لاحق.
              </p>
              {clinic.phoneNumber && (
                <a
                  href={`tel:${clinic.phoneNumber}`}
                  className="rounded-xl bg-primary/10 text-primary px-4 py-2 text-sm font-bold hover:bg-primary/20 transition-colors"
                >
                  {clinic.phoneNumber}
                </a>
              )}
            </div>
          ) : (
            <form onSubmit={handleOpenConfirmModal} className="flex flex-col gap-5 flex-1">

              {/* Returning Patient Recognition Banner */}
              {hasPreviousVisit && (
                <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3.5 text-xs text-primary font-bold animate-fade-in">
                  مرحباً بك مجدداً! تم تحديد (إعادة الكشف) تلقائياً كمريض سابق لدى الطبيب.
                </div>
              )}

              {/* Visit Type Selector */}
              <div>
                <label className="mb-2 block text-sm font-bold text-text-primary">
                  نوع الكشف المطلوب *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setVisitingType("NEW")}
                    className={`flex flex-col items-start p-3 sm:p-3.5 rounded-2xl border transition-all ${
                      visitingType === "NEW"
                        ? "bg-primary text-surface border-primary shadow-glow-cyan font-bold"
                        : "border-border/70 bg-surface text-text-secondary hover:border-primary/40"
                    }`}
                  >
                    <span className="text-xs font-black">كشف جديد</span>
                    <span className="text-base font-extrabold mt-0.5 sm:mt-1">
                      {clinic.consultationPrice} ج.م
                    </span>
                    <span className={`text-[10px] mt-0.5 ${visitingType === "NEW" ? "opacity-90" : "opacity-60"}`}>
                      لأول مرة في العيادة
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisitingType("FOLLOW_UP")}
                    className={`flex flex-col items-start p-3 sm:p-3.5 rounded-2xl border transition-all ${
                      visitingType === "FOLLOW_UP"
                        ? "bg-primary text-surface border-primary shadow-glow-cyan font-bold"
                        : "border-border/70 bg-surface text-text-secondary hover:border-primary/40"
                    }`}
                  >
                    <span className="text-xs font-black">إعادة كشف / متابعة</span>
                    <span className="text-base font-extrabold mt-0.5 sm:mt-1">
                      {followUpPrice} ج.م
                    </span>
                    <span className={`text-[10px] mt-0.5 ${visitingType === "FOLLOW_UP" ? "opacity-90" : "opacity-60"}`}>
                      لمن كشف سابقاً
                    </span>
                  </button>
                </div>
              </div>

              {/* Date picker */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-text-primary">
                  تاريخ الحجز *
                </label>
                <input
                  type="date"
                  required
                  min={tomorrow()}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setMessage(null);
                  }}
                  className="w-full rounded-xl border border-border/80 bg-surface px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.1)]"
                />
              </div>

              {/* Time slots — only for 'time' clinics */}
              {!isQueue && date && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-text-primary">
                    اختر الوقت المناسب *
                  </label>
                  {slotsLoading ? (
                    <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-surface-raised px-4 py-3 text-sm text-text-secondary">
                      <span className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      جارٍ تحميل الأوقات المتاحة...
                    </div>
                  ) : slotsError ? (
                    <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-sm text-danger text-center">
                      {slotsError}
                    </div>
                  ) : slots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-xl border min-h-[42px] px-3 py-2 text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-center ${
                            selectedSlot === slot
                              ? "bg-primary text-surface border-primary shadow-glow-cyan"
                              : "border-border/60 hover:border-primary/40 text-text-primary bg-surface-raised"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-warning/10 border border-warning/20 p-3 text-sm text-warning text-center">
                      لا توجد مواعيد متاحة في هذا اليوم. يرجى اختيار يوم آخر.
                    </div>
                  )}
                </div>
              )}

              {/* Queue notice */}
              {isQueue && date && (
                <div className="rounded-xl bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-text-primary">
                  <span className="font-bold text-accent">نظام الطابور:</span> ستحصل على رقم دور تلقائياً عند تأكيد الحجز.
                </div>
              )}

              {/* Feedback message */}
              {message && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm font-medium animate-fade-in border ${
                    message.type === "success"
                      ? "bg-success/10 text-success border-success/20"
                      : message.type === "warning"
                      ? "bg-warning/10 text-warning border-warning/20"
                      : "bg-danger/10 text-danger border-danger/20"
                  }`}
                >
                  {message.text}
                  {message.type === "error" && clinic.bookingType === "time" && (
                    <button
                      type="button"
                      onClick={() => fetchSlots(date)}
                      className="block mt-1 underline text-xs opacity-70 hover:opacity-100"
                    >
                      تحديث الأوقات المتاحة
                    </button>
                  )}
                </div>
              )}

              {/* Submit */}
              <div className="mt-auto pt-4">
                {!isAuthenticated ? (
                  <Button
                    type="submit"
                    variant="vibrant"
                    className="w-full font-bold shadow-glow-cyan"
                  >
                    سجّل دخولك للحجز
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="vibrant"
                    className="w-full shadow-glow-cyan font-bold py-3.5"
                    loading={bookingLoading}
                    disabled={!canSubmit || bookingLoading}
                  >
                    {bookingLoading
                      ? "جارٍ تأكيد الحجز..."
                      : isQueue
                      ? `متابعة الحجز (${visitingType === "FOLLOW_UP" ? `إعادة كشف - ${followUpPrice} ج.م` : `كشف جديد - ${clinic.consultationPrice} ج.م`})`
                      : selectedSlot
                      ? `متابعة الحجز — ${selectedSlot} (${visitingType === "FOLLOW_UP" ? `إعادة كشف - ${followUpPrice} ج.م` : `كشف جديد - ${clinic.consultationPrice} ج.م`})`
                      : "اختر وقتاً أولاً"}
                  </Button>
                )}
              </div>
            </form>
          )}
        </Card>
      </div>

      {/* ── Booking Confirmation Modal ─────────────────────── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="max-w-sm w-full shadow-2xl bg-surface p-5 sm:p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/50">
              <h3 className="font-display text-lg font-bold text-text-primary">تأكيد بيانات الحجز</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-text-secondary hover:text-text-primary text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Booking Summary */}
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-3.5 mb-4 text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-text-secondary">نوع الكشف</span>
                <span className="font-bold text-text-primary">
                  {visitingType === "FOLLOW_UP" ? "إعادة كشف" : "كشف جديد"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">التاريخ</span>
                <span className="font-bold text-text-primary" dir="ltr">{date}</span>
              </div>
              {!isQueue && selectedSlot && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">الوقت</span>
                  <span className="font-bold text-text-primary" dir="ltr">{selectedSlot}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-primary/20 pt-1.5 mt-1.5">
                <span className="text-text-secondary">السعر</span>
                <span className="font-black text-accent text-base">{currentPrice} ج.م</span>
              </div>
            </div>

            {/* Patient Info (pre-filled, read-only) */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">اسم المريض</label>
                <div className="w-full rounded-xl border border-border/60 bg-surface-raised px-4 py-2.5 text-sm text-text-primary font-semibold">
                  {patientProfile
                    ? `${patientProfile.firstName} ${patientProfile.lastName}`
                    : "—"}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">رقم الهاتف</label>
                <div className="w-full rounded-xl border border-border/60 bg-surface-raised px-4 py-2.5 text-sm text-text-primary font-semibold" dir="ltr">
                  {patientProfile?.phoneNumber || "—"}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  رقم تليفون آخر للتواصل <span className="text-text-secondary font-normal">(اختياري)</span>
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                  className="w-full rounded-xl border border-border/80 bg-surface px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.1)]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowConfirmModal(false)}
                disabled={bookingLoading}
              >
                رجوع
              </Button>
              <Button
                variant="vibrant"
                className="flex-1 shadow-glow-cyan font-bold"
                onClick={handleConfirmBook}
                loading={bookingLoading}
                disabled={bookingLoading}
              >
                {bookingLoading ? "جارٍ الحجز..." : "تأكيد الحجز"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ─── Info row component ─────────────────────────────── */
function InfoRow({
  label,
  value,
  accent,
  dir,
}: {
  label: string;
  value?: string | number | null;
  accent?: boolean;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-text-secondary">{label}</span>
      <span
        className={`font-semibold ${accent ? "text-accent text-base font-black" : "text-text-primary"}`}
        dir={dir}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}
