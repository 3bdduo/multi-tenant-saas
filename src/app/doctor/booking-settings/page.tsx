"use client";

import { useState, useEffect } from "react";
import { DoctorActivationBanner } from "@/components/DoctorActivationBanner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CustomTimePicker } from "@/components/ui/CustomTimePicker";
import {
  getMyClinic,
  updateMyClinic,
  updateClinicStatus,
  blockDate,
  unblockDate,
} from "@/lib/api/doctor";
import type { WorkingDay } from "@/types/api";

interface DayConfig {
  dayName: string;
  dayKey: WorkingDay["day"];
  isOpen: boolean;
  fromTime: string;
  toTime: string;
}

const ARABIC_DAYS: Record<WorkingDay["day"], string> = {
  Saturday: "السبت",
  Sunday: "الأحد",
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
};

const DEFAULT_DAYS: DayConfig[] = (Object.keys(ARABIC_DAYS) as WorkingDay["day"][]).map((dayKey) => ({
  dayName: ARABIC_DAYS[dayKey],
  dayKey,
  isOpen: true,
  fromTime: "10:00",
  toTime: "18:00",
}));

function getTomorrowDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function formatDateDisplay(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function BookingSettingsPage() {
  const [maxPatientsPerDay, setMaxPatientsPerDay] = useState<number>(20);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState<string>(getTomorrowDateStr());
  const [days, setDays] = useState<DayConfig[]>(DEFAULT_DAYS);
  const [loading, setLoading] = useState(true);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [blockingLoading, setBlockingLoading] = useState(false);
  const [unblockingLoading, setUnblockingLoading] = useState<string | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [globalSavedMsg, setGlobalSavedMsg] = useState(false);
  const [savedMsgIndex, setSavedMsgIndex] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    getMyClinic()
      .then((res) => {
        const clinic = res.data;
        if (clinic) {
          if (clinic.maxPatientsPerDay) setMaxPatientsPerDay(clinic.maxPatientsPerDay);
          if (clinic.isActive !== undefined) setIsActive(clinic.isActive);
          if (clinic.blockedDates) {
            setBlockedDates(
              clinic.blockedDates.map((d: any) =>
                typeof d === "string" ? d.split("T")[0] : new Date(d).toISOString().split("T")[0]
              )
            );
          }

          if (clinic.workingDays && clinic.workingDays.length > 0) {
            const mapped = DEFAULT_DAYS.map((defDay) => {
              const serverDay = clinic.workingDays.find((wd) => wd.day === defDay.dayKey);
              if (serverDay) {
                return {
                  ...defDay,
                  isOpen: true,
                  fromTime: serverDay.from || defDay.fromTime,
                  toTime: serverDay.to || defDay.toTime,
                };
              } else {
                return {
                  ...defDay,
                  isOpen: false,
                };
              }
            });
            setDays(mapped);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  async function saveConfigToBackend(
    updatedDays: DayConfig[],
    maxLimit = maxPatientsPerDay
  ) {
    const workingDaysPayload: WorkingDay[] = updatedDays
      .filter((d) => d.isOpen)
      .map((d) => ({
        day: d.dayKey,
        from: d.fromTime,
        to: d.toTime,
      }));

    try {
      await updateMyClinic({
        workingDays: workingDaysPayload,
        bookingType: "queue",
        maxPatientsPerDay: maxLimit,
      });
    } catch (err: any) {
      console.error(err);
      setActionError(err?.message || "فشل حفظ الإعدادات");
    }
  }

  async function handleToggleClinicStatus() {
    setTogglingStatus(true);
    setActionError(null);
    const nextStatus = !isActive;
    try {
      await updateClinicStatus({ isActive: nextStatus });
      setIsActive(nextStatus);
    } catch (err: any) {
      setActionError(err?.message || "فشل تحديث حالة العيادة");
    } finally {
      setTogglingStatus(false);
    }
  }

  async function handleAddBlockedDate() {
    if (!newBlockedDate) return;
    if (blockedDates.includes(newBlockedDate)) {
      setActionError("هذا التاريخ مضاف بالفعل للأيام المغلقة");
      return;
    }
    setBlockingLoading(true);
    setActionError(null);
    try {
      await blockDate(newBlockedDate);
      setBlockedDates((prev) => [...prev, newBlockedDate]);
    } catch (err: any) {
      setActionError(err?.message || "فشل إغلاق هذا اليوم");
    } finally {
      setBlockingLoading(false);
    }
  }

  async function handleRemoveBlockedDate(dateStr: string) {
    setUnblockingLoading(dateStr);
    setActionError(null);
    try {
      await unblockDate(dateStr);
      setBlockedDates((prev) => prev.filter((d) => d !== dateStr));
    } catch (err: any) {
      setActionError(err?.message || "فشل إلغاء إغلاق اليوم");
    } finally {
      setUnblockingLoading(null);
    }
  }

  async function handleSaveAll() {
    setSavingGlobal(true);
    setGlobalSavedMsg(false);
    setActionError(null);
    try {
      await saveConfigToBackend(days, maxPatientsPerDay);
      setGlobalSavedMsg(true);
      setTimeout(() => setGlobalSavedMsg(false), 3500);
    } finally {
      setSavingGlobal(false);
    }
  }

  function updateDay(index: number, patch: Partial<DayConfig>) {
    const updated = [...days];
    updated[index] = { ...updated[index], ...patch };
    setDays(updated);
    saveConfigToBackend(updated, maxPatientsPerDay);
  }

  async function handleSaveClick(index: number) {
    await saveConfigToBackend(days, maxPatientsPerDay);
    setSavedMsgIndex(index);
    setTimeout(() => setSavedMsgIndex(null), 2500);
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse max-w-4xl mx-auto">
        <div className="h-16 rounded-2xl bg-border/30" />
        <div className="h-44 rounded-2xl bg-border/30" />
        <div className="h-64 rounded-2xl bg-border/30" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-16 animate-fade-in max-w-4xl mx-auto">
      <DoctorActivationBanner />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary md:text-3xl">
            إعدادات الحجز بالدور والكشف
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            التحكم في القدرة الاستيعابية اليومية، إغلاق أيام معينة، وقفل أو فتح الحجز عموماً
          </p>
        </div>
        <Button
          variant="vibrant"
          size="lg"
          onClick={handleSaveAll}
          loading={savingGlobal}
          className="font-bold shadow-glow-cyan"
        >
          {savingGlobal ? "جارٍ الحفظ..." : "حفظ كافة الإعدادات"}
        </Button>
      </div>

      {globalSavedMsg && (
        <div className="rounded-2xl bg-success/10 border border-success/30 px-5 py-3 text-sm font-bold text-success animate-fade-in flex items-center gap-2">
          <span>تم حفظ كافة إعدادات الحجز وتحديث الطاقة الاستيعابية بنجاح</span>
        </div>
      )}

      {actionError && (
        <div className="rounded-2xl bg-danger/10 border border-danger/30 px-5 py-3 text-sm font-bold text-danger animate-fade-in flex items-center gap-2">
          <span>{actionError}</span>
        </div>
      )}

      <Card glass vibrant className="border-primary/20 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6 mb-6">
          <div>
            <h2 className="font-display text-lg font-extrabold text-text-primary">
              حالة استقبال الحجوزات العامة
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              يمكنك قفل الحجز عموماً للعيادة لمنع أي مريض من الحجز في أي يوم
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-black border ${
                isActive
                  ? "bg-success/15 text-success border-success/40"
                  : "bg-danger/15 text-danger border-danger/40"
              }`}
            >
              {isActive ? "الحجز مفتوح ويستقبل المرضى" : "الحجز مغلق عموماً"}
            </span>
            <Button
              variant={isActive ? "danger" : "vibrant"}
              size="sm"
              onClick={handleToggleClinicStatus}
              loading={togglingStatus}
              className="font-bold text-xs"
            >
              {isActive ? "قفل الحجز عموماً" : "فتح الحجز للعيادة"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-primary">
              نظام الحجز المعتمد
            </label>
            <div className="p-4 rounded-2xl border border-primary/40 bg-primary/10 shadow-glow-cyan">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-extrabold text-primary">حجز بالدور فقط (Queue)</span>
              </div>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                يتم الحجز بأسبقية الحضور ويحصل المريض على رقم دور تلقائياً فور تأكيد الحجز دون مواعيد بالساعات.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-primary">
              عدد الحجوزات المتاحة في اليوم الواحد *
            </label>
            <input
              type="number"
              min={1}
              max={500}
              value={maxPatientsPerDay}
              onChange={(e) => setMaxPatientsPerDay(Number(e.target.value))}
              placeholder="مثال: 20"
              className="w-full rounded-2xl border border-border/80 bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.1)]"
            />
            <p className="text-xs text-danger/90 font-semibold mt-1">
              بمجرد وصول عدد الحجوزات لهذا الحد في يوم معين، يغلق الحجز فوراً ويرفض أي حجز إضافي.
            </p>
          </div>
        </div>
      </Card>

      <Card glass vibrant className="border-primary/20 p-6 md:p-8 shadow-xl">
        <div className="border-b border-border/50 pb-4 mb-6">
          <h2 className="font-display text-lg font-extrabold text-text-primary">
            قفل أيام معينة (إغلاق تواريخ محددة)
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            اختر تاريخاً معيناً لإغلاقه ومنع أي حجز فيه (مثل الإجازات والظروف الطارئة)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <input
            type="date"
            value={newBlockedDate}
            min={getTomorrowDateStr()}
            onChange={(e) => setNewBlockedDate(e.target.value)}
            className="rounded-2xl border border-border/80 bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.1)]"
          />
          <Button
            variant="danger"
            size="md"
            onClick={handleAddBlockedDate}
            loading={blockingLoading}
            className="font-bold text-xs shrink-0"
          >
            إغلاق هذا اليوم ومنع الحجز فيه
          </Button>
        </div>

        <div>
          <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-3">
            الأيام المغلقة يدوياً حالياً ({blockedDates.length})
          </h3>
          {blockedDates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 p-6 text-center text-xs text-text-secondary">
              لا توجد أيام مغلقة يدوياً حالياً. جميع أيام العمل المتاحة في الجدول تستقبل حجوزات.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {blockedDates.map((dateStr) => (
                <div
                  key={dateStr}
                  className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-surface-raised border border-danger/30 hover:border-danger/60 transition-all"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-primary" dir="ltr">
                      {dateStr}
                    </span>
                    <span className="text-[11px] text-text-secondary">
                      {formatDateDisplay(dateStr)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={unblockingLoading === dateStr}
                    onClick={() => handleRemoveBlockedDate(dateStr)}
                    className="text-xs font-bold text-danger hover:bg-danger/10 px-2 py-1 h-auto"
                  >
                    إلغاء القفل
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-text-primary">
            جدول أيام وساعات العمل الأسبوعية
          </h2>
          <span className="text-xs text-text-secondary font-medium">
            (حدد أيام استقبال المرضى وأوقات العمل)
          </span>
        </div>

        <div className="flex flex-col gap-5">
          {days.map((day, idx) => (
            <Card
              key={day.dayKey}
              glass
              vibrant
              className={`p-5 md:p-6 transition-all duration-300 ${
                !day.isOpen ? "opacity-75 border-danger/30 bg-surface/50" : ""
              }`}
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${day.isOpen ? "bg-success" : "bg-danger"}`} />
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-text-primary">
                      يوم {day.dayName}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {day.isOpen ? "العيادة تعمل وتستقبل الحجوزات" : "العيادة مغلقة في هذا اليوم أسبوعياً"}
                    </p>
                  </div>
                </div>

                <Button
                  variant={day.isOpen ? "danger" : "vibrant"}
                  size="sm"
                  onClick={() => updateDay(idx, { isOpen: !day.isOpen })}
                  className="text-xs font-bold"
                >
                  {day.isOpen ? "تعطيل اليوم" : "تفعيل اليوم"}
                </Button>
              </div>

              {day.isOpen ? (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CustomTimePicker
                      label="وقت بدء العمل:"
                      value={day.fromTime}
                      onChange={(val) => updateDay(idx, { fromTime: val })}
                    />
                    <CustomTimePicker
                      label="وقت انتهاء العمل:"
                      value={day.toTime}
                      onChange={(val) => updateDay(idx, { toTime: val })}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/40">
                    <span className="text-xs text-text-secondary">
                      مواعيد العمل: من <span className="font-bold text-text-primary" dir="ltr">{day.fromTime}</span> إلى <span className="font-bold text-text-primary" dir="ltr">{day.toTime}</span>
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {savedMsgIndex === idx && (
                        <span className="text-xs font-extrabold text-success animate-fade-in">
                          تم الحفظ
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveClick(idx)}
                        className="text-xs font-bold text-primary hover:bg-primary/10"
                      >
                        حفظ هذا اليوم
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-xs text-text-secondary text-center">
                  هذا اليوم مغلق ولا تظهر أي إمكانية للحجز فيه.
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      <div className="sticky bottom-6 z-20 rounded-2xl bg-surface/95 backdrop-blur-md p-3.5 sm:p-4 border border-border/60 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-text-primary">
          <span>تأكد من حفظ التعديلات لتطبيق الحد الأقصى للحجوزات فوراً.</span>
        </div>
        <Button
          variant="vibrant"
          size="lg"
          onClick={handleSaveAll}
          loading={savingGlobal}
          className="font-extrabold shadow-glow-cyan px-6 sm:px-8 w-full sm:w-auto justify-center"
        >
          {savingGlobal ? "جارٍ الحفظ..." : "حفظ الكل الآن"}
        </Button>
      </div>
    </div>
  );
}
