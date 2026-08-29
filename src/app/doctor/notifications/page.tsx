"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createNotification,
  deleteAllNotificationsForDoctor,
  deleteNotificationForDoctor,
  getAllNotificationsForDoctor,
  updateNotification,
} from "@/lib/api/notification";
import { Card } from "@/components/ui/Card";
import { Field, TextAreaField } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import type { Notification } from "@/types/api";

export default function DoctorNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [patientId, setPatientId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete All state
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await getAllNotificationsForDoctor();
      setNotifications(res.data.notifications ?? []);
    } catch (err) {
      // In case of 403 or other errors
      setError(err instanceof ApiError ? err.message : "تعذّر تحميل الإشعارات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await createNotification({ patientId, title, message });
      const newNotif = res.data.createdNotification;
      
      // Optimistic list update (prepend)
      setNotifications((prev) => [newNotif, ...prev]);

      setPatientId("");
      setTitle("");
      setMessage("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر إرسال الإشعار");
    } finally {
      setSending(false);
    }
  }

  function startEdit(n: Notification) {
    setEditingId(n._id);
    setEditTitle(n.title ?? "");
    setEditMessage(n.message ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditMessage("");
  }

  async function handleSaveEdit(id: string) {
    if (!editMessage.trim()) return;
    setSavingEdit(true);
    try {
      const res = await updateNotification(id, { title: editTitle, message: editMessage });
      const updated = res.data.updatedNotification;
      
      // Update locally
      setNotifications((prev) => prev.map((n) => (n._id === id ? updated : n)));
      cancelEdit();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "تعذّر تعديل الإشعار");
    } finally {
      setSavingEdit(false);
    }
  }

  async function remove(id: string) {
    // Optimistic UI update
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    
    try {
      await deleteNotificationForDoctor(id);
    } catch (err) {
      // Revert if failed (simple reload for reliability)
      load();
      alert(err instanceof ApiError ? err.message : "تعذّر حذف الإشعار");
    }
  }

  async function handleClearAll() {
    setDeletingAll(true);
    try {
      await deleteAllNotificationsForDoctor();
      setNotifications([]);
      setShowDeleteAllModal(false);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "تعذّر مسح الإشعارات");
    } finally {
      setDeletingAll(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in relative">
      <Card className="max-w-xl shadow-xl border-primary/20">
        <h2 className="font-display text-lg font-bold text-text-primary mb-2">
          إرسال إشعار لمريض
        </h2>
        <p className="text-xs text-text-secondary mb-4">
          أرسل رسالة مباشرة لمريض محدد تظهر له في صندوق إشعاراته فوراً.
        </p>

        <form onSubmit={handleSend} className="flex flex-col gap-4">
          <Field
            label="معرّف المريض (Patient ID)"
            required
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="مثال: 64b8f..."
          />
          <Field
            label="عنوان الإشعار"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: تذكير بموعد الكشف"
          />
          <TextAreaField
            label="محتوى الرسالة"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="اكتب رسالتك للمريض هنا..."
          />
          {error && (
            <p className="rounded-xl bg-danger/10 px-4 py-3 text-xs font-bold text-danger border border-danger/20">
              {error}
            </p>
          )}
          <Button type="submit" variant="vibrant" disabled={sending} className="shadow-glow-cyan font-bold">
            {sending ? "جارٍ الإرسال..." : "إرسال الإشعار"}
          </Button>
        </form>
      </Card>

      <Card className="shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4 mb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-text-primary">
              الإشعارات المُرسلة
            </h2>
            <p className="text-xs text-text-secondary mt-1">سجل بجميع الإشعارات التي أرسلتها للمرضى</p>
          </div>
          
          {notifications.length > 0 && (
            <Button size="sm" variant="danger" onClick={() => setShowDeleteAllModal(true)} className="self-start sm:self-auto">
              مسح الكل
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            {[1, 2].map((i) => <div key={i} className="h-20 bg-border/40 rounded-xl" />)}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border/60">
            {notifications.map((n) => (
              <div key={n._id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 py-4 transition-all">
                {editingId === n._id ? (
                  // Edit Mode
                  <div className="flex-1 flex flex-col gap-3 bg-surface-raised p-4 rounded-xl border border-primary/30">
                    <Field
                      label="العنوان"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="bg-surface"
                    />
                    <TextAreaField
                      label="الرسالة"
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      className="bg-surface"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="vibrant" disabled={savingEdit} onClick={() => handleSaveEdit(n._id)}>
                        {savingEdit ? "حفظ..." : "حفظ التعديل"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-primary">{n.title}</p>
                      <p className="text-sm text-text-secondary mt-1 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-text-secondary mt-2 opacity-60">
                        {new Date(n.createdAt).toLocaleString("ar-EG")} • لمريض: {typeof n.patientId === 'object' ? n.patientId._id : n.patientId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0 shrink-0 self-end sm:self-auto">
                      <Button size="sm" variant="outline" onClick={() => startEdit(n)}>
                        تعديل
                      </Button>
                      <Button size="sm" variant="ghost" className="text-danger hover:bg-danger/10 hover:text-danger" onClick={() => remove(n._id)}>
                        حذف
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {notifications.length === 0 && (
              <p className="py-8 text-center text-sm text-text-secondary bg-surface-raised rounded-xl border border-border/40 border-dashed">
                لم ترسل أي إشعارات بعد.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Delete All Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="max-w-md w-full shadow-2xl border-danger/30 bg-surface">
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger text-3xl font-black">
                !
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-text-primary">
                  هل أنت متأكد؟
                </h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                  سيتم حذف <strong>جميع الإشعارات</strong> التي أرسلتها نهائياً ولا يمكن التراجع عن هذا الإجراء.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-4">
                <Button 
                  variant="danger" 
                  className="flex-1 font-bold" 
                  onClick={handleClearAll}
                  disabled={deletingAll}
                >
                  {deletingAll ? "جارٍ الحذف..." : "نعم، احذف الكل"}
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex-1 font-bold" 
                  onClick={() => setShowDeleteAllModal(false)}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
