import { ApiClientError } from "./errors";
import { parseApiResponse } from "./parse";

// Browser-side HTTP client. Calls go to this Next.js origin and are proxied to the API.
const BASE = "/api/v1";

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiClientError(0, "Cannot reach the server. Check your connection and try again.");
  }
  return parseApiResponse<T>(res);
}

export const http = {
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
