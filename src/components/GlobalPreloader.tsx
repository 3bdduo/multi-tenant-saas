"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { prefetchApi } from "@/lib/http";
import { runIdlePrefetch } from "@/lib/idlePrefetch";

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

    // Fire immediately (was delayed 500ms for no real reason — prefetching
    // is exactly the kind of work that should start the instant we know
    // who the user is, not after an arbitrary pause).
    routesToPrefetch.forEach((route) => {
      try {
        router.prefetch(route);
      } catch {

      }
    });

    // خفيف ومشترك: بيانات قائمة العيادات العامة، فورًا (مش محتاجة تسجيل دخول)
    prefetchApi("/clinic", { auth: false });

    if (!isAuthenticated) return;

    // باقي بيانات الصفحات المحتملة: في الخلفية وقت الخمول، بحد أقصى 3 متزامنين،
    // وبس اللي يناسب صلاحية المستخدم الحالي.
    const idleTasks: Array<() => Promise<unknown>> = [];
    if (role === "Doctor") {
      idleTasks.push(
        () => prefetchApi("/notification"), // إشعارات: خفيفة ومهمة فعلاً من أول لحظة
        () => prefetchApi("/doctor/clinic"),
        () => prefetchApi("/appointment"),
        () => prefetchApi("/patient/my-patients"),
      );
    } else if (role === "Patient") {
      idleTasks.push(
        () => prefetchApi("/notification"),
        () => prefetchApi("/patient"),
        () => prefetchApi("/appointment/patient"),
        () => prefetchApi("/medical-record"),
        () => prefetchApi("/medical-record/patient/my-documents"),
      );
    } else if (role === "Admin") {
      idleTasks.push(
        () => prefetchApi("/admin/doctor"),
        () => prefetchApi("/admin/clinic"),
        () => prefetchApi("/admin/hospital"),
        () => prefetchApi("/admin/patient"),
      );
    } else if (role === "Hospital") {
      idleTasks.push(
        () => prefetchApi("/notification"),
        () => prefetchApi("/hospital/profile"),
        () => prefetchApi("/emergency-case/hospital"),
      );
    }
    runIdlePrefetch(idleTasks, 3);
  }, [router, isAuthenticated, role]);

  return null;
}
