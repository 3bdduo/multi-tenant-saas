


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
  from: string; 
  to: string; 
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
  bookingType?: "queue";
  maxPatientsPerDay?: number;
  blockedDates?: string[];
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
  isFamily?: boolean;
  familyMembers?: { name: string; phoneNumber: string }[];
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
  status: AppointmentStatus;
  visitingType?: "NEW" | "FOLLOW_UP";
  notes?: string;
  contactPhone?: string;
  queueNumber?: number;
  waitlistPosition?: number;
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

export type ConsultationSenderType = "Patient" | "AI" | "Doctor";

export interface ConsultationMessage {
  _id: string;
  senderType: ConsultationSenderType;
  senderId?: string | { _id: string; firstName: string; lastName: string };
  text?: string;
  image?: { public_id: string; secure_url: string };
  createdAt: string;
}

export type SurgeryBookingStatus = "Pending" | "Accepted" | "Completed" | "Cancelled";
export type AccepterRole = "Doctor" | "Hospital";

export interface SurgeryBooking {
  _id: string;
  patientId: string | { _id: string; firstName: string; lastName: string; phoneNumber?: string };
  title: string;
  description?: string;
  reports: { public_id: string; secure_url: string }[];
  bookingCode: string;
  status: SurgeryBookingStatus;
  viewedBy: { role: AccepterRole; id: string }[];
  acceptedByRole?: AccepterRole;
  acceptedById?: string | { _id: string; firstName?: string; lastName?: string; hospitalName?: string };
  statusMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Consultation {
  _id: string;
  patientId: string | { _id: string; firstName: string; lastName: string };
  messages: ConsultationMessage[];
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
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

export interface PatientDocument {
  _id: string;
  patientId: string;
  fileUrl?: string;
  publicId?: string;
  fileName?: string;
  targetDoctorId?: string | { _id: string; firstName: string; lastName: string };
  patientNotes?: string;
  aiAnalysis?: string;
  familyMemberName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalDoctor: number;
  activeDoctors: number;
  expiredSubscriptions: number;
  totalPatients: number;
  totalHospitals?: number;
  emergencyCompleted?: number;
  emergencyNotCompleted?: number;
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
  fullName?: string;
  firstName?: string;
  lastName?: string;
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

export interface QueueStatus {
  isActive: boolean;
  isBlocked: boolean;
  isOpenDay: boolean;
  isFull: boolean;
  queueCount: number;
  waitlistCount?: number;
  maxPatientsPerDay: number;
  remainingSlots: number;
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
  bookingType?: "queue";
  maxPatientsPerDay?: number;
  blockedDates?: string[];
  _id?: string;
  isActive?: boolean;
}

export interface CreateAppointmentByPatientPayloadV2 extends CreateAppointmentByPatientPayload {
  visitingType?: "NEW" | "FOLLOW_UP";
}

export interface CreateAppointmentByPatientPayload {
  doctorId: string;
  date: string;
  notes?: string;
  visitingType?: "NEW" | "FOLLOW_UP";
  contactPhone?: string;
}

export interface CreateAppointmentByDoctorPayload {
  date: string;
  notes?: string;
  visitingType?: "NEW" | "FOLLOW_UP";
}


export interface DeleteAppointmentPayload {
  doctorId: string;
  clinicId: string;
  date: string; // YYYY-MM-DD
}


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





export interface Notification {
  _id: string;
  patientId: string | Patient;
  doctorId: string | { _id: string; role: string; firstName: string; lastName: string };
  title: string;
  message: string;
  isRead?: boolean;
  createdAt: string;
  updatedAt: string;
  // اختياري: موجود بس في إشعارات الاستشارات الطبية العامة (نظام، مش من الدكتور)
  consultationId?: string;
  // اختياري: موجود بس في إشعارات طلبات حجز العمليات (نظام)
  surgeryBookingId?: string;
  // اختياري: موجود بس للإشعارات الموجّهة لمستشفى
  hospitalId?: string;
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




export type EmergencyStatus = "open" | "claimed" | "accepted" | "resolved" | "expired";

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
  // جديد: مشاهدة بدون تفاعل + المستشفى اللي قبلت فعليًا (حصري)
  viewedByHospitalIds?: string[];
  acceptedByHospitalId?: string | ClaimedHospital;
  expiresAt: string;
  createdAt: string;
}


export interface TrackEmergencyCaseResponse {
  status: EmergencyStatus;
  message: string;
  viewedCount?: number;
  acceptedHospital: ClaimedHospital | null;
}

export interface CreateEmergencyCasePayload {
  phoneNumber: string;
  notes?: string;
}
