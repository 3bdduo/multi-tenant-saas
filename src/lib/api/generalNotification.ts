import { apiFetch } from "@/lib/http";
import type {
  ApiEnvelope,
  CreateGeneralNotificationPayload,
  GeneralNotification,
} from "@/types/api";


export function createGeneralNotificationByDoctor(
  payload: CreateGeneralNotificationPayload
) {
  return apiFetch<ApiEnvelope<{ created: GeneralNotification }>>(
    "/general-notification/doctor",
    { method: "POST", body: JSON.stringify(payload) }
  );
}


export function createGeneralNotificationByAdmin(
  payload: CreateGeneralNotificationPayload
) {
  return apiFetch<ApiEnvelope<{ created: GeneralNotification }>>(
    "/general-notification/admin",
    { method: "POST", body: JSON.stringify(payload) }
  );
}


export function getMyGeneralNotifications() {
  return apiFetch<ApiEnvelope<{ notifications: GeneralNotification[] }>>(
    "/general-notification"
  );
}
