import { apiFetch } from "@/lib/http";
import type { ApiEnvelope } from "@/types/api";

export function chatWithAssistant(message: string, role?: string) {
  return apiFetch<ApiEnvelope<{ reply: string; route: string | null }>>(
    "/assistant/chat",
    { method: "POST", body: JSON.stringify({ message, role }), auth: false }
  );
}
