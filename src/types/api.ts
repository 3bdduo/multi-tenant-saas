// Types derived from the clinic-saas Postman collection
// Groups: auth, doctor, admin, appointment, patient, medical-record, hospital, general-notification

export type Role = "Admin" | "Doctor" | "Patient" | "Hospital";

export interface ApiEnvelope<T> {
  message: string;
  success: boolean;
  data: T;
}

export interface WorkingDay {
  day:
    | "Saturday"
    | "Sunday"
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday";
  from: string; // ISO datetime (only HH:mm is used)
  to: string; // ISO datetime (only HH:mm is used)
}

export interface Clinic {
  _id: string;
  doctorId: string | { _id: string; role: Role; firstName: string; lastName: string; image?: { public_id: string; secure_url: string } };
  name: string;
  description?: string;
  phoneNumber: string;
  email: string;
  street?: string;
  address?: string;
  governorate: string;
  city: string;
  specialization: string;
  consultationPrice: number;
  followUpPrice?: number;
  workingDays: WorkingDay[];
  isActive?: boolean;
  bookingType?: "time" | "queue";
  maxPatientsPerDay?: number;
  slotDuration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  _id: string;
  userName: string;
  email: string;
  role: "Doctor";
  phoneNumber: string;
  firstName: string;
  lastName: string;
  isPaid: boolean;
  paidExpired: string;
  createdAt: string;
  updatedAt: string;
  clinicId?: string | Clinic;
}

export interface Admin {
  _id: string;
  userName: string;
  email: string;
  role: "Admin";
  phoneNumber: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  _id: string;
  userName?: string;
  email: string;
  nationalId?: string;
  role: "Patient";
  firstName: string;
  lastName: string;
  phoneNumber: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "waitlisted";

export interface Appointment {
  _id: string;
  patientId: string | Patient;
  doctorId: string | Doctor;
  clinicId: string | Clinic;
  date: string;
  startTime?: string;
  endTime?: string;
  status: AppointmentStatus;
  visitingType?: "NEW" | "FOLLOW_UP";
  notes?: string;
  queueNumber?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  name: string;
  dosage: string | null;
  frequency: string;
  duration: string;
}

export interface ExtractedPrescription {
  diagnosis: string;
  medications: Medication[];
  notes: string;
}

export interface MedicalRecord {
  _id: string;
  patientId: string | { _id: string; role: string; firstName: string; lastName: string };
  doctorId: string | { _id: string; role: string; firstName: string; lastName: string };
  appointmentId: string;
  diagnosis: string;
  medications: Medication[];
  notes: string;
  prescriptionImageUrl?: string;
  visibility: "private" | "shared";
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalDoctor: number;
  activeDoctors: number;
  expiredSubscriptions: number;
  totalPatients: number;
  totalClinics: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  role: Role;
  iat: number;
  exp: number;
}

// ---- Request payload shapes ----

export interface RegisterDoctorPayload {
  nationalId: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export interface RegisterPatientPayload {
  nationalId: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export interface LoginPayload {
  nationalId: string;
  password: string;
}

export interface SendOtpPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface CreateClinicPayload {
  name: string;
  description?: string;
  phoneNumber: string;
  email?: string;
  governorate: string;
  city: string;
  street?: string;
  address?: string;
  specialization: string;
  consultationPrice: number;
  followUpPrice?: number;
  workingDays: WorkingDay[];
  bookingType?: "time" | "queue";
  maxPatientsPerDay?: number;
  slotDuration?: number; // minutes per appointment slot, e.g. 30
  _id?: string;
  isActive?: boolean;
}

export interface CreateAppointmentByPatientPayloadV2 extends CreateAppointmentByPatientPayload {
  visitingType?: "NEW" | "FOLLOW_UP";
}

export interface CreateAppointmentByPatientPayload {
  doctorId: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm if bookingType is time
  notes?: string;
  visitingType?: "NEW" | "FOLLOW_UP";
}

// Path is /appointment/doctor/:patientId — the patient is identified in the
// URL; the body only carries date (doctor creates appt for a specific patient).
export interface CreateAppointmentByDoctorPayload {
  date: string;
  startTime?: string;
  notes?: string;
  visitingType?: "NEW" | "FOLLOW_UP";
}

// DELETE /appointment/:id body
export interface DeleteAppointmentPayload {
  doctorId: string;
  clinicId: string;
  date: string; // YYYY-MM-DD
}

// Only `status` confirmed in the collection example body.
export interface UpdateAppointmentPayload {
  status: AppointmentStatus;
}

export interface CreateMedicalRecordPayload {
  appointmentId: string;
  diagnosis: string;
  medications: Medication[];
  notes: string;
  prescriptionImageUrl?: string;
  visibility: "private" | "shared";
}

export interface RenewDoctorSubscriptionPayload {
  monthNumber: number;
}

// ---- notification ----
// Doctor-created, patient-facing notifications. Doctor and patient each have
// their own mirrored set of endpoints (get/delete by id, get/delete all).

export interface Notification {
  _id: string;
  patientId: string | Patient;
  doctorId: string | { _id: string; role: string; firstName: string; lastName: string };
  title: string;
  message: string;
  isRead?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationPayload {
  patientId: string;
  title: string;
  message: string;
}

export interface UpdateNotificationPayload {
  title?: string;
  message: string;
}

// ---- Hospital ----
export interface Hospital {
  _id: string;
  hospitalName: string;
  email: string;
  nationalId: string;
  phoneNumber: string;
  address: string;
  governorate: string;
  city: string;
  role: "Hospital";
  isPaid: boolean;
  paidExpired: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterHospitalPayload {
  nationalId: string;
  email: string;
  password: string;
  hospitalName: string;
  phoneNumber: string;
  address: string;
  governorate: string;
  city: string;
}

export interface RenewHospitalSubscriptionPayload {
  monthNumber: number;
}

// ---- General Notification ----
export interface GeneralNotification {
  _id: string;
  title: string;
  message: string;
  createdBy: string | { _id: string; role: Role; firstName: string; lastName: string };
  createdByModel: "Doctor" | "Admin";
  targetRole?: "Patient" | "Doctor" | "Hospital";
  createdAt: string;
  updatedAt: string;
}

export interface CreateGeneralNotificationPayload {
  title: string;
  message: string;
}

// ---- Emergency Case ----
// Status values as defined in the backend EmergencyStatus enum:
// open (waiting) → claimed (hospital responded) → resolved (done) | expired (cancelled/timed-out)
export type EmergencyStatus = "open" | "claimed" | "resolved" | "expired";

export interface ClaimedHospital {
  _id: string;
  hospitalName: string;
  city: string;
  governorate: string;
  address: string;
  phoneNumber: string;
}

export interface EmergencyCase {
  _id: string;
  caseCode: string;
  phoneNumber: string;
  notes?: string;
  status: EmergencyStatus;
  reportImageUrl?: { public_id: string; secure_url: string };
  claimedByHospitalIds: (string | ClaimedHospital)[];
  expiresAt: string;
  createdAt: string;
}

// trackByCaseCode returns ONLY these 2 fields (reportImageUrl is excluded on purpose)
export interface TrackEmergencyCaseResponse {
  status: EmergencyStatus;
  interestedHospitalsCount: number;
}

export interface CreateEmergencyCasePayload {
  phoneNumber: string;
  notes?: string;
}
