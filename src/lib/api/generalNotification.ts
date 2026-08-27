import { apiFetch } from "@/lib/http";
import type {
  ApiEnvelope,
  CreateGeneralNotificationPayload,
  GeneralNotification,
} from "@/types/api";

// POST /general-notification/doctor  (doctor sends a general notification)
export function createGeneralNotificationByDoctor(
  payload: CreateGeneralNotificationPayload
) {
  return apiFetch<ApiEnvelope<{ created: GeneralNotification }>>(
    "/general-notification/doctor",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

// POST /general-notification/admin  (admin sends a general notification)
export function createGeneralNotificationByAdmin(
  payload: CreateGeneralNotificationPayload
) {
  return apiFetch<ApiEnvelope<{ created: GeneralNotification }>>(
    "/general-notification/admin",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

// GET /general-notification  (get notifications for current user — any role)
export function getMyGeneralNotifications() {
  return apiFetch<ApiEnvelope<{ notifications: GeneralNotification[] }>>(
    "/general-notification"
  );
}
