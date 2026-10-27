"use client";

import { useId, useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { FieldFrame } from "./text-field";

interface PasswordFieldProps extends Omit<ComponentProps<"input">, "type"> {
  label: string;
  error?: string;
}

/** Password input with an eye button that toggles between hidden and visible text. */
export function PasswordField({ label, error, id, className, ...props }: PasswordFieldProps) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  const [visible, setVisible] = useState(false);

  return (
    <FieldFrame label={label} error={error} inputId={inputId}>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn("field pr-11", className)}
          {...props}
        />
        <button
          type="button"
          className="eye-btn"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          title={visible ? "Hide password" : "Show password"}
          // keep focus (and the caret) in the input when toggling
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              <path d="m1 1 22 22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </FieldFrame>
  );
}
