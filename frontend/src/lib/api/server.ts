import "server-only";
import { cookies } from "next/headers";
import { BACKEND_URL } from "@/config/env";
import { parseApiResponse } from "./parse";

/** Server-side GET that forwards the visitor's session cookie to the API. */
export async function serverGet<T>(path: string): Promise<T> {
  const cookieHeader = (await cookies()).toString();
  const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  return parseApiResponse<T>(res);
}

/** Server-side GET for open endpoints: sends no cookies, so it is safe for anonymous pages. */
export async function publicGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}/api/v1${path}`, { cache: "no-store" });
  return parseApiResponse<T>(res);
}
