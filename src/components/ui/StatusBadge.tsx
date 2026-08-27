export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-warning/20 text-warning border border-warning/30",
    confirmed: "bg-primary/20 text-primary border border-primary/30",
    completed: "bg-success/20 text-success border border-success/30",
    cancelled: "bg-danger/20 text-danger border border-danger/30",
  };
  const labels: Record<string, string> = {
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    completed: "مكتمل",
    cancelled: "ملغي",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${map[status] ?? "bg-secondary text-secondary-foreground border border-border"}`}>
      {labels[status] ?? status}
    </span>
  );
}
