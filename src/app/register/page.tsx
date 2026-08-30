"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DoctorRegisterForm } from "./DoctorRegisterForm";
import { HospitalRegisterForm } from "./HospitalRegisterForm";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

function RegisterContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  if (type === "doctor") {
    return <DoctorRegisterForm />;
  }

  if (type === "hospital") {
    return <HospitalRegisterForm />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <ThemeToggle />
      </div>
      <Card glass vibrant className="w-full max-w-lg animate-scale-in-slow p-5 sm:p-8 border-primary/20 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <Logo size="lg" href={null} />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">
            إنشاء حساب جديد
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            اختر نوع الحساب الذي ترغب في إنشائه
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <Link href="/register?type=doctor" className="w-full">
            <Button variant="vibrant" size="lg" className="w-full justify-center text-base font-bold shadow-glow-cyan">
              إنشاء حساب عيادة طبية (طبيب)
            </Button>
          </Link>
          <Link href="/register?type=hospital" className="w-full">
            <Button variant="secondary" size="lg" className="w-full justify-center text-base font-semibold shadow-glow-purple bg-violet-500 hover:bg-violet-600 border-violet-500">
              إنشاء حساب مستشفى
            </Button>
          </Link>
        </div>

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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}

