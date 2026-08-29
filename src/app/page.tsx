import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/ui/Logo";
import { PatientInfoButton } from "./PatientInfoButton";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-500 ease-silky">
      {/* Subtle Radial Gradient Depth behind Hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[560px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(184,125,101,0.08),transparent_75%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(71,85,105,0.20),transparent_75%)] -z-10"
      />

      {/* Navigation Header */}
      <header
        className="sticky top-0 z-40 px-6 py-4 backdrop-blur-xl transition-all duration-350 md:px-12"
        style={{
          background: "var(--color-header-bg)",
          borderBottom: "1px solid var(--color-header-border)",
        }}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Logo size="md" />

          <div className="flex items-center gap-3">
            <Link href="/clinics">
              <Button variant="vibrant" size="sm" className="font-bold shadow-glow-cyan text-xs sm:text-sm">
                تصفح العيادات واحجز كشفك 
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1400px] px-6 py-10 md:px-12 md:py-16">
        {/* Intro Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 animate-fade-in-slow">
          <h1 className="font-brush text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.35] tracking-normal text-text-primary">
            مرحباً بك في منصة <span className="gradient-text-alive font-brush">نبض | Nabd</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-secondary md:text-lg">
            منصة سحابية متكاملة لربط المرضى، العيادات، والمستشفيات. اختر وجهتك للبدء أو احجز كشفك مباشرةً.
          </p>

          {/* Quick CTA banner */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-primary/10 border border-primary/30 p-2 sm:px-4 sm:py-2.5">
            <span className="text-xs sm:text-sm font-bold text-text-primary">
              تريد حجز موعد كشف عند طبيب الآن؟
            </span>
            <Link href="/clinics">
              <span className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-black text-surface shadow-glow-cyan hover:opacity-90 transition-all">
                استعراض العيادات والمواعيد المتاحة
              </span>
            </Link>
          </div>
        </div>

        {/* 4 PORTAL CARDS */}
        <div className="grid gap-8 sm:grid-cols-2 animate-scale-in-slow max-w-5xl mx-auto">

          {/* 1. EMERGENCY PORTAL CARD */}
          <Card
            hover
            glass
            className="group relative flex flex-col justify-between p-8 md:p-9 min-h-[490px] rounded-3xl border-border/80 hover:border-destructive/50 transition-all duration-300 hover:scale-[1.02] text-center shadow-[0_8px_30px_-4px_rgba(184,125,101,0.06),0_2px_8px_-2px_rgba(45,35,31,0.03)] dark:shadow-[0_14px_40px_-6px_rgba(0,0,0,0.70),0_0_0_1px_rgba(255,255,255,0.08)]"
          >
            <div className="flex flex-col items-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive shadow-[0_4px_20px_rgba(200,75,49,0.15)] dark:shadow-[0_0_25px_rgba(230,57,70,0.30)] backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_25px_rgba(200,75,49,0.25)]">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>

              <h2 className="font-display text-2xl font-extrabold text-text-primary mb-3">
                الطوارئ والبلاغات
              </h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                أرسل تقرير حالة طارئة عاجل للمستشفيات، أو تابع حالة بلاغ أرسلته مسبقاً بكود التتبع.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 w-full">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-2" />
              <Link href="/emergency-report" className="w-full">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center text-sm font-bold"
                >
                   إرسال تقرير طوارئ
                </Button>
              </Link>
              <Link href="/emergency-track" className="w-full">
                <Button variant="secondary" size="lg" className="w-full justify-center text-sm font-semibold">
                   متابعة حالة بلاغ
                </Button>
              </Link>
            </div>
          </Card>

          {/* 2. PATIENTS PORTAL CARD */}
          <Card
            hover
            glass
            className="group relative flex flex-col justify-between p-8 md:p-9 min-h-[490px] rounded-3xl border-border/80 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] text-center shadow-[0_8px_30px_-4px_rgba(184,125,101,0.06),0_2px_8px_-2px_rgba(45,35,31,0.03)] dark:shadow-[0_14px_40px_-6px_rgba(0,0,0,0.70),0_0_0_1px_rgba(255,255,255,0.08)]"
          >
            <div className="flex flex-col items-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-[0_4px_20px_rgba(184,125,101,0.15)] dark:shadow-[0_0_25px_rgba(186,38,84,0.30)] dark:border-primary/30 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_25px_rgba(184,125,101,0.25)]">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>

              <h2 className="font-display text-2xl font-extrabold text-text-primary mb-3">
                المرضى والحجوزات
              </h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                تصفح العيادات المتاحة واحجز كشفك أونلاين، أو ادخل لحسابك لمتابعة مواعيدك وسجلاتك الطبية.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 w-full">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-2" />
              <Link href="/clinics" className="w-full">
                <Button variant="vibrant" size="lg" className="w-full justify-center text-sm font-bold shadow-glow-cyan">
                   تصفح العيادات وحجز كشف أونلاين
                </Button>
              </Link>
              <Link href="/login" className="w-full">
                <Button variant="secondary" size="lg" className="w-full justify-center text-sm font-semibold">
                  تسجيل الدخول لمتابعة مواعيدي
                </Button>
              </Link>
              <PatientInfoButton />
            </div>
          </Card>

          {/* 3. DOCTORS PORTAL CARD */}
          <Card
            hover
            glass
            className="group relative flex flex-col justify-between p-8 md:p-9 min-h-[490px] rounded-3xl border-border/80 hover:border-accent/50 transition-all duration-300 hover:scale-[1.02] text-center shadow-[0_8px_30px_-4px_rgba(184,125,101,0.06),0_2px_8px_-2px_rgba(45,35,31,0.03)] dark:shadow-[0_14px_40px_-6px_rgba(0,0,0,0.70),0_0_0_1px_rgba(255,255,255,0.08)]"
          >
            <div className="flex flex-col items-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/15 border border-accent/25 text-primary-hover dark:text-[#F1F4F8] shadow-[0_4px_20px_rgba(184,125,101,0.15)] dark:shadow-[0_0_25px_rgba(100,150,220,0.25)] dark:border-border/40 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_25px_rgba(184,125,101,0.25)]">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 3h15" />
                  <path d="M6 3v6a6 6 0 0 0 12 0V3" />
                  <path d="M12 15v3a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-1" />
                  <circle cx="18" cy="18" r="2" />
                </svg>
              </div>

              <h2 className="font-display text-2xl font-extrabold text-text-primary mb-3">
                الأطباء والعيادات
              </h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                منظومة شاملة لإدارة عيادتك، الكشوفات، سجلات المرضى، وجدول المواعيد بدقة.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 w-full">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-2" />
              <Link href="/login" className="w-full">
                <Button variant="primary" size="lg" className="w-full justify-center text-sm font-bold">
                  تسجيل الدخول كطبيب
                </Button>
              </Link>
              <Link href="/register?type=doctor" className="w-full">
                <Button variant="secondary" size="lg" className="w-full justify-center text-sm font-semibold">
                  إنشاء حساب عيادة جديدة
                </Button>
              </Link>
            </div>
          </Card>

          {/* 4. HOSPITALS PORTAL CARD */}
          <Card
            hover
            glass
            className="group relative flex flex-col justify-between p-8 md:p-9 min-h-[490px] rounded-3xl border-border/80 hover:border-secondary/50 transition-all duration-300 hover:scale-[1.02] text-center shadow-[0_8px_30px_-4px_rgba(184,125,101,0.06),0_2px_8px_-2px_rgba(45,35,31,0.03)] dark:shadow-[0_14px_40px_-6px_rgba(0,0,0,0.70),0_0_0_1px_rgba(255,255,255,0.08)]"
          >
            <div className="flex flex-col items-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary shadow-[0_4px_20px_rgba(150,154,131,0.15)] dark:shadow-[0_0_25px_rgba(100,150,220,0.25)] dark:border-border/40 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_25px_rgba(150,154,131,0.25)]">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" />
                  <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                  <path d="M12 7v4" />
                  <path d="M10 9h4" />
                  <path d="M9 17v4" />
                  <path d="M15 17v4" />
                </svg>
              </div>

              <h2 className="font-display text-2xl font-extrabold text-text-primary mb-3">
                المستشفيات والطوارئ
              </h2>
              <p className="text-sm leading-relaxed text-text-secondary">
                استقبال بلاغات وحالات الطوارئ المحولة فورياً، وتنسيق الأقسام والطاقة الاستيعابية.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 w-full">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-2" />
              <Link href="/login" className="w-full">
                <Button variant="primary" size="lg" className="w-full justify-center text-sm font-bold">
                  دخول لوحة المستشفى
                </Button>
              </Link>
              <Link href="/register?type=hospital" className="w-full">
                <Button variant="secondary" size="lg" className="w-full justify-center text-sm font-semibold">
                  تسجيل مستشفى جديد
                </Button>
              </Link>
            </div>
          </Card>

        </div>
      </main>
    </div>
  );
}
