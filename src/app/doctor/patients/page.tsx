"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getMyPatients } from "@/lib/api/patient";
import { createNotification } from "@/lib/api/notification";
import { getPatientDocuments } from "@/lib/api/medicalRecord";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, TextAreaField } from "@/components/ui/Input";
import { ApiError } from "@/lib/http";
import type { Patient, PatientDocument } from "@/types/api";

type DocState = "unseen" | "seen" | "deleted";
type DocWithPatient = PatientDocument & { patient: Patient };

export default function DoctorPatientsPage() {
  // ── Patients ─────────────────────────────────────
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Notification modal ────────────────────────────
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [notifSuccess, setNotifSuccess] = useState(false);

  // ── Documents (only for unseen count) ─────────────
  const [documents, setDocuments] = useState<DocWithPatient[]>([]);
  const [docStates, setDocStates] = useState<Record<string, DocState>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("doctor-doc-states");
      if (saved) setDocStates(JSON.parse(saved));
    } catch {}

    getMyPatients()
      .then((res) => {
        const sorted = (res.data.patients ?? []).sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, "ar")
        );
        setPatients(sorted);
        fetchAllDocuments(sorted);
      })
      .catch((err) => {
        const msg = err?.message || "تعذّر جلب المرضى";
        setError(
          msg.toLowerCase().includes("subscription expired")
            ? "اشتراك حساب الطبيب منتهي (Subscription Expired). يلزم تجديد تفعيل حساب الطبيب."
            : msg
        );
      })
      .finally(() => setLoading(false));
  }, []);

  async function fetchAllDocuments(patientsList: Patient[]) {
    try {
      const results = await Promise.all(
        patientsList.map((p) =>
          getPatientDocuments(p._id)
            .then((res) => (res.data.documents ?? []).map((d) => ({ ...d, patient: p })))
            .catch(() => [] as DocWithPatient[])
        )
      );
      setDocuments(results.flat());
    } catch {
      // ignore
    }
  }

  function openNotificationModal(e: React.MouseEvent, p: Patient) {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPatient(p);
    setNotifTitle("");
    setNotifMessage("");
    setNotifError(null);
    setNotifSuccess(false);
    setShowNotifModal(true);
  }

  async function handleSendNotification(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPatient) return;
    setSendingNotif(true);
    setNotifError(null);
    setNotifSuccess(false);
    try {
      await createNotification({ patientId: selectedPatient._id, title: notifTitle, message: notifMessage });
      setNotifSuccess(true);
      setTimeout(() => setShowNotifModal(false), 2000);
    } catch (err) {
      setNotifError(err instanceof ApiError ? err.message : "تعذّر إرسال الإشعار");
    } finally {
      setSendingNotif(false);
    }
  }

  const filteredPatients = useMemo(
    () =>
      patients.filter((p) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          p.phoneNumber?.includes(q) ||
          p.nationalId?.includes(q)
        );
      }),
    [patients, searchQuery]
  );

  const unseenCount = documents.filter((d) => (docStates[d._id] || "unseen") === "unseen").length;

  if (error) {
    return (
      <Card className="mx-auto max-w-lg text-center p-8 border-warning/30 animate-fade-in">
        <p className="text-base font-bold text-warning">{error}</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-20">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">سجلات المرضى</h1>
          <p className="text-sm text-text-secondary mt-1">البحث عن مرضى العيادة الحاليين وإدارة ملفاتهم الطبية</p>
        </div>
        <Link href="/doctor/patients/register">
          <Button variant="vibrant" className="shadow-glow-cyan">+ تسجيل مريض جديد</Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="بحث باسم المريض، رقم الهاتف أو الرقم القومي..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-border/80 bg-surface px-5 py-3 text-sm text-text-primary placeholder:text-text-secondary outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.1)]"
        />
        <svg className="absolute left-4 top-3.5 h-5 w-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* ── Patients Table ───────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-text-primary">قائمة المرضى</h2>
          <span className="rounded-full bg-primary/10 text-primary text-xs font-black px-3 py-1">{filteredPatients.length} مريض</span>
        </div>

        <Card className="overflow-hidden p-0 border-border/60">
          {loading ? (
            <div className="divide-y divide-border/40">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse bg-surface-raised/50" />)}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-base font-semibold text-text-secondary">لا يوجد مرضى مطابقين للبحث</p>
            </div>
          ) : (
            <>
              {/* ── Desktop Table (md+) ── */}
              <div className="hidden md:block w-full overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-primary/10 via-surface-raised to-surface-raised border-b border-border/60">
                      <th className="py-3.5 px-4 text-center font-extrabold text-text-primary text-xs whitespace-nowrap">#</th>
                      <th className="py-3.5 px-5 text-right font-extrabold text-text-primary text-xs whitespace-nowrap">اسم المريض</th>
                      <th className="py-3.5 px-5 text-center font-extrabold text-text-primary text-xs whitespace-nowrap">رقم الهاتف</th>
                      <th className="py-3.5 px-5 text-center font-extrabold text-text-primary text-xs whitespace-nowrap">الرقم القومي</th>
                      <th className="py-3.5 px-5 text-center font-extrabold text-text-primary text-xs whitespace-nowrap">التواصل</th>
                      <th className="py-3.5 px-5 text-center font-extrabold text-text-primary text-xs whitespace-nowrap">الملف الطبي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredPatients.map((p, i) => (
                      <tr key={p._id} className="group hover:bg-primary/5 transition-colors duration-150">
                        <td className="py-4 px-4 text-xs font-bold text-text-secondary text-center align-middle whitespace-nowrap">{i + 1}</td>
                        <td className="py-4 px-5 font-bold text-text-primary group-hover:text-primary transition-colors text-right align-middle whitespace-nowrap">{p.firstName} {p.lastName}</td>
                        <td className="py-4 px-5 text-center align-middle whitespace-nowrap"><span dir="ltr" className="font-semibold text-text-primary">{p.phoneNumber}</span></td>
                        <td className="py-4 px-5 text-center align-middle whitespace-nowrap">
                          {p.nationalId
                            ? <span dir="ltr" className="font-semibold text-text-primary">{p.nationalId}</span>
                            : <span className="text-text-secondary">—</span>}
                        </td>
                        <td className="py-4 px-5 text-center align-middle whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <a href={`https://wa.me/2${p.phoneNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/25 transition-colors text-xs font-bold whitespace-nowrap inline-flex items-center justify-center">
                              مراسلة واتساب
                            </a>
                            <a href={`tel:${p.phoneNumber}`}
                              className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-bold whitespace-nowrap inline-flex items-center justify-center">
                              إجراء مكالمة
                            </a>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-center align-middle whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <Link href={`/doctor/patients/${p._id}`}
                              className="px-4 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors text-xs font-bold whitespace-nowrap inline-flex items-center justify-center">
                              عرض الملف الطبي
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile Card List (< md) ── */}
              <div className="md:hidden flex flex-col divide-y divide-border/30">
                {filteredPatients.map((p, i) => (
                  <div key={p._id} className="flex flex-col gap-3 px-4 py-4">
                    {/* Header row: index + name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-xs font-black">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <Link href={`/doctor/patients/${p._id}`}>
                          <p className="font-bold text-sm text-text-primary truncate hover:text-primary transition-colors">
                            {p.firstName} {p.lastName}
                          </p>
                        </Link>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                          <span dir="ltr" className="text-xs text-text-secondary font-medium">{p.phoneNumber}</span>
                          {p.nationalId && (
                            <span dir="ltr" className="text-xs text-text-secondary">{p.nationalId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="grid grid-cols-3 gap-2 w-full pt-1">
                      <a
                        href={`https://wa.me/2${p.phoneNumber.replace(/\D/g, "")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors text-xs font-bold text-center"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        واتساب
                      </a>
                      <a
                        href={`tel:${p.phoneNumber}`}
                        className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-bold text-center"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127 1.007.36 2 .7 2.95a2 2 0 01-.45 2.11L6.5 7.5a16 16 0 006.29 6.29l.72-.77a2 2 0 012.11-.45c.95.34 1.943.573 2.95.7A2 2 0 0122 16.92z" />
                        </svg>
                        اتصال
                      </a>
                      <Link
                        href={`/doctor/patients/${p._id}`}
                        className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors text-xs font-bold text-center"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                        الملف الطبي
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* ── Notification Modal ───────────────────────── */}
      {showNotifModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="max-w-md w-full shadow-2xl bg-surface border-primary/20">
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
              <h3 className="font-display text-lg font-bold text-text-primary">إرسال إشعار للمريض</h3>
              <button onClick={() => setShowNotifModal(false)} className="h-11 w-11 flex items-center justify-center rounded-full text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors">✕</button>
            </div>
            <p className="text-sm text-text-secondary mb-4">إرسال رسالة للمريض: <span className="font-bold text-text-primary">{selectedPatient.firstName} {selectedPatient.lastName}</span></p>
            <form onSubmit={handleSendNotification} className="flex flex-col gap-4">
              <Field label="عنوان الإشعار *" required value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} placeholder="مثال: تذكير بموعد الاستشارة" />
              <TextAreaField label="نص الرسالة *" required value={notifMessage} onChange={(e) => setNotifMessage(e.target.value)} placeholder="اكتب رسالتك هنا..." />
              {notifError && <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-xs font-bold text-danger">{notifError}</div>}
              {notifSuccess && <div className="rounded-xl bg-success/10 border border-success/20 p-3 text-xs font-bold text-success">تم إرسال الإشعار بنجاح!</div>}
              <div className="flex gap-3 mt-2">
                <Button type="submit" variant="vibrant" className="flex-1 shadow-glow-cyan" disabled={sendingNotif || notifSuccess}>
                  {sendingNotif ? "جارٍ الإرسال..." : "إرسال"}
                </Button>
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowNotifModal(false)}>إغلاق</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          FLOATING BUTTON -> Redirects to the new page
      ══════════════════════════════════════════════════ */}
      {/* bottom-24 on mobile keeps this clear of the draggable assistant
          orb's default resting spot in the same corner; text collapses to
          an icon below sm so the pill can't run into the screen edge. */}
      <Link href="/doctor/patient-reports" className="fixed bottom-24 sm:bottom-8 left-4 sm:left-8 z-40">
        <button className="flex items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-surface-raised text-text-primary font-bold text-sm shadow-xl hover:bg-surface hover:-translate-y-0.5 border border-border/60 transition-all duration-200">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 sm:hidden">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
          <span className="hidden sm:inline">ملفات وتقارير المرضى</span>
          {unseenCount > 0 && (
            <span className="h-6 min-w-[1.5rem] flex items-center justify-center rounded-full bg-danger text-surface text-xs font-black px-1.5 animate-pulse">
              {unseenCount}
            </span>
          )}
        </button>
      </Link>
    </div>
  );
}
