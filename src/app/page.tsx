"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo, NabdLogoIcon } from "@/components/ui/Logo";

/* ─────────────────────────────────────────────────────────────────────────────
   Medical Specialties Data (Top demanded clinical specialties)
───────────────────────────────────────────────────────────────────────────── */
const SPECIALTIES = [
  {
    id: "internal",
    title: "باطنة وجهاز هضمي",
    desc: "تشخيص وعلاج الأمراض الباطنية والمزمنة ومتابعة السكري والضغط",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
        <path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9Z" />
        <path d="M12 7v10" />
      </svg>
    ),
    badge: "الأكثر طلباً",
    color: "primary",
  },
  {
    id: "pediatrics",
    title: "طب الأطفال وحديثي الولادة",
    desc: "رعاية شاملة لصحة الطفل، جداول التطعيمات، ومتابعة النمو البدني",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="5" />
        <path d="M20 21a8 8 0 1 0-16 0" />
        <path d="M10 8h4" />
      </svg>
    ),
    badge: "رعاية وقائية",
    color: "accent",
  },
  {
    id: "cardiology",
    title: "أمراض القلب والأوعية",
    desc: "فحوصات تخطيط القلب، قياس الإجهاد، ومتابعة صحة الشرايين وضغط الدم",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
    badge: "استشاريون معتمدون",
    color: "danger",
  },
  {
    id: "orthopedics",
    title: "جراحة العظام والمفاصل",
    desc: "علاج آلام المفاصل والعمود الفقري وإصابات الملاعب والكسور والتأهيل",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    badge: "متاح الآن",
    color: "secondary",
  },
  {
    id: "ophthalmology",
    title: "طب وجراحة العيون",
    desc: "فحص قاع العين، قياس النظر، تصحيح الإبصار بالليزر، وعلاج المياه البيضاء",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    badge: "أحدث التقنيات",
    color: "primary",
  },
  {
    id: "dentistry",
    title: "طب وجراحة الأسنان",
    desc: "علاج الجذور، زراعة الأسنان، تقويم الفكين، وجلسات التنظيف والتبييض",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3c-4.4 0-8 3.6-8 8 0 4.1 3.5 7.1 5 10 1 .5 2 .5 3 0 1.5-2.9 5-5.9 5-10 0-4.4-3.6-8-8-8z" />
        <path d="M9 10h6" />
      </svg>
    ),
    badge: "عناية متكاملة",
    color: "accent",
  },
  {
    id: "neurology",
    title: "المخ والأعصاب",
    desc: "تشخيص وعلاج الصداع المزمن، اضطرابات النوم، والاعتلال العصبي الحركي",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04Z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04Z" />
      </svg>
    ),
    badge: "فحوصات دقيقة",
    color: "secondary",
  },
  {
    id: "obgyn",
    title: "النساء والولادة",
    desc: "متابعة دورية للحمل، رعاية ما قبل الولادة، وفحوصات السونار رباعي الأبعاد",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M12 17v4" />
        <path d="M10 19h4" />
      </svg>
    ),
    badge: "رعاية مستمرة",
    color: "accent",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Clinical Core Capabilities / Ecosystem Features
