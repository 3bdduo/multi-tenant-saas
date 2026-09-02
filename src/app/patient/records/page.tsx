"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import Link from "next/link";
import {
  getMyMedicalRecords,
  getMyDocuments,
  uploadPatientDocument,
  updatePatientDocument,
  deletePatientDocument,
} from "@/lib/api/medicalRecord";
import { getMyProfile } from "@/lib/api/patient";
import { getMyAppointmentsForPatient } from "@/lib/api/appointment";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import type { MedicalRecord, PatientDocument, Patient } from "@/types/api";
import { ApiError } from "@/lib/http";

type TabType = "documents" | "records";

export default function PatientRecordsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("documents");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Patient profile & previously visited doctors
  const [patientProfile, setPatientProfile] = useState<Patient | null>(null);
  const [myDoctors, setMyDoctors] = useState<{ id: string; name: string }[]>([]);

  // Section 1: Doctor-Specific Upload State
  const docFileInputRef = useRef<HTMLInputElement | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docTargetDoctorId, setDocTargetDoctorId] = useState("");
  const [docNotes, setDocNotes] = useState("");
  const [docFamilyMember, setDocFamilyMember] = useState("");
  const [docUploading, setDocUploading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [docSuccess, setDocSuccess] = useState<string | null>(null);

  // Section 2: General Health Notes / File Upload State
  const generalFileInputRef = useRef<HTMLInputElement | null>(null);
  const [generalFile, setGeneralFile] = useState<File | null>(null);
  const [generalNotes, setGeneralNotes] = useState("");
  const [generalFamilyMember, setGeneralFamilyMember] = useState("");
  const [generalUploading, setGeneralUploading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null);

  // Section 3: Edit & Delete Modal State
  const [editingDoc, setEditingDoc] = useState<PatientDocument | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editFamilyMember, setEditFamilyMember] = useState("");
  const [editTargetDoctorId, setEditTargetDoctorId] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    loadProfileAndDoctors();
  }, []);

  async function loadProfileAndDoctors() {
    try {
      const [profRes, apptsRes] = await Promise.all([
        getMyProfile(),
        getMyAppointmentsForPatient(),
      ]);

      setPatientProfile(profRes.data.patient);

      const appts = apptsRes.data.appointments ?? [];
      const docMap = new Map<string, string>();
      appts.forEach((a) => {
        if (a.doctorId) {
          const docId = typeof a.doctorId === "object" ? a.doctorId._id : a.doctorId;
          const docName =
            typeof a.doctorId === "object"
              ? `د. ${a.doctorId.firstName} ${a.doctorId.lastName}`
              : "طبيب العيادة";
          if (docId) {
            docMap.set(docId, docName);
          }
        }
      });
      setMyDoctors(Array.from(docMap.entries()).map(([id, name]) => ({ id, name })));
    } catch (err) {
      console.error("Failed to load profile and doctors:", err);
    }
  }

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

  // Handle Section 1 Upload (Doctor Specific)
  async function handleDoctorSpecificUpload(e: FormEvent) {
    e.preventDefault();
    if (!docTargetDoctorId) {
      setDocError("يرجى اختيار الطبيب المعالج المستهدف");
      return;
    }
    if (!docFile && !docNotes.trim()) {
      setDocError("يرجى إرفاق صورة الروشتة/التقرير أو كتابة ملاحظات للطبيب");
      return;
    }

    setDocUploading(true);
    setDocError(null);
    setDocSuccess(null);

    try {
      await uploadPatientDocument(docFile, {
        targetDoctorId: docTargetDoctorId,
        patientNotes: docNotes.trim() || undefined,
        familyMemberName: docFamilyMember || undefined,
      });
      setDocSuccess("تم إرسال المستند للطبيب بنجاح وجاري تحليله بالذكاء الاصطناعي!");
      setDocFile(null);
      setDocNotes("");
      setDocTargetDoctorId("");
      setDocFamilyMember("");
      if (docFileInputRef.current) docFileInputRef.current.value = "";
      const docsRes = await getMyDocuments();
      setDocuments(docsRes.data.documents ?? []);
    } catch (err: any) {
      setDocError(err instanceof ApiError ? err.message : "تعذّر إرسال المستند للطبيب");
    } finally {
      setDocUploading(false);
    }
  }

  // Handle Section 2 Upload (General Data / Notes)
  async function handleGeneralUpload(e: FormEvent) {
    e.preventDefault();
    if (!generalFile && !generalNotes.trim()) {
      setGeneralError("يرجى كتابة ملاحظات صحية أو إرفاق ملف/تحليل للحفظ");
      return;
    }

    setGeneralUploading(true);
    setGeneralError(null);
    setGeneralSuccess(null);

    try {
      await uploadPatientDocument(generalFile, {
        patientNotes: generalNotes.trim() || undefined,
        familyMemberName: generalFamilyMember || undefined,
      });
      setGeneralSuccess("تم حفظ البيانات في سجلك الصحي العام بنجاح!");
      setGeneralFile(null);
      setGeneralNotes("");
      setGeneralFamilyMember("");
      if (generalFileInputRef.current) generalFileInputRef.current.value = "";
      const docsRes = await getMyDocuments();
      setDocuments(docsRes.data.documents ?? []);
    } catch (err: any) {
      setGeneralError(err instanceof ApiError ? err.message : "تعذّر حفظ البيانات");
    } finally {
      setGeneralUploading(false);
    }
  }

  // Open Edit Modal
  function openEditModal(doc: PatientDocument) {
    setEditingDoc(doc);
    setEditNotes(doc.patientNotes || "");
    setEditFamilyMember(doc.familyMemberName || "");
    const targetId =
      typeof doc.targetDoctorId === "object"
        ? doc.targetDoctorId?._id
        : doc.targetDoctorId || "";
    setEditTargetDoctorId(targetId);
    setEditFile(null);
    setEditError(null);
  }

  // Save Edit
  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingDoc) return;

    setEditSaving(true);
    setEditError(null);

    try {
      await updatePatientDocument(editingDoc._id, editFile, {
        patientNotes: editNotes.trim(),
        familyMemberName: editFamilyMember || undefined,
        targetDoctorId: editTargetDoctorId || undefined,
      });
      setEditingDoc(null);
      const docsRes = await getMyDocuments();
      setDocuments(docsRes.data.documents ?? []);
    } catch (err: any) {
      setEditError(err instanceof ApiError ? err.message : "تعذّر حفظ التعديلات");
    } finally {
      setEditSaving(false);
    }
  }

  // Handle Permanent Delete
  async function handleDelete(docId: string) {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا المستند/الملاحظة بشكل نهائي؟")) return;

    setDeletingId(docId);
    try {
      await deletePatientDocument(docId);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
    } catch (err: any) {
      alert(err instanceof ApiError ? err.message : "تعذّر حذف المستند");
    } finally {
      setDeletingId(null);
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
    const docName =
      typeof d.targetDoctorId === "object"
        ? `${d.targetDoctorId.firstName} ${d.targetDoctorId.lastName}`
        : "";
    return (
      d.fileName?.toLowerCase().includes(q) ||
      d.patientNotes?.toLowerCase().includes(q) ||
      d.familyMemberName?.toLowerCase().includes(q) ||
      docName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-4xl pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">
            الملف والسجلات الطبية
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            إرسال التقارير والروشتات لأطبائك، إدارة أرشيفك الصحي، ومتابعة السجلات الطبية
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="بحث في السجلات والمستندات..."
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
            onClick={() => setActiveTab("documents")}
            className={`flex-1 min-h-[44px] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "documents"
                ? "bg-primary text-surface shadow-glow-cyan font-black"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            <span>📁 مستنداتي وأرشيفي الصحي</span>
            <span className="rounded-full bg-surface/20 px-2 py-0.5 text-[10px]">
              {documents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("records")}
            className={`flex-1 min-h-[44px] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "records"
                ? "bg-primary text-surface shadow-glow-cyan font-black"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            <span>🩺 الروشتات والسجلات الصادرة من الأطباء</span>
            <span className="rounded-full bg-surface/20 px-2 py-0.5 text-[10px]">
              {records.length}
            </span>
          </button>
        </div>
      </Card>

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 1: Documents & Health Archive (3 DISTINCT SECTIONS)     */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === "documents" && (
        <div className="flex flex-col gap-8">
          {/* ══════════════════════════════════════════════════════════ */}
          {/* SECTION 1: Doctor-Specific Document Upload               */}
          {/* ══════════════════════════════════════════════════════════ */}
          <Card glass vibrant className="border-primary/30 p-5 sm:p-7 shadow-lg">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20 text-primary font-black text-sm">
                1
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-text-primary">
                  إرسال تقرير أو روشتة لطبيبك المعالج
                </h2>
                <p className="text-xs text-text-secondary">
                  خاص بالأطباء الذين حجزت عندهم مسبقاً (سيتمكن الطبيب من الاطلاع على هذا التقرير وتحليله بالذكاء الاصطناعي)
                </p>
              </div>
            </div>

            {myDoctors.length === 0 ? (
              <div className="mt-4 p-4 rounded-2xl bg-warning/10 border border-warning/20 text-text-primary text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p>
                  ⚠️ لم تقم بحجز موعد مع أي طبيب بعد. يمكنك إرسال المستندات لطبيبك المعالج بمجرد حجز موعد كشف لديه.
                </p>
                <Link href="/patient/appointments">
                  <Button size="sm" variant="vibrant" className="whitespace-nowrap font-bold">
                    حجز موعد كشف الآن
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleDoctorSpecificUpload} className="mt-4 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Target Doctor */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-primary">
                      اختيار الطبيب المعالج *
                    </label>
                    <select
                      required
                      value={docTargetDoctorId}
                      onChange={(e) => setDocTargetDoctorId(e.target.value)}
                      className="rounded-xl border border-border/80 bg-surface px-3 py-2.5 text-sm outline-none transition-all focus:border-primary"
                    >
                      <option value="">-- اختر من أطبائك المعالجين --</option>
                      {myDoctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Family Member (if family account) */}
                  {patientProfile?.isFamily &&
                    patientProfile?.familyMembers &&
                    patientProfile.familyMembers.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-text-primary">
                          اسم الفرد من الأسرة (اختياري)
                        </label>
                        <select
                          value={docFamilyMember}
                          onChange={(e) => setDocFamilyMember(e.target.value)}
                          className="rounded-xl border border-border/80 bg-surface px-3 py-2.5 text-sm outline-none"
                        >
                          <option value="">-- عام للأسرة --</option>
                          {patientProfile.familyMembers.map((m: any) => (
                            <option key={m.name} value={m.name}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                  {/* File Input */}
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-primary">
                      ملف الروشتة أو التحليل أو الأشعة (صورة أو PDF)
                    </label>
                    <input
                      ref={docFileInputRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => {
                        setDocFile(e.target.files?.[0] ?? null);
                        setDocError(null);
                        setDocSuccess(null);
                      }}
                      className="rounded-xl border border-border/80 bg-surface px-4 py-2.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                  </div>

                  {/* Notes for Doctor */}
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-primary">
                      ملاحظات موجهة للطبيب (اختياري)
                    </label>
                    <textarea
                      placeholder="اكتب أي استفسار أو تفاصيل ترغب في إرسالها للطبيب بخصوص هذه الروشتة/التحليل..."
                      value={docNotes}
                      onChange={(e) => setDocNotes(e.target.value)}
                      className="rounded-xl border border-border/80 bg-surface px-3 py-2 text-sm outline-none resize-none h-20"
                    />
                  </div>
                </div>

                {docError && (
                  <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-xs sm:text-sm text-danger font-bold animate-fade-in">
                    {docError}
                  </div>
                )}
                {docSuccess && (
                  <div className="rounded-xl bg-success/10 border border-success/20 p-3 text-xs sm:text-sm text-success font-bold animate-fade-in">
                    {docSuccess}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="vibrant"
                  disabled={docUploading}
                  loading={docUploading}
                  className="w-full shadow-glow-cyan font-bold min-h-[44px]"
                >
                  {docUploading ? "جارٍ الإرسال والتحليل..." : "إرسال المستند للطبيب المعالج"}
                </Button>
              </form>
            )}
          </Card>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* SECTION 2: General Health Notes / Personal Files Upload  */}
          {/* ══════════════════════════════════════════════════════════ */}
          <Card glass vibrant className="border-accent/30 p-5 sm:p-7 shadow-lg">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/20 text-accent font-black text-sm">
                2
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-text-primary">
                  السجل الطبي والبيانات الصحية العامة (أرشيفك الصحي الشخصي)
                </h2>
                <p className="text-xs text-text-secondary">
                  أضف ملاحظاتك الصحية العامة (أمراض مزمنة، حساسية، تاريخ مرضي) أو ارفع ملفات تحاليل وروشتات عامة بدون تحديد طبيب
                </p>
              </div>
            </div>

            <form onSubmit={handleGeneralUpload} className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Family Member (if family account) */}
                {patientProfile?.isFamily &&
                  patientProfile?.familyMembers &&
                  patientProfile.familyMembers.length > 0 && (
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-text-primary">
                        اسم الفرد من الأسرة (اختياري)
                      </label>
                      <select
                        value={generalFamilyMember}
                        onChange={(e) => setGeneralFamilyMember(e.target.value)}
                        className="rounded-xl border border-border/80 bg-surface px-3 py-2.5 text-sm outline-none"
                      >
                        <option value="">-- عام للأسرة --</option>
                        {patientProfile.familyMembers.map((m: any) => (
                          <option key={m.name} value={m.name}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                {/* Health Notes (Optional / Standalone) */}
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-primary">
                    الملاحظات الصحية أو التاريخ المرضي (نص فقط - اختياري)
                  </label>
                  <textarea
                    placeholder="مثال: حساسية من البنسلين، مريض ضغط وسكر، فصيلة الدم O+، أو أي تفاصيل صحية أخرى..."
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    className="rounded-xl border border-border/80 bg-surface px-3 py-2 text-sm outline-none resize-none h-20"
                  />
                </div>

                {/* File Upload (Optional / Standalone) */}
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-primary">
                    إرفاق ملف أو صورة تحليل/روشتة (اختياري)
                  </label>
                  <input
                    ref={generalFileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => {
                      setGeneralFile(e.target.files?.[0] ?? null);
                      setGeneralError(null);
                      setGeneralSuccess(null);
                    }}
                    className="rounded-xl border border-border/80 bg-surface px-4 py-2.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer"
                  />
                  <span className="text-[11px] text-text-secondary">
                    * يمكنك كتابة ملاحظات فقط، أو رفع ملف فقط، أو كلاهما معاً.
                  </span>
                </div>
              </div>

              {generalError && (
                <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-xs sm:text-sm text-danger font-bold animate-fade-in">
                  {generalError}
                </div>
              )}
              {generalSuccess && (
                <div className="rounded-xl bg-success/10 border border-success/20 p-3 text-xs sm:text-sm text-success font-bold animate-fade-in">
                  {generalSuccess}
                </div>
              )}

              <Button
                type="submit"
                variant="secondary"
                disabled={generalUploading}
                loading={generalUploading}
                className="w-full font-bold min-h-[44px]"
              >
                {generalUploading ? "جارٍ الحفظ..." : "حفظ في السجل الصحي العام"}
              </Button>
            </form>
          </Card>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* SECTION 3: Documents Archive (View, Edit, Delete)        */}
          {/* ══════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-raised text-text-primary font-black text-sm">
                  3
                </span>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-text-primary">
                    المستندات والبيانات المسجلة (الأرشيف الكامل)
                  </h3>
                  <p className="text-xs text-text-secondary">
                    جميع ما قمت بإرساله أو تدوينه محفوظ بالوقت والتاريخ بدقة، ويمكنك تعديله أو حذفه نهائياً
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-text-secondary bg-surface-raised px-3 py-1 rounded-full">
                {filteredDocuments.length} عنصر
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-24 animate-pulse bg-surface-raised" />
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <Card className="py-16 text-center text-text-secondary">
                <p className="text-base font-semibold">لم تقم بإضافة أي مستندات أو ملاحظات حتى الآن</p>
                <p className="text-xs text-text-secondary mt-1">
                  استخدم النماذج أعلاه لإرسال تقارير لأطبائك أو إضافة بياناتك الصحية الشخصية
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-1">
                {filteredDocuments.map((doc) => {
                  const uploadDate = new Date(doc.createdAt);
                  const dateStr = uploadDate.toLocaleDateString("ar-EG", {
                    weekday: "short",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                  const timeStr = uploadDate.toLocaleTimeString("ar-EG", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });

                  const targetDoc =
                    typeof doc.targetDoctorId === "object" ? doc.targetDoctorId : null;
                  const targetDocName = targetDoc
                    ? `د. ${targetDoc.firstName} ${targetDoc.lastName}`
                    : doc.targetDoctorId
                    ? myDoctors.find((d) => d.id === doc.targetDoctorId)?.name || "طبيب معالج"
                    : null;

                  return (
                    <Card
                      key={doc._id}
                      hover
                      className="flex flex-col gap-3 p-4 sm:p-5 border-border/80 relative transition-all"
                    >
                      {/* Top Row: Meta badges & Time */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border/40">
                        <div className="flex flex-wrap items-center gap-2">
                          {targetDocName ? (
                            <span className="rounded-full bg-primary/15 text-primary border border-primary/30 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                              <span>👨‍⚕️ موجه إلى:</span> {targetDocName}
                            </span>
                          ) : (
                            <span className="rounded-full bg-accent/15 text-accent border border-accent/30 px-2.5 py-0.5 text-xs font-bold">
                              📋 سجل صحي عام
                            </span>
                          )}

                          {doc.familyMemberName && (
                            <span className="rounded-full bg-surface-raised text-text-secondary border border-border px-2.5 py-0.5 text-xs font-medium">
                              👤 الفرد: {doc.familyMemberName}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                          <span>📅 {dateStr}</span>
                          <span>⏰ {timeStr}</span>
                        </div>
                      </div>

                      {/* Notes Body (if exists) */}
                      {doc.patientNotes && (
                        <div className="p-3 rounded-xl bg-surface-raised border border-border/50 text-sm">
                          <p className="text-xs font-bold text-text-secondary mb-1">الملاحظات المسجلة:</p>
                          <p className="text-text-primary whitespace-pre-wrap leading-relaxed">
                            {doc.patientNotes}
                          </p>
                        </div>
                      )}

                      {/* AI Analysis (if exists) */}
                      {doc.aiAnalysis && (
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs">
                          <p className="font-bold text-primary flex items-center gap-1 mb-1">
                            ✨ تحليل الذكاء الاصطناعي المستخرج من الروشتة:
                          </p>
                          <p className="text-text-primary whitespace-pre-wrap leading-relaxed">
                            {doc.aiAnalysis}
                          </p>
                        </div>
                      )}

                      {/* File Link + Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div>
                          {doc.fileUrl ? (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-xl transition-colors"
                            >
                              <span>📎 {doc.fileName || "عرض / تحميل الملف المرفق"}</span>
                            </a>
                          ) : (
                            <span className="text-xs text-text-secondary italic">
                              (ملاحظة نصية بدون ملف مرفق)
                            </span>
                          )}
                        </div>

                        {/* Action Buttons: Edit & Delete */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs font-bold px-3"
                            onClick={() => openEditModal(doc)}
                          >
                            ✏️ تعديل
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={deletingId === doc._id}
                            className="text-xs font-bold text-danger hover:bg-danger/10 px-3"
                            onClick={() => handleDelete(doc._id)}
                          >
                            {deletingId === doc._id ? "جارٍ الحذف..." : "🗑️ حذف نهائي"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 2: Medical Records issued by Doctors                   */}
      {/* ────────────────────────────────────────────────────────── */}
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
              <p className="text-base font-semibold">لا توجد سجلات طبية أو روشتات صادرة من الأطباء مطابقة</p>
            </Card>
          ) : (
            filteredRecords.map((r) => (
              <Card key={r._id} className="p-5 md:p-6 border-primary/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
                  <div>
                    <span className="text-[10px] font-bold text-primary bg-primary-soft px-2.5 py-1 rounded-full uppercase tracking-wider">
                      تشخيص طبي معتمد
                    </span>
                    <p className="font-display font-extrabold text-text-primary text-lg mt-1.5">
                      {r.diagnosis}
                    </p>
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

      {/* ─── Edit Document / Note Modal ────────────────────────── */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl flex flex-col rounded-3xl bg-surface border border-primary/30 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border/60 bg-surface-raised/40">
              <h3 className="font-display text-lg font-bold text-text-primary">
                تعديل المستند / الملاحظة
              </h3>
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-raised text-text-secondary hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 flex flex-col gap-4">
              {/* Target Doctor (if any) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-primary">
                  الطبيب المعالج الموجه له (اختياري)
                </label>
                <select
                  value={editTargetDoctorId}
                  onChange={(e) => setEditTargetDoctorId(e.target.value)}
                  className="rounded-xl border border-border/80 bg-surface px-3 py-2 text-sm outline-none"
                >
                  <option value="">-- سجل صحي عام (بدون طبيب محدد) --</option>
                  {myDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Family Member */}
              {patientProfile?.isFamily &&
                patientProfile?.familyMembers &&
                patientProfile.familyMembers.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-primary">
                      اسم الفرد من الأسرة
                    </label>
                    <select
                      value={editFamilyMember}
                      onChange={(e) => setEditFamilyMember(e.target.value)}
                      className="rounded-xl border border-border/80 bg-surface px-3 py-2 text-sm outline-none"
                    >
                      <option value="">-- عام للأسرة --</option>
                      {patientProfile.familyMembers.map((m: any) => (
                        <option key={m.name} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-primary">الملاحظات المسجلة</label>
                <textarea
                  placeholder="تعديل الملاحظات..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="rounded-xl border border-border/80 bg-surface px-3 py-2 text-sm outline-none resize-none h-24"
                />
              </div>

              {/* Replace File */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-primary">
                  استبدال الملف المرفق (اختياري - اتركه فارغاً للاحتفاظ بالملف الحالي)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                  className="rounded-xl border border-border/80 bg-surface px-4 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary cursor-pointer"
                />
              </div>

              {editError && (
                <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-xs text-danger font-bold">
                  {editError}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingDoc(null)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="vibrant"
                  size="sm"
                  disabled={editSaving}
                  loading={editSaving}
                  className="shadow-glow-cyan font-bold"
                >
                  {editSaving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
