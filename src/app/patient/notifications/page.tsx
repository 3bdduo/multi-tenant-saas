"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getAllNotificationsForPatient,
  getNotificationByIdForPatient,
} from "@/lib/api/notification";
import { getMyGeneralNotifications } from "@/lib/api/generalNotification";
import { getMyProfile } from "@/lib/api/patient";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { GeneralNotification, Notification, Patient } from "@/types/api";

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
  const [patientProfile, setPatientProfile] = useState<Patient | null>(null);
  const [directList, setDirectList] = useState<Notification[]>([]);
  const [generalList, setGeneralList] = useState<GeneralNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  // Modal inspection
  const [selectedNotification, setSelectedNotification] = useState<UnifiedNotification | null>(null);

  async function loadData(isManual = false) {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    setAuthError(null);

    try {
      // 0. Fetch patient profile for account context
      getMyProfile()
        .then((res) => {
          if (res.data?.patient) {
            setPatientProfile(res.data.patient);
          }
        })
        .catch(() => {});

      // 1. Direct doctor-to-patient notifications
      let directItems: Notification[] = [];
      try {
        const directRes = await getAllNotificationsForPatient();
        const dData = (directRes as any)?.data;
        if (Array.isArray(dData)) {
          directItems = dData;
        } else if (Array.isArray(dData?.notification)) {
          directItems = dData.notification;
        } else if (Array.isArray(dData?.notifications)) {
          directItems = dData.notifications;
        } else if (Array.isArray((directRes as any)?.notification)) {
          directItems = (directRes as any).notification;
        } else if (Array.isArray((directRes as any)?.notifications)) {
          directItems = (directRes as any).notifications;
        }
      } catch (err: any) {
        console.error("[Patient Notifications] Direct error:", err);
        if (err?.status === 401) {
          setAuthError("انتهت جلسة تسجيل الدخول — يرجى تسجيل الدخول بحساب المريض لعرض الإشعارات.");
        }
      }
      setDirectList(directItems);

      // 2. General clinic announcements
      let generalItems: GeneralNotification[] = [];
      try {
        const generalRes = await getMyGeneralNotifications();
        const gData = (generalRes as any)?.data;
        if (Array.isArray(gData)) {
          generalItems = gData;
        } else if (Array.isArray(gData?.notifications)) {
          generalItems = gData.notifications;
        } else if (Array.isArray(gData?.notification)) {
          generalItems = gData.notification;
        } else if (Array.isArray((generalRes as any)?.notifications)) {
          generalItems = (generalRes as any).notifications;
        } else if (Array.isArray((generalRes as any)?.notification)) {
          generalItems = (generalRes as any).notification;
        }
      } catch (err: any) {
        console.error("[Patient Notifications] General error:", err);
      }
      setGeneralList(generalItems);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Merge and sort
  const unifiedList = useMemo(() => {
    const list: UnifiedNotification[] = [];

    // Map direct
    for (const d of directList) {
      let docName = "طبيبك المعالج";
      if (typeof d.doctorId === "object" && d.doctorId !== null) {
        const docObj = d.doctorId as any;
        docName = `د. ${docObj.firstName || ""} ${docObj.lastName || ""}`.trim();
      }
      list.push({
        _id: d._id,
        type: "direct",
        title: d.title || "إشعار خاص من الطبيب",
        message: d.message,
        senderLabel: docName,
        createdAt: d.createdAt,
        isRead: d.isRead ?? false,
        rawDirect: d,
      });
    }

    // Map general notifications
    for (const g of generalList) {
      let sender = "إدارة العيادة";
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
        isRead: true, // general broadcasts don't have individual unread flag
        rawGeneral: g,
      });
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return list;
  }, [directList, generalList]);

  // Filtered list
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

  const unreadDirectCount = directList.filter((d) => !d.isRead).length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary">
            صندوق الإشعارات والتنبيهات
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            جميع التوجيهات والرسائل الواردة من طبيبك المعالج والتنبيهات العامة للعيادة
          </p>

          {/* Current Logged-in Patient Badge */}
          {patientProfile && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-surface-raised border border-border/60 px-3 py-1 text-xs text-text-secondary">
              <span className="font-bold text-text-primary">الحساب الحالي:</span>
              <span>{patientProfile.firstName} {patientProfile.lastName}</span>
              {patientProfile.nationalId && (
                <span className="opacity-70 font-mono">[{patientProfile.nationalId}]</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {unreadDirectCount > 0 && (
            <div className="inline-flex items-center gap-2 rounded-2xl bg-primary/10 border border-primary/30 px-3.5 py-1.5 text-xs font-bold text-primary">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-glow-cyan" />
              <span>{unreadDirectCount} رسائل جديدة</span>
            </div>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 text-xs font-bold hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            <svg
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{refreshing ? "جارٍ التحديث..." : "تحديث"}</span>
          </Button>
        </div>
      </div>

      {/* Auth Error Banner */}
      {authError && (
        <div className="rounded-2xl bg-danger/10 border border-danger/30 p-4 text-xs sm:text-sm font-bold text-danger flex items-center justify-between gap-3 animate-fade-in">
          <span>{authError}</span>
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-xl bg-danger text-surface font-bold text-xs hover:bg-danger/90 transition-colors shrink-0"
          >
            تسجيل الدخول ←
          </Link>
        </div>
      )}

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
            <span>سجل الإشعارات الواردة</span>
          </h2>
          <span className="text-xs text-text-secondary">
            {filteredList.length} إشعار
          </span>
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
                  className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                    isUnread
                      ? "bg-primary/10 border-primary/40 shadow-glow-cyan/10"
                      : "bg-surface-raised border-border/50 hover:border-primary/40 hover:bg-surface"
                  }`}
                >
                  {/* Content */}
                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      {isUnread && (
                        <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-glow-cyan animate-pulse shrink-0" />
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
                    <p className="text-xs sm:text-sm text-text-secondary mt-1 line-clamp-2 leading-relaxed text-right">
                      {n.message}
                    </p>
                  </div>

                  {/* Read button */}
                  <div className="flex items-center gap-2 justify-end shrink-0 pt-2 sm:pt-0 border-t border-border/40 sm:border-0">
                    <span className="px-3.5 py-1.5 rounded-xl border border-border/60 bg-surface text-text-primary text-xs font-bold group-hover:border-primary group-hover:text-primary group-hover:shadow-sm transition-all duration-200 whitespace-nowrap">
                      عرض التفاصيل ←
                    </span>
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

      {/* Full Modal Viewer for Notification Details */}
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

            <div className="py-4 min-h-[120px] bg-surface-raised rounded-2xl p-4 border border-border/40">
              <p className="text-sm sm:text-base leading-relaxed text-text-primary whitespace-pre-wrap">
                {selectedNotification.message}
              </p>
            </div>

            {/* Modal action buttons */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="vibrant"
                onClick={() => setSelectedNotification(null)}
                className="shadow-glow-cyan font-bold px-6 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
              >
                إغلاق
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
