"use client";

import { useState } from "react";
import { AssistantChatModal } from "@/components/AssistantChatModal";
import { IconChat } from "@/components/ui/icons";

/**
 * زرار عائم واحد بس بيفتح شات الذكاء الاصطناعي للتنقل في الموقع — مفيش أي
 * قائمة أيقونات ثابتة (رجوع/الرئيسية/حجز) زي المكوّن القديم، ده شات مباشر بس.
 */
export function AssistantFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="المساعد الذكي"
        className="pulse-ring-host h-14 w-14 rounded-full bg-primary text-surface shadow-glow-cyan flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 999999,
        }}
      >
        <IconChat className="w-6 h-6" />
      </button>

      {isOpen && <AssistantChatModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
