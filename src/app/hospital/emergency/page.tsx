"use client";

import { useEffect, useState } from "react";
import { getEmergencyCases, acceptEmergencyCase, resolveEmergencyCase } from "@/lib/api/hospital";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import { useAuth } from "@/hooks/useAuth";
import type { EmergencyCase } from "@/types/api";

const STATUS_MAP: Record<string, { label: string; badge: string }> = {
  open:     { label: "بانتظار الاستجابة", badge: "bg-warning/15 text-warning border-warning/30" },
  claimed:  { label: "تم الاستلام",       badge: "bg-primary/15 text-primary border-primary/30" },
  accepted: { label: "تم القبول",         badge: "bg-primary/15 text-primary border-primary/30" },
  resolved: { label: "تم الحل",           badge: "bg-success/15 text-success border-success/30" },
  expired:  { label: "منتهية / ملغاة",    badge: "bg-border/30 text-text-secondary border-border/40" },
};

export default function HospitalEmergencyPage() {
  const { userId: myId } = useAuth();
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "accepted" | "resolved">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadCases() {
    setLoading(true);
    try {
      const res = await getEmergencyCases();
      setCases(res.data.emergencies ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر تحميل التقارير");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCases(); }, []);

  async function handleAccept(id: string) {
    setActionLoading(id);
    try {
      await acceptEmergencyCase(id);
      await loadCases();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "تم قبول هذه الحالة بالفعل من مستشفى أخرى");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResolve(id: string) {
    setActionLoading(id + "_resolve");
    try {
      await resolveEmergencyCase(id);
      await loadCases();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "فشل العملية");
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = filter === "all"
    ? cases
    : cases.filter((c) => (c.status || "").toLowerCase() === filter);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">
            تقارير الطوارئ الواردة
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            اعرض وادِر الحالات الطارئة الواردة من الأطباء والمسعفين
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadCases}>تحديث</Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 pt-1 scrollbar-hide">
        {(["all", "open", "accepted", "resolved"] as const).map((f) => {
          const count = f === "all" ? cases.length : cases.filter((c) => (c.status || "").toLowerCase() === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold border transition-all shrink-0 whitespace-nowrap ${
                filter === f
                  ? "bg-primary text-surface border-primary shadow-glow-cyan"
                  : "border-border text-text-secondary hover:border-primary/50 hover:text-text-primary"
              }`}
            >
              {{all:"الكل", open:"مفتوحة (جديدة)", accepted:"مقبولة", resolved:"محلولة"}[f]}
              {" "}({count})
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-xl bg-danger/10 border border-danger/20 p-4 text-sm text-danger font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center text-text-secondary">
          <p className="font-semibold">لا توجد حالات في هذا الفلتر</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {filtered.map((ec) => {
            const normalizedStatus = (ec.status || "").toLowerCase();
            const st = STATUS_MAP[normalizedStatus] ?? { label: ec.status, badge: "bg-surface text-text-primary border-border" };
            const isActioning = actionLoading === ec._id || actionLoading === ec._id + "_resolve";
            const isOpen = normalizedStatus === "open";
            const isAccepted = normalizedStatus === "accepted";
            const acceptedHospitalId =
              typeof ec.acceptedByHospitalId === "object"
                ? ec.acceptedByHospitalId?._id
                : ec.acceptedByHospitalId;
            const acceptedByMe = isAccepted && acceptedHospitalId === myId;
            const acceptedHospitalName =
              typeof ec.acceptedByHospitalId === "object" ? ec.acceptedByHospitalId?.hospitalName : null;

            return (
              <Card key={ec._id} glass className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-border/40 hover:border-primary/30 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5">
                    <span className="font-mono text-sm sm:text-base font-extrabold text-text-primary">{ec.caseCode}</span>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] sm:text-xs font-bold border ${st.badge}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
                    <span>الهاتف: {ec.phoneNumber}</span>
                    {ec.notes && <span>الملاحظات: {ec.notes}</span>}
                    <span>الوقت: {new Date(ec.createdAt).toLocaleString("ar-EG")}</span>
                    {isOpen && (
                      <span>شاهدها: {ec.viewedByHospitalIds?.length ?? 0} مستشفى</span>
                    )}
                    {isAccepted && acceptedHospitalName && !acceptedByMe && (
                      <span className="font-bold text-primary">مقبولة من: {acceptedHospitalName}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap pt-2 sm:pt-0 border-t border-border/40 sm:border-0 justify-end shrink-0">
                  {ec.reportImageUrl?.secure_url && (
                    <a href={ec.reportImageUrl.secure_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="text-xs">عرض التقرير</Button>
                    </a>
                  )}
                  {isOpen && (
                    <Button
                      size="sm"
                      variant="vibrant"
                      disabled={isActioning}
                      onClick={() => handleAccept(ec._id)}
                      className="text-xs font-bold shadow-glow-cyan"
                    >
                      {isActioning ? "..." : "قبول واستلام الحالة ✓"}
                    </Button>
                  )}
                  {acceptedByMe && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isActioning}
                      onClick={() => handleResolve(ec._id)}
                      className="text-xs font-bold bg-success/20 text-success border-success/30 hover:bg-success/30"
                    >
                      {isActioning ? "..." : "تم الحل"}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
