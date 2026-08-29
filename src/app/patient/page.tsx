"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyProfile } from "@/lib/api/patient";
import { getMyAppointments } from "@/lib/api/appointment";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import type { Appointment, Patient } from "@/types/api";

export default function PatientHomePage() {
  const [profile, setProfile] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyProfile().then((res) => setProfile(res.data.patient)),
      getMyAppointments().then((res) => setAppointments(res.data.appointments ?? []))
    ])
    .catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl">
      {/* Welcome Card */}
      <Card glass vibrant className="border-primary/20 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">أهلاً بك في ملفك الصحي</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-text-primary">
              {profile ? `${profile.firstName} ${profile.lastName}` : "..."}
            </h1>
            <p className="text-xs text-text-secondary mt-1">تتبع مواعيدك وسجلاتك الطبية الموحّدة بكل سهولة</p>
          </div>
          <div className="flex gap-2">
            <Link href="/patient/appointments">
              <Button variant="vibrant" size="sm" className="shadow-glow-cyan">
                حجز موعد جديد
              </Button>
            </Link>
            <Link href="/patient/profile">
              <Button variant="outline" size="sm">
                تعديل البروفايل
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/patient/records">
          <Card hover className="p-5 flex items-center gap-4 cursor-pointer border-accent/20">
            <div>
              <p className="font-display font-bold text-text-primary text-base">السجلات الطبية المشتركة والمستندات</p>
              <p className="text-xs text-text-secondary mt-0.5">الاطلاع على تشخيصات الدكتور والأدوية والروشتات والمستندات</p>
            </div>
          </Card>
        </Link>
        <Link href="/patient/notifications">
          <Card hover className="p-5 flex items-center gap-4 cursor-pointer border-success/20">
            <div>
              <p className="font-display font-bold text-text-primary text-base">صندوق الإشعارات والتنبيهات</p>
              <p className="text-xs text-text-secondary mt-0.5">رسائل وتنبيهات مباشرة من عيادتك الخاصة</p>
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
            <span className="text-xs font-bold text-primary hover:underline cursor-pointer">إدارة الحجوزات ←</span>
          </Link>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {appointments.slice(0, 5).map((a) => {
            const docName = typeof a.doctorId === "object"
              ? `د. ${a.doctorId.firstName} ${a.doctorId.lastName}`
              : "طبيب العيادة";
            const clinicName = typeof a.clinicId === "object"
              ? a.clinicId.name
              : "عيادة المنصة";
            return (
              <div key={a._id} className="flex items-center justify-between py-3.5 text-sm gap-4">
                <div>
                  <p className="font-bold text-text-primary">{docName}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{clinicName} • {new Date(a.date).toLocaleDateString("ar-EG")}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            );
          })}
          {!loading && appointments.length === 0 && (
            <p className="py-8 text-center text-sm text-text-secondary">
              لا توجد مواعيد مسجّلة حالياً.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
