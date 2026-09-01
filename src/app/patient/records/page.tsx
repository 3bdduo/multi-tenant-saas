"use client";

import { useEffect, useState, useRef } from "react";
import { getMyMedicalRecords, getMyDocuments, uploadPatientDocument } from "@/lib/api/medicalRecord";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { MedicalRecord, PatientDocument } from "@/types/api";
import { ApiError } from "@/lib/http";

type TabType = "records" | "documents";

export default function PatientRecordsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("records");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [recordsRes, docsRes] = await Promise.allSettled([
        getMyMedicalRecords(),
        getMyDocuments(),
      ]);

      if (recordsRes.status === "fulfilled") {
        setRecords(recordsRes.value.data.medicalRecords ?? []);
      }
      if (docsRes.status === "fulfilled") {
        setDocuments(docsRes.value.data.documents ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await uploadPatientDocument(selectedFile);
      setUploadSuccess("تم رفع المستند بنجاح وحفظه في ملفك الطبي!");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Refresh documents
      const docsRes = await getMyDocuments();
      setDocuments(docsRes.data.documents ?? []);
    } catch (err: any) {
      setUploadError(err instanceof ApiError ? err.message : "تعذّر رفع الملف، يرجى المحاولة لاحقاً");
    } finally {
      setUploading(false);
    }
  }

  const filteredRecords = records.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchDiagnosis = r.diagnosis?.toLowerCase().includes(q);
    const matchMeds = r.medications?.some((m) => m.name.toLowerCase().includes(q));
    return matchDiagnosis || matchMeds;
  });

  const filteredDocuments = documents.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return d.fileName?.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">
            الملف والسجلات الطبية
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            سجلاتك المشتركة مع الأطباء والمستندات والتحاليل المرفوعة
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="بحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-border/80 bg-surface px-4 py-2.5 pl-10 text-sm outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.1)]"
          />
          <svg
            className="absolute left-3 top-3 h-4 w-4 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <Card glass vibrant className="p-1.5 sm:p-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("records")}
            className={`flex-1 min-h-[42px] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "records"
                ? "bg-primary text-surface shadow-glow-cyan font-black"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            <span>السجلات والروشتات الطبية</span>
            <span className="rounded-full bg-surface/20 px-2 py-0.5 text-[10px]">
              {records.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`flex-1 min-h-[42px] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "documents"
                ? "bg-primary text-surface shadow-glow-cyan font-black"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            <span>مستنداتي والتحاليل المرفوعة</span>
            <span className="rounded-full bg-surface/20 px-2 py-0.5 text-[10px]">
              {documents.length}
            </span>
          </button>
        </div>
      </Card>

      {/* Tab 1: Medical Records */}
      {activeTab === "records" && (
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2].map((i) => (
                <Card key={i} className="h-40 animate-pulse bg-surface-raised" />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <Card className="py-16 text-center text-text-secondary">
              <p className="text-base font-semibold">لا توجد سجلات طبية مطابقة</p>
            </Card>
          ) : (
            filteredRecords.map((r) => (
              <Card key={r._id} className="p-5 md:p-6 border-primary/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
                  <div>
                    <span className="text-[10px] font-bold text-primary bg-primary-soft px-2.5 py-1 rounded-full uppercase tracking-wider">
                      تشخيص طبي
                    </span>
                    <p className="font-display font-extrabold text-text-primary text-lg mt-1.5">{r.diagnosis}</p>
                  </div>
                  <span className="text-xs font-bold text-text-secondary bg-surface-raised px-3 py-1.5 rounded-xl">
                    تاريخ السجل: {new Date(r.createdAt).toLocaleDateString("ar-EG")}
                  </span>
                </div>

                {/* Prescription Image */}
                {r.prescriptionImageUrl && (
                  <div className="mt-4">
                    <p className="text-xs font-extrabold text-text-secondary mb-2">صورة الروشتة المرفقة:</p>
                    <a href={r.prescriptionImageUrl} target="_blank" rel="noreferrer">
                      <img
                        src={r.prescriptionImageUrl}
                        alt="prescription"
                        className="rounded-xl max-h-48 object-contain border border-border/50 bg-bg hover:opacity-90 transition-opacity"
                      />
                    </a>
                  </div>
                )}

                {/* Medications */}
                {r.medications && r.medications.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-extrabold text-text-secondary mb-2">الأدوية الموصوفة:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {r.medications.map((m, i) => (
                        <div key={i} className="rounded-xl border border-border/60 bg-surface-raised p-3 text-sm">
                          <p className="font-bold text-text-primary">{m.name}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-text-secondary mt-1">
                            {m.dosage && <span>الجرعة: {m.dosage}</span>}
                            {m.frequency && <span>التكرار: {m.frequency}</span>}
                            {m.duration && <span>المدة: {m.duration}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {r.notes && (
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <p className="text-xs font-extrabold text-text-secondary mb-1">ملاحظات الطبيب:</p>
                    <p className="text-sm text-text-secondary leading-relaxed">{r.notes}</p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Uploaded Documents */}
      {activeTab === "documents" && (
        <div className="flex flex-col gap-6">
          {/* Upload Card */}
          <Card glass vibrant className="p-5 sm:p-6 border-primary/20">
            <h3 className="font-display text-lg font-bold text-text-primary mb-1">
              رفع مستند أو تحليل أو أشعة جديدة
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary mb-4">
              يمكنك رفع أي تقرير طبي أو صورة أشعة لتكون محفوظة في حسابك ويراها طبيبك المعالج مع تاريخ ووقت الرفع.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => {
                  setSelectedFile(e.target.files?.[0] ?? null);
                  setUploadError(null);
                  setUploadSuccess(null);
                }}
                className="flex-1 rounded-xl border border-border/80 bg-surface px-4 py-2.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />

              <Button
                variant="vibrant"
                className="shadow-glow-cyan font-bold min-h-[44px]"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                loading={uploading}
              >
                {uploading ? "جارٍ الرفع..." : "رفع المستند"}
              </Button>
            </div>

            {uploadSuccess && (
              <div className="mt-3 rounded-xl bg-success/10 border border-success/20 p-3 text-xs sm:text-sm text-success font-bold animate-fade-in">
                {uploadSuccess}
              </div>
            )}
            {uploadError && (
              <div className="mt-3 rounded-xl bg-danger/10 border border-danger/20 p-3 text-xs sm:text-sm text-danger font-bold animate-fade-in">
                {uploadError}
              </div>
            )}
          </Card>

          {/* Uploaded Documents List */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-base text-text-primary px-1">
              المستندات المرفوعة ({filteredDocuments.length})
            </h3>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2].map((i) => (
                  <Card key={i} className="h-20 animate-pulse bg-surface-raised" />
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <Card className="py-12 text-center text-text-secondary">
                <p className="text-base font-semibold">لم تقم برفع أي مستندات حتى الآن</p>
                <p className="text-xs text-text-secondary mt-1">
                  اختر ملفاً من الأعلى لرفعه وحفظه في ملفك الطبي
                </p>
              </Card>
            ) : (
              filteredDocuments.map((doc) => {
                const uploadDate = new Date(doc.createdAt);
                const dateStr = uploadDate.toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                const timeStr = uploadDate.toLocaleTimeString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });

                return (
                  <Card
                    key={doc._id}
                    hover
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 border-border/60"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-bold text-sm sm:text-base text-text-primary truncate">
                          {doc.fileName || "مستند طبي"}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-text-secondary">
                          <span>تاريخ الرفع: {dateStr}</span>
                          <span>الساعة: {timeStr}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0"
                    >
                      <Button variant="outline" size="sm" className="font-bold w-full sm:w-auto">
                        عرض / تحميل المستند
                      </Button>
                    </a>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
