import { apiFetch } from "@/lib/http";
import type {
  ApiEnvelope,
  AuthTokens,
  LoginPayload,
  RegisterDoctorPayload,
  RegisterHospitalPayload,
  RegisterPatientPayload,
  RegisterFamilyPatientPayload,
  ResetPasswordPayload,
  SendOtpPayload,
} from "@/types/api";

// POST /auth/register/doctor
export function registerDoctor(payload: RegisterDoctorPayload) {
  return apiFetch<ApiEnvelope<{ createdDoctor: Record<string, unknown> }>>(
    "/auth/register/doctor",
    { method: "POST", body: JSON.stringify(payload), auth: false }
  );
}

// POST /auth/register/hospital
export function registerHospital(payload: RegisterHospitalPayload) {
  return apiFetch<ApiEnvelope<{ createdHospital: Record<string, unknown> }>>(
    "/auth/register/hospital",
    { method: "POST", body: JSON.stringify(payload), auth: false }
  );
}


export function registerPatient(payload: RegisterPatientPayload) {
  return apiFetch<ApiEnvelope<{ createdPatient: Record<string, unknown> }>>(
    "/auth/register/patient",
    { method: "POST", body: JSON.stringify(payload), auth: false }
  );
}

export function registerFamilyPatient(payload: RegisterFamilyPatientPayload) {
  return apiFetch<ApiEnvelope<{ createdPatient: Record<string, unknown> }>>(
    "/auth/register/family",
    { method: "POST", body: JSON.stringify(payload), auth: false }
  );
}


export function login(payload: LoginPayload) {
  return apiFetch<ApiEnvelope<AuthTokens>>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}

// POST /auth/refresh-token
export function refreshToken(refreshTokenValue: string) {
  return apiFetch<ApiEnvelope<{ result: AuthTokens }>>("/auth/refresh-token", {
    method: "POST",
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });
}

// POST /auth/send-otp
export function sendOtp(payload: SendOtpPayload) {
  return apiFetch<ApiEnvelope<null>>("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}

// POST /auth/reset-password
export function resetPassword(payload: ResetPasswordPayload) {
  return apiFetch<ApiEnvelope<null>>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}
