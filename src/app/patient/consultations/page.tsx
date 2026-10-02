"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import Link from "next/link";
import { createConsultation, getMyConsultations } from "@/lib/api/consultation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Consultation } from "@/types/api";
import { ApiError } from "@/lib/http";

function lastPreview(c: Consultation) {
  const last = c.messages[c.messages.length - 1];
  if (!last) return "";
  return last.text?.slice(0, 90) || (last.image ? "صورة مرفقة" : "");
}

export default function PatientConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getMyConsultations();
      setConsultations(res.data.consultations ?? []);
    } catch (err) {
      console.error("Failed to load consultations:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("يرجى إرفاق صورة التقرير أو الأشعة");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await createConsultation(file, question.trim() || undefined);
      setFile(null);
      setQuestion("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (res?.data?.consultation) {
        setConsultations((prev) => [res.data.consultation, ...prev]);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر إرسال الاستشارة");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-4xl pb-16">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">
          الاستشارات الطبية العامة
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          ارفع صورة تقرير أو أشعة وسؤالك، وسيقوم الذكاء الاصطناعي بتحليلها فورًا، ثم يقدر أي طبيب على المنصة يضيف رأيه — الخدمة مجانية بالكامل.
        </p>
      </div>

      <Card glass vibrant className="border-primary/30 p-5 sm:p-7 shadow-lg">
        <h2 className="font-display text-lg font-bold text-text-primary mb-4">
          استشارة جديدة
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-primary">
              صورة التقرير أو الأشعة *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setError(null);
              }}
              className="rounded-xl border border-border/80 bg-surface px-4 py-2.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-primary">
              سؤالك (اختياري)
            </label>
            <textarea
              placeholder="اكتب أي تفاصيل أو سؤال يخص الصورة المرفقة..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="rounded-xl border border-border/80 bg-surface px-3 py-2 text-sm outline-none resize-none h-20"
            />
          </div>
          {error && (
            <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-xs sm:text-sm text-danger font-bold animate-fade-in">
              {error}
            </div>
          )}
          <Button
            type="submit"
            variant="vibrant"
            disabled={submitting}
            loading={submitting}
            className="w-full shadow-glow-cyan font-bold min-h-[44px]"
          >
            {submitting ? "جارٍ الإرسال والتحليل..." : "إرسال الاستشارة"}
          </Button>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-base sm:text-lg text-text-primary">
          استشاراتي السابقة
        </h2>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <Card key={i} className="h-20 animate-pulse bg-surface-raised" />
            ))}
          </div>
        ) : consultations.length === 0 ? (
          <Card className="py-16 text-center text-text-secondary">
            <p className="text-base font-semibold">لسه ما بعتّش أي استشارة</p>
          </Card>
        ) : (
          consultations.map((c) => (
            <Link key={c._id} href={`/patient/consultations/${c._id}`}>
              <Card hover className="p-4 sm:p-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">
                    {lastPreview(c)}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {new Date(c.lastMessageAt).toLocaleString("ar-EG")}
                  </p>
                </div>
                <span className="rounded-full bg-surface-raised px-3 py-1 text-xs font-bold text-text-secondary shrink-0">
                  {c.messages.length} رسالة
                </span>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
