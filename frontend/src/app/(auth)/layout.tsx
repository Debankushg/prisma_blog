import { Suspense } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Brand } from "@/components/layout/brand";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-4 py-10">
        <Brand className="self-center" />
        <Card className="fade-up p-7">
          <Suspense fallback={<div className="skeleton h-72" />}>
            <AuthGuard>{children}</AuthGuard>
          </Suspense>
        </Card>
      </main>
    </>
  );
}
