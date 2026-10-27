import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger";

export const buttonStyles = (variant: Variant = "primary", className?: string) =>
  cn(
    "btn inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm",
    "disabled:cursor-not-allowed disabled:opacity-60",
    `btn-${variant}`,
    className,
  );

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  loading?: boolean;
}

export function Button({ variant, loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button className={buttonStyles(variant, className)} disabled={disabled || loading} {...props}>
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}
