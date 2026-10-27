"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/lib/api/auth.api";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    try {
      await authApi.logout();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <Button variant="secondary" loading={loading} onClick={onLogout} data-tour="logout" className="whitespace-nowrap px-3 sm:px-4">
      Log out
    </Button>
  );
}
