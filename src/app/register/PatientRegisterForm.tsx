"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerPatient } from "@/lib/api/auth";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/ui/Logo";
import { ApiError } from "@/lib/http";
import { validateFourWordsName } from "@/lib/validators";

function PatientRegisterFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const [form, setForm] = useState({
    nationalId: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameErr = validateFourWordsName(form.fullName, "الاسم بالكامل");
    if (nameErr) {
      setError(nameErr);
      return;
    }

    setLoading(true);

    try {
      await registerPatient(form);
      const loginTarget = redirectUrl
        ? `/login?registered=true&redirect=${encodeURIComponent(redirectUrl)}`
        : "/login?registered=true";
      router.push(loginTarget);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("حدث خطأ أثناء إنشاء الحساب");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <ThemeToggle />
      </div>

      <Card glass vibrant className="w-full max-w-xl animate-scale-in-slow p-5 sm:p-8 border-primary/20 shadow-md">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <Logo size="lg" href={null} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">
            إنشاء حساب مريض
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            أدخل بياناتك لإنشاء حسابك الشخصي
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-destructive/10 border border-destructive/20 p-3 sm:p-4 text-center text-sm font-bold text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 sm:gap-5">
          <Field
            label="الاسم بالكامل (رباعي على الأقل)"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="مثال: محمد أحمد محمود علي"
          />

          <Field
            label="الرقم القومي"
            required
            maxLength={14}
            value={form.nationalId}
            onChange={(e) => setForm({ ...form, nationalId: e.target.value.replace(/\D/g, "") })}
            placeholder="14 رقماً"
            dir="ltr"
          />

          <Field
            label="رقم الهاتف"
            type="tel"
            required
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            placeholder="01xxxxxxxxx"
            dir="ltr"
          />

          <Field
            label="البريد الإلكتروني"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="example@mail.com"
            dir="ltr"
          />

          <Field
            label="كلمة المرور"
            type="password"
            required
            minLength={5}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            dir="ltr"
          />

          <Button type="submit" variant="primary" size="lg" className="mt-2 w-full font-bold shadow-xs hover:shadow-sm" loading={loading}>
            إنشاء الحساب
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary pt-4 border-t border-border/60">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-bold text-primary hover:underline transition-colors">
            سجّل الدخول
          </Link>
        </p>
      </Card>
    </div>
  );
}

export function PatientRegisterForm() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" /></div>}>
      <PatientRegisterFormInner />
    </Suspense>
  );
}
