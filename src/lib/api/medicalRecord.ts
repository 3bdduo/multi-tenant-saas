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

// POST /medical-record/patient/upload  (patient uploads a document file)
export function uploadPatientDocument(file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<ApiEnvelope<{ document: PatientDocument }>>(
    "/medical-record/patient/upload",
    { method: "POST", body: form }
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
