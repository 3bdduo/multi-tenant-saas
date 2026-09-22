import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef, useState } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, className = "", id, onFocus, onBlur, type, ...props }, ref) => {
    const inputId = id ?? label;
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <label
          htmlFor={inputId}
          className={`text-sm font-medium transition-colors duration-200 ${
            focused ? "text-primary" : "text-text-primary"
          }`}
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`w-full h-11 rounded-xl border bg-surface px-4 text-sm text-text-primary
              placeholder:text-text-secondary/50 outline-none
              transition-all duration-250 ease-spring
              focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-soft)]
              ${error ? "border-danger shadow-[0_0_0_3px_rgba(var(--color-danger-rgb),0.14)]" : "border-border hover:border-border-hover"}
              ${isPassword ? "pr-10" : ""}`}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
            >
              {showPassword ? (
                // Eye off icon
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                // Eye icon
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
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
Field.displayName = "Field";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { label: string; value: string }[] | string[];
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, options, className = "", id, onFocus, onBlur, ...props }, ref) => {
    const inputId = id ?? label;
    const [focused, setFocused] = useState(false);

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <label
          htmlFor={inputId}
          className={`text-sm font-medium transition-colors duration-200 ${
            focused ? "text-primary" : "text-text-primary"
          }`}
        >
          {label}
        </label>
        <select
          ref={ref}
          id={inputId}
          className={`h-11 rounded-xl border bg-surface px-4 text-sm text-text-primary
            outline-none transition-all duration-250 ease-spring cursor-pointer
            focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-soft)]
            ${error ? "border-danger shadow-[0_0_0_3px_rgba(var(--color-danger-rgb),0.14)]" : "border-border hover:border-border-hover"}`}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        >
          {options.map((opt) => {
            const val = typeof opt === "string" ? opt : opt.value;
            const lbl = typeof opt === "string" ? opt : opt.label;
            return (
              <option key={val} value={val} className="bg-surface text-text-primary">
                {lbl}
              </option>
            );
          })}
        </select>
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
SelectField.displayName = "SelectField";

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, error, className = "", id, onFocus, onBlur, ...props }, ref) => {
    const inputId = id ?? label;
    const [focused, setFocused] = useState(false);

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <label
          htmlFor={inputId}
          className={`text-sm font-medium transition-colors duration-200 ${
            focused ? "text-primary" : "text-text-primary"
          }`}
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          className={`rounded-xl border bg-surface p-3 text-sm text-text-primary
            placeholder:text-text-secondary/50 outline-none min-h-[90px]
            transition-all duration-250 ease-spring
            focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-soft)]
            ${error ? "border-danger shadow-[0_0_0_3px_rgba(var(--color-danger-rgb),0.14)]" : "border-border hover:border-border-hover"}`}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
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
TextAreaField.displayName = "TextAreaField";
