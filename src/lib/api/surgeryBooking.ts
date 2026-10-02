import { apiFetch } from "@/lib/http";
import type { ApiEnvelope, SurgeryBooking } from "@/types/api";

export function createSurgeryBooking(
  files: File[],
  data: { title: string; description?: string }
) {
  const form = new FormData();
  files.forEach((f) => form.append("reports", f));
  form.append("title", data.title);
  if (data.description) form.append("description", data.description);

  return apiFetch<ApiEnvelope<{ booking: SurgeryBooking }>>("/surgery-booking", {
    method: "POST",
    body: form,
    headers: {},
  });
}

export function getMySurgeryBookings() {
  return apiFetch<ApiEnvelope<{ bookings: SurgeryBooking[] }>>("/surgery-booking/mine");
}

export function getAllSurgeryBookingsForProviders() {
  return apiFetch<ApiEnvelope<{ bookings: SurgeryBooking[] }>>("/surgery-booking");
}

export function getSurgeryBookingById(id: string) {
  return apiFetch<ApiEnvelope<{ booking: SurgeryBooking }>>(`/surgery-booking/${id}`);
}

export function acceptSurgeryBooking(id: string) {
  return apiFetch<ApiEnvelope<{ booking: SurgeryBooking }>>(`/surgery-booking/${id}/accept`, {
    method: "PATCH",
  });
}

export function completeSurgeryBooking(id: string) {
  return apiFetch<ApiEnvelope<{ booking: SurgeryBooking }>>(`/surgery-booking/${id}/complete`, {
    method: "PATCH",
  });
}

export function cancelSurgeryBooking(id: string) {
  return apiFetch<ApiEnvelope<{ booking: SurgeryBooking }>>(`/surgery-booking/${id}/cancel`, {
    method: "PATCH",
  });
}
