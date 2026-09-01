import { apiFetch } from "@/lib/http";
import type {
  ApiEnvelope,
  CreateNotificationPayload,
  Notification,
  UpdateNotificationPayload,
} from "@/types/api";





export function createNotification(payload: CreateNotificationPayload) {
  return apiFetch<ApiEnvelope<{ createdNotification: Notification }>>(
    "/notification",
    { method: "POST", body: JSON.stringify(payload) }
  );
}


export function updateNotification(id: string, payload: UpdateNotificationPayload) {
  return apiFetch<ApiEnvelope<{ updatedNotification: Notification }>>(
    `/notification/${id}`,
    { method: "PUT", body: JSON.stringify(payload) }
  );
}

// GET /notification  (doctor: all notifications they've sent)
export function getAllNotificationsForDoctor() {
  return apiFetch<ApiEnvelope<{ notifications: Notification[] }>>("/notification");
}

// GET /notification/:id  (doctor: single notification)
export function getNotificationByIdForDoctor(id: string) {
  return apiFetch<ApiEnvelope<{ notification: Notification }>>(
    `/notification/${id}`
  );
}

// DELETE /notification/:id  (doctor)
export function deleteNotificationForDoctor(id: string) {
  return apiFetch<ApiEnvelope<null>>(`/notification/${id}`, {
    method: "DELETE",
  });
}

// DELETE /notification  (doctor: clears everything they've sent)
export function deleteAllNotificationsForDoctor() {
  return apiFetch<ApiEnvelope<null>>("/notification", { method: "DELETE" });
}

// GET /notification/patient  (patient: all notifications addressed to them)
// Note: backend returns key "notification" (no 's') for this endpoint
export function getAllNotificationsForPatient() {
  return apiFetch<ApiEnvelope<{ notification: Notification[] }>>(
    "/notification/patient"
  );
}

// GET /notification/patient/:id  (patient: single notification)
export function getNotificationByIdForPatient(id: string) {
  return apiFetch<ApiEnvelope<{ notification: Notification }>>(
    `/notification/patient/${id}`
  );
}

// DELETE /notification/patient/:id  (patient)
export function deleteNotificationForPatient(id: string) {
  return apiFetch<ApiEnvelope<null>>(`/notification/patient/${id}`, {
    method: "DELETE",
  });
}

// DELETE /notification/patient  (patient: clears their whole inbox)
export function deleteAllNotificationsForPatient() {
  return apiFetch<ApiEnvelope<null>>("/notification/patient", {
    method: "DELETE",
  });
}
