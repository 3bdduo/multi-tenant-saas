"use client";

import React, { forwardRef, useState } from "react";
import { SPECIALTY_GROUPS, ALL_SPECIALTIES } from "@/lib/constants/specialties";

interface SpecialtySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  value: string;
  onChangeValue: (value: string) => void;
  className?: string;
  allowCustom?: boolean;
}

export const SpecialtySelect = forwardRef<HTMLSelectElement, SpecialtySelectProps>(
  (
    {
      label = "التخصص الطبي *",
      error,
      value,
      onChangeValue,
      className = "",
      allowCustom = true,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? "specialty-select";
    const [focused, setFocused] = useState(false);
    const [isCustom, setIsCustom] = useState(() => {
      return Boolean(value && !ALL_SPECIALTIES.includes(value));
    });
    const [customValue, setCustomValue] = useState(() => {
      return value && !ALL_SPECIALTIES.includes(value) ? value : "";
    });

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selected = e.target.value;
      if (selected === "__CUSTOM__") {
        setIsCustom(true);
        onChangeValue(customValue);
      } else {
        setIsCustom(false);
        onChangeValue(selected);
      }
    };

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setCustomValue(val);
      onChangeValue(val);
    };

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className={`text-sm font-semibold transition-colors duration-200 ${
              focused ? "text-primary" : "text-text-primary"
            }`}
          >
            {label}
          </label>
          {allowCustom && isCustom && (
            <button
              type="button"
              onClick={() => {
                setIsCustom(false);
                onChangeValue("");
              }}
              className="text-xs font-bold text-primary hover:underline"
            >
              العودة للقائمة المحددة
            </button>
          )}
        </div>

        {!isCustom ? (
          <div className="relative">
            <select
              ref={ref}
              id={inputId}
              value={value}
              onChange={handleSelectChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={`h-11 sm:h-12 w-full appearance-none rounded-xl border bg-surface px-4 py-2 text-sm sm:text-base font-medium text-text-primary outline-none transition-all duration-200 cursor-pointer focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-soft)] ${
                error ? "border-danger shadow-[0_0_0_3px_rgba(209,68,68,0.08)]" : "border-border hover:border-border-hover"
              }`}
              {...props}
            >
              <option value="" disabled className="text-text-secondary bg-surface">
                -- اضغط لاختيار التخصص الطبي --
              </option>
              {SPECIALTY_GROUPS.map((group) => (
                <optgroup key={group.category} label={`━━━ ${group.category} ━━━`} className="font-bold text-primary bg-surface-raised">
                  {group.specialties.map((spec) => (
                    <option key={spec} value={spec} className="font-medium text-text-primary bg-surface py-1">
                      {spec}
                    </option>
                  ))}
                </optgroup>
              ))}
              {allowCustom && (
                <optgroup label="━━━ تخصصات أخرى ━━━" className="font-bold text-text-secondary bg-surface-raised">
                  <option value="__CUSTOM__" className="font-bold text-primary bg-surface py-1">
                    + تخصص آخر غير مدرج في القائمة
                  </option>
                </optgroup>
              )}
            </select>
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 animate-fade-in">
            <input
              type="text"
              autoFocus
              value={customValue}
              onChange={handleCustomChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="اكتب التخصص الطبي بالتفصيل..."
              className={`h-11 sm:h-12 w-full rounded-xl border bg-surface px-4 text-sm sm:text-base font-medium text-text-primary placeholder:text-text-secondary/50 outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-soft)] ${
                error ? "border-danger" : "border-border hover:border-border-hover"
              }`}
            />
            <p className="text-xs text-text-secondary">
              يمكنك كتابة التخصص الدقيق أو النادر يدوياً، أو النقر على "العودة للقائمة المحددة".
            </p>
          </div>
        )}

        {error && (
          <span className="flex items-center gap-1 text-xs text-danger animate-slide-down">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </span>
        )}
      </div>
    );
  }
);

SpecialtySelect.displayName = "SpecialtySelect";
