"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
import {
  getMyPatients,
  getNonClinicPatients,
  lookupPatientByNationalId,
} from "@/lib/api/patient";
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
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [directNotifications, setDirectNotifications] = useState<Notification[]>([]);
  const [generalNotifications, setGeneralNotifications] = useState<GeneralNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state: Direct
  const [patientId, setPatientId] = useState(initialPatientId);
  const [directTitle, setDirectTitle] = useState("");
  const [directMessage, setDirectMessage] = useState("");
  const [directSending, setDirectSending] = useState(false);
  const [directError, setDirectError] = useState<string | null>(null);
  const [directSuccess, setDirectSuccess] = useState<string | null>(null);
  const [directAuthExpired, setDirectAuthExpired] = useState(false);

  // Form state: General
  const [generalTitle, setGeneralTitle] = useState("");
  const [generalMessage, setGeneralMessage] = useState("");
  const [generalSending, setGeneralSending] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null);
  const [generalAuthExpired, setGeneralAuthExpired] = useState(false);

  // Patient search filter & National ID lookup
  const [patientSearch, setPatientSearch] = useState("");
  const [nidInput, setNidInput] = useState("");
  const [nidLoading, setNidLoading] = useState(false);
  const [nidMsg, setNidMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Edit Direct notification modal/state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete all direct modal
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  // Fetch all data
  async function loadData() {
    setLoading(true);
    try {
      // 1. Fetch patients (both clinic appointment patients and general registered patients)
      setPatientsLoading(true);
      setPatientsError(null);

      const [myRes, nonClinicRes] = await Promise.allSettled([
        getMyPatients(),
        getNonClinicPatients(),
      ]);

      const listA = myRes.status === "fulfilled" ? (myRes.value.data?.patients ?? []) : [];
      const listB = nonClinicRes.status === "fulfilled" ? (nonClinicRes.value.data?.patients ?? []) : [];

      const map = new Map<string, Patient>();
      for (const p of [...listA, ...listB]) {
        if (p && p._id) {
          map.set(p._id, p);
        }
      }
      const combined = Array.from(map.values());
      setPatients(combined);

      if (combined.length === 0) {
        if (myRes.status === "rejected" && nonClinicRes.status === "rejected") {
          const errReason = myRes.reason?.message || "";
          if (errReason.toLowerCase().includes("subscription expired")) {
            setPatientsError("اشتراكك منتهي — يرجى التجديد لتفعيل إرسال الإشعارات للمرضى");
          } else {
            setPatientsError("تعذّر جلب قائمة المرضى من السيرفر");
          }
        } else {
          setPatientsError("لا يوجد مرضى مسجلون في النظام حتى الآن");
        }
      }

      // 2. Direct notifications sent by doctor
      const directRes = await getAllNotificationsForDoctor().catch(() => ({ data: { notifications: [] } }));
      setDirectNotifications(directRes.data?.notifications ?? []);

      // 3. General notifications
      const generalRes = await getMyGeneralNotifications().catch(() => ({ data: { notifications: [] } }));
      setGeneralNotifications(generalRes.data?.notifications ?? []);
    } catch (err) {
      console.error("Failed to load notifications data", err);
    } finally {
      setPatientsLoading(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Quick lookup by National ID
  async function handleLookupByNationalId(e: FormEvent) {
    e.preventDefault();
    const nid = nidInput.trim();
    if (!nid) return;

    setNidLoading(true);
    setNidMsg(null);

    try {
      const res = await lookupPatientByNationalId(nid);
      const found = res.data?.patient;
      if (found && found._id) {
        // Add to patients list if not present
        setPatients((prev) => {
          if (prev.some((p) => p._id === found._id)) return prev;
          return [found, ...prev];
        });
        setPatientId(found._id);
        setDirectError(null);
        setNidMsg({
          text: `✓ تم العثور على المريض: ${found.firstName} ${found.lastName} وتم اختياره بنجاح`,
          isError: false,
        });
        setNidInput("");
      } else {
        setNidMsg({
          text: "لم يتم العثور على مريض مسجل بهذا الرقم القومي",
          isError: true,
        });
      }
    } catch (err: any) {
      setNidMsg({
        text: err instanceof ApiError ? err.message : "لم يتم العثور على مريض بهذا الرقم القومي",
        isError: true,
      });
    } finally {
      setNidLoading(false);
    }
  }

  // Filtered patients for dropdown
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients;
    const q = patientSearch.toLowerCase().trim();
    return patients.filter((p) =>
      `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase().includes(q) ||
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
      const name = `${target.firstName || ""} ${target.lastName || ""}`.trim() || target.email || target._id;
      return target.nationalId ? `${name} (قومي: ${target.nationalId})` : name;
    }
    const found = patients.find((p) => p._id === target);
    if (found) {
      return `${found.firstName} ${found.lastName}${found.nationalId ? ` (قومي: ${found.nationalId})` : ""}`;
    }
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
    setDirectAuthExpired(false);
    setDirectSending(true);

    try {
      const res = await createNotification({
        patientId: patientId.trim(),
        title: directTitle.trim(),
        message: directMessage.trim(),
      });
      const newNotif = res.data?.createdNotification;
      if (newNotif) {
        setDirectNotifications((prev) => [newNotif, ...prev]);
      } else {
        const directRes = await getAllNotificationsForDoctor().catch(() => ({ data: { notifications: [] } }));
        setDirectNotifications(directRes.data?.notifications ?? []);
      }

      setDirectTitle("");
      setDirectMessage("");
      setDirectSuccess("تم إرسال الإشعار للمريض بنجاح ووصل إلى حسابه فوراً ✓");
      setTimeout(() => setDirectSuccess(null), 5000);
    } catch (err) {
      console.error("[Direct Notification Error]", err);
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setDirectAuthExpired(true);
          setDirectError("انتهت جلسة العمل الخاصة بحساب الطبيب — يرجى إعادة تسجيل الدخول لمتابعة الإرسال.");
        } else if (err.status === 403) {
          setDirectError("يتطلب إرسال الإشعارات اشتراكاً فعالاً لحساب الطبيب.");
        } else {
          setDirectError(err.message || "تعذّر إرسال الإشعار، يرجى المحاولة مجدداً");
        }
      } else {
        setDirectError("تعذّر إرسال الإشعار، يرجى المحاولة مجدداً");
      }
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
    setGeneralAuthExpired(false);
    setGeneralSending(true);

    try {
      const res = await createGeneralNotificationByDoctor({
        title: generalTitle.trim(),
        message: generalMessage.trim(),
      });
      const created = res.data?.created;
      if (created) {
        setGeneralNotifications((prev) => [created, ...prev]);
      } else {
        const generalRes = await getMyGeneralNotifications().catch(() => ({ data: { notifications: [] } }));
        setGeneralNotifications(generalRes.data?.notifications ?? []);
      }

      setGeneralTitle("");
      setGeneralMessage("");
      setGeneralSuccess("تم نشر التنبيه العام بنجاح لجميع المرضى المسجلين ✓");
      setTimeout(() => setGeneralSuccess(null), 5000);
    } catch (err) {
      console.error("[General Notification Error]", err);
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setGeneralAuthExpired(true);
          setGeneralError("انتهت جلسة تسجيل الدخول الخاصة بحسابك — يرجى تسجيل الدخول مجدداً للمتابعة.");
        } else if (err.status === 403) {
          setGeneralError("يتطلب نشر التنبيهات العامة اشتراكاً نشطاً لحساب الطبيب.");
        } else {
          setGeneralError(err.message || "تعذّر نشر التنبيه العام");
        }
      } else {
        setGeneralError("تعذّر نشر التنبيه العام");
      }
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
      const updated = res.data?.updatedNotification;
      if (updated) {
        setDirectNotifications((prev) => prev.map((n) => (n._id === id ? updated : n)));
      }
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
    <div className="flex flex-col gap-6 animate-fade-in relative max-w-4xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary">
            إدارة إشعارات وتنبيهات المرضى
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            أرسل تنبيهات مباشرة لمريض محدد أو انشر إعلاناً وتوجيهات عامة لجميع المرضى
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => loadData()}
          disabled={loading || patientsLoading}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
        >
          <svg className={`w-3.5 h-3.5 ${loading || patientsLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>تحديث البيانات</span>
        </Button>
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
            <span>✉ إشعار خاص لمريض محدد</span>
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
            <span>📢 تنبيه عام لجميع المرضى</span>
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
              يصل هذا الإشعار مباشرة إلى صندوق إشعارات المريض في حسابه فور الإرسال
            </p>

            <form onSubmit={handleSendDirect} className="flex flex-col gap-4">
              {/* Patient Selector */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-text-primary">
                  اختر المريض المستلم *
                </label>

                <div className="flex flex-col gap-2.5">
                  {patientsError && (
                    <div className="flex items-center gap-2 rounded-xl bg-warning/10 border border-warning/25 px-3.5 py-2.5 text-xs font-bold text-warning">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {patientsError}
                    </div>
                  )}

                  {/* Main Dropdown */}
                  <select
                    value={patientId}
                    onChange={(e) => {
                      setPatientId(e.target.value);
                      setDirectError(null);
                    }}
                    disabled={patientsLoading}
                    className="w-full rounded-xl border border-border/80 bg-surface px-4 py-2.5 text-xs sm:text-sm text-text-primary outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.1)] disabled:opacity-60"
                  >
                    {patientsLoading ? (
                      <option value="">جارٍ تحميل قائمة المرضى...</option>
                    ) : patients.length === 0 ? (
                      <option value="">-- لم يتم العثور على مرضى تلقائياً (استخدم البحث بالرقم القومي أدناه) --</option>
                    ) : (
                      <>
                        <option value="">-- اختر مريضاً من القائمة ({filteredPatients.length} مريض متاح) --</option>
                        {filteredPatients.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.firstName} {p.lastName} {p.phoneNumber ? ` | هاتف: ${p.phoneNumber}` : ""} {p.nationalId ? ` | قومي: [${p.nationalId}]` : ""}
                          </option>
                        ))}
                      </>
                    )}
                  </select>

                  {/* Filter / Quick Search Input */}
                  {patients.length > 3 && (
                    <input
                      type="text"
                      placeholder="🔍 تصفية القائمة بالاسم أو الهاتف أو الرقم القومي..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full rounded-xl border border-border/50 bg-surface-raised px-3.5 py-2 text-xs text-text-primary outline-none focus:border-primary"
                    />
                  )}

                  {/* Selected Patient Confirmation Badge */}
                  {selectedPatientObj && (
                    <div className="flex items-center justify-between gap-2 rounded-xl bg-primary/10 border border-primary/25 p-3 text-xs font-bold text-primary animate-fade-in">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>✓ المستلم:</span>
                        <span className="text-sm font-extrabold">{selectedPatientObj.firstName} {selectedPatientObj.lastName}</span>
                        {selectedPatientObj.phoneNumber && <span className="opacity-80 font-mono">({selectedPatientObj.phoneNumber})</span>}
                        {selectedPatientObj.nationalId && <span className="opacity-70 font-mono text-[11px]">[{selectedPatientObj.nationalId}]</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => setPatientId("")}
                        className="text-text-secondary hover:text-danger text-xs font-normal underline"
                      >
                        تغيير
                      </button>
                    </div>
                  )}

                  {/* National ID Instant Lookup Form */}
                  <div className="rounded-xl border border-dashed border-border/70 bg-surface-raised/50 p-3 flex flex-col gap-2 mt-1">
                    <span className="text-[11px] font-bold text-text-secondary">
                      هل المريض مسجل جديد ولم يظهر في القائمة؟ ابحث عنه بالرقم القومي:
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="أدخل الرقم القومي للمريض (14 رقم)..."
                        value={nidInput}
                        onChange={(e) => setNidInput(e.target.value)}
                        className="flex-1 rounded-lg border border-border/60 bg-surface px-3 py-1.5 text-xs text-text-primary outline-none focus:border-primary font-mono"
                      />
                      <Button
                        size="sm"
                        type="button"
                        variant="secondary"
                        onClick={handleLookupByNationalId}
                        disabled={nidLoading || !nidInput.trim()}
                        className="text-xs font-bold shrink-0 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                      >
                        {nidLoading ? "جارٍ البحث..." : "بحث وإضافة"}
                      </Button>
                    </div>
                    {nidMsg && (
                      <p className={`text-[11px] font-bold ${nidMsg.isError ? "text-danger" : "text-success"}`}>
                        {nidMsg.text}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Field
                label="عنوان الإشعار *"
                required
                value={directTitle}
                onChange={(e) => { setDirectTitle(e.target.value); setDirectError(null); }}
                placeholder="مثال: تذكير بموعد الاستشارة / نتائج الفحوصات الطبية"
              />

              <TextAreaField
                label="نص الرسالة *"
                required
                value={directMessage}
                onChange={(e) => { setDirectMessage(e.target.value); setDirectError(null); }}
                placeholder="اكتب تفاصيل الرسالة والتوجيهات الطبية للمريض هنا..."
              />

              {directError && (
                <div className="rounded-xl bg-danger/10 p-3.5 text-xs font-bold text-danger border border-danger/20 animate-fade-in flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{directError}</span>
                  </div>
                  {directAuthExpired && (
                    <Link
                      href="/login"
                      className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger text-surface font-bold text-xs hover:bg-danger/90 transition-colors"
                    >
                      تسجيل الدخول مرة أخرى ←
                    </Link>
                  )}
                </div>
              )}

              {directSuccess && (
                <div className="rounded-xl bg-success/10 px-4 py-3 text-xs font-bold text-success border border-success/30 animate-fade-in flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{directSuccess}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="vibrant"
                disabled={directSending}
                className="shadow-glow-cyan font-bold justify-center hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
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
                  className="self-start sm:self-auto text-xs font-bold hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
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
                          <Button size="sm" variant="outline" onClick={() => startEdit(n)} className="font-bold hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
                            تعديل
                          </Button>
                          <Button size="sm" variant="ghost" className="text-danger hover:bg-danger/10 hover:text-danger font-bold hover:-translate-y-0.5 active:scale-95 transition-all duration-200" onClick={() => removeDirect(n._id)}>
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
                placeholder="مثال: إجازة يوم العيد / مواعيد العمل خلال شهر رمضان"
              />

              <TextAreaField
                label="تفاصيل التنبيه *"
                required
                value={generalMessage}
                onChange={(e) => { setGeneralMessage(e.target.value); setGeneralError(null); }}
                placeholder="اكتب التوجيهات أو الملاحظات العامة لجميع المرضى هنا..."
              />

              {generalError && (
                <div className="rounded-xl bg-danger/10 p-3.5 text-xs font-bold text-danger border border-danger/20 animate-fade-in flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{generalError}</span>
                  </div>
                  {generalAuthExpired && (
                    <Link
                      href="/login"
                      className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger text-surface font-bold text-xs hover:bg-danger/90 transition-colors"
                    >
                      تسجيل الدخول مرة أخرى للمتابعة ←
                    </Link>
                  )}
                </div>
              )}

              {generalSuccess && (
                <div className="rounded-xl bg-success/10 px-4 py-3 text-xs font-bold text-success border border-success/30 animate-fade-in flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{generalSuccess}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="vibrant"
                disabled={generalSending}
                className="shadow-glow-cyan font-bold justify-center hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
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
                  className="flex-1 font-bold hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                  onClick={handleClearAllDirect}
                  disabled={deletingAll}
                >
                  {deletingAll ? "جارٍ الحذف..." : "نعم، احذف الكل"}
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 font-bold hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
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
