"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClinic, getMe, getMyClinic, updateMyClinic, updateClinicStatus } from "@/lib/api/doctor";
import { Card } from "@/components/ui/Card";
import { Field, SelectField, TextAreaField } from "@/components/ui/Input";
import { SpecialtySelect } from "@/components/ui/SpecialtySelect";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import { GOVERNORATES, EGYPT_LOCATIONS, getVillages } from "@/lib/egyptLocations";
import { SupportContactBox } from "@/components/SupportActivationModal";
import type { CreateClinicPayload, Doctor } from "@/types/api";

const EMPTY: CreateClinicPayload = {
  name: "",
  description: "",
  phoneNumber: "",
  email: "",
  governorate: "",
  city: "",
  street: "",
  specialization: "",
  consultationPrice: 0,
  followUpPrice: 0,
  workingDays: [],
  bookingType: "queue",
  maxPatientsPerDay: 20,
};


function InfoRow({
  label,
  value,
  accent,
}: {
  label: string;
  value?: string | number | null;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-border/40 last:border-0">
      <span className="text-[11px] font-extrabold uppercase tracking-wider text-text-secondary">
        {label}
      </span>
      <span className={`text-sm font-semibold ${accent ? "text-accent font-bold" : "text-text-primary"}`}>
        {value ? (
          String(value)
        ) : (
          <span className="italic text-text-secondary opacity-50">لم يُضف بعد</span>
        )}
      </span>
    </div>
  );
}