───────────────────────────────────────────────────────────────────────────── */
const CLINICAL_FEATURES = [
  {
    title: "السجل الطبي الموحد (Unified EMR)",
    desc: "ملف صحي رقمي ذكي مشفر يرافق المريض في كافة المنشآت الطبية، مسجلاً الفحوصات والتشخيصات والحساسية الدوائية لضمان سلامة العلاج.",
    badge: "معايير HIPAA",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M12 18v-6" />
        <path d="M9 15h6" />
      </svg>
    ),
  },
  {
    title: "إدارة الانتظار والكشف الذكي (Smart Queue)",
    desc: "نظام جدولة لحظي للمواعيد مع مؤشرات انتظار ديناميكية، تحديثات دور الكشف، وإشعار المريض قبل موعده لتقليص زمن الانتظار بنسبة 60%.",
    badge: "تحديث لحظي",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "الروشتة والتقارير الرقمية المعتمدة (E-Prescriptions)",
    desc: "إصدار وصفات دوائية واضحة مشفرة برمز QR تمنع الأخطاء الدوائية وتسهل صرف العلاج مع أرشيف فوري لكل الاستشارات السابقة.",
    badge: "موثقة برمز QR",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "منظومة الطوارئ والفرز الطبي (Tele-Triage)",
    desc: "بروتوكول تصنيف طبي عاجل لحالات الحوادث والإسعاف مع رمز تتبع لحظي وإشعار استباقي للمستشفى المستقبِل لتجهيز غرفة الطوارئ.",
    badge: "استجابة < 3 دقائق",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: "تنسيق العمليات الجراحية والاستشارات",
    desc: "حجز غرف العمليات، متابعة الأسرة المتاحة، وجدولة الفرق الطبية المشتركة بين العيادات الخارجية وأقسام المستشفيات المركزية.",
    badge: "ربط متكامل",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3l7 7M21 3l-7 7M7 10l-4 4a2 2 0 0 0 0 3l1 1a2 2 0 0 0 3 0l4-4M17 10l4 4a2 2 0 0 1 0 3l-1 1a2 2 0 0 1-3 0l-4-4" />
        <circle cx="12" cy="12" r="1.3" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "حماية الخصوصية وتشفير البيانات الطبية",
    desc: "تشفير سحابي 256-bit وصلاحيات وصول دقيقة حسب الدور الطبي، تضمن سرية المعلومات الصحية للمريض وفق أعلى الممارسات العالمية.",
    badge: "تشفير بنكي 256-bit",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Medical FAQs Data
───────────────────────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "كيف يمكنني حجز موعد كشف في إحدى العيادات المتاحة؟",
    a: "يمكنك التوجه مباشرة لصفحة 'تصفح العيادات'، واختيار التخصص المطلوب والطبيب المناسب، ثم تحديد التاريخ والوقت المتاحين وتأكيد الحجز فورياً سواء كنت زائراً أو تملك حساب مريض لمتابعة الكشف.",
  },
  {
    q: "هل بياناتي وسجلاتي الطبية مشفرة ومحمية؟",
    a: "نعم، كافة السجلات الطبية والروشتات والفحوصات في منصة نبض مشفرة طبقاً لأعلى معايير الأمان الصحي (HIPAA Ready) بتشفير 256-bit، ولا يمكن لأي طرف الاطلاع عليها إلا بإذن الطبيب المعالج أو المريض نفسه.",
  },
  {
    q: "كيف تعمل خدمة متابعة الطوارئ (Emergency Tracking)؟",
    a: "عند تقديم بلاغ طوارئ جديد عبر المنصة، يتم إنشاء كود تتبع فريد (Tracking Code). يتيح هذا الرمز للمريض وذويه متابعة حالة البلاغ لحظياً ومعرفة المستشفى المستقبِل وزمن وصول الإسعاف واستعداد الطاقم الطبي.",
  },
  {
    q: "كيف يمكن لطبيب أو عيادة أو مستشفى الانضمام لمنصة نبض؟",
    a: "يمكن التسجيل بسهولة عبر اختيار بوابة التسجيل المناسبة (تسجيل طبيب / تسجيل مستشفى)، وتعبئة بيانات الترخيص والتخصصات. بعد المراجعة السريعة يتم تفعيل لوحة التحكم لجدولة المواعيد واستقبال المرضى فورياً.",
  },
  {
    q: "هل يمكنني إلغاء أو تعديل موعد الكشف بعد تأكيده؟",
    a: "بالتأكيد، من خلال بوابة المريض يمكنك استعراض قائمة حجوزاتك، تعديل الوقت المتاح، أو الإلغاء بكل سهولة مع إشعار العيادة تلقائياً لتحديث قائمة الانتظار.",
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [howItWorksTab, setHowItWorksTab] = useState<"patient" | "provider">("patient");

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-500 ease-silky">
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[640px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(var(--color-primary-rgb),0.18),transparent_75%)] -z-10"
      />


      {/* ── 2. Comprehensive Navigation Header ── */}
      <header
        className="sticky top-0 z-40 w-full px-4 py-2.5 sm:px-6 sm:py-3 backdrop-blur-xl transition-all duration-300 md:px-8 border-b"
        style={{
          background: "var(--color-header-bg)",
          borderBottomColor: "var(--color-header-border)",
        }}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 sm:gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 xl:gap-5 min-w-0">
            <Logo size="md" />

            {/* Desktop Navigation Links — active on xl (>= 1280px) to prevent any header overflow */}
            <nav className="hidden xl:flex items-center flex-nowrap gap-1 text-xs xl:text-sm font-semibold text-text-secondary" aria-label="روابط الموقع الرئيسية">
              <Link
                href="/"
                className="whitespace-nowrap shrink-0 px-2.5 xl:px-3 py-1.5 rounded-xl text-primary font-bold bg-primary/10 transition-colors"
              >
                الرئيسية
              </Link>
              <Link
                href="/clinics"
                className="whitespace-nowrap shrink-0 px-2.5 xl:px-3 py-1.5 rounded-xl hover:text-primary hover:bg-primary-soft transition-colors"
              >
                تصفح العيادات
              </Link>
              <a
                href="#specialties"
                className="whitespace-nowrap shrink-0 px-2.5 xl:px-3 py-1.5 rounded-xl hover:text-primary hover:bg-primary-soft transition-colors"
              >
                التخصصات الطبية
              </a>
              <a
                href="#portals"
                className="whitespace-nowrap shrink-0 px-2.5 xl:px-3 py-1.5 rounded-xl hover:text-primary hover:bg-primary-soft transition-colors"
              >
                البوابات والخدمات
              </a>
              <a
                href="#features"
                className="whitespace-nowrap shrink-0 px-2.5 xl:px-3 py-1.5 rounded-xl hover:text-primary hover:bg-primary-soft transition-colors"
              >
                منظومة نبض
              </a>
              <a
                href="#how-it-works"
                className="whitespace-nowrap shrink-0 px-2.5 xl:px-3 py-1.5 rounded-xl hover:text-primary hover:bg-primary-soft transition-colors"
              >
                كيف تعمل؟
              </a>
              <a
                href="#faq"
                className="whitespace-nowrap shrink-0 px-2.5 xl:px-3 py-1.5 rounded-xl hover:text-primary hover:bg-primary-soft transition-colors"
              >
                الأسئلة الشائعة
              </a>
            </nav>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle />

            {/* Login / Auth Portal link */}
            <Link href="/login" className="hidden sm:inline-flex">
              <Button variant="outline" size="sm" className="font-bold whitespace-nowrap text-xs sm:text-sm">
                تسجيل الدخول
              </Button>
            </Link>

            {/* Mobile / Tablet Hamburger Button (shown below xl) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="فتح القائمة الرئيسية"
              aria-expanded={mobileMenuOpen}
              className="xl:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 text-text-secondary hover:text-primary hover:bg-primary-soft transition-colors focus-visible:outline-2 focus-visible:outline-primary"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Navigation Drawer ── */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-bg/60 backdrop-blur-sm xl:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="قائمة التصفح للجوال"
            className="fixed top-0 z-50 h-full w-80 max-w-[85vw] p-5 flex flex-col justify-between xl:hidden shadow-2xl animate-slide-in-right"
            style={{
              insetInlineStart: 0,
              background: "var(--color-surface)",
              borderInlineEnd: "1px solid var(--color-header-border)",
            }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <Logo size="sm" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="إغلاق القائمة"
                  className="h-9 w-9 flex items-center justify-center rounded-xl text-text-secondary hover:bg-primary-soft hover:text-primary transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Mobile Drawer Links */}
              <nav className="flex flex-col gap-1 text-sm font-semibold" aria-label="روابط الجوال">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-primary/10 text-primary font-bold"
                >
                  الرئيسية
                </Link>
                <Link
                  href="/clinics"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-text-secondary hover:bg-primary-soft hover:text-primary transition-colors"
                >
                  تصفح العيادات والمواعيد
                </Link>
                <a
                  href="#specialties"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-text-secondary hover:bg-primary-soft hover:text-primary transition-colors"
                >
                  التخصصات الطبية
                </a>
                <a
                  href="#portals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-text-secondary hover:bg-primary-soft hover:text-primary transition-colors"
                >
                  البوابات والأنظمة
                </a>
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-text-secondary hover:bg-primary-soft hover:text-primary transition-colors"
                >
                  منظومة نبض
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-text-secondary hover:bg-primary-soft hover:text-primary transition-colors"
                >
                  كيف تعمل المنصة؟
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-text-secondary hover:bg-primary-soft hover:text-primary transition-colors"
                >
                  الأسئلة الشائعة
                </a>
                <Link
                  href="/emergency-report"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-danger/10 text-danger font-bold border border-danger/20 mt-2"
                >
                  🚨 بلاغ طوارئ فوري
                </Link>
              </nav>
            </div>

            {/* Mobile Drawer Bottom Actions */}
            <div className="pt-4 border-t border-border/60 flex flex-col gap-2.5">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="outline" size="md" className="w-full justify-center font-bold">
                  تسجيل الدخول للبوابات
                </Button>
              </Link>
              <Link href="/clinics" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="primary" size="md" className="w-full justify-center font-bold">
                  حجز موعد كشف
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ── Main Landing Body ── */}
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-12 md:px-12 md:py-14">
        
        {/* ── 3. Expanded Medical Hero Section ── */}
        <section
          aria-labelledby="hero-heading"
          className="text-center max-w-4xl mx-auto mb-14 sm:mb-20 animate-fade-in rounded-3xl px-6 py-10 sm:py-14"
          style={{
            background: "linear-gradient(160deg, rgba(46,196,182,0.13) 0%, rgba(46,196,182,0.06) 50%, transparent 100%)",
          }}
        >
          {/* Clinical Badge */}
         

          {/* Grand Hero Title */}
          <h1
            id="hero-heading"
            className="font-brush text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[2.1] sm:leading-[2.2] text-text-primary tracking-normal py-3 overflow-visible"
            style={{ overflow: "visible" }}
          >
            الرعاية الصحية الذكية تبدأ من{" "}
            <span
              className="gradient-text-alive font-brush inline-block px-3 pt-1 pb-3 text-4xl sm:text-6xl md:text-7xl overflow-visible align-baseline"
              style={{ lineHeight: "1.9", overflow: "visible" }}
            >
              نبض | Nabd
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-sm sm:text-lg md:text-xl leading-relaxed sm:leading-loose font-medium text-text-secondary max-w-3xl mx-auto">
            منظومة رقمية تربط المرضى، نخبة الأطباء، والمستشفيات في بيئة سحابية فائقة الأمان. 
            احجز كشفك الطبي أونلاين، تابع سجلك الصحي الموحد، وتواصل مع شبكة الطوارئ المركزية في ثوانٍ.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link href="/clinics">
              <Button variant="primary" size="lg" className="font-extrabold shadow-md px-8 py-3.5 text-base">
                استعراض العيادات وحجز كشف
              </Button>
            </Link>
            <a href="#portals">
              <Button variant="secondary" size="lg" className="font-bold px-6 py-3.5 text-base">
                بوابات المنظومة الطبية
              </Button>
            </a>
            <Link href="/emergency-report">
              <Button variant="danger" size="lg" className="font-extrabold px-6 py-3.5 text-base flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-surface animate-ping" />
                <span>إرسال تقرير طوارئ</span>
              </Button>
            </Link>
          </div>

        </section>

        {/* ── 5. Medical Specialties Interactive Grid ── */}
        <section id="specialties" aria-labelledby="specialties-heading" className="mb-16 sm:mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary px-3 py-1 rounded-full bg-primary/10 mb-2">
                <span>تغطية طبية شاملة</span>
              </div>
              <h2 id="specialties-heading" className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-primary">
                استكشف التخصصات الطبية المتاحة
              </h2>
              <p className="mt-2 text-xs sm:text-base text-text-secondary max-w-2xl">
                اختر التخصص المطلوب لاستعراض العيادات المعتمدة، مواعيد الأطباء، وتقييمات المرضى لحجز كشفك مباشرة.
              </p>
            </div>

            <Link href="/clinics">
              <Button variant="secondary" size="md" className="font-bold self-start md:self-auto shrink-0">
                <span>تصفح كافة العيادات والأطباء</span>
                <span aria-hidden="true" className="ms-1.5">←</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {SPECIALTIES.map((spec) => (
              <Link key={spec.id} href={`/clinics`} className="group block">
                <Card
                  hover
                  glass
                  className="h-full flex flex-col justify-between p-5 sm:p-6 rounded-2xl border-border/70 group-hover:border-primary/50 transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-surface transition-all duration-200">
                        {spec.icon}
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-surface-raised border border-border/60 text-text-secondary">
                        {spec.badge}
                      </span>
                    </div>

                    <h3 className="font-display text-base sm:text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                      {spec.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
                      {spec.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-bold text-primary">
                    <span>عرض العيادات المتاحة</span>
                    <span className="transition-transform duration-150 group-hover:-translate-x-1" aria-hidden="true">
                      ←
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 6. The 4 Specialized Portals Grid (Enhanced) ── */}
        <section id="portals" aria-labelledby="portals-heading" className="mb-16 sm:mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary px-3 py-1 rounded-full bg-primary/10 mb-2">
              <span>بوابات الأنظمة الذكية</span>
            </div>
            <h2 id="portals-heading" className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-primary">
              بوابات مخصصة لكل أطراف الرعاية الصحية
            </h2>
            <p className="mt-2 text-xs sm:text-base text-text-secondary">
              سواء كنت مريضاً يبحث عن أفضل رعاية، أو طبيباً يدير عيادته، أو مستشفى ينسق أقسام الطوارئ، صُممت نبض لخدمتك.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 max-w-5xl mx-auto">
            {/* 1. Emergency & Cases Card */}
            <Card
              glass
              className="group relative flex flex-col justify-between p-6 sm:p-8 min-h-[440px] rounded-3xl !border-danger/30 hover:!border-danger/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-22px_rgba(var(--color-danger-rgb),0.5)] shadow-sm"
            >
              <div className="flex flex-col items-center text-center">
                <div className="pulse-ring-host rounded-2xl mb-4 sm:mb-6">
                  <span className="pulse-ring text-danger" />
                  <span className="pulse-ring text-danger" style={{ animationDelay: "1.3s" }} />
                  <div className="animate-heartbeat flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-danger/15 border border-danger/30 text-danger shadow-xs backdrop-blur-md transition-all duration-300 group-hover:scale-105">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                </div>

                <div className="mb-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-danger/10 text-danger border border-danger/20">
                  استجابة فورية 24/7
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary mb-2">
                  الطوارئ وبلاغات الحالات الحرجة
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-text-secondary max-w-md">
                  أرسل تقرير حالة طارئة عاجل للمستشفيات مع الموقع والتفاصيل الحيوية، أو تابع حالة بلاغك السابقة برمز التتبع.
                </p>

                {/* Micro Capabilities */}
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] font-semibold text-danger">
                  <span className="rounded-lg bg-danger/10 px-2.5 py-1 border border-danger/20">تحويل فوري لأقرب مستشفى</span>
                  <span className="rounded-lg bg-danger/10 px-2.5 py-1 border border-danger/20">كود تتبع لحظي</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 w-full">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-danger/30 to-transparent mb-1" />
                <Link href="/emergency-report" className="w-full">
                  <Button variant="danger" size="lg" className="w-full justify-center text-sm font-bold">
                    إرسال تقرير طوارئ فوري
                  </Button>
                </Link>
                <Link href="/emergency-track" className="w-full">
                  <Button variant="secondary" size="lg" className="w-full justify-center text-sm font-semibold">
                    متابعة حالة بلاغ طوارئ
                  </Button>
                </Link>
              </div>
            </Card>

            {/* 2. Patients & Bookings Card */}
            <Card
              glass
              className="group relative flex flex-col justify-between p-6 sm:p-8 min-h-[440px] rounded-3xl !border-primary/30 hover:!border-primary/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-22px_rgba(var(--color-primary-rgb),0.5)] shadow-sm"
            >
              <div className="flex flex-col items-center text-center">
                <div className="pulse-ring-host rounded-2xl mb-4 sm:mb-6">
                  <span className="pulse-ring text-primary" />
                  <span className="pulse-ring text-primary" style={{ animationDelay: "1.3s" }} />
                  <div className="animate-heartbeat flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 text-primary shadow-xs backdrop-blur-md transition-all duration-300 group-hover:scale-105">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </div>
                </div>

                <div className="mb-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-primary/10 text-primary border border-primary/20">
                  حجز فوري ومتابعة صحية
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary mb-2">
                  بوابة المرضى والحجوزات
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-text-secondary max-w-md">
                  تصفح أفضل الأطباء والعيادات، احجز موعدك دون انتظار، واطلع على ملفك الطبي والروشتات الإلكترونية بكل أمان.
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] font-semibold text-primary">
                  <span className="rounded-lg bg-primary/10 px-2.5 py-1 border border-primary/20">ملف طبي مدى الحياة</span>
                  <span className="rounded-lg bg-primary/10 px-2.5 py-1 border border-primary/20">تنبيهات المواعيد</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 w-full">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-1" />
                <Link href="/clinics" className="w-full">
                  <Button variant="primary" size="lg" className="w-full justify-center text-sm font-bold">
                    احجز كشف أونلاين
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" className="w-full">
                    <Button variant="secondary" size="md" className="w-full justify-center text-xs font-bold">
                      تسجيل الدخول
                    </Button>
                  </Link>
                  <Link href="/register?type=patient" className="w-full">
                    <Button variant="outline" size="md" className="w-full justify-center text-xs font-semibold">
                      حساب مريض جديد
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* 3. Doctors & Clinics Card */}
            <Card
              glass
              className="group relative flex flex-col justify-between p-6 sm:p-8 min-h-[440px] rounded-3xl !border-accent/30 hover:!border-accent/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-22px_rgba(var(--color-accent-rgb),0.5)] shadow-sm"
            >
              <div className="flex flex-col items-center text-center">
                <div className="pulse-ring-host rounded-2xl mb-4 sm:mb-6">
                  <span className="pulse-ring text-accent" />
                  <span className="pulse-ring text-accent" style={{ animationDelay: "1.3s" }} />
                  <div className="animate-heartbeat flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-accent/15 border border-accent/30 text-accent shadow-xs backdrop-blur-md transition-all duration-300 group-hover:scale-105">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.5 3h15" />
                      <path d="M6 3v6a6 6 0 0 0 12 0V3" />
                      <path d="M12 15v3a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-1" />
                      <circle cx="18" cy="18" r="2" />
                    </svg>
                  </div>
                </div>

                <div className="mb-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-accent/10 text-accent border border-accent/20">
                  إدارة العيادة والممارسات الطبية
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary mb-2">
                  بوابة الأطباء والعيادات
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-text-secondary max-w-md">
                  لوحة قيادة شاملة لإدارة كشوفات العيادة، تنظيم طابور الكشف، كتابة الروشتة الإلكترونية، وأرشفة ملفات المرضى بدقة.
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] font-semibold text-accent">
                  <span className="rounded-lg bg-accent/10 px-2.5 py-1 border border-accent/20">روشتات ذكية</span>
                  <span className="rounded-lg bg-accent/10 px-2.5 py-1 border border-accent/20">تنظيم المواعيد</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 w-full">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent mb-1" />
                <Link href="/login" className="w-full">
                  <Button variant="vibrant" size="lg" className="w-full justify-center text-sm font-bold">
                    تسجيل دخول الطبيب
                  </Button>
                </Link>
                <Link href="/register?type=doctor" className="w-full">
                  <Button variant="secondary" size="lg" className="w-full justify-center text-sm font-semibold">
                    انضم كطبيب جديد للمنظومة
                  </Button>
                </Link>
              </div>
            </Card>

            {/* 4. Hospitals & Facilities Card */}
            <Card
              glass
              className="group relative flex flex-col justify-between p-6 sm:p-8 min-h-[440px] rounded-3xl !border-secondary/30 hover:!border-secondary/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-22px_rgba(var(--color-secondary-rgb),0.5)] shadow-sm"
            >
              <div className="flex flex-col items-center text-center">
                <div className="pulse-ring-host rounded-2xl mb-4 sm:mb-6">
                  <span className="pulse-ring text-secondary" />
                  <span className="pulse-ring text-secondary" style={{ animationDelay: "1.3s" }} />
                  <div className="animate-heartbeat flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-secondary/15 border border-secondary/30 text-secondary shadow-xs backdrop-blur-md transition-all duration-300 group-hover:scale-105">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary mb-2">
                  بوابة المستشفيات والمنشآت
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-text-secondary max-w-md">
                  استقبال حالات الطوارئ والإسعاف المحولة فورياً، توزيع الأسرة والأقسام التخصصية، وتنسيق العمليات الجراحية المعقدة.
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] font-semibold text-secondary">
                  <span className="rounded-lg bg-secondary/10 px-2.5 py-1 border border-secondary/20">استقبال الإسعاف</span>
                  <span className="rounded-lg bg-secondary/10 px-2.5 py-1 border border-secondary/20">إدارة الطاقة الاستيعابية</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 w-full">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent mb-1" />
                <Link href="/login" className="w-full">
                  <Button variant="primary" size="lg" className="w-full justify-center text-sm font-bold">
                    بوابة دخول المستشفى
                  </Button>
                </Link>
                <Link href="/register?type=hospital" className="w-full">
                  <Button variant="secondary" size="lg" className="w-full justify-center text-sm font-semibold">
                    تسجيل منشأة طبية جديدة
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>

        {/* ── 7. Integrated Clinical Ecosystem / Features ── */}
        <section id="features" aria-labelledby="features-heading" className="mb-16 sm:mb-24">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary px-3 py-1 rounded-full bg-primary/10 mb-2">
              <span>تقنيات الرعاية الصحية</span>
            </div>
            <h2 id="features-heading" className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-primary">
              بنية تحتية طبية رقمية متكاملة
            </h2>
            <p className="mt-2 text-xs sm:text-base text-text-secondary">
              تم بناء نبض لتلبية أعلى المتطلبات السريرية والأمنية، لربط رحلة المريض بالكامل في منصة واحدة موثوقة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CLINICAL_FEATURES.map((feat, idx) => (
              <Card
                key={idx}
                glass
                hover
                className="p-6 rounded-2xl flex flex-col justify-between border-border/70 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                      {feat.icon}
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-surface-raised border border-border/60 text-primary">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-text-primary mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-border/40 flex items-center text-xs font-semibold text-text-secondary">
                  <span className="text-success font-bold me-1.5">✓</span>
                  <span>مفعل تلقائياً لكافة المشتركين</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ── 8. How It Works (Interactive Tabbed Section) ── */}
        <section id="how-it-works" aria-labelledby="how-heading" className="mb-16 sm:mb-24">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary px-3 py-1 rounded-full bg-primary/10 mb-2">
              <span>خطوات بسيطة وسريعة</span>
            </div>
            <h2 id="how-heading" className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-primary">
              كيف تعمل منصة نبض؟
            </h2>
            <p className="mt-2 text-xs sm:text-base text-text-secondary">
              تجربة مستخدم سهلة ومصممة لتوفير الوقت والجهد للمرضى ومقدمي الرعاية الصحية.
            </p>

            {/* Segmented Controls */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-surface-raised border border-border/60 mt-6">
              <button
                type="button"
                onClick={() => setHowItWorksTab("patient")}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  howItWorksTab === "patient"
                    ? "bg-primary text-surface shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                رحلة المريض (حجز واستشارة)
              </button>
              <button
                type="button"
                onClick={() => setHowItWorksTab("provider")}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  howItWorksTab === "provider"
                    ? "bg-primary text-surface shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                رحلة الطبيب والمنشأة الطبية
              </button>
            </div>
          </div>

          {/* Steps Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {howItWorksTab === "patient" ? (
              <>
                <Card glass className="p-6 rounded-2xl relative border-primary/20 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary font-display font-extrabold text-lg mb-4">
                    1
                  </div>
                  <h3 className="font-display text-lg font-bold text-text-primary mb-2">ابحث واختر العيادة</h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    تصفح التخصصات الطبية، قارن بين مواعيد الأطباء، واطلع على أسعار الكشف وتفاصيل العيادة بكل شفافية.
                  </p>
                </Card>

                <Card glass className="p-6 rounded-2xl relative border-primary/20 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary font-display font-extrabold text-lg mb-4">
                    2
                  </div>
                  <h3 className="font-display text-lg font-bold text-text-primary mb-2">احجز موعدك فورياً</h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    حدد اليوم والوقت المناسب بضغطة زر، وتلقَّ رسالة تأكيد الحجز وإشعاراً تذكيرياً بموعد الكشف وترتيبك في الطابور.
                  </p>
                </Card>

                <Card glass className="p-6 rounded-2xl relative border-primary/20 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary font-display font-extrabold text-lg mb-4">
                    3
                  </div>
                  <h3 className="font-display text-lg font-bold text-text-primary mb-2">احضر الكشف واستلم روشتتك</h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    احضر استشارتك بدون طوابير، واحصل على روشتتك الطبية الرقمية المعتمدة محفوظة في ملفك الصحي مدى الحياة.
                  </p>
                </Card>
              </>
            ) : (
              <>
                <Card glass className="p-6 rounded-2xl relative border-accent/20 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent font-display font-extrabold text-lg mb-4">
                    1
                  </div>
                  <h3 className="font-display text-lg font-bold text-text-primary mb-2">سجّل واعتمد منشأتك</h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    أنشئ حساب طبيب أو مستشفى، وأدخل بيانات الترخيص والتخصص لتفعيل حسابك في المنظومة الطبية المعتمدة.
                  </p>
                </Card>

                <Card glass className="p-6 rounded-2xl relative border-accent/20 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent font-display font-extrabold text-lg mb-4">
                    2
                  </div>
                  <h3 className="font-display text-lg font-bold text-text-primary mb-2">اضبط مواعيدك وخدماتك</h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    حدد أوقات العمل الأسبوعية، رسوم الاستشارات، وسعة الكشوفات اليومية مع نظام حجز ذكي يمنع التضارب.
                  </p>
                </Card>

                <Card glass className="p-6 rounded-2xl relative border-accent/20 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent font-display font-extrabold text-lg mb-4">
                    3
                  </div>
                  <h3 className="font-display text-lg font-bold text-text-primary mb-2">أدر الكشوفات والسجلات</h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    استقبل المرضى، أصدر الروشتات الإلكترونية برمز QR، وتابع تقارير أداء العيادة وحالات الطوارئ المحولة بيسر.
                  </p>
                </Card>
              </>
            )}
          </div>
        </section>

        {/* ── 9. Emergency Direct Action Banner ── */}
        <section aria-label="شريط استغاثة الطوارئ السريع" className="mb-16 sm:mb-24">
          <div
            className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-danger/40 shadow-xl text-center md:text-start"
            style={{
              background: "linear-gradient(135deg, rgba(var(--color-danger-rgb), 0.15) 0%, rgba(var(--color-surface-rgb, 15,23,42), 0.85) 100%)",
            }}
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-danger/20 border border-danger/30 px-3 py-1 text-xs font-extrabold text-danger mb-3">
                  <span className="h-2 w-2 rounded-full bg-danger animate-ping" />
                  <span>خط الطوارئ والحالات الحرجة المباشر</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">
                  هل تواجه حالة طبية طارئة تتطلب تدخلاً عاجلاً؟
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
                  شبكة نبض للطوارئ متصلة فورياً مع غرف العمليات المركزية وأطقم الإسعاف بالمستشفيات الشريكة لتجهيز الفرز الطبي قبل وصول الحالة.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                <Link href="/emergency-report">
                  <Button variant="danger" size="lg" className="font-extrabold px-6 py-3 shadow-md">
                    تقديم بلاغ طوارئ الآن
                  </Button>
                </Link>
                <Link href="/emergency-track">
                  <Button variant="secondary" size="lg" className="font-bold px-5 py-3">
                    تتبع بلاغ سابق بكود التتبع
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 10. Medical Safety & Quality Badges ── */}
        <section aria-label="معايير الأمان والجودة الصحية" className="mb-16 sm:mb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-raised/60 border border-border/50">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">سرية السجلات الطبية</h3>
                <p className="text-xs text-text-secondary mt-0.5">تشفير كامل وحماية لبيانات المريض</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-raised/60 border border-border/50">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">كوادر طبية معتمدة</h3>
                <p className="text-xs text-text-secondary mt-0.5">أطباء واستشاريون مرخصون رسمياً</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-raised/60 border border-border/50">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">استجابة سريعة 24/7</h3>
                <p className="text-xs text-text-secondary mt-0.5">نظام استغاثة وطوارئ دائم الجاهزية</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-raised/60 border border-border/50">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">روشتات معتمدة بـ QR</h3>
                <p className="text-xs text-text-secondary mt-0.5">سهولة الصرف والتحقق الرقمي</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 11. Interactive Medical FAQ Section ── */}
        <section id="faq" aria-labelledby="faq-heading" className="mb-16 sm:mb-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary px-3 py-1 rounded-full bg-primary/10 mb-2">
              <span>إجابات وتوضيحات</span>
            </div>
            <h2 id="faq-heading" className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-primary">
              الأسئلة الشائعة حول منصة نبض
            </h2>
            <p className="mt-2 text-xs sm:text-base text-text-secondary">
              كل ما تحتاج معرفته حول حجز المواعيد، سرية السجلات، وخدمات الطوارئ.
            </p>
          </div>

          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border/70 bg-surface/80 overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-start font-bold text-sm sm:text-base text-text-primary hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <span>{faq.q}</span>
                    <span
                      aria-hidden="true"
                      className={`ms-3 shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-surface-raised border border-border/60 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-primary" : "text-text-secondary"
                      }`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border/40 pt-3 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* ── 12. Medical Footer ── */}
      <footer
        className="border-t pt-12 pb-8 px-4 sm:px-6 md:px-12 transition-colors mt-auto"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-header-border)",
        }}
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Col 1: Brand & Clinical Mission */}
            <div className="lg:col-span-2">
              <Logo size="md" />
              <p className="mt-4 text-xs sm:text-sm text-text-secondary leading-relaxed max-w-sm">
                نبض (Nabd) — منظومة سحابية متطورة للرعاية الصحية، تجمع المرضى، الأطباء، والمستشفيات لإدارة المواعيد والسجلات الطبية وشبكات الطوارئ بكفاءة وأمان عالمي.
              </p>
              
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-text-primary">
                <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
                <span>جميع الأنظمة الطبية تعمل بكفاءة تامة (Operational)</span>
              </div>
            </div>

            {/* Col 2: Patient Services */}
            <div>
              <h3 className="font-display font-bold text-sm text-text-primary mb-3">خدمات المرضى</h3>
              <ul className="flex flex-col gap-2 text-xs text-text-secondary">
                <li>
                  <Link href="/clinics" className="hover:text-primary transition-colors">
                    تصفح العيادات المتاحة
                  </Link>
                </li>
                <li>
                  <Link href="/clinics" className="hover:text-primary transition-colors">
                    حجز موعد كشف فوري
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-primary transition-colors">
                    بوابة دخول المريض
                  </Link>
                </li>
                <li>
                  <Link href="/register?type=patient" className="hover:text-primary transition-colors">
                    إنشاء حساب مريض جديد
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Providers & Hospitals */}
            <div>
              <h3 className="font-display font-bold text-sm text-text-primary mb-3">للأطباء والمنشآت</h3>
              <ul className="flex flex-col gap-2 text-xs text-text-secondary">
                <li>
                  <Link href="/login" className="hover:text-primary transition-colors">
                    بوابة الأطباء والعيادات
                  </Link>
                </li>
                <li>
                  <Link href="/register?type=doctor" className="hover:text-primary transition-colors">
                    انضمام طبيب للمنظومة
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-primary transition-colors">
                    بوابة المستشفيات المركزية
                  </Link>
                </li>
                <li>
                  <Link href="/register?type=hospital" className="hover:text-primary transition-colors">
                    تسجيل مستشفى جديد
                  </Link>
                </li>
                <li>
                  <Link href="/admin-login" className="hover:text-primary transition-colors">
                    بوابة الإدارة العامة
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Emergency & Support */}
            <div>
              <h3 className="font-display font-bold text-sm text-text-primary mb-3">الطوارئ والدعم</h3>
              <ul className="flex flex-col gap-2 text-xs text-text-secondary">
                <li>
                  <Link href="/emergency-report" className="text-danger font-bold hover:underline">
                    🚨 إرسال تقرير طوارئ
                  </Link>
                </li>
                <li>
                  <Link href="/emergency-track" className="hover:text-primary transition-colors">
                    متابعة بلاغ طوارئ سابق
                  </Link>
                </li>
                <li>
                  <span className="text-text-primary font-semibold">خط الإسعاف الموحد: 123</span>
                </li>
                <li>
                  <span className="text-text-secondary">الدعم الفني الطبي: support@nabd.care</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}