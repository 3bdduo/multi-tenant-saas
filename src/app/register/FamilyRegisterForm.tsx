"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerFamilyPatient } from "@/lib/api/auth";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/ui/Logo";
import { ApiError } from "@/lib/http";

function FamilyRegisterFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const [form, setForm] = useState({
    nationalId: "",
    password: "",
    email: "",
    familyMembers: [{ name: "", phoneNumber: "" }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMember = () => {
    setForm({
      ...form,
      familyMembers: [...form.familyMembers, { name: "", phoneNumber: "" }],
    });
  };

  const removeMember = (index: number) => {
    const newMembers = [...form.familyMembers];
    newMembers.splice(index, 1);
    setForm({ ...form, familyMembers: newMembers });
  };

  const updateMember = (index: number, field: "name" | "phoneNumber", value: string) => {
    const newMembers = [...form.familyMembers];
    newMembers[index][field] = value;
    setForm({ ...form, familyMembers: newMembers });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerFamilyPatient(form);
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

      <Card glass vibrant className="w-full max-w-xl animate-scale-in-slow p-5 sm:p-8 border-primary/20 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <Logo size="lg" href={null} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">
            إنشاء حساب عائلي
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            تسجيل أسرة برقم قومي واحد لرب الأسرة
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-destructive/10 border border-destructive/20 p-3 sm:p-4 text-center text-sm font-bold text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 sm:gap-5">
          <Field
            label="الرقم القومي لرب الأسرة (14 رقم)"
            required
            pattern="[0-9]{14}"
            title="يجب إدخال 14 رقماً"
            value={form.nationalId}
            onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
            placeholder="مثال: 29001011234567"
          />

          <Field
            label="البريد الإلكتروني للأسرة"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="family@mail.com"
            dir="ltr"
          />

          <Field
            label="كلمة المرور للحساب"
            type="password"
            required
            minLength={5}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            dir="ltr"
          />

          <div className="mt-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-text-primary text-sm sm:text-base">أفراد الأسرة</h3>
              <Button type="button" variant="secondary" size="sm" onClick={addMember} className="h-8 rounded-lg px-3">
                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                إضافة فرد
              </Button>
            </div>
            
            {form.familyMembers.map((member, index) => (
              <div key={index} className="rounded-xl border border-border/80 bg-surface-raised p-3 sm:p-4 relative flex flex-col gap-3">
                {form.familyMembers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="absolute top-2 left-2 p-1.5 text-text-secondary hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                )}
                
                <h4 className="text-xs font-bold text-text-secondary">الفرد رقم {index + 1}</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field
                    label="الاسم بالكامل"
                    required
                    value={member.name}
                    onChange={(e) => updateMember(index, "name", e.target.value)}
                    placeholder="مثال: أحمد محمد"
                  />
                  <Field
                    label="رقم الهاتف"
                    required
                    pattern="^01[0125][0-9]{8}$"
                    title="رقم هاتف مصري صحيح (مثال: 01012345678)"
                    value={member.phoneNumber}
                    onChange={(e) => updateMember(index, "phoneNumber", e.target.value)}
                    placeholder="مثال: 01012345678"
                    type="tel"
                    dir="ltr"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" variant="vibrant" size="lg" className="mt-4 w-full font-bold shadow-glow-cyan" loading={loading}>
            إنشاء حساب الأسرة
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

export function FamilyRegisterForm() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" /></div>}>
      <FamilyRegisterFormInner />
    </Suspense>
  );
}
