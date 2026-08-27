"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerHospital } from "@/lib/api/auth";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@/lib/http";
import {
  validateEgyptianNationalId,
  validateEgyptianPhone,
  validateEmail,
  validatePassword,
} from "@/lib/validators";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/ui/Logo";

const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "الشرقية", "القليوبية",
  "كفر الشيخ", "الغربية", "المنوفية", "البحيرة", "الإسماعيلية", "بور سعيد",
  "السويس", "دمياط", "الفيوم", "بني سويف", "المنيا", "أسيوط", "سوهاج",
  "قنا", "الأقصر", "أسوان", "البحر الأحمر", "الوادي الجديد", "مطروح",
  "شمال سيناء", "جنوب سيناء",
];

export function HospitalRegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    nationalId: "",
    email: "",
    password: "",
    hospitalName: "",
    phoneNumber: "",
    address: "",
    governorate: "",
    city: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (!form.hospitalName.trim()) errs.hospitalName = "يرجى إدخال اسم المستشفى";

    const nidErr = validateEgyptianNationalId(form.nationalId);
    if (nidErr) errs.nationalId = nidErr;

    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;

    const phoneErr = validateEgyptianPhone(form.phoneNumber);
    if (phoneErr) errs.phoneNumber = phoneErr;

    const passErr = validatePassword(form.password);
    if (passErr) errs.password = passErr;

    if (!form.address.trim()) errs.address = "يرجى إدخال العنوان";
    if (!form.governorate) errs.governorate = "يرجى اختيار المحافظة";
    if (!form.city.trim()) errs.city = "يرجى إدخال المدينة";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await registerHospital(form);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "تعذّر إنشاء الحساب، حاول مرة أخرى"
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <Card glass vibrant className="w-full max-w-md p-10 text-center border-violet-500/30 shadow-2xl animate-scale-in-slow">
          <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-success/15 border border-success/30">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-success">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-extrabold text-text-primary">تم التسجيل بنجاح!</h2>
          <p className="mt-3 text-sm text-text-secondary leading-relaxed">
            تم إنشاء حساب المستشفى. سيتم مراجعة طلبك وتفعيل الحساب من قبل مدير النظام. ستتلقى إشعاراً عند التفعيل.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/login">
              <Button variant="vibrant" className="w-full shadow-glow-purple bg-violet-500 hover:bg-violet-600">
                الذهاب لتسجيل الدخول
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full">العودة للصفحة الرئيسية</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
      <div className="absolute top-6 left-6 z-20">
        <ThemeToggle />
      </div>
      <Card glass vibrant className="w-full max-w-xl animate-scale-in-slow p-8 border-violet-500/20 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <Logo size="lg" href={null} />
          </div>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-violet-500">
              <path d="M3 21h18" /><path d="M19 21v-4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4" />
              <path d="M5 15V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8" />
              <path d="M12 9v4" /><path d="M10 11h4" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">
            تسجيل مستشفى جديد
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            أدخل بيانات المستشفى كاملةً — سيتم التفعيل من قبل مدير النظام بعد المراجعة
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
          {/* Hospital Name */}
          <Field
            label="اسم المستشفى"
            required
            value={form.hospitalName}
            onChange={(e) => update("hospitalName", e.target.value)}
            error={fieldErrors.hospitalName}
            placeholder="مثال: مستشفى النور التخصصي"
            className="sm:col-span-2"
          />
          {/* National ID */}
          <Field
            label="الرقم القومي للمسؤول (14 رقمًا)"
            required
            inputMode="numeric"
            value={form.nationalId}
            onChange={(e) => update("nationalId", e.target.value)}
            error={fieldErrors.nationalId}
            placeholder="00000000000000"
            className="sm:col-span-2"
          />
          {/* Email */}
          <Field
            label="البريد الإلكتروني"
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            error={fieldErrors.email}
            placeholder="hospital@example.com"
          />
          {/* Phone */}
          <Field
            label="رقم الهاتف المصري"
            required
            inputMode="tel"
            value={form.phoneNumber}
            onChange={(e) => update("phoneNumber", e.target.value)}
            error={fieldErrors.phoneNumber}
            placeholder="01000000000"
          />
          {/* Address */}
          <Field
            label="العنوان التفصيلي"
            required
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            error={fieldErrors.address}
            placeholder="مثال: 15 شارع التحرير"
            className="sm:col-span-2"
          />
          {/* Governorate */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-primary">
              المحافظة <span className="text-danger">*</span>
            </label>
            <select
              value={form.governorate}
              onChange={(e) => update("governorate", e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">-- اختر المحافظة --</option>
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            {fieldErrors.governorate && (
              <p className="text-xs text-danger">{fieldErrors.governorate}</p>
            )}
          </div>
          {/* City */}
          <Field
            label="المدينة / المركز"
            required
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            error={fieldErrors.city}
            placeholder="مثال: مدينة نصر"
          />
          {/* Password */}
          <Field
            label="كلمة المرور"
            type="password"
            required
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            error={fieldErrors.password}
            placeholder="5 أحرف على الأقل"
            className="sm:col-span-2"
          />

          {error && (
            <div className="sm:col-span-2 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm font-medium text-danger animate-fade-in-slow flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <Button type="submit" variant="vibrant" loading={loading} className="mt-2 w-full sm:col-span-2 text-base shadow-glow-purple bg-violet-500 hover:bg-violet-600 border-violet-500">
            {loading ? "جارٍ التسجيل..." : "تسجيل المستشفى"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary pt-4 border-t border-border/60">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-bold text-primary hover:underline transition-colors">
            سجّل الدخول الآن
          </Link>
        </p>
      </Card>
    </div>
  );
}
