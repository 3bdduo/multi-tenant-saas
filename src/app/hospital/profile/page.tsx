"use client";

import { useEffect, useState } from "react";
import { getMyHospital, updateMyHospital } from "@/lib/api/hospital";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import type { Hospital } from "@/types/api";

const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "الشرقية", "القليوبية",
  "كفر الشيخ", "الغربية", "المنوفية", "البحيرة", "الإسماعيلية", "بور سعيد",
  "السويس", "دمياط", "الفيوم", "بني سويف", "المنيا", "أسيوط", "سوهاج",
  "قنا", "الأقصر", "أسوان", "البحر الأحمر", "الوادي الجديد", "مطروح",
  "شمال سيناء", "جنوب سيناء",
];

export default function HospitalProfilePage() {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [form, setForm] = useState({
    hospitalName: "",
    phoneNumber: "",
    address: "",
    governorate: "",
    city: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyHospital();
        const h = res.data.hospital;
        setHospital(h);
        setForm({
          hospitalName: h.hospitalName ?? "",
          phoneNumber: h.phoneNumber ?? "",
          address: h.address ?? "",
          governorate: h.governorate ?? "",
          city: h.city ?? "",
        });
      } catch {
        setError("تعذّر تحميل بيانات المستشفى");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSuccess(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateMyHospital(form);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-text-primary">بيانات المستشفى</h1>
        <p className="mt-1 text-sm text-text-secondary">يمكنك تعديل بيانات المستشفى وحفظها</p>
      </div>

      {hospital && (
        <Card className="p-3 flex items-center gap-3 border-border/50 bg-surface-elevated/30">
          <div>
            <p className="text-xs text-text-secondary">البريد الإلكتروني</p>
            <p className="text-sm font-semibold text-text-primary">{hospital.email}</p>
          </div>
          <div className="h-8 w-px bg-border mx-2" />
          <div>
            <p className="text-xs text-text-secondary">حالة الاشتراك</p>
            {(() => {
              const isExpired = hospital.paidExpired ? new Date(hospital.paidExpired) < new Date() : false;
              const isActive = Boolean(hospital.isPaid && !isExpired);
              return (
                <p className={`text-sm font-bold ${isActive ? "text-success" : "text-warning"}`}>
                  {isActive ? "فعّال" : "غير مفعّل"}
                </p>
              );
            })()}
          </div>
          {hospital.paidExpired && (
            <>
              <div className="h-8 w-px bg-border mx-2" />
              <div>
                <p className="text-xs text-text-secondary">تاريخ الانتهاء</p>
                <p className="text-sm font-semibold text-text-primary">
                  {new Date(hospital.paidExpired).toLocaleDateString("ar-EG")}
                </p>
              </div>
            </>
          )}
        </Card>
      )}

      <Card glass vibrant className="p-6 border-violet-500/20 shadow-xl">
        <h2 className="font-display text-lg font-bold text-text-primary mb-5">تعديل البيانات الأساسية</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="اسم المستشفى"
            required
            value={form.hospitalName}
            onChange={(e) => update("hospitalName", e.target.value)}
            placeholder="مثال: مستشفى النور التخصصي"
            className="sm:col-span-2"
          />
          <Field
            label="رقم الهاتف"
            inputMode="tel"
            value={form.phoneNumber}
            onChange={(e) => update("phoneNumber", e.target.value)}
            placeholder="01000000000"
          />
          <Field
            label="المدينة / المركز"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="مثال: مدينة نصر"
          />
          <Field
            label="العنوان التفصيلي"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="مثال: 15 شارع التحرير"
            className="sm:col-span-2"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-primary">المحافظة</label>
            <select
              value={form.governorate}
              onChange={(e) => update("governorate", e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">-- اختر المحافظة --</option>
              {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success font-semibold">
            تم حفظ البيانات بنجاح!
          </div>
        )}

        <Button
          variant="vibrant"
          loading={saving}
          onClick={handleSave}
          className="mt-5 w-full shadow-glow-purple bg-violet-500 hover:bg-violet-600 border-violet-500"
        >
          {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
        </Button>
      </Card>
    </div>
  );
}
