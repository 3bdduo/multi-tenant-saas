import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/ui/Logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-500 ease-silky">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[560px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(var(--color-primary-rgb),0.16),transparent_75%)] -z-10"
      />

      {/* Navigation Header */}
      <header
        className="sticky top-0 z-40 px-4 py-3 sm:px-6 sm:py-4 backdrop-blur-xl transition-all duration-350 md:px-12"
        style={{
          background: "var(--color-header-bg)",
          borderBottom: "1px solid var(--color-header-border)",
        }}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Logo size="md" />

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10 md:px-12 md:py-10">
        {/* Intro Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-10 animate-fade-in-slow">
          <h1 className="font-brush text-3xl sm:text-5xl md:text-6xl font-bold leading-[2.1] tracking-normal text-text-primary dark:text-glow py-2 overflow-visible">
            مرحباً بك في منصة{" "}
            <span
              className="gradient-text-alive font-brush inline-block px-2 py-1"
              style={{ lineHeight: "1.9", overflow: "visible" }}
            >
              نبض | Nabd
            </span>
          </h1>
          <p className="mt-6 text-sm sm:text-base md:text-lg leading-loose font-medium tracking-wide text-text-primary/80 dark:text-text-primary/90 dark:[text-shadow:0_0_18px_rgba(var(--color-primary-rgb),0.25)] max-w-2xl mx-auto">
            منصة سحابية متكاملة لربط المرضى، العيادات، والمستشفيات. اختر وجهتك للبدء أو احجز كشفك مباشرةً.
          </p>

          {/* Quick CTA Banner */}
          <div className="hidden sm:inline-flex mt-6 flex-wrap items-center justify-center gap-3.5 rounded-2xl bg-surface/90 dark:bg-surface/80 border border-primary/25 p-2.5 sm:px-5 sm:py-3 shadow-md backdrop-blur-md">
            <span className="text-sm font-bold text-text-primary">
              تريد حجز موعد كشف عند طبيب الآن؟
            </span>
            <Link href="/clinics">
              <Button variant="primary" size="md">
                استعراض العيادات والمواعيد المتاحة
              </Button>
            </Link>
          </div>
        </div>

        {/* Portals Grid */}
        <div className="grid gap-4 sm:gap-8 sm:grid-cols-2 max-w-5xl mx-auto">
          {/* 1. Emergency & Cases Card (Danger / warm red) */}
          <Card
            glass
            className="group relative flex flex-col justify-between p-5 sm:p-8 md:p-9 min-h-[360px] sm:min-h-[490px] rounded-2xl sm:rounded-3xl !border-danger/30 hover:!border-danger/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-22px_rgba(var(--color-danger-rgb),0.5)] text-center shadow-sm"
          >
            <div className="flex flex-col items-center">
              <div className="pulse-ring-host rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                <span className="pulse-ring text-danger" />
                <span className="pulse-ring text-danger" style={{ animationDelay: "1.3s" }} />
                <div className="animate-heartbeat flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-xl sm:rounded-2xl bg-danger/15 border border-danger/30 text-danger shadow-xs backdrop-blur-md transition-all duration-300 group-hover:scale-105">
                  <svg width="28" height="28" className="sm:w-[38px] sm:h-[38px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
              </div>

              <div className="mb-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-danger/10 text-danger border border-danger/20">
                استجابة فورية 24/7
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary mb-2 sm:mb-3">
                الطوارئ والبلاغات
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-text-secondary">
                أرسل تقرير حالة طارئة عاجل للمستشفيات، أو تابع حالة بلاغ أرسلته مسبقاً بكود التتبع.
              </p>
            </div>

            <div className="mt-5 sm:mt-8 flex flex-col gap-2 sm:gap-3 w-full">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-danger/30 to-transparent mb-1 sm:mb-2" />
              <Link href="/emergency-report" className="w-full">
                <Button
                  variant="danger"
                  size="lg"
                  className="w-full justify-center text-sm font-bold"
                >
                  إرسال تقرير طوارئ
                </Button>
              </Link>
              <Link href="/emergency-track" className="w-full">
                <Button variant="secondary" size="lg" className="w-full justify-center text-sm font-semibold">
                  متابعة حالة طوارئ
                </Button>
              </Link>
            </div>
          </Card>

          {/* 2. Patients & Bookings Card (Teal / primary) */}
          <Card
            glass
            className="group relative flex flex-col justify-between p-5 sm:p-8 md:p-9 min-h-[360px] sm:min-h-[490px] rounded-2xl sm:rounded-3xl !border-primary/30 hover:!border-primary/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-22px_rgba(var(--color-primary-rgb),0.5)] text-center shadow-sm"
          >
            <div className="flex flex-col items-center">
              <div className="pulse-ring-host rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                <span className="pulse-ring text-primary" />
                <span className="pulse-ring text-primary" style={{ animationDelay: "1.3s" }} />
                <div className="animate-heartbeat flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/15 border border-primary/30 text-primary shadow-xs backdrop-blur-md transition-all duration-300 group-hover:scale-105">
                  <svg width="28" height="28" className="sm:w-[38px] sm:h-[38px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
              </div>

              <div className="mb-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-primary/10 text-primary border border-primary/20">
                حجز فوري ومتابعة طبية
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary mb-2 sm:mb-3">
                المرضى والحجوزات
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-text-secondary">
                تصفح العيادات المتاحة واحجز كشفك أونلاين، أو ادخل لحسابك لمتابعة مواعيدك وسجلاتك الطبية.
              </p>
            </div>

            <div className="mt-5 sm:mt-8 flex flex-col gap-2 sm:gap-3 w-full">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-1 sm:mb-2" />
              <Link href="/clinics" className="w-full">
                <Button variant="primary" size="lg" className="w-full justify-center text-sm font-bold">
                  احجز كشف اونلاين
                </Button>
              </Link>
              <Link href="/login" className="w-full">
                <Button variant="secondary" size="lg" className="w-full justify-center text-sm font-semibold">
                  بوابة تسجيل دخول المرضى
                </Button>
              </Link>
              <Link href="/register?type=patient" className="w-full">
                <Button variant="secondary" size="lg" className="w-full justify-center text-sm font-semibold">
                  إنشاء حساب مريض جديد
                </Button>
              </Link>
            </div>
          </Card>

          {/* 3. Doctors & Clinics Card (Orange / accent) */}
          <Card
            glass
            className="group relative flex flex-col justify-between p-5 sm:p-8 md:p-9 min-h-[360px] sm:min-h-[490px] rounded-2xl sm:rounded-3xl !border-accent/30 hover:!border-accent/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-22px_rgba(var(--color-accent-rgb),0.5)] text-center shadow-sm"
          >
            <div className="flex flex-col items-center">
              <div className="pulse-ring-host rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                <span className="pulse-ring text-accent" />
                <span className="pulse-ring text-accent" style={{ animationDelay: "1.3s" }} />
                <div className="animate-heartbeat flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-xl sm:rounded-2xl bg-accent/15 border border-accent/30 text-accent shadow-xs backdrop-blur-md transition-all duration-300 group-hover:scale-105">
                  <svg width="28" height="28" className="sm:w-[38px] sm:h-[38px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 3h15" />
                    <path d="M6 3v6a6 6 0 0 0 12 0V3" />
                    <path d="M12 15v3a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-1" />
                    <circle cx="18" cy="18" r="2" />
                  </svg>
                </div>
              </div>

              <div className="mb-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-accent/10 text-accent border border-accent/20">
                إدارة العيادة والكشوفات
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary mb-2 sm:mb-3">
                الأطباء والعيادات
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-text-secondary">
                منظومة شاملة لإدارة عيادتك، الكشوفات، سجلات المرضى، وجدول المواعيد بدقة.
              </p>
            </div>

            <div className="mt-5 sm:mt-8 flex flex-col gap-2 sm:gap-3 w-full">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent mb-1 sm:mb-2" />
              <Link href="/login" className="w-full">
                <Button variant="vibrant" size="lg" className="w-full justify-center text-sm font-bold">
                  تسجيل الدخول كطبيب
                </Button>
              </Link>
              <Link href="/register?type=doctor" className="w-full">
                <Button variant="secondary" size="lg" className="w-full justify-center text-sm font-semibold">
                  إنشاء حساب طبيب جديد
                </Button>
              </Link>
            </div>
          </Card>

          {/* 4. Hospitals & Facilities Card (Steel blue / secondary) */}
          <Card
            glass
            className="group relative flex flex-col justify-between p-5 sm:p-8 md:p-9 min-h-[360px] sm:min-h-[490px] rounded-2xl sm:rounded-3xl !border-secondary/30 hover:!border-secondary/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-22px_rgba(var(--color-secondary-rgb),0.5)] text-center shadow-sm"
          >
            <div className="flex flex-col items-center">
              <div className="pulse-ring-host rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                <span className="pulse-ring text-secondary" />
                <span className="pulse-ring text-secondary" style={{ animationDelay: "1.3s" }} />
                <div className="animate-heartbeat flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-xl sm:rounded-2xl bg-secondary/15 border border-secondary/30 text-secondary shadow-xs backdrop-blur-md transition-all duration-300 group-hover:scale-105">
                  <svg width="28" height="28" className="sm:w-[38px] sm:h-[38px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18" />
                    <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                    <path d="M12 7v4" />
                    <path d="M10 9h4" />
                    <path d="M9 17v4" />
                    <path d="M15 17v4" />
                  </svg>
                </div>
              </div>

              <div className="mb-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-secondary/10 text-secondary border border-secondary/20">
                منظومة المستشفيات المركزية
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary mb-2 sm:mb-3">
                المستشفيات والطوارئ
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-text-secondary">
                استقبال بلاغات وحالات الطوارئ المحولة فورياً، وتنسيق الأقسام والطاقة الاستيعابية.
              </p>
            </div>

            <div className="mt-5 sm:mt-8 flex flex-col gap-2 sm:gap-3 w-full">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent mb-1 sm:mb-2" />
              <Link href="/login" className="w-full">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center text-sm font-bold"
                >
                  بوابة دخول المستشفى
                </Button>
              </Link>
              <Link href="/register?type=hospital" className="w-full">
                <Button variant="secondary" size="lg" className="w-full justify-center text-sm font-semibold">
                  تسجيل مستشفى جديدة
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}