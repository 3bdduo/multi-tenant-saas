import { apiFetch } from "@/lib/http";
import type { ApiEnvelope, Consultation } from "@/types/api";

// POST /consultation  (Patient)
export function createConsultation(file: File, question?: string) {
  const form = new FormData();
  form.append("image", file);
  if (question) form.append("question", question);

  return apiFetch<ApiEnvelope<{ consultation: Consultation }>>(
    "/consultation",
    { method: "POST", body: form, headers: {} }
  );
}

// GET /consultation/mine  (Patient)
export function getMyConsultations() {
  return apiFetch<ApiEnvelope<{ consultations: Consultation[] }>>(
    "/consultation/mine"
  );
}

// GET /consultation/all  (Doctor)
export function getAllConsultations() {
  return apiFetch<ApiEnvelope<{ consultations: Consultation[] }>>(
    "/consultation/all"
  );
}

// GET /consultation/:id  (Patient owner or any Doctor)
export function getConsultationById(id: string) {
  return apiFetch<ApiEnvelope<{ consultation: Consultation }>>(
    `/consultation/${id}`
  );
}

// POST /consultation/:id/reply  (Doctor)
export function addConsultationReply(id: string, text: string) {
  return apiFetch<ApiEnvelope<{ consultation: Consultation }>>(
    `/consultation/${id}/reply`,
    { method: "POST", body: JSON.stringify({ text }) }
  );
}
