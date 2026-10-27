import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface FieldShellProps {
  label: string;
  error?: string;
}

export function FieldFrame({ label, error, inputId, children }: FieldShellProps & { inputId: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({ label, error, id, className, ...props }: FieldShellProps & ComponentProps<"input">) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  return (
    <FieldFrame label={label} error={error} inputId={inputId}>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn("field", className)}
        {...props}
      />
    </FieldFrame>
  );
}

export function TextAreaField({ label, error, id, className, ...props }: FieldShellProps & ComponentProps<"textarea">) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  return (
    <FieldFrame label={label} error={error} inputId={inputId}>
      <textarea
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn("field resize-y leading-7", className)}
        {...props}
      />
    </FieldFrame>
  );
}
