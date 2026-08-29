"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getMyPatientById, updatePatientByDoctor } from "@/lib/api/patient";
import { getMedicalRecordsForPatient } from "@/lib/api/medicalRecord";
import { getMyAppointments, createAppointmentByDoctor } from "@/lib/api/appointment";
import { createNotification } from "@/lib/api/notification";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import { ApiError } from "@/lib/http";
import type { Appointment, MedicalRecord, Patient } from "@/types/api";

type Tab = "records" | "appointments" | "edit" | "notify";

export default function DoctorPatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("records");

  // Edit state
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", phoneNumber: "", email: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Book appointment state
  const [bookDate, setBookDate] = useState("");
  const [bookStartTime, setBookStartTime] = useState("");
  const [bookDoctorId, setBookDoctorId] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [bookSuccess, setBookSuccess] = useState(false);

  // Notification state
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifSending, setNotifSending] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [notifSuccess, setNotifSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const [patRes, recRes, apptRes] = await Promise.allSettled([
          getMyPatientById(id),
          getMedicalRecordsForPatient(id),
          getMyAppointments(),
        ]);

        if (patRes.status === "fulfilled") {
          const p = patRes.value.data.result;
          setPatient(p);
          setEditForm({
            firstName: p.firstName ?? "",
            lastName: p.lastName ?? "",
            phoneNumber: p.phoneNumber ?? "",
            email: p.email ?? "",
          });
        }
        if (recRes.status === "fulfilled") setRecords(recRes.value.data.medicalRecords ?? []);
        if (apptRes.status === "fulfilled") {
          const all = apptRes.value.data.appointments ?? [];
          // Filter only this patient's appointments
          const filtered = all.filter((a) => {
            const pId = typeof a.patientId === "object" ? a.patientId._id : a.patientId;
            return pId === id;
          });
          setAppointments(filtered);
          // Try to get doctorId from appointments to prefill booking
          if (filtered.length > 0) {
            const dId = typeof filtered[0].doctorId === "object" ? filtered[0].doctorId._id : filtered[0].doctorId;
            setBookDoctorId(dId);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleEditSave(e: FormEvent) {
    e.preventDefault();
    setEditError(null);
    setEditSaving(true);
    try {
      // Only send firstName, lastName, phoneNumber — nationalId must NOT be sent
      await updatePatientByDoctor(id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phoneNumber: editForm.phoneNumber,
      });
      setEditSuccess(true);
      setTimeout(() => setEditSuccess(false), 3000);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "تعذّر تحديث بيانات المريض");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleBook(e: FormEvent) {
    e.preventDefault();
    setBookError(null);
    setBooking(true);
    try {
      await createAppointmentByDoctor(id, {
        date: bookDate,
        ...(bookStartTime ? { startTime: bookStartTime } : {}),
      });
      setBookSuccess(true);
      setBookDate("");
      setBookStartTime("");
      setTimeout(() => setBookSuccess(false), 3000);
    } catch (err) {
      setBookError(err instanceof ApiError ? err.message : "تعذّر حجز الموعد");
    } finally {
      setBooking(false);
    }
  }

  async function handleNotify(e: FormEvent) {
    e.preventDefault();
    setNotifError(null);
    setNotifSending(true);
    try {
      await createNotification({ patientId: id, title: notifTitle, message: notifMessage });
      setNotifTitle("");
      setNotifMessage("");
      setNotifSuccess(true);
      setTimeout(() => setNotifSuccess(false), 3000);
    } catch (err) {
      setNotifError(err instanceof ApiError ? err.message : "تعذّر إرسال الإشعار");
    } finally {
      setNotifSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-fade-in">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-border/50" />
        ))}
      </div>
    );
  }

  if (!patient) {
    return (
      <Card className="mx-auto max-w-lg text-center p-8 border-danger/30">
        <p className="text-danger font-bold">لم يتم العثور على بيانات المريض أو لا تملك صلاحية الوصول</p>
        <Button className="mt-4" variant="secondary" onClick={() => router.back()}>العودة</Button>
      </Card>
    );
  }

  const TABS: { key: Tab; label: string; emoji: string }[] = [
    { key: "records", label: "السجلات الطبية", emoji: "️" },
    { key: "appointments", label: "المواعيد", emoji: "" },
    { key: "edit", label: "تعديل البيانات", emoji: "️" },
    { key: "notify", label: "إرسال إشعار", emoji: "" },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors w-fit"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        العودة لقائمة المرضى
      </button>

      {/* Patient Hero Card */}
      <Card glass vibrant className="border-primary/20 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 text-xl sm:text-2xl font-black text-primary shadow-glow-cyan">
              {patient.firstName?.[0]?.toUpperCase() ?? "م"}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary truncate">
                {patient.firstName} {patient.lastName}
              </h1>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-text-secondary">
                <span> {patient.phoneNumber}</span>
                {patient.email && <span> {patient.email}</span>}
                {patient.nationalId && <span>🪪 {patient.nationalId}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href={`/doctor/medical-records/new?patientId=${id}`} className="w-full sm:w-auto">
              <Button variant="vibrant" size="sm" className="shadow-glow-cyan w-full sm:w-auto justify-center">
                + سجل طبي جديد
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <div className="rounded-xl bg-surface-raised px-3.5 sm:px-4 py-2.5 sm:py-3">
            <p className="text-xs text-text-secondary">عدد السجلات الطبية</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-text-primary">{records.length}</p>
          </div>
          <div className="rounded-xl bg-surface-raised px-3.5 sm:px-4 py-2.5 sm:py-3">
            <p className="text-xs text-text-secondary">عدد المواعيد</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-text-primary">{appointments.length}</p>
          </div>
          <div className="rounded-xl bg-surface-raised px-3.5 sm:px-4 py-2.5 sm:py-3 col-span-2 sm:col-span-1">
            <p className="text-xs text-text-secondary">تاريخ التسجيل</p>
            <p className="mt-1 text-xs sm:text-sm font-bold text-text-primary">
              {new Date(patient.createdAt).toLocaleDateString("ar-EG")}
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card glass className="p-1.5 sm:p-2">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide py-1 px-1 -mx-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs font-bold transition-all duration-200 whitespace-nowrap shrink-0 ${
                activeTab === t.key
                  ? "bg-primary text-surface shadow-glow-cyan"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
              }`}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}

      {/* Medical Records Tab */}
      {activeTab === "records" && (
        <div className="flex flex-col gap-4">
          {records.length === 0 ? (
            <Card className="py-16 text-center text-text-secondary">
              <p className="text-lg font-semibold">لا توجد سجلات طبية لهذا المريض بعد</p>
              <p className="mt-2 text-sm">ابدأ بإنشاء أول سجل طبي</p>
              <Link href={`/doctor/medical-records/new?patientId=${id}`} className="mt-4 inline-block">
                <Button variant="vibrant" className="shadow-glow-cyan">+ إنشاء سجل طبي جديد</Button>
              </Link>
            </Card>
          ) : (
            records.map((r) => (
              <Link key={r._id} href={`/doctor/medical-records/${r._id}`}>
                <Card hover className="flex flex-col gap-3 cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display font-bold text-text-primary">{r.diagnosis}</p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {new Date(r.createdAt).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          r.visibility === "shared"
                            ? "bg-success/15 text-success"
                            : "bg-border/60 text-text-secondary"
                        }`}
                      >
                        {r.visibility === "shared" ? " مشارك" : " خاص"}
                      </span>
                    </div>
                  </div>
                  {r.medications.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {r.medications.slice(0, 3).map((m, i) => (
                        <span key={i} className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs text-primary font-medium">
                          {m.name}
                        </span>
                      ))}
                      {r.medications.length > 3 && (
                        <span className="rounded-lg bg-surface-raised px-2.5 py-1 text-xs text-text-secondary">
                          +{r.medications.length - 3} أكثر
                        </span>
                      )}
                    </div>
                  )}
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === "appointments" && (
        <div className="flex flex-col gap-4">
          {/* Book New Appointment */}
          <Card className="border-primary/20">
            <h3 className="font-display text-base font-bold text-text-primary mb-4">حجز موعد جديد</h3>
            <form onSubmit={handleBook} className="flex flex-col gap-4">
              <Field
                label="معرّف الطبيب (doctorId)"
                required
                value={bookDoctorId}
                onChange={(e) => setBookDoctorId(e.target.value)}
                placeholder="ID الطبيب"
              />
              <Field
                label="تاريخ الموعد"
                type="date"
                required
                value={bookDate}
                onChange={(e) => setBookDate(e.target.value)}
              />
              <Field
                label="وقت بدء الكشف (اختياري)"
                type="time"
                value={bookStartTime}
                onChange={(e) => setBookStartTime(e.target.value)}
                placeholder="مثال: 10:00"
              />
              {bookError && <p className="text-sm text-danger">{bookError}</p>}
              {bookSuccess && <p className="text-sm text-success font-bold"> تم حجز الموعد بنجاح!</p>}
              <Button type="submit" variant="vibrant" disabled={booking} className="shadow-glow-cyan">
                {booking ? "جارٍ الحجز..." : "حجز الموعد"}
              </Button>
            </form>
          </Card>

          {/* Appointments List */}
          {appointments.length === 0 ? (
            <Card className="py-12 text-center text-text-secondary">
              لا توجد مواعيد مسجّلة مع هذا المريض
            </Card>
          ) : (
            appointments.map((a) => (
              <Card key={a._id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-text-primary">
                    {new Date(a.date).toLocaleDateString("ar-EG")}
                  </p>
                  {a.startTime && (
                    <p className="text-xs text-text-secondary mt-0.5">
                      {a.startTime} — {a.endTime}
                    </p>
                  )}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    a.status === "completed"
                      ? "bg-success/15 text-success"
                      : a.status === "cancelled"
                      ? "bg-danger/15 text-danger"
                      : a.status === "confirmed"
                      ? "bg-primary/15 text-primary"
                      : "bg-warning/15 text-warning"
                  }`}
                >
                  {a.status === "pending"
                    ? "قيد الانتظار"
                    : a.status === "confirmed"
                    ? "مؤكد"
                    : a.status === "completed"
                    ? "مكتمل"
                    : "ملغى"}
                </span>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit Tab */}
      {activeTab === "edit" && (
        <Card className="max-w-lg">
          <h3 className="font-display text-base font-bold text-text-primary mb-4">تعديل بيانات المريض</h3>
          <form onSubmit={handleEditSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="الاسم الأول"
                required
                value={editForm.firstName}
                onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
              />
              <Field
                label="اسم العائلة"
                required
                value={editForm.lastName}
                onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
              />
            </div>
            <Field
              label="رقم الهاتف"
              inputMode="tel"
              value={editForm.phoneNumber}
              onChange={(e) => setEditForm((f) => ({ ...f, phoneNumber: e.target.value }))}
            />
            <p className="text-xs text-text-secondary rounded-lg bg-surface-raised px-3 py-2">
              ️ الرقم القومي (nationalId) والبريد الإلكتروني لا يمكن تعديلهما
            </p>
            {editError && <p className="text-sm text-danger">{editError}</p>}
            {editSuccess && <p className="text-sm text-success font-bold"> تم تحديث البيانات بنجاح!</p>}
            <Button type="submit" variant="vibrant" disabled={editSaving} className="shadow-glow-cyan">
              {editSaving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
            </Button>
          </form>
        </Card>
      )}

      {/* Notify Tab */}
      {activeTab === "notify" && (
        <Card className="max-w-lg">
          <h3 className="font-display text-base font-bold text-text-primary mb-4">
            إرسال إشعار لـ {patient.firstName}
          </h3>
          <form onSubmit={handleNotify} className="flex flex-col gap-4">
            <Field
              label="عنوان الإشعار"
              required
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              placeholder="مثال: تذكير بموعدك"
            />
            <Field
              label="نص الرسالة"
              required
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              placeholder="مثال: موعدك غداً الساعة 5 مساءً..."
            />
            {notifError && <p className="text-sm text-danger">{notifError}</p>}
            {notifSuccess && <p className="text-sm text-success font-bold"> تم إرسال الإشعار بنجاح!</p>}
            <Button type="submit" variant="vibrant" disabled={notifSending} className="shadow-glow-cyan">
              {notifSending ? "جارٍ الإرسال..." : "إرسال الإشعار "}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
