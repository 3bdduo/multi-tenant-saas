"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@/lib/http";
import { validatePassword } from "@/lib/validators";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/ui/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errs: Record<string, string> = {};

    const cleanId = nationalId.trim();
    if (!cleanId) {
      errs.nationalId = "الرقم القومي مطلوب";
    }

    const passErr = validatePassword(password);
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
      const role = await login({ nationalId: nationalId.trim(), password });
      if (role === "Admin") {
        router.push("/admin");
      } else {
        setError("هذا الحساب ليس لديه صلاحية مشرف الإدارة");
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "تعذّر تسجيل دخول المشرف، تحقق من البيانات"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
      <div className="absolute top-6 left-6 z-20">
        <ThemeToggle />
      </div>
      <Card glass vibrant className="w-full max-w-md animate-scale-in-slow p-8 border-accent/30 shadow-2xl shadow-accent/10">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <Logo size="lg" href={null} />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold text-accent mb-2">
            <span>بوابة الإدارة والمشرفين</span>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">
            تسجيل دخول المشرف
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            أدخل الرقم القومي وكلمة المرور للوصول إلى لوحة التحكم الإدارية
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
          <Field
            label="الرقم القومي (National ID)"
            type="text"
            required
            value={nationalId}
            onChange={(e) => {
              setNationalId(e.target.value);
              if (fieldErrors.nationalId) setFieldErrors((prev) => ({ ...prev, nationalId: "" }));
            }}
            error={fieldErrors.nationalId}
            placeholder="مثال: 29801011234567"
            dir="ltr"
            className="text-right"
          />
          <Field
            label="كلمة المرور (Password)"
            type="password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
            }}
            error={fieldErrors.password}
            placeholder="******"
          />

          {error && (
            <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm font-medium text-danger animate-fade-in-slow flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <Button type="submit" variant="vibrant" loading={loading} className="mt-2 w-full shadow-glow-cyan text-base">
            {loading ? "جارٍ تسجيل الدخول..." : "دخول المشرف إلى النظام"}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm pt-4 border-t border-border/60">
          <Link href="/login" className="font-medium text-primary hover:underline transition-colors">
            دخول الأطباء والمرضى 
          </Link>
          <Link href="/" className="font-medium text-text-secondary hover:text-primary transition-colors">
            الصفحة الرئيسية 
          </Link>
        </div>
      </Card>
    </div>
  );
}
