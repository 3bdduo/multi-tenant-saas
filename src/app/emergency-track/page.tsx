"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { trackEmergencyCase, cancelEmergencyCase } from "@/lib/api/emergency";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@/lib/http";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/ui/Logo";
import type { TrackEmergencyCaseResponse } from "@/types/api";

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  open:     { label: "مفتوحة — بانتظار استجابة المستشفى", color: "text-warning",        bg: "bg-warning/10 border-warning/30" },
  claimed:  { label: "مستشفى استجاب وقيد الاستقبال",      color: "text-primary",        bg: "bg-primary/10 border-primary/30" },
  resolved: { label: "تم حل الحالة بنجاح",                color: "text-success",        bg: "bg-success/10 border-success/30" },
  expired:  { label: "انتهت المهلة أو تم الإلغاء",         color: "text-text-secondary", bg: "bg-border/10 border-border/40" },
};

export default function EmergencyTrackPage() {
  const [trackCode, setTrackCode] = useState("");
  const [result, setResult] = useState<TrackEmergencyCaseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [lastSearched, setLastSearched] = useState("");

  async function handleTrack(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const code = trackCode.trim().toUpperCase();
    if (!code) { setError("يرجى إدخال كود التتبع"); return; }
    setLoading(true);
    try {
      const res = await trackEmergencyCase(code);
      setResult(res.data.emergency);
      setLastSearched(code);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "لم يتم العثور على هذا الكود، تأكد من الكتابة");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm("هل أنت متأكد من إلغاء هذه الحالة؟ لا يمكن التراجع.")) return;
    setCancelLoading(true);
    try {
      await cancelEmergencyCase(lastSearched);
      const res = await trackEmergencyCase(lastSearched);
      setResult(res.data.emergency);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "فشل إلغاء الحالة");
    } finally {
      setCancelLoading(false);
    }
  }

  const st = result ? (STATUS_MAP[result.status] ?? { label: result.status, color: "", bg: "bg-border/10 border-border/30" }) : null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-3.5 py-2.5 sm:px-6 sm:py-4 backdrop-blur-xl"
        style={{
          background: "var(--color-header-bg)",
          borderBottom: "1px solid var(--color-header-border)",
        }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
          <Logo size="sm" />
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="scale-90 sm:scale-100 origin-left">
              <ThemeToggle />
            </div>
            <Link href="/emergency-report">
              <Button variant="danger" size="sm" className="text-xs px-2.5 sm:px-4 py-1.5 sm:py-2">
                إرسال بلاغ
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs px-2 sm:px-3 py-1.5 sm:py-2">
                الرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-14 md:px-8">
        {/* Title */}
        <div className="text-center mb-6 sm:mb-10 animate-fade-in-slow">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
            متابعة حالة البلاغ
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary md:text-4xl">
            متابعة بلاغ الطوارئ
          </h1>
          <p className="mt-3 text-sm text-text-secondary max-w-sm mx-auto">
            أدخل الكود الذي استلمته بعد إرسال البلاغ لمعرفة حالته الراهنة
          </p>
        </div>

        <Card glass vibrant className="p-5 sm:p-8 shadow-2xl border-primary/20">
          <form onSubmit={handleTrack} className="flex gap-3 mb-6" noValidate>
            <input
              type="text"
              value={trackCode}
              onChange={(e) => setTrackCode(e.target.value.toUpperCase())}
              placeholder="مثال: EMR-AB12CD"
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 font-mono text-base tracking-widest text-text-primary placeholder:text-text-secondary uppercase focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button type="submit" loading={loading} className="px-6 font-bold">
              بحث
            </Button>
          </form>

          {error && (
            <div className="rounded-xl bg-danger/10 border border-danger/20 p-4 text-sm text-danger font-medium animate-fade-in mb-6">
              {error}
            </div>
          )}

          {/* Result */}
          {result && st && (
            <div className="flex flex-col gap-4 animate-fade-in-slow">
              {/* Status Banner */}
              <div className={`rounded-2xl border p-5 ${st.bg} flex items-center gap-4`}>
                <div>
                  <p className="text-xs text-text-secondary font-semibold mb-0.5">حالة البلاغ</p>
                  <p className={`text-base font-extrabold ${st.color}`}>{st.label}</p>
                  <p className="text-xs text-text-secondary mt-1 font-mono tracking-widest">كود: {lastSearched}</p>
                </div>
              </div>

              {/* Interested hospitals count */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface/60 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-text-primary">المستشفيات التي استجابت</p>
                  <p className="text-xs text-text-secondary mt-0.5">عدد المستشفيات التي طلعت على البلاغ</p>
                </div>
                <span className="text-3xl font-extrabold text-text-primary">
                  {result.interestedHospitalsCount}
                </span>
              </div>

              <p className="text-xs text-text-secondary text-center bg-border/10 rounded-lg px-4 py-2.5">
                لأسباب أمنية، لا تُعرض صورة التقرير في هذه الصفحة. المستشفيات هي التي تطلع على التقرير كاملاً.
              </p>

              {/* Cancel — only when open */}
              {result.status === "open" && (
                <Button
                  variant="outline"
                  className="w-full border-danger/30 text-danger hover:bg-danger/10 font-bold"
                  disabled={cancelLoading}
                  onClick={handleCancel}
                >
                  {cancelLoading ? "جارٍ الإلغاء..." : "إلغاء هذا البلاغ"}
                </Button>
              )}
            </div>
          )}

          {/* Info note */}
          <div className="mt-6 rounded-xl bg-warning/5 border border-warning/20 p-4">
            <p className="text-xs font-bold text-warning mb-2">معلومات مهمة</p>
            <ul className="text-xs text-text-secondary space-y-1.5">
              <li>• كل بلاغ صالح لمدة <strong>6 ساعات</strong> فقط من وقت الإرسال</li>
              <li>• لا يمكن إلغاء البلاغ بعد استلامه من مستشفى (حالة: جارية)</li>
              <li>• في حال انتهت المهلة، أرسل بلاغاً جديداً</li>
            </ul>
          </div>
        </Card>
      </main>
    </div>
  );
}
