"use client";
import { ProviderSurgeryBookingDetail } from "@/components/ProviderSurgeryBookingDetail";

export default function HospitalSurgeryBookingDetailPage({ params }: { params: { id: string } }) {
  return <ProviderSurgeryBookingDetail id={params.id} basePath="/hospital/surgery-bookings" />;
}
