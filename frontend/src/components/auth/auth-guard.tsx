import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/user";

/** Keeps signed-in users off the login/register pages (validated against the API, not just the cookie). */
export async function AuthGuard({ children }: { children: React.ReactNode }) {
  if (await getCurrentUser()) redirect("/blogs");
  return <>{children}</>;
}
