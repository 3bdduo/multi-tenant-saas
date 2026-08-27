"use client";

import { useEffect, useState } from "react";
import { getMyHospital, getEmergencyCases, claimEmergencyCase, resolveEmergencyCase } from "@/lib/api/hospital";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import type { Hospital, EmergencyCase } from "@/types/api";

const STATUS_MAP: Record<string, { label: string; badge: string }> = {
  open:     { label: "بانتظار الاستجابة", badge: "bg-warning/15 text-warning border-warning/30" },
  claimed:  { label: "تم الاستلام",       badge: "bg-primary/15 text-primary border-primary/30" },
  resolved: { label: "تم الحل",           badge: "bg-success/15 text-success border-success/30" },
  expired:  { label: "منتهية / ملغاة",    badge: "bg-border/30 text-text-secondary border-border/40" },
};

export default function HospitalDashboard() {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [hospRes, casesRes] = await Promise.all([
        getMyHospital(),
        getEmergencyCases(),
      ]);
      setHospital(hospRes.data.hospital);
      setCases(casesRes.data.emergencies ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleClaim(id: string) {
    setActionLoading(id);
    try {
      await claimEmergencyCase(id);
      await loadData();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "فشل العملية");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResolve(id: string) {
    setActionLoading(id + "_resolve");
    try {
      await resolveEmergencyCase(id);
      await loadData();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "فشل العملية");
    } finally {
      setActionLoading(null);
    }
  }

  const pendingCases = cases.filter((c) => c.status === "open");
  const activeCases = cases.filter((c) => c.status === "claimed");
  const resolvedCases = cases.filter((c) => c.status === "resolved");

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-danger/10 border border-danger/20 p-6 text-center text-danger font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">

      {/* Welcome Banner */}
      {hospital && (
        <Card glass vibrant className="p-6 border-violet-500/20 shadow-xl">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-glow-purple">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 21h18" /><path d="M19 21v-4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4" />
                <path d="M5 15V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8" />
                <path d="M12 9v4" /><path d="M10 11h4" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-extrabold text-text-primary">
                مرحباً، {hospital.hospitalName}
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                {hospital.address} — {hospital.city}، {hospital.governorate}
              </p>
            </div>
            <div className={`rounded-full px-4 py-1.5 text-xs font-bold border ${
              hospital.isPaid
                ? "bg-success/10 text-success border-success/30"
                : "bg-warning/10 text-warning border-warning/30"
            }`}>
              {hospital.isPaid ? "✅ اشتراك فعّال" : "⚠️ اشتراك غير مفعّل"}
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "حالات معلقة", value: pendingCases.length, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
          { label: "حالات جارية", value: activeCases.length, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
          { label: "حالات محلولة", value: resolvedCases.length, color: "text-success", bg: "bg-success/10", border: "border-success/20" },
        ].map((stat) => (
          <Card key={stat.label} className={`p-5 border ${stat.border} ${stat.bg}`}>
            <p className="text-sm font-semibold text-text-secondary">{stat.label}</p>
            <p className={`mt-1 font-display text-4xl font-extrabold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Emergency Cases Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
            <span className="text-danger">🚨</span>
            تقارير الطوارئ الواردة ({cases.length})
          </h2>
          <Button variant="ghost" size="sm" onClick={loadData}>تحديث</Button>
        </div>

        {cases.length === 0 ? (
          <div className="py-12 text-center text-text-secondary">
            <div className="text-5xl mb-3">🏥</div>
            <p className="font-semibold">لا توجد تقارير طوارئ حالياً</p>
            <p className="text-xs mt-1">ستظهر هنا فور إرسال أي طبيب تقريراً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-right text-text-secondary bg-surface-elevated/50">
                  <th className="px-4 py-3 font-semibold">كود الحالة</th>
                  <th className="px-4 py-3 font-semibold">رقم الهاتف</th>
                  <th className="px-4 py-3 font-semibold">الملاحظات</th>
                  <th className="px-4 py-3 font-semibold">الحالة</th>
                  <th className="px-4 py-3 font-semibold">الوقت</th>
                  <th className="px-4 py-3 font-semibold">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {cases.map((ec) => {
                  const st = STATUS_MAP[ec.status] ?? { label: ec.status, badge: "" };
                  const isActioning = actionLoading === ec._id || actionLoading === ec._id + "_resolve";
                  return (
                    <tr key={ec._id} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-text-primary">{ec.caseCode}</td>
                      <td className="px-4 py-3 text-text-secondary">{ec.phoneNumber}</td>
                      <td className="px-4 py-3 text-text-secondary max-w-[200px] truncate">{ec.notes ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold border ${st.badge}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-secondary">
                        {new Date(ec.createdAt).toLocaleString("ar-EG")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {ec.status === "open" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={isActioning}
                              onClick={() => handleClaim(ec._id)}
                              className="text-xs"
                            >
                              {isActioning ? "..." : "استلام الحالة"}
                            </Button>
                          )}
                          {ec.status === "claimed" && (
                            <Button
                              size="sm"
                              variant="vibrant"
                              disabled={isActioning}
                              onClick={() => handleResolve(ec._id)}
                              className="text-xs"
                            >
                              {isActioning ? "..." : "تم الحل ✓"}
                            </Button>
                          )}
                          {ec.reportImageUrl?.secure_url && (
                            <a
                              href={ec.reportImageUrl.secure_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              📎 التقرير
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
