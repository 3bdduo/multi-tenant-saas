"use client";

import { useEffect, useState, useMemo } from "react";
import { getPatients, deletePatient } from "@/lib/api/admin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import { ApiError } from "@/lib/http";
import type { Patient } from "@/types/api";

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getPatients();
      setPatients(res.data.patients ?? []);
    } catch (err) {
      console.error("Failed to load patients:", err);
      setError(err instanceof ApiError ? err.message : "تعذر تحميل قائمة المرضى");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRemove(id: string, name: string) {
    if (!confirm(`هل أنت متأكد من حذف حساب المريض ${name} نهائياً؟`)) return;
    
    try {
      await deletePatient(id);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "حدث خطأ أثناء حذف المريض.");
    }
  }

  const filteredAndSortedPatients = useMemo(() => {
    const filtered = patients.filter((p) => {
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      return (
        fullName.includes(term) ||
        (p.nationalId || "").includes(term) ||
        (p.phoneNumber || "").includes(term)
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === "name") {
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      } else if (sortBy === "date_desc") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "date_asc") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return 0;
    });
  }, [patients, searchQuery, sortBy]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">
            إدارة حسابات المرضى
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            عرض جميع المرضى، البحث، وتصفية البيانات
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={load}
          disabled={loading}
          className="font-bold"
        >
          {loading ? "جارٍ التحديث..." : "تحديث البيانات"}
        </Button>
      </div>

      <Card className="shadow-xl border-primary/20">
        <div className="flex flex-col sm:flex-row gap-4 items-end mb-6">
          <div className="flex-1 w-full">
            <Field
              label="بحث"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، الرقم القومي، أو الهاتف..."
            />
          </div>
          <div className="w-full sm:w-64">
            <label className="block text-sm font-bold text-text-secondary mb-2">ترتيب حسب</label>
            <select 
              className="w-full h-[42px] px-4 rounded-xl bg-surface-raised border border-border text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date_desc">الأحدث أولاً</option>
              <option value="date_asc">الأقدم أولاً</option>
              <option value="name">الاسم (أبجدي)</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-danger/10 border border-danger/20 p-4 text-sm font-bold text-danger">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[650px]">
            <thead>
              <tr className="border-b border-border bg-surface-raised text-text-secondary">
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right whitespace-nowrap">الاسم</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center whitespace-nowrap">الرقم القومي</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center whitespace-nowrap">الهاتف</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center whitespace-nowrap">تاريخ التسجيل</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSortedPatients.map((p) => (
                <tr key={p._id} className="hover:bg-surface-raised/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-text-primary text-right align-middle whitespace-nowrap">
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="px-6 py-4 text-text-secondary text-center align-middle whitespace-nowrap">{p.nationalId || "—"}</td>
                  <td className="px-6 py-4 text-text-secondary text-center align-middle whitespace-nowrap" dir="ltr">{p.phoneNumber}</td>
                  <td className="px-6 py-4 text-text-secondary text-center align-middle whitespace-nowrap">
                    {new Date(p.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-6 py-4 text-center align-middle whitespace-nowrap">
                    <div className="flex justify-center items-center">
                      <Button size="sm" variant="danger" onClick={() => handleRemove(p._id, `${p.firstName} ${p.lastName}`)} className="justify-center text-xs">
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filteredAndSortedPatients.length === 0 && (
          <p className="py-12 text-center text-sm text-text-secondary">
            {patients.length === 0 ? "لا يوجد مرضى مسجلين بعد" : "لم يتم العثور على نتائج مطابقة للبحث"}
          </p>
        )}
      </Card>
    </div>
  );
}
