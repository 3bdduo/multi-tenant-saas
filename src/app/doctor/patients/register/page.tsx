"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { lookupPatientByNationalId, getNonClinicPatients } from "@/lib/api/patient";
import { registerPatient } from "@/lib/api/auth";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import {
  validateEgyptianNationalId,
  validateEgyptianPhone,
  validateEmail,
  validatePassword,
} from "@/lib/validators";
import type { Patient } from "@/types/api";

type Step = "lookup" | "found" | "register" | "done";

export default function RegisterPatientPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("lookup");
  const [lookupId, setLookupId] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);

  // Registration form
  const [form, setForm] = useState({
    nationalId: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [createdPatient, setCreatedPatient] = useState<Patient | null>(null);

  function updateForm<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function handleLookup(e: FormEvent) {
    e.preventDefault();
    setLookupError(null);
    const err = validateEgyptianNationalId(lookupId);
    if (err) { setLookupError(err); return; }

    setLookupLoading(true);
    try {
      const res = await lookupPatientByNationalId(lookupId.trim());
      const p = res.data.patient;
      if (p) {
        setFoundPatient(p);
        setStep("found");
      } else {
        
        setForm((f) => ({ ...f, nationalId: lookupId.trim() }));
        setStep("register");
      }
    } catch (err) {
      
      if (err instanceof ApiError && err.status === 404) {
        setForm((f) => ({ ...f, nationalId: lookupId.trim() }));
        setStep("register");
      } else {
        setLookupError(err instanceof ApiError ? err.message : "تعذّر البحث، يرجى المحاولة مجدداً");
      }
    } finally {
      setLookupLoading(false);
    }
  }

  // Non-clinic patients
  const [nonClinicPatients, setNonClinicPatients] = useState<Patient[]>([]);
  const [nonClinicSearch, setNonClinicSearch] = useState("");
  const [loadingNonClinic, setLoadingNonClinic] = useState(false);

  // Fetch non-clinic patients on load or search change
  useEffect(() => {
    async function fetchNonClinic() {
      setLoadingNonClinic(true);
      try {
        const res = await getNonClinicPatients(nonClinicSearch);
        setNonClinicPatients(res.data.patients);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingNonClinic(false);
      }
    }
    const t = setTimeout(fetchNonClinic, 300);
    return () => clearTimeout(t);
  }, [nonClinicSearch]);

  function validateRegisterForm(): boolean {
    const errs: Record<string, string> = {};
    const nidErr = validateEgyptianNationalId(form.nationalId);
    if (nidErr) errs.nationalId = nidErr;
    if (!form.firstName.trim()) errs.firstName = "الاسم الأول مطلوب";
    if (!form.lastName.trim()) errs.lastName = "اسم العائلة مطلوب";
    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;
    const phoneErr = validateEgyptianPhone(form.phoneNumber);
    if (phoneErr) errs.phoneNumber = phoneErr;
    const passErr = validatePassword(form.password);
    if (passErr) errs.password = passErr;
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setRegisterError(null);
    if (!validateRegisterForm()) return;

    setRegistering(true);
    try {
      const res = await registerPatient(form);
      const newPatient = res.data.createdPatient as unknown as Patient;
      setCreatedPatient(newPatient);
      setStep("done");
    } catch (err) {
      setRegisterError(err instanceof ApiError ? err.message : "تعذّر تسجيل المريض");
    } finally {
      setRegistering(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-text-primary">
          تسجيل مريض جديد
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          ابحث أولاً بالرقم القومي — لو المريض موجود في النظام ستظهر بياناته، لو لأ ستقدر تسجّله جديد
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3">
        {(["lookup", "found", "register", "done"] as Step[]).map((s, idx) => {
          const labels: Record<Step, string> = {
            lookup: "بحث",
            found: "موجود",
            register: "تسجيل",
            done: "تم",
          };
          const active = step === s;
          const passed =
            (["lookup", "found", "register", "done"] as Step[]).indexOf(step) > idx;
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  active
                    ? "bg-primary text-surface"
                    : passed
                    ? "bg-success/20 text-success"
                    : "bg-surface-raised text-text-secondary"
                }`}
              >
                {passed ? "" : idx + 1}
              </div>
              <span className={`text-xs font-medium ${active ? "text-primary" : "text-text-secondary"}`}>
                {labels[s]}
              </span>
              {idx < 3 && <div className="h-px w-8 bg-border/60" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Lookup */}
      {step === "lookup" && (
        <div className="flex flex-col gap-6">
          <Card glass vibrant className="border-primary/20">
            <h2 className="font-display text-lg font-bold text-text-primary mb-4">
               البحث بالرقم القومي
            </h2>
            <form onSubmit={handleLookup} className="flex flex-col gap-4">
              <Field
                label="الرقم القومي للمريض (14 رقمًا)"
                inputMode="numeric"
                required
                value={lookupId}
                onChange={(e) => { setLookupId(e.target.value); setLookupError(null); }}
                error={lookupError ?? undefined}
                placeholder="مثال: 30005141501234"
              />
              <Button type="submit" variant="vibrant" disabled={lookupLoading} className="shadow-glow-cyan">
                {lookupLoading ? "جارٍ البحث..." : "بحث في النظام"}
              </Button>
            </form>
          </Card>

          {/* List of non-clinic patients */}
          <Card className="border-border/60">
            <h2 className="font-display text-lg font-bold text-text-primary mb-2">
              مرضى مسجلين بالنظام
            </h2>
            <p className="text-xs text-text-secondary mb-4">
              هؤلاء المرضى مسجلين مسبقاً في المنصة أو في عيادات أخرى. يمكنك البحث عنهم واختيارهم مباشرة.
            </p>
            <input
              type="text"
              placeholder="ابحث بالاسم أو الرقم القومي..."
              value={nonClinicSearch}
              onChange={(e) => setNonClinicSearch(e.target.value)}
              className="mb-4 w-full rounded-xl border border-border/80 bg-surface px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.1)]"
            />
            
            {loadingNonClinic ? (
              <div className="flex justify-center py-4">
                <span className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
            ) : nonClinicPatients.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {nonClinicPatients.map(p => (
                  <div key={p._id} className="flex items-center justify-between rounded-xl bg-surface-raised p-3 border border-border/40 hover:border-primary/30 transition-colors">
                    <div>
                      <p className="font-bold text-sm text-text-primary">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-text-secondary">{p.nationalId} • {p.phoneNumber}</p>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => {
                        setFoundPatient(p);
                        setStep("found");
                      }}
                    >
                      اختيار
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary text-center py-4">
                لا يوجد مرضى مسجلين يطابقون بحثك.
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Step 2: Found */}
      {step === "found" && foundPatient && (
        <Card glass vibrant className="border-success/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/20 text-success text-xl">
              ✓
            </div>
            <div>
              <p className="font-bold text-text-primary">المريض موجود في النظام!</p>
              <p className="text-xs text-text-secondary">لا داعي للتسجيل مجدداً</p>
            </div>
          </div>

          <div className="rounded-xl bg-surface-raised p-4 flex flex-col gap-2">
            <p className="font-display text-lg font-bold text-text-primary">
              {foundPatient.firstName} {foundPatient.lastName}
            </p>
            <p className="text-sm text-text-secondary"> {foundPatient.phoneNumber}</p>
            <p className="text-sm text-text-secondary"> {foundPatient.nationalId}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="vibrant"
              className="shadow-glow-cyan"
              onClick={() => router.push(`/doctor/patients/${foundPatient._id}`)}
            >
              الذهاب لملف المريض
            </Button>
            <Button
              variant="secondary"
              onClick={() => { setStep("lookup"); setLookupId(""); setFoundPatient(null); }}
            >
              بحث عن مريض آخر
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Register */}
      {step === "register" && (
        <Card glass vibrant className="border-primary/20">
          <h2 className="font-display text-lg font-bold text-text-primary mb-1">
             تسجيل مريض جديد
          </h2>
          <p className="text-xs text-text-secondary mb-4">
            الرقم القومي غير موجود — أدخل بيانات المريض وكلمة المرور التي ستعطيها له مباشرة
          </p>
          <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="الاسم الأول *"
              required
              value={form.firstName}
              onChange={(e) => updateForm("firstName", e.target.value)}
              error={fieldErrors.firstName}
              placeholder="مثال: محمد"
            />
            <Field
              label="اسم العائلة *"
              required
              value={form.lastName}
              onChange={(e) => updateForm("lastName", e.target.value)}
              error={fieldErrors.lastName}
              placeholder="مثال: الأحمدي"
            />
            <Field
              label="الرقم القومي *"
              inputMode="numeric"
              required
              value={form.nationalId}
              onChange={(e) => updateForm("nationalId", e.target.value)}
              error={fieldErrors.nationalId}
              placeholder="14 رقمًا"
              className="sm:col-span-2"
            />
            <Field
              label="البريد الإلكتروني *"
              type="email"
              required
              value={form.email}
              onChange={(e) => updateForm("email", e.target.value)}
              error={fieldErrors.email}
              placeholder="example@domain.com"
            />
            <Field
              label="رقم الهاتف *"
              inputMode="tel"
              required
              value={form.phoneNumber}
              onChange={(e) => updateForm("phoneNumber", e.target.value)}
              error={fieldErrors.phoneNumber}
              placeholder="01000000000"
            />
            <div className="sm:col-span-2">
              <Field
                label="كلمة المرور (ستعطيها للمريض يدوياً) *"
                type="password"
                required
                value={form.password}
                onChange={(e) => updateForm("password", e.target.value)}
                error={fieldErrors.password}
                placeholder="كلمة مرور قوية"
              />
              <p className="mt-1.5 text-xs text-warning bg-warning/10 rounded-lg px-3 py-2">
                ستحتاج لإعطاء كلمة المرور هذه للمريض يدوياً — لا يوجد إرسال تلقائي
              </p>
            </div>

            {registerError && (
              <div className="sm:col-span-2 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
                {registerError}
              </div>
            )}
            <div className="sm:col-span-2 flex gap-3">
              <Button type="submit" variant="vibrant" disabled={registering} className="shadow-glow-cyan flex-1">
                {registering ? "جارٍ التسجيل..." : "تسجيل المريض"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setStep("lookup")}>
                رجوع
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Step 4: Done */}
      {step === "done" && (
        <Card glass vibrant className="border-success/30 text-center p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/20 text-3xl">
            
          </div>
          <h2 className="font-display text-xl font-bold text-text-primary">تم التسجيل بنجاح!</h2>
          <p className="mt-2 text-sm text-text-secondary">
            تم إنشاء حساب المريض. تذكّر إعطاءه كلمة المرور يدوياً
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {createdPatient && (
              <Button
                variant="vibrant"
                className="shadow-glow-cyan"
                onClick={() => router.push(`/doctor/patients/${createdPatient._id}`)}
              >
                عرض ملف المريض
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => {
                setStep("lookup");
                setLookupId("");
                setForm({ nationalId: "", firstName: "", lastName: "", phoneNumber: "", email: "", password: "" });
                setCreatedPatient(null);
              }}
            >
              تسجيل مريض آخر
            </Button>
            <Button variant="ghost" onClick={() => router.push("/doctor/patients")}>
              قائمة المرضى
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
