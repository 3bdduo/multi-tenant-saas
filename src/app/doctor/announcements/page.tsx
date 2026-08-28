"use client";

import { useState, useEffect } from "react";
import { DoctorActivationBanner } from "@/components/DoctorActivationBanner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  createGeneralNotificationByDoctor,
  getMyGeneralNotifications,
} from "@/lib/api/generalNotification";
import { ApiError } from "@/lib/http";
import type { GeneralNotification } from "@/types/api";

export default function ClinicAnnouncementsPage() {
  const [notifications, setNotifications] = useState<GeneralNotification[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function loadNotifications() {
    try {
      setLoading(true);
      const res = await getMyGeneralNotifications();
      setNotifications(res.data.notifications ?? []);
    } catch {
      // silently fail — might be empty
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      await createGeneralNotificationByDoctor({ title: title.trim(), message: message.trim() });
      setTitle("");
      setMessage("");
      setSuccessMsg("تم إرسال الإشعار بنجاح");
      await loadNotifications();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر إرسال الإشعار");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <DoctorActivationBanner />

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-text-primary">
          إدارة الإشعارات والتنبيهات للمرضى
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          أضف إشعاراً أو تنبيهاً عاماً يُرسَل عبر النظام إلى مرضاك تلقائياً
        </p>
      </div>

      {/* Add Form */}
      <Card glass vibrant className="max-w-2xl border-primary/20 p-6 md:p-8 shadow-2xl">
        <h2 className="font-display text-lg font-bold text-text-primary mb-4">
          إضافة إشعار جديد
        </h2>

        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-text-primary mb-1.5">
              عنوان الإشعار *
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تنويه مهم"
              className="w-full rounded-xl border border-border/80 bg-surface px-4 py-2.5 text-sm outline-none transition-all focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary mb-1.5">
              نص الإشعار *
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="مثال: العيادة مغلقة في الإجازات الرسمية..."
              className="w-full rounded-xl border border-border/80 bg-surface px-4 py-2.5 text-sm outline-none transition-all focus:border-primary"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-xs font-bold text-danger">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="rounded-xl bg-success/10 border border-success/20 p-3 text-xs font-bold text-success">
              {successMsg}
            </div>
          )}

          <Button
            type="submit"
            variant="vibrant"
            disabled={submitting}
            className="mt-2 font-bold shadow-glow-cyan"
          >
            {submitting ? "جارٍ الإرسال..." : "+ إرسال الإشعار"}
          </Button>
        </form>
      </Card>

      {/* List */}
      <Card className="max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-bold text-text-primary">
            الإشعارات المُرسَلة ({notifications.length})
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={loadNotifications}
            disabled={loading}
          >
            {loading ? "..." : "تحديث"}
          </Button>
        </div>

        <div className="flex flex-col divide-y divide-border/60">
          {notifications.map((n) => (
            <div key={n._id} className="flex flex-col gap-1 py-4">
              <p className="text-sm font-bold text-text-primary">{n.title}</p>
              <p className="text-sm text-text-secondary">{n.message}</p>
              <span className="text-[11px] text-text-secondary">
                {new Date(n.createdAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}

          {!loading && notifications.length === 0 && (
            <p className="py-8 text-center text-sm text-text-secondary">
              لا توجد إشعارات مُرسَلة حتى الآن
            </p>
          )}
          {loading && (
            <div className="py-8 flex justify-center">
              <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
