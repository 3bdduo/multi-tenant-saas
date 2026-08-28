"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getHospitals,
  renewHospitalSubscription,
} from "@/lib/api/admin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import type { Hospital } from "@/types/api";

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">
            إدارة المستشفيات
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            عرض وتفعيل اشتراكات المستشفيات المسجّلة في المنصة
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
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="border-b border-border bg-surface-raised text-text-secondary">
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">الاسم</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">البريد الإلكتروني</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">الهاتف</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">الاشتراك</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">تاريخ الانتهاء</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-left">إجراءات</th>
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
                    <td className="px-6 py-4 font-medium text-text-primary">
                      <Link
                        href={`/admin/hospitals/${h._id}`}
                        className="hover:text-primary hover:underline font-bold transition-colors"
                      >
                        {h.hospitalName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{h.email}</td>
                    <td className="px-6 py-4 text-text-secondary">{h.phoneNumber}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                          isActive
                            ? "bg-success/15 text-success border border-success/30"
                            : "bg-warning/15 text-warning border border-warning/30"
                        }`}
                      >
                        {isActive ? "فعّال" : "منتهي"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-xs">
                      {h.paidExpired
                        ? new Date(h.paidExpired).toLocaleDateString("ar-EG")
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/admin/hospitals/${h._id}`}>
                          <Button size="sm" variant="outline">عرض</Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => renew(h._id, h.hospitalName)}
                        >
                          تجديد
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
    </div>
  );
}
