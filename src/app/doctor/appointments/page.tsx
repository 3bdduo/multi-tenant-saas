"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DoctorActivationBanner } from "@/components/DoctorActivationBanner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getMyAppointments, updateAppointment, createAppointmentByDoctor } from "@/lib/api/appointment";
import { getMyPatients } from "@/lib/api/patient";
import { getMyClinic } from "@/lib/api/doctor";
import type { Appointment, AppointmentStatus, Clinic, Patient } from "@/types/api";
import { Field, SelectField, TextAreaField } from "@/components/ui/Input";
import { ApiError } from "@/lib/http";

type TabFilter = "active" | "completed" | "cancelled" | "past";

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>("active");
  const [searchQuery, setSearchQuery] = useState("");

  const [clinic, setClinic] = useState<Clinic | null>(null);

  const [showNewModal, setShowNewModal] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const [newPatientId, setNewPatientId] = useState("");
  const [newVisitingType, setNewVisitingType] = useState<"NEW" | "FOLLOW_UP">("NEW");
  const [newDate, setNewDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      const res = await getMyAppointments();
      setAppointments(res.data.appointments ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ── Optimistic status update — no full reload needed ──────────────────
  async function handleStatusUpdate(id: string, status: AppointmentStatus) {
    // Optimistic update: change state locally immediately
    setAppointments((prev) =>
      prev.map((a) => (a._id === id ? { ...a, status } : a))
    );
    try {
      await updateAppointment(id, { status });
    } catch (err) {
      console.error("Failed to update appointment:", err);
      // Rollback on failure by re-fetching
      fetchAppointments();
    }
  }

  async function openNewAppointmentModal() {
    setShowNewModal(true);
    setCreateError(null);
    setNewPatientId("");
    setNewVisitingType("NEW");
    setNewDate("");
    setNewNotes("");

    if (patients.length === 0) {
      setLoadingPatients(true);
      try {
        const res = await getMyPatients();
        setPatients(res.data.patients ?? []);
      } catch (err) {
        console.error("Failed to fetch patients", err);
      } finally {
        setLoadingPatients(false);
      }
    }

    if (!clinic) {
      try {
        const res = await getMyClinic();
        setClinic(res.data as unknown as Clinic);
      } catch {
      }
    }
  }

  async function handleCreateAppointment(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      await createAppointmentByDoctor(newPatientId, {
        date: newDate,
        notes: newNotes || undefined,
        visitingType: newVisitingType,
      });
      setShowNewModal(false);
      fetchAppointments();
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "تعذّر إنشاء الموعد");
    } finally {
      setCreating(false);
    }
  }

  const todayStr = new Date().toISOString().split("T")[0];

  // ── Filter logic ──────────────────────────────────────────────────────
  // active   → pending أو confirmed AND يومهم >= اليوم
  // completed→ status === completed (بغض النظر عن التاريخ)
  // cancelled→ status === cancelled (بغض النظر عن التاريخ)
  // past     → يومهم < اليوم AND status ليس completed ولا cancelled
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((appt) => {
        const apptDate = appt.date ? appt.date.split("T")[0] : "";
        const isPending = appt.status === "pending" || appt.status === "confirmed" || appt.status === "waitlisted";
        const isCompleted = appt.status === "completed";
        const isCancelled = appt.status === "cancelled";
        const isFutureOrToday = apptDate >= todayStr;
        const isPast = apptDate < todayStr;

        if (activeTab === "active") return isPending && isFutureOrToday;
        if (activeTab === "completed") return isCompleted;
        if (activeTab === "cancelled") return isCancelled;
        if (activeTab === "past") return isPending && isPast;
        return false;
      })
      .filter((appt) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const patientName =
          typeof appt.patientId === "object"
            ? `${appt.patientId.firstName} ${appt.patientId.lastName}`
            : appt.patientId;
        const phone = typeof appt.patientId === "object" ? appt.patientId.phoneNumber : "";
        const contactPhone = appt.contactPhone ?? "";
        return (
          patientName.toLowerCase().includes(q) ||
          phone.includes(q) ||
          contactPhone.includes(q)
        );
      });
  }, [appointments, activeTab, todayStr, searchQuery]);

  // Group by day
  const groupedAppointments = useMemo(() => {
    const groups: { [dateKey: string]: Appointment[] } = {};
    filteredAppointments.forEach((appt) => {
      const d = appt.date ? appt.date.split("T")[0] : "غير محدد";
      if (!groups[d]) groups[d] = [];
      groups[d].push(appt);
    });
    const sortedDates = Object.keys(groups).sort((a, b) => {
      if (activeTab === "past" || activeTab === "completed" || activeTab === "cancelled") {
        return b.localeCompare(a);
      }
      return a.localeCompare(b);
    });
    return sortedDates.map((dateKey) => ({ dateKey, items: groups[dateKey] }));
  }, [filteredAppointments, activeTab]);

  // Tab label descriptions
  const tabDescriptions: Record<TabFilter, string> = {
    active: "حجوزات لم يُكشف عنها بعد ويومها لم ينتهِ",
    completed: "جميع الحجوزات التي تم الكشف عنها",
    cancelled: "جميع الحجوزات التي تم إلغاؤها",
    past: "حجوزات انتهى يومها دون كشف أو إلغاء",
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      <DoctorActivationBanner />

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary">
            إدارة الحجوزات
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            متابعة وجدولة كشوفات العيادة مقسمة حسب الأيام مع تفاصيل كل مريض
          </p>
        </div>
        <Button
          onClick={openNewAppointmentModal}
          variant="vibrant"
          className="shadow-glow-cyan font-bold w-full sm:w-auto justify-center"
        >
          + حجز موعد جديد
        </Button>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <Card glass vibrant className="p-1.5 sm:p-2">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide py-1 px-1 -mx-1">
          <TabButton
            active={activeTab === "active"}
            onClick={() => setActiveTab("active")}
            label="الحالية"
            description="قيد الانتظار — يومها لم ينتهِ"
            color="primary"
          />
          <TabButton
            active={activeTab === "completed"}
            onClick={() => setActiveTab("completed")}
            label="السجل"
            description="تم الكشف"
            color="success"
          />
          <TabButton
            active={activeTab === "cancelled"}
            onClick={() => setActiveTab("cancelled")}
            label="الملغاة"
            description="تم الإلغاء"
            color="danger"
          />
          <TabButton
            active={activeTab === "past"}
            onClick={() => setActiveTab("past")}
            label="الأيام السابقة"
            description="انتهى يومها — بدون كشف أو إلغاء"
            color="warning"
          />
        </div>
        {/* Active tab description */}
        <p className="text-[11px] text-text-secondary px-2 pt-1 pb-0.5 font-medium">
          {tabDescriptions[activeTab]}
        </p>
      </Card>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="بحث باسم المريض أو رقم الهاتف أو هاتف التواصل..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-border/80 bg-surface px-5 py-3 text-sm text-text-primary placeholder:text-text-secondary outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.1)]"
        />
        <svg
          className="absolute left-4 top-3.5 h-5 w-5 text-text-secondary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Total count */}
      <div className="flex items-center justify-between rounded-2xl bg-surface-raised px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-text-primary border border-border/50">
        <span>إجمالي المواعيد في هذه القائمة</span>
        <span className="rounded-lg bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-black">
          {filteredAppointments.length} حجز
        </span>
      </div>

      {/* ── Appointments List ─────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-24 animate-pulse bg-surface-raised" />
          ))}
        </div>
      ) : groupedAppointments.length === 0 ? (
        <Card className="py-16 text-center text-text-secondary">
          <p className="text-base font-semibold">لا توجد حجوزات في هذه القائمة حتى الآن</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {groupedAppointments.map(({ dateKey, items }) => {
            const isToday = dateKey === todayStr;
            let formattedDayName = "يوم غير محدد";
            let formattedDateStr = dateKey;

            if (dateKey !== "غير محدد") {
              const dateObj = new Date(dateKey + "T00:00:00");
              formattedDayName = dateObj.toLocaleDateString("ar-EG", { weekday: "long" });
              formattedDateStr = dateObj.toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
            }

            return (
              <div key={dateKey} className="flex flex-col gap-3">
                {/* Day Header */}
                <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary/15 via-surface to-surface-raised px-4 sm:px-5 py-3 border border-primary/25 shadow-sm">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-display font-extrabold text-sm sm:text-base text-text-primary">
                      {formattedDayName} — {formattedDateStr}
                    </span>
                    {isToday && (
                      <span className="rounded-full bg-success text-surface text-[10px] sm:text-xs font-black px-2.5 py-0.5 shadow-sm">
                        اليوم
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-extrabold text-primary bg-primary-soft px-3 py-1 rounded-full">
                    {items.length} {items.length === 1 ? "حجز" : items.length === 2 ? "حجزان" : "حجوزات"}
                  </span>
                </div>

                {/* Day's appointments */}
                <div className="flex flex-col gap-3 sm:gap-3.5 pr-1 sm:pr-2">
                  {items.map((appt, index) => {
                    const patientObj = typeof appt.patientId === "object" ? appt.patientId : null;
                    const patientId = patientObj?._id ?? (typeof appt.patientId === "string" ? appt.patientId : null);
                    const patientName = patientObj
                      ? `${patientObj.firstName} ${patientObj.lastName}`
                      : (typeof appt.patientId === "string" ? appt.patientId : "—");
                    const patientPhone = patientObj?.phoneNumber ?? "—";
                    const contactPhone = appt.contactPhone;
                    const isFollowUp = appt.visitingType === "FOLLOW_UP";

                    // Whatsapp / call phone: prefer contactPhone, fallback to patient phone
                    const dialPhone = contactPhone || patientPhone;
                    const whatsappPhone = dialPhone.replace(/\D/g, "");

                    return (
                      <Card
                        key={appt._id}
                        hover
                        className="flex flex-col gap-3 p-4 sm:p-5 border-border/60 hover:border-primary/40 transition-all"
                      >
                        {/* ── Top row: number + name + type + profile link ── */}
                        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                          {/* Queue / index badge */}
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary font-black text-base">
                            #{appt.queueNumber ?? index + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            {/* Name row */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-display text-base sm:text-lg font-bold text-text-primary truncate">
                                {patientName}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold shrink-0 ${
                                  isFollowUp
                                    ? "bg-accent/15 text-accent border border-accent/30"
                                    : "bg-primary/15 text-primary border border-primary/30"
                                }`}
                              >
                                {isFollowUp ? "إعادة كشف" : "كشف جديد"}
                              </span>

                              {/* ── Profile link icon ── */}
                              {patientId && (
                                <button
                                  title="فتح ملف المريض"
                                  onClick={() => router.push(`/doctor/patients/${patientId}`)}
                                  className="flex items-center justify-center h-7 w-7 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0"
                                >
                                  {/* Person icon */}
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                  </svg>
                                </button>
                              )}
                            </div>

                            {/* ── Phone row with action icons ── */}
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              {/* Primary phone */}
                              <div className="flex items-center gap-1.5">
                                <span dir="ltr" className="text-xs font-semibold text-text-primary">
                                  {patientPhone}
                                </span>
                                {/* WhatsApp */}
                                <a
                                  href={`https://wa.me/2${whatsappPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="واتساب"
                                  className="flex items-center justify-center h-6 w-6 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/30 transition-colors text-[#25D366]"
                                >
                                  {/* WhatsApp SVG */}
                                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                  </svg>
                                </a>
                                {/* Call */}
                                <a
                                  href={`tel:${dialPhone}`}
                                  title="اتصال"
                                  className="flex items-center justify-center h-6 w-6 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-primary"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127 1.007.36 2 .7 2.95a2 2 0 01-.45 2.11L6.5 7.5a16 16 0 006.29 6.29l.72-.77a2 2 0 012.11-.45c.95.34 1.943.573 2.95.7A2 2 0 0122 16.92z" />
                                  </svg>
                                </a>
                              </div>

                              {/* Contact phone (alternative) */}
                              {contactPhone && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-accent bg-accent/10 border border-accent/20 rounded px-1.5 py-0.5">
                                    بديل
                                  </span>
                                  <span dir="ltr" className="text-xs font-semibold text-text-primary">
                                    {contactPhone}
                                  </span>
                                  <a
                                    href={`https://wa.me/2${contactPhone.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="واتساب الهاتف البديل"
                                    className="flex items-center justify-center h-6 w-6 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/30 transition-colors text-[#25D366]"
                                  >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                  </a>
                                  <a
                                    href={`tel:${contactPhone}`}
                                    title="اتصال بالهاتف البديل"
                                    className="flex items-center justify-center h-6 w-6 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-primary"
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127 1.007.36 2 .7 2.95a2 2 0 01-.45 2.11L6.5 7.5a16 16 0 006.29 6.29l.72-.77a2 2 0 012.11-.45c.95.34 1.943.573 2.95.7A2 2 0 0122 16.92z" />
                                    </svg>
                                  </a>
                                </div>
                              )}

                              {/* Queue number */}
                              {appt.queueNumber != null ? (
                                <span className="text-xs font-semibold text-accent bg-accent/10 rounded-lg px-2 py-0.5">
                                  دور #{appt.queueNumber}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* ── Action buttons row ── */}
                        <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-border/40 justify-between">
                          <StatusBadge status={appt.status} />

                          <div className="flex items-center gap-2 flex-wrap">
                            {appt.status === "pending" && (
                              <Button
                                size="sm"
                                variant="vibrant"
                                onClick={() => handleStatusUpdate(appt._id, "confirmed")}
                              >
                                تأكيد الحجز
                              </Button>
                            )}
                            {appt.status === "confirmed" && (
                              <Button
                                size="sm"
                                variant="vibrant"
                                onClick={() => handleStatusUpdate(appt._id, "completed")}
                              >
                                تم الكشف ✓
                              </Button>
                            )}
                            {appt.status !== "cancelled" && appt.status !== "completed" && (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleStatusUpdate(appt._id, "cancelled")}
                              >
                                إلغاء
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── New Appointment Modal ─────────────────────────────────────── */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
          <Card className="max-w-md w-full shadow-2xl bg-surface max-h-[90vh] overflow-y-auto p-4 sm:p-6 my-auto">
            <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
              <h3 className="font-display text-lg sm:text-xl font-bold text-text-primary">
                إضافة حجز جديد
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-text-secondary hover:text-text-primary text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="flex flex-col gap-4">
              {loadingPatients ? (
                <div className="text-sm text-text-secondary py-2 text-center">جارٍ تحميل قائمة المرضى...</div>
              ) : (
                <SelectField
                  label="اختر المريض *"
                  required
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  options={[
                    { label: "-- الرجاء اختيار مريض --", value: "" },
                    ...patients.map((p) => ({
                      label: `${p.firstName} ${p.lastName} (${p.phoneNumber})`,
                      value: p._id,
                    })),
                  ]}
                />
              )}

              <div>
                <label className="mb-1.5 block text-sm font-bold text-text-primary">نوع الكشف *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewVisitingType("NEW")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      newVisitingType === "NEW"
                        ? "bg-primary text-surface border-primary shadow-glow-cyan"
                        : "border-border/60 text-text-secondary hover:border-primary/40"
                    }`}
                  >
                    كشف جديد
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewVisitingType("FOLLOW_UP")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      newVisitingType === "FOLLOW_UP"
                        ? "bg-primary text-surface border-primary shadow-glow-cyan"
                        : "border-border/60 text-text-secondary hover:border-primary/40"
                    }`}
                  >
                    إعادة كشف / متابعة
                  </button>
                </div>
              </div>

              <Field
                label="تاريخ الموعد *"
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />

              {newDate && (
                <div className="rounded-xl bg-accent/10 border border-accent/20 px-3 py-2 text-xs text-text-primary">
                  العيادة تعمل بنظام الدور — سيتم تعيين رقم الدور تلقائياً فور تأكيد الحجز.
                </div>
              )}

              <TextAreaField
                label="ملاحظات (اختياري)"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="أضف أي ملاحظات بخصوص هذا الحجز..."
              />

              {createError && (
                <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-xs font-bold text-danger">
                  {createError}
                </div>
              )}

              <div className="flex w-full gap-3 mt-2">
                <Button
                  type="submit"
                  variant="vibrant"
                  className="flex-1 font-bold shadow-glow-cyan"
                  disabled={creating || !newPatientId || !newDate}
                >
                  {creating ? "جارٍ الحفظ..." : "تأكيد الحجز"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 font-bold"
                  onClick={() => setShowNewModal(false)}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Tab Button ────────────────────────────────────────────────────────────
function TabButton({
  active,
  onClick,
  label,
  description,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  description: string;
  color: "primary" | "success" | "danger" | "warning";
}) {
  const colorMap = {
    primary: "shadow-glow-cyan",
    success: "shadow-[0_0_12px_rgba(var(--color-success-rgb),0.35)]",
    danger: "shadow-[0_0_12px_rgba(var(--color-danger-rgb),0.35)]",
    warning: "shadow-[0_0_12px_rgba(var(--color-warning-rgb),0.35)]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={description}
      className={`min-h-[40px] sm:min-h-[42px] rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 flex items-center justify-center ${
        active
          ? `bg-primary text-surface ${colorMap[color]} font-extrabold`
          : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
      }`}
    >
      {label}
    </button>
  );
}
