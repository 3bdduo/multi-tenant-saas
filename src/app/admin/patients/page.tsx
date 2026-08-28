"use client";

import { useState } from "react";
import { deletePatient } from "@/lib/api/admin";
import { lookupPatientByNationalId } from "@/lib/api/patient";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import { ApiError } from "@/lib/http";
import type { Patient } from "@/types/api";

export default function AdminPatientsPage() {
  const [nationalId, setNationalId] = useState("");
  const [searching, setSearching] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!nationalId.trim()) return;
    
    setSearching(true);
    setError(null);
    setPatient(null);
    setSuccessMsg(null);
    
    try {
      const res = await lookupPatientByNationalId(nationalId);
      if (res.data.patient) {
        setPatient(res.data.patient);
      } else {
        setError("لم يتم العثور على مريض بهذا الرقم القومي.");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "حدث خطأ أثناء البحث.");
    } finally {
      setSearching(false);
    }
  }

  async function handleRemove() {
    if (!patient) return;
    if (!confirm(`هل أنت متأكد من حذف حساب المريض ${patient.firstName} ${patient.lastName} نهائياً؟`)) return;
    
    setDeleting(true);
    setError(null);
    
    try {
      await deletePatient(patient._id);
      setSuccessMsg("تم حذف حساب المريض بنجاح.");
      setPatient(null);
      setNationalId("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "حدث خطأ أثناء حذف المريض.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-text-primary">
          إدارة حسابات المرضى
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          البحث عن مريض باستخدام الرقم القومي وحذف حسابه إذا لزم الأمر
        </p>
      </div>

      <Card className="shadow-xl border-primary/20">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Field
              label="الرقم القومي للمريض"
              required
              inputMode="numeric"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="أدخل الـ 14 رقم..."
            />
          </div>
          <Button 
            type="submit" 
            variant="vibrant" 
            className="w-full sm:w-auto font-bold shadow-glow-cyan h-[42px]"
            disabled={searching}
          >
            {searching ? "جارٍ البحث..." : "بحث"}
          </Button>
        </form>

        {error && (
          <div className="mt-6 rounded-xl bg-danger/10 border border-danger/20 p-4 text-sm font-bold text-danger">
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="mt-6 rounded-xl bg-success/10 border border-success/20 p-4 text-sm font-bold text-success">
            {successMsg}
          </div>
        )}

        {patient && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="font-display text-lg font-bold text-text-primary mb-4 border-b border-border/50 pb-2">
              نتيجة البحث
            </h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-raised border border-border p-5 rounded-2xl">
              <div>
                <p className="font-display font-bold text-text-primary text-xl">
                  {patient.firstName} {patient.lastName}
                </p>
                <div className="flex flex-col gap-1 mt-3">
                  <p className="text-sm text-text-secondary flex items-center gap-2">
                    <span className="font-semibold text-text-primary">الهاتف:</span> 
                    <span dir="ltr">{patient.phoneNumber}</span>
                  </p>
                  <p className="text-sm text-text-secondary flex items-center gap-2">
                    <span className="font-semibold text-text-primary">الرقم القومي:</span> 
                    <span>{patient.nationalId}</span>
                  </p>
                  {patient.email && (
                    <p className="text-sm text-text-secondary flex items-center gap-2">
                      <span className="font-semibold text-text-primary">البريد:</span> 
                      <span>{patient.email}</span>
                    </p>
                  )}
                  <p className="text-xs text-text-secondary flex items-center gap-2 mt-2 opacity-70">
                    تاريخ التسجيل: {new Date(patient.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>
              
              <div className="flex sm:flex-col gap-3 mt-4 sm:mt-0 min-w-[140px]">
                <Button 
                  variant="danger" 
                  onClick={handleRemove}
                  disabled={deleting}
                  className="flex-1 w-full font-bold"
                >
                  {deleting ? "جارٍ الحذف..." : "حذف المريض"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
