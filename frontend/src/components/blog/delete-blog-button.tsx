"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { blogsApi } from "@/lib/api/blogs.api";
import { ApiClientError } from "@/lib/api/errors";

export function DeleteBlogButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (!window.confirm("Delete this blog? This cannot be undone.")) return;
    setLoading(true);
    setError(null);
    try {
      await blogsApi.remove(id);
      router.push("/blogs");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) return router.replace("/login");
      setError(err instanceof ApiClientError ? err.message : "Could not delete the blog.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button variant="danger" loading={loading} onClick={onDelete} data-tour="delete-blog">
        Delete
      </Button>
      {error && <Alert>{error}</Alert>}
    </div>
  );
}
