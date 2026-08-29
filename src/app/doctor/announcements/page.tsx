"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AnnouncementsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/doctor/notifications?tab=general");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <p className="text-xs text-text-secondary">جارٍ التحويل إلى مركز الإشعارات والتنبيهات...</p>
      </div>
    </div>
  );
}
