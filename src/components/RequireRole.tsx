"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types/api";

export function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, role: currentRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || currentRole !== role) {
      router.replace(role === "Admin" ? "/admin-login" : "/login");
    }
  }, [isLoading, isAuthenticated, currentRole, role, router]);

  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090D12]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm font-medium text-text-secondary">جارٍ التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  
  if (!isAuthenticated || currentRole !== role) return null;

  return <>{children}</>;
}
