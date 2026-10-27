import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiClientError } from "@/lib/api/errors";

/** Maps API validation errors onto form fields; returns a message for anything else. */
export function applyApiError<T extends FieldValues>(err: unknown, setError: UseFormSetError<T>): string | null {
  if (!(err instanceof ApiClientError)) return "Something went wrong. Please try again.";
  if (err.fieldErrors.length === 0) return err.message;
  for (const { path, message } of err.fieldErrors) {
    setError(path as Path<T>, { type: "server", message });
  }
  return null;
}
