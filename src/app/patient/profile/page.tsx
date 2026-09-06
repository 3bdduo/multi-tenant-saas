"use client";

import { FormEvent, useEffect, useState } from "react";
import { getMyProfile, updateMe } from "@/lib/api/patient";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import { validateEgyptianPhone, validateEmail } from "@/lib/validators";
import type { Patient } from "@/types/api";

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({ firstName: "", lastName: "", phoneNumber: "", email: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await getMyProfile();
      const p = res.data.patient;
      setProfile(p);
      setForm({
        firstName: p.firstName ?? "",
        lastName: p.lastName ?? "",
        phoneNumber: p.phoneNumber ?? "",
        email: p.email ?? "",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "الاسم الأول مطلوب";
    if (!form.lastName.trim()) errs.lastName = "اسم العائلة مطلوب";
    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;
    const phoneErr = validateEgyptianPhone(form.phoneNumber);
    if (phoneErr) errs.phoneNumber = phoneErr;
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setSaving(true);
    try {
      await updateMe(form);
      setSuccess(true);
      setEditing(false);
      load();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر تحديث البيانات");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl animate-fade-in">
        {[1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-border/50" />)}
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-text-primary">بوابة المريض</h1>
        <p className="mt-1 text-sm text-text-secondary">عرض وتعديل بياناتك الشخصية في بوابة المريض</p>
      </div>

      {/* Profile Card */}
      <Card glass vibrant className="border-primary/20">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 text-3xl font-black text-primary">
            {profile.firstName?.[0]?.toUpperCase() ?? "م"}
          </div>
          <div>
            <h2 className="font-display text-xl font-extrabold text-text-primary">
              {profile.firstName} {profile.lastName}
            </h2>
            {profile.userName && (
              <p className="text-sm text-text-secondary mt-0.5">@{profile.userName}</p>
            )}
            <span className="mt-2 inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary border border-primary/30">
              بوابة المريض
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "البريد الإلكتروني", value: profile.email },
            { label: "رقم الهاتف", value: profile.phoneNumber },
            { label: "تاريخ التسجيل", value: new Date(profile.createdAt).toLocaleDateString("ar-EG") },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-surface-raised px-4 py-3">
              <p className="text-xs text-text-secondary">{label}</p>
              <p className="mt-0.5 text-sm font-semibold text-text-primary">{value ?? "—"}</p>
            </div>
          ))}
          {profile.nationalId && (
            <div className="rounded-xl bg-surface-raised px-4 py-3">
              <p className="text-xs text-text-secondary">الرقم القومي</p>
              <p className="mt-0.5 text-sm font-semibold text-text-primary" dir="ltr">
                {profile.nationalId}
              </p>
            </div>
          )}
        </div>
      </Card>

      {success && (
        <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success font-bold animate-fade-in">
          تم تحديث بياناتك بنجاح!
        </div>
      )}

      {/* Edit Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-bold text-text-primary">تعديل البيانات</h2>
          {!editing && (
            <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
              تعديل
            </Button>
          )}
        </div>

        {!editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-text-secondary text-xs mb-0.5">الاسم الأول</p>
              <p className="font-medium text-text-primary">{profile.firstName}</p>
            </div>
            <div>
              <p className="text-text-secondary text-xs mb-0.5">اسم العائلة</p>
              <p className="font-medium text-text-primary">{profile.lastName}</p>
            </div>
            <div>
              <p className="text-text-secondary text-xs mb-0.5">رقم الهاتف</p>
              <p className="font-medium text-text-primary">{profile.phoneNumber}</p>
            </div>
            <div>
              <p className="text-text-secondary text-xs mb-0.5">البريد الإلكتروني</p>
              <p className="font-medium text-text-primary">{profile.email}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="الاسم الأول"
              required
              value={form.firstName}
              onChange={(e) => { setForm((f) => ({ ...f, firstName: e.target.value })); setFieldErrors((p) => ({ ...p, firstName: "" })); }}
              error={fieldErrors.firstName}
            />
            <Field
              label="اسم العائلة"
              required
              value={form.lastName}
              onChange={(e) => { setForm((f) => ({ ...f, lastName: e.target.value })); setFieldErrors((p) => ({ ...p, lastName: "" })); }}
              error={fieldErrors.lastName}
            />
            <Field
              label="رقم الهاتف"
              inputMode="tel"
              value={form.phoneNumber}
              onChange={(e) => { setForm((f) => ({ ...f, phoneNumber: e.target.value })); setFieldErrors((p) => ({ ...p, phoneNumber: "" })); }}
              error={fieldErrors.phoneNumber}
            />
            <Field
              label="البريد الإلكتروني"
              type="email"
              value={form.email}
              onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setFieldErrors((p) => ({ ...p, email: "" })); }}
              error={fieldErrors.email}
            />

            <p className="sm:col-span-2 text-xs text-text-secondary rounded-lg bg-surface-raised px-3 py-2">
              الرقم القومي لا يمكن تعديله
            </p>

            {error && (
              <div className="sm:col-span-2 rounded-xl bg-danger/10 border border-danger/20 px-3 py-2 text-sm text-danger">
                {error}
              </div>
            )}

            <div className="sm:col-span-2 flex gap-3">
              <Button type="submit" variant="vibrant" disabled={saving} className="shadow-glow-cyan flex-1">
                {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => { setEditing(false); setFieldErrors({}); setError(null); }}>
                إلغاء
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
