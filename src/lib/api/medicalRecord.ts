import { apiFetch } from "@/lib/http";
import type {
  ApiEnvelope,
  CreateMedicalRecordPayload,
  ExtractedPrescription,
  MedicalRecord,
  PatientDocument,
} from "@/types/api";

// POST /medical-record/extract


export async function extractFromPrescriptionImage(file: File) {
  const form = new FormData();
  form.append("image", file);

  return apiFetch<
    ApiEnvelope<{ imageUrl: { url: string }; extracted: ExtractedPrescription }>
  >("/medical-record/extract", {
    method: "POST",
    body: form,
    headers: {}, 
  });
}

// POST /medical-record

export function createMedicalRecord(payload: CreateMedicalRecordPayload) {
  return apiFetch<ApiEnvelope<MedicalRecord>>(
    "/medical-record",
    { method: "POST", body: JSON.stringify(payload) }
  );
}


export function getMedicalRecordsForPatient(patientId: string) {
  return apiFetch<ApiEnvelope<{ medicalRecords: MedicalRecord[] }>>(
    `/medical-record/patient/${patientId}`
  );
}

// GET /medical-record/:id
export function getMedicalRecordById(id: string) {
  return apiFetch<ApiEnvelope<{ medicalRecord: MedicalRecord }>>(
    `/medical-record/${id}`
  );
}

// GET /medical-record  (patient viewing their own shared records)
export function getMyMedicalRecords() {
  return apiFetch<ApiEnvelope<{ medicalRecords: MedicalRecord[] }>>(
    "/medical-record"
  );
}

// POST /medical-record/patient/upload  (patient uploads document or notes)
export function uploadPatientDocument(
  file?: File | null,
  options?: { targetDoctorId?: string; patientNotes?: string; familyMemberName?: string }
) {
  const form = new FormData();
  if (file) form.append("file", file);
  if (options?.targetDoctorId) form.append("targetDoctorId", options.targetDoctorId);
  if (options?.patientNotes) form.append("patientNotes", options.patientNotes);
  if (options?.familyMemberName) form.append("familyMemberName", options.familyMemberName);
  return apiFetch<ApiEnvelope<{ document: PatientDocument }>>(
    "/medical-record/patient/upload",
    { method: "POST", body: form }
  );
}

// PUT /medical-record/patient/document/:id  (patient updates document/notes)
export function updatePatientDocument(
  id: string,
  file?: File | null,
  options?: { targetDoctorId?: string; patientNotes?: string; familyMemberName?: string }
) {
  const form = new FormData();
  if (file) form.append("file", file);
  if (options?.targetDoctorId !== undefined) form.append("targetDoctorId", options.targetDoctorId);
  if (options?.patientNotes !== undefined) form.append("patientNotes", options.patientNotes);
  if (options?.familyMemberName !== undefined) form.append("familyMemberName", options.familyMemberName);
  return apiFetch<ApiEnvelope<{ document: PatientDocument }>>(
    `/medical-record/patient/document/${id}`,
    { method: "PUT", body: form }
  );
}

// DELETE /medical-record/patient/document/:id  (patient deletes document/notes permanently)
export function deletePatientDocument(id: string) {
  return apiFetch<ApiEnvelope<null>>(
    `/medical-record/patient/document/${id}`,
    { method: "DELETE" }
  );
}

// GET /medical-record/patient/my-documents  (patient views their uploaded documents)
export function getMyDocuments() {
  return apiFetch<ApiEnvelope<{ documents: PatientDocument[] }>>(
    "/medical-record/patient/my-documents"
  );
}

// GET /medical-record/patient/documents/:patientId  (doctor views patient's documents)
export function getPatientDocuments(patientId: string) {
  return apiFetch<ApiEnvelope<{ documents: PatientDocument[] }>>(
    `/medical-record/patient/documents/${patientId}`
  );
}
