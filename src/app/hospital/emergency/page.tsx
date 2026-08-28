"use client";

import { useEffect, useState } from "react";
import { getEmergencyCases, claimEmergencyCase, resolveEmergencyCase } from "@/lib/api/hospital";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import type { EmergencyCase } from "@/types/api";

const STATUS_MAP: Record<string, { label: string; badge: string }> = {
  open:     { label: "بانتظار الاستجابة", badge: "bg-warning/15 text-warning border-warning/30" },
  claimed:  { label: "تم الاستلام",       badge: "bg-primary/15 text-primary border-primary/30" },
  resolved: { label: "تم الحل",           badge: "bg-success/15 text-success border-success/30" },
  expired:  { label: "منتهية / ملغاة",    badge: "bg-border/30 text-text-secondary border-border/40" },
};

export default function HospitalEmergencyPage() {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "claimed" | "resolved">("all");
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

  async function handleClaim(id: string) {
    setActionLoading(id);
    try {
      await claimEmergencyCase(id);
      await loadCases();
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
      await loadCases();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "فشل العملية");
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = filter === "all" ? cases : cases.filter((c) => c.status === filter);

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
      <div className="flex gap-2 flex-wrap">
        {(["all", "open", "claimed", "resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all border ${
              filter === f
                ? "bg-primary text-surface border-primary shadow-glow-cyan"
                : "border-border text-text-secondary hover:border-primary/50 hover:text-text-primary"
            }`}
          >
            {{all:"الكل", open:"مفتوحة", claimed:"جارية", resolved:"محلولة"}[f]}
            {" "}({(f === "all" ? cases : cases.filter((c) => c.status === f)).length})
          </button>
        ))}
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
        <div className="grid gap-4">
          {filtered.map((ec) => {
            const st = STATUS_MAP[ec.status] ?? { label: ec.status, badge: "" };
            const isActioning = actionLoading === ec._id || actionLoading === ec._id + "_resolve";
            return (
              <Card key={ec._id} glass className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 border-border/40 hover:border-primary/30 transition-all">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="font-mono text-base font-extrabold text-text-primary">{ec.caseCode}</span>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold border ${st.badge}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
                    <span>الهاتف: {ec.phoneNumber}</span>
                    {ec.notes && <span>الملاحظات: {ec.notes}</span>}
                    <span>الوقت: {new Date(ec.createdAt).toLocaleString("ar-EG")}</span>
                    <span>المستجيبون: {ec.claimedByHospitalIds?.length ?? 0} مستشفى</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {ec.reportImageUrl?.secure_url && (
                    <a href={ec.reportImageUrl.secure_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="text-xs">عرض التقرير</Button>
                    </a>
                  )}
                  {ec.status === "open" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isActioning}
                      onClick={() => handleClaim(ec._id)}
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
