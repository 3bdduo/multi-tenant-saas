import { apiFetch } from "@/lib/http";
import type {
  ApiEnvelope,
  Appointment,
  CreateAppointmentByDoctorPayload,
  CreateAppointmentByPatientPayload,
  DeleteAppointmentPayload,
  UpdateAppointmentPayload,
} from "@/types/api";


export function createAppointmentByPatient(
  payload: CreateAppointmentByPatientPayload
) {
  return apiFetch<ApiEnvelope<{ createdAppointment: Appointment }>>(
    "/appointment/patient",
    { method: "POST", body: JSON.stringify(payload) }
  );
}


export function createAppointmentByDoctor(
  patientId: string,
  payload: CreateAppointmentByDoctorPayload
) {
  return apiFetch<ApiEnvelope<{ createdAppointment: Appointment }>>(
    `/appointment/doctor/${patientId}`,
    { method: "POST", body: JSON.stringify(payload) }
  );
}

// DELETE /appointment/:id  (patient cancels appointment)
export function deleteAppointment(id: string, payload?: DeleteAppointmentPayload) {
  return apiFetch<ApiEnvelope<null>>(`/appointment/${id}`, {
    method: "DELETE",
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
}

// GET /appointment (doctor) or /appointment/patient (patient)
export async function getMyAppointments() {
  try {
    return await apiFetch<ApiEnvelope<{ appointments: Appointment[] }>>("/appointment");
  } catch {
    return await apiFetch<ApiEnvelope<{ appointments: Appointment[] }>>("/appointment/patient");
  }
}

// GET /appointment/patient (patient all appointments)
export function getMyAppointmentsForPatient() {
  return apiFetch<ApiEnvelope<{ appointments: Appointment[] }>>("/appointment/patient");
}

// GET /appointment/:id (doctor gets single appointment)
export function getAppointmentById(id: string) {
  return apiFetch<ApiEnvelope<{ appointment: Appointment }>>(
    `/appointment/${id}`
  );
}

// PUT /appointment/:id (doctor updates status / details)
export function updateAppointment(id: string, payload: UpdateAppointmentPayload) {
  return apiFetch<ApiEnvelope<{ appointment: Appointment }>>(
    `/appointment/${id}`,
    { method: "PUT", body: JSON.stringify(payload) }
  );
}

// PUT /appointment/patient/:id (patient uploads attachment image)
export function uploadAppointmentImage(id: string, file: File) {
  const form = new FormData();
  form.append("image", file);
  return apiFetch<ApiEnvelope<{ appointment: Appointment }>>(`/appointment/patient/${id}`, {
    method: "PUT",
    body: form,
  });
}
