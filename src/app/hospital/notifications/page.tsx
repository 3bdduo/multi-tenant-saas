"use client";

import { useEffect, useState } from "react";
import { getMyGeneralNotifications } from "@/lib/api/generalNotification";
import { Card } from "@/components/ui/Card";
import type { GeneralNotification } from "@/types/api";

export default function HospitalNotificationsPage() {
  const [notifications, setNotifications] = useState<GeneralNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState<GeneralNotification | null>(null);

  useEffect(() => {
    getMyGeneralNotifications()
      .then((res) => setNotifications(res.data.notifications ?? []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary">
          إشعارات وتنبيهات المستشفى
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          التنبيهات الإدارية وتحديثات نظام الطوارئ من إدارة المنصة
        </p>
      </div>

      <Card className="shadow-xl border-violet-500/20">
        <div className="border-b border-border/50 pb-4 mb-4">
          <h2 className="font-display text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
            <span>التنبيهات الإدارية ({notifications.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-border/40 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border/60">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => setSelectedNotif(n)}
                className="py-4 flex flex-col gap-1.5 cursor-pointer hover:bg-surface-raised/60 p-3 rounded-xl transition-all"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="rounded-full bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 text-[11px] font-bold text-violet-500">
                    تنبيه من إدارة المنصة
                  </span>
                  <span className="text-[10px] text-text-secondary opacity-60 font-mono">
                    {new Date(n.createdAt).toLocaleString("ar-EG")}
                  </span>
                </div>
                <p className="text-sm sm:text-base font-bold text-text-primary mt-1">{n.title}</p>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-2">
                  {n.message}
                </p>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="py-16 text-center flex flex-col items-center justify-center bg-surface-raised rounded-2xl border border-border/40 border-dashed">
                <div className="h-16 w-16 bg-border/50 rounded-full flex items-center justify-center text-text-secondary mb-3 opacity-60 text-2xl">
                  🔔
                </div>
                <p className="text-base font-bold text-text-primary">لا توجد إشعارات حالياً</p>
                <p className="text-xs text-text-secondary mt-1">ستظهر هنا أي تنبيهات أو توجيهات إدارية مرسلة للمستشفى.</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Modal */}
      {selectedNotif && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedNotif(null)}
        >
          <Card
            className="max-w-lg w-full shadow-2xl border-violet-500/30 bg-surface p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border/50 pb-4 mb-4">
              <div>
                <span className="inline-block rounded-full bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 text-[11px] font-extrabold text-violet-500 mb-2">
                  تنبيه إداري
                </span>
                <h3 className="font-display text-xl font-extrabold text-text-primary">
                  {selectedNotif.title}
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  {new Date(selectedNotif.createdAt).toLocaleString("ar-EG")}
                </p>
              </div>
              <button
                onClick={() => setSelectedNotif(null)}
                className="h-8 w-8 rounded-full bg-surface-raised flex items-center justify-center text-text-secondary hover:bg-danger/20 hover:text-danger transition-colors shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="py-3 min-h-[100px] bg-surface-raised rounded-2xl p-4 border border-border/40">
              <p className="text-sm sm:text-base leading-relaxed text-text-primary whitespace-pre-wrap">
                {selectedNotif.message}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedNotif(null)}
                className="rounded-xl bg-violet-500 hover:bg-violet-600 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-glow-purple"
              >
                إغلاق
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
