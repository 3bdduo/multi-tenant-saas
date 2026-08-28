"use client";

import { useEffect, useState } from "react";
import {
  deleteAllNotificationsForPatient,
  deleteNotificationForPatient,
  getAllNotificationsForPatient,
  getNotificationByIdForPatient,
} from "@/lib/api/notification";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import type { Notification } from "@/types/api";

export default function PatientNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete All state
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  // Open single notification state (for full screen reading if needed)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await getAllNotificationsForPatient();
      setNotifications(res.data.notification ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleOpenNotification(n: Notification) {
    setSelectedNotification(n);

    // If it's not marked as read locally yet, trigger the API to mark it as read
    if (n.isRead !== true) {
      // Optimistic update locally
      setNotifications((prev) =>
        prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
      );

      try {
        // Fetching it by ID automatically marks it as read in the backend as per workflow
        await getNotificationByIdForPatient(n._id);
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    }
  }

  async function remove(e: React.MouseEvent, id: string) {
    e.stopPropagation(); // Prevent opening the notification if delete is clicked
    
    // Optimistic UI update
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    
    try {
      await deleteNotificationForPatient(id);
    } catch (err) {
      // Revert if failed
      load();
      alert(err instanceof ApiError ? err.message : "تعذّر حذف الإشعار");
    }
  }

  async function handleClearAll() {
    setDeletingAll(true);
    try {
      await deleteAllNotificationsForPatient();
      setNotifications([]);
      setShowDeleteAllModal(false);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "تعذّر مسح الإشعارات");
    } finally {
      setDeletingAll(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-3xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">
            صندوق الإشعارات
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            رسائل وتنبيهات مرسلة لك مباشرة من أطبائك المعالجين
          </p>
        </div>
      </div>

      <Card className="shadow-xl border-primary/10">
        <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
          <h2 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
            <span></span>
            <span>أحدث الإشعارات</span>
          </h2>
          
          {notifications.length > 0 && (
            <Button size="sm" variant="danger" onClick={() => setShowDeleteAllModal(true)}>
              مسح الكل
            </Button>
          )}
        </div>
        
        {loading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-border/40 rounded-xl" />)}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((n) => {
              const isUnread = n.isRead === false || n.isRead === undefined;
              
              return (
                <div 
                  key={n._id} 
                  onClick={() => handleOpenNotification(n)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                    isUnread 
                      ? "bg-primary/5 border-primary/30 shadow-sm" 
                      : "bg-surface-raised border-border/40 hover:bg-border/30"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isUnread && (
                        <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-glow-cyan animate-pulse"></span>
                      )}
                      <p className={`text-base ${isUnread ? "font-extrabold text-primary" : "font-bold text-text-primary"}`}>
                        {n.title}
                      </p>
                    </div>
                    <p className={`text-sm ${isUnread ? "text-text-primary font-medium" : "text-text-secondary"}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-text-secondary mt-2 opacity-70">
                      {new Date(n.createdAt).toLocaleString("ar-EG")}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-danger hover:bg-danger/10 hover:text-danger rounded-full h-10 w-10 p-0 flex items-center justify-center" 
                      onClick={(e) => remove(e, n._id)}
                      title="حذف الإشعار"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {notifications.length === 0 && (
              <div className="py-12 text-center flex flex-col items-center justify-center bg-surface-raised rounded-xl border border-border/40 border-dashed">
                <div className="h-16 w-16 bg-border/50 rounded-full flex items-center justify-center text-text-secondary mb-4 opacity-50">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <p className="text-base font-bold text-text-secondary">لا توجد إشعارات حالياً</p>
                <p className="text-xs text-text-secondary mt-1">ستظهر هنا أي رسائل أو تنبيهات تُرسل إليك.</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Selected Notification Reading Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedNotification(null)}>
          <Card className="max-w-md w-full shadow-2xl border-primary/20 bg-surface" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-border/50 pb-4 mb-4">
              <div>
                <h3 className="font-display text-xl font-extrabold text-primary">
                  {selectedNotification.title}
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  {new Date(selectedNotification.createdAt).toLocaleString("ar-EG")}
                </p>
              </div>
              <button 
                onClick={() => setSelectedNotification(null)}
                className="h-8 w-8 rounded-full bg-border/50 flex items-center justify-center text-text-secondary hover:bg-danger/20 hover:text-danger transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="py-2 min-h-[100px]">
              <p className="text-base leading-relaxed text-text-primary whitespace-pre-wrap">
                {selectedNotification.message}
              </p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedNotification(null)}>
                إغلاق
              </Button>
            </div>
          </Card>
        </div>
      )}

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
                  سيتم حذف <strong>جميع الإشعارات</strong> من صندوق الوارد نهائياً ولا يمكن التراجع عن هذا الإجراء.
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
