export default function RootLoading() {
  // Skeleton خفيف بيظهر وقت تجهيز الصفحة (route segment) قبل أي حاجة تانية.
  // نفس ألوان الهوية البصرية (CSS variables) عشان يبقى متسق مع باقي الموقع.
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <p className="text-sm font-medium text-text-secondary">جارٍ التحميل...</p>
      </div>
    </div>
  );
}
