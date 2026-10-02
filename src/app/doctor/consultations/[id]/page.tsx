"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getConsultationById, addConsultationReply } from "@/lib/api/consultation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Consultation, ConsultationMessage } from "@/types/api";
import { ApiError } from "@/lib/http";

function senderLabel(m: ConsultationMessage) {
  if (m.senderType === "AI") return "الذكاء الاصطناعي";
  if (m.senderType === "Doctor") {
    const doc = typeof m.senderId === "object" ? m.senderId : null;
    return doc ? `د. ${doc.firstName} ${doc.lastName}` : "طبيب";
  }
  return "المريض";
}

function Bubble({ message, isMine }: { message: ConsultationMessage; isMine: boolean }) {
  const isAI = message.senderType === "AI";
  const isPatient = message.senderType === "Patient";
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 text-sm leading-relaxed ${
          isMine
            ? "bg-primary text-surface rounded-tl-sm"
            : isAI
            ? "bg-accent/10 border border-accent/30 text-text-primary rounded-tr-sm"
            : "bg-surface-raised border border-border/70 text-text-primary rounded-tr-sm"
        }`}
      >
        <p
          className={`text-[11px] font-bold mb-1.5 ${
            isMine ? "text-surface/80" : isAI ? "text-accent" : "text-primary"
          }`}
        >
          {senderLabel(message)}
          {isAI && " 🤖"}
          {isPatient && " (صاحب الاستشارة)"}
        </p>
        {message.image && (
          <a href={message.image.secure_url} target="_blank" rel="noopener noreferrer">
            <img
              src={message.image.secure_url}
              alt="مرفق"
              className="rounded-xl mb-2 max-h-64 object-cover border border-border/40"
            />
          </a>
        )}
        {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
        <p className={`text-[10px] mt-2 ${isMine ? "text-surface/60" : "text-text-secondary"}`}>
          {new Date(message.createdAt).toLocaleString("ar-EG")}
        </p>
      </div>
    </div>
  );
}

export default function DoctorConsultationThreadPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [myDoctorId, setMyDoctorId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // بنحدد "أنا" (الدكتور الحالي) من أول رد دكتور نلاقيه بيخصه بعد ما نجيب بيانات اليوزر
    // الأبسط: بنجيب التوكن من localStorage مش متاح هنا مباشرة، فبنعتمد على مقارنة الاسم وقت العرض بدل كده
    getConsultationById(params.id)
      .then((res) => setConsultation(res.data.consultation))
      .catch(() => setConsultation(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleReply(e: FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await addConsultationReply(params.id, reply.trim());
      setConsultation(res.data.consultation);
      setReply("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر إرسال الرد");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-4 pb-16">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-24 animate-pulse bg-surface-raised" />
        ))}
      </div>
    );
  }

  if (!consultation) {
    return (
      <Card className="max-w-3xl mx-auto py-16 text-center text-text-secondary">
        <p className="text-base font-semibold">تعذّر العثور على هذه الاستشارة</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => router.push("/doctor/consultations")}>
          الرجوع لكل الاستشارات
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-16 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl sm:text-2xl font-extrabold text-text-primary">
          الاستشارة الطبية
        </h1>
        <Button variant="secondary" size="sm" onClick={() => router.push("/doctor/consultations")}>
          كل الاستشارات
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {consultation.messages.map((m) => (
          <Bubble key={m._id} message={m} isMine={m.senderType === "Doctor"} />
        ))}
      </div>

      <Card glass vibrant className="border-primary/30 p-4 sm:p-5">
        <form onSubmit={handleReply} className="flex flex-col gap-3">
          <textarea
            placeholder="اكتب ردك الطبي هنا..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="rounded-xl border border-border/80 bg-surface px-3 py-2 text-sm outline-none resize-none h-24"
          />
          {error && (
            <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-xs text-danger font-bold">
              {error}
            </div>
          )}
          <Button
            type="submit"
            variant="vibrant"
            disabled={sending || !reply.trim()}
            loading={sending}
            className="self-end shadow-glow-cyan font-bold px-6"
          >
            {sending ? "جارٍ الإرسال..." : "إضافة ردي"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
