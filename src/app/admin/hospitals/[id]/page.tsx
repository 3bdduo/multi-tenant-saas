"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { getHospitalById, renewHospitalSubscription, deleteHospital } from "@/lib/api/admin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import type { Hospital } from "@/types/api";

export default function AdminHospitalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renewLoading, setRenewLoading] = useState(false);
  const [months, setMonths] = useState("1");
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function loadHospital() {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getHospitalById(id);
      setHospital(res.data.hospital);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر جلب بيانات المستشفى");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadHospital(); }, [id]);

  async function handleRenew() {
    const n = Number(months);
    if (!Number.isFinite(n) || n <= 0) return;
    setRenewLoading(true);
    setActionMsg(null);
    try {
      await renewHospitalSubscription(id, { monthNumber: n });
      setActionMsg({ type: "success", text: `تم تجديد الاشتراك لمدة ${n} شهر بنجاح` });
      loadHospital();
    } catch (err) {
      setActionMsg({
        type: "error",
        text: err instanceof ApiError ? err.message : "تعذّر تجديد الاشتراك",
      });
    } finally {
      setRenewLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-3xl animate-fade-in">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-border/50" />
        ))}
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <Card className="mx-auto max-w-lg text-center p-8 border-danger/30">
        <p className="font-bold text-danger">{error ?? "لم يتم العثور على المستشفى"}</p>
        <Button className="mt-4" variant="secondary" onClick={() => router.back()}>
          العودة
        </Button>
      </Card>
    );
  }

  const subExpired = hospital.paidExpired
    ? new Date(hospital.paidExpired) < new Date()
    : true;
  const isActive = hospital.isPaid && !subExpired;

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
        العودة لقائمة المستشفيات
      </button>

      {/* Hospital Hero */}
      <Card glass vibrant className="border-primary/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 text-primary">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" />
              <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
              <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
              <path d="M10 9h4" />
              <path d="M12 7v4" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-extrabold text-text-primary">
                {hospital.hospitalName}
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  isActive
                    ? "bg-success/15 text-success border border-success/30"
                    : "bg-warning/15 text-warning border border-warning/30"
                }`}
              >
                {isActive ? "اشتراك فعّال" : "اشتراك منتهي"}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-text-secondary">
              <span>البريد: {hospital.email}</span>
              <span>الهاتف: {hospital.phoneNumber}</span>
              <span>الرقم القومي: {hospital.nationalId}</span>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-surface-raised px-4 py-3">
            <p className="text-xs text-text-secondary">تاريخ الانتهاء</p>
            <p className="mt-1 text-sm font-bold text-text-primary">
              {hospital.paidExpired
                ? new Date(hospital.paidExpired).toLocaleDateString("ar-EG")
                : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-surface-raised px-4 py-3">
            <p className="text-xs text-text-secondary">تاريخ التسجيل</p>
            <p className="mt-1 text-sm font-bold text-text-primary">
              {new Date(hospital.createdAt).toLocaleDateString("ar-EG")}
            </p>
          </div>
          <div className="rounded-xl bg-surface-raised px-4 py-3 col-span-2 sm:col-span-1">
            <p className="text-xs text-text-secondary">الدور</p>
            <p className="mt-1 text-sm font-bold text-text-primary">Hospital</p>
          </div>
        </div>
      </Card>

      {/* Renew Subscription */}
      <Card className="border-warning/20">
        <h2 className="font-display text-base font-bold text-text-primary mb-4">
          إجراءات الاشتراك
        </h2>
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

      {/* Danger Zone: Delete Hospital */}
      <Card className="border-danger/30 bg-danger/5">
        <h2 className="font-display text-base font-bold text-danger mb-2">
          منطقة الحذف والتعطيل
        </h2>
        <p className="text-xs text-text-secondary mb-4 leading-relaxed">
          حذف المستشفى سيؤدي إلى إزالتها نهائياً من قائمة المستشفيات في المنصة وحذف صلاحيات الدخول لطاقمها.
        </p>
        <Button
          variant="danger"
          onClick={() => setShowDeleteModal(true)}
          className="font-bold"
        >
          حذف هذه المستشفى نهائياً
        </Button>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && mounted && createPortal(
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
          onClick={() => setShowDeleteModal(false)}
        >
          <Card
            className="max-w-md w-full shadow-2xl border-danger/30 bg-surface p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger text-3xl font-black">
                !
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-text-primary">
                  تأكيد حذف المستشفى
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
                  هل أنت متأكد من حذف مستشفى <strong>&quot;{hospital.hospitalName}&quot;</strong> نهائياً؟
                  هذا الإجراء لا يمكن التراجع عنه.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-4">
                <Button
                  variant="danger"
                  className="flex-1 font-bold"
                  disabled={deleting}
                  onClick={async () => {
                    setDeleting(true);
                    try {
                      await deleteHospital(id);
                      router.push("/admin/hospitals");
                    } catch (err) {
                      alert(err instanceof ApiError ? err.message : "تعذّر حذف المستشفى");
                      setDeleting(false);
                    }
                  }}
                >
                  {deleting ? "جارٍ الحذف..." : "نعم، احذف المستشفى"}
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 font-bold"
                  onClick={() => setShowDeleteModal(false)}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </Card>
        </div>,
        document.body
      )}
    </div>
  );
}
