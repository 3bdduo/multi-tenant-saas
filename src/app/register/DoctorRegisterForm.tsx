"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerDoctor } from "@/lib/api/auth";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@/lib/http";
import {
  validateEgyptianNationalId,
  validateEgyptianPhone,
  validateName,
  validateEmail,
  validatePassword,
} from "@/lib/validators";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/ui/Logo";

export function DoctorRegisterForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    nationalId: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};

    const fnErr = validateName(form.firstName, "الاسم الأول");
    if (fnErr) errs.firstName = fnErr;

    const lnErr = validateName(form.lastName, "اسم العائلة");
    if (lnErr) errs.lastName = lnErr;

    const nidErr = validateEgyptianNationalId(form.nationalId);
    if (nidErr) errs.nationalId = nidErr;

    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;

    const phoneErr = validateEgyptianPhone(form.phoneNumber);
    if (phoneErr) errs.phoneNumber = phoneErr;

    const passErr = validatePassword(form.password);
    if (passErr) errs.password = passErr;

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await registerDoctor(form);
      
      const role = await login({ nationalId: form.nationalId, password: form.password });
      if (role === "Doctor") {
        router.push("/doctor");
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "تعذّر إنشاء الحساب، حاول مرة أخرى"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <ThemeToggle />
      </div>
      <Card glass vibrant className="w-full max-w-lg animate-scale-in-slow p-5 sm:p-8 border-primary/20 shadow-md">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <Logo size="lg" href={null} />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">
            تسجيل عيادة جديدة
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            حساب الطبيب هو الحساب الرئيسي لإدارة العيادة وإضافة الطاقم والمواعيد
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
          <Field
            label="الاسم الأول"
            required
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            error={fieldErrors.firstName}
            placeholder="مثال: أحمد"
          />
          <Field
            label="اسم العائلة"
            required
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            error={fieldErrors.lastName}
            placeholder="مثال: محمود"
          />
          <Field
            label="الرقم القومي (14 رقمًا)"
            required
            inputMode="numeric"
            value={form.nationalId}
            onChange={(e) => update("nationalId", e.target.value)}
            error={fieldErrors.nationalId}
            placeholder="مثال: 00000000000000"
            className="sm:col-span-2"
          />
          <Field
            label="البريد الإلكتروني"
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            error={fieldErrors.email}
            placeholder="example@domain.com"
            className="sm:col-span-2"
          />
          <Field
            label="رقم الهاتف المصري"
            required
            inputMode="tel"
            value={form.phoneNumber}
            onChange={(e) => update("phoneNumber", e.target.value)}
            error={fieldErrors.phoneNumber}
            placeholder="مثال: 01000000000"
          />
          <Field
            label="كلمة المرور"
            type="password"
            required
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            error={fieldErrors.password}
            placeholder="******"
          />

          {error && (
            <div className="sm:col-span-2 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm font-medium text-danger animate-fade-in-slow flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" loading={loading} className="mt-2 w-full sm:col-span-2 shadow-xs hover:shadow-sm text-base">
            {loading ? "جارٍ الإنشاء..." : "إنشاء حساب العيادة"}
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
