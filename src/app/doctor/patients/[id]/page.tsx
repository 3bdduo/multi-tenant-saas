"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getMyPatientById, updatePatientByDoctor } from "@/lib/api/patient";
import { getMedicalRecordsForPatient, getPatientDocuments } from "@/lib/api/medicalRecord";
import { getMyAppointments, createAppointmentByDoctor } from "@/lib/api/appointment";
import { createNotification } from "@/lib/api/notification";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import { FileViewerModal } from "@/components/FileViewerModal";
import { ApiError } from "@/lib/http";
import type { Appointment, MedicalRecord, Patient, PatientDocument } from "@/types/api";

type Tab = "records" | "documents" | "appointments" | "edit" | "notify";

const TABS: { key: Tab; label: string }[] = [
  { key: "records", label: "السجلات الطبية" },
  { key: "documents", label: "المستندات والفحوصات المرفوعة" },
  { key: "appointments", label: "المواعيد" },
  { key: "edit", label: "تعديل البيانات" },
  { key: "notify", label: "إرسال إشعار" },
];

export default function DoctorPatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("records");
  const [viewingFile, setViewingFile] = useState<{
    url: string;
    name?: string;
    date?: string;
    subtitle?: string;
  } | null>(null);

  // Edit state
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", phoneNumber: "", email: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  
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
        const [patRes, recRes, docRes, apptRes] = await Promise.allSettled([
          getMyPatientById(id),
          getMedicalRecordsForPatient(id),
          getPatientDocuments(id),
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
        if (docRes.status === "fulfilled") setDocuments(docRes.value.data.documents ?? []);
        if (apptRes.status === "fulfilled") {
          const all = apptRes.value.data.appointments ?? [];
          const filtered = all.filter((a) => {
            const pId = typeof a.patientId === "object" ? a.patientId._id : a.patientId;
            return pId === id;
          });
          setAppointments(filtered);
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
      <div className="flex flex-col gap-6 animate-fade-in">
        <Card className="h-44 animate-pulse bg-surface-raised" />
        <Card className="h-64 animate-pulse bg-surface-raised" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <p className="text-xl font-bold text-text-primary">لم يتم العثور على المريض</p>
        <Button className="mt-4" onClick={() => router.back()}>
          الرجوع للخلف
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {}
      <Card glass vibrant className="p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 text-xl sm:text-2xl font-black text-primary shadow-glow-cyan">
              {patient.firstName?.[0]?.toUpperCase() ?? "م"}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary truncate">
                {patient.firstName} {patient.lastName}
              </h1>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-text-secondary">
                <span dir="ltr">الهاتف: {patient.phoneNumber}</span>
                {patient.email && <span>البريد: {patient.email}</span>}
                {patient.nationalId && <span>الرقم القومي: {patient.nationalId}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href={`/doctor/medical-records/new?patientId=${id}`} className="w-full sm:w-auto">
              <Button variant="vibrant" size="sm" className="shadow-glow-cyan w-full sm:w-auto justify-center font-bold">
                + سجل طبي جديد
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="rounded-xl bg-surface-raised px-3.5 sm:px-4 py-2.5 sm:py-3">
            <p className="text-xs text-text-secondary">السجلات الطبية</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-text-primary">{records.length}</p>
          </div>
          <div className="rounded-xl bg-surface-raised px-3.5 sm:px-4 py-2.5 sm:py-3">
            <p className="text-xs text-text-secondary">المستندات المرفوعة</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-accent">{documents.length}</p>
          </div>
          <div className="rounded-xl bg-surface-raised px-3.5 sm:px-4 py-2.5 sm:py-3">
            <p className="text-xs text-text-secondary">عدد المواعيد</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-text-primary">{appointments.length}</p>
          </div>
          <div className="rounded-xl bg-surface-raised px-3.5 sm:px-4 py-2.5 sm:py-3">
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
                  ? "bg-primary text-surface shadow-glow-cyan font-black"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
              }`}
            >
              <span>{t.label}</span>
              {t.key === "documents" && documents.length > 0 && (
                <span className="rounded-full bg-accent text-surface text-[10px] px-1.5 py-0.2">
                  {documents.length}
                </span>
              )}
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
                  {r.medications && r.medications.length > 0 && (
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

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-base text-text-primary">
              المستندات والفحوصات المرفوعة من المريض ({documents.length})
            </h3>
            <p className="text-xs text-text-secondary">
              تظهر هنا جميع التحاليل والتقارير التي رفعها المريض مع تاريخ ووقت الرفع
            </p>
          </div>

          {documents.length === 0 ? (
            <Card className="py-16 text-center text-text-secondary">
              <p className="text-base font-semibold">لم يقم المريض برفع أي مستندات حتى الآن</p>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {documents.map((doc) => {
                const uploadDate = new Date(doc.createdAt);
                const dateStr = uploadDate.toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                const timeStr = uploadDate.toLocaleTimeString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });

                const isImage =
                  doc.fileUrl &&
                  (doc.fileUrl.endsWith(".jpg") ||
                    doc.fileUrl.endsWith(".jpeg") ||
                    doc.fileUrl.endsWith(".png") ||
                    doc.fileUrl.endsWith(".webp") ||
                    doc.fileUrl.includes("image"));

                const targetDocName =
                  doc.targetDoctorId && typeof doc.targetDoctorId === "object"
                    ? `د. ${(doc.targetDoctorId as any).firstName} ${(doc.targetDoctorId as any).lastName}`
                    : null;

                return (
                  <Card key={doc._id} hover className="flex flex-col justify-between gap-3 p-4 sm:p-5 border-border/70 shadow-sm">
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/40">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {targetDocName ? (
                              <span className="rounded-full bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 text-[10px] font-bold">
                                موجه إلى: {targetDocName}
                              </span>
                            ) : (
                              <span className="rounded-full bg-accent/15 text-accent border border-accent/30 px-2 py-0.5 text-[10px] font-bold">
                                سجل صحي عام
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-sm text-text-primary truncate">
                            {doc.fileName || (doc.fileUrl ? "مستند مرفق" : "ملاحظة صحية")}
                          </p>
                          <div className="flex flex-wrap gap-x-2 text-[11px] text-text-secondary mt-0.5">
                            <span>تاريخ الرفع: {dateStr}</span>
                            <span>الساعة: {timeStr}</span>
                          </div>
                        </div>
                      </div>

                      {isImage && doc.fileUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setViewingFile({
                              url: doc.fileUrl!,
                              name: doc.fileName || "مستند مرفق",
                              date: dateStr,
                              subtitle: targetDocName ? `موجه إلى: ${targetDocName}` : "سجل صحي عام",
                            })
                          }
                          className="mt-3 rounded-xl overflow-hidden border border-border/60 bg-bg max-h-36 w-full flex items-center justify-center group cursor-pointer relative hover:opacity-90 transition-opacity"
                          title="انقر للمعاينة داخل فريم ARC ونبض"
                        >
                          <img src={doc.fileUrl} alt="doc" className="max-h-36 object-contain" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                        </button>
                      )}

                      {/* Display new fields if present */}
                      {(doc.familyMemberName || doc.patientNotes || doc.aiAnalysis) && (
                        <div className="mt-3 flex flex-col gap-2 p-3 rounded-xl bg-surface-raised border border-border/40 text-xs">
                          {doc.familyMemberName && (
                            <div>
                              <span className="font-bold text-text-secondary">اسم الفرد: </span>
                              <span className="text-text-primary">{doc.familyMemberName}</span>
                            </div>
                          )}
                          {doc.patientNotes && (
                            <div>
                              <span className="font-bold text-text-secondary">ملاحظات المريض: </span>
                              <span className="text-text-primary whitespace-pre-wrap">{doc.patientNotes}</span>
                            </div>
                          )}
                          {doc.aiAnalysis && (
                            <div className="pt-2 border-t border-border/50 mt-1">
                              <span className="font-bold text-primary flex items-center gap-1 mb-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                                تحليل الذكاء الاصطناعي:
                              </span>
                              <span className="text-text-primary whitespace-pre-wrap leading-relaxed block">{doc.aiAnalysis}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {doc.fileUrl ? (
                      <Button
                        type="button"
                        variant="vibrant"
                        size="sm"
                        onClick={() =>
                          setViewingFile({
                            url: doc.fileUrl!,
                            name: doc.fileName || "مستند مرفق",
                            date: dateStr,
                            subtitle: targetDocName ? `موجه إلى: ${targetDocName}` : "سجل صحي عام",
                          })
                        }
                        className="w-full font-bold justify-center shadow-glow-cyan mt-2"
                      >
                        <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>عرض المستند / الصورة</span>
                      </Button>
                    ) : (
                      <div className="mt-2 text-center text-xs text-text-secondary italic">
                        (ملاحظة نصية بدون ملف مرفق)
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
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
              <Button type="submit" variant="vibrant" disabled={booking} className="shadow-glow-cyan font-bold">
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
              الرقم القومي (nationalId) والبريد الإلكتروني لا يمكن تعديلهما
            </p>
            {editError && <p className="text-sm text-danger">{editError}</p>}
            {editSuccess && <p className="text-sm text-success font-bold"> تم تحديث البيانات بنجاح!</p>}
            <Button type="submit" variant="vibrant" disabled={editSaving} className="shadow-glow-cyan font-bold">
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
            {notifSuccess && <p className="text-sm text-success font-bold">تم إرسال الإشعار بنجاح!</p>}
            <Button type="submit" variant="vibrant" disabled={notifSending} className="shadow-glow-cyan font-bold">
              {notifSending ? "جارٍ الإرسال..." : "إرسال الإشعار"}
            </Button>
          </form>
        </Card>
      )}

      {/* File Viewer Modal with ARC & Nabd Frame */}
      <FileViewerModal file={viewingFile} onClose={() => setViewingFile(null)} />
    </div>
  );
}
