export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-warning/20 text-warning border border-warning/30",
    confirmed: "bg-primary/20 text-primary border border-primary/30",
    completed: "bg-success/20 text-success border border-success/30",
    cancelled: "bg-danger/20 text-danger border border-danger/30",
    waitlisted: "bg-amber-500/20 text-amber-500 border border-amber-500/30",
  };
  const labels: Record<string, string> = {
    pending: "قيد المراجعة",
    confirmed: "مؤكد (بالدور)",
    completed: "مكتمل",
    cancelled: "ملغي",
    waitlisted: "قائمة انتظار",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${map[status] ?? "bg-secondary text-secondary-foreground border border-border"}`}>
      {labels[status] ?? status}
    </span>
  );
}
