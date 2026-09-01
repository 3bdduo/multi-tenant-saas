import { apiFetch } from "@/lib/http";
import type { ApiEnvelope, Clinic } from "@/types/api";


export async function getPublicClinics() {
  return apiFetch<ApiEnvelope<{ clinics: Clinic[] }>>("/clinic");
}


export async function getPublicClinicById(id: string) {
  return apiFetch<ApiEnvelope<{ clinic: Clinic }>>(`/clinic/${id}`);
}

// GET /clinic/:id/slots?date=YYYY-MM-DD  (public — no auth required)
// Only valid for bookingType="time" clinics. Returns array of available HH:mm slots.
export async function getPublicClinicSlots(clinicId: string, date: string) {
  return apiFetch<ApiEnvelope<{ availableSlots: string[] }>>(
    `/clinic/${clinicId}/slots?date=${date}`
  );
}
