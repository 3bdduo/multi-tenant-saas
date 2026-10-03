import { apiFetch } from "@/lib/http";
import type {
  ApiEnvelope,
  Hospital,
  EmergencyCase,
} from "@/types/api";


export function getMyHospital() {
  return apiFetch<ApiEnvelope<{ hospital: Hospital }>>("/hospital");
}


export function updateMyHospital(payload: Partial<Hospital>) {
  return apiFetch<ApiEnvelope<{ updatedHospital: Hospital }>>("/hospital", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}


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

// PATCH /emergency-case/:id/accept (قبول حصري — دي اللي المفروض تتستخدم دلوقتي بدل claim)
export function acceptEmergencyCase(id: string) {
  return apiFetch<ApiEnvelope<{ emergency: EmergencyCase }>>(`/emergency-case/${id}/accept`, {
    method: "PATCH",
  });
}

// PATCH /emergency-case/:id/resolve
export function resolveEmergencyCase(id: string) {
  return apiFetch<ApiEnvelope<{ emergency: EmergencyCase }>>(`/emergency-case/${id}/resolve`, {
    method: "PATCH",
  });
}
