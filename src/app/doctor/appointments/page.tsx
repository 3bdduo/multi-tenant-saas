"use client";

import { useEffect, useMemo, useState } from "react";
import { DoctorActivationBanner } from "@/components/DoctorActivationBanner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getMyAppointments, updateAppointment, createAppointmentByDoctor } from "@/lib/api/appointment";
import { getMyPatients } from "@/lib/api/patient";
import { getMyClinic } from "@/lib/api/doctor";
import { getPublicClinicSlots } from "@/lib/api/public";
import type { Appointment, AppointmentStatus, Clinic, Patient } from "@/types/api";
import { Field, SelectField, TextAreaField } from "@/components/ui/Input";
import { ApiError } from "@/lib/http";

type TabFilter = "active" | "completed" | "cancelled" | "past";

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>("active");
  const [searchQuery, setSearchQuery] = useState("");

  // Clinic state (for bookingType & prices)
  const [clinic, setClinic] = useState<Clinic | null>(null);

  // New Appointment Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const [newPatientId, setNewPatientId] = useState("");
  const [newVisitingType, setNewVisitingType] = useState<"NEW" | "FOLLOW_UP">("NEW");
  const [newDate, setNewDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Slots for time-type clinics
  const [modalSlots, setModalSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

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

  async function handleStatusUpdate(id: string, status: AppointmentStatus) {
    try {
      await updateAppointment(id, { status });
      fetchAppointments();
    } catch (err) {
      console.error("Failed to update appointment:", err);
    }
  }

  async function openNewAppointmentModal() {
    setShowNewModal(true);
    setCreateError(null);
    setNewPatientId("");
    setNewVisitingType("NEW");
    setNewDate("");
    setNewNotes("");
    setNewStartTime("");
    setModalSlots([]);

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

    // Fetch clinic info to know bookingType
    if (!clinic) {
      try {
        const res = await getMyClinic();
        setClinic(res.data as unknown as Clinic);
      } catch {
        /* doctor may not have a clinic yet */
      }
    }
  }

  async function fetchModalSlots(date: string) {
    const clinicId = typeof clinic?._id === "string" ? clinic._id : (clinic as any)?._id;
    if (!clinic || clinic.bookingType !== "time" || !clinicId || !date) {
      setModalSlots([]);
      return;
    }
    setLoadingSlots(true);
    setNewStartTime("");
    try {
      const res = await getPublicClinicSlots(clinicId, date);
      setModalSlots(res.data.availableSlots ?? []);
    } catch {
      setModalSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleCreateAppointment(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      await createAppointmentByDoctor(newPatientId, {
        date: newDate,
        startTime: clinic?.bookingType === "time" ? newStartTime : undefined,
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

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((appt) => {
        const apptDate = appt.date ? appt.date.split("T")[0] : "";
        if (activeTab === "active" && (appt.status === "pending" || appt.status === "confirmed")) {
          return apptDate >= todayStr;
        }
        if (activeTab === "completed" && appt.status === "completed") return true;
        if (activeTab === "cancelled" && appt.status === "cancelled") return true;
        if (activeTab === "past" && apptDate < todayStr) return true;

        if (activeTab === "active" && apptDate < todayStr) return false;

        return true;
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

  // Group appointments by day
  const groupedAppointments = useMemo(() => {
    const groups: { [dateKey: string]: Appointment[] } = {};

    filteredAppointments.forEach((appt) => {
      const d = appt.date ? appt.date.split("T")[0] : "غير محدد";
      if (!groups[d]) groups[d] = [];
      groups[d].push(appt);
    });

    const sortedDates = Object.keys(groups).sort((a, b) => {
      if (activeTab === "past" || activeTab === "completed" || activeTab === "cancelled") {
        return b.localeCompare(a); // recent first
      }
      return a.localeCompare(b); // upcoming chronological
    });

    return sortedDates.map((dateKey) => ({
      dateKey,
      items: groups[dateKey],
    }));
  }, [filteredAppointments, activeTab]);

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

      {/* Main Status Tabs */}
      <Card glass vibrant className="p-1.5 sm:p-2">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide py-1 px-1 -mx-1">
          <TabButton
            active={activeTab === "active"}
            onClick={() => setActiveTab("active")}
            label="الحالية (قيد الانتظار)"
          />
          <TabButton
            active={activeTab === "completed"}
            onClick={() => setActiveTab("completed")}
            label="السجل (المكتملة)"
          />
          <TabButton
            active={activeTab === "cancelled"}
            onClick={() => setActiveTab("cancelled")}
            label="الملغاة"
          />
          <TabButton
            active={activeTab === "past"}
            onClick={() => setActiveTab("past")}
            label="الأيام السابقة"
          />
        </div>
      </Card>

      {/* Search Input */}
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

      {/* Total count bar */}
      <div className="flex items-center justify-between rounded-2xl bg-surface-raised px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-text-primary border border-border/50">
        <span>إجمالي المواعيد في هذه القائمة</span>
        <span className="rounded-lg bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-black">
          {filteredAppointments.length} حجز
        </span>
      </div>

      {/* Appointments List Container Grouped By Day */}
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
                    const patientName =
                      typeof appt.patientId === "object"
                        ? `${appt.patientId.firstName} ${appt.patientId.lastName}`
                        : appt.patientId;
                    const patientPhone =
                      typeof appt.patientId === "object" ? appt.patientId.phoneNumber : "—";
                    const isFollowUp = appt.visitingType === "FOLLOW_UP";

                    return (
                      <Card
                        key={appt._id}
                        hover
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 border-border/60 hover:border-primary/40 transition-all"
                      >
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary font-black text-base sm:text-lg">
                            #{index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
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
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5 text-xs text-text-secondary">
                              <span dir="ltr" className="font-semibold text-text-primary">
                                الهاتف: {patientPhone}
                              </span>
                              {appt.contactPhone && (
                                <span dir="ltr" className="rounded-md bg-accent/10 text-accent font-bold px-2 py-0.5 border border-accent/20">
                                  هاتف بديل: {appt.contactPhone}
                                </span>
                              )}
                              {appt.startTime ? (
                                <span className="font-semibold text-primary">
                                  الساعة: {appt.startTime.slice(11, 16)}
                                </span>
                              ) : appt.queueNumber != null ? (
                                <span className="font-semibold text-accent">
                                  رقم الدور: #{appt.queueNumber}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t border-border/40 sm:border-0 justify-end shrink-0">
                          <StatusBadge status={appt.status} />

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
                              تم الكشف
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
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Appointment Modal */}
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

              {/* Visit Type selector */}
              <div>
                <label className="mb-1.5 block text-sm font-bold text-text-primary">
                  نوع الكشف *
                </label>
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
                onChange={(e) => {
                  setNewDate(e.target.value);
                  fetchModalSlots(e.target.value);
                }}
              />

              {/* Slot picker — only for time clinics */}
              {clinic?.bookingType === "time" && newDate && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-text-primary">
                    وقت الكشف *
                  </label>
                  {loadingSlots ? (
                    <div className="flex items-center gap-2 text-sm text-text-secondary py-2">
                      <span className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      جارٍ تحميل الأوقات...
                    </div>
                  ) : modalSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {modalSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setNewStartTime(slot)}
                          className={`rounded-xl border px-2 py-2 text-sm font-bold transition-all ${
                            newStartTime === slot
                              ? "bg-primary text-surface border-primary shadow-glow-cyan"
                              : "border-border/60 hover:border-primary/40 text-text-primary bg-surface-raised"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-warning/10 border border-warning/20 p-3 text-xs text-warning">
                      لا توجد مواعيد متاحة في هذا اليوم
                    </div>
                  )}
                </div>
              )}

              {/* Queue notice */}
              {clinic && clinic.bookingType !== "time" && newDate && (
                <div className="rounded-xl bg-accent/10 border border-accent/20 px-3 py-2 text-xs text-text-primary">
                  العيادة تعمل بنظام الطابور — سيتم تعيين رقم الدور تلقائياً.
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
                  disabled={
                    creating ||
                    !newPatientId ||
                    !newDate ||
                    (clinic?.bookingType === "time" && !newStartTime)
                  }
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

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[40px] sm:min-h-[42px] rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 flex items-center justify-center ${
        active
          ? "bg-primary text-surface shadow-glow-cyan font-extrabold"
          : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
      }`}
    >
      {label}
    </button>
  );
}
