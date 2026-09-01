"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { prefetchApi } from "@/lib/http";

const COMMON_ROUTES = [
  "/",
  "/clinics",
  "/login",
  "/register",
  "/emergency-report",
  "/emergency-track",
];

const DOCTOR_ROUTES = [
  "/doctor",
  "/doctor/appointments",
  "/doctor/patients",
  "/doctor/patients/register",
  "/doctor/clinic",
  "/doctor/booking-settings",
  "/doctor/notifications",
  "/doctor/account-settings",
  "/doctor/announcements",
];

const PATIENT_ROUTES = [
  "/patient",
  "/patient/appointments",
  "/patient/records",
  "/patient/profile",
  "/patient/notifications",
];

const ADMIN_ROUTES = [
  "/admin",
  "/admin/doctors",
  "/admin/patients",
  "/admin/clinics",
  "/admin/hospitals",
  "/admin/profile",
];

const HOSPITAL_ROUTES = [
  "/hospital",
  "/hospital/emergency",
  "/hospital/notifications",
  "/hospital/profile",
];

export function GlobalPreloader() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    
    const routesToPrefetch = [...COMMON_ROUTES];
    if (isAuthenticated) {
      if (role === "Doctor") routesToPrefetch.push(...DOCTOR_ROUTES);
      else if (role === "Patient") routesToPrefetch.push(...PATIENT_ROUTES);
      else if (role === "Admin") routesToPrefetch.push(...ADMIN_ROUTES);
      else if (role === "Hospital") routesToPrefetch.push(...HOSPITAL_ROUTES);
    }

    
    const timer = setTimeout(() => {
      routesToPrefetch.forEach((route) => {
        try {
          router.prefetch(route);
        } catch {
          
        }
      });

      
      prefetchApi("/clinic/paid", { auth: false });

      if (isAuthenticated) {
        if (role === "Doctor") {
          prefetchApi("/doctor/clinic");
          prefetchApi("/appointment");
          prefetchApi("/patient/my-patients");
          prefetchApi("/notification");
        } else if (role === "Patient") {
          prefetchApi("/patient");
          prefetchApi("/appointment/patient");
          prefetchApi("/medical-record");
          prefetchApi("/medical-record/patient/my-documents");
          prefetchApi("/notification");
        } else if (role === "Admin") {
          prefetchApi("/admin/doctor");
          prefetchApi("/admin/clinic");
          prefetchApi("/admin/hospital");
          prefetchApi("/admin/patient");
        } else if (role === "Hospital") {
          prefetchApi("/hospital/profile");
          prefetchApi("/emergency-case/hospital");
          prefetchApi("/notification");
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [router, isAuthenticated, role]);

  return null;
}
