"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { extractFromPrescriptionImage, createMedicalRecord } from "@/lib/api/medicalRecord";
import { getMyAppointments } from "@/lib/api/appointment";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import type { Appointment, CreateMedicalRecordPayload, ExtractedPrescription, Medication } from "@/types/api";

type Step = "upload" | "review" | "done";

export default function NewMedicalRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledPatientId = searchParams.get("patientId") ?? "";

  const [step, setStep] = useState<Step>("upload");

  // Step 1: Upload
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractedImageUrl, setExtractedImageUrl] = useState<string>("");

  // Step 2: Review & Edit
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [visibility, setVisibility] = useState<"private" | "shared">("private");
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: null, frequency: "", duration: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [skipImage, setSkipImage] = useState(false);

  useEffect(() => {
    // Load appointments to choose from
    getMyAppointments()
      .then((res) => {
        const all = res.data.appointments ?? [];
        // Filter only appointments for the given patient if we have one
        const relevant = prefilledPatientId
          ? all.filter((a) => {
              const pId = typeof a.patientId === "object" ? a.patientId._id : a.patientId;
              return pId === prefilledPatientId;
            })
          : all;
        setAppointments(relevant.length > 0 ? relevant : all);
        if (relevant.length > 0) setSelectedAppointmentId(relevant[0]._id);
      })
      .catch(() => {});
  }, [prefilledPatientId]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setExtractError(null);
  }

  async function handleExtract() {
    if (!selectedFile) return;
    setExtractError(null);
    setExtracting(true);
    try {
      const res = await extractFromPrescriptionImage(selectedFile);
      const extracted: ExtractedPrescription = res.data.extracted;
      setExtractedImageUrl(res.data.imageUrl?.url ?? "");
      setDiagnosis(extracted.diagnosis ?? "");
      setNotes(extracted.notes ?? "");
      if (extracted.medications && extracted.medications.length > 0) {
        setMedications(extracted.medications.map((m) => ({
          name: m.name ?? "",
          dosage: m.dosage ?? null,
          frequency: m.frequency ?? "",
          duration: m.duration ?? "",
        })));
      }
      setStep("review");
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setExtractError(" لقد تخطّيت الحد المسموح به (5 طلبات / دقيقة). انتظر قليلاً ثم أعد المحاولة.");
      } else {
        setExtractError(err instanceof ApiError ? err.message : "تعذّر استخراج البيانات من الصورة");
      }
    } finally {
      setExtracting(false);
    }
  }

  function handleSkipToManual() {
    setSkipImage(true);
    setStep("review");
  }

  function addMedication() {
    setMedications((prev) => [...prev, { name: "", dosage: null, frequency: "", duration: "" }]);
  }

  function removeMedication(idx: number) {
    setMedications((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateMed<K extends keyof Medication>(idx: number, key: K, value: Medication[K]) {
    setMedications((prev) => prev.map((m, i) => (i === idx ? { ...m, [key]: value } : m)));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaveError(null);
    if (!selectedAppointmentId) {
      setSaveError("يرجى اختيار الموعد المرتبط بهذا السجل");
      return;
    }
    if (!diagnosis.trim()) {
      setSaveError("التشخيص مطلوب");
      return;
    }

    const payload: CreateMedicalRecordPayload = {
      appointmentId: selectedAppointmentId,
      diagnosis: diagnosis.trim(),
      medications: medications.filter((m) => m.name.trim()),
      notes: notes.trim(),
      visibility,
      ...(extractedImageUrl ? { prescriptionImageUrl: extractedImageUrl } : {}),
    };

    setSaving(true);
    try {
      await createMedicalRecord(payload);
      setStep("done");
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "تعذّر حفظ السجل الطبي");
    } finally {
      setSaving(false);
    }
  }

  // ─── Step Indicator ────────────────────────────────────────────────────────
  const STEPS = ["رفع الروشتة", "المراجعة والتعديل", "الحفظ"];

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => (step === "review" ? setStep("upload") : router.back())}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          رجوع
        </button>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">إنشاء سجل طبي جديد</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            ارفع صورة الروشتة لاستخراج البيانات بالذكاء الاصطناعي، أو أدخلها يدوياً
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      {step !== "done" && (
        <div className="flex items-center gap-2">
          {STEPS.map((label, idx) => {
            const isActive = (step === "upload" && idx === 0) || (step === "review" && idx >= 1);
            const isDone = (step === "review" && idx === 0);
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isDone
                      ? "bg-success/20 text-success"
                      : isActive
                      ? "bg-primary text-surface"
                      : "bg-surface-raised text-text-secondary"
                  }`}
                >
                  {isDone ? "" : idx + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${isActive ? "text-primary" : "text-text-secondary"}`}>
                  {label}
                </span>
                {idx < STEPS.length - 1 && <div className="h-px w-8 bg-border/60" />}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Step 1: Upload ─────────────────────────────────────────────────── */}
      {step === "upload" && (
        <div className="flex flex-col gap-4">
          <Card glass vibrant className="border-primary/20">
            <h2 className="font-display text-lg font-bold text-text-primary mb-2">
               رفع صورة الروشتة
            </h2>
            <p className="text-xs text-text-secondary mb-4">
              الذكاء الاصطناعي سيستخرج التشخيص والأدوية تلقائياً ستراجعها قبل الحفظ
            </p>

            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-border/60 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center gap-3 py-12"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="max-h-40 rounded-xl object-contain" />
              ) : (
                <>
                  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-text-secondary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-sm text-text-secondary">اضغط لرفع صورة الروشتة</p>
                  <p className="text-xs text-text-secondary opacity-60">PNG, JPG, WEBP</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            {selectedFile && (
              <p className="mt-2 text-xs text-text-secondary"> {selectedFile.name}</p>
            )}

            {extractError && (
              <div className="mt-3 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
                {extractError}
              </div>
            )}

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Button
                variant="vibrant"
                disabled={!selectedFile || extracting}
                onClick={handleExtract}
                className="shadow-glow-cyan flex-1"
              >
                {extracting ? "جارٍ الاستخراج بالذكاء الاصطناعي..." : "استخراج البيانات "}
              </Button>
              <Button variant="secondary" onClick={handleSkipToManual}>
                إدخال يدوي بدون صورة
              </Button>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/20 px-3 py-2">
              <p className="text-xs text-text-secondary">
                محدود بـ 5 طلبات / دقيقة — ستظهر رسالة تطلب الانتظار إذا تخطيت الحد
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* ─── Step 2: Review ─────────────────────────────────────────────────── */}
      {step === "review" && (
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          {!skipImage && extractedImageUrl && (
            <Card className="flex items-center gap-4 border-success/20">
              <img src={extractedImageUrl} alt="prescription" className="h-20 w-20 rounded-xl object-cover flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-success"> تم استخراج البيانات من الصورة</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  راجع البيانات أدناه وعدّل ما تراه مناسباً قبل الحفظ
                </p>
              </div>
            </Card>
          )}

          {/* Appointment Selector */}
          <Card className="border-primary/20">
            <h3 className="font-display text-sm font-bold text-text-primary mb-3">
               ربط الموعد (مطلوب)
            </h3>
            {appointments.length === 0 ? (
              <p className="text-sm text-warning bg-warning/10 rounded-lg px-3 py-2">
                لا توجد مواعيد متاحة — يجب وجود موعد مسجّل قبل إنشاء سجل طبي
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {appointments.map((a) => {
                  const patientName =
                    typeof a.patientId === "object"
                      ? `${a.patientId.firstName} ${a.patientId.lastName}`
                      : a.patientId;
                  return (
                    <label
                      key={a._id}
                      className={`flex items-center gap-3 cursor-pointer rounded-xl border px-4 py-3 transition-colors ${
                        selectedAppointmentId === a._id
                          ? "border-primary bg-primary/10"
                          : "border-border/60 hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="appointmentId"
                        value={a._id}
                        checked={selectedAppointmentId === a._id}
                        onChange={() => setSelectedAppointmentId(a._id)}
                        className="accent-primary"
                      />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{patientName}</p>
                        <p className="text-xs text-text-secondary">
                          {new Date(a.date).toLocaleDateString("ar-EG")} — {a.status}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Diagnosis */}
          <Card>
            <h3 className="font-display text-sm font-bold text-text-primary mb-3">التشخيص</h3>
            <textarea
              required
              rows={3}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="أدخل التشخيص الطبي..."
              className="w-full rounded-xl border border-border/80 bg-surface px-4 py-2.5 text-sm outline-none transition-all focus:border-primary resize-none"
            />
          </Card>

          {/* Medications */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold text-text-primary"> الأدوية</h3>
              <Button type="button" size="sm" variant="secondary" onClick={addMedication}>
                + إضافة دواء
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              {medications.map((m, idx) => (
                <div key={idx} className="rounded-xl border border-border/60 p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-secondary">دواء {idx + 1}</span>
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication(idx)}
                        className="text-danger text-xs hover:underline"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="اسم الدواء"
                      required
                      value={m.name}
                      onChange={(e) => updateMed(idx, "name", e.target.value)}
                      placeholder="مثال: Amoxicillin"
                    />
                    <Field
                      label="الجرعة"
                      value={m.dosage ?? ""}
                      onChange={(e) => updateMed(idx, "dosage", e.target.value || null)}
                      placeholder="مثال: 500mg"
                    />
                    <Field
                      label="التكرار"
                      value={m.frequency}
                      onChange={(e) => updateMed(idx, "frequency", e.target.value)}
                      placeholder="مثال: مرتين يومياً"
                    />
                    <Field
                      label="المدة"
                      value={m.duration}
                      onChange={(e) => updateMed(idx, "duration", e.target.value)}
                      placeholder="مثال: 7 أيام"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <h3 className="font-display text-sm font-bold text-text-primary mb-3"> ملاحظات</h3>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات إضافية للمريض..."
              className="w-full rounded-xl border border-border/80 bg-surface px-4 py-2.5 text-sm outline-none transition-all focus:border-primary resize-none"
            />
          </Card>

          {/* Visibility */}
          <Card>
            <h3 className="font-display text-sm font-bold text-text-primary mb-3">
               إمكانية الوصول
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <label
                className={`flex-1 cursor-pointer rounded-xl border px-4 py-4 transition-colors ${
                  visibility === "private"
                    ? "border-primary bg-primary/10"
                    : "border-border/60 hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === "private"}
                  onChange={() => setVisibility("private")}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <span className="text-xl"></span>
                  <div>
                    <p className="font-bold text-sm text-text-primary">خاص (Private)</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      يراه الدكتور المُنشئ فقط
                    </p>
                  </div>
                </div>
              </label>
              <label
                className={`flex-1 cursor-pointer rounded-xl border px-4 py-4 transition-colors ${
                  visibility === "shared"
                    ? "border-success bg-success/10"
                    : "border-border/60 hover:border-success/40"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="shared"
                  checked={visibility === "shared"}
                  onChange={() => setVisibility("shared")}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <span className="text-xl"></span>
                  <div>
                    <p className="font-bold text-sm text-text-primary">مشارك (Shared)</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      يراه المريض + دكاترة آخرون لهم مواعيد معه
                    </p>
                  </div>
                </div>
              </label>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              الافتراضي دائماً <strong>خاص</strong> — اختر "مشارك" فقط إذا أردت مشاركته
            </p>
          </Card>

          {saveError && (
            <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
              {saveError}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" variant="vibrant" disabled={saving || appointments.length === 0} className="shadow-glow-cyan flex-1">
              {saving ? "جارٍ الحفظ..." : "حفظ السجل الطبي"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setStep("upload")}>
              رجوع
            </Button>
          </div>
        </form>
      )}

      {/* ─── Step 3: Done ───────────────────────────────────────────────────── */}
      {step === "done" && (
        <Card glass vibrant className="border-success/30 text-center p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/20 text-3xl">
            
          </div>
          <h2 className="font-display text-xl font-bold text-text-primary">تم حفظ السجل الطبي!</h2>
          <p className="mt-2 text-sm text-text-secondary">
            السجل الطبي أُضيف رسمياً إلى ملف المريض
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {prefilledPatientId && (
              <Button
                variant="vibrant"
                className="shadow-glow-cyan"
                onClick={() => router.push(`/doctor/patients/${prefilledPatientId}`)}
              >
                عودة لملف المريض
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => {
                setStep("upload");
                setSelectedFile(null);
                setPreviewUrl(null);
                setDiagnosis("");
                setNotes("");
                setMedications([{ name: "", dosage: null, frequency: "", duration: "" }]);
                setVisibility("private");
                setSaveError(null);
                setSkipImage(false);
              }}
            >
              إنشاء سجل آخر
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
