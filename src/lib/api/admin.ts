import { apiFetch } from "@/lib/http";
import type {
  Admin,
  ApiEnvelope,
  Clinic,
  DashboardStats,
  Doctor,
  Hospital,
  RenewDoctorSubscriptionPayload,
  RenewHospitalSubscriptionPayload,
} from "@/types/api";


// GET /admin/dash-board
export function getDashboard() {
  return apiFetch<ApiEnvelope<{ result: DashboardStats }>>("/admin/dash-board");
}

// PUT /admin
export function updateAdmin(payload: Partial<Admin>) {
  return apiFetch<ApiEnvelope<{ updatedAdmin: Admin }>>("/admin", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// GET /admin/profile
export function getAdminProfile() {
  return apiFetch<ApiEnvelope<{ admin: Admin }>>("/admin/profile");
}

// GET /admin/doctors
export function getDoctors() {
  return apiFetch<ApiEnvelope<{ doctors: Doctor[] }>>("/admin/doctors");
}

// GET /admin/doctors/:id
export function getDoctorById(id: string) {
  return apiFetch<ApiEnvelope<{ doctor: Doctor & { clinicId?: Clinic } }>>(
    `/admin/doctors/${id}`
  );
}

// GET /admin/clinics
export function getClinics() {
  return apiFetch<ApiEnvelope<{ clinics: Clinic[] }>>("/admin/clinics");
}

// GET /admin/clinics/:id
export function getClinicById(id: string) {
  return apiFetch<ApiEnvelope<{ clinic: Clinic }>>(`/admin/clinics/${id}`);
}

// PATCH /admin/doctors/:id/active  (renew subscription by N months)
export function renewDoctorSubscription(
  id: string,
  payload: RenewDoctorSubscriptionPayload
) {
  return apiFetch<ApiEnvelope<{ doctor: Doctor }>>(
    `/admin/doctors/${id}/active`,
    { method: "PATCH", body: JSON.stringify(payload) }
  );
}

// POST /admin/doctors (Create doctor manually by admin)
export function createDoctorByAdmin(payload: any) {
  return apiFetch<ApiEnvelope<{ doctor: Doctor }>>("/admin/doctors", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// DELETE /admin/doctors/:id
export function deleteDoctor(id: string) {
  return apiFetch<ApiEnvelope<null>>(`/admin/doctors/${id}`, {
    method: "DELETE",
  });
}

// DELETE /admin/patients/:id
export function deletePatient(id: string) {
  return apiFetch<ApiEnvelope<null>>(`/admin/patients/${id}`, {
    method: "DELETE",
  });
}

// ---- Hospital Admin APIs ----

// GET /admin/hospital  (list all hospitals)
export function getHospitals() {
  return apiFetch<ApiEnvelope<{ hospitals: Hospital[] }>>("/admin/hospital");
}

// GET /admin/hospital/:id  (hospital details)
export function getHospitalById(id: string) {
  return apiFetch<ApiEnvelope<{ hospital: Hospital }>>(`/admin/hospital/${id}`);
}

// PATCH /admin/hospital/:id/active  (renew hospital subscription)
export function renewHospitalSubscription(
  id: string,
  payload: RenewHospitalSubscriptionPayload
) {
  return apiFetch<ApiEnvelope<{ hospital: Hospital }>>(
    `/admin/hospital/${id}/active`,
    { method: "PATCH", body: JSON.stringify(payload) }
  );
}

// DELETE /admin/hospital/:id
export function deleteHospital(id: string) {
  return apiFetch<ApiEnvelope<null>>(`/admin/hospital/${id}`, {
    method: "DELETE",
  });
}

