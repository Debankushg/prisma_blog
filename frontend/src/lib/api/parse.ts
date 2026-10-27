import type { ApiResponse } from "@/types";
import { ApiClientError } from "./errors";

/** Turns an API envelope into `T`, or throws a typed ApiClientError. */
export async function parseApiResponse<T>(res: Response): Promise<T> {
  let body: ApiResponse<T> | null = null;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    // non-JSON body (e.g. proxy error page)
  }

  if (body?.success) return body.data;

  throw new ApiClientError(
    res.status,
    body?.message ?? (res.statusText || "Request failed"),
    body?.errors ?? [],
  );
}
