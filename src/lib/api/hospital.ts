import { apiFetch } from "@/lib/http";
import type {
  ApiEnvelope,
  Hospital,
  EmergencyCase,
} from "@/types/api";

// GET /hospital  (hospital gets their own profile)
export function getMyHospital() {
  return apiFetch<ApiEnvelope<{ hospital: Hospital }>>("/hospital");
}

// PUT /hospital  (hospital updates their own profile)
export function updateMyHospital(payload: Partial<Hospital>) {
  return apiFetch<ApiEnvelope<{ updatedHospital: Hospital }>>("/hospital", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// GET /emergency-case  (all open cases — Hospital only)
export function getEmergencyCases() {
  return apiFetch<ApiEnvelope<{ emergencies: EmergencyCase[] }>>("/emergency-case");
}

// GET /emergency-case/:id
export function getEmergencyCaseById(id: string) {
  return apiFetch<ApiEnvelope<{ emergency: EmergencyCase }>>(`/emergency-case/${id}`);
}

// PATCH /emergency-case/:id/claim
export function claimEmergencyCase(id: string) {
  return apiFetch<ApiEnvelope<{ emergency: EmergencyCase }>>(`/emergency-case/${id}/claim`, {
    method: "PATCH",
  });
}

// PATCH /emergency-case/:id/resolve
export function resolveEmergencyCase(id: string) {
  return apiFetch<ApiEnvelope<{ emergency: EmergencyCase }>>(`/emergency-case/${id}/resolve`, {
    method: "PATCH",
  });
}
