import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NabdLogoIcon } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <Card className="w-full max-w-md text-center" glass>
        <div className="mx-auto mb-4 flex justify-center">
          <NabdLogoIcon size="lg" />
        </div>
        <p className="mb-1 text-sm font-bold tracking-widest text-primary">404</p>
        <h1 className="mb-2 text-xl font-extrabold text-text-primary">
          الصفحة غير موجودة
        </h1>
        <p className="mb-6 text-sm text-text-secondary">
          الرابط اللي فتحته مش موجود أو اتنقل مكان تاني.
        </p>
        <Link href="/">
          <Button variant="primary" size="md">
            الرجوع للصفحة الرئيسية
          </Button>
        </Link>
      </Card>
    </div>
  );
}