/* ─── Reusable editable section ──────────────────────────────────────────── */
function Section({
  title,
  editing,
  saving,
  onEdit,
  onCancel,
  onSave,
  viewChildren,
  children,
}: {
  title: string;
  editing: boolean;
  saving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  viewChildren: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface-raised overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5 sm:py-3.5 bg-surface border-b border-border/50">
        <h3 className="text-xs sm:text-sm font-extrabold text-text-primary min-w-0">
          {title}
        </h3>
        {!editing ? (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary transition-all duration-200 shrink-0"
          >
            <span>تعديل</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-bold text-text-secondary hover:bg-surface-raised transition-all"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3 sm:px-4 py-1.5 text-xs font-bold text-surface shadow-glow-cyan transition-all disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-3 w-3 rounded-full border-2 border-surface/30 border-t-surface animate-spin" />
                  <span>حفظ...</span>
                </>
              ) : (
                <span>حفظ التغييرات</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {editing ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-fade-in">
            {children}
          </div>
        ) : (
          <div className="animate-fade-in">{viewChildren}</div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function DoctorClinicPage() {
  const [activeTab, setActiveTab] = useState<"private" | "public">("private");

  // Source of truth (always reflects last server state)
  const [form, setForm] = useState<CreateClinicPayload>(EMPTY);
  // Draft used only while editing a section
  const [draft, setDraft] = useState<CreateClinicPayload>(EMPTY);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedVillage, setSelectedVillage] = useState("");
  const [streetDetail, setStreetDetail] = useState("");

  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  // Status toggle state
  const [togglingStatus, setTogglingStatus] = useState(false);

  async function handleToggleStatus() {
    if (!exists || !form._id) return;
    setTogglingStatus(true);
    setSectionError(null);
    try {
      const newStatus = !form.isActive;
      await updateClinicStatus({ isActive: newStatus });
      setForm((prev) => ({ ...prev, isActive: newStatus }));
      setGlobalSuccess(newStatus ? "تم تفعيل العيادة وتظهر الآن للمرضى" : "تم إيقاف العيادة ولن تظهر للمرضى");
      setTimeout(() => setGlobalSuccess(null), 4000);
    } catch (err) {
      setSectionError(err instanceof ApiError ? err.message : "تعذّر تغيير حالة العيادة");
    } finally {
      setTogglingStatus(false);
    }
  }

  /* ── Load on mount ─────────────────────────────────────────────────── */
  useEffect(() => {
    Promise.allSettled([getMyClinic(), getMe()])
      .then(([clinicRes, docRes]) => {
        const docData = docRes.status === "fulfilled" ? docRes.value.data : null;
        if (docData) setDoctor(docData);

        if (clinicRes.status === "fulfilled") {
          const data = { ...EMPTY, ...(clinicRes.value.data as Partial<CreateClinicPayload>) };
          setForm(data);
          setDraft(data);
          setStreetDetail(data.street ?? "");
          setExists(true);
        } else if (docData) {
          const prefill: CreateClinicPayload = {
            ...EMPTY,
            email: docData.email ?? "",
            phoneNumber: docData.phoneNumber ?? "",
          };
          setForm(prefill);
          setDraft(prefill);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── Helpers ───────────────────────────────────────────────────────── */
  function updateDraft<K extends keyof CreateClinicPayload>(key: K, val: CreateClinicPayload[K]) {
    setDraft((d) => ({ ...d, [key]: val }));
  }

  function updateDraftStreet(village: string, detail: string) {
    const parts = [village, detail].filter(Boolean);
    setDraft((d) => ({ ...d, street: parts.join(" - ") }));
  }

  function startEdit(section: string) {
    setDraft({ ...form });
    setStreetDetail(form.street ?? "");
    setSelectedVillage("");
    setSectionError(null);
    setEditingSection(section);
  }

  function cancelEdit() {
    setDraft({ ...form });
    setSectionError(null);
    setEditingSection(null);
  }

  async function saveSection() {
    setSaving(true);
    setSectionError(null);
    try {
      if (exists) {
        await updateMyClinic(draft);
      } else {
        await createClinic(draft);
        setExists(true);
      }
      setForm({ ...draft });
      setEditingSection(null);
      setGlobalSuccess("تم حفظ بيانات العيادة بنجاح");
      setTimeout(() => setGlobalSuccess(null), 4000);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "تعذّر حفظ البيانات";
      setSectionError(
        msg.toLowerCase().includes("subscription expired")
          ? "اشتراك حساب الطبيب منتهي. يلزم تجديد الاشتراك من إدارة المنصة."
          : msg
      );
    } finally {
      setSaving(false);
    }
  }

  /* ── Loading skeleton ──────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse max-w-3xl mx-auto">
        <div className="h-14 rounded-2xl bg-border/30" />
        <div className="h-12 rounded-2xl bg-border/30" />
        <div className="h-48 rounded-2xl bg-border/30" />
        <div className="h-36 rounded-2xl bg-border/30" />
        <div className="h-28 rounded-2xl bg-border/30" />
      </div>
    );
  }

  const availableCities =
    draft.governorate && EGYPT_LOCATIONS[draft.governorate]
      ? [
          { label: "-- اختر المدينة / المركز --", value: "" },
          ...EGYPT_LOCATIONS[draft.governorate].map((c) => ({ label: c, value: c })),
        ]
      : [{ label: "-- اختر المحافظة أولاً --", value: "" }];

  const availableVillages = getVillages(draft.governorate, draft.city);
  const villageOptions =
    availableVillages.length > 0
      ? [
          { label: "-- اختر القرية / المنطقة --", value: "" },
          ...availableVillages.map((v) => ({ label: v, value: v })),
          { label: "أخرى (كتابة يدوية في الحقل أدناه)", value: "other" },
        ]
      : [{ label: "-- أدخل القرية/الشارع في الحقل أدناه --", value: "" }];

  const isEditing = (s: string) => editingSection === s;

  return (
    <div className="flex flex-col gap-5 animate-fade-in max-w-3xl mx-auto pb-10">

      {/* Account Status Banner */}
      {doctor && (() => {
        const isExpired = doctor.paidExpired ? new Date(doctor.paidExpired) < new Date() : false;
        const isDoctorActive = Boolean(doctor.isPaid && !isExpired);
        return (
          <>
            <div
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs sm:text-sm font-medium ${
                isDoctorActive
                  ? "bg-success/10 border-success/30 text-success"
                  : "bg-warning/10 border-warning/30 text-warning"
              }`}
            >
              <div className="flex items-center gap-2 font-bold min-w-0">
                <span className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full shrink-0 animate-pulse-glow ${isDoctorActive ? "bg-success" : "bg-warning"}`} />
                <span className="leading-snug">
                  {isDoctorActive
                    ? `حساب الطبيب مُفعل بالكامل${
                        doctor.paidExpired
                          ? ` (ينتهي الاشتراك في ${new Date(doctor.paidExpired).toLocaleDateString("ar-EG")})`
                          : ""
                      }`
                    : "حساب الطبيب غير مُفعل حالياً (لم يتم التفعيل بعد من إدارة المنصة)"}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${isDoctorActive ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>
                  {isDoctorActive ? "مُفعل" : "لم يتم التفعيل"}
                </span>
                {exists && (
                  <button
                    onClick={handleToggleStatus}
                    disabled={togglingStatus}
                    className={`rounded-full px-3 py-1 text-xs font-extrabold flex items-center gap-1 transition-all shrink-0 ${
                      form.isActive
                        ? "bg-primary/20 text-primary hover:bg-primary/30"
                        : "bg-surface-raised border border-border/50 text-text-secondary hover:bg-surface"
                    }`}
                  >
                    {togglingStatus && <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />}
                    {form.isActive ? "العيادة ظاهرة للجمهور" : "العيادة مخفية"}
                  </button>
                )}
              </div>
            </div>

            {!isDoctorActive && (
              <SupportContactBox />
            )}
          </>
        );
      })()}

      {/* Header info */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-extrabold text-text-primary">
          بيانات العيادة
        </h1>
        <p className="text-xs text-text-secondary">
          إدارة البيانات الضرورية للعيادة والأسعار والموقع والتواصل
        </p>
      </div>

      {/* Tab Switcher */}
      <Card glass vibrant className="p-2">
        <div className="grid grid-cols-2 gap-2 text-center">
          {(["private", "public"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold transition-all duration-300 ${
                activeTab === tab
                  ? "bg-primary text-surface shadow-glow-cyan"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
              }`}
            >
              {tab === "private" ? (
                <>
                  {/* Icon */}
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3" />
                  </svg>
                  <span className="hidden sm:inline">بيانات العيادة الأساسية</span>
                  <span className="sm:hidden">بيانات العيادة</span>
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="hidden sm:inline">معاينة بطاقة المريض</span>
                  <span className="sm:hidden whitespace-nowrap">معاينة حية</span>
                </>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Global feedback */}
      {globalSuccess && (
        <div className="rounded-2xl bg-success/10 border border-success/30 px-4 py-3 text-sm font-bold text-success animate-fade-in flex items-center gap-2">
          <span>{globalSuccess}</span>
        </div>
      )}
      {sectionError && (
        <div className="rounded-2xl bg-danger/10 border border-danger/30 px-4 py-3 text-sm font-bold text-danger animate-fade-in flex items-start gap-2">
          <span>{sectionError}</span>
        </div>
      )}

      {/* ══════════════════════ PRIVATE VIEW ══════════════════════════════ */}
      {activeTab === "private" && (
        <div className="flex flex-col gap-5 animate-fade-in">

          {!exists ? (
            /* ── Unified Initial Setup Form (Essential Data Only) ── */
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                setSectionError(null);
                try {
                  await createClinic(draft);
                  setForm({ ...draft });
                  setExists(true);
                  setGlobalSuccess("تم إنشاء وتفعيل بيانات العيادة بنجاح");
                  setTimeout(() => setGlobalSuccess(null), 4000);
                } catch (err) {
                  const msg = err instanceof ApiError ? err.message : "تعذّر إنشاء العيادة";
                  setSectionError(
                    msg.toLowerCase().includes("subscription expired")
                      ? "اشتراك حساب الطبيب منتهي. يلزم تجديد الاشتراك من إدارة المنصة لتفعيل العيادة."
                      : msg
                  );
                } finally {
                  setSaving(false);
                }
              }}
              className="flex flex-col gap-5"
            >
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 text-sm text-text-primary">
                <h3 className="font-display font-extrabold text-base text-primary">
                  البيانات الضرورية لإنشاء العيادة
                </h3>
                <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                  أدخل البيانات الأساسية للعيادة وأسعار الكشف والموقع لبدء العمل. يمكنك ضبط أيام ومواعيد ونظام الحجز لاحقاً من خانة <strong>إعدادات الحجز</strong> في السايد بار.
                </p>
              </div>

              {/* 1. Basic Information & Pricing */}
              <Card glass vibrant className="p-6">
                <h3 className="font-display font-bold text-base text-text-primary mb-4">
                  1. المعلومات الأساسية وأسعار الكشف
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="اسم العيادة *"
                    required
                    value={draft.name}
                    onChange={(e) => updateDraft("name", e.target.value)}
                    placeholder="مثال: عيادة الأمل التخصصية"
                    className="sm:col-span-2"
                  />
                  <SpecialtySelect
                    value={draft.specialization}
                    onChangeValue={(val) => updateDraft("specialization", val)}
                    className="sm:col-span-2"
                    required
                  />
                  <Field
                    label="سعر الكشف للمريض الجديد (ج.م) *"
                    type="number"
                    required
                    min={1}
                    value={draft.consultationPrice === 0 ? "" : draft.consultationPrice}
                    onChange={(e) => updateDraft("consultationPrice", Number(e.target.value))}
                    placeholder="مثال: 250"
                  />
                  <Field
                    label="سعر إعادة الكشف / متابعة لمريض سابق (ج.م) *"
                    type="number"
                    required
                    min={0}
                    value={(draft.followUpPrice ?? 0) === 0 ? "" : draft.followUpPrice}
                    onChange={(e) => updateDraft("followUpPrice", Number(e.target.value))}
                    placeholder="مثال: 150"
                  />
                  <div className="sm:col-span-2 rounded-xl bg-surface-raised border border-border/60 px-4 py-3 text-xs text-text-secondary">
                    <span className="font-bold text-text-primary">نظام التسعير: </span>
                    سعر الكشف الجديد يظهر للمريض الذي يحجز لأول مرة، وسعر الإعادة يظهر للمريض الذي سبق وحجز في العيادة.
                  </div>
                </div>
              </Card>

              {/* 2. Location & Address */}
              <Card glass vibrant className="p-6">
                <h3 className="font-display font-bold text-base text-text-primary mb-4">
                  2. الموقع والعنوان
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SelectField
                    label="المحافظة *"
                    required
                    value={draft.governorate}
                    onChange={(e) => {
                      const gov = e.target.value;
                      setDraft((d) => ({ ...d, governorate: gov, city: "" }));
                      setSelectedVillage("");
                    }}
                    options={[
                      { label: "-- اختر المحافظة --", value: "" },
                      ...GOVERNORATES.map((g) => ({ label: g, value: g })),
                    ]}
                  />
                  <SelectField
                    label="المدينة / المركز *"
                    required
                    disabled={!draft.governorate}
                    value={draft.city}
                    onChange={(e) => {
                      updateDraft("city", e.target.value);
                      setSelectedVillage("");
                    }}
                    options={availableCities}
                  />
                  <SelectField
                    label="القرية / المنطقة (اختياري)"
                    disabled={!draft.city}
                    value={selectedVillage}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSelectedVillage(v);
                      updateDraftStreet(v === "other" ? "" : v, streetDetail);
                    }}
                    options={villageOptions}
                    className="sm:col-span-2"
                  />
                  <Field
                    label="اسم الشارع / تفاصيل العنوان *"
                    required
                    value={streetDetail}
                    onChange={(e) => {
                      setStreetDetail(e.target.value);
                      updateDraftStreet(selectedVillage === "other" ? "" : selectedVillage, e.target.value);
                    }}
                    placeholder="مثال: شارع الجمهورية - برج الأطباء الدور الثالث"
                    className="sm:col-span-2"
                  />
                  <TextAreaField
                    label="توضيحات إضافية للموقع (علامات مميزة)"
                    value={draft.description ?? ""}
                    onChange={(e) => updateDraft("description", e.target.value)}
                    placeholder="أدخل علامات مميزة للوصول إلى العيادة بسهولة..."
                    className="sm:col-span-2"
                  />
                </div>
              </Card>

              {/* 3. Contact Details */}
              <Card glass vibrant className="p-6">
                <h3 className="font-display font-bold text-base text-text-primary mb-4">
                  3. رقم هاتف التواصل والحجز
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="رقم هاتف العيادة أو الحجز *"
                    required
                    inputMode="tel"
                    value={draft.phoneNumber}
                    onChange={(e) => updateDraft("phoneNumber", e.target.value)}
                    placeholder="مثال: 01000000000"
                    className="sm:col-span-2"
                  />
                </div>
              </Card>

              {/* Sidebar Booking Settings Pointer */}
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-display font-bold text-sm text-text-primary">
                    إعدادات الحجز وجداول العمل
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    يتم تفعيل جدول افتراضي للعيادة تلقائياً. يمكنك تخصيص أيام العمل ومواعيد الكشف في أي وقت من خانة <strong>"إعدادات الحجز"</strong> بالسايد بار.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                variant="vibrant"
                size="lg"
                loading={saving}
                className="w-full text-base font-bold shadow-glow-cyan py-4"
              >
                {saving ? "جارٍ الحفظ والإنشاء..." : "إنشاء وتفعيل العيادة الآن"}
              </Button>
            </form>
          ) : (
            /* ── Modular Sections (When Clinic Already Exists) ── */
            <>
              {/* ── Section 1: Basic Info & Prices ──────────────── */}
              <Section
                title="المعلومات الأساسية وأسعار الكشف"
                editing={isEditing("basic")}
                saving={saving}
                onEdit={() => startEdit("basic")}
                onCancel={cancelEdit}
                onSave={saveSection}
                viewChildren={
                  <>
                    <InfoRow label="اسم العيادة" value={form.name} />
                    <InfoRow label="التخصص الطبي" value={form.specialization} />
                    <InfoRow
                      label="سعر الكشف للمريض الجديد"
                      value={form.consultationPrice ? `${form.consultationPrice} ج.م` : null}
                      accent
                    />
                    <InfoRow
                      label="سعر إعادة الكشف / متابعة لمريض سابق"
                      value={form.followUpPrice ? `${form.followUpPrice} ج.م` : form.consultationPrice ? `${form.consultationPrice} ج.م` : null}
                      accent
                    />
                  </>
                }
              >
                <Field
                  label="اسم العيادة *"
                  required
                  value={draft.name}
                  onChange={(e) => updateDraft("name", e.target.value)}
                  placeholder="مثال: عيادة الأمل الطبية"
                  className="sm:col-span-2"
                />
                <SpecialtySelect
                  value={draft.specialization}
                  onChangeValue={(val) => updateDraft("specialization", val)}
                  className="sm:col-span-2"
                  required
                />
                <Field
                  label="سعر الكشف للمريض الجديد (ج.م) *"
                  type="number"
                  required
                  min={1}
                  value={draft.consultationPrice === 0 ? "" : draft.consultationPrice}
                  onChange={(e) => updateDraft("consultationPrice", Number(e.target.value))}
                />
                <Field
                  label="سعر إعادة الكشف / متابعة (ج.م) *"
                  type="number"
                  required
                  min={0}
                  value={(draft.followUpPrice ?? 0) === 0 ? "" : draft.followUpPrice}
                  onChange={(e) => updateDraft("followUpPrice", Number(e.target.value))}
                />
              </Section>

              {/* ── Section 2: Location & Address ───────────────── */}
              <Section
                title="الموقع والعنوان"
                editing={isEditing("location")}
                saving={saving}
                onEdit={() => startEdit("location")}
                onCancel={cancelEdit}
                onSave={saveSection}
                viewChildren={
                  <>
                    <InfoRow label="المحافظة" value={form.governorate} />
                    <InfoRow label="المدينة / المركز" value={form.city} />
                    <InfoRow label="الشارع / العنوان التفصيلي" value={form.street} />
                    <InfoRow label="توضيحات الموقع" value={form.description} />
                  </>
                }
              >
                <SelectField
                  label="المحافظة *"
                  required
                  value={draft.governorate}
                  onChange={(e) => {
                    const gov = e.target.value;
                    setDraft((d) => ({ ...d, governorate: gov, city: "" }));
                    setSelectedVillage("");
                  }}
                  options={[
                    { label: "-- اختر المحافظة --", value: "" },
                    ...GOVERNORATES.map((g) => ({ label: g, value: g })),
                  ]}
                />
                <SelectField
                  label="المدينة / المركز *"
                  required
                  disabled={!draft.governorate}
                  value={draft.city}
                  onChange={(e) => {
                    updateDraft("city", e.target.value);
                    setSelectedVillage("");
                  }}
                  options={availableCities}
                />
                <SelectField
                  label="القرية / المنطقة (اختياري)"
                  disabled={!draft.city}
                  value={selectedVillage}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedVillage(v);
                    updateDraftStreet(v === "other" ? "" : v, streetDetail);
                  }}
                  options={villageOptions}
                  className="sm:col-span-2"
                />
                <Field
                  label="اسم الشارع / تفاصيل العنوان"
                  value={streetDetail}
                  onChange={(e) => {
                    setStreetDetail(e.target.value);
                    updateDraftStreet(selectedVillage === "other" ? "" : selectedVillage, e.target.value);
                  }}
                  placeholder="مثال: شارع المحطة / بجوار المخبز الآلي"
                  className="sm:col-span-2"
                />
                <TextAreaField
                  label="توضيحات الموقع (علامات مميزة)"
                  value={draft.description ?? ""}
                  onChange={(e) => updateDraft("description", e.target.value)}
                  placeholder="أدخل تفاصيل إضافية للعنوان أو علامات مميزة للوصول للعيادة..."
                  className="sm:col-span-2"
                />
              </Section>

              {/* ── Section 3: Contact ────────────────────────── */}
              <Section
                title="بيانات التواصل"
                editing={isEditing("contact")}
                saving={saving}
                onEdit={() => startEdit("contact")}
                onCancel={cancelEdit}
                onSave={saveSection}
                viewChildren={
                  <>
                    <InfoRow label="رقم الهاتف للحجز والاستعلام" value={form.phoneNumber} />
                  </>
                }
              >
                <Field
                  label="رقم هاتف العيادة / الحجز *"
                  required
                  inputMode="tel"
                  value={draft.phoneNumber}
                  onChange={(e) => updateDraft("phoneNumber", e.target.value)}
                  placeholder="مثال: 01000000000"
                  className="sm:col-span-2"
                />
              </Section>

              {/* ── Dedicated Sidebar Navigation Card for Booking Settings ── */}
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div>
                  <h4 className="font-display font-extrabold text-sm text-text-primary">
                    إعدادات الحجز والمواعيد وأيام العمل
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    يمكنك ضبط نظام الحجز (دور أو مواعيد محددة)، مدة الكشف، وساعات وأيام العمل من صفحة إعدادات الحجز بالسايد بار.
                  </p>
                </div>
                <Link href="/doctor/booking-settings">
                  <Button variant="vibrant" size="sm" className="whitespace-nowrap font-bold shadow-glow-cyan">
                    إعدادات الحجز
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════ PUBLIC PREVIEW ════════════════════════════ */}
      {activeTab === "public" && (
        <Card glass vibrant className="p-6 md:p-8 shadow-2xl animate-fade-in border-accent/30">
          <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
            <div>
              <h2 className="font-display text-xl font-extrabold text-text-primary">
                بطاقة العيادة المعروضة للمرضى
              </h2>
              <p className="mt-1 text-xs text-text-secondary">
                هكذا تظهر بيانات عيادتك تماماً للمرضى عند تصفح العيادات على المنصة.
              </p>
            </div>
            <span className="whitespace-nowrap rounded-full bg-success/20 border border-success/30 px-3 py-1 text-xs font-extrabold text-success shrink-0">
              معاينة حية
            </span>
          </div>

          <div className="rounded-3xl border border-primary/30 bg-surface-raised p-6 md:p-8 shadow-xl flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5">
              <div>
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-extrabold text-primary">
                  {form.specialization || "التخصص الطبي"}
                </span>
                <h3 className="font-display text-2xl font-extrabold text-text-primary mt-2">
                  {form.name || "اسم العيادة الطبية"}
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  {form.governorate || "المحافظة"}، {form.city || "المدينة"}
                  {form.street ? ` — ${form.street}` : ""}
                </p>
              </div>
              <div className="grid grid-cols-2 md:flex md:flex-row items-start md:items-center gap-3">
                <div className="flex flex-col bg-surface px-4 py-2.5 rounded-2xl border border-border/50">
                  <span className="text-[11px] font-bold text-text-secondary">كشف جديد</span>
                  <span className="font-display text-xl font-black text-accent mt-0.5">
                    {form.consultationPrice ? `${form.consultationPrice} ج.م` : "—"}
                  </span>
                </div>
                <div className="flex flex-col bg-surface px-4 py-2.5 rounded-2xl border border-border/50">
                  <span className="text-[11px] font-bold text-text-secondary whitespace-nowrap">إعادة كشف / متابعة</span>
                  <span className="font-display text-xl font-black text-primary mt-0.5">
                    {form.followUpPrice ? `${form.followUpPrice} ج.م` : form.consultationPrice ? `${form.consultationPrice} ج.م` : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-text-secondary mb-1">عن العيادة والموقع:</h4>
              <p className="text-sm leading-relaxed text-text-primary">
                {form.description || <span className="italic opacity-50">لم يتم إضافة تفاصيل الموقع بعد.</span>}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-3 rounded-2xl bg-surface p-4 border border-border/60">
                <div>
                  <p className="text-[11px] font-extrabold text-text-secondary">نظام الحجز</p>
                  <p className="text-sm font-bold text-text-primary">
                    {form.bookingType === "time" ? "مواعيد محددة" : "أسبقية الحضور (طابور)"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-surface p-4 border border-border/60">
                <div>
                  <p className="text-[11px] font-extrabold text-text-secondary">رقم الاستعلام والحجز</p>
                  <p className="text-sm font-bold text-text-primary" dir="ltr">{form.phoneNumber || "—"}</p>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => setActiveTab("private")}
                className="font-bold"
              >
                تعديل بيانات العيادة
              </Button>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Copy link button */}
                {form._id && (
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}/clinics/${form._id}`;
                      navigator.clipboard.writeText(url).then(() => {
                        const btn = document.getElementById("copy-link-btn");
                        if (btn) { btn.textContent = "تم النسخ ✓"; setTimeout(() => { btn.textContent = "نسخ رابط الحجز"; }, 2000); }
                      });
                    }}
                    id="copy-link-btn"
                    className="rounded-2xl border border-border/60 bg-surface-raised px-4 py-2.5 text-xs font-bold text-text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    نسخ رابط الحجز
                  </button>
                )}
                {form._id ? (
                  <Link href={`/clinics/${form._id}`} target="_blank">
                    <Button variant="vibrant" size="lg" className="font-bold shadow-glow-cyan">
                      فتح صفحة الحجز العامة ↗
                    </Button>
                  </Link>
                ) : (
                  <Link href="/clinics">
                    <Button variant="vibrant" size="lg" className="font-bold shadow-glow-cyan">
                      تصفح العيادات
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
