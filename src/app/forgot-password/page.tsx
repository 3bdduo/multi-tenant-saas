"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtp, resetPassword } from "@/lib/api/auth";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/ui/Logo";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendOtp({ email });
      setStep("reset");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر إرسال الرمز");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword });
      router.push("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر تغيير كلمة المرور");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
      <div className="absolute top-6 left-6 z-20">
        <ThemeToggle />
      </div>
      <Card glass vibrant className="w-full max-w-md animate-scale-in-slow p-8 border-primary/20 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-4">
            <Logo size="lg" href={null} />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">
            استعادة كلمة المرور
          </h1>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <Field
              label="البريد الإلكتروني"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
            />
            {error && (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
            )}
            <Button type="submit" variant="primary" disabled={loading} className="w-full shadow-sm">
              {loading ? "جارٍ الإرسال..." : "إرسال رمز التحقق"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <Field
              label="رمز التحقق (OTP)"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="أدخل الرمز المكون من 6 أرقام"
            />
            <Field
              label="كلمة المرور الجديدة"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="******"
            />
            {error && (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
            )}
            <Button type="submit" variant="primary" disabled={loading} className="w-full shadow-sm">
              {loading ? "جارٍ الحفظ..." : "تغيير كلمة المرور"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
