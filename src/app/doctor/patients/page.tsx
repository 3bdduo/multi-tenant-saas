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
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-primary/10 via-surface-raised to-surface-raised border-b border-border/60">
                    <th className="py-3.5 px-5 text-right font-extrabold text-text-primary text-xs">#</th>
                    <th className="py-3.5 px-5 text-right font-extrabold text-text-primary text-xs">اسم المريض</th>
                    <th className="py-3.5 px-5 text-right font-extrabold text-text-primary text-xs">رقم الهاتف</th>
                    <th className="py-3.5 px-5 text-right font-extrabold text-text-primary text-xs">الرقم القومي</th>
                    <th className="py-3.5 px-5 text-center font-extrabold text-text-primary text-xs">التواصل</th>
                    <th className="py-3.5 px-5 text-center font-extrabold text-text-primary text-xs">الملف الطبي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredPatients.map((p, i) => (
                    <tr key={p._id} className="group hover:bg-primary/5 transition-colors duration-150">
                      <td className="py-4 px-5 text-xs font-bold text-text-secondary">{i + 1}</td>
                      <td className="py-4 px-5 font-bold text-text-primary group-hover:text-primary transition-colors">{p.firstName} {p.lastName}</td>
                      <td className="py-4 px-5"><span dir="ltr" className="font-semibold text-text-primary">{p.phoneNumber}</span></td>
                      <td className="py-4 px-5">
                        {p.nationalId
                          ? <span dir="ltr" className="font-semibold text-text-primary">{p.nationalId}</span>
                          : <span className="text-text-secondary">—</span>}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-2">
                          <a href={`https://wa.me/2${p.phoneNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/25 transition-colors text-xs font-bold whitespace-nowrap">
                            مراسلة واتساب
                          </a>
                          <a href={`tel:${p.phoneNumber}`}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-bold whitespace-nowrap">
                            إجراء مكالمة
                          </a>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <Link href={`/doctor/patients/${p._id}`}
                          className="px-4 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors text-xs font-bold whitespace-nowrap">
                          عرض الملف الطبي
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ── Notification Modal ───────────────────────── */}
      {showNotifModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="max-w-md w-full shadow-2xl bg-surface border-primary/20">
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
              <h3 className="font-display text-lg font-bold text-text-primary">إرسال إشعار للمريض</h3>
              <button onClick={() => setShowNotifModal(false)} className="h-8 w-8 flex items-center justify-center rounded-full text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors">✕</button>
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
      <Link href="/doctor/patient-reports" className="fixed bottom-8 left-8 z-40">
        <button className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-surface-raised text-text-primary font-bold text-sm shadow-xl hover:bg-surface hover:-translate-y-0.5 border border-border/60 transition-all duration-200">
          ملفات وتقارير المرضى
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
