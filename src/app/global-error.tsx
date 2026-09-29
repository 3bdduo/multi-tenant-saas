"use client";

// ملحوظة: global-error.tsx بيستبدل الـ root layout بالكامل (بيرندر <html>/<body> بتاعته)
// وبيتفعّل بس لو الـ root layout نفسه وقع (حالة نادرة جدًا)، فمينفعش نعتمد فيه على
// AuthProvider/ThemeProvider ولا globals.css. بنستخدم inline styles بسيطة بس عشان نضمن
// إنها تشتغل حتى لو التطبيق كله وقع.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B1220",
          color: "#F2F6F6",
          fontFamily: "system-ui, -apple-system, Segoe UI, Tahoma, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
            حصل خطأ غير متوقع في التطبيق
          </h1>
          <p style={{ fontSize: 14, color: "#9FB0C3", marginBottom: 24 }}>
            حاول تحديث الصفحة، ولو المشكلة استمرت كلّم الدعم الفني.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#14B8A6",
              color: "#0B1220",
              fontWeight: 700,
              border: "none",
              borderRadius: 12,
              padding: "10px 24px",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
