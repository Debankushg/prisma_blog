import type { FieldError } from "@/types";

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors: FieldError[] = [],
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}
