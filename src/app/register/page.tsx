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
import { QuickNav } from "@/components/layout/QuickNav";

import { PatientRegisterForm } from "./PatientRegisterForm";

function RegisterContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const redirect = searchParams.get("redirect");
  const redirectSuffix = redirect ? `&redirect=${encodeURIComponent(redirect)}` : "";

  if (type === "doctor") {
    return <DoctorRegisterForm />;
  }

  if (type === "hospital") {
    return <HospitalRegisterForm />;
  }

  if (type === "patient") {
    return <PatientRegisterForm />;
  }


  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="absolute top-4 sm:top-6 z-20" style={{ insetInlineStart: "1rem" }}>
        <QuickNav className="mb-0" />
      </div>
      <div className="absolute top-4 sm:top-6 z-20" style={{ insetInlineEnd: "1rem" }}>
        <ThemeToggle />
      </div>
      <Card glass vibrant className="w-full max-w-lg animate-scale-in-slow p-5 sm:p-8 border-primary/20 shadow-md">
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

        <div className="mt-8 flex flex-col gap-3.5">
          <Link href={`/register?type=patient${redirectSuffix}`} className="w-full">
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center text-base font-bold shadow-xs hover:shadow-sm"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              إنشاء حساب مريض
            </Button>
          </Link>

          <Link href="/register?type=doctor" className="w-full">
            <Button
              variant="secondary"
              size="lg"
              className="w-full justify-center text-base font-bold shadow-xs hover:shadow-sm"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 3h15" />
                <path d="M6 3v6a6 6 0 0 0 12 0V3" />
                <path d="M12 15v3a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-1" />
                <circle cx="18" cy="18" r="2" />
              </svg>
              إنشاء حساب عيادة طبية (طبيب)
            </Button>
          </Link>

          <Link href="/register?type=hospital" className="w-full">
            <Button
              variant="secondary"
              size="lg"
              className="w-full justify-center text-base font-bold shadow-xs hover:shadow-sm"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                <path d="M12 7v4" />
                <path d="M10 9h4" />
              </svg>
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

