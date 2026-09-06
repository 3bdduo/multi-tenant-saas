"use client";

import { useState, useEffect } from "react";
import { DoctorActivationBanner } from "@/components/DoctorActivationBanner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CustomTimePicker } from "@/components/ui/CustomTimePicker";
import { getMyClinic, updateMyClinic } from "@/lib/api/doctor";
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

export default function BookingSettingsPage() {
  const [bookingType, setBookingType] = useState<"queue" | "time">("queue");
  const [maxPatientsPerDay, setMaxPatientsPerDay] = useState<number>(20);
  const [slotDuration, setSlotDuration] = useState<number>(30);
  const [days, setDays] = useState<DayConfig[]>(DEFAULT_DAYS);
  const [loading, setLoading] = useState(true);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [globalSavedMsg, setGlobalSavedMsg] = useState(false);
  const [savedMsgIndex, setSavedMsgIndex] = useState<number | null>(null);

  useEffect(() => {
    getMyClinic()
      .then((res) => {
        const clinic = res.data;
        if (clinic) {
          if (clinic.bookingType) setBookingType(clinic.bookingType);
          if (clinic.maxPatientsPerDay) setMaxPatientsPerDay(clinic.maxPatientsPerDay);
          if ((clinic as any).slotDuration) setSlotDuration((clinic as any).slotDuration);

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
      .catch((err) => console.error("Failed to load clinic config:", err))
      .finally(() => setLoading(false));
  }, []);

  async function saveConfigToBackend(
    updatedDays: DayConfig[],
    type = bookingType,
    maxLimit = maxPatientsPerDay,
    slot = slotDuration
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
        bookingType: type,
        maxPatientsPerDay: maxLimit,
        slotDuration: slot,
      });
    } catch (err) {
      console.error("Failed to update booking settings in backend:", err);
    }
  }

  async function handleSaveAll() {
    setSavingGlobal(true);
    setGlobalSavedMsg(false);
    try {
      await saveConfigToBackend(days, bookingType, maxPatientsPerDay, slotDuration);
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
    saveConfigToBackend(updated, bookingType, maxPatientsPerDay, slotDuration);
  }

  async function handleSaveClick(index: number) {
    await saveConfigToBackend(days, bookingType, maxPatientsPerDay, slotDuration);
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary md:text-3xl">
            إعدادات الحجز والكشف
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            إدارة نظام الحجز، القدرة الاستيعابية اليومية، ومواعيد وأيام عمل العيادة
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
          <span>تم حفظ كافة إعدادات الحجز بنجاح وتحديث جدول مواعيد المرضى</span>
        </div>
      )}

      {}
      <Card glass vibrant className="border-primary/20 p-6 md:p-8 shadow-xl">
        <h2 className="font-display text-lg font-extrabold text-text-primary mb-6">
          نظام الحجز والقدرة الاستيعابية
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-primary">
              طريقة ونظام الحجز للمرضى *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBookingType("queue")}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center ${
                  bookingType === "queue"
                    ? "bg-primary/15 border-primary text-primary shadow-glow-cyan font-bold"
                    : "border-border/60 bg-surface-raised text-text-secondary hover:border-primary/40"
                }`}
              >
                <span className="text-sm font-extrabold">حجز بالدور (Queue)</span>
                <span className="text-[11px] opacity-70 mt-1">ترتيب بأسبقية الحضور</span>
              </button>

              <button
                type="button"
                onClick={() => setBookingType("time")}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center ${
                  bookingType === "time"
                    ? "bg-primary/15 border-primary text-primary shadow-glow-cyan font-bold"
                    : "border-border/60 bg-surface-raised text-text-secondary hover:border-primary/40"
                }`}
              >
                <span className="text-sm font-extrabold">مواعيد محددة (Time)</span>
                <span className="text-[11px] opacity-70 mt-1">اختيار وقت محدد للكشف</span>
              </button>
            </div>
          </div>

          {/* Max Patients Limit */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-primary">
              الحد الأقصى للمرضى في اليوم الواحد *
            </label>
            <input
              type="number"
              min={1}
              max={200}
              value={maxPatientsPerDay}
              onChange={(e) => setMaxPatientsPerDay(Number(e.target.value))}
              placeholder="مثال: 20"
              className="w-full rounded-2xl border border-border/80 bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.1)]"
            />
            <p className="text-xs text-text-secondary">
              عند وصول الحجوزات لهذا الحد، سيتم تحويل باقي الطلبات لقائمة الانتظار تلقائياً.
            </p>
          </div>

          {/* Slot Duration (for Time booking only) */}
          {bookingType === "time" && (
            <div className="flex flex-col gap-2 md:col-span-2 pt-4 border-t border-border/40">
              <label className="text-sm font-bold text-text-primary">
                مدة الكشف الواحد (بالدقائق) *
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {[15, 20, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSlotDuration(mins)}
                    className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
                      slotDuration === mins
                        ? "bg-primary text-surface shadow-glow-cyan"
                        : "bg-surface-raised text-text-secondary hover:bg-border/60"
                    }`}
                  >
                    {mins} دقيقة
                  </button>
                ))}
              </div>
              <p className="text-xs text-text-secondary mt-1">
                المدة الحالية لكل كشف: <span className="font-bold text-primary">{slotDuration} دقيقة</span> (يتم تقسيم أوقات العمل في اليوم إلى فترات بهذه المدة).
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* ── Section 2: Working Days Schedule ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-text-primary">
            جدول أيام وساعات العمل الأسبوعية
          </h2>
          <span className="text-xs text-text-secondary font-medium">
            (حدد أوقات بدء وانتهاء الكشف لكل يوم)
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
              {/* Header Row */}
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${day.isOpen ? "bg-success" : "bg-danger"}`} />
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-text-primary">
                      يوم {day.dayName}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {day.isOpen ? "العيادة تعمل وتستقبل الحجوزات" : "العيادة مغلقة في هذا اليوم"}
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

              {/* Time pickers when day is open */}
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
                  هذا اليوم مغلق ولا تظهر أي مواعيد متاحة للمرضى فيه.
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Save All Button - elevated above mobile bottom nav */}
      <div className="sticky bottom-6 z-20 rounded-2xl bg-surface/95 backdrop-blur-md p-3.5 sm:p-4 border border-border/60 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-text-primary">
          <span>تأكد من حفظ التعديلات لتطبيقها فوراً على نظام الحجز.</span>
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
