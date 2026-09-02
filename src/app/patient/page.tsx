"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyProfile } from "@/lib/api/patient";
import { getMyAppointments } from "@/lib/api/appointment";
import { getPublicClinics } from "@/lib/api/public";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import type { Appointment, Clinic, Patient } from "@/types/api";

export default function PatientHomePage() {
  const [profile, setProfile] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  // Doctors modal & filter state
  const [showDoctorsModal, setShowDoctorsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");

  useEffect(() => {
    Promise.all([
      getMyProfile().then((res) => setProfile(res.data.patient)),
      getMyAppointments().then((res) => setAppointments(res.data.appointments ?? [])),
      getPublicClinics().then((res) => {
        if (res.success) setClinics(res.data.clinics ?? []);
      }),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Compute previous doctors from appointments
  const previousDoctors = (() => {
    const map = new Map<
      string,
      {
        doctorId: string;
        doctorName: string;
        clinicId: string;
        clinicName: string;
        specialization: string;
        lastVisitDate: string;
        followUpPrice?: number;
      }
    >();

    appointments.forEach((a) => {
      const doc = typeof a.doctorId === "object" && a.doctorId !== null ? a.doctorId : null;
      const clinic = typeof a.clinicId === "object" && a.clinicId !== null ? a.clinicId : null;
      const docId = doc?._id || (typeof a.doctorId === "string" ? a.doctorId : "");
      const clinicId = clinic?._id || (typeof a.clinicId === "string" ? a.clinicId : "");

      if (docId && !map.has(docId)) {
        // Find matching clinic from clinics list for price
        const matchedClinic = clinics.find(
          (c) =>
            c._id === clinicId ||
            (typeof c.doctorId === "object" && c.doctorId !== null ? c.doctorId?._id : c.doctorId) === docId
        );

        const docFullName = doc ? `د. ${doc.firstName || ""} ${doc.lastName || ""}`.trim() : "طبيب العيادة";

        map.set(docId, {
          doctorId: docId,
          doctorName: docFullName,
          clinicId: clinicId || matchedClinic?._id || "",
          clinicName: clinic?.name || matchedClinic?.name || "عيادة طبية",
          specialization: clinic?.specialization || matchedClinic?.specialization || "كشف تخصصي",
          lastVisitDate: a.date,
          followUpPrice: matchedClinic?.followUpPrice ?? matchedClinic?.consultationPrice,
        });
      }
    });

    return Array.from(map.values());
  })();

  // Filter clinics in modal
  const specialties = Array.from(new Set(clinics.map((c) => c.specialization).filter(Boolean)));
  const filteredClinics = clinics.filter((c) => {
    const doc = typeof c.doctorId === "object" && c.doctorId !== null ? c.doctorId : null;
    const docName = doc ? `${doc.firstName || ""} ${doc.lastName || ""}`.trim() : "";
    const matchesSearch =
      !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      docName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpecialty =
      selectedSpecialty === "all" || c.specialization === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl pb-12">
      {/* Welcome Card */}
      <Card glass vibrant className="border-primary/20 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              أهلاً بك في ملفك الصحي
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-text-primary">
              {profile ? `${profile.firstName} ${profile.lastName}` : "..."}
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              تتبع مواعيدك وسجلاتك الطبية الموحّدة بكل سهولة
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="vibrant"
              size="sm"
              className="shadow-glow-cyan font-bold"
              onClick={() => setShowDoctorsModal(true)}
            >
              + حجز موعد جديد
            </Button>
            <Link href="/patient/profile">
              <Button variant="outline" size="sm">
                تعديل البروفايل
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Previous Doctors (Follow-Up Section) */}
      {previousDoctors.length > 0 && (
        <Card className="border-accent/30 bg-gradient-to-br from-surface to-accent/5 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-border/50">
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
                <span>🩺</span> أطباؤك السابقون — حجز إعادة كشف / متابعة
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                يمكنك إعادة الكشف مع أطبائك السابقين بسعر المتابعة المخفض مباشرة
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
            {previousDoctors.map((doc) => (
              <div
                key={doc.doctorId}
                className="flex flex-col justify-between gap-3 p-4 rounded-2xl border border-border/70 bg-surface-raised/80 hover:border-accent/40 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-text-primary text-sm sm:text-base">
                        {doc.doctorName}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {doc.clinicName} • {doc.specialization}
                      </p>
                    </div>
                    <span className="rounded-full bg-accent/15 text-accent border border-accent/30 px-2 py-0.5 text-[10px] font-extrabold shrink-0">
                      متابعة
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-border/40">
                    <span>
                      آخر زيارة: {new Date(doc.lastVisitDate).toLocaleDateString("ar-EG")}
                    </span>
                    {doc.followUpPrice != null && (
                      <span className="font-bold text-primary">
                        سعر الإعادة: {doc.followUpPrice} ج.م
                      </span>
                    )}
                  </div>
                </div>

                {doc.clinicId ? (
                  <Link href={`/clinics/${doc.clinicId}`} className="w-full mt-1">
                    <Button
                      variant="vibrant"
                      size="sm"
                      className="w-full justify-center font-bold shadow-glow-cyan text-xs"
                    >
                      حجز إعادة كشف الآن
                    </Button>
                  </Link>
                ) : (
                  <Link href="/patient/appointments" className="w-full mt-1">
                    <Button variant="secondary" size="sm" className="w-full justify-center text-xs">
                      حجز موعد
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/patient/records">
          <Card hover className="p-5 flex items-center gap-4 cursor-pointer border-accent/20">
            <div>
              <p className="font-display font-bold text-text-primary text-base">
                السجلات الطبية المشتركة والمستندات
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                الاطلاع على تشخيصات الدكتور والأدوية والروشتات والمستندات
              </p>
            </div>
          </Card>
        </Link>
        <Link href="/patient/notifications">
          <Card hover className="p-5 flex items-center gap-4 cursor-pointer border-success/20">
            <div>
              <p className="font-display font-bold text-text-primary text-base">
                صندوق الإشعارات والتنبيهات
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                رسائل وتنبيهات مباشرة من عيادتك الخاصة
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Appointments List */}
      <Card>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
          <h2 className="font-display text-base font-bold text-text-primary">
            مواعيدك الأخيرة والقادمة
          </h2>
          <Link href="/patient/appointments">
            <span className="text-xs font-bold text-primary hover:underline cursor-pointer">
              إدارة الحجوزات ←
            </span>
          </Link>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {appointments.slice(0, 5).map((a) => {
            const doc = typeof a.doctorId === "object" && a.doctorId !== null ? a.doctorId : null;
            const docName = doc && (doc.firstName || doc.lastName)
              ? `د. ${doc.firstName || ""} ${doc.lastName || ""}`.trim()
              : "طبيب العيادة";
            const clinic = typeof a.clinicId === "object" && a.clinicId !== null ? a.clinicId : null;
            const clinicName = clinic?.name || "عيادة المنصة";
            const clinicId = clinic?._id || (typeof a.clinicId === "string" ? a.clinicId : undefined);

            return (
              <div
                key={a._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 text-sm gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-text-primary">{docName}</p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        a.visitingType === "FOLLOW_UP"
                          ? "bg-accent/15 text-accent"
                          : "bg-primary/15 text-primary"
                      }`}
                    >
                      {a.visitingType === "FOLLOW_UP" ? "إعادة كشف" : "كشف جديد"}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {clinicName} • {new Date(a.date).toLocaleDateString("ar-EG")}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <StatusBadge status={a.status} />
                  {clinicId && (
                    <Link href={`/clinics/${clinicId}`}>
                      <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">
                        إعادة الحجز
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
          {!loading && appointments.length === 0 && (
            <p className="py-8 text-center text-sm text-text-secondary">
              لا توجد مواعيد مسجّلة حالياً. اضغط على &quot;حجز موعد جديد&quot; للاستعراض والحجز.
            </p>
          )}
        </div>
      </Card>

      {/* ─── Doctors Booking Modal ─────────────────────────────── */}
      {showDoctorsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl bg-surface border border-primary/20 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border/60 bg-surface-raised/40">
              <div>
                <h3 className="font-display text-xl font-bold text-text-primary">
                  قائمة الأطباء والعيادات المتاحة
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  اختر الطبيب المناسب وتصفح المواعيد المتاحة للحجز الفوري
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDoctorsModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-raised text-text-secondary hover:text-text-primary hover:bg-border/60 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 sm:p-5 border-b border-border/50 flex flex-col gap-3 bg-surface">
              <input
                type="text"
                placeholder="ابحث باسم الطبيب، اسم العيادة، التخصص، أو المدينة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-border/80 bg-surface px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.1)]"
              />

              {/* Specialties Pills */}
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
                    الكل ({clinics.length})
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

            {/* Clinics / Doctors List */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-3">
              {filteredClinics.length === 0 ? (
                <div className="py-12 text-center text-text-secondary">
                  <p className="font-bold">لا يوجد أطباء أو عيادات مطابقة لبحثك</p>
                  <p className="text-xs mt-1">جرب البحث بكلمة أخرى أو تغيير التخصص</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredClinics.map((clinic) => {
                    const doc = typeof clinic.doctorId === "object" ? clinic.doctorId : null;
                    const docName = doc ? `د. ${doc.firstName} ${doc.lastName}` : clinic.name;

                    return (
                      <div
                        key={clinic._id}
                        className="flex flex-col justify-between gap-3 p-4 rounded-2xl border border-border/80 bg-surface-raised hover:border-primary/40 transition-all"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-text-primary text-base">
                                {docName}
                              </h4>
                              <p className="text-xs text-text-secondary font-medium">
                                {clinic.name}
                              </p>
                            </div>
                            <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary shrink-0">
                              {clinic.specialization}
                            </span>
                          </div>

                          <p className="text-xs text-text-secondary mt-2 line-clamp-2">
                            {clinic.description || `عيادة متخصصة في ${clinic.specialization}`}
                          </p>

                          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-border/40 text-text-secondary">
                            <span>{clinic.city ? `${clinic.governorate} — ${clinic.city}` : clinic.governorate}</span>
                            <span className="font-bold text-text-primary">
                              كشف: <strong className="text-accent">{clinic.consultationPrice} ج.م</strong>
                            </span>
                          </div>
                        </div>

                        <Link
                          href={`/clinics/${clinic._id}`}
                          onClick={() => setShowDoctorsModal(false)}
                          className="w-full mt-1"
                        >
                          <Button
                            variant="vibrant"
                            size="sm"
                            className="w-full justify-center font-bold shadow-glow-cyan text-xs"
                          >
                            اختيار وحجز كشف ←
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border/60 bg-surface-raised/40 flex justify-between items-center">
              <Link href="/clinics" onClick={() => setShowDoctorsModal(false)}>
                <Button variant="ghost" size="sm" className="text-xs text-primary font-bold">
                  تصفح صفحة العيادات الكاملة ↗
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDoctorsModal(false)}
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
