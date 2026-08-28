"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  getMyAppointments,
  createAppointmentByPatient,
  deleteAppointment,
} from "@/lib/api/appointment";
import { getDoctors, getClinics } from "@/lib/api/admin";
import { Card } from "@/components/ui/Card";
import { Field, SelectField } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiError } from "@/lib/http";
import type { Appointment, Clinic, Doctor } from "@/types/api";

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<
    Array<{
      id: string;
      name: string;
      specialization: string;
      clinicName: string;
      consultationPrice: number;
      followUpPrice: number;
    }>
  >([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [customDoctorId, setCustomDoctorId] = useState("");
  const [visitingType, setVisitingType] = useState<"NEW" | "FOLLOW_UP">("NEW");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      // 1. Fetch patient's appointments
      const apptsRes = await getMyAppointments();
      const loadedAppts = apptsRes.data.appointments ?? [];
      setAppointments(loadedAppts);

      // 2. Fetch doctors/clinics to populate dropdown options
      try {
        const [docsRes, clinicsRes] = await Promise.allSettled([
          getDoctors(),
          getClinics(),
        ]);

        const docsList: Doctor[] =
          docsRes.status === "fulfilled" ? docsRes.value.data.doctors ?? [] : [];
        const clinicsList: Clinic[] =
          clinicsRes.status === "fulfilled" ? clinicsRes.value.data.clinics ?? [] : [];

        const formatted = docsList.map((doc) => {
          const matchedClinic = clinicsList.find((c) => {
            const docId = typeof c.doctorId === "object" ? c.doctorId?._id : c.doctorId;
            return docId === doc._id;
          });

          return {
            id: doc._id,
            name: `د. ${doc.firstName} ${doc.lastName}`,
            specialization: matchedClinic?.specialization ?? "طب عام",
            clinicName: matchedClinic?.name ?? "عيادة طبية",
            consultationPrice: matchedClinic?.consultationPrice ?? 200,
            followUpPrice: matchedClinic?.followUpPrice ?? matchedClinic?.consultationPrice ?? 100,
          };
        });

        setAvailableDoctors(formatted);
      } catch {
        // Fallback gracefully
      }
    } catch {
      // Ignore initial load errors
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // When doctor changes, check if returning patient to auto-suggest follow-up
  useEffect(() => {
    if (!selectedDoctorId || selectedDoctorId === "custom") return;
    const prev = appointments.some((a) => {
      const aDocId = typeof a.doctorId === "object" ? a.doctorId?._id : a.doctorId;
      return aDocId === selectedDoctorId && (a.status === "completed" || a.status === "confirmed");
    });
    if (prev) {
      setVisitingType("FOLLOW_UP");
    } else {
      setVisitingType("NEW");
    }
  }, [selectedDoctorId, appointments]);

  async function handleBook(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const targetDoctorId =
      selectedDoctorId === "custom" ? customDoctorId.trim() : selectedDoctorId;

    if (!targetDoctorId) {
      setError("يرجى اختيار الطبيب أو إدخال كود الطبيب");
      return;
    }

    if (!date) {
      setError("يرجى تحديد تاريخ الموعد");
      return;
    }

    setBooking(true);
    try {
      await createAppointmentByPatient({
        doctorId: targetDoctorId,
        date,
        ...(startTime ? { startTime } : {}),
        visitingType,
      });
      setSuccess("تم إرسال طلب حجز الموعد بنجاح");
      setSelectedDoctorId("");
      setCustomDoctorId("");
      setDate("");
      setStartTime("");
      loadData();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "تعذّر حجز الموعد، يرجى المحاولة مرة أخرى"
      );
    } finally {
      setBooking(false);
    }
  }

  async function handleCancel(appt: Appointment) {
    if (!confirm("هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟")) return;
    setCancellingId(appt._id);
    try {
      const doctorId = typeof appt.doctorId === "object" ? appt.doctorId._id : appt.doctorId;
      const clinicId = typeof appt.clinicId === "object" ? appt.clinicId._id : appt.clinicId;
      await deleteAppointment(appt._id, {
        doctorId,
        clinicId,
        date: appt.date?.split("T")[0] ?? "",
      });
      loadData();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "تعذّر إلغاء الموعد");
    } finally {
      setCancellingId(null);
    }
  }

  const selectedDoctorObj = availableDoctors.find((d) => d.id === selectedDoctorId);

  const doctorOptions = [
    { label: "-- اختر الطبيب / العيادة --", value: "" },
    ...availableDoctors.map((d) => ({
      label: `${d.name} — ${d.clinicName} (${d.specialization})`,
      value: d.id,
    })),
    { label: "إدخال كود الطبيب يدوياً", value: "custom" },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-4xl pb-12">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-text-primary">
          حجز وتصفح المواعيد الطبية
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          يمكنك حجز موعد جديد لدى الأطباء واستعراض حالة وسجل مواعيدك السابقة.
        </p>
      </div>

      {/* Booking Form Card */}
      <Card glass vibrant className="border-primary/20 shadow-xl p-6 sm:p-8">
        <h2 className="font-display text-lg font-bold text-text-primary mb-4">
          حجز موعد كشف جديد
        </h2>

        <form onSubmit={handleBook} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
          {/* Doctor Selector Dropdown */}
          <SelectField
            label="اختيار الطبيب والعيادة *"
            required
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            options={doctorOptions}
            className="sm:col-span-2"
          />

          {/* Custom Doctor ID fallback field */}
          {selectedDoctorId === "custom" && (
            <Field
              label="رمز/معرّف الطبيب (Doctor ID)"
              required
              value={customDoctorId}
              onChange={(e) => setCustomDoctorId(e.target.value)}
              placeholder="مثال: 64b8f... أو ألصق رمز الطبيب هنا"
              className="sm:col-span-2"
            />
          )}

          {/* Visit Type selector */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-bold text-text-primary">
              نوع الكشف *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisitingType("NEW")}
                className={`flex flex-col items-start p-3.5 rounded-2xl border transition-all ${
                  visitingType === "NEW"
                    ? "bg-primary text-surface border-primary shadow-glow-cyan font-bold"
                    : "border-border/70 bg-surface text-text-secondary hover:border-primary/40"
                }`}
              >
                <span className="text-xs font-black">كشف جديد</span>
                <span className="text-sm font-extrabold mt-1">
                  {selectedDoctorObj ? `${selectedDoctorObj.consultationPrice} ج.م` : "سعر الكشف الجديد"}
                </span>
                <span className={`text-[10px] mt-0.5 ${visitingType === "NEW" ? "opacity-90" : "opacity-60"}`}>
                  لأول مرة عند الطبيب
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVisitingType("FOLLOW_UP")}
                className={`flex flex-col items-start p-3.5 rounded-2xl border transition-all ${
                  visitingType === "FOLLOW_UP"
                    ? "bg-primary text-surface border-primary shadow-glow-cyan font-bold"
                    : "border-border/70 bg-surface text-text-secondary hover:border-primary/40"
                }`}
              >
                <span className="text-xs font-black">إعادة كشف / متابعة</span>
                <span className="text-sm font-extrabold mt-1">
                  {selectedDoctorObj ? `${selectedDoctorObj.followUpPrice} ج.م` : "سعر الإعادة"}
                </span>
                <span className={`text-[10px] mt-0.5 ${visitingType === "FOLLOW_UP" ? "opacity-90" : "opacity-60"}`}>
                  كشف سابق للمريض
                </span>
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <Field
            label="تاريخ الكشف المطلوب *"
            type="date"
            required
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
          />

          {/* Start Time */}
          <Field
            label="وقت بدء الكشف (اختياري)"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="مثال: 10:00"
          />

          {error && (
            <div className="sm:col-span-2 rounded-xl bg-danger/10 border border-danger/20 p-3 text-sm font-medium text-danger">
              {error}
            </div>
          )}

          {success && (
            <div className="sm:col-span-2 rounded-xl bg-success/10 border border-success/20 p-3 text-sm font-medium text-success">
              {success}
            </div>
          )}

          <Button
            type="submit"
            variant="vibrant"
            disabled={booking}
            loading={booking}
            className="sm:col-span-2 text-base font-bold shadow-glow-cyan py-3.5"
          >
            {booking ? "جارٍ إرسال الحجز..." : `تأكيد حجز الموعد (${visitingType === "FOLLOW_UP" ? "إعادة كشف" : "كشف جديد"})`}
          </Button>
        </form>
      </Card>

      {/* Appointments List */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-bold text-text-primary mb-4 flex items-center justify-between">
          <span>قائمة مواعيدي الطبية ({appointments.length})</span>
          <Button variant="ghost" size="sm" onClick={loadData}>
            تحديث القائمة
          </Button>
        </h2>

        {loading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-border/50" />
        ) : appointments.length === 0 ? (
          <div className="py-12 text-center text-text-secondary flex flex-col items-center gap-2">
            <p className="font-semibold">لا توجد لديك مواعيد محجوزة حالياً</p>
            <p className="text-xs">اختر الطبيب والتاريخ من النموذج أعلاه للحجز مباشرة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-right text-text-secondary bg-surface-elevated/50">
                  <th className="px-4 py-3 font-semibold">الطبيب / العيادة</th>
                  <th className="px-4 py-3 font-semibold">نوع الكشف</th>
                  <th className="px-4 py-3 font-semibold">تاريخ الكشف</th>
                  <th className="px-4 py-3 font-semibold">حالة الموعد</th>
                  <th className="px-4 py-3 font-semibold">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {appointments.map((a) => {
                  const doc = typeof a.doctorId === "object" ? a.doctorId : null;
                  const clinic = typeof a.clinicId === "object" ? a.clinicId : null;
                  const isFollowUp = a.visitingType === "FOLLOW_UP";

                  return (
                    <tr key={a._id} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="px-4 py-3.5 text-text-primary">
                        <div className="font-bold">
                          {doc ? `د. ${doc.firstName} ${doc.lastName}` : "عيادة طبية"}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {clinic ? `${clinic.name} (${clinic.specialization})` : "كشف طبي"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                            isFollowUp
                              ? "bg-accent/15 text-accent border border-accent/30"
                              : "bg-primary/15 text-primary border border-primary/30"
                          }`}
                        >
                          {isFollowUp ? "إعادة كشف" : "كشف جديد"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-text-primary font-medium">
                        {new Date(a.date).toLocaleDateString("ar-EG", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        {a.status === "pending" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={cancellingId === a._id}
                            onClick={() => handleCancel(a)}
                            className="text-danger hover:bg-danger/10"
                          >
                            {cancellingId === a._id ? "جارٍ الإلغاء..." : "إلغاء الموعد"}
                          </Button>
                        ) : (
                          <span className="text-xs text-text-secondary">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
