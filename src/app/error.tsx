"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NabdLogoIcon } from "@/components/ui/Logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    // بنلوج الخطأ في الـ console بتاع الديفيلوبر بس (مفيش تفاصيل تقنية بتتعرض للمستخدم تحت)
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <Card className="w-full max-w-md text-center" glass>
        <div className="mx-auto mb-4 flex justify-center">
          <NabdLogoIcon size="lg" />
        </div>
        <h1 className="mb-2 text-xl font-extrabold text-text-primary">
          حصل خطأ غير متوقع
        </h1>
        <p className="mb-6 text-sm text-text-secondary">
          حاول تاني، ولو المشكلة استمرت كلّم الدعم الفني.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="primary" size="md" onClick={() => reset()}>
            إعادة المحاولة
          </Button>
          <Button variant="outline" size="md" onClick={() => router.push("/")}>
            الصفحة الرئيسية
          </Button>
        </div>
      </Card>
    </div>
  );
}
