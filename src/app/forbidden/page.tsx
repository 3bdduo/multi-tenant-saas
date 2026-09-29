"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NabdLogoIcon } from "@/components/ui/Logo";
import { useAuth } from "@/hooks/useAuth";

const HOME_BY_ROLE: Record<string, string> = {
  Admin: "/admin",
  Doctor: "/doctor",
  Hospital: "/hospital",
  Patient: "/patient",
};

/** 403 — المستخدم مسجّل دخول لكن مش عنده صلاحية يشوف الصفحة دي (دور مختلف). */
export default function ForbiddenPage() {
  const { role, logout } = useAuth();
  const homeHref = (role && HOME_BY_ROLE[role]) || "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <Card className="w-full max-w-md text-center" glass>
        <div className="mx-auto mb-4 flex justify-center">
          <NabdLogoIcon size="lg" />
        </div>
        <p className="mb-1 text-sm font-bold tracking-widest text-danger">403</p>
        <h1 className="mb-2 text-xl font-extrabold text-text-primary">
          مفيش صلاحية للوصول للصفحة دي
        </h1>
        <p className="mb-6 text-sm text-text-secondary">
          الحساب بتاعك مش مصرّح له بفتح الصفحة دي.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href={homeHref}>
            <Button variant="primary" size="md">
              الرجوع للوحة التحكم
            </Button>
          </Link>
          <Button variant="outline" size="md" onClick={() => logout()}>
            تسجيل الخروج
          </Button>
        </div>
      </Card>
    </div>
  );
}
