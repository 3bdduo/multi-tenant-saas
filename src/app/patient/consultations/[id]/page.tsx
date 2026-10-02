"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getConsultationById } from "@/lib/api/consultation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Consultation, ConsultationMessage } from "@/types/api";

function senderLabel(m: ConsultationMessage) {
  if (m.senderType === "AI") return "الذكاء الاصطناعي";
  if (m.senderType === "Doctor") {
    const doc = typeof m.senderId === "object" ? m.senderId : null;
    return doc ? `د. ${doc.firstName} ${doc.lastName}` : "طبيب";
  }
  return "أنت";
}

function Bubble({ message }: { message: ConsultationMessage }) {
  const isPatient = message.senderType === "Patient";
  const isAI = message.senderType === "AI";
  return (
    <div className={`flex ${isPatient ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 text-sm leading-relaxed ${
          isPatient
            ? "bg-primary text-surface rounded-tl-sm"
            : isAI
            ? "bg-accent/10 border border-accent/30 text-text-primary rounded-tr-sm"
            : "bg-surface-raised border border-border/70 text-text-primary rounded-tr-sm"
        }`}
      >
        <p
          className={`text-[11px] font-bold mb-1.5 ${
            isPatient ? "text-surface/80" : isAI ? "text-accent" : "text-primary"
          }`}
        >
          {senderLabel(message)}
          {isAI && " 🤖"}
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
        <p className={`text-[10px] mt-2 ${isPatient ? "text-surface/60" : "text-text-secondary"}`}>
          {new Date(message.createdAt).toLocaleString("ar-EG")}
        </p>
      </div>
    </div>
  );
}

export default function PatientConsultationThreadPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConsultationById(params.id)
      .then((res) => setConsultation(res.data.consultation))
      .catch(() => setConsultation(null))
      .finally(() => setLoading(false));
  }, [params.id]);

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
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => router.push("/patient/consultations")}>
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
        <Button variant="secondary" size="sm" onClick={() => router.push("/patient/consultations")}>
          كل الاستشارات
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {consultation.messages.map((m) => (
          <Bubble key={m._id} message={m} />
        ))}
      </div>

      <Card className="p-4 text-xs text-text-secondary text-center bg-surface-raised/60">
        الاستشارة ظاهرة لكل الأطباء على المنصة، وأي طبيب يقدر يضيف رأيه في أي وقت.
      </Card>
    </div>
  );
}
