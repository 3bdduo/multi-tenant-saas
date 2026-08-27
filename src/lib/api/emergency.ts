import { apiFetch } from "@/lib/http";
import type { ApiEnvelope, EmergencyCase, CreateEmergencyCasePayload, TrackEmergencyCaseResponse } from "@/types/api";

// POST /emergency-case  (Public — anyone can create)
export function createEmergencyCase(payload: CreateEmergencyCasePayload) {
  return apiFetch<ApiEnvelope<{ createdEmergency: EmergencyCase }>>("/emergency-case", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}

// PUT /emergency-case/report/:caseCode  (Public — upload report image)
export function uploadEmergencyReport(caseCode: string, file: File) {
  const formData = new FormData();
  formData.append("image", file);
  return apiFetch<ApiEnvelope<{ result: unknown }>>(`/emergency-case/report/${caseCode}`, {
    method: "PUT",
    body: formData,
    auth: false,
  });
}

// GET /emergency-case/track/:caseCode  (Public — returns {status, interestedHospitalsCount} ONLY)
export function trackEmergencyCase(caseCode: string) {
  return apiFetch<ApiEnvelope<{ emergency: TrackEmergencyCaseResponse }>>(`/emergency-case/track/${caseCode}`, {
    auth: false,
  });
}

// DELETE /emergency-case/track/:caseCode  (Public — cancel by caseCode)
export function cancelEmergencyCase(caseCode: string) {
  return apiFetch<ApiEnvelope<null>>(`/emergency-case/track/${caseCode}`, {
    method: "DELETE",
    auth: false,
  });
}
