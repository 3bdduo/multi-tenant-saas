import { QuickNav } from "@/components/layout/QuickNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/ui/Logo";

export default function ClinicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Top Header */}
      <header
        className="sticky top-0 z-30 px-4 py-3 sm:px-6 backdrop-blur-xl border-b"
        style={{
          background: "var(--color-header-bg)",
          borderBottomColor: "var(--color-header-border)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content with QuickNav */}
      <div className="flex-1 mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 md:px-12">
        <QuickNav className="mb-3" />
        {children}
      </div>
    </div>
  );
}
