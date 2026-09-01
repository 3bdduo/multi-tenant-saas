"use client";

import { useEffect, useMemo, useState } from "react";
import {
  deleteAllNotificationsForPatient,
  deleteNotificationForPatient,
  getAllNotificationsForPatient,
  getNotificationByIdForPatient,
} from "@/lib/api/notification";
import { getMyGeneralNotifications } from "@/lib/api/generalNotification";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import type { GeneralNotification, Notification } from "@/types/api";

type FilterType = "all" | "direct" | "general";

interface UnifiedNotification {
  _id: string;
  type: "direct" | "general";
  title: string;
  message: string;
  senderLabel: string;
  createdAt: string;
  isRead?: boolean;
  rawDirect?: Notification;
  rawGeneral?: GeneralNotification;
}

export default function PatientNotificationsPage() {
  const [directList, setDirectList] = useState<Notification[]>([]);
  const [generalList, setGeneralList] = useState<GeneralNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  
  const [selectedNotification, setSelectedNotification] = useState<UnifiedNotification | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      
      const directRes = await getAllNotificationsForPatient().catch(() => ({ data: { notification: [] } }));
      setDirectList(directRes.data.notification ?? []);

      
      const generalRes = await getMyGeneralNotifications().catch(() => ({ data: { notifications: [] } }));
      setGeneralList(generalRes.data.notifications ?? []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  
  const unifiedList = useMemo(() => {
    const list: UnifiedNotification[] = [];

    
    for (const d of directList) {
      let docName = "طبيبك المعالج";
      if (typeof d.doctorId === "object" && d.doctorId !== null) {
        docName = `د. ${d.doctorId.firstName || ""} ${d.doctorId.lastName || ""}`.trim();
      }
      list.push({
        _id: d._id,
        type: "direct",
        title: d.title || "إشعار من الطبيب",
        message: d.message,
        senderLabel: docName,
        createdAt: d.createdAt,
        isRead: d.isRead ?? false,
        rawDirect: d,
      });
    }

    // Map general notifications
    for (const g of generalList) {
      let sender = "العيادة / الإدارة";
      if (typeof g.createdBy === "object" && g.createdBy !== null) {
        sender = `${g.createdBy.role === "Doctor" ? "د. " : ""}${g.createdBy.firstName || ""} ${g.createdBy.lastName || ""}`.trim();
      } else if (g.createdByModel === "Doctor") {
        sender = "العيادة الطبية";
      }
      list.push({
        _id: g._id,
        type: "general",
        title: g.title || "تنبيه عام",
        message: g.message,
        senderLabel: sender,
        createdAt: g.createdAt,
        isRead: true, // general announcements don't have personal unread state
        rawGeneral: g,
      });
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return list;
  }, [directList, generalList]);

  // Filtered by selected tab
  const filteredList = useMemo(() => {
    if (filter === "direct") return unifiedList.filter((n) => n.type === "direct");
    if (filter === "general") return unifiedList.filter((n) => n.type === "general");
    return unifiedList;
  }, [unifiedList, filter]);

  // Handle open & mark direct notification as read
  async function handleOpenNotification(n: UnifiedNotification) {
    setSelectedNotification(n);

    if (n.type === "direct" && !n.isRead) {
      // Optimistic update locally
      setDirectList((prev) =>
        prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
      );

      try {
        await getNotificationByIdForPatient(n._id);
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
  }

  // Delete direct notification
  async function removeDirect(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setDirectList((prev) => prev.filter((n) => n._id !== id));

    try {
      await deleteNotificationForPatient(id);
    } catch (err) {
      loadData();
      alert(err instanceof ApiError ? err.message : "تعذّر حذف الإشعار");
    }
  }

  // Delete all direct notifications
  async function handleClearAllDirect() {
    setDeletingAll(true);
    try {
      await deleteAllNotificationsForPatient();
      setDirectList([]);
      setShowDeleteAllModal(false);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "تعذّر مسح الإشعارات");
    } finally {
      setDeletingAll(false);
    }
  }

  const unreadDirectCount = directList.filter((d) => !d.isRead).length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary">
            صندوق الإشعارات والتنبيهات
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            جميع الرسائل والتوجيهات المرسلة لك من أطبائك المعالجين وإعلانات العيادات
          </p>
        </div>

        {unreadDirectCount > 0 && (
          <div className="inline-flex items-center gap-2 rounded-2xl bg-primary/10 border border-primary/30 px-4 py-2 text-xs font-bold text-primary self-start md:self-auto">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-glow-cyan" />
            لديك {unreadDirectCount} إشعار جديد لم يُقرأ
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <Card glass vibrant className="p-1.5 sm:p-2">
        <div className="grid grid-cols-3 gap-2 text-center">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold transition-all duration-200 ${
              filter === "all"
                ? "bg-primary text-surface shadow-glow-cyan"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            <span>الكل</span>
            <span className="text-[11px] opacity-80 font-mono">({unifiedList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("direct")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold transition-all duration-200 ${
              filter === "direct"
                ? "bg-primary text-surface shadow-glow-cyan"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            <span>رسائل الطبيب الخاصة</span>
            <span className="text-[11px] opacity-80 font-mono">({directList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("general")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold transition-all duration-200 ${
              filter === "general"
                ? "bg-primary text-surface shadow-glow-cyan"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            <span>تنبيهات عامة</span>
            <span className="text-[11px] opacity-80 font-mono">({generalList.length})</span>
          </button>
        </div>
      </Card>

      {/* Notifications List Container */}
      <Card className="shadow-xl">
        <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
          <h2 className="font-display text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
            <span>سجل الإشعارات</span>
          </h2>

          {directList.length > 0 && filter !== "general" && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => setShowDeleteAllModal(true)}
              className="text-xs font-bold"
            >
              مسح الرسائل الخاصة
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-border/40 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredList.map((n) => {
              const isDirect = n.type === "direct";
              const isUnread = isDirect && !n.isRead;

              return (
                <div
                  key={`${n.type}-${n._id}`}
                  onClick={() => handleOpenNotification(n)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                    isUnread
                      ? "bg-primary/10 border-primary/40 shadow-glow-cyan/10"
                      : "bg-surface-raised border-border/50 hover:border-primary/40 hover:bg-surface"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      {isUnread && (
                        <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-glow-cyan animate-pulse" />
                      )}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold border ${
                          isDirect
                            ? "bg-primary/15 text-primary border-primary/30"
                            : "bg-accent/15 text-accent border-accent/30"
                        }`}
                      >
                        {isDirect ? `رسالة خاصة: ${n.senderLabel}` : `تنبيه عام: ${n.senderLabel}`}
                      </span>
                      <span className="text-[10px] text-text-secondary opacity-60 font-mono">
                        {new Date(n.createdAt).toLocaleString("ar-EG")}
                      </span>
                    </div>

                    <p className={`text-sm sm:text-base ${isUnread ? "font-extrabold text-primary" : "font-bold text-text-primary"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs sm:text-sm text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 justify-end shrink-0 pt-2 sm:pt-0 border-t border-border/40 sm:border-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleOpenNotification(n)}
                    >
                      عرض التفاصيل
                    </Button>

                    {isDirect && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger hover:bg-danger/10 hover:text-danger rounded-xl p-2 text-xs"
                        onClick={(e) => removeDirect(e, n._id)}
                        title="حذف الإشعار"
                      >
                        حذف
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredList.length === 0 && (
              <div className="py-16 text-center flex flex-col items-center justify-center bg-surface-raised rounded-2xl border border-border/40 border-dashed">
                <div className="h-14 w-14 bg-border/50 rounded-full flex items-center justify-center text-text-secondary mb-3 opacity-60">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-base font-bold text-text-primary">لا توجد إشعارات في هذا القسم</p>
                <p className="text-xs text-text-secondary mt-1">ستظهر هنا أي رسائل أو تنبيهات تُرسل إليك فوراً.</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Full Modal Viewer for Notification */}
      {selectedNotification && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedNotification(null)}
        >
          <Card
            className="max-w-lg w-full shadow-2xl border-primary/30 bg-surface p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border/50 pb-4 mb-4">
              <div>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-extrabold border mb-2 ${
                    selectedNotification.type === "direct"
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "bg-accent/15 text-accent border-accent/30"
                  }`}
                >
                  {selectedNotification.type === "direct"
                    ? `رسالة خاصة من: ${selectedNotification.senderLabel}`
                    : `تنبيه عام من: ${selectedNotification.senderLabel}`}
                </span>
                <h3 className="font-display text-xl font-extrabold text-text-primary">
                  {selectedNotification.title}
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  {new Date(selectedNotification.createdAt).toLocaleString("ar-EG")}
                </p>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="h-8 w-8 rounded-full bg-surface-raised flex items-center justify-center text-text-secondary hover:bg-danger/20 hover:text-danger transition-colors shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="py-3 min-h-[120px] bg-surface-raised rounded-2xl p-4 border border-border/40">
              <p className="text-sm sm:text-base leading-relaxed text-text-primary whitespace-pre-wrap">
                {selectedNotification.message}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="vibrant" onClick={() => setSelectedNotification(null)} className="shadow-glow-cyan font-bold">
                تم، إغلاق النافذة
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete All Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="max-w-md w-full shadow-2xl border-danger/30 bg-surface p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger text-3xl font-black">
                !
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-text-primary">
                  هل أنت متأكد؟
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
                  سيتم حذف <strong>جميع الرسائل الخاصة</strong> من صندوق الوارد نهائياً ولا يمكن التراجع عن هذا الإجراء.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-4">
                <Button
                  variant="danger"
                  className="flex-1 font-bold"
                  onClick={handleClearAllDirect}
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
