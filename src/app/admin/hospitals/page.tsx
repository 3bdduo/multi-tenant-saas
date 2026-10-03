"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  getHospitals,
  renewHospitalSubscription,
  deleteHospital,
} from "@/lib/api/admin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import type { Hospital } from "@/types/api";

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState<Hospital | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getHospitals();
      setHospitals(res.data.hospitals ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر جلب المستشفيات");
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function renew(id: string, name: string) {
    const input = window.prompt(`تجديد اشتراك "${name}" — كم شهر؟`, "1");
    if (!input) return;
    const monthNumber = Number(input);
    if (!Number.isFinite(monthNumber) || monthNumber <= 0) {
      alert("الرجاء إدخال عدد صحيح أكبر من صفر");
      return;
    }
    try {
      await renewHospitalSubscription(id, { monthNumber });
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "تعذّر تجديد الاشتراك");
    }
  }

  async function confirmDelete() {
    if (!hospitalToDelete) return;
    setDeleting(true);
    try {
      await deleteHospital(hospitalToDelete._id);
      setHospitals((prev) => prev.filter((h) => h._id !== hospitalToDelete._id));
      setHospitalToDelete(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "تعذّر حذف المستشفى");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">
            إدارة المستشفيات
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            عرض وتفعيل اشتراكات وحذف المستشفيات المسجّلة في المنصة
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? "جارٍ التحميل..." : "تحديث"}
        </Button>
      </div>

      {error && (
        <div className="rounded-xl bg-danger/10 border border-danger/20 p-4 text-sm font-bold text-danger">
          {error}
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-surface-raised text-text-secondary">
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right whitespace-nowrap">الاسم</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center whitespace-nowrap">البريد الإلكتروني</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center whitespace-nowrap">الهاتف</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center whitespace-nowrap">الاشتراك</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center whitespace-nowrap">تاريخ الانتهاء</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {hospitals.map((h) => {
                const expired = h.paidExpired
                  ? new Date(h.paidExpired) < new Date()
                  : true;
                const isActive = h.isPaid && !expired;
                return (
                  <tr key={h._id} className="hover:bg-surface-raised/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary text-right align-middle whitespace-nowrap">
                      <Link
                        href={`/admin/hospitals/${h._id}`}
                        className="hover:text-primary hover:underline font-bold transition-colors"
                      >
                        {h.hospitalName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-center align-middle whitespace-nowrap">{h.email}</td>
                    <td className="px-6 py-4 text-text-secondary text-center align-middle whitespace-nowrap" dir="ltr">{h.phoneNumber}</td>
                    <td className="px-6 py-4 text-center align-middle whitespace-nowrap">
                      <div className="flex justify-center items-center">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold ${
                            isActive
                              ? "bg-success/15 text-success border border-success/30"
                              : "bg-warning/15 text-warning border border-warning/30"
                          }`}
                        >
                          {isActive ? "فعّال" : "منتهي"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-xs text-center align-middle whitespace-nowrap">
                      {h.paidExpired
                        ? new Date(h.paidExpired).toLocaleDateString("ar-EG")
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-center align-middle whitespace-nowrap">
                      <div className="flex gap-2 justify-center items-center">
                        <Link href={`/admin/hospitals/${h._id}`}>
                          <Button size="sm" variant="outline" className="text-xs justify-center">عرض</Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => renew(h._id, h.hospitalName)}
                          className="text-xs justify-center"
                        >
                          تجديد
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setHospitalToDelete(h)}
                          className="text-danger hover:bg-danger/10 hover:text-danger text-xs font-bold justify-center"
                        >
                          حذف
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && hospitals.length === 0 && !error && (
          <p className="py-12 text-center text-sm text-text-secondary">
            لا توجد مستشفيات مسجّلة بعد
          </p>
        )}
        {loading && (
          <div className="py-12 flex justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {hospitalToDelete && mounted && createPortal(
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
          onClick={() => setHospitalToDelete(null)}
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
                  حذف المستشفى نهائياً
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
                  هل أنت متأكد من رغبتك في حذف مستشفى <strong>&quot;{hospitalToDelete.hospitalName}&quot;</strong> نهائياً من المنصة؟
                  لن يتمكن طاقم المستشفى من الدخول أو استلام حالات الطوارئ بعد ذلك.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-4">
                <Button
                  variant="danger"
                  className="flex-1 font-bold"
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? "جارٍ الحذف..." : "نعم، حذف المستشفى"}
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 font-bold"
                  onClick={() => setHospitalToDelete(null)}
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
