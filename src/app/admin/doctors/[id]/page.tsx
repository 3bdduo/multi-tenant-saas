"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDoctorById, renewDoctorSubscription, deleteDoctor } from "@/lib/api/admin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import type { Clinic, Doctor } from "@/types/api";

export default function AdminDoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doctor, setDoctor] = useState<(Doctor & { clinicId?: Clinic }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renewLoading, setRenewLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [months, setMonths] = useState("1");
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadDoctor() {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getDoctorById(id);
      setDoctor(res.data.doctor);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر جلب بيانات الطبيب");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDoctor(); }, [id]);

  async function handleRenew() {
    const n = Number(months);
    if (!Number.isFinite(n) || n <= 0) return;
    setRenewLoading(true);
    setActionMsg(null);
    try {
      await renewDoctorSubscription(id, { monthNumber: n });
      setActionMsg({ type: "success", text: ` تم تجديد الاشتراك لمدة ${n} شهر بنجاح` });
      loadDoctor();
    } catch (err) {
      setActionMsg({ type: "error", text: err instanceof ApiError ? err.message : "تعذّر تجديد الاشتراك" });
    } finally {
      setRenewLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`هل أنت متأكد من حذف حساب الطبيب "${doctor?.firstName} ${doctor?.lastName}"؟\nسيتم حذف عيادته أيضاً.`)) return;
    setDeleteLoading(true);
    try {
      await deleteDoctor(id);
      router.push("/admin/doctors");
    } catch (err) {
      setActionMsg({ type: "error", text: err instanceof ApiError ? err.message : "تعذّر حذف الطبيب" });
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-3xl animate-fade-in">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-border/50" />)}
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <Card className="mx-auto max-w-lg text-center p-8 border-danger/30">
        <p className="font-bold text-danger">{error ?? "لم يتم العثور على الطبيب"}</p>
        <Button className="mt-4" variant="secondary" onClick={() => router.back()}>العودة</Button>
      </Card>
    );
  }

  const clinic = typeof doctor.clinicId === "object" ? doctor.clinicId : null;
  const subExpired = doctor.paidExpired ? new Date(doctor.paidExpired) < new Date() : true;

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-3xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors w-fit"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        العودة لقائمة الأطباء
      </button>

      {/* Doctor Hero */}
      <Card glass vibrant className="border-primary/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 text-2xl font-black text-primary">
            {doctor.firstName?.[0]?.toUpperCase() ?? "د"}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-extrabold text-text-primary">
                د. {doctor.firstName} {doctor.lastName}
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  doctor.isPaid && !subExpired
                    ? "bg-success/15 text-success border border-success/30"
                    : "bg-warning/15 text-warning border border-warning/30"
                }`}
              >
                {doctor.isPaid && !subExpired ? "اشتراك فعّال" : "اشتراك منتهي"}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-text-secondary">
              <span>{doctor.email}</span>
              <span>{doctor.phoneNumber}</span>
              <span>@{doctor.userName}</span>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-surface-raised px-4 py-3">
            <p className="text-xs text-text-secondary">تاريخ الانتهاء</p>
            <p className="mt-1 text-sm font-bold text-text-primary">
              {doctor.paidExpired
                ? new Date(doctor.paidExpired).toLocaleDateString("ar-EG")
                : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-surface-raised px-4 py-3">
            <p className="text-xs text-text-secondary">تاريخ التسجيل</p>
            <p className="mt-1 text-sm font-bold text-text-primary">
              {new Date(doctor.createdAt).toLocaleDateString("ar-EG")}
            </p>
          </div>
          <div className="rounded-xl bg-surface-raised px-4 py-3 col-span-2 sm:col-span-1">
            <p className="text-xs text-text-secondary">عيادة مسجّلة</p>
            <p className="mt-1 text-sm font-bold text-text-primary">
              {clinic ? clinic.name : "لا توجد عيادة"}
            </p>
          </div>
        </div>
      </Card>

      {/* Clinic Details */}
      {clinic && (
        <Card>
          <h2 className="font-display text-base font-bold text-text-primary mb-4">بيانات العيادة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "اسم العيادة", value: clinic.name },
              { label: "التخصص", value: clinic.specialization },
              { label: "المحافظة", value: clinic.governorate },
              { label: "المدينة", value: clinic.city },
              { label: "سعر الكشف", value: `${clinic.consultationPrice} ج.م` },
              { label: "هاتف العيادة", value: clinic.phoneNumber },
              { label: "البريد الإلكتروني", value: clinic.email },
              { label: "العنوان", value: clinic.street ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-surface-raised px-4 py-3">
                <p className="text-xs text-text-secondary">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-text-primary">{value}</p>
              </div>
            ))}
          </div>

          {clinic.workingDays && clinic.workingDays.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold text-text-secondary mb-2">أيام العمل</p>
              <div className="flex flex-wrap gap-2">
                {clinic.workingDays.map((d) => (
                  <span key={d.day} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {d.day} ({d.from} — {d.to})
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Actions */}
      <Card className="border-warning/20">
        <h2 className="font-display text-base font-bold text-text-primary mb-4">إجراءات الاشتراك</h2>

        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-text-secondary">عدد الأشهر للتجديد</label>
            <input
              type="number"
              min={1}
              max={36}
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              className="w-28 rounded-xl border border-border/80 bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition-colors"
            />
          </div>
          <Button
            variant="vibrant"
            disabled={renewLoading}
            onClick={handleRenew}
            className="shadow-glow-cyan"
          >
            {renewLoading ? "جارٍ التجديد..." : `تجديد لـ ${months} شهر`}
          </Button>
        </div>

        {actionMsg && (
          <div
            className={`mt-3 rounded-xl px-4 py-2.5 text-sm font-medium ${
              actionMsg.type === "success"
                ? "bg-success/10 text-success border border-success/20"
                : "bg-danger/10 text-danger border border-danger/20"
            }`}
          >
            {actionMsg.text}
          </div>
        )}
      </Card>

      {/* Danger Zone */}
      <Card className="border-danger/20">
        <h2 className="font-display text-base font-bold text-danger mb-2">منطقة الخطر</h2>
        <p className="text-xs text-text-secondary mb-4">
          حذف الطبيب سيؤدي إلى حذف عيادته أيضاً. هذا الإجراء لا يمكن التراجع عنه.
        </p>
        <Button variant="danger" disabled={deleteLoading} onClick={handleDelete}>
          {deleteLoading ? "جارٍ الحذف..." : "حذف حساب الطبيب"}
        </Button>
      </Card>
    </div>
  );
}
