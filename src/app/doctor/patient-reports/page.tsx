"use client";

import { useEffect, useState, useMemo } from "react";
import { getMyPatients } from "@/lib/api/patient";
import { getPatientDocuments } from "@/lib/api/medicalRecord";
import { Card } from "@/components/ui/Card";
import type { Patient, PatientDocument } from "@/types/api";

type DocState = "unseen" | "seen" | "deleted";
type DocWithPatient = PatientDocument & { patient: Patient };

export default function DoctorPatientReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Documents ─────────────────────────────────────
  const [documents, setDocuments] = useState<DocWithPatient[]>([]);
  const [docStates, setDocStates] = useState<Record<string, DocState>>({});
  const [activeDocTab, setActiveDocTab] = useState<DocState>("unseen");

  // ── Modals ──────────────────────────────────────
  const [captionDoc, setCaptionDoc] = useState<DocWithPatient | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("doctor-doc-states");
      if (saved) setDocStates(JSON.parse(saved));
    } catch {}

    getMyPatients()
      .then((res) => {
        const sorted = (res.data.patients ?? []).sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, "ar")
        );
        fetchAllDocuments(sorted);
      })
      .catch((err) => {
        const msg = err?.message || "تعذّر جلب الملفات";
        setError(msg);
        setLoading(false);
      });
  }, []);

  async function fetchAllDocuments(patientsList: Patient[]) {
    try {
      const results = await Promise.all(
        patientsList.map((p) =>
          getPatientDocuments(p._id)
            .then((res) => (res.data.documents ?? []).map((d) => ({ ...d, patient: p })))
            .catch(() => [] as DocWithPatient[])
        )
      );
      setDocuments(
        results.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  function updateDocState(docId: string, state: DocState) {
    const next = { ...docStates, [docId]: state };
    setDocStates(next);
    localStorage.setItem("doctor-doc-states", JSON.stringify(next));
  }

  const filteredDocs = useMemo(
    () => documents.filter((d) => (docStates[d._id] || "unseen") === activeDocTab),
    [documents, docStates, activeDocTab]
  );

  const docCount = (tab: DocState) => documents.filter((d) => (docStates[d._id] || "unseen") === tab).length;

  if (error) {
    return (
      <Card className="mx-auto max-w-lg text-center p-8 border-warning/30 animate-fade-in">
        <p className="text-base font-bold text-warning">{error}</p>
      </Card>
    );
  }

  // ── Tab styles ──────────────────────────────────────
  const tabConfig: Record<DocState, { label: string; active: string }> = {
    unseen: { label: "لم يتم المشاهدة", active: "bg-primary text-surface shadow-glow-cyan" },
    seen: { label: "تم المشاهدة", active: "bg-success text-surface" },
    deleted: { label: "المحذوفة", active: "bg-danger text-surface" },
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-20">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">ملفات وتقارير المرضى</h1>
          <p className="text-sm text-text-secondary mt-1">
            إدارة الملفات التي أرسلها المرضى إليك بشكل خاص
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide border-b border-border/40">
        {(Object.keys(tabConfig) as DocState[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveDocTab(tab)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-t-xl text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
              activeDocTab === tab
                ? "border-primary bg-primary/5 text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            {tabConfig[tab].label}
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                activeDocTab === tab ? "bg-primary text-surface" : "bg-border/50 text-text-secondary"
              }`}
            >
              {docCount(tab)}
            </span>
          </button>
        ))}
      </div>

      {/* Table Layout */}
      <Card className="overflow-hidden p-0 border-border/60">
        {loading ? (
          <div className="divide-y divide-border/40">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse bg-surface-raised/50" />
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="py-16 text-center text-text-secondary">
            <p className="text-base font-semibold">لا توجد ملفات في هذه القائمة</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-gradient-to-r from-primary/10 via-surface-raised to-surface-raised border-b border-border/60">
                  <th className="py-3.5 px-4 text-center font-extrabold text-text-primary text-xs whitespace-nowrap">تاريخ الإرسال</th>
                  <th className="py-3.5 px-5 text-right font-extrabold text-text-primary text-xs whitespace-nowrap">اسم المريض</th>
                  <th className="py-3.5 px-5 text-center font-extrabold text-text-primary text-xs whitespace-nowrap">رقم الهاتف</th>
                  <th className="py-3.5 px-5 text-center font-extrabold text-text-primary text-xs whitespace-nowrap">التفاصيل</th>
                  <th className="py-3.5 px-5 text-center font-extrabold text-text-primary text-xs whitespace-nowrap">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredDocs.map((doc) => (
                  <tr key={doc._id} className="group hover:bg-primary/5 transition-colors duration-150">
                    <td className="py-4 px-4 whitespace-nowrap text-xs font-bold text-text-secondary text-center align-middle">
                      {new Date(doc.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-5 align-middle whitespace-nowrap text-right">
                      <span className="font-bold text-text-primary text-sm group-hover:text-primary transition-colors">
                        {doc.patient.firstName} {doc.patient.lastName}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center align-middle whitespace-nowrap">
                      <span dir="ltr" className="font-semibold text-text-primary text-sm">
                        {doc.patient.phoneNumber}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center align-middle whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setCaptionDoc(doc)}
                          className="px-3 py-1.5 rounded-lg bg-surface-raised border border-border/50 text-text-primary hover:border-primary/50 hover:text-primary hover:shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-xs font-bold whitespace-nowrap"
                        >
                          عرض التفاصيل
                        </button>
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-transparent hover:border-primary/20 hover:bg-primary/20 hover:shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-xs font-bold whitespace-nowrap inline-flex items-center justify-center"
                          >
                            عرض الصورة
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-center align-middle whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {activeDocTab === "unseen" && (
                          <>
                            <button
                              onClick={() => updateDocState(doc._id, "seen")}
                              className="px-3 py-1.5 rounded-lg bg-success/10 text-success border border-transparent hover:bg-success/20 hover:border-success/20 hover:shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-xs font-bold whitespace-nowrap"
                            >
                              تم المشاهدة
                            </button>
                            <button
                              onClick={() => updateDocState(doc._id, "deleted")}
                              className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger border border-transparent hover:bg-danger/20 hover:border-danger/20 hover:shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-xs font-bold whitespace-nowrap"
                            >
                              حذف
                            </button>
                          </>
                        )}
                        {activeDocTab === "seen" && (
                          <button
                            onClick={() => updateDocState(doc._id, "deleted")}
                            className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger border border-transparent hover:bg-danger/20 hover:border-danger/20 hover:shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-xs font-bold whitespace-nowrap"
                          >
                            حذف
                          </button>
                        )}
                        {activeDocTab === "deleted" && (
                          <button
                            onClick={() => updateDocState(doc._id, "seen")}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-transparent hover:bg-primary/20 hover:border-primary/20 hover:shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-xs font-bold whitespace-nowrap"
                          >
                            استعادة
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ══════════════════════════════════════════════════
          CAPTION MODAL
      ══════════════════════════════════════════════════ */}
      {captionDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setCaptionDoc(null)}
        >
          <Card
            className="w-full max-w-lg shadow-2xl bg-surface border-primary/20 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="font-display text-lg font-bold text-text-primary">
                تفاصيل التقرير - {captionDoc.patient.firstName} {captionDoc.patient.lastName}
              </h3>
              <button
                onClick={() => setCaptionDoc(null)}
                className="h-8 w-8 flex items-center justify-center rounded-full text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] p-1">
              {captionDoc.patientNotes ? (
                <div className="rounded-xl border border-border/50 bg-surface-raised p-4">
                  <p className="text-xs font-extrabold text-text-primary mb-2">ملاحظات المريض</p>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {captionDoc.patientNotes}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-text-secondary italic">لا توجد ملاحظات من المريض.</p>
              )}

              {captionDoc.aiAnalysis && (
                <div className="rounded-xl border border-accent/25 bg-accent/5 p-4">
                  <p className="text-xs font-extrabold text-accent mb-2">تشخيص الذكاء الاصطناعي</p>
                  <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                    {captionDoc.aiAnalysis}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-border/50 pt-3 flex justify-end">
              <button
                onClick={() => setCaptionDoc(null)}
                className="px-5 py-2 rounded-xl bg-surface-raised text-text-primary font-bold text-sm hover:bg-border transition-colors"
              >
                إغلاق
              </button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
