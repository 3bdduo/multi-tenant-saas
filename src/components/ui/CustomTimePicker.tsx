"use client";

interface CustomTimePickerProps {
  label: string;
  value: string; 
  onChange: (val: string) => void;
}


function formatDisplay(val: string): string {
  if (!val || !val.includes(":")) return "-- : --";
  const [hStr, mStr] = val.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr?.slice(0, 2) ?? "00";
  const period = h >= 12 ? "مساءً" : "صباحاً";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${m} ${period}`;
}

export function CustomTimePicker({ label, value, onChange }: CustomTimePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-extrabold text-text-secondary">{label}</label>

      <div className="relative">
        {/* Styled overlay label */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between rounded-2xl border border-primary/40 bg-surface-raised px-4 py-3 font-mono">
          <span className="text-xs font-sans font-extrabold bg-primary/10 px-3 py-1 rounded-xl text-primary">
            {value ? (parseInt(value.split(":")[0], 10) >= 12 ? "مساءً" : "صباحاً") : "--"}
          </span>
          <span className="text-base font-extrabold text-text-primary" dir="ltr">
            {formatDisplay(value)}
          </span>
        </div>

        {/* Native time input — invisible but fully interactive */}
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-primary/40 bg-transparent px-4 py-3 text-transparent opacity-0 cursor-pointer h-[52px] outline-none focus:border-primary"
          style={{ colorScheme: "dark" }}
        />
      </div>

      {/* Readable hint */}
      <p className="text-[11px] text-text-secondary" dir="ltr">
        {value || "-- : --"}
      </p>
    </div>
  );
}
