"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { getDoctors, renewDoctorSubscription, deleteDoctor, createDoctorByAdmin } from "@/lib/api/admin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import { ApiError } from "@/lib/http";
import type { Doctor } from "@/types/api";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const [mounted, setMounted] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newDoctor, setNewDoctor] = useState({
    firstName: "",
    lastName: "",
    nationalId: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowCreateModal(false);
    }
    if (showCreateModal) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showCreateModal]);

  async function load() {
    setLoading(true);
    try {
      const res = await getDoctors();
      setDoctors(res.data.doctors ?? []);
    } catch (err) {
      console.error("Failed to load doctors:", err);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function renew(id: string) {
    const input = window.prompt("جدد الاشتراك لكام شهر؟", "1");
    if (!input) return;
    const monthNumber = Number(input);
    if (!Number.isFinite(monthNumber) || monthNumber <= 0) return;
    await renewDoctorSubscription(id, { monthNumber });
    load();
  }

  async function remove(id: string) {
    if (!confirm("هل أنت متأكد من حذف حساب هذا الطبيب وعيادته بالكامل؟")) return;
    await deleteDoctor(id);
    load();
  }

  async function handleCreateDoctor(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      await createDoctorByAdmin(newDoctor);
      setShowCreateModal(false);
      setNewDoctor({
        firstName: "",
        lastName: "",
        nationalId: "",
        phoneNumber: "",
        email: "",
        password: "",
      });
      load();
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "تعذّر إنشاء الطبيب");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">
            إدارة حسابات الأطباء
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            تفعيل، تجديد اشتراكات، وإضافة أطباء جدد يدوياً
          </p>
        </div>
        <Button 
          variant="vibrant" 
          className="font-bold shadow-glow-cyan"
          onClick={() => setShowCreateModal(true)}
        >
          + إضافة طبيب جديد
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[650px]">
            <thead>
              <tr className="border-b border-border bg-surface-raised text-text-secondary">
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right whitespace-nowrap">الاسم</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center whitespace-nowrap">البريد الإلكتروني</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center whitespace-nowrap">الاشتراك</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {doctors.map((d) => (
                <tr key={d._id} className="hover:bg-surface-raised/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-text-primary text-right align-middle whitespace-nowrap">
                    <Link href={`/admin/doctors/${d._id}`} className="hover:text-primary hover:underline font-bold transition-colors">
                      د. {d.firstName} {d.lastName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-text-secondary text-center align-middle whitespace-nowrap">{d.email}</td>
                  <td className="px-6 py-4 text-center align-middle whitespace-nowrap">
                    <div className="flex justify-center items-center">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold ${
                          d.isPaid ? "bg-success/15 text-success border border-success/30" : "bg-warning/15 text-warning border border-warning/30"
                        }`}
                      >
                        {d.isPaid ? "فعّال" : "منتهي"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center align-middle whitespace-nowrap">
                    <div className="flex gap-2 justify-center items-center">
                      <Link href={`/admin/doctors/${d._id}`}>
                        <Button size="sm" variant="outline" className="justify-center text-xs">
                          عرض
                        </Button>
                      </Link>
                      <Button size="sm" variant="secondary" onClick={() => renew(d._id)} className="justify-center text-xs">
                        تجديد
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => remove(d._id)} className="justify-center text-xs">
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && doctors.length === 0 && (
          <p className="py-12 text-center text-sm text-text-secondary">لا يوجد أطباء مسجلين بعد</p>
        )}
      </Card>

      {/* Create Doctor Modal */}
      {showCreateModal && mounted && createPortal(
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="relative w-full max-w-xl my-auto rounded-3xl bg-surface border border-border/80 shadow-2xl p-6 sm:p-8 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-5">
              <div>
                <h3 className="font-display text-xl font-bold text-text-primary">
                  تسجيل طبيب جديد (يدوياً)
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  أدخل بيانات الطبيب لإنشاء حسابه وتفعيله في المنصة
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-text-secondary hover:text-danger h-9 w-9 rounded-full flex items-center justify-center hover:bg-danger/10 transition-colors"
                title="إغلاق"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="الاسم الأول *"
                required
                value={newDoctor.firstName}
                onChange={(e) => setNewDoctor({ ...newDoctor, firstName: e.target.value })}
              />
              <Field
                label="اسم العائلة *"
                required
                value={newDoctor.lastName}
                onChange={(e) => setNewDoctor({ ...newDoctor, lastName: e.target.value })}
              />
              <Field
                label="الرقم القومي (14 رقم) *"
                required
                inputMode="numeric"
                value={newDoctor.nationalId}
                onChange={(e) => setNewDoctor({ ...newDoctor, nationalId: e.target.value })}
                className="sm:col-span-2"
              />
              <Field
                label="البريد الإلكتروني *"
                required
                type="email"
                value={newDoctor.email}
                onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
              />
              <Field
                label="رقم الهاتف *"
                required
                inputMode="tel"
                value={newDoctor.phoneNumber}
                onChange={(e) => setNewDoctor({ ...newDoctor, phoneNumber: e.target.value })}
              />
              <div className="sm:col-span-2">
                <Field
                  label="كلمة المرور الابتدائية *"
                  required
                  type="password"
                  value={newDoctor.password}
                  onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                />
              </div>

              {createError && (
                <div className="sm:col-span-2 rounded-xl bg-danger/10 border border-danger/20 p-3 text-xs font-bold text-danger">
                  {createError}
                </div>
              )}

              <div className="sm:col-span-2 flex gap-3 mt-4">
                <Button 
                  type="submit" 
                  variant="vibrant" 
                  disabled={creating}
                  className="flex-1 font-bold shadow-glow-cyan"
                >
                  {creating ? "جارٍ التسجيل..." : "تسجيل الطبيب"}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
