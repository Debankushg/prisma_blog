import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { ApiClientError } from "@/lib/api/errors";
import { serverGet } from "@/lib/api/server";
import type { User } from "@/types";

/** Current user, or null when logged out. Memoized per request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    return await serverGet<User>("/auth/me");
  } catch (err) {
    // 404 = valid token for a deleted account; treat as logged out too.
    if (err instanceof ApiClientError && (err.status === 401 || err.status === 404)) return null;
    throw err;
  }
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
