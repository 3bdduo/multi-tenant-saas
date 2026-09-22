"use client";

import { useEffect, useState } from "react";
import { getDashboard } from "@/lib/api/admin";
import { Card } from "@/components/ui/Card";
import type { DashboardStats } from "@/types/api";

const LABELS: Record<keyof DashboardStats, string> = {
  totalDoctor: "إجمالي الأطباء",
  activeDoctors: "الأطباء النشطون",
  expiredSubscriptions: "اشتراكات منتهية",
  totalPatients: "إجمالي المرضى",
  totalHospitals: "إجمالي المستشفيات",
  emergencyCompleted: "حالات طوارئ مكتملة",
  emergencyNotCompleted: "حالات طوارئ قيد الانتظار",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboard()
      .then((res) => setStats(res.data.result))
      .catch((err) => {
        console.error("Failed to load dashboard stats:", err);
        setStats(null);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
        {stats
          ? (Object.keys(LABELS) as (keyof DashboardStats)[]).map((key) => (
              <Card key={key}>
                <p className="text-sm text-text-secondary">{LABELS[key]}</p>
                <p className="mt-2 font-display text-3xl font-bold text-text-primary">
                  {stats[key] ?? 0}
                </p>
              </Card>
            ))
          : [0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-border/50" />
            ))}
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 animate-fade-in">
          <Card>
            <p className="text-sm text-text-secondary">حالات الطوارئ المكتملة</p>
            <p className="mt-2 font-display text-3xl font-bold text-success">
              {stats.emergencyCompleted ?? 0}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-text-secondary">حالات الطوارئ غير المكتملة</p>
            <p className="mt-2 font-display text-3xl font-bold text-danger">
              {stats.emergencyNotCompleted ?? 0}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
