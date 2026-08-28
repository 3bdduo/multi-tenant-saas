"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createEmergencyCase, uploadEmergencyReport } from "@/lib/api/emergency";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@/lib/http";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/ui/Logo";

// ─── Note: The backend has two separate endpoints (create + uploadReport).
// We chain them automatically behind one submit button so the user never sees
// the two-step complexity. The caseCode is only revealed after BOTH succeed.

type Stage = "form" | "done" | "error";

export default function EmergencyReportPage() {
  const [stage, setStage] = useState<Stage>("form");

  // Form fields
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Loading / error
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Success data
  const [caseCode, setCaseCode] = useState("");
  const [copied, setCopied] = useState(false);

  // ── Submit: create case THEN upload image (two API calls, one button) ──────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!phoneNumber.trim()) {
      setError("يرجى إدخال رقم الهاتف");
      return;
    }
    if (!file) {
      setError("يرجى إرفاق صورة أو ملف PDF للتقرير — هذا مطلوب لإبلاغ المستشفيات");
      return;
    }

    setLoading(true);

    try {
      // Step 1: create the emergency case → get caseCode
      setLoadingMsg("جارٍ إنشاء البلاغ...");
      const createRes = await createEmergencyCase({
        phoneNumber: phoneNumber.trim(),
        notes: notes.trim() || undefined,
      });
      const code = createRes.data.createdEmergency.caseCode;

      // Step 2: upload the report image immediately
      setLoadingMsg("جارٍ رفع التقرير وإشعار المستشفيات...");
      await uploadEmergencyReport(code, file);

      // All done
      setCaseCode(code);
      setStage("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "حدث خطأ غير متوقع، حاول مرة أخرى");
      setStage("error");
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(caseCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handleReset() {
    setStage("form");
    setPhoneNumber("");
    setNotes("");
    setFile(null);
    setError(null);
    setCaseCode("");
    setCopied(false);
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-6 py-4 backdrop-blur-xl"
        style={{
          background: "var(--color-header-bg)",
          borderBottom: "1px solid var(--color-header-border)",
        }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/emergency-track">
              <Button variant="secondary" size="sm">متابعة بلاغ</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">الرئيسية</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        {/* Title */}
        <div className="text-center mb-10 animate-fade-in-slow">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-4 py-1.5 text-xs font-bold text-danger">
            <span className="h-2 w-2 rounded-full bg-danger animate-pulse" />
            نظام الإبلاغ عن حالات الطوارئ
          </div>
          <h1 className="font-display text-3xl font-extrabold text-text-primary md:text-4xl">
            إرسال تقرير طوارئ
          </h1>
          <p className="mt-3 text-sm text-text-secondary max-w-md mx-auto">
            أرسل البيانات والصورة دفعة واحدة — تُشعَر المستشفيات تلقائياً فور الإرسال
          </p>
        </div>

        <Card glass vibrant className="p-8 shadow-2xl border-danger/20">
          {/* ── STAGE: form ──────────────────────────────────────────────────── */}
          {(stage === "form" || stage === "error") && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
              <Field
                label="رقم الهاتف المصري للمسؤول عن الحالة"
                type="tel"
                inputMode="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="مثال: 01000000000"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-primary">
                  ملاحظات طبية عن الحالة
                  <span className="mr-1 text-xs font-normal text-text-secondary">(اختياري)</span>
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: حادث سير — كسر في الساق اليمنى — المريض واعٍ"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary resize-none focus:border-danger focus:outline-none focus:ring-2 focus:ring-danger/20 transition-colors"
                />
              </div>

              {/* File upload area */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text-primary">
                  صورة / ملف التقرير الطبي
                  <span className="mr-1 text-xs font-bold text-danger">*مطلوب</span>
                </label>
                <label className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 cursor-pointer transition-all duration-300 ${
                  file
                    ? "border-primary/60 bg-primary-soft"
                    : "border-border hover:border-danger/40 hover:bg-danger/5"
                }`}>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  {file ? (
                    <>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <polyline points="20 6 9 17 4 12" className="stroke-success" strokeWidth="3" />
                      </svg>
                      <div className="text-center">
                        <p className="text-sm font-bold text-text-primary">{file.name}</p>
                        <p className="text-xs text-text-secondary mt-0.5">{(file.size / 1024).toFixed(1)} كيلوبايت</p>
                      </div>
                      <p className="text-xs text-primary font-semibold">انقر لتغيير الملف</p>
                    </>
                  ) : (
                    <>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-text-primary">اسحب الملف هنا أو انقر لاختياره</p>
                        <p className="text-xs text-text-secondary mt-1">صور (JPG, PNG) أو ملفات PDF</p>
                      </div>
                    </>
                  )}
                </label>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger font-medium">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 shrink-0">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Loading progress */}
              {loading && (
                <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">
                  <svg className="h-4 w-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-80" />
                  </svg>
                  {loadingMsg}
                </div>
              )}

              <Button
                type="submit"
                loading={loading}
                className="w-full h-14 text-base font-extrabold bg-danger hover:bg-red-600 border-danger text-white shadow-lg"
              >
                إرسال البلاغ مع التقرير الآن
              </Button>

              <p className="text-xs text-text-secondary text-center">
                كل بلاغ صالح لمدة <strong>6 ساعات</strong> — بعد الإرسال، تُشعَر المستشفيات تلقائياً
              </p>
            </form>
          )}

          {/* ── STAGE: done ──────────────────────────────────────────────────── */}
          {stage === "done" && (
            <div className="flex flex-col gap-6 animate-fade-in-slow">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="font-display text-2xl font-extrabold text-text-primary">تم إرسال البلاغ بنجاح!</h2>
                <p className="mt-2 text-sm text-text-secondary">
                  تم رفع التقرير وإشعار كل المستشفيات تلقائياً
                </p>
              </div>

              {/* Case Code */}
              <div className="rounded-2xl border border-border bg-surface-raised/60 p-5">
                <p className="text-xs font-bold text-text-secondary mb-3 uppercase tracking-widest text-center">
                  كود التتبع الخاص بك
                </p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 font-mono text-2xl font-extrabold tracking-[0.3em] text-text-primary bg-border/10 rounded-xl px-4 py-3 text-center border border-border/50 select-all">
                    {caseCode}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    title="نسخ الكود"
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                      copied
                        ? "border-success/40 bg-success/10 text-success"
                        : "border-border bg-surface text-text-secondary hover:border-primary/50 hover:text-primary hover:bg-primary-soft"
                    }`}
                  >
                    {copied ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
                {copied && (
                  <p className="mt-2 text-xs text-success font-semibold text-center">تم النسخ إلى الحافظة</p>
                )}
                <p className="mt-3 text-xs text-text-secondary text-center">
                  احتفظ بهذا الكود لمتابعة حالتك — صالح لمدة 6 ساعات
                </p>
              </div>

              <div className="flex gap-3">
                <Link href="/emergency-track" className="flex-1">
                  <Button variant="secondary" className="w-full font-bold">
                    متابعة الحالة
                  </Button>
                </Link>
                <Button variant="ghost" className="flex-1" onClick={handleReset}>
                  + إرسال بلاغ جديد
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
