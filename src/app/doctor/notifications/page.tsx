"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  createNotification,
  deleteAllNotificationsForDoctor,
  deleteNotificationForDoctor,
  getAllNotificationsForDoctor,
  updateNotification,
} from "@/lib/api/notification";
import {
  createGeneralNotificationByDoctor,
  getMyGeneralNotifications,
} from "@/lib/api/generalNotification";
import { getMyPatients } from "@/lib/api/patient";
import { Card } from "@/components/ui/Card";
import { Field, TextAreaField } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import type { GeneralNotification, Notification, Patient } from "@/types/api";

type TabType = "direct" | "general";

function DoctorNotificationsContent() {
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patientId") ?? "";
  const initialTab = (searchParams.get("tab") as TabType) || "direct";

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Data lists
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [directNotifications, setDirectNotifications] = useState<Notification[]>([]);
  const [generalNotifications, setGeneralNotifications] = useState<GeneralNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Direct notification form state
  const [patientId, setPatientId] = useState(initialPatientId);
  const [directTitle, setDirectTitle] = useState("");
  const [directMessage, setDirectMessage] = useState("");
  const [directSending, setDirectSending] = useState(false);
  const [directError, setDirectError] = useState<string | null>(null);
  const [directSuccess, setDirectSuccess] = useState<string | null>(null);

  // General notification form state
  const [generalTitle, setGeneralTitle] = useState("");
  const [generalMessage, setGeneralMessage] = useState("");
  const [generalSending, setGeneralSending] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null);

  // Patient search filter inside dropdown
  const [patientSearch, setPatientSearch] = useState("");

  // Edit Direct Notification state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete All modal state
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  // Load all initial data
  async function loadData() {
    setLoading(true);
    try {
      // 1. Patients
      setPatientsLoading(true);
      getMyPatients()
        .then((res) => setPatients(res.data.patients ?? []))
        .catch(() => setPatients([]))
        .finally(() => setPatientsLoading(false));

      // 2. Direct notifications sent by doctor
      const directRes = await getAllNotificationsForDoctor().catch(() => ({ data: { notifications: [] } }));
      setDirectNotifications(directRes.data.notifications ?? []);

      // 3. General notifications sent by doctor
      const generalRes = await getMyGeneralNotifications().catch(() => ({ data: { notifications: [] } }));
      setGeneralNotifications(generalRes.data.notifications ?? []);
    } catch (err) {
      console.error("Failed to load notifications data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filtered patients for dropdown
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients;
    const q = patientSearch.toLowerCase();
    return patients.filter((p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.phoneNumber?.includes(q) ||
      p.nationalId?.includes(q)
    );
  }, [patients, patientSearch]);

  // Selected patient label helper
  const selectedPatientObj = useMemo(() => {
    return patients.find((p) => p._id === patientId) ?? null;
  }, [patients, patientId]);

  // Helper to resolve patient name in sent list
  function resolvePatientLabel(target: string | Patient) {
    if (typeof target === "object" && target !== null) {
      return `${target.firstName || ""} ${target.lastName || ""}`.trim() || target.email || target._id;
    }
    const found = patients.find((p) => p._id === target);
    if (found) return `${found.firstName} ${found.lastName}`;
    return target || "مريض";
  }

  // Handle send direct notification
  async function handleSendDirect(e: FormEvent) {
    e.preventDefault();
    if (!patientId.trim()) {
      setDirectError("يرجى اختيار المريض أولاً");
      return;
    }
    if (!directTitle.trim() || !directMessage.trim()) {
      setDirectError("يرجى كتابة عنوان ورسالة الإشعار");
      return;
    }

    setDirectError(null);
    setDirectSuccess(null);
    setDirectSending(true);

    try {
      const res = await createNotification({
        patientId: patientId.trim(),
        title: directTitle.trim(),
        message: directMessage.trim(),
      });
      const newNotif = res.data.createdNotification;
      setDirectNotifications((prev) => [newNotif, ...prev]);

      setDirectTitle("");
      setDirectMessage("");
      setDirectSuccess("تم إرسال الإشعار للمريض بنجاح ووصل إلى حسابه فوراً ✓");
      setTimeout(() => setDirectSuccess(null), 4000);
    } catch (err) {
      setDirectError(err instanceof ApiError ? err.message : "تعذّر إرسال الإشعار، يرجى المحاولة مجدداً");
    } finally {
      setDirectSending(false);
    }
  }

  // Handle send general notification
  async function handleSendGeneral(e: FormEvent) {
    e.preventDefault();
    if (!generalTitle.trim() || !generalMessage.trim()) {
      setGeneralError("يرجى كتابة عنوان وتفاصيل التنبيه العام");
      return;
    }

    setGeneralError(null);
    setGeneralSuccess(null);
    setGeneralSending(true);

    try {
      const res = await createGeneralNotificationByDoctor({
        title: generalTitle.trim(),
        message: generalMessage.trim(),
      });
      const created = res.data.created;
      if (created) {
        setGeneralNotifications((prev) => [created, ...prev]);
      } else {
        const generalRes = await getMyGeneralNotifications().catch(() => ({ data: { notifications: [] } }));
        setGeneralNotifications(generalRes.data.notifications ?? []);
      }

      setGeneralTitle("");
      setGeneralMessage("");
      setGeneralSuccess("تم نشر التنبيه العام لجميع المرضى المسجلين بنجاح ✓");
      setTimeout(() => setGeneralSuccess(null), 4000);
    } catch (err) {
      setGeneralError(err instanceof ApiError ? err.message : "تعذّر نشر التنبيه العام");
    } finally {
      setGeneralSending(false);
    }
  }

  // Edit Direct notification handlers
  function startEdit(n: Notification) {
    setEditingId(n._id);
    setEditTitle(n.title ?? "");
    setEditMessage(n.message ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditMessage("");
  }

  async function handleSaveEdit(id: string) {
    if (!editMessage.trim()) return;
    setSavingEdit(true);
    try {
      const res = await updateNotification(id, { title: editTitle, message: editMessage });
      const updated = res.data.updatedNotification;
      setDirectNotifications((prev) => prev.map((n) => (n._id === id ? updated : n)));
      cancelEdit();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "تعذّر تعديل الإشعار");
    } finally {
      setSavingEdit(false);
    }
  }

  async function removeDirect(id: string) {
    setDirectNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await deleteNotificationForDoctor(id);
    } catch (err) {
      loadData();
      alert(err instanceof ApiError ? err.message : "تعذّر حذف الإشعار");
    }
  }

  async function handleClearAllDirect() {
    setDeletingAll(true);
    try {
      await deleteAllNotificationsForDoctor();
      setDirectNotifications([]);
      setShowDeleteAllModal(false);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "تعذّر مسح الإشعارات");
    } finally {
      setDeletingAll(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in relative max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary">
          إدارة إشعارات وتنبيهات المرضى
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          أرسل تنبيهات مباشرة لمريض محدد أو انشر إعلاناً وتوجيهات عامة لجميع المرضى
        </p>
      </div>

      {/* Tabs */}
      <Card glass vibrant className="p-1.5 sm:p-2">
        <div className="grid grid-cols-2 gap-2 text-center">
          <button
            type="button"
            onClick={() => setActiveTab("direct")}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-extrabold transition-all duration-300 ${
              activeTab === "direct"
                ? "bg-primary text-surface shadow-glow-cyan"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            <span> إشعار خاص لمريض محدد</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-extrabold transition-all duration-300 ${
              activeTab === "general"
                ? "bg-primary text-surface shadow-glow-cyan"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            <span> تنبيه عام لجميع المرضى</span>
          </button>
        </div>
      </Card>

      {/* ── TAB 1: DIRECT PATIENT NOTIFICATION ── */}
      {activeTab === "direct" && (
        <div className="flex flex-col gap-6">
          {/* Send Form Card */}
          <Card className="shadow-xl border-primary/20 p-5 sm:p-6">
            <h2 className="font-display text-base sm:text-lg font-bold text-text-primary mb-1">
              إرسال إشعار مباشر لمريض
            </h2>
            <p className="text-xs text-text-secondary mb-5">
              يصل هذا الإشعار مباشرة إلى صندوق إشعارات المريض في حسابه
            </p>

            <form onSubmit={handleSendDirect} className="flex flex-col gap-4">
              {/* Patient Selector */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-text-primary">
                  اختر المريض المستلم *
                </label>

                {/* Patient Select Dropdown */}
                <div className="flex flex-col gap-2">
                  <select
                    value={patientId}
                    onChange={(e) => {
                      setPatientId(e.target.value);
                      setDirectError(null);
                    }}
                    className="w-full rounded-xl border border-border/80 bg-surface px-4 py-2.5 text-xs sm:text-sm text-text-primary outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.1)]"
                  >
                    <option value="">-- اختر مريضاً من القائمة ({patients.length} مريض) --</option>
                    {filteredPatients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.firstName} {p.lastName} {p.phoneNumber ? `(${p.phoneNumber})` : ""} {p.nationalId ? `[${p.nationalId}]` : ""}
                      </option>
                    ))}
                  </select>

                  {/* Optional manual search/input */}
                  {patients.length > 5 && (
                    <input
                      type="text"
                      placeholder=" تصفية بالاسم أو الهاتف أو الرقم القومي..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full rounded-xl border border-border/50 bg-surface-raised px-3.5 py-1.5 text-xs text-text-secondary outline-none focus:border-primary"
                    />
                  )}

                  {selectedPatientObj && (
                    <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3.5 py-2 text-xs font-bold text-primary">
                      <span>✓ تم اختيار: {selectedPatientObj.firstName} {selectedPatientObj.lastName}</span>
                      {selectedPatientObj.phoneNumber && <span>({selectedPatientObj.phoneNumber})</span>}
                    </div>
                  )}
                </div>
              </div>

              <Field
                label="عنوان الإشعار *"
                required
                value={directTitle}
                onChange={(e) => { setDirectTitle(e.target.value); setDirectError(null); }}
                placeholder="مثال: تذكير بموعد الكشف / مراجعة نتائج التحاليل"
              />

              <TextAreaField
                label="نص الرسالة *"
                required
                value={directMessage}
                onChange={(e) => { setDirectMessage(e.target.value); setDirectError(null); }}
                placeholder="اكتب تفاصيل الرسالة والتوجيهات للمريض هنا..."
              />

              {directError && (
                <div className="rounded-xl bg-danger/10 px-4 py-3 text-xs font-bold text-danger border border-danger/20 animate-fade-in">
                  {directError}
                </div>
              )}

              {directSuccess && (
                <div className="rounded-xl bg-success/10 px-4 py-3 text-xs font-bold text-success border border-success/30 animate-fade-in">
                  {directSuccess}
                </div>
              )}

              <Button
                type="submit"
                variant="vibrant"
                disabled={directSending}
                className="shadow-glow-cyan font-bold justify-center"
              >
                {directSending ? "جارٍ إرسال الإشعار..." : "إرسال الإشعار الآن"}
              </Button>
            </form>
          </Card>

          {/* Sent Direct Notifications List */}
          <Card className="shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4 mb-4">
              <div>
                <h2 className="font-display text-base sm:text-lg font-bold text-text-primary">
                  سجل الإشعارات الخاصة المُرسلة
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  جميع الرسائل والتنبيهات المباشرة التي أرسلتها لمرضاك ({directNotifications.length})
                </p>
              </div>

              {directNotifications.length > 0 && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setShowDeleteAllModal(true)}
                  className="self-start sm:self-auto text-xs font-bold"
                >
                  مسح السجل بالكامل
                </Button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col gap-3 animate-pulse">
                {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-border/40 rounded-xl" />)}
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border/60">
                {directNotifications.map((n) => (
                  <div key={n._id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 py-4 transition-all">
                    {editingId === n._id ? (
                      // Edit Mode
                      <div className="flex-1 flex flex-col gap-3 bg-surface-raised p-4 rounded-xl border border-primary/30">
                        <Field
                          label="العنوان"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="bg-surface"
                        />
                        <TextAreaField
                          label="الرسالة"
                          value={editMessage}
                          onChange={(e) => setEditMessage(e.target.value)}
                          className="bg-surface"
                        />
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="vibrant" disabled={savingEdit} onClick={() => handleSaveEdit(n._id)}>
                            {savingEdit ? "حفظ..." : "حفظ التعديل"}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEdit}>
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                              لمريض: {resolvePatientLabel(n.patientId)}
                            </span>
                            <span className="text-[10px] text-text-secondary opacity-60">
                              {new Date(n.createdAt).toLocaleString("ar-EG")}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-text-primary mt-1">{n.title}</p>
                          <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed whitespace-pre-wrap">{n.message}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0 shrink-0 self-end sm:self-auto">
                          <Button size="sm" variant="outline" onClick={() => startEdit(n)} className="text-xs">
                            تعديل
                          </Button>
                          <Button size="sm" variant="ghost" className="text-danger hover:bg-danger/10 hover:text-danger text-xs" onClick={() => removeDirect(n._id)}>
                            حذف
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {directNotifications.length === 0 && (
                  <p className="py-8 text-center text-xs sm:text-sm text-text-secondary bg-surface-raised rounded-xl border border-border/40 border-dashed">
                    لم ترسل أي إشعارات خاصة للمرضى بعد.
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── TAB 2: GENERAL CLINIC ANNOUNCEMENTS ── */}
      {activeTab === "general" && (
        <div className="flex flex-col gap-6">
          {/* Announcement Form Card */}
          <Card className="shadow-xl border-primary/20 p-5 sm:p-6">
            <h2 className="font-display text-base sm:text-lg font-bold text-text-primary mb-1">
              نشر تنبيه أو إعلان عام لجميع المرضى
            </h2>
            <p className="text-xs text-text-secondary mb-5">
              يظهر هذا التنبيه لجميع المرضى المسجلين والمتابعين لعيادتك في صفحة إشعاراتهم
            </p>

            <form onSubmit={handleSendGeneral} className="flex flex-col gap-4">
              <Field
                label="عنوان التنبيه أو الإعلان *"
                required
                value={generalTitle}
                onChange={(e) => { setGeneralTitle(e.target.value); setGeneralError(null); }}
                placeholder="مثال: مواعيد العمل خلال شهر رمضان / إجازة العيادة يوم الخميس"
              />

              <TextAreaField
                label="تفاصيل التنبيه *"
                required
                value={generalMessage}
                onChange={(e) => { setGeneralMessage(e.target.value); setGeneralError(null); }}
                placeholder="اكتب التوجيهات أو الملاحظات العامة لجميع المرضى هنا..."
              />

              {generalError && (
                <div className="rounded-xl bg-danger/10 px-4 py-3 text-xs font-bold text-danger border border-danger/20 animate-fade-in">
                  {generalError}
                </div>
              )}

              {generalSuccess && (
                <div className="rounded-xl bg-success/10 px-4 py-3 text-xs font-bold text-success border border-success/30 animate-fade-in">
                  {generalSuccess}
                </div>
              )}

              <Button
                type="submit"
                variant="vibrant"
                disabled={generalSending}
                className="shadow-glow-cyan font-bold justify-center"
              >
                {generalSending ? "جارٍ النشر..." : "نشر التنبيه العام"}
              </Button>
            </form>
          </Card>

          {/* General Notifications History */}
          <Card className="shadow-xl">
            <div className="border-b border-border/50 pb-4 mb-4">
              <h2 className="font-display text-base sm:text-lg font-bold text-text-primary">
                التنبيهات والإعلانات المنشورة
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                سجل التنبيهات العامة النشطة المنشورة للمرضى ({generalNotifications.length})
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3 animate-pulse">
                {[1, 2].map((i) => <div key={i} className="h-20 bg-border/40 rounded-xl" />)}
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border/60">
                {generalNotifications.map((gn) => (
                  <div key={gn._id} className="py-4 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="rounded-full bg-accent/10 border border-accent/20 px-2.5 py-0.5 text-[11px] font-bold text-accent">
                        تنبيه عام
                      </span>
                      <span className="text-[10px] text-text-secondary opacity-60">
                        {new Date(gn.createdAt).toLocaleString("ar-EG")}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-text-primary mt-1">{gn.title}</p>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{gn.message}</p>
                  </div>
                ))}

                {generalNotifications.length === 0 && (
                  <p className="py-8 text-center text-xs sm:text-sm text-text-secondary bg-surface-raised rounded-xl border border-border/40 border-dashed">
                    لا توجد تنبيهات عامة منشورة حالياً.
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Delete All Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="max-w-md w-full shadow-2xl border-danger/30 bg-surface">
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger text-3xl font-black">
                !
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-text-primary">
                  هل أنت متأكد؟
                </h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                  سيتم حذف <strong>جميع الإشعارات الخاصة</strong> التي أرسلتها نهائياً ولا يمكن التراجع عن هذا الإجراء.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-4">
                <Button
                  variant="danger"
                  className="flex-1 font-bold"
                  onClick={handleClearAllDirect}
                  disabled={deletingAll}
                >
                  {deletingAll ? "جارٍ الحذف..." : "نعم، احذف الكل"}
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 font-bold"
                  onClick={() => setShowDeleteAllModal(false)}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function DoctorNotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        </div>
      }
    >
      <DoctorNotificationsContent />
    </Suspense>
  );
}
