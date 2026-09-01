"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMe, getMyClinic } from "@/lib/api/doctor";
import { getMyAppointments } from "@/lib/api/appointment";
import { getMyPatients } from "@/lib/api/patient";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SupportContactBox } from "@/components/SupportActivationModal";
import type { Appointment, Clinic, Patient } from "@/types/api";

export default function DoctorDashboardPage() {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsClinic, setNeedsClinic] = useState(false);
  
  const [isPaid, setIsPaid] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        
        
        
        
        let doctorActive = false;
        try {
          await getMe();
          doctorActive = true;
        } catch {
          doctorActive = false;
        }

        if (cancelled) return;
        setIsPaid(doctorActive);

        if (!doctorActive) return; 

        
        const [clinicRes, apptRes, patientRes] = await Promise.allSettled([
          getMyClinic(),
          getMyAppointments(),
          getMyPatients(),
        ]);
        if (cancelled) return;

        if (clinicRes.status === "fulfilled") setClinic(clinicRes.value.data);
        else setNeedsClinic(true);

        if (apptRes.status === "fulfilled")
          setAppointments(apptRes.value.data.appointments ?? []);

        if (patientRes.status === "fulfilled")
          setPatients(patientRes.value.data.patients ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  
  if (isPaid === false) {
    return (
      <Card className="mx-auto max-w-xl text-center animate-fade-in p-8 border-warning/30 bg-surface">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/15 text-warning">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold text-text-primary">
          الحساب غير مفعّل أو انتهى الاشتراك
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          حسابك غير مفعّل حالياً. يلزم التواصل مع الإدارة لتفعيل الحساب أو تجديد الاشتراك. بعد التفعيل اضغط &ldquo;إعادة المحاولة&rdquo;.
        </p>
        <div className="mt-6 text-right">
          <SupportContactBox />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button variant="vibrant" size="sm" onClick={() => window.location.reload()}>
            إعادة المحاولة
          </Button>
        </div>
      </Card>
    );
  }

  
  if (needsClinic) {
    return (
      <Card className="mx-auto max-w-xl text-center animate-fade-in p-6 sm:p-8 border-warning/30">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/15 text-warning text-xl font-bold">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" />
            <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
            <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
            <path d="M10 9h4" />
            <path d="M12 7v4" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-extrabold text-text-primary">
          لم يتم تسجيل عيادة بعد
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          ابدأ بتسجيل بيانات عيادتك لتتمكن من استخدام النظام بالكامل.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/doctor/clinic">
            <Button variant="vibrant">
              تسجيل العيادة
            </Button>
          </Link>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            إعادة الفحص
          </Button>
        </div>
      </Card>
    );
  }

  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="اسم العيادة" value={clinic?.name ?? "—"} />
        <StatCard label="عدد المرضى" value={String(patients.length)} />
        <StatCard label="مواعيد قيد الانتظار" value={String(pendingCount)} />
      </div>

      <Card>
        <h2 className="font-display text-base font-bold text-text-primary">
          أحدث المواعيد
        </h2>
        <div className="mt-4 flex flex-col divide-y divide-border">
          {appointments.slice(0, 5).map((a) => (
            <div key={a._id} className="flex items-center justify-between py-3 text-sm">
              <span className="text-text-primary">
                {typeof a.patientId === "object"
                  ? `${a.patientId.firstName} ${a.patientId.lastName}`
                  : a.patientId}
              </span>
              <span className="text-text-secondary">
                {new Date(a.date).toLocaleDateString("ar-EG")}
              </span>
              <StatusBadge status={a.status} />
            </div>
          ))}
          {appointments.length === 0 && (
            <p className="py-6 text-center text-sm text-text-secondary">
              لا توجد مواعيد حتى الآن
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-text-primary">{value}</p>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3 animate-fade-in">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-border/50" />
      ))}
    </div>
  );
}
