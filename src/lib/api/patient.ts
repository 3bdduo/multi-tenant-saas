import { apiFetch } from "@/lib/http";
import type { ApiEnvelope, Patient } from "@/types/api";


export function getMyProfile() {
  return apiFetch<ApiEnvelope<{ patient: Patient }>>("/patient");
}


export function lookupPatientByNationalId(nationalId: string) {
  return apiFetch<ApiEnvelope<{ patient: Patient | null }>>(
    `/patient/lookup/${nationalId}`
  );
}

// GET /patient/my-patients  (doctor's patient list)
export function getMyPatients() {
  return apiFetch<ApiEnvelope<{ patients: Patient[] }>>("/patient/my-patients");
}

// GET /patient/my-patient/:id  (doctor viewing one of their patients)
export function getMyPatientById(id: string) {
  return apiFetch<ApiEnvelope<{ result: Patient }>>(`/patient/my-patient/${id}`);
}

// PUT /patient  (patient updates own profile)
export function updateMe(payload: Partial<Patient>) {
  return apiFetch<ApiEnvelope<{ updatedPatient: Patient }>>("/patient", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// PUT /patient/:id  (doctor updates a patient's record)
export function updatePatientByDoctor(id: string, payload: Partial<Patient>) {
  return apiFetch<ApiEnvelope<{ updatedPatient: Patient }>>(`/patient/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
