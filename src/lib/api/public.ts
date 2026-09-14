import { apiFetch } from "@/lib/http";
import type { ApiEnvelope, Clinic, QueueStatus } from "@/types/api";

export async function getPublicClinics() {
  return apiFetch<ApiEnvelope<{ clinics: Clinic[] }>>("/clinic");
}

export async function getPublicClinicById(id: string) {
  return apiFetch<ApiEnvelope<{ clinic: Clinic }>>(`/clinic/${id}`);
}

export async function getQueueStatus(clinicId: string, date: string) {
  return apiFetch<ApiEnvelope<QueueStatus>>(
    `/clinic/${clinicId}/queue-status?date=${date}`
  );
}


