"use client";
import { ProviderSurgeryBookingDetail } from "@/components/ProviderSurgeryBookingDetail";

export default function DoctorSurgeryBookingDetailPage({ params }: { params: { id: string } }) {
  return <ProviderSurgeryBookingDetail id={params.id} basePath="/doctor/surgery-bookings" />;
}
