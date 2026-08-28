"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyPatients } from "@/lib/api/patient";
import { createNotification } from "@/lib/api/notification";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, TextAreaField } from "@/components/ui/Input";
import { ApiError } from "@/lib/http";
import type { Patient } from "@/types/api";

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Notification Modal State
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [notifSuccess, setNotifSuccess] = useState(false);

  useEffect(() => {
    getMyPatients()
      .then((res) => setPatients(res.data.patients ?? []))
      .catch((err) => {
        const msg = err?.message || "تعذّر جلب المرضى";
        if (msg.toLowerCase().includes("subscription expired")) {
          setError("اشتراك حساب الطبيب منتهي (Subscription Expired). يلزم تجديد تفعيل حساب الطبيب من صفحة الإدارة (/admin/doctors).");
        } else {
          setError(msg);
        }
      })
      .finally(() => setLoading(false));
  }, []);

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
      await createNotification({
        patientId: selectedPatient._id,
        title: notifTitle,
        message: notifMessage,
      });
      setNotifSuccess(true);
      setTimeout(() => setShowNotifModal(false), 2000);
    } catch (err) {
      setNotifError(err instanceof ApiError ? err.message : "تعذّر إرسال الإشعار");
    } finally {
      setSendingNotif(false);
    }
  }

  const filteredPatients = patients.filter((p) => {
    const name = `${p.firstName} ${p.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    return (
      name.includes(query) ||
      (p.phoneNumber && p.phoneNumber.includes(query)) ||
      (p.nationalId && p.nationalId.includes(query))
    );
  });

  if (error) {
    return (
      <Card className="mx-auto max-w-lg text-center p-8 border-warning/30 animate-fade-in">
        <p className="text-base font-bold text-warning">{error}</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">
            سجلات المرضى
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            البحث عن مرضى العيادة الحاليين وإدارة ملفاتهم الطبية
          </p>
        </div>
        <Link href="/doctor/patients/register">
          <Button variant="vibrant" className="shadow-glow-cyan">
            + تسجيل مريض جديد
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="بحث باسم المريض، رقم الهاتف أو الرقم القومي..."
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

      {/* Grid List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-surface-raised" />
          ))}
        </div>
      ) : filteredPatients.length === 0 ? (
        <Card className="py-16 text-center text-text-secondary">
          <p className="text-base font-semibold">لا يوجد مرضى مطابقين للبحث</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((p) => (
            <Link key={p._id} href={`/doctor/patients/${p._id}`}>
              <Card hover className="h-full flex flex-col justify-between p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 cursor-pointer">
                <div>
                  <p className="font-display font-bold text-text-primary text-lg">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="mt-2 text-xs text-text-secondary flex items-center gap-1">
                    <span></span> <span dir="ltr">{p.phoneNumber}</span>
                  </p>
                  {p.email && (
                    <p className="mt-1 text-xs text-text-secondary flex items-center gap-1">
                      <span></span> {p.email}
                    </p>
                  )}
                  {p.nationalId && (
                    <p className="mt-1 text-xs text-text-secondary flex items-center gap-1">
                      <span>🪪</span> {p.nationalId}
                    </p>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-bold">
                  <span className="text-primary group-hover:underline">عرض السجل الكامل ←</span>
                  
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-8 px-2 z-10 hover:bg-primary hover:text-surface hover:border-primary transition-colors"
                    onClick={(e) => openNotificationModal(e, p)}
                  >
                    إرسال إشعار
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Send Notification Modal */}
      {showNotifModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="max-w-md w-full shadow-2xl bg-surface border-primary/20">
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
              <h3 className="font-display text-lg font-bold text-text-primary">
                إرسال إشعار للمريض
              </h3>
              <button
                onClick={() => setShowNotifModal(false)}
                className="text-text-secondary hover:text-danger transition-colors h-8 w-8 flex items-center justify-center rounded-full hover:bg-danger/10"
              >
                ✕
              </button>
            </div>
            
            <p className="text-sm text-text-secondary mb-4">
              إرسال رسالة مباشرة للمريض: <span className="font-bold text-text-primary">{selectedPatient.firstName} {selectedPatient.lastName}</span>
            </p>

            <form onSubmit={handleSendNotification} className="flex flex-col gap-4">
              <Field
                label="عنوان الإشعار *"
                required
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="مثال: تذكير بموعد الاستشارة"
              />
              <TextAreaField
                label="نص الرسالة *"
                required
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
              />
              
              {notifError && (
                <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-xs font-bold text-danger">
                  {notifError}
                </div>
              )}
              
              {notifSuccess && (
                <div className="rounded-xl bg-success/10 border border-success/20 p-3 text-xs font-bold text-success">
                  تم إرسال الإشعار بنجاح! 
                </div>
              )}

              <div className="flex w-full gap-3 mt-2">
                <Button 
                  type="submit"
                  variant="vibrant" 
                  className="flex-1 font-bold shadow-glow-cyan" 
                  disabled={sendingNotif || notifSuccess}
                >
                  {sendingNotif ? "جارٍ الإرسال..." : "إرسال"}
                </Button>
                <Button 
                  type="button"
                  variant="secondary" 
                  className="flex-1 font-bold" 
                  onClick={() => setShowNotifModal(false)}
                >
                  إغلاق
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
