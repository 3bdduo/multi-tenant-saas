"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getMyAppointments,
  deleteAppointment,
} from "@/lib/api/appointment";
import { getPublicClinics } from "@/lib/api/public";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiError } from "@/lib/http";
import type { Appointment, Clinic } from "@/types/api";

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<
    Array<{
      id: string;
      clinicId: string;
      name: string;
      specialization: string;
      clinicName: string;
      city?: string;
      governorate?: string;
      consultationPrice: number;
      followUpPrice: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Search and filter for doctors grid
  const [doctorSearch, setDoctorSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  async function loadData() {
    setLoading(true);
    try {
      const [apptsRes, clinicsRes] = await Promise.allSettled([
        getMyAppointments(),
        getPublicClinics(),
      ]);

      if (apptsRes.status === "fulfilled") {
        setAppointments(apptsRes.value.data.appointments ?? []);
      }

      if (clinicsRes.status === "fulfilled" && clinicsRes.value.data.clinics) {
        const list = clinicsRes.value.data.clinics;

        const formatted = list.map((c) => {
          const doc = typeof c.doctorId === "object" ? c.doctorId : null;
          const docId = doc?._id || (typeof c.doctorId === "string" ? c.doctorId : "");
          const docName = doc ? `د. ${doc.firstName} ${doc.lastName}` : c.name;

          return {
            id: docId,
            clinicId: c._id,
            name: docName,
            specialization: c.specialization || "طب عام",
            clinicName: c.name,
            city: c.city,
            governorate: c.governorate,
            consultationPrice: c.consultationPrice ?? 200,
            followUpPrice: c.followUpPrice ?? c.consultationPrice ?? 100,
          };
        });

        setAvailableDoctors(formatted);
      }
    } catch {
      // Ignore initial load errors
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCancel(appt: Appointment) {
    if (!confirm("هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟")) return;
    setCancellingId(appt._id);
    try {
      const doctorId = typeof appt.doctorId === "object" ? appt.doctorId._id : appt.doctorId;
      const clinicId = typeof appt.clinicId === "object" ? appt.clinicId._id : appt.clinicId;
      await deleteAppointment(appt._id, {
        doctorId,
        clinicId,
        date: appt.date?.split("T")[0] ?? "",
      });
      loadData();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "تعذّر إلغاء الموعد");
    } finally {
      setCancellingId(null);
    }
  }

  // Specialties for filter
  const specialties = Array.from(
    new Set(availableDoctors.map((d) => d.specialization).filter(Boolean))
  );

  const filteredDoctors = availableDoctors.filter((d) => {
    const q = doctorSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.clinicName.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      (d.city && d.city.toLowerCase().includes(q)) ||
      (d.governorate && d.governorate.toLowerCase().includes(q));

    const matchesSpecialty =
      selectedSpecialty === "all" || d.specialization === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-4xl pb-12">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-text-primary">
          حجز وتصفح المواعيد الطبية
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          تصفح قائمة الأطباء والعيادات المتاحة للحجز، وتابع حالة مواعيدك الطبية السابقة والقادمة.
        </p>
      </div>

      {/* Available Doctors Directory Section */}
      <Card glass vibrant className="border-primary/20 shadow-xl p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border/50">
          <div>
            <h2 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
              <span>‍️</span> قائمة الأطباء والعيادات المتاحة للحجز
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              ابحث عن طبيبك أو تخصصك واحجز موعدك فوراً مع اختيار الموعد المناسب
            </p>
          </div>
          <Link href="/clinics">
            <span className="text-xs font-bold text-primary hover:underline cursor-pointer">
              استعراض صفحة العيادات الكاملة ↗
            </span>
          </Link>
        </div>

        {/* Search & Specialty Filters */}
        <div className="flex flex-col gap-3 mb-5">
          <input
            type="text"
            placeholder="ابحث باسم الطبيب، العيادة، التخصص، أو المدينة..."
            value={doctorSearch}
            onChange={(e) => setDoctorSearch(e.target.value)}
            className="w-full rounded-2xl border border-border/80 bg-surface px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.1)]"
          />

          {specialties.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide flex-nowrap text-xs">
              <button
                type="button"
                onClick={() => setSelectedSpecialty("all")}
                className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  selectedSpecialty === "all"
                    ? "bg-primary text-surface shadow-glow-cyan"
                    : "bg-surface-raised text-text-secondary hover:text-text-primary"
                }`}
              >
                الكل ({availableDoctors.length})
              </button>
              {specialties.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors ${
                    selectedSpecialty === spec
                      ? "bg-primary text-surface shadow-glow-cyan"
                      : "bg-surface-raised text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-surface-raised" />
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="py-12 text-center text-text-secondary">
            <p className="font-semibold text-sm">لا يوجد أطباء أو عيادات مطابقة لبحثك</p>
            <p className="text-xs text-text-secondary mt-1">جرب البحث بكلمة أخرى أو تغيير التخصص</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id || doc.clinicId}
                className="flex flex-col justify-between gap-3 p-4 sm:p-5 rounded-2xl border border-border/80 bg-surface-raised hover:border-primary/40 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-text-primary text-base sm:text-lg">{doc.name}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{doc.clinicName}</p>
                    </div>
                    <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary shrink-0">
                      {doc.specialization}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-text-secondary pt-2.5 border-t border-border/40">
                    <span>{doc.city ? `${doc.governorate} — ${doc.city}` : doc.governorate || "العيادة"}</span>
                    <div className="flex gap-2.5">
                      <span className="font-bold text-text-primary">
                        كشف: <strong className="text-accent text-sm">{doc.consultationPrice} ج.م</strong>
                      </span>
                      <span className="text-text-secondary">
                        إعادة: <strong className="text-primary font-bold">{doc.followUpPrice} ج.م</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {doc.clinicId ? (
                  <Link href={`/clinics/${doc.clinicId}`} className="w-full mt-1">
                    <Button
                      variant="vibrant"
                      size="sm"
                      className="w-full justify-center font-bold shadow-glow-cyan text-xs sm:text-sm py-2"
                    >
                      حجز موعد كشف الآن ←
                    </Button>
                  </Link>
                ) : (
                  <Button variant="secondary" size="sm" disabled className="w-full justify-center text-xs">
                    غير متاح للحجز
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Appointments List */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-bold text-text-primary mb-4 flex items-center justify-between">
          <span>قائمة مواعيدي الطبية ({appointments.length})</span>
          <Button variant="ghost" size="sm" onClick={loadData}>
            تحديث القائمة
          </Button>
        </h2>

        {loading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-border/50" />
        ) : appointments.length === 0 ? (
          <div className="py-12 text-center text-text-secondary flex flex-col items-center gap-2">
            <p className="font-semibold">لا توجد لديك مواعيد محجوزة حالياً</p>
            <p className="text-xs">اختر الطبيب والتاريخ من النموذج أعلاه للحجز مباشرة</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="flex flex-col gap-3 sm:hidden">
              {appointments.map((a) => {
                const doc = typeof a.doctorId === "object" && a.doctorId !== null ? a.doctorId : null;
                const clinic = typeof a.clinicId === "object" && a.clinicId !== null ? a.clinicId : null;
                const isFollowUp = a.visitingType === "FOLLOW_UP";
                const docName = doc ? `د. ${doc.firstName || ""} ${doc.lastName || ""}`.trim() : "طبيب العيادة";

                return (
                  <div key={a._id} className="rounded-2xl border border-border/60 bg-surface-raised p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-text-primary text-sm truncate">
                          {docName || "طبيب العيادة"}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5 truncate">
                          {clinic ? `${clinic.name} (${clinic.specialization})` : "كشف طبي"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold shrink-0 ${
                          isFollowUp
                            ? "bg-accent/15 text-accent border border-accent/30"
                            : "bg-primary/15 text-primary border border-primary/30"
                        }`}
                      >
                        {isFollowUp ? "إعادة كشف" : "كشف جديد"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-border/40">
                      <span>
                        {new Date(a.date).toLocaleDateString("ar-EG", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <StatusBadge status={a.status} />
                    </div>

                    {a.status === "pending" && (
                      <div className="pt-2 border-t border-border/40 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={cancellingId === a._id}
                          onClick={() => handleCancel(a)}
                          className="text-danger hover:bg-danger/10 text-xs w-full justify-center"
                        >
                          {cancellingId === a._id ? "جارٍ الإلغاء..." : "إلغاء الموعد"}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-right text-text-secondary bg-surface-elevated/50">
                    <th className="px-4 py-3 font-semibold">الطبيب / العيادة</th>
                    <th className="px-4 py-3 font-semibold">نوع الكشف</th>
                    <th className="px-4 py-3 font-semibold">تاريخ الكشف</th>
                    <th className="px-4 py-3 font-semibold">حالة الموعد</th>
                    <th className="px-4 py-3 font-semibold">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {appointments.map((a) => {
                    const doc = typeof a.doctorId === "object" && a.doctorId !== null ? a.doctorId : null;
                    const clinic = typeof a.clinicId === "object" && a.clinicId !== null ? a.clinicId : null;
                    const isFollowUp = a.visitingType === "FOLLOW_UP";
                    const docName = doc ? `د. ${doc.firstName || ""} ${doc.lastName || ""}`.trim() : "طبيب العيادة";

                    return (
                      <tr key={a._id} className="hover:bg-surface-elevated/40 transition-colors">
                        <td className="px-4 py-3.5 text-text-primary">
                          <div className="font-bold">
                            {docName || "طبيب العيادة"}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {clinic ? `${clinic.name} (${clinic.specialization})` : "كشف طبي"}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                              isFollowUp
                                ? "bg-accent/15 text-accent border border-accent/30"
                                : "bg-primary/15 text-primary border border-primary/30"
                            }`}
                          >
                            {isFollowUp ? "إعادة كشف" : "كشف جديد"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-text-primary font-medium">
                          {new Date(a.date).toLocaleDateString("ar-EG", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={a.status} />
                        </td>
                        <td className="px-4 py-3.5">
                          {a.status === "pending" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={cancellingId === a._id}
                              onClick={() => handleCancel(a)}
                              className="text-danger hover:bg-danger/10"
                            >
                              {cancellingId === a._id ? "جارٍ الإلغاء..." : "إلغاء الموعد"}
                            </Button>
                          ) : (
                            <span className="text-xs text-text-secondary">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
