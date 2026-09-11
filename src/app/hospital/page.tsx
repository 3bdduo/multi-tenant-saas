"use client";

import { useEffect, useState } from "react";
import { getMyHospital, getEmergencyCases, claimEmergencyCase, resolveEmergencyCase } from "@/lib/api/hospital";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import type { Hospital, EmergencyCase } from "@/types/api";

const STATUS_MAP: Record<string, { label: string; badge: string }> = {
  open: { label: "بانتظار الاستجابة (جديدة)", badge: "bg-warning/15 text-warning border-warning/30" },
  claimed: { label: "تم الاستلام (جارية)", badge: "bg-primary/15 text-primary border-primary/30" },
  resolved: { label: "تم الحل", badge: "bg-success/15 text-success border-success/30" },
  expired: { label: "منتهية / ملغاة", badge: "bg-border/30 text-text-secondary border-border/40" },
};

export default function HospitalDashboard() {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "claimed" | "resolved">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

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
    setSuccessToast(null);
    try {
      await claimEmergencyCase(id);
      setSuccessToast("تم استلام وقبول الحالة بنجاح! يمكنك الآن التنسيق مع الحالة.");
      setTimeout(() => setSuccessToast(null), 4000);
      await loadData();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "فشلت عملية قبول الحالة");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResolve(id: string) {
    setActionLoading(id + "_resolve");
    setSuccessToast(null);
    try {
      await resolveEmergencyCase(id);
      setSuccessToast("تم تحويل الحالة إلى (تم الحل بنجاح).");
      setTimeout(() => setSuccessToast(null), 4000);
      await loadData();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "فشلت عملية تحديث الحالة");
    } finally {
      setActionLoading(null);
    }
  }

  const pendingCases = cases.filter((c) => (c.status || "").toLowerCase() === "open");
  const activeCases = cases.filter((c) => (c.status || "").toLowerCase() === "claimed");
  const resolvedCases = cases.filter((c) => (c.status || "").toLowerCase() === "resolved");

  const filteredCases = filter === "all"
    ? cases
    : cases.filter((c) => (c.status || "").toLowerCase() === filter);

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
        <Card glass vibrant className="p-6 border-cyan-400/20 shadow-xl">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 dark:from-amber-700 dark:to-amber-800 text-white shadow-sm">
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
            {(() => {
              const isExpired = hospital.paidExpired ? new Date(hospital.paidExpired) < new Date() : false;
              const isActive = Boolean(hospital.isPaid && !isExpired);
              return (
                <div className={`rounded-full px-4 py-1.5 text-xs font-bold border ${isActive
                  ? "bg-success/10 text-success border-success/30"
                  : "bg-warning/10 text-warning border-warning/30"
                  }`}>
                  {isActive ? "اشتراك فعّال" : "اشتراك غير مفعّل"}
                </div>
              );
            })()}
          </div>
        </Card>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="rounded-2xl bg-success/10 border border-success/30 px-5 py-3 text-sm font-bold text-success animate-fade-in flex items-center gap-2">
          <span>✓ {successToast}</span>
        </div>
      )}

      {/* Stats Cards (Clickable filters) */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { key: "open" as const, label: "حالات بانتظار الاستجابة (مفتوحة)", value: pendingCases.length, color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
          { key: "claimed" as const, label: "حالات تم قبولها (جارية)", value: activeCases.length, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
          { key: "resolved" as const, label: "حالات تم علاجها (محلولة)", value: resolvedCases.length, color: "text-success", bg: "bg-success/10", border: "border-success/30" },
        ].map((stat) => (
          <Card
            key={stat.label}
            onClick={() => setFilter(stat.key)}
            className={`p-5 border cursor-pointer transition-all hover:scale-[1.02] ${stat.border} ${stat.bg} ${filter === stat.key ? "ring-2 ring-primary shadow-glow-cyan" : ""
              }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-bold text-text-secondary">{stat.label}</p>
              {filter === stat.key && (
                <span className="text-[10px] bg-primary text-surface font-extrabold px-2 py-0.5 rounded-full">
                  المعروض
                </span>
              )}
            </div>
            <p className={`mt-2 font-display text-4xl font-extrabold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(["all", "open", "claimed", "resolved"] as const).map((f) => {
          const count = f === "all" ? cases.length : f === "open" ? pendingCases.length : f === "claimed" ? activeCases.length : resolvedCases.length;
          const labels = { all: "جميع الحالات", open: "بانتظار الاستجابة", claimed: "جارية ومستلمة", resolved: "تم حلها" };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-4 py-2 text-xs font-bold border transition-all shrink-0 whitespace-nowrap ${filter === f
                ? "bg-primary text-surface border-primary shadow-glow-cyan font-extrabold"
                : "border-border text-text-secondary hover:border-primary/50 hover:text-text-primary bg-surface-raised"
                }`}
            >
              {labels[f]} ({count})
            </button>
          );
        })}
      </div>

      {/* Emergency Cases Table & Cards */}
      <Card className="p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-lg font-bold text-text-primary">
              تقارير الطوارئ الواردة ({filteredCases.length})
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              يمكنك قبول واستلام الحالات المفتوحة فوراً ومتابعة حالتها
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={loadData}>تحديث</Button>
        </div>

        {filteredCases.length === 0 ? (
          <div className="py-12 text-center text-text-secondary bg-surface-raised rounded-2xl border border-border/40 border-dashed">
            <p className="font-semibold">لا توجد تقارير طوارئ في هذا القسم</p>
            <p className="text-xs mt-1">ستظهر الحالات هنا فور إرسالها من الأطباء والمسعفين</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-border text-text-secondary bg-surface-elevated/50">
                  <th className="px-4 py-3 font-bold text-center whitespace-nowrap">كود الحالة</th>
                  <th className="px-4 py-3 font-bold text-center whitespace-nowrap">رقم الهاتف</th>
                  <th className="px-4 py-3 font-bold text-right whitespace-nowrap">الملاحظات</th>
                  <th className="px-4 py-3 font-bold text-center whitespace-nowrap">الحالة</th>
                  <th className="px-4 py-3 font-bold text-center whitespace-nowrap">الوقت</th>
                  <th className="px-4 py-3 font-bold text-center whitespace-nowrap">إجراءات الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCases.map((ec) => {
                  const normalizedStatus = (ec.status || "").toLowerCase();
                  const st = STATUS_MAP[normalizedStatus] ?? { label: ec.status, badge: "bg-surface text-text-primary border-border" };
                  const isActioning = actionLoading === ec._id || actionLoading === ec._id + "_resolve";
                  const isOpen = normalizedStatus === "open";
                  const isClaimed = normalizedStatus === "claimed";

                  return (
                    <tr key={ec._id} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-text-primary text-center align-middle whitespace-nowrap">
                        {ec.caseCode}
                      </td>
                      <td className="px-4 py-3.5 text-text-secondary font-mono text-center align-middle whitespace-nowrap" dir="ltr">
                        {ec.phoneNumber}
                      </td>
                      <td className="px-4 py-3.5 text-text-secondary max-w-[220px] truncate text-right align-middle whitespace-nowrap" title={ec.notes}>
                        {ec.notes || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-center align-middle whitespace-nowrap">
                        <div className="flex justify-center items-center">
                          <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold border ${st.badge}`}>
                            {st.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-text-secondary text-center align-middle whitespace-nowrap">
                        {new Date(ec.createdAt).toLocaleString("ar-EG")}
                      </td>
                      <td className="px-4 py-3.5 text-center align-middle whitespace-nowrap">
                        <div className="flex items-center gap-2 justify-center whitespace-nowrap">
                          {isOpen && (
                            <Button
                              size="sm"
                              variant="vibrant"
                              disabled={isActioning}
                              onClick={() => handleClaim(ec._id)}
                              className="text-xs font-bold shadow-xs hover:shadow-sm"
                            >
                              {isActioning ? "جارٍ القبول..." : "قبول واستلام الحالة ✓"}
                            </Button>
                          )}

                          {isClaimed && (
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={isActioning}
                              onClick={() => handleResolve(ec._id)}
                              className="text-xs font-bold bg-success/20 text-success border-success/30 hover:bg-success/30 shadow-xs hover:shadow-sm"
                            >
                              {isActioning ? "جارٍ التحديث..." : "تم علاج الحالة"}
                            </Button>
                          )}

                          {ec.reportImageUrl?.secure_url && (
                            <a
                              href={ec.reportImageUrl.secure_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/15 transition-colors text-xs font-bold whitespace-nowrap inline-flex items-center justify-center"
                            >
                              عرض التقرير
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